import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({
        error: 'User ID is required'
      }, { status: 400 })
    }

    // Get current user and verify admin status
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Check if current user is admin and approved
    const { data: adminProfile, error: adminError } = await supabase
      .from('user_profiles')
      .select('role, status')
      .eq('user_id', user.id)
      .single()

    if (adminError || adminProfile?.role !== 'admin' || adminProfile?.status !== 'approved') {
      return NextResponse.json({
        error: 'Admin access required'
      }, { status: 403 })
    }

    // Update user status to rejected
    const { data: profile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        status: 'rejected'
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({
        error: 'Failed to reject user'
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'User rejected successfully',
      profile
    })

  } catch (error) {
    console.error('Reject user error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}