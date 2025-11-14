import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'

// GET /api/auth/me - Get current user information
export async function GET(request: NextRequest) {
  try {
    const authResult = await auth(request)

    if (!authResult.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Return user data including mock user data for development
    return NextResponse.json({
      user: authResult.user,
      profile: authResult.profile,
      role: authResult.role
    })

  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}