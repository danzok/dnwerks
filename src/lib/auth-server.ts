/**
 * Supabase authentication utilities - SERVER SIDE
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

// Server-side auth for API routes and layouts
export async function auth(request?: NextRequest) {
  try {
    // Check if we're in development mode and allow mock auth
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isDevelopment && request) {
      // For development, check for mock auth header
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

    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => {
            try {
              return cookieStore.getAll().map(cookie => ({
                name: cookie.name,
                value: cookie.value
              }))
            } catch (error) {
              // Fallback for edge cases
              return []
            }
          },
          setAll: () => {} // Not needed for auth checks
        },
      }
    )

    // Get the current user
    console.log('🔍 [AUTH DEBUG] Getting user from Supabase...')
    const { data: { user }, error } = await supabase.auth.getUser()

    console.log('🔍 [AUTH DEBUG] Supabase auth result:', { user: user?.id, error: error?.message })

    if (error || !user) {
      console.log('🔍 [AUTH DEBUG] No user found, checking development fallback...')
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
        console.warn('No valid session found in production')
        return { userId: null, error: 'No valid session' }
      }
    }

    // Check user profile
    const { data: profile, error: profileError } = await supabase
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