/**
 * Create Admin from Existing User Script
 *
 * This script promotes an existing authenticated user to admin status.
 * Use this when you have a user who has already signed up through the application.
 *
 * Usage:
 * npm run db:create-admin <user-id>
 *
 * Examples:
 * npm run db:create-admin 12345678-1234-1234-1234-123456789012
 *
 * Steps:
 * 1. Have the user sign up through the application first
 * 2. Get their user ID from the database or auth system
 * 3. Run this script to promote them to admin
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration is required')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdmin() {
  try {
    console.log('👑 Promoting User to Admin')
    console.log('==========================\n')

    // Get user ID from command line arguments
    const userId = process.argv[2]

    if (!userId) {
      console.error('❌ Please provide a user ID')
      console.log('')
      console.log('Usage:')
      console.log('  npm run db:create-admin <user-id>')
      console.log('')
      console.log('How to find user ID:')
      console.log('  1. Check the auth.users table in Supabase')
      console.log('  2. Look at user_profiles table')
      console.log('  3. Or use the custom admin script instead')
      console.log('')
      console.log('Examples:')
      console.log('  npm run db:create-admin 12345678-1234-1234-1234-123456789012')
      console.log('  npm run db:create-custom-admin admin@company.com password123')
      process.exit(1)
    }

    console.log(`🔍 Looking up user: ${userId}`)

    // Check if user exists in auth.users table
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)

    if (authError || !authUser) {
      console.log('❌ User not found in auth system')
      console.log('Please make sure the user ID is correct and the user exists in auth.users table')
      process.exit(1)
    }

    console.log(`📧 Found user: ${authUser.user.email}`)

    // Check if user profile exists
    const { data: existingUser, error: selectError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingUser) {
      console.log('👤 User profile exists, updating to admin...')

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          role: 'admin',
          status: 'approved',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        throw updateError
      }

      console.log('✅ User profile updated to admin successfully!')
    } else {
      console.log('👤 Creating new admin profile...')

      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          role: 'admin',
          status: 'approved',
          approved_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        throw insertError
      }

      console.log('✅ Admin profile created successfully!')
    }

    console.log('')
    console.log('🎉 Admin Promotion Complete!')
    console.log('==========================')
    console.log(`📧 Email: ${authUser.user.email}`)
    console.log(`🆔 User ID: ${userId}`)
    console.log(`👑 Role: Admin`)
    console.log(`✅ Status: Approved`)
    console.log('')
    console.log('🔗 Access URLs:')
    console.log(`📱 Sign In: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-in`)
    console.log(`⚙️  Admin Panel: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`)
    console.log('')

  } catch (error) {
    console.error('❌ Admin creation failed:', error)
    process.exit(1)
  }
}

createAdmin()