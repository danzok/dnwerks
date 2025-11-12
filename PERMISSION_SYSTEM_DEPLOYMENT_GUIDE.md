# Permission System Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the permission system for DNwerks Admin Dashboard.

## Prerequisites
- Access to Supabase dashboard with admin privileges
- Node.js development environment
- Existing DNwerks application with admin system

## Deployment Steps

### Phase 1: Database Setup

#### 1.1 Run Database Setup Script
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the SQL script from `PERMISSION_SYSTEM_IMPLEMENTATION.md` (Database Setup section)
4. Execute the script in the following order:
   - Create permission tables
   - Create RLS policies
   - Populate pages table
   - Set default permissions
   - Create permission helper functions

#### 1.2 Verify Database Setup
Run these verification queries in SQL Editor:

```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pages', 'user_permissions', 'default_permissions');

-- Check pages were populated
SELECT COUNT(*) as page_count FROM pages WHERE is_active = true;

-- Check default permissions
SELECT role, COUNT(*) as permission_count FROM default_permissions GROUP BY role;

-- Test permission function
SELECT user_has_page_access('YOUR_ADMIN_USER_ID', '/dashboard');
```

### Phase 2: Backend Implementation

#### 2.1 Create Permission Server Functions
Create file: `src/lib/permissions-server.ts`
- Copy the implementation from the guide
- Ensure all imports are correct
- Test the functions individually

#### 2.2 Create Permission API Routes
Create file: `src/app/api/admin/permissions/route.ts`
- Copy the implementation from the guide
- Test endpoints with tools like Postman or curl

#### 2.3 Create Permission Middleware
Create file: `src/lib/permission-middleware.ts`
- Copy the implementation from the guide
- Ensure it integrates with existing auth system

#### 2.4 Test Backend Implementation
```bash
# Test API endpoints
curl -X GET "http://localhost:3000/api/admin/permissions?pages=all" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

curl -X GET "http://localhost:3000/api/admin/permissions?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Phase 3: Frontend Implementation

#### 3.1 Create Permission Management Component
Create file: `src/components/admin/PermissionManagement.tsx`
- Copy the implementation from the guide
- Ensure all UI components are imported correctly
- Test the component in isolation

#### 3.2 Create Permission Management Page
Create file: `src/app/admin/permissions/page.tsx`
- Copy the implementation from the guide
- Test the page renders correctly

#### 3.3 Update Navigation System
Update file: `src/lib/role-based-navigation.ts`
- Add the new permission filtering functions
- Ensure backward compatibility with existing system

#### 3.4 Update Admin Dashboard Navigation
Update file: `src/components/app-sidebar.tsx`
- Add the Permission Management link to admin section
- Test navigation updates

### Phase 4: Integration & Testing

#### 4.1 Update Existing Pages
Add permission checks to existing pages:

```typescript
// Example for campaigns page
import { requirePagePermission } from '@/lib/permission-middleware'

export default async function CampaignsPage() {
  const permissionResult = await requirePagePermission(request, '/campaigns')
  
  if (permissionResult.error) {
    redirect(permissionResult.redirectTo || '/dashboard')
  }
  
  // Rest of page implementation
}
```

#### 4.2 Test Permission System
Create test scenarios:

1. **Admin User Test**
   - Login as admin
   - Access all pages (should work)
   - Manage permissions for other users

2. **Regular User Test**
   - Login as regular user
   - Try accessing restricted pages (should be blocked)
   - Verify only allowed pages are visible in navigation

3. **Permission Assignment Test**
   - Admin grants specific permissions to user
   - User logs out and back in
   - Verify new permissions are respected

#### 4.3 Performance Testing
- Test permission check response times
- Verify database queries are optimized
- Check navigation rendering performance

### Phase 5: Rollout Strategy

#### 5.1 Gradual Rollout
1. **Stage 1**: Deploy to development environment
2. **Stage 2**: Test with small group of users
3. **Stage 3**: Monitor for issues and performance
4. **Stage 4**: Full production rollout

#### 5.2 Monitoring & Logging
Add monitoring for:
- Permission check failures
- Database query performance
- User access patterns
- Permission changes

#### 5.3 Backup & Rollback
- Create database backup before deployment
- Document rollback procedure
- Test rollback process

## Troubleshooting

### Common Issues

#### 1. Permission Check Failures
**Symptoms**: Users getting access denied errors
**Solutions**:
- Check RLS policies are correctly applied
- Verify permission functions exist and work
- Check user authentication tokens

#### 2. Navigation Not Updating
**Symptoms**: Navigation shows old items after permission changes
**Solutions**:
- Clear browser cache
- Check permission caching in frontend
- Verify navigation filtering logic

#### 3. Performance Issues
**Symptoms**: Slow page loads or navigation
**Solutions**:
- Optimize database queries
- Add caching for permission checks
- Review RLS policy complexity

#### 4. Database Errors
**Symptoms**: SQL errors or missing data
**Solutions**:
- Verify all tables were created
- Check foreign key constraints
- Review data types and constraints

### Debug Queries

```sql
-- Check user permissions
SELECT 
  up.user_id,
  up.can_access,
  p.path,
  p.title,
  up.email
FROM user_permissions up
JOIN pages p ON up.page_id = p.id
JOIN user_profiles up2 ON up.user_id = up2.user_id
WHERE up.user_id = 'USER_ID';

-- Check default permissions
SELECT 
  dp.role,
  dp.can_access,
  p.path,
  p.title
FROM default_permissions dp
JOIN pages p ON dp.page_id = p.id;

-- Test permission function
SELECT 
  user_has_page_access('USER_ID', '/campaigns') as can_access_campaigns,
  user_has_page_access('USER_ID', '/admin') as can_access_admin;
```

## Security Considerations

### 1. Database Security
- Verify RLS policies are working correctly
- Test with different user roles
- Check for privilege escalation vulnerabilities

### 2. API Security
- Validate all inputs
- Check authentication on all endpoints
- Rate limit permission management APIs

### 3. Frontend Security
- Don't rely solely on frontend permission checks
- Implement server-side validation
- Sanitize user inputs

## Maintenance

### Regular Tasks
1. **Monitor permission usage** - Review access logs
2. **Update page definitions** - Add new pages as they're created
3. **Audit permissions** - Review user access rights
4. **Performance optimization** - Monitor and optimize slow queries

### Backup Strategy
1. **Regular database backups** - Include permission tables
2. **Configuration backups** - Save permission settings
3. **Change logs** - Track permission modifications

## Future Enhancements

### Short-term
1. **Permission templates** - Predefined permission sets
2. **Bulk operations** - Grant/deny multiple permissions at once
3. **Permission inheritance** - Role-based permission inheritance

### Long-term
1. **Time-based permissions** - Temporary access grants
2. **Feature-level permissions** - Granular control within pages
3. **API endpoint permissions** - Control API access
4. **Audit trail** - Detailed permission change history

## Support

If you encounter issues during deployment:
1. Check the troubleshooting section above
2. Review the implementation guide
3. Test with the provided debug queries
4. Contact the development team with specific error details

Remember to test thoroughly in a development environment before deploying to production.