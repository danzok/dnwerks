/**
 * Create first admin user script
 * Run this after database setup to create your first admin
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration is required')
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
    console.log('👑 Creating first admin user...\n')

    // Get user ID from command line arguments
    const userId = process.argv[2]
    
    if (!userId) {
      console.error('❌ Please provide a user ID')
      console.log('Usage: npm run create-admin <user-id>')
      console.log('Example: npm run create-admin user_2abc123def456')
      process.exit(1)
    }

    // Check if user already exists
    const { data: existingUser, error: selectError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingUser) {
      console.log('👤 User already exists, updating to admin...')
      
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

      console.log('✅ User updated to admin successfully!')
    } else {
      console.log('👤 Creating new admin user...')
      
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          role: 'admin',
          status: 'approved',
          approved_at: new Date().toISOString()
        })

      if (insertError) {
        throw insertError
      }

      console.log('✅ Admin user created successfully!')
    }

    console.log('\n🎉 Admin setup complete!')
    console.log(`👑 User ${userId} is now an admin with full access.`)

  } catch (error) {
    console.error('❌ Admin creation failed:', error)
    process.exit(1)
  }
}

createAdmin()