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

// POST /api/customers/bulk - Bulk add customers
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { customers: customersData } = body

    if (!Array.isArray(customersData)) {
      return NextResponse.json(
        { error: 'Expected an array of customers' }, 
        { status: 400 }
      )
    }

    if (customersData.length === 0) {
      return NextResponse.json(
        { error: 'No customers provided' }, 
        { status: 400 }
      )
    }

    if (customersData.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 customers per bulk operation' }, 
        { status: 400 }
      )
    }

    // Get existing phone numbers for this user to check duplicates
    const { data: existingCustomers, error: fetchError } = await supabase
      .from('customers')
      .select('phone')
      .eq('user_id', userId)

    if (fetchError) {
      console.error('Error fetching existing customers:', fetchError)
      return NextResponse.json(
        { error: 'Failed to check for duplicates' },
        { status: 500 }
      )
    }

    const existingPhones = new Set(existingCustomers.map(c => c.phone))

    let added = 0
    let skipped = 0
    const errors: string[] = []

    // Process each customer
    for (let i = 0; i < customersData.length; i++) {
      const customerData = customersData[i]
      const { phone, firstName, lastName, email, state } = customerData

      try {
        // Validate phone
        if (!phone) {
          errors.push(`Row ${i + 1}: Missing phone number`)
          skipped++
          continue
        }

        const phoneResult = processPhoneNumber(phone)
        if (!phoneResult.isValid) {
          errors.push(`Row ${i + 1}: ${phoneResult.error}`)
          skipped++
          continue
        }

        // Check for duplicates
        if (existingPhones.has(phoneResult.formatted!)) {
          skipped++
          continue
        }

        // Validate email if provided
        if (email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(email)) {
            errors.push(`Row ${i + 1}: Invalid email address`)
            skipped++
            continue
          }
        }

        // Add to existing phones set to prevent duplicates within this batch
        existingPhones.add(phoneResult.formatted!)

        // Insert customer
        const { error: insertError } = await supabase
          .from('customers')
          .insert({
            user_id: userId,
            phone: phoneResult.formatted!,
            first_name: firstName?.trim() || null,
            last_name: lastName?.trim() || null,
            email: email?.trim() || null,
            state: state || phoneResult.state || null,
            status: 'active'
          })

        if (insertError) {
          console.error(`Error inserting customer ${i + 1}:`, insertError)
          errors.push(`Row ${i + 1}: Failed to add customer - ${insertError.message}`)
          skipped++
          continue
        }

        added++
        
      } catch (error) {
        console.error(`Error processing customer ${i + 1}:`, error)
        errors.push(`Row ${i + 1}: Failed to add customer`)
        skipped++
      }
    }

    return NextResponse.json({
      added,
      skipped,
      errors: errors.length > 0 ? errors : undefined
    })
    
  } catch (error) {
    console.error('Error bulk adding customers:', error)
    return NextResponse.json(
      { error: 'Failed to bulk add customers' }, 
      { status: 500 }
    )
  }
}