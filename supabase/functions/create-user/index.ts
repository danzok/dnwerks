/// <reference types="https://deno.land/x/deno@v1.36.3/lib/deno.ns.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the requesting user is an admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return new Response('Invalid token', { status: 401 })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return new Response('Admin access required', { status: 403 })
    }

    // Parse request body
    const { email, password, full_name, role } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabaseAdmin.auth.admin.listUsers()
    if (checkError) {
      return new Response(
        JSON.stringify({ error: 'Failed to check existing users' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const userExists = existingUsers.users.some((u: any) => u.email === email)
    if (userExists) {
      return new Response(
        JSON.stringify({ error: 'User with this email already exists' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create the user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || '' }
    })

    if (createError) {
      console.error('Create user error:', createError)
      return new Response(
        JSON.stringify({ error: createError.message }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!userData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update role if specified as admin
    if (role === 'admin') {
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ role: 'admin' })
        .eq('user_id', userData.user.id)

      if (updateError) {
        console.error('Update role error:', updateError)
        // Don't fail the request, just log the error
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userData.user,
        message: 'User created successfully' 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: (error as any).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})