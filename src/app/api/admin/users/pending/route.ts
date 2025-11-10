import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  try {
    // For development, return mock pending users data
    return NextResponse.json({
      pending_users: [
        {
          id: '3',
          email: 'user2@example.com',
          role: 'user',
          status: 'pending',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          auth_user: {
            email: 'user2@example.com',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            last_sign_in_at: null
          }
        },
        {
          id: '4',
          email: 'newuser@example.com',
          role: 'user',
          status: 'pending',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          auth_user: {
            email: 'newuser@example.com',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            last_sign_in_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
          }
        }
      ]
    })

    // Get all pending users with their auth user info
    const { data: pendingUsers, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        auth_user:auth.users(
          email,
          created_at,
          last_sign_in_at
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      pending_users: pendingUsers || [],
      count: pendingUsers?.length || 0
    })
  } catch (error) {
    console.error('Error fetching pending users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}