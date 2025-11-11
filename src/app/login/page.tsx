'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting login with:', { email, password: '***' })
      
      // Check if Supabase is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        setError('Supabase is not properly configured. Please check environment variables.')
        console.error('❌ Missing Supabase configuration')
        return
      }
      
      console.log('🔌 Supabase URL:', supabaseUrl)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Login error:', error)
        let errorMessage = error.message
        
        // Provide more specific error messages
        if (error.status === 400) {
          errorMessage = 'Invalid email or password format'
        } else if (error.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials.'
        } else if (error.status === 429) {
          errorMessage = 'Too many login attempts. Please try again later.'
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. If you\'re a test user, make sure the test users have been created.'
        }
        
        setError(errorMessage)
        return
      }

      console.log('✅ Login successful:', { userId: data.user?.id, email: data.user?.email })

      if (data.user) {
        // Get user profile to check role
        console.log('👤 Fetching user profile...')
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single()

        if (profileError) {
          console.error('❌ Profile fetch error:', profileError)
          
          // If profile doesn't exist, create one automatically
          if (profileError.code === 'PGRST116') {
            console.log('📝 Creating missing user profile...')
            const { error: createError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: data.user.id,
                email: data.user.email || 'unknown@example.com',
                full_name: data.user.user_metadata?.name || 'User',
                role: 'user' // Default role for auto-created profiles
              })
            
            if (createError) {
              console.error('❌ Failed to create profile:', createError)
              setError('Login successful but failed to create user profile. Please contact administrator.')
              return
            }
            
            console.log('✅ User profile created successfully')
            // Try fetching again
            const { data: newProfile, error: retryError } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('user_id', data.user.id)
              .single()
              
            if (retryError) {
              console.error('❌ Still failed to fetch profile:', retryError)
              setError('Login successful but failed to fetch user profile after creation. Please contact administrator.')
              return
            }
            
            // Redirect all users to dashboard first
            console.log('🏠 Redirecting to dashboard...')
            router.push('/dashboard')
            return
          } else {
            console.error('❌ Other profile error:', profileError)
            setError('Login successful but failed to fetch user profile. Please contact administrator.')
            return
          }
        }

        console.log('✅ User profile found:', { role: profile?.role })

        // Redirect all users to dashboard - admin access will be available from there
        console.log('🏠 Redirecting to dashboard...')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('💥 Unexpected login error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Contact your administrator to create an account
          </div>
        </CardContent>
      </Card>
    </div>
  )
}