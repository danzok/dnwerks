import AdminDashboardClient from './AdminDashboardClient'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Server component with admin protection
export default async function AdminPage() {
  return <AdminDashboardClient />
}