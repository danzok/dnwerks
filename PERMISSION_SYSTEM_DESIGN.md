# Permission System Design for DNwerks Admin Dashboard

## Overview
This document outlines the design for a simple access-based permission system that allows admins to control which pages and features users can access within the DNwerks SMS Campaign Management application.

## Current System Analysis

### Existing Authentication
- **User Roles**: Currently supports 'admin' and 'user' roles
- **Database**: `user_profiles` table with basic role information
- **Navigation**: Role-based navigation filtering in `src/lib/role-based-navigation.ts`
- **Auth System**: Supabase authentication with server-side validation

### Current Pages & Features
Based on the application structure, we have these main sections:
- **Dashboard** (`/dashboard`) - Main overview
- **Campaigns** (`/campaigns`) - SMS campaign management
  - All Campaigns
  - Create Campaign
  - Templates
  - Scheduled
  - Reports
- **Contacts** (`/contacts`) - Contact management
  - All Contacts
  - Import Contacts
- **Automation** (`/automation`) - Workflow automation
  - Workflows
  - Autoresponders
- **Settings** (`/settings`) - Application settings
  - General
  - Phone Numbers
  - API Keys
  - Integrations
- **Admin** (`/admin`) - Admin-only functions
  - Admin Panel
  - User Management
  - System Settings

## Permission System Design

### 1. Database Schema

#### A. Pages Table
```sql
CREATE TABLE pages (
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
```

#### B. User Permissions Table
```sql
CREATE TABLE user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  can_access BOOLEAN DEFAULT false,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, page_id)
);
```

#### C. Default Permissions Table (Optional)
```sql
CREATE TABLE default_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  can_access BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, page_id)
);
```

### 2. Permission Logic

#### Access Control Flow
1. **Admin Users**: Always have access to all pages (bypass permission checks)
2. **Regular Users**: Access determined by explicit permissions in `user_permissions`
3. **Fallback**: If no explicit permission exists, check `default_permissions` for the user's role
4. **Default Deny**: If no permission found, deny access

#### Permission Priority
1. Explicit user permissions (highest priority)
2. Default role permissions (medium priority)
3. Default deny (lowest priority)

### 3. Implementation Strategy

#### A. Database Setup
1. Create the new tables
2. Populate pages table with existing application routes
3. Set up default permissions for existing roles
4. Create RLS policies for security

#### B. Backend Changes
1. Update auth server functions to check permissions
2. Create API routes for permission management
3. Implement middleware for route protection
4. Update existing API endpoints to respect permissions

#### C. Frontend Changes
1. Update navigation component to check permissions
2. Create permission management interface in admin dashboard
3. Add permission indicators to user management
4. Update existing pages to verify access

### 4. Page Definitions

Based on the current application structure, here are the pages to define:

```sql
-- Insert pages
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
('/admin/permissions', 'Permission Management', 'Manage user permissions', 'Admin', 4);
```

### 5. Default Permission Strategy

#### Admin Users
- Access to all pages by default
- Can manage permissions for other users

#### Regular Users (Default)
- Dashboard: Access allowed
- Campaigns: View only (no create/edit)
- Contacts: View only
- Automation: No access
- Settings: No access
- Admin: No access

### 6. Permission Management Interface

#### Features
1. **User Selection**: Choose user to manage permissions for
2. **Page Grid**: Visual grid of all pages with toggle switches
3. **Bulk Operations**: Grant/deny access by category
4. **Permission Templates**: Save and apply permission sets
5. **Audit Log**: Track permission changes

#### UI Components
1. Permission toggle matrix
2. Category-based permission groups
3. User permission summary
4. Quick permission templates

### 7. Security Considerations

#### Database Security
1. RLS policies on all permission tables
2. Admin-only access to permission management
3. Audit trail for permission changes

#### API Security
1. Server-side permission validation
2. Admin authentication for permission changes
3. Input validation and sanitization

#### Frontend Security
1. Client-side permission checks for UI
2. Server-side verification for all actions
3. Proper error handling for unauthorized access

### 8. Implementation Phases

#### Phase 1: Database & Backend
1. Create database tables
2. Set up RLS policies
3. Create permission API routes
4. Update auth server functions

#### Phase 2: Admin Interface
1. Create permission management component
2. Add to admin dashboard
3. Implement user permission assignment
4. Add permission indicators to user management

#### Phase 3: Integration
1. Update navigation system
2. Implement route protection middleware
3. Update existing pages to check permissions
4. Add permission indicators throughout UI

#### Phase 4: Testing & Refinement
1. Test with different user roles
2. Verify permission inheritance
3. Test edge cases and error scenarios
4. Performance optimization

### 9. Migration Strategy

#### Existing Users
1. All existing admin users keep full access
2. Existing regular users get default permissions
3. Gradual rollout with ability to override

#### Backward Compatibility
1. Maintain existing role-based system as fallback
2. Gradual migration to permission-based system
3. Option to switch between systems during transition

### 10. Future Enhancements

#### Advanced Features
1. Time-based permissions (temporary access)
2. IP-based restrictions
3. Feature-level permissions (within pages)
4. Permission groups and inheritance
5. API endpoint permissions

#### Analytics & Monitoring
1. Permission usage analytics
2. Access attempt logging
3. Permission audit reports
4. Security alerts for unusual access patterns

This design provides a flexible, secure, and scalable permission system that integrates seamlessly with the existing DNwerks application while allowing for future enhancements.