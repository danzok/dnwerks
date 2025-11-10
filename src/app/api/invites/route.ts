import { createClient } from '@/lib/supabase/server'
import { createInviteCode } from '@/lib/auth-utils'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin and approved
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, status')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin' || profile.status !== 'approved') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all invite codes created by this admin
    const { data: invites, error } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ invites })
  } catch (error) {
    console.error('Error fetching invites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = createClient()

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin and approved
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, status')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin' || profile.status !== 'approved') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { email, maxUses, expiresDays, notes } = body

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

    // Create invite code
    const { code, error } = await createInviteCode(user.id, {
      email: email || undefined,
      maxUses: maxUses || 1,
      expiresDays: expiresDays || 7,
      notes: notes || undefined,
    })

    if (error) {
      return NextResponse.json({ error: error }, { status: 500 })
    }

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