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
      // Use contains for array filtering - each tag in the filter should be present in the contact's tags array
      query = query.overlaps('tags', tags)
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

// PATCH /api/customers/bulk - Bulk update multiple customers
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { customerIds, updates } = body

    // Validate required fields
    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: 'Customer IDs array is required' },
        { status: 400 }
      )
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Updates object is required' },
        { status: 400 }
      )
    }

    // Validate tags if present in updates
    let processedTags: string[] = []
    if (updates.tags !== undefined) {
      if (!Array.isArray(updates.tags)) {
        return NextResponse.json(
          { error: 'Tags must be an array' },
          { status: 400 }
        )
      }
      // Filter and clean tags
      processedTags = updates.tags
        .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
        .map(tag => tag.trim())
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Add specific fields from updates
    if (updates.firstName !== undefined) {
      updateData.first_name = updates.firstName?.trim() || null
    }

    if (updates.lastName !== undefined) {
      updateData.last_name = updates.lastName?.trim() || null
    }

    if (updates.email !== undefined) {
      updateData.email = updates.email?.trim() || null
    }

    if (updates.state !== undefined) {
      updateData.state = updates.state
    }

    if (updates.status !== undefined) {
      if (!['active', 'inactive'].includes(updates.status)) {
        return NextResponse.json(
          { error: 'Status must be either "active" or "inactive"' },
          { status: 400 }
        )
      }
      updateData.status = updates.status
    }

    if (updates.tags !== undefined) {
      updateData.tags = processedTags
    }

    // Check if any update fields were provided
    if (Object.keys(updateData).length === 1) { // Only updated_at
      return NextResponse.json(
        { error: 'No valid update fields provided' },
        { status: 400 }
      )
    }

    // Validate that all customers belong to the user
    const { data: existingCustomers, error: fetchError } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .in('id', customerIds)

    if (fetchError) {
      console.error('Error fetching customers:', fetchError)
      return NextResponse.json(
        { error: 'Error validating customer ownership' },
        { status: 500 }
      )
    }

    const validCustomerIds = existingCustomers?.map(c => c.id) || []
    const invalidIds = customerIds.filter(id => !validCustomerIds.includes(id))

    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Invalid customer IDs: ${invalidIds.join(', ')}` },
        { status: 404 }
      )
    }

    // Perform bulk update
    const { data: updatedCustomers, error: updateError } = await supabase
      .from('customers')
      .update(updateData)
      .in('id', customerIds)
      .eq('user_id', userId)
      .select()

    if (updateError) {
      console.error('Error updating customers:', updateError)
      return NextResponse.json(
        { error: 'Failed to update customers' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCustomers?.length || 0} customers`,
      updatedCustomers
    })

  } catch (error) {
    console.error('Error in bulk update:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk update' },
      { status: 500 }
    )
  }
}