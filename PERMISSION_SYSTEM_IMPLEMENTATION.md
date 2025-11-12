# Permission System Implementation Guide

## Database Setup SQL

### 1. Create Permission Tables

```sql
-- ============================================
-- Permission System Database Setup
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  can_access BOOLEAN DEFAULT false,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, page_id)
);

-- Create default_permissions table
CREATE TABLE IF NOT EXISTS default_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  can_access BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, page_id)
);

-- Enable Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_permissions ENABLE ROW LEVEL SECURITY;
```

### 2. Create RLS Policies

```sql
-- Pages table policies
CREATE POLICY "Anyone can view active pages" ON pages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage pages" ON pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- User permissions policies
CREATE POLICY "Users can view own permissions" ON user_permissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all permissions" ON user_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Default permissions policies
CREATE POLICY "Anyone can view default permissions" ON default_permissions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage default permissions" ON default_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### 3. Populate Pages Table

```sql
-- Insert application pages
INSERT INTO pages (path, title, description, category, sort_order) VALUES
-- Dashboard
('/dashboard', 'Dashboard', 'Main dashboard overview', 'Dashboard', 1),
('/dashboard/analytics', 'Analytics', 'Campaign analytics and reports', 'Dashboard', 2),

-- Campaigns
('/campaigns', 'All Campaigns', 'View and manage all campaigns', 'Campaigns', 1),
('/campaigns/create', 'Create Campaign', 'Create new SMS campaign', 'Campaigns', 2),
('/campaigns/templates', 'Templates', 'Campaign templates', 'Campaigns', 3),

-- Contacts
('/contacts', 'All Contacts', 'View and manage contacts', 'Contacts', 1),
('/dashboard/customers/import', 'Import Contacts', 'Import contacts from files', 'Contacts', 2),

-- Automation
('/automation', 'Automation', 'Automation workflows', 'Automation', 1),
('/automation/workflows', 'Workflows', 'Manage automation workflows', 'Automation', 2),
('/automation/autoresponders', 'Autoresponders', 'Configure autoresponders', 'Automation', 3),

-- Settings
('/settings', 'Settings', 'Application settings', 'Settings', 1),
('/settings/general', 'General Settings', 'General application settings', 'Settings', 2),
('/settings/phone-numbers', 'Phone Numbers', 'Manage phone numbers', 'Settings', 3),
('/settings/api-keys', 'API Keys', 'Manage API keys', 'Settings', 4),
('/settings/integrations', 'Integrations', 'Third-party integrations', 'Settings', 5),

-- Admin
('/admin', 'Admin Panel', 'Admin dashboard', 'Admin', 1),
('/admin/users', 'User Management', 'Manage user accounts', 'Admin', 2),
('/admin/settings', 'System Settings', 'System configuration', 'Admin', 3),
('/admin/permissions', 'Permission Management', 'Manage user permissions', 'Admin', 4)
ON CONFLICT (path) DO NOTHING;
```

### 4. Set Default Permissions

```sql
-- Set default permissions for admin users (access to everything)
INSERT INTO default_permissions (role, page_id, can_access)
SELECT 'admin', id, true FROM pages
ON CONFLICT (role, page_id) DO NOTHING;

-- Set default permissions for regular users (limited access)
INSERT INTO default_permissions (role, page_id, can_access)
SELECT 'user', id, false FROM pages
ON CONFLICT (role, page_id) DO NOTHING;

