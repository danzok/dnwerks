/**
 * Create database tables for the private authentication system
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gjaekyfjwhtxicppbnsf.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqYWVreWZqd2h0eGljcHBibnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQzNTMyNSwiZXhwIjoyMDc4MDExMzI1fQ.O6Fis3Z1hZA1tHnHyeOlFywmZLyJhpNadwAJPaJUu0w'

async function createTables() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    console.log('Creating user_profiles table...')

    // Create user_profiles table
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_profiles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT UNIQUE NOT NULL,
          role TEXT DEFAULT 'user' NOT NULL,
          status TEXT DEFAULT 'pending' NOT NULL,
          invited_by TEXT,
          invite_code TEXT UNIQUE,
          invited_at TIMESTAMP WITH TIME ZONE,
          approved_at TIMESTAMP WITH TIME ZONE,
          last_login_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);
        CREATE INDEX IF NOT EXISTS idx_user_profiles_invite_code ON public.user_profiles(invite_code);
      `
    })

    if (profilesError) {
      console.error('Error creating user_profiles table:', profilesError)
    } else {
      console.log('✅ user_profiles table created successfully')
    }

    console.log('Creating invite_codes table...')

    // Create invite_codes table
    const { error: invitesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.invite_codes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          created_by TEXT NOT NULL,
          used_by TEXT UNIQUE,
          used_at TIMESTAMP WITH TIME ZONE,
          expires_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
        CREATE INDEX IF NOT EXISTS idx_invite_codes_used_by ON public.invite_codes(used_by);
      `
    })

    if (invitesError) {
      console.error('Error creating invite_codes table:', invitesError)
    } else {
      console.log('✅ invite_codes table created successfully')
    }

    console.log('Enabling RLS...')

    // Enable Row Level Security
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.invite_codes ENABLE ROW LEVEL SECURITY;
      `
    })

    if (rlsError) {
      console.error('Error enabling RLS:', rlsError)
    } else {
      console.log('✅ RLS enabled successfully')
    }

    console.log('Creating RLS policies...')

    // Create RLS policies
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Users can view their own profile
        CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.user_profiles
          FOR SELECT USING (auth.uid()::text = user_id);

        -- Users can update their own profile
        CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.user_profiles
          FOR UPDATE USING (auth.uid()::text = user_id);

        -- Admins can view all profiles
        CREATE POLICY IF NOT EXISTS "Admins can view all profiles" ON public.user_profiles
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles
              WHERE user_id = auth.uid()::text
              AND role = 'admin'
              AND status = 'approved'
            )
          );

        -- Admins can update all profiles
        CREATE POLICY IF NOT EXISTS "Admins can update all profiles" ON public.user_profiles
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles
              WHERE user_id = auth.uid()::text
              AND role = 'admin'
              AND status = 'approved'
            )
          );

        -- Admins can insert profiles
        CREATE POLICY IF NOT EXISTS "Admins can insert profiles" ON public.user_profiles
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.user_profiles
              WHERE user_id = auth.uid()::text
              AND role = 'admin'
              AND status = 'approved'
            )
          );

        -- Admins can view all invite codes
        CREATE POLICY IF NOT EXISTS "Admins can view all invites" ON public.invite_codes
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles
              WHERE user_id = auth.uid()::text
              AND role = 'admin'
              AND status = 'approved'
            )
          );

        -- Admins can insert invite codes
        CREATE POLICY IF NOT EXISTS "Admins can insert invites" ON public.invite_codes
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.user_profiles
              WHERE user_id = auth.uid()::text
              AND role = 'admin'
              AND status = 'approved'
            )
          );

        -- Users can use invite codes during registration
        CREATE POLICY IF NOT EXISTS "Users can use invite codes" ON public.invite_codes
          FOR UPDATE USING (used_by IS NULL);
      `
    })

    if (policiesError) {
      console.error('Error creating RLS policies:', policiesError)
    } else {
      console.log('✅ RLS policies created successfully')
    }

    console.log('\n🎉 Database setup complete!')

  } catch (error) {
    console.error('Setup error:', error)
  }
}

createTables()