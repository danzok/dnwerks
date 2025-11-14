import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { createSupabaseAdminClient } from '@/lib/supabase/server-admin'

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Create Supabase client
const supabase = createSupabaseAdminClient()

// GET /api/customers/tags - Get all unique tags for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'

    // Get all customers with tags for this user
    const { data: customers, error } = await supabase
      .from('customers')
      .select('tags')
      .eq('user_id', userId)
      .not('tags', 'is', null)
      .not('tags', 'eq', '{}')

    if (error) {
      console.error('Error fetching customer tags:', error)
      throw error
    }

    // Extract all tags and count occurrences
    const tagCounts: { [key: string]: number } = {}
    let totalTags = 0

    customers?.forEach(customer => {
      if (customer.tags && Array.isArray(customer.tags)) {
        customer.tags.forEach(tag => {
          if (tag && typeof tag === 'string' && tag.trim()) {
            const cleanTag = tag.trim()
            tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1
            totalTags++
          }
        })
      }
    })

    // Convert to array and sort
    const allTags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    // Get additional stats if requested
    let stats = null
    if (includeStats) {
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)

      const { count: taggedCustomers } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('tags', 'is', null)
        .not('tags', 'eq', '{}')

      stats = {
        totalCustomers: totalCustomers || 0,
        taggedCustomers: taggedCustomers || 0,
        uniqueTags: allTags.length,
        totalTagAssignments: totalTags,
        averageTagsPerCustomer: totalTags / (taggedCustomers || 1)
      }
    }

    return NextResponse.json({
      tags: allTags,
      stats
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/customers/tags - Create new tags (for future use)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tags } = body

    if (!Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: 'Tags array is required' },
        { status: 400 }
      )
    }

    // Validate and clean tags
    const cleanedTags = tags
      .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
      .map(tag => tag.trim().toLowerCase())
      .slice(0, 50) // Limit to 50 tags per request

    if (cleanedTags.length === 0) {
      return NextResponse.json(
        { error: 'No valid tags provided' },
        { status: 400 }
      )
    }

    // Just return the cleaned tags (tags are stored in customers table)
    return NextResponse.json({
      tags: cleanedTags,
      message: `Processed ${cleanedTags.length} tags`
    })

  } catch (error) {
    console.error('Error processing tags:', error)
    return NextResponse.json(
      { error: 'Failed to process tags', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}