import { createClient } from '@/lib/supabase/server'
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

    // Get all user profiles with their auth user info
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        auth_user:auth.users(
          email,
          created_at,
          last_sign_in_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
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
    const { userId, action, role } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Don't allow admin to modify themselves
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 400 })
    }

    const updateData: any = { updated_at: new Date().toISOString() }

    if (action === 'approve') {
      updateData.status = 'approved'
      updateData.approved_at = new Date().toISOString()
    } else if (action === 'reject') {
      updateData.status = 'rejected'
    } else if (action === 'update_role' && role) {
      if (!['admin', 'user'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
      updateData.role = role
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data: updatedUser, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'updated'} successfully`
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}