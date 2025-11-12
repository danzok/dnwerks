import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth-server'
import AdminDashboardClient from './AdminDashboardClient'

// Server component with admin protection
export default async function AdminPage() {
  // Server-side admin check
  const authResult = await requireAdmin()
  
  if (authResult.error) {
    if (authResult.status === 401) {
      redirect('/login')
    } else if (authResult.status === 403) {
      redirect('/dashboard')
    }
  }

  return <AdminDashboardClient />
}