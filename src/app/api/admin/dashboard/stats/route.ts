import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
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

    // Get campaign statistics
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('status, created_at')

    const totalCampaigns = campaigns?.length || 0
    const activeCampaigns = campaigns?.filter((c: any) => c.status === 'active').length || 0
    const completedCampaigns = campaigns?.filter((c: any) => c.status === 'completed').length || 0

    // Get message statistics
    const { data: messages } = await supabase
      .from('campaign_messages')
      .select('sent_at')

    const totalMessages = messages?.length || 0
    const today = new Date().toISOString().split('T')[0]
    const messagesToday = messages?.filter((m: any) =>
      m.sent_at && m.sent_at.startsWith(today)
    ).length || 0

    const campaignStats = {
      total: totalCampaigns,
      active: activeCampaigns,
      completed: completedCampaigns,
      total_messages: totalMessages,
      messages_today: messagesToday,
    }

    // Get recent activity from user_profiles and invite_codes
    const { data: recentUsers } = await supabase
      .from('user_profiles')
      .select('created_at, email')
      .order('created_at', { ascending: false })
      .limit(3)

    const { data: recentInvites } = await supabase
      .from('invite_codes')
      .select('created_at, code, email')
      .order('created_at', { ascending: false })
      .limit(2)

    const recentActivity = [
      // Recent user registrations
      ...(recentUsers?.map((user: any, index: number) => ({
        id: `user_${index}`,
        type: 'user_registered',
        message: `New user registered: ${user.email || 'Unknown'}`,
        timestamp: user.created_at,
      })) || []),
      // Recent invite creations
      ...(recentInvites?.map((invite: any, index: number) => ({
        id: `invite_${index}`,
        type: 'invite_created',
        message: `New invite created: ${invite.code}`,
        timestamp: invite.created_at,
      })) || []),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 5) // Keep only the 5 most recent activities

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