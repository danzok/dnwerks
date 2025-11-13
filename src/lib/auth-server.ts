/**
 * Supabase authentication utilities - SERVER SIDE
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

// Server-side auth cache to reduce repeated calls
const authCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

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

    // Create cache key from cookies
    const cacheKey = cookieStore.getAll()
      .filter(cookie => cookie.name.startsWith('sb-'))
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('|')

    // Check cache first
    const cached = authCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      if (isDevelopment) {
        console.log('🔍 [AUTH DEBUG] Using cached auth result')
      }
      return cached.data
    }

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
    if (isDevelopment) {
      console.log('🔍 [AUTH DEBUG] Getting user from Supabase...')
    }
    const { data: { user }, error } = await supabase.auth.getUser()

    if (isDevelopment) {
      console.log('🔍 [AUTH DEBUG] Supabase auth result:', { user: user?.id, error: error?.message })
    }

    if (error || !user) {
      if (isDevelopment) {
        console.log('🔍 [AUTH DEBUG] No user found, checking development fallback...')
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

        const authResult = {
          userId: mockUser.id,
          user: mockUser,
          profile: mockProfile,
          role: mockProfile.role
        }

        // Cache mock result
        authCache.set(cacheKey, { data: authResult, timestamp: Date.now() })
        return authResult
      } else {
        if (isDevelopment) console.warn('No valid session found in production')
        const authResult = { userId: null, error: 'No valid session' }
        authCache.set(cacheKey, { data: authResult, timestamp: Date.now() })
        return authResult
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
      const authResult = { userId: null, error: 'User profile not found' }
      authCache.set(cacheKey, { data: authResult, timestamp: Date.now() })
      return authResult
    }

    const authResult = {
      userId: user.id,
      user,
      profile,
      role: profile.role
    }

    // Cache successful auth result
    authCache.set(cacheKey, { data: authResult, timestamp: Date.now() })
    return authResult

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