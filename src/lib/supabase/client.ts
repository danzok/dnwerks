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
      from: () => {
        const createErrorResult = () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
        const createEmptyResult = () => Promise.resolve({ data: [], error: new Error('Supabase not configured') })

        const createSelectChain = () => ({
          eq: () => ({
            single: createErrorResult,
            maybeSingle: createErrorResult,
            neq: () => ({
              limit: createEmptyResult
            }),
            limit: createEmptyResult,
            order: () => ({
              limit: createEmptyResult
            })
          }),
          neq: () => ({
            limit: createEmptyResult
          }),
          in: () => createEmptyResult(),
          order: () => ({
            limit: createEmptyResult
          }),
          limit: createEmptyResult,
          single: createErrorResult,
          maybeSingle: createErrorResult
        })

        return {
          insert: () => ({
            select: () => ({
              single: createErrorResult,
              maybeSingle: createErrorResult
            })
          }),
          select: createSelectChain,
          update: () => ({
            eq: () => ({
              select: createErrorResult
            }),
            in: () => ({
              select: createErrorResult
            })
          }),
          delete: () => ({
            eq: createErrorResult
          }),
          eq: () => ({
            select: () => ({
              single: createErrorResult,
              maybeSingle: createErrorResult
            })
          })
        }
      }
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

    const mockProfile = {
      user_id: mockUser.id,
      email: mockUser.email,
      full_name: mockUser.user_metadata?.name ?? 'Admin User',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const resolve = (data: any) => Promise.resolve({ data, error: null })
    const resolveList = (data: any[]) => Promise.resolve({ data, error: null })
    const reject = (message: string) => Promise.resolve({ data: null, error: new Error(message) })

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
      from: (table: string) => {
        if (table === 'user_profiles') {
          return {
            insert: (values: any) => ({
              select: () => ({
                single: () => resolve(Array.isArray(values) ? values[0] : values),
                maybeSingle: () => resolve(Array.isArray(values) ? values[0] : values)
              })
            }),
            select: () => ({
              eq: (column: string, value: any) => {
                if (column === 'user_id' && value === mockUser.id) {
                  return {
                    single: () => resolve(mockProfile),
                    maybeSingle: () => resolve(mockProfile),
                    neq: () => ({
                      limit: (limitValue: number) => resolveList(limitValue ? [mockProfile].slice(0, limitValue) : [mockProfile])
                    }),
                    limit: (limitValue: number) => resolveList(limitValue ? [mockProfile].slice(0, limitValue) : [mockProfile]),
                    order: () => ({
                      limit: (limitValue: number) => resolveList(limitValue ? [mockProfile].slice(0, limitValue) : [mockProfile])
                    })
                  }
                }
                return {
                  single: () => resolve(null),
                  maybeSingle: () => resolve(null),
                  neq: () => ({
                    limit: () => resolveList([])
                  }),
                  limit: () => resolveList([]),
                  order: () => ({
                    limit: () => resolveList([])
                  })
                }
              },
              neq: () => ({
                limit: () => resolveList([])
              }),
              in: () => resolveList([]),
              order: () => ({
                limit: () => resolveList([mockProfile])
              }),
              limit: () => resolveList([mockProfile]),
              single: () => resolve(mockProfile),
              maybeSingle: () => resolve(mockProfile)
            }),
            update: () => ({
              eq: () => ({
                select: () => resolve(mockProfile)
              }),
              in: () => ({
                select: () => resolve(mockProfile)
              })
            }),
            delete: () => ({
              eq: () => resolve(null)
            }),
            eq: () => ({
              select: () => ({
                single: () => resolve(mockProfile),
                maybeSingle: () => resolve(mockProfile)
              })
            })
          }
        }

        const message = `Mock client - table "${table}" not implemented`
        return {
          insert: () => ({
            select: () => ({
              single: () => reject(message),
              maybeSingle: () => reject(message)
            })
          }),
          select: () => ({
            eq: () => ({
              single: () => reject(message),
              maybeSingle: () => reject(message),
              neq: () => ({
                limit: () => reject(message)
              }),
              limit: () => reject(message),
              order: () => ({
                limit: () => reject(message)
              })
            }),
            neq: () => ({
              limit: () => reject(message)
            }),
            in: () => reject(message),
            order: () => ({
              limit: () => reject(message)
            }),
            limit: () => reject(message),
            single: () => reject(message),
            maybeSingle: () => reject(message)
          }),
          update: () => ({
            eq: () => ({
              select: () => reject(message)
            }),
            in: () => ({
              select: () => reject(message)
            })
          }),
          delete: () => ({
            eq: () => reject(message)
          }),
          eq: () => ({
            select: () => ({
              single: () => reject(message),
              maybeSingle: () => reject(message)
            })
          })
        }
      }
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
      from: () => {
        const createErrorResult = () => Promise.resolve({ data: null, error: new Error('Failed to create Supabase client') })
        const createEmptyResult = () => Promise.resolve({ data: [], error: new Error('Failed to create Supabase client') })

        const createSelectChain = () => ({
          eq: () => ({
            single: createErrorResult,
            maybeSingle: createErrorResult,
            neq: () => ({
              limit: createEmptyResult
            }),
            limit: createEmptyResult,
            order: () => ({
              limit: createEmptyResult
            })
          }),
          neq: () => ({
            limit: createEmptyResult
          }),
          in: () => createEmptyResult(),
          order: () => ({
            limit: createEmptyResult
          }),
          limit: createEmptyResult,
          single: createErrorResult,
          maybeSingle: createErrorResult
        })

        return {
          insert: () => ({
            select: () => ({
              single: createErrorResult,
              maybeSingle: createErrorResult
            })
          }),
          select: createSelectChain,
          update: () => ({
            eq: () => ({
              select: createErrorResult
            }),
            in: () => ({
              select: createErrorResult
            })
          }),
          delete: () => ({
            eq: createErrorResult
          }),
          eq: () => ({
            select: () => ({
              single: createErrorResult,
              maybeSingle: createErrorResult
            })
          })
        }
      }
    } as any;
  }
}