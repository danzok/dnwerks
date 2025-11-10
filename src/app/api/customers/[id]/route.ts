import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'
import { processPhoneNumber } from '@/lib/utils/phone'

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// GET /api/customers/[id] - Get a specific customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth(request)
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json(customer)
    
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' }, 
      { status: 500 }
    )
  }
}

// PATCH /api/customers/[id] - Update a customer
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth(request)
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phone, firstName, lastName, email, state, status } = body

    // Process and validate phone number only if provided
    let phoneResult = null
    if (phone) {
      phoneResult = processPhoneNumber(phone)
      if (!phoneResult.isValid) {
        return NextResponse.json(
          { error: phoneResult.error || 'Invalid phone number' },
          { status: 400 }
        )
      }
    }

    // Check if customer exists and belongs to user
    const { data: existingCustomer, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError || !existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check if another customer has this phone number (if phone changed)
    if (phoneResult && phoneResult.formatted !== existingCustomer.phone) {
      const { data: duplicateCustomer, error: duplicateError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .eq('phone', phoneResult.formatted!)
        .neq('id', id)
        .limit(1)

      if (duplicateError) {
        return NextResponse.json(
          { error: 'Error checking for duplicate phone number' },
          { status: 500 }
        )
      }

      if (duplicateCustomer && duplicateCustomer.length > 0) {
        return NextResponse.json(
          { error: 'Another customer with this phone number already exists' },
          { status: 409 }
        )
      }
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

    // Validate status
    if (status && !['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either "active" or "inactive"' }, 
        { status: 400 }
      )
    }

    // Update customer
    const updateData: any = {
      first_name: firstName?.trim() || null,
      last_name: lastName?.trim() || null,
      email: email?.trim() || null,
      status: status || 'active',
      updated_at: new Date().toISOString()
    }

    // Only update phone if provided
    if (phoneResult) {
      updateData.phone = phoneResult.formatted!
      updateData.state = state || phoneResult.state || null
    } else if (state) {
      updateData.state = state
    }

    const { data: updatedCustomer, error: updateError } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating customer:', updateError)
      return NextResponse.json(
        { error: 'Failed to update customer' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedCustomer)
    
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' }, 
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id] - Delete a customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth(request)
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if customer exists and belongs to user
    const { data: existingCustomer, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError || !existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Delete customer
    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Error deleting customer:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete customer' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer' }, 
      { status: 500 }
    )
  }
}