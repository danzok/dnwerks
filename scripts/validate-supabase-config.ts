/**
 * Validate Supabase configuration and help diagnose API key issues
 * Run with: npx tsx scripts/validate-supabase-config.ts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Validating Supabase Configuration...\n')

// Check environment variables
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  if (!supabaseUrl) console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!supabaseServiceKey) console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('✅ Environment variables found:')
console.log(`   URL: ${supabaseUrl}`)
console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...`)
console.log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...`)

// Test anon key
async function testAnonKey() {
  console.log('\n🔑 Testing Anonymous Key...')
  
  try {
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!)
    
    // Simple test - try to access a public table
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      if (error.message.includes('Invalid API key')) {
        console.error('❌ Anonymous key is invalid or expired')
        console.log('\n🔧 To fix this:')
        console.log('1. Go to your Supabase project dashboard')
        console.log('2. Navigate to Project Settings → API')
        console.log('3. Copy the "anon public" key')
        console.log('4. Update NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
        return false
      } else if (error.message.includes('relation "user_profiles" does not exist')) {
        console.log('✅ Anonymous key is valid (but table doesn\'t exist yet)')
        return true
      } else {
        console.error(`❌ Unexpected error: ${error.message}`)
        return false
      }
    }
    
    console.log('✅ Anonymous key is valid')
    return true
  } catch (error) {
    console.error('❌ Failed to test anonymous key:', error)
    return false
  }
}

// Test service key
async function testServiceKey() {
  console.log('\n🔧 Testing Service Role Key...')
  
  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Test with admin operation
    const { data, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      if (error.message.includes('Invalid API key')) {
        console.error('❌ Service role key is invalid or expired')
        console.log('\n🔧 To fix this:')
        console.log('1. Go to your Supabase project dashboard')
        console.log('2. Navigate to Project Settings → API')
        console.log('3. Copy the "service_role" key (secret)')
        console.log('4. Update SUPABASE_SERVICE_ROLE_KEY in .env.local')
        return false
      } else {
        console.error(`❌ Unexpected error: ${error.message}`)
        return false
      }
    }
    
    console.log(`✅ Service role key is valid (found ${data.users.length} users)`)
    return true
  } catch (error) {
    console.error('❌ Failed to test service role key:', error)
    return false
  }
}

// Check if URL format is correct
function validateUrl() {
  console.log('\n🌐 Validating URL format...')
  
  const urlPattern = /^https:\/\/[a-z0-9-]+\.supabase\.co$/
  if (!urlPattern.test(supabaseUrl!)) {
    console.error('❌ URL format appears incorrect')
    console.log('Expected format: https://your-project-id.supabase.co')
    console.log(`Found: ${supabaseUrl}`)
    return false
  }
  
  console.log('✅ URL format is correct')
  return true
}

// Main validation
async function main() {
  const urlValid = validateUrl()
  const anonValid = await testAnonKey()
  const serviceValid = await testServiceKey()
  
  console.log('\n📊 Summary:')
  console.log(`   URL: ${urlValid ? '✅' : '❌'}`)
  console.log(`   Anon Key: ${anonValid ? '✅' : '❌'}`)
  console.log(`   Service Key: ${serviceValid ? '✅' : '❌'}`)
  
  if (!urlValid || !anonValid || !serviceValid) {
    console.log('\n🚨 Configuration issues found. Please fix the above errors.')
    process.exit(1)
  }
  
  console.log('\n🎉 All Supabase configuration is valid!')
  console.log('\n📋 Next steps:')
  console.log('1. Run: npx tsx scripts/create-test-users.ts')
  console.log('2. Visit: http://localhost:3000/debug-auth')
  console.log('3. Test login with the created users')
}

main().catch(console.error)