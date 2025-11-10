import { createBrowserClient } from '@supabase/ssr'

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
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
        signInWithOAuth: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
        signOut: () => Promise.resolve({ error: new Error('Supabase not configured') }),
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

  return createBrowserClient(
    supabaseUrl!,
    supabaseAnonKey!
  )
}