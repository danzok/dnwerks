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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const state = searchParams.get('state') || 'all'
    const tagsParam = searchParams.get('tags')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Parse tags from comma-separated string
    const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : []

    // Build query
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // Apply filters
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    if (state !== 'all') {
      query = query.eq('state', state)
    }

    if (tags.length > 0) {
      query = query.contains('tags', tags)
    }

    // Apply pagination
    const { data: customers, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Get all unique tags for filtering options
    const { data: tagsData } = await supabase
      .from('customers')
      .select('tags')
      .eq('user_id', userId)
      .not('tags', 'eq', '{}')

    const allTags = [...new Set(
      tagsData?.flatMap(customer => customer.tags || []) || []
    )].sort()

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      data: customers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      tags: allTags,
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phone, firstName, lastName, email, state, tags } = body

    // Validate required fields
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' }, 
        { status: 400 }
      )
    }

    // Process and validate phone number
    const phoneResult = processPhoneNumber(phone)
    if (!phoneResult.isValid) {
      return NextResponse.json(
        { error: phoneResult.error || 'Invalid phone number' }, 
        { status: 400 }
      )
    }

    // Check if customer with this phone already exists for this user
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .eq('phone', phoneResult.formatted!)
      .single()

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this phone number already exists' }, 
        { status: 409 }
      )
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email address' }, 
          { status: 400 }
        )
      }
    }

    // Create new customer with tags
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        user_id: userId,
        phone: phoneResult.formatted!,
        first_name: firstName?.trim() || null,
        last_name: lastName?.trim() || null,
        email: email?.trim() || null,
        state: state || phoneResult.state || null,
        tags: tags && Array.isArray(tags) ? tags : [],
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(newCustomer, { status: 201 })
    
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' }, 
      { status: 500 }
    )
  }
}