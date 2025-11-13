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
      setUser(authCache.user)
      setLoading(false)
      return
    }

    // Skip development logging in production
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 useUser: Starting auth check...')
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
        console.log('🔐 useUser: Initial user:', user)
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
        console.error('🔐 useUser: Error getting initial user:', error)
      }
      setUser(null)
      setLoading(false)
    })

  // Listen for auth changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 useUser: Auth state changed:', session)
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
          console.error('🔐 useUser: Error verifying user:', error)
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
    isLoaded: !loading,
    isSignedIn: !!user
  }
}