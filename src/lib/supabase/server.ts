import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if Supabase is properly configured
  const isPlaceholder = !supabaseUrl ||
    supabaseUrl.includes('[project]') ||
    supabaseUrl === 'https://[project].supabase.co' ||
    supabaseAnonKey?.includes('your_supabase_anon_key_here')

  if (isPlaceholder) {
    throw new Error('Supabase is not properly configured. Please check your environment variables.')
  }

  const cookieStore = await cookies()

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
            console.warn('Failed to set cookies:', error)
          }
        },
      },
    }
  )
}