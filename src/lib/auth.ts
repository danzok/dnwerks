/**
 * Supabase authentication utilities - CLIENT SIDE
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'

export const supabase = createClient()

// Client-side hook for components
export function useUser() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  console.log('🔐 useUser: Starting auth check...')
  
  // Get initial user with proper verification
  supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
    console.log('🔐 useUser: Initial user:', user)
    setUser(user ?? null)
    setLoading(false)
  }).catch((error: any) => {
    console.error('🔐 useUser: Error getting initial user:', error)
    setUser(null)
    setLoading(false)
  })

  // Listen for auth changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
    console.log('🔐 useUser: Auth state changed:', session)
    
    // When auth state changes, verify the user with getUser() for security
    if (session?.user) {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('🔐 useUser: Error verifying user:', error)
        setUser(null)
      } else {
        setUser(user)
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