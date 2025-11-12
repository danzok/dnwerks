import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Test database connection
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .single();
    
    const dbResponseTime = Date.now() - startTime;
    
    if (error) {
      return Response.json({
        status: 'unhealthy',
        error: 'Database connection failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // Check environment variables
    const envVars = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      appUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      twilioConfig: !!(
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER
      )
    };
    
    const allEnvVarsPresent = Object.values(envVars).every(Boolean);
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'connected',
          responseTime: `${dbResponseTime}ms`,
          userProfilesCount: data?.count || 0
        },
        environment: {
          allVariablesPresent: allEnvVarsPresent,
          variables: envVars
        },
        api: {
          status: 'operational',
          version: '1.0.0'
        }
      }
    });
    
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}