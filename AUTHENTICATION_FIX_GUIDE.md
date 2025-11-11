# Authentication Fix Guide

## Problem
You're experiencing a 401 Unauthorized error when trying to login with Supabase authentication.

## Root Cause
The 401 error typically occurs when:
1. Test users haven't been properly created in Supabase
2. Password hashing in the SQL script doesn't match Supabase's authentication system
3. Environment variables are not properly configured
4. The user_profiles table is missing or doesn't have the correct data

## Quick Fix Steps

### 1. Create Test Users Using the Admin API
Run the user creation script to properly set up test users:

```bash
npx tsx scripts/create-test-users.ts
```

This script will:
- Create users using Supabase's Admin API (proper password hashing)
- Create corresponding user profiles with correct roles
- Verify the users were created successfully

### 2. Test the Authentication
Use the debug page to verify everything is working:

1. Open http://localhost:3000/debug-auth
2. Click "Test Connection & Users"
3. Check the debug logs for any issues
4. If needed, click "Create Test User" to create a new test user

### 3. Try Login with Test Credentials
- **Admin**: admin@dnwerks.com / AdminPassword123!
- **User**: user1@dnwerks.com / UserPassword123!
- **User**: user2@dnwerks.com / UserPassword123!

### 4. Check Browser Console
Open the browser developer console and look for:
- 🔐 Login attempt logs
- ✅ Success messages
- ❌ Error details

## Manual Verification Steps

### Check Environment Variables
Ensure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Check Database Schema
Run this query in Supabase SQL Editor:
```sql
-- Check if user_profiles table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'user_profiles';

-- Check existing users
SELECT u.email, u.id as user_id, p.role, p.full_name
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE u.email LIKE '%@dnwerks.com';
```

### Check Supabase Auth Settings
1. Go to your Supabase project
2. Navigate to Authentication → Settings
3. Ensure "Enable email confirmations" is OFF (for testing)
4. Check that "Site URL" includes your local development URL

## Common Issues & Solutions

### Issue: "Invalid login credentials"
**Cause**: User doesn't exist or password is incorrect
**Solution**: Run the user creation script to ensure users are properly created

### Issue: "Supabase not configured"
**Cause**: Missing environment variables
**Solution**: Check your `.env.local` file has the correct Supabase URL and keys

### Issue: "Failed to fetch user profile"
**Cause**: User exists but profile is missing
**Solution**: The user creation script should handle this, but you can manually create profiles

### Issue: CORS errors
**Cause**: Supabase project doesn't allow your localhost
**Solution**: Add `http://localhost:3000` to your Supabase project's CORS settings

## Debug Tools Created

### 1. Debug Auth Page (`/debug-auth`)
- Tests Supabase connection
- Checks for existing users
- Attempts login with test credentials
- Creates test users if needed
- Provides detailed console logging

### 2. Enhanced Login Page
- Better error messages
- Detailed console logging
- Configuration validation
- Step-by-step authentication flow

### 3. User Creation Script
- Uses Supabase Admin API for proper user creation
- Handles existing users gracefully
- Creates user profiles with correct roles
- Provides verification output

## Next Steps After Fix

1. **Test all user roles**: Verify admin and regular users can login
2. **Test redirects**: Admin should go to /admin, users to /
3. **Test middleware**: Verify protected routes work correctly
4. **Test user management**: Admin should be able to create new users

## Production Considerations

1. **Email verification**: Enable email confirmations in production
2. **Password policies**: Implement stronger password requirements
3. **Rate limiting**: Configure rate limiting on auth endpoints
4. **Session management**: Configure appropriate session timeouts

---

If you're still experiencing issues after following these steps, check the browser console for detailed error messages and run the debug auth page to get more information about the specific problem.