# Login Troubleshooting Guide

## Current Issue
You're still getting "Invalid login credentials" error even after creating user creation scripts.

## 🔍 Diagnosis Steps

### 1. Verify User Was Actually Created
Run this verification query in your Supabase SQL Editor:

```sql
SELECT 
  u.email,
  u.created_at as user_created,
  u.email_confirmed_at,
  p.role,
  p.full_name,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
WHERE u.email = 'danisbermainaja@gmail.com';
```

**Expected Result**: Should show 1 row with the user and profile
**If no results**: User wasn't created successfully

### 2. Check If Script Was Run
Look for these console outputs when you ran the Node.js script:
- ✅ Created user: [user-id]
- ✅ Profile created successfully
- ✅ User profile verified

**If you don't see these**: The script didn't complete successfully

### 3. Manual User Creation (Most Reliable)
If scripts aren't working, create the user manually:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select Project**: `gjaekyfjwhtxicppbnsf`
3. **Navigate to**: Authentication → Users
4. **Click "Add user"**
5. **Enter details**:
   - Email: `danisbermainaja@gmail.com`
   - Password: `AdminPassword123!`
6. **Click "Save"**
7. **Confirm email**: Click the three dots next to the user → "Confirm email manually"
8. **Create profile**: Run this SQL:

```sql
INSERT INTO public.user_profiles (user_id, email, full_name, role)
SELECT 
  id,
  email,
  'Danis Bermain',
  'admin'
FROM auth.users 
WHERE email = 'danisbermainaja@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_profiles WHERE user_id = auth.users.id
);
```

## 🛠️ Quick Fix Steps

### Option 1: Run the Node.js Script
```bash
node scripts/create-admin-danis.js
```

### Option 2: Manual Creation (Recommended)
1. Create user manually in Supabase dashboard
2. Run the profile creation SQL above
3. Test login immediately

### Option 3: Use Debug Page
1. Go to http://localhost:3000/debug-auth
2. Click "Test Connection & Users"
3. Check what the debug output shows

## 🔧 Common Issues & Solutions

### Issue: "User already exists"
**Solution**: The script handles this, but check if the profile exists

### Issue: "Profile creation failed"
**Solution**: Run the manual profile creation SQL

### Issue: "Invalid login credentials" persists
**Solution**: 
1. Check if email was confirmed in auth.users table
2. Verify password matches exactly: `AdminPassword123!`
3. Ensure user profile exists with admin role

## 📋 Final Test Credentials
- **Email**: danisbermainaja@gmail.com
- **Password**: AdminPassword123!
- **Role**: admin
- **Expected Redirect**: /admin

## 🎯 Success Indicators
You know it's working when:
- ✅ Login succeeds without errors
- ✅ Browser redirects to /admin
- ✅ Admin dashboard loads
- ✅ No console errors

## 🚨 If Still Failing
1. Check browser console for detailed error messages
2. Verify Supabase project URL is correct
3. Ensure you're using the correct project
4. Try clearing browser cache and cookies

The manual approach is the most reliable - use it if automated scripts continue to fail.