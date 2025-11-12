/**
 * Create test users using Supabase Admin API
 * Run this script with: npx tsx scripts/create-test-users.ts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testUsers = [
  {
    email: 'admin@dnwerks.com',
    password: 'AdminPassword123!',
    fullName: 'Admin User',
    role: 'admin'
  },
  {
    email: 'user1@dnwerks.com',
    password: 'UserPassword123!',
    fullName: 'Test User One',
    role: 'user'
  },
  {
    email: 'user2@dnwerks.com',
    password: 'UserPassword123!',
    fullName: 'Test User Two',
    role: 'user'
  }
]

async function createTestUsers() {
  console.log('🚀 Creating test users...')
  
  for (const user of testUsers) {
    try {
      console.log(`\n📧 Creating user: ${user.email}`)
      
      // 1. Create user in auth.users
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName
        }
      })
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  User ${user.email} already exists, skipping creation`)
        } else {
          console.error(`❌ Failed to create user ${user.email}:`, authError.message)
          continue
        }
      } else {
        console.log(`✅ Auth user created: ${authData.user?.id}`)
      }
      
      // 2. Get user ID (either from creation or existing user)
      let userId = authData.user?.id
      
      if (!userId) {
        // User might already exist, try to get them
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers.users.find(u => u.email === user.email)
        userId = existingUser?.id
      }
      
      if (!userId) {
        console.error(`❌ Could not find user ID for ${user.email}`)
        continue
      }
      
      // 3. Create or update user profile
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .upsert({
          user_id: userId,
          email: user.email,
          full_name: user.fullName,
          role: user.role,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
      
      if (profileError) {
        console.error(`❌ Failed to create profile for ${user.email}:`, profileError.message)
      } else {
        console.log(`✅ Profile created/updated for ${user.email}`)
      }
      
    } catch (error) {
      console.error(`💥 Unexpected error for ${user.email}:`, error)
    }
  }
  
  console.log('\n🎉 Test user creation completed!')
  console.log('\n📋 Test Credentials:')
  console.log('   Admin: admin@dnwerks.com / AdminPassword123!')
  console.log('   User1: user1@dnwerks.com / UserPassword123!')
  console.log('   User2: user2@dnwerks.com / UserPassword123!')
  console.log('\n🌐 Test URLs:')
  console.log('   Login: http://localhost:3000/login')
  console.log('   Debug: http://localhost:3000/debug-auth')
}

async function verifyUsers() {
  console.log('\n🔍 Verifying created users...')
  
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('user_profiles')
      .select('email, role, full_name, user_id')
      .ilike('email', '%@dnwerks.com')
      .order('role', { ascending: false })
    
    if (error) {
      console.error('❌ Failed to fetch profiles:', error.message)
      return
    }
    
    console.log(`\n✅ Found ${profiles?.length || 0} user profiles:`)
    profiles?.forEach(profile => {
      console.log(`   👤 ${profile.email} (${profile.role}) - ${profile.full_name}`)
    })
    
    // Also check auth users
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
    const testAuthUsers = authUsers.users.filter(u => u.email?.includes('@dnwerks.com'))
    
    console.log(`\n✅ Found ${testAuthUsers.length} auth users:`)
    testAuthUsers.forEach(user => {
      console.log(`   🔐 ${user.email} - ID: ${user.id}`)
    })
    
  } catch (error) {
    console.error('💥 Verification failed:', error)
  }
}

// Main execution
async function main() {
  await createTestUsers()
  await verifyUsers()
}

main().catch(console.error)