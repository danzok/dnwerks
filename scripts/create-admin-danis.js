/**
 * Create Admin User using Supabase Admin API
 * Run with: node scripts/create-admin-danis.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('🚀 Creating admin user for danisbermainaja@gmail.com...')

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    const email = 'danisbermainaja@gmail.com'
    const password = 'AdminPassword123!'
    const fullName = 'Danis Bermain'
    const role = 'admin'

    console.log(`📧 Creating user: ${email}`)

    // Create user via admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: fullName,
        role: role
      }
    })

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ User already exists, fetching existing user...')
        
        // User already exists, get their info
        const { data: users } = await supabase.auth.admin.listUsers({
          search: email
        })
        
        if (users && users.length > 0) {
          const existingUser = users[0]
          console.log(`✅ Found existing user: ${existingUser.id}`)
          
          // Create profile if needed
          await createProfile(existingUser.id, email, fullName, role)
          return existingUser
        }
      } else {
        console.error('❌ Failed to create user:', error.message)
        throw error
      }
    }

    console.log(`✅ Created user: ${data.user.id}`)
    
    // Create profile for the user
    await createProfile(data.user.id, email, fullName, role)
    
    return data.user

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    throw error
  }
}

async function createProfile(userId, email, fullName, role) {
  try {
    console.log('👤 Creating user profile...')
    
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        email,
        full_name: fullName,
        role,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('❌ Failed to create profile:', error.message)
      throw error
    }

    console.log('✅ Profile created successfully')
    
  } catch (error) {
    console.error('💥 Profile creation error:', error)
    throw error
  }
}

async function verifyUser() {
  try {
    console.log('\n🔍 Verifying user creation...')
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('email, role, full_name, created_at')
      .eq('email', 'danisbermainaja@gmail.com')
      .single()

    if (error) {
      console.error('❌ Verification failed:', error.message)
      return false
    }

    if (data) {
      console.log('✅ User profile verified:')
      console.log(`   Email: ${data.email}`)
      console.log(`   Name: ${data.full_name}`)
      console.log(`   Role: ${data.role}`)
      console.log(`   Created: ${data.created_at}`)
      return true
    }

    console.log('❌ User profile not found')
    return false
    
  } catch (error) {
    console.error('💥 Verification error:', error)
    return false
  }
}

// Main execution
async function main() {
  try {
    await createAdminUser()
    const success = await verifyUser()
    
    if (success) {
      console.log('\n🎉 Admin user creation completed successfully!')
      console.log('\n📋 Login Credentials:')
      console.log('   Email: danisbermainaja@gmail.com')
      console.log('   Password: AdminPassword123!')
      console.log('\n🌐 Test Login:')
      console.log('   Go to: http://localhost:3000/login')
      console.log('   Use the credentials above')
    } else {
      console.log('\n❌ Admin user creation failed!')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  }
}

main()