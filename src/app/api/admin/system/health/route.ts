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

    // Test database connectivity
    const startTime = Date.now()
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    const dbResponseTime = Date.now() - startTime

    // Get user statistics
    const { data: users } = await supabase
      .from('user_profiles')
      .select('status, role')

    const stats = {
      total_users: users?.length || 0,
      active_users: users?.filter((u: any) => u.status === 'approved').length || 0,
      pending_users: users?.filter((u: any) => u.status === 'pending').length || 0,
      admin_users: users?.filter((u: any) => u.role === 'admin').length || 0,
    }

    // Get invite statistics
    const { data: invites } = await supabase
      .from('invite_codes')
      .select('used, expires_at')

    const inviteStats = {
      total_invites: invites?.length || 0,
      active_invites: invites?.filter((i: any) => !i.used && new Date(i.expires_at) > new Date()).length || 0,
      used_invites: invites?.filter((i: any) => i.used).length || 0,
    }

    // Test Supabase services
    const health = {
      database: !testError && dbResponseTime < 1000 ? 'healthy' : 'unhealthy',
      auth: !authError ? 'healthy' : 'unhealthy',
      storage: 'healthy', // Basic assumption, could be enhanced with actual storage test
      realtime: 'healthy', // Basic assumption, could be enhanced with actual realtime test
      response_time: dbResponseTime,
    }

    // Mock additional metrics (in real implementation, these would come from monitoring services)
    const metrics = {
      uptime: '99.9%',
      avg_response_time: '142ms',
      api_calls_today: 1234,
      error_rate: '0.2%',
      active_campaigns: 12,
      total_messages: 1247,
      storage_used: '2.3 GB',
    }

    const systemHealth = {
      status: health.database === 'healthy' && health.auth === 'healthy' ? 'healthy' : 'degraded',
      services: health,
      stats,
      invite_stats: inviteStats,
      metrics,
      last_check: new Date().toISOString(),
    }

    return NextResponse.json(systemHealth)
  } catch (error) {
    console.error('Error fetching system health:', error)
    return NextResponse.json({
      error: 'Internal server error',
      status: 'unhealthy',
      last_check: new Date().toISOString(),
    }, { status: 500 })
  }
}