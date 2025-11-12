import { auth } from '@/lib/auth-server'
import { NextResponse, NextRequest } from 'next/server'

// Public paths that don't require authentication
const publicPaths = [
  '/login',
  '/_next/static',
  '/_next/image',
  '/favicon.ico'
]

// Admin-only paths
const adminPaths = [
  '/admin',
  '/api/admin'
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip middleware for public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Get authentication using the same auth system as API routes
  const authResult = await auth(req)

  // Debug logging for production
  if (process.env.NODE_ENV === 'production') {
    console.log('🔐 Middleware auth check:', {
      pathname,
      hasUserId: !!authResult.userId,
      hasError: !!authResult.error,
      role: authResult.role
    })
  }

  if (!authResult.userId) {
    // No session, redirect to login
    if (pathname !== '/login') {
      console.log('🔄 Redirecting to login - no session found')
      const loginUrl = new URL('/login', req.url)
      // Add redirect parameter to help with debugging
      loginUrl.searchParams.set('redirected_from', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Check if user is admin for admin routes
  if (adminPaths.some(path => pathname.startsWith(path))) {
    if (authResult.role !== 'admin') {
      // Not admin, redirect to login
      console.log('🔄 Redirecting to login - not admin')
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('error', 'admin_required')
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}