-- Grant specific permissions to regular users
UPDATE default_permissions SET can_access = true
WHERE role = 'user' AND page_id IN (
  (SELECT id FROM pages WHERE path IN ('/dashboard', '/dashboard/analytics')),
  (SELECT id FROM pages WHERE category = 'Campaigns' AND path IN ('/campaigns', '/campaigns/templates')),
  (SELECT id FROM pages WHERE category = 'Contacts' AND path = '/contacts')
);
```

### 5. Create Permission Helper Functions

```sql
-- Function to check if user has permission to access a page
CREATE OR REPLACE FUNCTION user_has_page_access(
  user_uuid UUID,
  page_path TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  page_id_val UUID;
  explicit_permission BOOLEAN;
  default_permission BOOLEAN;
  user_role TEXT;
BEGIN
  -- Get page ID
  SELECT id INTO page_id_val FROM pages WHERE path = page_path AND is_active = true;
  
  IF page_id_val IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user is admin (admins have access to everything)
  SELECT role INTO user_role FROM user_profiles WHERE user_id = user_uuid;
  
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Check explicit user permission
  SELECT can_access INTO explicit_permission 
  FROM user_permissions 
  WHERE user_id = user_uuid AND page_id = page_id_val;
  
  IF explicit_permission IS NOT NULL THEN
    RETURN explicit_permission;
  END IF;
  
  -- Check default permission for user role
  SELECT can_access INTO default_permission
  FROM default_permissions
  WHERE role = user_role AND page_id = page_id_val;
  
  RETURN COALESCE(default_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all pages user can access
CREATE OR REPLACE FUNCTION get_user_accessible_pages(
  user_uuid UUID
) RETURNS TABLE (
  id UUID,
  path TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  icon TEXT,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.path, p.title, p.description, p.category, p.icon, p.sort_order
  FROM pages p
  WHERE p.is_active = true
  AND (
    -- Admin access
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = user_uuid AND role = 'admin')
    OR
    -- Explicit permission
    EXISTS (
      SELECT 1 FROM user_permissions up 
      WHERE up.user_id = user_uuid AND up.page_id = p.id AND up.can_access = true
    )
    OR
    -- Default permission
    EXISTS (
      SELECT 1 FROM user_profiles up 
      JOIN default_permissions dp ON up.role = dp.role 
      WHERE up.user_id = user_uuid AND dp.page_id = p.id AND dp.can_access = true
    )
  )
  ORDER BY p.category, p.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Backend Implementation

### 1. Permission Server Functions

Create `src/lib/permissions-server.ts`:

```typescript
import { createSupabaseAdminClient } from '@/lib/supabase/server-admin'
import { NextRequest } from 'next/server'

// Check if user has permission to access a page
export async function checkUserPagePermission(
  userId: string, 
  pagePath: string
): Promise<boolean> {
  const supabase = createSupabaseAdminClient()
  
  const { data, error } = await supabase
    .rpc('user_has_page_access', {
      user_uuid: userId,
      page_path: pagePath
    })
  
  if (error) {
    console.error('Permission check error:', error)
    return false
  }
  
  return data || false
}

// Get all pages user can access
export async function getUserAccessiblePages(userId: string) {
  const supabase = createSupabaseAdminClient()
  
  const { data, error } = await supabase
    .rpc('get_user_accessible_pages', {
      user_uuid: userId
    })
  
  if (error) {
    console.error('Get accessible pages error:', error)
    return []
  }
  
  return data || []
}

// Grant permission to user
export async function grantUserPermission(
  adminUserId: string,
  targetUserId: string,
  pageId: string,
  canAccess: boolean
) {
  const supabase = createSupabaseAdminClient()
  
  const { data, error } = await supabase
    .from('user_permissions')
    .upsert({
      user_id: targetUserId,
      page_id: pageId,
      can_access: canAccess,
      granted_by: adminUserId
    })
    .select()
    .single()
  
  if (error) {
    console.error('Grant permission error:', error)
    return null
  }
  
  return data
}

// Get user permissions with page details
export async function getUserPermissions(userId: string) {
  const supabase = createSupabaseAdminClient()
  
  const { data, error } = await supabase
    .from('user_permissions')
    .select(`
      *,
      pages (
        id,
        path,
        title,
        description,
        category,
        icon
      )
    `)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Get user permissions error:', error)
    return []
  }
  
  return data || []
}

// Get all pages for permission management
export async function getAllPages() {
  const supabase = createSupabaseAdminClient()
  
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Get all pages error:', error)
    return []
  }
  
  return data || []
}
```

### 2. Permission API Routes

Create `src/app/api/admin/permissions/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-server'
import { 
  getUserPermissions, 
  grantUserPermission, 
  getAllPages 
} from '@/lib/permissions-server'

// GET - Get permissions for a user or all pages
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const pages = searchParams.get('pages')

    if (pages === 'all') {
      // Get all pages for permission management
      const allPages = await getAllPages()
      return NextResponse.json({ data: allPages })
    }

    if (userId) {
      // Get permissions for specific user
      const permissions = await getUserPermissions(userId)
      return NextResponse.json({ data: permissions })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  } catch (error) {
    console.error('Permissions GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Grant/update permission
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const body = await request.json()
    const { userId, pageId, canAccess } = body

    if (!userId || !pageId || typeof canAccess !== 'boolean') {
      return NextResponse.json(
        { error: 'userId, pageId, and canAccess are required' },
        { status: 400 }
      )
    }

    const result = await grantUserPermission(
      authResult.userId,
      userId,
      pageId,
      canAccess
    )

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update permission' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: result, error: null })

  } catch (error) {
    console.error('Permissions POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 3. Permission Middleware

Create `src/lib/permission-middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { checkUserPagePermission } from '@/lib/permissions-server'
import { auth } from '@/lib/auth-server'

export async function requirePagePermission(
  request: NextRequest,
  pagePath: string
) {
  const authResult = await auth(request)
  
  if (!authResult.userId) {
    return {
      error: 'Authentication required',
      status: 401,
      redirectTo: '/login'
    }
  }

  // Admin users bypass permission checks
  if (authResult.role === 'admin') {
    return { userId: authResult.userId, user: authResult.user }
  }

  const hasPermission = await checkUserPagePermission(
    authResult.userId,
    pagePath
  )

  if (!hasPermission) {
    return {
      error: 'Access denied',
      status: 403,
      redirectTo: '/dashboard'
    }
  }

  return { userId: authResult.userId, user: authResult.user }
}
```

## Frontend Implementation

### 1. Permission Management Component

Create `src/components/admin/PermissionManagement.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Shield, Users, Lock, Unlock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Page {
  id: string
  path: string
  title: string
  description: string
  category: string
  icon?: string
}

interface UserPermission {
  id: string
  user_id: string
  page_id: string
  can_access: boolean
  pages: Page
}

interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name?: string
  role: string
}

export default function PermissionManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState('')

  const supabase = createClient()

  // Fetch users
  const fetchUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  // Fetch pages
  const fetchPages = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/admin/permissions?pages=all', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPages(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
    }
  }

  // Fetch user permissions
  const fetchUserPermissions = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/admin/permissions?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserPermissions(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error)
    }
  }

  // Update permission
  const updatePermission = async (pageId: string, canAccess: boolean) => {
    if (!selectedUser) return

    setUpdating(pageId)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: selectedUser,
          pageId,
          canAccess,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update permission')
        return
      }

      // Refresh permissions
      await fetchUserPermissions(selectedUser)
    } catch (error) {
      console.error('Error updating permission:', error)
      setError('Failed to update permission')
    } finally {
      setUpdating(null)
    }
  }

  // Group pages by category
  const pagesByCategory = pages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = []
    }
    acc[page.category].push(page)
    return acc
  }, {} as Record<string, Page[]>)

  // Check if page has permission
  const hasPermission = (pageId: string): boolean => {
    const permission = userPermissions.find(p => p.page_id === pageId)
    return permission ? permission.can_access : false
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchUsers(),
        fetchPages()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      fetchUserPermissions(selectedUser)
    } else {
      setUserPermissions([])
    }
  }, [selectedUser])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p>Loading permission management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permission Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="user-select">Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user to manage permissions" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter(user => user.role !== 'admin') // Don't show admin users
                    .map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUser && (
              <div className="text-sm text-muted-foreground">
                Managing permissions for: {
                  users.find(u => u.user_id === selectedUser)?.full_name || 
                  users.find(u => u.user_id === selectedUser)?.email
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <div className="space-y-4">
          {Object.entries(pagesByCategory).map(([category, categoryPages]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryPages.map((page) => (
                    <div key={page.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{page.title}</div>
                        <div className="text-sm text-muted-foreground">{page.path}</div>
                        {page.description && (
                          <div className="text-xs text-muted-foreground mt-1">{page.description}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {hasPermission(page.id) ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <Unlock className="h-3 w-3 mr-1" />
                            Access Granted
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Lock className="h-3 w-3 mr-1" />
                            No Access
                          </Badge>
                        )}
                        <Switch
                          checked={hasPermission(page.id)}
                          onCheckedChange={(checked) => updatePermission(page.id, checked)}
                          disabled={updating === page.id}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 2. Update Navigation System

Update `src/lib/role-based-navigation.ts`:

```typescript
import { getUserAccessiblePages } from '@/lib/permissions-server'

// Enhanced navigation filtering with permissions
export async function filterNavItemsByPermissions(
  items: NavItem[], 
  userRole: UserRole,
  userId: string
): Promise<NavItem[]> {
  // Admin users get everything
  if (userRole === 'admin') {
    return items
  }

  // Get user's accessible pages
  const accessiblePages = await getUserAccessiblePages(userId)
  const accessiblePaths = new Set(accessiblePages.map(page => page.path))

  return items.filter(item => {
    // Check if item URL is in accessible paths
    if (item.url && !accessiblePaths.has(item.url)) {
      return false
    }

    // If item has sub-items, recursively filter them
    if (item.items) {
      item.items = await filterNavItemsByPermissions(item.items, userRole, userId)
      // Only show parent item if it has visible sub-items
      return item.items.length > 0
    }

    return true
  })
}
```

### 3. Create Permission Management Page

Create `src/app/admin/permissions/page.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth-server'
import PermissionManagement from '@/components/admin/PermissionManagement'

export default async function PermissionsPage() {
  const authResult = await requireAdmin()
  
  if (authResult.error) {
    if (authResult.status === 401) {
      redirect('/login')
    } else if (authResult.status === 403) {
      redirect('/dashboard')
    }
  }

  return <PermissionManagement />
}
```

### 4. Update Admin Dashboard

Update `src/components/app-sidebar.tsx` to include permissions link:

```typescript
{
  title: "Admin",
  url: "/admin",
  icon: Shield,
  requiresRole: 'admin' as UserRole,
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
      title: "Permission Management",
      url: "/admin/permissions",
      icon: Shield,
    },
    {
      title: "System Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
},
```

## Testing & Implementation Steps

### 1. Database Setup
1. Run the SQL setup script in Supabase
2. Verify tables are created and populated
3. Test the permission functions

### 2. Backend Implementation
1. Create the permission server functions
2. Implement the API routes
3. Test the endpoints with admin authentication

### 3. Frontend Implementation
1. Create the permission management component
2. Update the navigation system
3. Create the permissions page
4. Update admin dashboard navigation

### 4. Integration Testing
1. Test permission assignment for different users
2. Verify navigation filtering works correctly
3. Test route protection middleware
4. Verify admin bypass functionality

### 5. Rollout Strategy
1. Start with a small group of test users
2. Monitor permission checks and performance
3. Gradually roll out to all users
4. Collect feedback and refine

This implementation provides a comprehensive permission system that integrates seamlessly with the existing DNwerks application while maintaining security and usability.