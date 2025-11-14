import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { createSupabaseAdminClient } from '@/lib/supabase/server-admin'
import { processPhoneNumber } from '@/lib/utils/phone'

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Create Supabase client
const supabase = createSupabaseAdminClient()

// GET /api/customers - List all customers for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth(request)

    if (!userId) {
      console.error('🔍 [API] No userId from auth')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 [API] Fetching customers for userId:', userId)

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const state = searchParams.get('state') || 'all'
    const tagsParam = searchParams.get('tags')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Parse tags from comma-separated string
    const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : []

    // First, get the user's profile to find the profile ID
    // customers.user_id might reference user_profiles.id, not auth.uid()
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('🔍 [API] Error fetching user profile:', profileError)
      // Fallback: try direct match with auth.uid() if user_id is TEXT
      // Build query - try both user_id formats
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .or(`user_id.eq.${userId},auth_user_id.eq.${userId}`)

      // Apply search filter
      if (search) {
        const searchConditions = [
          `first_name.ilike.%${search}%`,
          `last_name.ilike.%${search}%`,
          `email.ilike.%${search}%`,
          `phone.ilike.%${search}%`
        ].join(',')
        query = query.or(searchConditions)
      }

      // Apply state filter
      if (state !== 'all') {
        query = query.eq('state', state)
      }

      // Apply tags filter
      if (tags.length > 0) {
        query = query.overlaps('tags', tags)
      }

      const { data: customers, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('🔍 [API] Database query error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch customers', details: error.message },
          { status: 500 }
        )
      }

      // Get all available tags
      const { data: allCustomerTags } = await supabase
        .from('customers')
        .select('tags')
        .or(`user_id.eq.${userId},auth_user_id.eq.${userId}`)
        .not('tags', 'is', null)

      const allTags = [...new Set(
        allCustomerTags?.flatMap(customer => customer.tags || []) || []
      )].sort()

      const totalPages = Math.ceil((count || 0) / limit)

      console.log('🔍 [API] Found customers:', customers?.length || 0, 'total:', count)

      return NextResponse.json({
        data: customers || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        tags: allTags,
        stats: {
          totalCustomers: count || 0,
          totalTags: allTags.length,
          currentPageResults: customers?.length || 0
        }
      })
    }

    // If we have a profile, use profile.id to match customers.user_id
    const profileId = userProfile.id

    // Build query - try matching against profile.id (if user_id references user_profiles.id)
    // OR match against auth.uid() directly (if user_id is TEXT matching auth.uid())
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .or(`user_id.eq.${profileId},user_id.eq.${userId},auth_user_id.eq.${userId}`)

    // Apply search filter
    if (search) {
      const searchConditions = [
        `first_name.ilike.%${search}%`,
        `last_name.ilike.%${search}%`,
        `email.ilike.%${search}%`,
        `phone.ilike.%${search}%`
      ].join(',')
      query = query.or(searchConditions)
    }

    // Apply state filter
    if (state !== 'all') {
      query = query.eq('state', state)
    }

    // Apply tags filter
    if (tags.length > 0) {
      query = query.overlaps('tags', tags)
    }

    // Apply ordering and pagination
    const { data: customers, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('🔍 [API] Database query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch customers', details: error.message },
        { status: 500 }
      )
    }

    // Get all available tags
    const { data: allCustomerTags } = await supabase
      .from('customers')
      .select('tags')
      .or(`user_id.eq.${profileId},user_id.eq.${userId},auth_user_id.eq.${userId}`)
      .not('tags', 'is', null)

    const allTags = [...new Set(
      allCustomerTags?.flatMap(customer => customer.tags || []) || []
    )].sort()

    const totalPages = Math.ceil((count || 0) / limit)

    console.log('🔍 [API] Found customers:', customers?.length || 0, 'total:', count, 'profileId:', profileId)

    return NextResponse.json({
      data: customers || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      tags: allTags,
      stats: {
        totalCustomers: count || 0,
        totalTags: allTags.length,
        currentPageResults: customers?.length || 0
      }
    })

  } catch (error) {
    console.error('🔍 [API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

