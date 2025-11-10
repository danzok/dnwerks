import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if Supabase is properly configured
  const isPlaceholder = !supabaseUrl ||
    supabaseUrl.includes('[project]') ||
    supabaseUrl === 'https://[project].supabase.co' ||
    supabaseAnonKey?.includes('your_supabase_anon_key_here')

  if (isPlaceholder) {
    // Return a mock client that prevents crashes
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
        getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase not configured') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        select: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
        update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        eq: () => ({
          select: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') })
        })
      })
    } as any;
  }

  const cookieStore = cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey!,
    {
      cookies: {
        getAll: () => {
          try {
            // Next.js 16 compatibility: convert cookies to expected format
            const cookies = cookieStore.getAll()
            return cookies.map(cookie => ({
              name: cookie.name,
              value: cookie.value
            }))
          } catch (error) {
            // Fallback for older Next.js versions or edge cases
            return []
          }
        },
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // Handle edge cases where cookie setting might fail
            console.warn('Failed to set cookie:', name, error)
          }
        },
      },
    }
  )
}