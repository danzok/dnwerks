import { createClient } from '@/lib/supabase/server'
import { createInviteCode, generateInviteCode } from '@/lib/auth-utils'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  try {
    // Check if this is the mock client
    if (!supabase.auth || typeof supabase.auth.getUser !== 'function') {
      // Return mock data for development
      return NextResponse.json({
        invites: [
          {
            id: '1',
            code: 'ADMIN2024',
            email: null,
            created_by: 'dev-admin',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            max_uses: 1,
            notes: 'Initial admin access code'
          },
          {
            id: '2',
            code: 'INVITE123',
            email: 'newuser@example.com',
            created_by: 'dev-admin',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            max_uses: 1,
            notes: 'Test invitation'
          }
        ]
      })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin and approved
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, status')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin' || profile.status !== 'approved') {
      console.error('Access denied for user:', user.id, 'Profile:', profile)
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all invite codes created by this admin
    const { data: invites, error } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invites:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ invites })
  } catch (error) {
    console.error('Error fetching invites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { email, role, maxUses, expiresDays, notes } = body

    console.log('Received invite request:', { email, role, maxUses, expiresDays, notes })

    // Check if this is the mock client
    if (!supabase.auth || typeof supabase.auth.getUser !== 'function') {
      console.log('Using mock client for invite creation')

      const newCode = generateInviteCode()
      const newInvite = {
        id: String(Date.now()),
        code: newCode,
        email: email || null,
        created_by: 'dev-admin',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + (expiresDays || 7) * 24 * 60 * 60 * 1000).toISOString(),
        max_uses: maxUses || 1,
        notes: notes || null
      }

      return NextResponse.json({
        success: true,
        invite: newInvite,
        message: 'Invite code created successfully (mock mode)'
      })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin and approved
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, status')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin' || profile.status !== 'approved') {
      console.error('Access denied for user:', user.id, 'Profile:', profile)
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Validate input
    if (email && typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    if (maxUses && (typeof maxUses !== 'number' || maxUses < 1 || maxUses > 100)) {
      return NextResponse.json({ error: 'Max uses must be between 1 and 100' }, { status: 400 })
    }

    if (expiresDays && (typeof expiresDays !== 'number' || expiresDays < 1 || expiresDays > 365)) {
      return NextResponse.json({ error: 'Expires days must be between 1 and 365' }, { status: 400 })
    }

    // Create invite code using the auth-utils function
    const { code, error } = await createInviteCode(user.id, {
      email: email || undefined,
      maxUses: maxUses || 1,
      expiresDays: expiresDays || 7,
      notes: notes || undefined,
    })

    if (error) {
      console.error('Error creating invite code:', error)
      return NextResponse.json({ error: error }, { status: 500 })
    }

    console.log('Invite code created successfully:', code)

    // Get the created invite with full details
    const { data: newInvite } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', code)
      .single()

    return NextResponse.json({
      success: true,
      invite: newInvite,
      message: 'Invite code created successfully'
    })
  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}