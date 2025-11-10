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

// POST /api/customers/import - Import customers from CSV data
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

    if (customersData.length > 2000) {
      return NextResponse.json(
        { error: 'Maximum 2,000 customers per CSV import' }, 
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

    let imported = 0
    let skipped = 0
    const errors: string[] = []

    // Process customers in batches for better performance
    const batchSize = 50
    const batches = []
    
    for (let i = 0; i < customersData.length; i += batchSize) {
      batches.push(customersData.slice(i, i + batchSize))
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const validCustomers: any[] = []

      // Validate batch
      for (let i = 0; i < batch.length; i++) {
        const customerData = batch[i]
        const rowNumber = batchIndex * batchSize + i + 1
        const { phone, firstName, lastName, email, state } = customerData

        try {
          // Validate phone
          if (!phone) {
            errors.push(`Row ${rowNumber}: Missing phone number`)
            skipped++
            continue
          }

          const phoneResult = processPhoneNumber(phone)
          if (!phoneResult.isValid) {
            errors.push(`Row ${rowNumber}: ${phoneResult.error}`)
            skipped++
            continue
          }

          // Check for duplicates (existing + within current import)
          if (existingPhones.has(phoneResult.formatted!)) {
            skipped++
            continue
          }

          // Validate email if provided
          if (email && email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email.trim())) {
              errors.push(`Row ${rowNumber}: Invalid email address`)
              skipped++
              continue
            }
          }

          // Add to existing phones set to prevent duplicates within this import
          existingPhones.add(phoneResult.formatted!)

          // Add to valid customers for batch insert
          validCustomers.push({
            user_id: userId,
            phone: phoneResult.formatted!,
            first_name: firstName?.trim() || null,
            last_name: lastName?.trim() || null,
            email: email?.trim() || null,
            state: state || phoneResult.state || null,
            status: 'active'
          })

        } catch (error) {
          console.error(`Error processing customer ${rowNumber}:`, error)
          errors.push(`Row ${rowNumber}: Failed to process customer`)
          skipped++
        }
      }

      // Batch insert valid customers
      if (validCustomers.length > 0) {
        try {
          const { error: insertError } = await supabase
            .from('customers')
            .insert(validCustomers)

          if (insertError) {
            throw insertError
          }

          imported += validCustomers.length
        } catch (error) {
          console.error('Error inserting customer batch:', error)
          // If batch insert fails, try individual inserts
          for (const customer of validCustomers) {
            try {
              const { error: individualError } = await supabase
                .from('customers')
                .insert(customer)

              if (individualError) {
                throw individualError
              }

              imported++
            } catch (individualError) {
              console.error('Error inserting individual customer:', individualError)
              skipped++
              errors.push(`Failed to insert customer with phone ${customer.phone}`)
            }
          }
        }
      }
    }

    return NextResponse.json({
      imported,
      skipped,
      total: customersData.length,
      errors: errors.length > 0 ? errors.slice(0, 20) : undefined, // Limit error messages
      hasMoreErrors: errors.length > 20
    })
    
  } catch (error) {
    console.error('Error importing customers:', error)
    return NextResponse.json(
      { error: 'Failed to import customers' }, 
      { status: 500 }
    )
  }
}