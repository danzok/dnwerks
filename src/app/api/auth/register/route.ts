import { createClient } from '@/lib/supabase/server'
import { validateInviteCode, markInviteCodeUsed, createUserProfile } from '@/lib/auth-utils'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()

  try {
    const body = await request.json()
    const { email, password, inviteCode, fullName } = body

    // Validate required fields
    if (!email || !password || !inviteCode) {
      return NextResponse.json({
        error: 'Email, password, and invite code are required'
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

    // Validate invite code
    const { valid, inviteCode: inviteData, error: inviteError } = await validateInviteCode(inviteCode)

    if (!valid) {
      return NextResponse.json({
        error: inviteError || 'Invalid invite code'
      }, { status: 400 })
    }

    // Check if invite is for specific email
    if (inviteData.email && inviteData.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({
        error: 'This invite code is for a different email address'
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

    // If user was created successfully, create their profile
    if (authData.user) {
      try {
        await createUserProfile(authData.user.id, inviteCode, email)
        await markInviteCodeUsed(inviteCode, authData.user.id)
      } catch (profileError) {
        console.error('Error creating user profile:', profileError)
        // Don't fail the request if profile creation fails, but log it
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
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