import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  const supabase = await createClient()

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
    const { userIds, action, role } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'User IDs array is required' }, { status: 400 })
    }

    // Don't allow admin to include themselves in bulk operations
    if (userIds.includes(user.id)) {
      return NextResponse.json({ error: 'Cannot include your own account in bulk operations' }, { status: 400 })
    }

    const updateData: any = { updated_at: new Date().toISOString() }

    if (action === 'approve') {
      updateData.status = 'approved'
      updateData.approved_at = new Date().toISOString()
    } else if (action === 'reject') {
      updateData.status = 'rejected'
    } else if (action === 'update_role' && role) {
      if (!['admin', 'user', 'moderator'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
      updateData.role = role
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Perform bulk update
    const { data: updatedUsers, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .in('user_id', userIds)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      updated_users: updatedUsers || [],
      count: updatedUsers?.length || 0,
      message: `Successfully ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'updated'} ${updatedUsers?.length || 0} users`
    })
  } catch (error) {
    console.error('Error in bulk user operation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}