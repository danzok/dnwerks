/**
 * Setup script to create the first admin user
 * Run this script once to set up the initial admin account
 *
 * Usage:
 * npm run db:create-admin-supabase
 * OR with custom credentials:
 * ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword npm run db:create-admin-supabase
 */

import { createClient } from '@supabase/supabase-js'
import { generateInviteCode } from '../src/lib/auth-utils.js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Get admin credentials from environment variables or use defaults
const adminEmail = process.env.ADMIN_EMAIL || 'admin@dnwerks.com'
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'

console.log('🔧 Admin Setup Configuration:')
console.log(`📧 Email: ${adminEmail}`)
console.log(`🔑 Password: ${adminPassword}`)
console.log('')

async function setupAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase configuration')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    console.log('Setting up admin user...')

    // 1. Create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin User',
        role: 'admin'
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('Admin user already exists, updating profile...')

        // Try to find existing user by listing users
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

        if (!listError) {
          const existingUser = users.find(u => u.email === adminEmail)
          if (existingUser) {
            // Update user profile to admin
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
              console.error('Error updating admin profile:', profileError)
            } else {
              console.log('✅ Admin profile updated successfully')
            }
          }
        }
      } else {
        console.error('Error creating admin user:', authError)
        return
      }
    } else {
      console.log('✅ Admin auth user created:', authData.user?.id)

      // 2. Create user profile with admin role
      if (authData.user?.id) {
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
          console.error('Error creating admin profile:', profileError)
        } else {
          console.log('✅ Admin profile created successfully')
          console.log(`📧 Admin email: ${adminEmail}`)
          console.log(`🔑 Admin password: ${adminPassword}`)
          console.log(`🎫 Invite code: ${inviteCode}`)
        }
      }
    }

    // 3. Create a few initial invite codes for testing
    console.log('Creating initial invite codes...')

    for (let i = 0; i < 3; i++) {
      const inviteCode = generateInviteCode(8)
      const { error: inviteError } = await supabase
        .from('invite_codes')
        .insert({
          code: inviteCode,
          created_by: authData.user?.id || 'system',
          created_at: new Date().toISOString()
        })

      if (inviteError) {
        console.error('Error creating invite code:', inviteError)
      } else {
        console.log(`✅ Invite code created: ${inviteCode}`)
      }
    }

    console.log('\n🎉 Admin setup complete!')
    console.log(`📱 Admin login: http://localhost:3003/sign-in`)
    console.log(`📧 Email: ${adminEmail}`)
    console.log(`🔑 Password: ${adminPassword}`)
    console.log(`⚙️  Admin panel: http://localhost:3003/admin`)

  } catch (error) {
    console.error('Setup error:', error)
  }
}

setupAdmin()