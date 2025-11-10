import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'
import { NewUserProfile, NewInviteCode } from '@/lib/types'

// Generate a secure random invite code
export function generateInviteCode(length: number = 8): string {
  const bytes = randomBytes(Math.ceil(length / 2))
  return bytes.toString('hex').slice(0, length).toUpperCase()
}

// Generate an expiry date (default: 7 days from now)
export function generateInviteExpiry(days: number = 7): Date {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + days)
  return expiry
}

// Check if invite code is valid
export async function validateInviteCode(code: string): Promise<{
  valid: boolean
  inviteCode?: any
  error?: string
}> {
  const supabase = createClient()

  // Check if this is the mock client
  if (typeof supabase.from !== 'function') {
    // For mock client, validate the known invite codes
    const mockInviteCodes = ['ADMIN2024', 'INVITE123', 'INVITE456']
    if (mockInviteCodes.includes(code)) {
      return {
        valid: true,
        inviteCode: {
          id: '1',
          code,
          email: null,
          created_by: 'dev-admin',
          max_uses: 1,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    }
    return { valid: false, error: 'Invalid invite code' }
  }

  const { data: invite, error } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('code', code)
    .single()

  if (error || !invite) {
    return { valid: false, error: 'Invalid invite code' }
  }

  // Check if expired
  if (invite.expires_at && new Date() > new Date(invite.expires_at)) {
    return { valid: false, error: 'Invite code has expired' }
  }

  // For the current schema, invite codes don't have usage tracking
  // They can be used as long as they're not expired

  return { valid: true, inviteCode: invite }
}

// Mark invite code as used
export async function markInviteCodeUsed(code: string, userId: string): Promise<void> {
  const supabase = createClient()

  // Check if this is the mock client
  if (typeof supabase.from !== 'function') {
    // For mock client, we don't need to do anything
    console.log('Mock: Invite code marked as used:', code)
    return
  }

  // For real Supabase, the current schema doesn't track usage
  // Invite codes can be used multiple times until they expire
  console.log('Invite code used:', code, '(usage not tracked in current schema)')
}

// Create user profile for new user
export async function createUserProfile(
  userId: string,
  inviteCode: string,
  email?: string
): Promise<void> {
  const supabase = createClient()

  // Check if this is the mock client
  if (typeof supabase.from !== 'function') {
    // For mock client, we don't need to do anything
    console.log('Mock: User profile created for userId:', userId)
    return
  }

  // Get invite details
  const { data: invite } = await supabase
    .from('invite_codes')
    .select('created_by')
    .eq('code', inviteCode)
    .single()

  const userProfile: NewUserProfile = {
    user_id: userId,
    role: 'user',
    status: 'pending', // Requires admin approval
    invited_by: invite?.created_by,
    invite_code: inviteCode,
    invited_at: new Date().toISOString(),
  }

  await supabase
    .from('user_profiles')
    .insert(userProfile)
}

// Check user approval status
export async function checkUserApproval(userId: string): Promise<{
  approved: boolean
  profile?: any
  error?: string
}> {
  const supabase = createClient()

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !profile) {
    return { approved: false, error: 'User profile not found' }
  }

  return {
    approved: profile.status === 'approved',
    profile
  }
}

// Update user last login
export async function updateLastLogin(userId: string): Promise<void> {
  const supabase = createClient()

  await supabase
    .from('user_profiles')
    .update({
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
}

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .single()

  return profile?.role === 'admin'
}

// Create new invite code
export async function createInviteCode(
  createdBy: string,
  options: {
    email?: string
    maxUses?: number
    expiresDays?: number
    notes?: string
  } = {}
): Promise<{ code: string; error?: string }> {
  const supabase = await createClient()

  const code = generateInviteCode()
  const expiresAt = generateInviteExpiry(options.expiresDays || 7)

  const newInvite: NewInviteCode = {
    code,
    email: options.email,
    created_by: createdBy,
    expires_at: expiresAt.toISOString(),
    max_uses: options.maxUses || 1,
    notes: options.notes,
  }

  try {
    const { data, error } = await supabase
      .from('invite_codes')
      .insert(newInvite)

    if (error) {
      return { code: '', error: error.message }
    }

    return { code }
  } catch (error) {
    // Handle case where it's using the mock client
    const mockInvite = { id: String(Date.now()), ...newInvite, used: false, created_at: new Date().toISOString() }
    return { code: mockInvite.code }
  }
}