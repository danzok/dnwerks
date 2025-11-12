import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server-admin'
import { auth } from '@/lib/auth-server'

// Mock user ID (development) and real user ID (production)
const MOCK_USER_ID = '7a361a20-86e3-41da-a7d1-1ba13d8b9f2c'
const REAL_USER_ID = '6a06617b-deee-4f02-a08a-bdec17e46d98'

export async function POST() {
  try {
    console.log('🔄 [MIGRATION] Starting contact migration...')
    
    // Verify admin authentication
    const authResult = await auth()
    if (!authResult.userId || authResult.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' }, 
        { status: 403 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // Step 1: Count contacts for mock user
    console.log('🔄 [MIGRATION] Counting contacts for mock user...')
    const { count: mockCount, error: countError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', MOCK_USER_ID)

    if (countError) {
      throw new Error(`Failed to count mock contacts: ${countError.message}`)
    }

    console.log(`🔄 [MIGRATION] Found ${mockCount} contacts for mock user`)

    // Step 2: Count contacts for real user
    const { count: realCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', REAL_USER_ID)

    console.log(`🔄 [MIGRATION] Found ${realCount} contacts for real user`)

    if (mockCount === 0) {
      return NextResponse.json({
        message: 'No contacts to migrate',
        mockCount,
        realCount,
        migrated: 0
      })
    }

    // Step 3: Migrate contacts
    console.log('🔄 [MIGRATION] Starting migration...')
    const { data: migratedContacts, error: migrationError } = await supabase
      .from('customers')
      .update({ user_id: REAL_USER_ID })
      .eq('user_id', MOCK_USER_ID)
      .select()

    if (migrationError) {
      throw new Error(`Migration failed: ${migrationError.message}`)
    }

    console.log(`🔄 [MIGRATION] Successfully migrated ${migratedContacts?.length || 0} contacts`)

    // Step 4: Verify migration
    const { count: newRealCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', REAL_USER_ID)

    const { count: newMockCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', MOCK_USER_ID)

    const migrationResult = {
      success: true,
      message: 'Contact migration completed successfully',
      before: {
        mockUserContacts: mockCount,
        realUserContacts: realCount
      },
      after: {
        mockUserContacts: newMockCount,
        realUserContacts: newRealCount
      },
      migrated: migratedContacts?.length || 0,
      timestamp: new Date().toISOString()
    }

    console.log('🔄 [MIGRATION] Migration result:', migrationResult)

    return NextResponse.json(migrationResult)

  } catch (error) {
    console.error('🔄 [MIGRATION] Migration error:', error)
    return NextResponse.json(
      { 
        error: 'Migration failed', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('🔍 [MIGRATION] Checking migration status...')
    
    const supabase = createSupabaseAdminClient()

    // Count contacts for both users
    const { count: mockCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', MOCK_USER_ID)

    const { count: realCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', REAL_USER_ID)

    const status = {
      mockUserId: MOCK_USER_ID,
      realUserId: REAL_USER_ID,
      mockUserContacts: mockCount,
      realUserContacts: realCount,
      needsMigration: (mockCount || 0) > 0,
      timestamp: new Date().toISOString()
    }

    console.log('🔍 [MIGRATION] Migration status:', status)

    return NextResponse.json(status)

  } catch (error) {
    console.error('🔍 [MIGRATION] Status check error:', error)
    return NextResponse.json(
      { 
        error: 'Status check failed', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}