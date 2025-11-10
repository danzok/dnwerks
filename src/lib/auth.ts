/**
 * Supabase authentication utilities - CLIENT SIDE
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client-side hook for components
export function useUser() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔐 useUser: Starting auth check...')
    
    // For development, return a mock user
    // In production, you would implement proper Supabase auth here
    const mockUser = {
      id: '7a361a20-86e3-41da-a7d1-1ba13d8b9f2c',
      email: 'admin@dnwerks.com',
      user_metadata: {
        name: 'Admin User'
      }
    }
    
    console.log('🔐 useUser: Setting mock user for development')
    setUser(mockUser)
    setLoading(false)

    // Uncomment this for real Supabase auth:
    /*
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 useUser: Initial session:', session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔐 useUser: Auth state changed:', session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
    */
  }, [])

  return {
    user,
    isLoaded: !loading,
    isSignedIn: !!user
  }
}