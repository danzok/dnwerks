import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server-admin'
import { auth } from '@/lib/auth-server'

export async function GET() {
  try {
    console.log('🔍 [DEBUG] Debug endpoint called')
    
    // Environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    }
    
    // Test Supabase connection
    const supabase = createSupabaseAdminClient()
    let connectionTest = 'failed'
    let customerCount = 0
    
    try {
      const { count, error } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
      
      if (!error) {
        connectionTest = 'success'
        customerCount = count || 0
      } else {
        connectionTest = `error: ${error.message}`
      }
    } catch (error) {
      connectionTest = `exception: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
    
    // Test authentication
    let authTest = 'failed'
    let userId = null
    let userEmail = null
    
    try {
      const authResult = await auth()
      if (authResult.userId) {
        authTest = 'success'
        userId = authResult.userId
        userEmail = authResult.user?.email
      } else {
        authTest = `no user: ${authResult.error || 'unknown'}`
      }
    } catch (error) {
      authTest = `exception: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
    
    // Get sample customers if authenticated
    let sampleCustomers = []
    if (authTest === 'success') {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', userId)
          .limit(3)
        
        if (!error && data) {
          sampleCustomers = data
        }
      } catch (error) {
        console.error('Error fetching sample customers:', error)
      }
    }
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: envInfo,
      database: {
        connection: connectionTest,
        totalCustomers: customerCount,
        sampleCustomers: sampleCustomers
      },
      authentication: {
        status: authTest,
        userId,
        userEmail
      }
    }
    
    return NextResponse.json(debugInfo)
    
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { error: 'Debug endpoint failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}