/**
 * Supabase authentication utilities - CLIENT SIDE
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'

export const supabase = createClient()

// Simple auth cache to prevent repeated checks
let authCache: {
  user: any | null
  timestamp: number
  loading: boolean
} = {
  user: null,
  timestamp: 0,
  loading: true
}

const CACHE_DURATION = 5000 // 5 seconds

// Client-side hook for components
export function useUser() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const now = Date.now()

    // Check if we have cached auth data that's still valid
    if (authCache.user !== null && (now - authCache.timestamp) < CACHE_DURATION) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 useUser: Using cached auth data:', authCache.user?.email)
      }
      setUser(authCache.user)
      setLoading(false)
      return
    }

    // For development, check for mock authentication
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 useUser: Starting development auth check...')

      // Try to fetch mock user data from the auth API
      const fetchMockUser = async () => {
        try {
          console.log('🔐 useUser: Fetching mock user from /api/auth/me...')
          const response = await fetch('/api/auth/me', {
            headers: {
              'x-mock-auth': 'development',
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const authData = await response.json()
            if (authData.user) {
              authCache = {
                user: authData.user,
                timestamp: now,
                loading: false
              }
              console.log('🔐 useUser: ✅ Using mock user from API:', authData.user.email)
              setUser(authData.user)
              setLoading(false)
              return
            } else {
              console.log('🔐 useUser: ❌ No user data in API response')
            }
          } else {
            console.log('🔐 useUser: ❌ API response not OK:', response.status)
          }
        } catch (e) {
          console.warn('🔐 useUser: ❌ Failed to fetch mock user from API:', e)
        }

        // Fall back to real Supabase auth if mock fails
        tryRealSupabaseAuth()
      }

      fetchMockUser()
    } else {
      // Production: go straight to real Supabase auth
      tryRealSupabaseAuth()
    }

    const tryRealSupabaseAuth = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 useUser: Falling back to real Supabase auth...')
      }

      // Get initial user with proper verification
      supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
        // Update cache
        authCache = {
          user: user ?? null,
          timestamp: now,
          loading: false
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 useUser: Initial real auth user:', user?.email || 'null')
        }
        setUser(user ?? null)
        setLoading(false)
      }).catch((error: any) => {
        // Update cache on error
        authCache = {
          user: null,
          timestamp: now,
          loading: false
        }

        if (process.env.NODE_ENV === 'development') {
          console.error('🔐 useUser: Error getting initial real auth user:', error)
        }
        setUser(null)
        setLoading(false)
      })
    }

  }, [])

  // Listen for mock auth changes from server-side
  useEffect(() => {
    const handleMockAuthChange = (event: StorageEvent) => {
      if (event.key === 'mock-user-changed') {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 useUser: Mock auth changed in localStorage')
        }

        try {
          const mockUserStr = localStorage.getItem('mock-user')
          const mockUser = mockUserStr ? JSON.parse(mockUserStr) : null

          authCache = {
            user: mockUser,
            timestamp: Date.now(),
            loading: false
          }

          setUser(mockUser)
          setLoading(false)
        } catch (error) {
          console.error('🔐 useUser: Error parsing mock user from localStorage:', error)
          setUser(null)
          setLoading(false)
        }
      }
    }

    window.addEventListener('storage', handleMockAuthChange)
    return () => window.removeEventListener('storage', handleMockAuthChange)
  }, [])

  // Listen for real Supabase auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 useUser: Real Supabase auth state changed:', session)
      }

      // Update cache immediately for better UX
      const now = Date.now()
      authCache = {
        user: session?.user ?? null,
        timestamp: now,
        loading: false
      }

      // When auth state changes, verify the user with getUser() for security
      if (session?.user) {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('🔐 useUser: Error verifying real user:', error)
          }
          setUser(null)
          authCache.user = null
        } else {
          setUser(user)
          authCache.user = user
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    loading,
    isLoaded: !loading,
    isSignedIn: !!user
  }

  return {
    user,
    isLoaded: !loading,
    isSignedIn: !!user
  }
}