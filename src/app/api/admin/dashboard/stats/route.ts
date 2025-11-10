import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  try {
    // For development, always return mock dashboard stats
    return NextResponse.json({
      users: {
        total: 5,
        active: 3,
        pending: 2,
        admins: 1,
        new_this_month: 2,
      },
      invites: {
        total: 8,
        active: 3,
        used: 5,
      },
      campaigns: {
        total: 12,
        active: 8,
        completed: 4,
        total_messages: 1247,
        messages_today: 89,
      },
      system_health: {
        database: 'healthy',
        auth: 'active',
        storage: 'available',
        realtime: 'connected',
      },
      recent_activity: [
        {
          id: 1,
          type: 'user_registered',
          message: 'New user registered: John Doe',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          type: 'campaign_completed',
          message: 'Campaign completed: Spring Sale',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          type: 'invite_created',
          message: 'New invite created: I1M2I5NM',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
      ],
      last_updated: new Date().toISOString(),
    })

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

    // Get user statistics
    const { data: users } = await supabase
      .from('user_profiles')
      .select('status, role, created_at')

    const totalUsers = users?.length || 0
    const activeUsers = users?.filter((u: any) => u.status === 'approved').length || 0
    const pendingUsers = users?.filter((u: any) => u.status === 'pending').length || 0
    const adminUsers = users?.filter((u: any) => u.role === 'admin').length || 0

    // Get invite statistics
    const { data: invites } = await supabase
      .from('invite_codes')
      .select('used, expires_at, created_at')

    const totalInvites = invites?.length || 0
    const activeInvites = invites?.filter((i: any) => !i.used && new Date(i.expires_at) > new Date()).length || 0
    const usedInvites = invites?.filter((i: any) => i.used).length || 0

    // Get campaign statistics (mock data for now - would come from campaigns table)
    const campaignStats = {
      total: 12,
      active: 8,
      completed: 4,
      total_messages: 1247,
      messages_today: 89,
    }

    // Get recent activity (mock data for now)
    const recentActivity = [
      {
        id: 1,
        type: 'user_registered',
        message: 'New user registered: John Doe',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        id: 2,
        type: 'campaign_completed',
        message: 'Campaign completed: Spring Sale',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      },
      {
        id: 3,
        type: 'system_backup',
        message: 'System backup completed',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
      {
        id: 4,
        type: 'user_approved',
        message: 'User approved: Jane Smith',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      },
    ]

    // Calculate growth metrics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const newUsersThisMonth = users?.filter((u: any) => new Date(u.created_at) > thirtyDaysAgo).length || 0

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        pending: pendingUsers,
        admins: adminUsers,
        new_this_month: newUsersThisMonth,
      },
      invites: {
        total: totalInvites,
        active: activeInvites,
        used: usedInvites,
      },
      campaigns: campaignStats,
      system_health: {
        database: 'healthy',
        auth: 'active',
        storage: 'available',
        realtime: 'connected',
      },
      recent_activity: recentActivity,
      last_updated: new Date().toISOString(),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}