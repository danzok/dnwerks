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
          id: '6a06617b-deee-4f02-a08a-bdec17e46d98',
          email: 'danisbermainaja@gmail.com',
          user_metadata: {
            name: 'Danis Bermain',
            full_name: 'Danis Bermain'
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
      console.log('🔍 [AUTH DEBUG] Environment:', process.env.NODE_ENV)
      console.log('🔍 [AUTH DEBUG] Supabase URL configured:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('🔍 [AUTH DEBUG] Supabase Key configured:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    }
    const { data: { user }, error } = await supabase.auth.getUser()

    if (isDevelopment) {
      console.log('🔍 [AUTH DEBUG] Supabase auth result:', {
        user: user?.id || null,
        error: error?.message || null,
        userEmail: user?.email || null
      })
    }

    if (error || !user) {
      if (isDevelopment) {
        console.log('🔍 [AUTH DEBUG] No valid Supabase user found, checking development fallback...')
        console.log('🔍 [AUTH DEBUG] Error:', error?.message)
        console.warn('🔐 Using mock authentication for development (no valid session)')

        const mockUser = {
          id: '6a06617b-deee-4f02-a08a-bdec17e46d98',
          email: 'danisbermainaja@gmail.com',
          user_metadata: {
            name: 'Danis Bermain',
            full_name: 'Danis Bermain'
          }
        }

        // Create mock profile with user_id matching the mock user ID
        const mockProfile = {
          id: 'mock-profile-id',
          user_id: mockUser.id, // This should match auth.uid()
          role: 'admin',
          status: 'approved'
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
        console.warn('🔐 No valid session found in production')
        const authResult = { userId: null, error: 'No valid session' }
        authCache.set(cacheKey, { data: authResult, timestamp: Date.now() })
        return authResult
      }
    }

    // Check user profile
    let profile
    let profileError

    try {
      const profileResult = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      profile = profileResult.data
      profileError = profileResult.error

      if (isDevelopment) {
        console.log('🔍 [AUTH DEBUG] Profile lookup result:', {
          profileId: profile?.id,
          profileUserId: profile?.user_id,
          profileError: profileError?.message
        })
      }
    } catch (err) {
      console.error('🔍 [AUTH DEBUG] Profile lookup exception:', err)
      profileError = { message: 'Profile lookup failed' }
    }

    if (profileError || !profile) {
      if (isDevelopment) {
        console.warn('🔍 [AUTH DEBUG] User profile not found, using mock fallback for development')
        console.log('🔍 [AUTH DEBUG] Profile error:', profileError?.message)
        console.log('🔍 [AUTH DEBUG] User ID:', user.id)

        // In development, create a mock profile to continue
        const mockProfile = {
          id: 'mock-profile-id',
          user_id: user.id, // Match auth.uid()
          role: 'admin',
          status: 'approved',
          email: user.email,
          created_at: new Date().toISOString()
        }

        const authResult = {
          userId: user.id,
          user,
          profile: mockProfile,
          role: mockProfile.role
        }

        // Cache mock result with shorter duration
        authCache.set(cacheKey, { data: authResult, timestamp: Date.now() })
        return authResult
      } else {
        console.warn('🔐 User profile not found in production:', user.id)
        const authResult = { userId: null, error: 'User profile not found' }
        authCache.set(cacheKey, { data: authResult, timestamp: Date.now() })
        return authResult
      }
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