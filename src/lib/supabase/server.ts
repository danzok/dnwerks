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
    // Return a mock client that prevents crashes
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: { id: 'dev-admin' } }, error: null }),
        getSession: () => Promise.resolve({ data: { session: { user: { id: 'dev-admin' } } }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: (table: string) => {
        // Mock data for development
        const mockData = {
          user_profiles: [
            { id: '1', user_id: 'dev-admin', role: 'admin', status: 'approved', email: 'admin@example.com' },
            { id: '2', user_id: 'user1', role: 'user', status: 'pending', email: 'user@example.com' },
            { id: '3', user_id: 'user2', role: 'moderator', status: 'approved', email: 'mod@example.com' }
          ],
          invite_codes: [
            { id: '1', code: 'INVITE123', used: false, email: 'newuser@example.com', created_by: 'dev-admin' },
            { id: '2', code: 'INVITE456', used: true, email: 'registered@example.com', created_by: 'dev-admin' }
          ]
        }

        return {
          insert: (data: any) => {
            // Simulate successful insert for invites
            if (table === 'invite_codes') {
              const newInvite = { id: String(Date.now()), ...data, used: false, created_at: new Date().toISOString() }
              return Promise.resolve({ data: newInvite, error: null })
            }
            return Promise.resolve({ data: data, error: null })
          },
          select: (columns?: string) => {
            let currentData = mockData[table as keyof typeof mockData] || []

            const queryBuilder = {
              eq: (field: string, value: any) => {
                // Mock filtering
                if (field === 'status') {
                  currentData = currentData.filter(item => item.status === value)
                } else if (field === 'user_id') {
                  currentData = currentData.filter(item => item.user_id === value)
                } else if (field === 'role') {
                  currentData = currentData.filter(item => item.role === value)
                } else if (field === 'created_by') {
                  currentData = currentData.filter(item => item.created_by === value)
                }
                return queryBuilder
              },
              single: () => Promise.resolve({ data: currentData[0], error: null }),
              order: (column?: string, options?: { ascending?: boolean }) => {
                // Simple mock ordering - just return the data as is for now
                return Promise.resolve({ data: currentData, error: null })
              },
              limit: (limit: number) => {
                currentData = currentData.slice(0, limit)
                return queryBuilder
              }
            }
            return queryBuilder
          },
          update: (data: any) => ({
            eq: (field: string, value: any) => {
              // Mock update
              return Promise.resolve({ data: { ...data, updated_at: new Date().toISOString() }, error: null })
            }
          }),
          delete: () => Promise.resolve({ data: null, error: null })
        }
      }
    } as any;
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
            console.warn('Failed to set cookie:', name, error)
          }
        },
      },
    }
  )
}