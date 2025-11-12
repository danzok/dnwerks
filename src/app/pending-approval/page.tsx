'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Mail, CheckCircle, AlertCircle, LogOut } from 'lucide-react'

export default function PendingApprovalPage() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          window.location.href = '/login'
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profileError || !profile) {
          setError('User profile not found')
          return
        }

        setUserProfile(profile)

        // If approved, redirect to dashboard
        if (profile.status === 'approved') {
          window.location.href = '/dashboard'
          return
        }

        // If rejected, redirect to login with error
        if (profile.status === 'rejected') {
          window.location.href = '/login?error=access_denied'
          return
        }

      } catch (err) {
        setError('Failed to check approval status')
      } finally {
        setLoading(false)
      }
    }

    checkApprovalStatus()

    // Set up periodic check for approval status
    const interval = setInterval(checkApprovalStatus, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking your approval status...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSignOut} className="w-full" variant="outline">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Clock className="h-16 w-16 text-yellow-500 animate-pulse" />
          </div>
          <CardTitle className="text-xl">Awaiting Approval</CardTitle>
          <CardDescription>
            Your account is pending administrator approval
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Pending Approval
            </Badge>
            <p className="text-sm text-gray-600">
              Your registration has been received and is being reviewed by an administrator.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">What happens next?</h4>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• An administrator will review your registration</li>
              <li>• You'll receive an email when approved</li>
              <li>• This page will automatically redirect when approved</li>
            </ul>
          </div>

          <div className="text-center space-y-3">
            <div className="text-xs text-gray-500">
              <p>This page will automatically check for approval updates.</p>
              <p>You can also refresh this page manually.</p>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1"
              >
                Refresh Status
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="flex-1"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {userProfile?.invitedAt && (
            <div className="text-center text-xs text-gray-400 border-t pt-4">
              <p>Invited on {new Date(userProfile.invitedAt).toLocaleDateString()}</p>
              <p>Registration submitted on {new Date(userProfile.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}