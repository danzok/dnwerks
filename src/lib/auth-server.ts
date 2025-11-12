/**
 * Supabase authentication utilities - SERVER SIDE
 */

import { createSupabaseAdminClient } from '@/lib/supabase/server-admin'
import { headers, cookies } from 'next/headers'
import { NextRequest } from 'next/server'

// Server-side auth for API routes
export async function auth(request?: NextRequest) {
  try {
    // Check if we're in development mode and allow mock auth
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isDevelopment) {
      // For development, check for mock auth header or use default mock user
      if (request) {
        const mockAuthHeader = request.headers.get('x-mock-auth')
        if (mockAuthHeader === 'development') {
          const mockUser = {
            id: '7a361a20-86e3-41da-a7d1-1ba13d8b9f2c',
            email: 'admin@dnwerks.com',
            user_metadata: {
              name: 'Admin User'
            }
          }

          const mockProfile = {
            id: 'mock-profile-id',
            user_id: mockUser.id,
            role: 'admin'
          }

          console.log('🔐 Using mock authentication for development')
          return {
            userId: mockUser.id,
            user: mockUser,
            profile: mockProfile,
            role: mockProfile.role
          }
        }
      }
    }

    // Get token from Authorization header or cookies
    let token: string | null = null

    if (request) {
      // Try Authorization header first
      const authHeader = request.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    // Fallback to cookies if no token in header
    if (!token) {
      const cookieStore = cookies()
      token = (await cookieStore).get('sb-access-token')?.value ||
              (await cookieStore).get('supabase.auth.token')?.value || null
    }

    if (!token) {
      if (isDevelopment) {
        console.warn('No authentication token found in development, using mock user')
        const mockUser = {
          id: '7a361a20-86e3-41da-a7d1-1ba13d8b9f2c',
          email: 'admin@dnwerks.com',
          user_metadata: {
            name: 'Admin User'
          }
        }

        const mockProfile = {
          id: 'mock-profile-id',
          user_id: mockUser.id,
          role: 'admin'
        }

        return {
          userId: mockUser.id,
          user: mockUser,
          profile: mockProfile,
          role: mockProfile.role
        }
      } else {
        console.warn('No authentication token found')
        return { userId: null, error: 'No token provided' }
      }
    }

    // Create Supabase client with service role key for server-side
    const supabaseAdmin = createSupabaseAdminClient()

    // Verify the JWT token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      console.error('Token verification failed:', error?.message)
      return { userId: null, error: 'Invalid token' }
    }

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      console.warn('User profile not found:', user.id)
      return { userId: null, error: 'User profile not found' }
    }

    return {
      userId: user.id,
      user,
      profile,
      role: profile.role
    }

  } catch (error) {
    console.error('Auth error:', error)
    return { userId: null, error: 'Authentication failed' }
  }
}

// Helper function to check if user is admin
export async function requireAdmin(request?: NextRequest) {
  const authResult = await auth(request)

  if (!authResult.userId) {
    return {
      error: 'Authentication required',
      status: 401
    }
  }

  if (authResult.role !== 'admin') {
    return {
      error: 'Admin access required',
      status: 403
    }
  }

  return {
    userId: authResult.userId,
    user: authResult.user,
    profile: authResult.profile
  }
}