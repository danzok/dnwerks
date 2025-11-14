import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // BYPASS AUTHENTICATION IN DEVELOPMENT
  const isDevelopment = process.env.NODE_ENV === 'development'
  if (isDevelopment) {
    console.log('🔓 Development mode: Authentication bypassed')
    return supabaseResponse
  }

  // Check if Supabase is properly configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey ||
      supabaseUrl.includes('your_supabase_anon_key_here') ||
      supabaseAnonKey.includes('your_supabase_anon_key_here')) {
    // Skip authentication if Supabase is not configured
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes
  const protectedRoutes = ['/dashboard']
  const adminRoutes = ['/dashboard/admin']
  const authRoutes = ['/sign-in', '/sign-up']
  const publicRoutes = ['/pending-approval']

  // Handle unauthenticated users
  if (!user) {
    if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      const url = request.nextUrl.clone()
      url.pathname = '/sign-in'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Handle authenticated users
  if (user) {
    // Redirect away from auth pages if authenticated
    if (authRoutes.includes(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Check user profile for protected routes
    if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('status, role')
        .eq('user_id', user.id)
        .single()

      // If no profile found, user needs to register properly
      if (profileError || !profile) {
        const url = request.nextUrl.clone()
        url.pathname = '/sign-in'
        url.searchParams.set('error', 'profile_not_found')
        return NextResponse.redirect(url)
      }

      // Handle pending approval
      if (profile.status === 'pending') {
        // Allow access to pending approval page
        if (request.nextUrl.pathname !== '/pending-approval') {
          const url = request.nextUrl.clone()
          url.pathname = '/pending-approval'
          return NextResponse.redirect(url)
        }
        return supabaseResponse
      }

      // Handle rejected users
      if (profile.status === 'rejected') {
        const url = request.nextUrl.clone()
        url.pathname = '/sign-in'
        url.searchParams.set('error', 'access_denied')
        return NextResponse.redirect(url)
      }

      // Check admin access for admin routes
      if (adminRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
        if (profile.role !== 'admin' || profile.status !== 'approved') {
          const url = request.nextUrl.clone()
          url.pathname = '/dashboard'
          return NextResponse.redirect(url)
        }
      }

      // Only approved users can access main dashboard
      if (profile.status !== 'approved' && request.nextUrl.pathname.startsWith('/dashboard') &&
          !request.nextUrl.pathname.includes('/pending-approval')) {
        const url = request.nextUrl.clone()
        url.pathname = '/pending-approval'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}