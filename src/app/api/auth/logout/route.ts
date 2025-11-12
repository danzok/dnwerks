import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Logout failed' }, { status: 500 })
  }
}

// Optional: allow GET for convenience (e.g., clicking a link). Not recommended for CSRF-sensitive ops,
// but kept here as a convenience if needed. Consider removing in production or adding CSRF protection.
export async function GET() {
  return POST()
}
