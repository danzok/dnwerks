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

  if (!authResult.userId) {
    // No session, redirect to login
    if (pathname !== '/login') {
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Check if user is admin for admin routes
  if (adminPaths.some(path => pathname.startsWith(path))) {
    if (authResult.role !== 'admin') {
      // Not admin, redirect to login
      const loginUrl = new URL('/login', req.url)
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