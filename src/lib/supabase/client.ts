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
    console.warn('⚠️ Supabase not configured - using mock client')
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
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
            neq: () => ({
              limit: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') })
            }),
            limit: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') })
            })
          }),
          neq: () => ({
            limit: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') })
          }),
          in: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') })
          }),
          limit: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
          single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
        }),
        update: () => ({
          eq: () => ({
            select: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
          }),
          in: () => ({
            select: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
          })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
        }),
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
          })
        })
      })
    } as any;
  }

  // Check if we're in development mode and should use mock authentication
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    console.log('🔐 Using mock authentication for development (client-side)')
    // Return a mock client with development user for development mode
    const mockUser = {
      id: '7a361a20-86e3-41da-a7d1-1ba13d8b9f2c',
      email: 'admin@dnwerks.com',
      user_metadata: {
        name: 'Admin User'
      }
    };

    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: mockUser }, error: null }),
        getSession: () => Promise.resolve({
          data: {
            session: {
              user: mockUser,
              access_token: 'mock-token',
              refresh_token: 'mock-refresh-token'
            }
          },
          error: null
        }),
        signInWithPassword: () => Promise.resolve({ data: { user: mockUser, session: { user: mockUser } }, error: null }),
        signInWithOAuth: () => Promise.resolve({ data: { user: mockUser, session: { user: mockUser } }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: (callback: any) => {
          // Immediately call callback with mock session
          setTimeout(() => {
            callback('SIGNED_IN', { user: mockUser });
          }, 0);
          return { data: { subscription: { unsubscribe: () => {} } } };
        }
      },
      from: () => ({
        insert: () => Promise.resolve({ data: null, error: new Error('Mock client - insert not implemented') }),
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: new Error('Mock client - eq not implemented') }),
            neq: () => ({
              limit: () => Promise.resolve({ data: [], error: new Error('Mock client - eq not implemented') })
            }),
            limit: () => Promise.resolve({ data: [], error: new Error('Mock client - select not implemented') }),
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: new Error('Mock client - select not implemented') })
            })
          }),
          neq: () => ({
            limit: () => Promise.resolve({ data: [], error: new Error('Mock client - select not implemented') })
          }),
          in: () => Promise.resolve({ data: [], error: new Error('Mock client - select not implemented') }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: new Error('Mock client - select not implemented') })
          }),
          limit: () => Promise.resolve({ data: [], error: new Error('Mock client - select not implemented') }),
          single: () => Promise.resolve({ data: null, error: new Error('Mock client - select not implemented') })
        }),
        update: () => ({
          eq: () => ({
            select: () => Promise.resolve({ data: null, error: new Error('Mock client - update not implemented') })
          }),
          in: () => ({
            select: () => Promise.resolve({ data: null, error: new Error('Mock client - update not implemented') })
          })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: new Error('Mock client - delete not implemented') })
        }),
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: new Error('Mock client - eq not implemented') })
          })
        })
      })
    } as any;
  }

  try {
    return createBrowserClient(
      supabaseUrl!,
      supabaseAnonKey!
    )
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error)
    // Return mock client as fallback
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Failed to create Supabase client') }),
        getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Failed to create Supabase client') }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Failed to create Supabase client') }),
        signInWithOAuth: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Failed to create Supabase client') }),
        signOut: () => Promise.resolve({ error: new Error('Failed to create Supabase client') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        insert: () => Promise.resolve({ data: null, error: new Error('Failed to create Supabase client') }),
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: new Error('Failed to create Supabase client') }),
            neq: () => ({
              limit: () => Promise.resolve({ data: [], error: new Error('Failed to create Supabase client') })
            }),
            limit: () => Promise.resolve({ data: [], error: new Error('Failed to create Supabase client') }),
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: new Error('Failed to create Supabase client') })
            })
          }),
          neq: () => ({
            limit: () => Promise.resolve({ data: [], error: new Error('Failed to create Supabase client') })
          }),
          in: () => Promise.resolve({ data: [], error: new Error('Failed to create Supabase client') }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: new Error('Failed to create Supabase client') })
          }),
          limit: () => Promise.resolve({ data: [], error: new Error('Failed to create Supabase client') }),
          single: () => Promise.resolve({ data: null, error: new Error('Failed to create Supabase client') })
        }),
        update: () => ({
          eq: () => ({
            select: () => Promise.resolve({ data: null, error: new Error('Failed to create Supabase client') })
          }),
          in: () => ({
            select: () => Promise.resolve({ data: null, error: new Error('Failed to create Supabase client') })
          })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: new Error('Failed to create Supabase client') })
        }),
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: new Error('Failed to create Supabase client') })
          })
        })
      })
    } as any;
  }
}