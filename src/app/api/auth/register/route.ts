import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { email, password, fullName } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password are required'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({
        error: 'Password must be at least 8 characters long'
      }, { status: 400 })
    }

    // Check if this is the mock client
    const isMockClient = !supabase.auth || typeof supabase.auth.signUp !== 'function'

    let authData: any = null

    if (isMockClient) {
      // For mock client, simulate successful signup
      authData = {
        user: {
          id: `mock-user-${Date.now()}`,
          email: email,
          email_confirmed_at: new Date().toISOString()
        }
      }
      console.log('Mock: User account created for:', email)
    } else {
      // Create user account with Supabase
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      })

      if (signUpError) {
        console.error('Sign up error:', signUpError)

        // Handle specific errors
        if (signUpError.message.includes('User already registered')) {
          return NextResponse.json({
            error: 'An account with this email already exists'
          }, { status: 400 })
        }

        return NextResponse.json({
          error: 'Failed to create account. Please try again.'
        }, { status: 500 })
      }

      authData = signUpData
    }

    // Note: User profile will be created by admin after registration
    // This is a simplified registration that just creates the auth user

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please wait for an administrator to approve your account.',
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        email_confirmed_at: authData.user?.email_confirmed_at,
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}