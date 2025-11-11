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
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login with:', { email });
      console.log('🔌 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

      // Sign in
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('❌ Login error:', signInError);
        throw signInError;
      }

      console.log('✅ Login successful:', authData.user);

      // Get fresh session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No session after login');
      }

      console.log('👤 Fetching user profile...');

      // Fetch profile with retry logic
      let retries = 3;
      let profile = null;
      let profileError = null;

      while (retries > 0 && !profile) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (error) {
          profileError = error;
          console.error(`❌ Profile fetch error (attempt ${4 - retries}):`, error);
          console.error('❌ Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } else {
          profile = data;
          break;
        }
      }

      // If still no profile, try to create one
      if (!profile && profileError) {
        console.log('📝 Creating missing user profile...');
        
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            email: authData.user.email,
            full_name: authData.user.user_metadata?.full_name || 
                       authData.user.email?.split('@')[0] || 
                       'User',
            role: 'user'
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Failed to create profile:', createError);
          console.error('❌ Create error details:', {
            message: createError.message,
            details: createError.details,
            hint: createError.hint,
            code: createError.code
          });
          throw new Error('Could not create user profile. Please contact support.');
        }

        console.log('✅ Profile created:', newProfile);
        profile = newProfile;
      }

      console.log('✅ Profile loaded:', profile);
      
      // Redirect based on role
      if (profile?.role === 'admin') {
        console.log('👑 Redirecting to admin dashboard...');
        router.push('/admin');
      } else {
        console.log('🏠 Redirecting to dashboard...');
        router.push('/dashboard');
      }
      
      console.log('🎉 Login complete, redirecting...');
    } catch (err: any) {
      console.error('❌ Login process failed:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

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