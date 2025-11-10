#!/usr/bin/env tsx

/**
 * Custom Admin Creation Script
 *
 * Usage:
 * npm run db:create-custom-admin <email> <password>
 *
 * Examples:
 * npm run db:create-custom-admin admin@yourcompany.com YourSecurePassword123
 *
 * Features:
 * - Creates Supabase auth user
 * - Sets up admin profile with approved status
 * - Generates unique invite code
 * - Works for both development and production
 */

import { createClient } from '@supabase/supabase-js'
import { generateInviteCode } from '../src/lib/auth-utils.js'

// Get command line arguments
const args = process.argv.slice(2)

if (args.length < 2) {
  console.log('❌ Error: Missing required arguments')
  console.log('')
  console.log('Usage:')
  console.log('  npm run db:create-custom-admin <email> <password>')
  console.log('')
  console.log('Examples:')
  console.log('  npm run db:create-custom-admin admin@yourcompany.com SecurePassword123')
  console.log('  npm run db:create-custom-admin your.name@domain.com MyP@ssw0rd!')
  console.log('')
  console.log('Optional environment variables:')
  console.log('  ADMIN_NAME - Full name of the admin (default: "Admin User")')
  process.exit(1)
}

const adminEmail = args[0]
const adminPassword = args[1]
const adminName = process.env.ADMIN_NAME || 'Admin User'

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(adminEmail)) {
  console.log('❌ Error: Invalid email format')
  process.exit(1)
}

// Validate password strength
if (adminPassword.length < 8) {
  console.log('❌ Error: Password must be at least 8 characters long')
  process.exit(1)
}

// Get Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Error: Missing Supabase configuration')
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment')
  process.exit(1)
}

console.log('🚀 Creating Custom Admin User')
console.log('================================')
console.log(`📧 Email: ${adminEmail}`)
console.log(`👤 Name: ${adminName}`)
console.log(`🔑 Password: ${adminPassword}`)
console.log(`🌐 Supabase URL: ${supabaseUrl}`)
console.log('')

async function createCustomAdmin() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    console.log('🔍 Checking if user already exists...')

    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.log('❌ Error checking existing users:', listError.message)
      process.exit(1)
    }

    const existingUser = existingUsers.users.find(u => u.email === adminEmail)

    if (existingUser) {
      console.log('⚠️  User with this email already exists')

      // Update existing user to admin
      console.log('🔄 Updating existing user to admin role...')

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: existingUser.id,
          role: 'admin',
          status: 'approved',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (profileError) {
        console.log('❌ Error updating admin profile:', profileError.message)
        process.exit(1)
      }

      console.log('✅ Existing user updated to admin successfully!')
      console.log(`📱 Login URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-in`)
      console.log('')
      return
    }

    console.log('👤 Creating new auth user...')

    // Create new auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminName,
        role: 'admin',
        is_custom_admin: true
      }
    })

    if (authError) {
      console.log('❌ Error creating auth user:', authError.message)
      process.exit(1)
    }

    if (!authData.user) {
      console.log('❌ Error: No user data returned')
      process.exit(1)
    }

    console.log('✅ Auth user created successfully!')
    console.log(`🆔 User ID: ${authData.user.id}`)

    console.log('📋 Creating admin profile...')

    // Create admin profile
    const inviteCode = generateInviteCode(8)

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        role: 'admin',
        status: 'approved',
        invite_code: inviteCode,
        approved_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.log('❌ Error creating admin profile:', profileError.message)
      process.exit(1)
    }

    console.log('✅ Admin profile created successfully!')
    console.log(`🎫 Invite Code: ${inviteCode}`)

    // Create some initial invite codes for the new admin
    console.log('🎫 Creating additional invite codes...')

    for (let i = 0; i < 5; i++) {
      const newInviteCode = generateInviteCode(8)
      const { error: inviteError } = await supabase
        .from('invite_codes')
        .insert({
          code: newInviteCode,
          created_by: authData.user.id,
          notes: `Generated by custom admin creation script - ${new Date().toISOString()}`,
          created_at: new Date().toISOString()
        })

      if (inviteError) {
        console.log(`⚠️  Error creating invite code ${newInviteCode}:`, inviteError.message)
      } else {
        console.log(`✅ Invite code created: ${newInviteCode}`)
      }
    }

    console.log('')
    console.log('🎉 Custom Admin Creation Complete!')
    console.log('=====================================')
    console.log(`📧 Admin Email: ${adminEmail}`)
    console.log(`👤 Admin Name: ${adminName}`)
    console.log(`🔑 Admin Password: ${adminPassword}`)
    console.log(`🎫 Admin Invite Code: ${inviteCode}`)
    console.log('')
    console.log('🔗 Login URLs:')
    console.log(`📱 Sign In: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-in`)
    console.log(`⚙️  Admin Panel: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`)
    console.log('')
    console.log('📋 Next Steps:')
    console.log('1. Test login with the provided credentials')
    console.log('2. Access the admin panel to manage users')
    console.log('3. Use the additional invite codes to onboard team members')
    console.log('4. Change the password after first login for security')
    console.log('')

  } catch (error) {
    console.log('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run the admin creation
createCustomAdmin()