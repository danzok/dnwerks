# Role-Based Navigation Implementation Plan

## Overview
This document outlines the implementation plan to hide admin pages and admin sub-menu items from regular users in the sidebar navigation.

## Current Analysis

### Admin-Only Navigation Items Identified

#### In AppSidebar Component:
- The entire "Admin" section with its sub-items:
  - Admin Panel (/admin)
  - User Management (/admin/users)
  - System Settings (/admin/settings)

#### In DashboardLayout Component:
- The adminNavigation array containing:
  - Admin Dashboard (/admin)

## Implementation Strategy

### 1. Create Role-Based Navigation Utility

**File: `src/lib/role-based-navigation.ts`**

```typescript
/**
 * Role-based navigation utilities
 */

import { UserRole } from '@/lib/types'

// Navigation item types
export interface NavItem {
  title: string
  url: string
  icon?: any
  isActive?: boolean
  items?: NavItem[]
  requiresRole?: UserRole
}

/**
 * Filter navigation items based on user role
 */
export function filterNavItemsByRole(items: NavItem[], userRole: UserRole): NavItem[] {
  return items.filter(item => {
    // If item requires a specific role, check if user has it
    if (item.requiresRole && item.requiresRole !== userRole) {
      return false
    }
    
    // If item has sub-items, recursively filter them
    if (item.items) {
      item.items = filterNavItemsByRole(item.items, userRole)
      // Only show parent item if it has visible sub-items or doesn't require a role
      return item.items.length > 0 || !item.requiresRole
    }
    
    return true
  })
}

/**
 * Check if user has admin role
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin'
}
```

### 2. Modify AppSidebar Component

**File: `src/components/app-sidebar.tsx`**

**Changes needed:**
1. Import the role-based navigation utilities
2. Import and use the `useUserProfile` hook
3. Add role-based filtering to the navigation data
4. Mark admin items with `requiresRole: 'admin'`

**Implementation:**

```typescript
// Add imports
import { useUserProfile } from '@/hooks/use-user-profile'
import { filterNavItemsByRole, type NavItem } from '@/lib/role-based-navigation'

// Update the navigation data with role requirements
const data = {
  navMain: [
    // ... existing items ...
    {
      title: "Admin",
      url: "/admin",
      icon: Shield,
      requiresRole: 'admin' as UserRole, // Add this line
      items: [
        {
          title: "Admin Panel",
          url: "/admin",
          icon: Shield,
        },
        {
          title: "User Management",
          url: "/admin/users",
          icon: Users,
        },
        {
          title: "System Settings",
          url: "/admin/settings",
          icon: Settings,
        },
      ],
    },
    // ... rest of items ...
  ],
  // ... rest of data ...
}

// Update the AppSidebar component
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { profile } = useUserProfile()
  const userRole = profile?.role || 'user'
  
  // Filter navigation items based on user role
  const filteredNavMain = filterNavItemsByRole(data.navMain, userRole)
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* ... existing header code ... */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        <SidebarRail />
      </SidebarFooter>
    </Sidebar>
  )
}
```

### 3. Update DashboardLayout Component

**File: `src/components/dashboard-layout.tsx`**

**Changes needed:**
1. The admin navigation is already conditionally rendered based on `profile?.role === 'admin'`
2. This implementation is already correct and doesn't need changes

**Current implementation (already correct):**
```typescript
{/* Admin Navigation - Only show to admin users */}
{profile?.role === 'admin' && (
  <div className="pt-2 mt-2 border-t border-gray-200">
    <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
      Admin
    </p>
    {adminNavigation.map((item) => {
      // ... existing admin navigation code ...
    })}
  </div>
)}
```

### 4. Add Role-Based Access Control to Admin Pages

**Files to update:**
- `src/app/admin/page.tsx`
- `src/app/admin/users/page.tsx`
- `src/app/admin/settings/page.tsx`

**Implementation:**
Add a server-side check to redirect non-admin users away from admin pages.

```typescript
// Add to the top of each admin page
import { requireAdmin } from '@/lib/auth-server'
import { redirect } from 'next/navigation'

// Server-side admin check
async function checkAdminAccess() {
  const authResult = await requireAdmin()
  if (authResult.error) {
    redirect('/dashboard')
  }
  return authResult
}

// Use in the component
export default async function AdminPage() {
  await checkAdminAccess()
  
  // ... rest of component code ...
}
```

### 5. Create Admin Route Protection Middleware

**File: `src/middleware.ts`** (if not exists, create it)

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Check if user is trying to access admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    // Check user role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
  
  return res
}

export const config = {
  matcher: ['/admin/:path*']
}
```

## Implementation Steps

1. **Create the role-based navigation utility** (`src/lib/role-based-navigation.ts`)
2. **Update AppSidebar component** to use role-based filtering
3. **Verify DashboardLayout component** (already implemented correctly)
4. **Add server-side protection** to admin pages
5. **Create middleware** for admin route protection
6. **Test with both user roles**

## Testing Plan

### Test Cases:
1. **Admin User:**
   - Can see all navigation items including admin section
   - Can access all admin pages (/admin, /admin/users, /admin/settings)
   - Admin navigation is visible in both AppSidebar and DashboardLayout

2. **Regular User:**
   - Cannot see admin section in navigation
   - Cannot access admin pages (redirected to dashboard)
   - Only sees user-appropriate navigation items

3. **Logged-out User:**
   - Redirected to login when trying to access admin pages

### Manual Testing Steps:
1. Create test users with both 'admin' and 'user' roles
2. Log in as admin and verify all navigation items are visible
3. Log in as regular user and verify admin items are hidden
4. Try to directly access admin URLs as a regular user (should redirect)
5. Test both AppSidebar and DashboardLayout components

## Security Considerations

1. **Client-side hiding is not enough** - Always implement server-side checks
2. **Role verification should happen** on every admin page request
3. **Middleware provides additional protection** for admin routes
4. **API endpoints should also verify** admin role for admin operations

## Files to Modify

1. `src/lib/role-based-navigation.ts` (new file)
2. `src/components/app-sidebar.tsx`
3. `src/app/admin/page.tsx`
4. `src/app/admin/users/page.tsx`
5. `src/app/admin/settings/page.tsx`
6. `src/middleware.ts` (new file or update existing)

## Notes

- The DashboardLayout component already has proper role-based rendering for admin navigation
- The AppSidebar component needs the most significant changes
- Server-side protection is crucial for security
- Middleware provides an additional layer of protection for admin routes