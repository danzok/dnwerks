'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function DebugAuthPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testSupabaseConnection = async () => {
    setLoading(true)
    setLogs([])
    
    try {
      addLog('🔍 Testing Supabase connection...')
      
      // Test 1: Check environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      addLog(`📋 Supabase URL: ${supabaseUrl}`)
      addLog(`📋 Anon Key: ${supabaseAnonKey ? 'Present' : 'Missing'}`)
      
      if (!supabaseUrl || !supabaseAnonKey) {
        addLog('❌ Missing environment variables')
        return
      }
      
      // Test 2: Basic connection test
      addLog('🔌 Testing basic connection...')
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1)
      
      if (error) {
        addLog(`❌ Connection failed: ${error.message}`)
        return
      }
      
      addLog('✅ Supabase connection successful')
      
      // Test 3: Check if test users exist
      addLog('👥 Checking for test users...')
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('email, role, user_id')
        .ilike('email', '%@dnwerks.com')
      
      if (usersError) {
        addLog(`❌ Failed to fetch users: ${usersError.message}`)
        return
      }
      
      if (users && users.length > 0) {
        addLog(`✅ Found ${users.length} test users:`)
        users.forEach((user: any) => {
          addLog(`   - ${user.email} (${user.role})`)
        })
      } else {
        addLog('⚠️ No test users found in user_profiles table')
      }
      
      // Test 4: Try to sign in with test credentials
      addLog('🔐 Testing admin login...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@dnwerks.com',
        password: 'AdminPassword123!'
      })
      
      if (signInError) {
        addLog(`❌ Admin login failed: ${signInError.message}`)
        addLog(`   Error code: ${signInError.status}`)
      } else {
        addLog('✅ Admin login successful!')
        addLog(`   User ID: ${signInData.user?.id}`)
        addLog(`   Email: ${signInData.user?.email}`)
        
        // Sign out after successful test
        await supabase.auth.signOut()
        addLog('🔓 Signed out after test')
      }
      
    } catch (error) {
      addLog(`💥 Unexpected error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const createTestUser = async () => {
    setLoading(true)
    addLog('👤 Creating test user via Supabase Auth...')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'test@dnwerks.com',
        password: 'TestPassword123!',
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      })
      
      if (error) {
        addLog(`❌ User creation failed: ${error.message}`)
        return
      }
      
      addLog('✅ User created successfully!')
      addLog(`   User ID: ${data.user?.id}`)
      addLog(`   Email: ${data.user?.email}`)
      
      // Create user profile
      if (data.user?.id) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            email: data.user.email,
            full_name: 'Test User',
            role: 'user'
          })
        
        if (profileError) {
          addLog(`❌ Profile creation failed: ${profileError.message}`)
        } else {
          addLog('✅ User profile created successfully!')
        }
      }
      
    } catch (error) {
      addLog(`💥 Unexpected error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Authentication Debug Tool</CardTitle>
            <CardDescription>
              Use this tool to diagnose and fix authentication issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={testSupabaseConnection} 
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Test Connection & Users'}
              </Button>
              <Button 
                onClick={createTestUser} 
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Creating...' : 'Create Test User'}
              </Button>
            </div>
            
            {logs.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Debug Logs:</h3>
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Alert>
          <AlertDescription>
            <strong>Test Credentials:</strong><br />
            Admin: admin@dnwerks.com / AdminPassword123!<br />
            User: user1@dnwerks.com / UserPassword123!<br />
            User: user2@dnwerks.com / UserPassword123!
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}