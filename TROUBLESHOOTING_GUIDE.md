# 🔧 Admin System Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Issue: "Profile fetch failing" or "No profile found"

**Symptoms:**
- Login successful but can't access admin
- Console shows profile fetch errors
- Redirected to dashboard instead of admin

**Root Causes:**
1. RLS policies blocking profile queries
2. Profile doesn't exist in database
3. Auth user ID mismatch

**Solutions:**

#### 1. Run Database Setup Script
```sql
-- Execute in Supabase SQL Editor
-- Copy contents from: supabase-complete-setup.sql
```

#### 2. Verify Trigger is Working
```sql
-- Check if trigger exists and is active
SELECT 
  tgname,
  tgenabled,
  tgrelid::regclass
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Check recent profile creations
SELECT 
  user_id,
  email,
  created_at
FROM user_profiles 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

#### 3. Test RLS Policies
```sql
-- Test if current user can access their profile
SELECT 
  user_id,
  email,
  role
FROM user_profiles 
WHERE user_id = auth.uid();

-- Should return your profile data
```

#### 4. Manual Profile Creation (if needed)
```sql
-- Create profiles for existing auth users without profiles
INSERT INTO user_profiles (user_id, email, full_name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  'user'
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
```

### Issue: "403 Forbidden on Admin APIs"

**Symptoms:**
- Can't create users
- Admin endpoints return 403
- Console shows authorization errors

**Root Causes:**
1. Edge function not deployed
2. Admin role not properly set
3. Service role key missing

**Solutions:**

#### 1. Deploy Edge Function
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Deploy function
supabase functions deploy create-user

# Verify deployment
supabase functions list
```

#### 2. Check Admin Role
```sql
-- Verify admin user exists
SELECT 
  user_id,
  email,
  role,
  created_at
FROM user_profiles 
WHERE email = 'danisbermainaja@gmail.com';

-- Should show role = 'admin'
```

#### 3. Test Edge Function Directly
```bash
# Test edge function
curl -X POST https://your-project.supabase.co/functions/v1/create-user \
  -H "Authorization: Bearer YOUR_ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User","role":"user"}'

# Should return success response
```

### Issue: "Duplicate key constraint violations"

**Symptoms:**
- User creation fails with duplicate key error
- Profile creation conflicts
- Inconsistent user state

**Root Causes:**
1. Trigger creating duplicate profiles
2. Manual profile creation conflicts
3. Race conditions in user creation

**Solutions:**

#### 1. Fix Trigger Logic
```sql
-- Update trigger to handle conflicts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = NEW.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 2. Add Unique Constraints
```sql
-- Ensure email uniqueness if needed
ALTER TABLE user_profiles ADD CONSTRAINT unique_email UNIQUE (email);

-- Or allow duplicates with different handling
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS unique_email;
```

### Issue: "Authentication warnings in console"

**Symptoms:**
- "Using user object from getSession() is insecure"
- Auth state change warnings
- Session-based auth warnings

**Root Causes:**
1. Using getSession() instead of getUser()
2. Client-side auth verification
3. Missing auth state checks

**Solutions:**

#### 1. Update Auth Hook (Already Fixed)
The `useUser` hook now uses `getUser()` for secure authentication.

#### 2. Verify Auth Implementation
```typescript
// Check that auth is using getUser()
const { data: { user } } = await supabase.auth.getUser();
// ✅ Secure - validates with server

// Instead of
const { data: { session } } = await supabase.auth.getSession();
// ❌ Insecure - only checks local storage
```

### Issue: "Edge function not found"

**Symptoms:**
- 404 errors on function calls
- User creation fails
- API timeouts

**Root Causes:**
1. Function not deployed
2. Incorrect function URL
3. Deployment errors

**Solutions:**

#### 1. Check Function Status
```bash
# List deployed functions
supabase functions list

# Check function logs
supabase functions logs create-user

# Check specific function
supabase functions serve create-user --no-verify-jwt
```

#### 2. Redeploy Function
```bash
# Delete and redeploy
supabase functions delete create-user
supabase functions deploy create-user

# Verify with test
curl -X POST https://your-project.supabase.co/functions/v1/create-user \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

## 🔍 Debugging Steps

### 1. Check Browser Console
```javascript
// Open browser dev tools and check for:
// 1. Auth errors
// 2. API response errors  
// 3. Network request failures
// 4. JavaScript errors
```

### 2. Check Supabase Logs
```bash
# Real-time logs
supabase logs --follow

# Function-specific logs
supabase functions logs create-user

# Database logs
supabase db logs --follow
```

### 3. Test Database Connection
```sql
-- Test basic connectivity
SELECT 1 as test_connection;

-- Test auth table access
SELECT COUNT(*) FROM auth.users;

-- Test profiles table access
SELECT COUNT(*) FROM user_profiles;
```

### 4. Verify Environment Variables
```bash
# Check .env.local
cat .env.local | grep SUPABASE

# Test in application
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Service Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
```

## 🚀 Quick Fix Checklist

### Database Setup ✅
- [ ] Ran supabase-complete-setup.sql
- [ ] Verified trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created'`
- [ ] Verified RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'user_profiles'`
- [ ] Tested profile creation: `INSERT INTO user_profiles ...`

### Edge Function ✅  
- [ ] Deployed with: `supabase functions deploy create-user`
- [ ] Verified deployment: `supabase functions list`
- [ ] Tested function: `curl -X POST .../functions/v1/create-user`
- [ ] Checked logs: `supabase functions logs create-user`

### Frontend ✅
- [ ] No auth warnings in console
- [ ] Admin can access `/admin`
- [ ] User creation works without errors
- [ ] User list displays correctly
- [ ] Search functionality works

## 📞 Emergency Fallbacks

### If All Else Fails: Manual Admin Setup

```sql
-- 1. Create admin user manually
INSERT INTO auth.users (id, email, created_at)
VALUES (
  gen_random_uuid(),
  'admin@yourdomain.com',
  NOW()
);

-- 2. Create profile manually  
INSERT INTO user_profiles (user_id, email, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@yourdomain.com'),
  'admin@yourdomain.com',
  'Admin User',
  'admin'
);

-- 3. Set admin password (in Supabase dashboard)
-- Go to Authentication > Users > Reset Password
```

### If Edge Functions Fail: Server-Side Creation

```typescript
// Temporary fallback in API route
// src/app/api/admin/users/route.ts

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { email, password, full_name, role } = await request.json();

  // Direct admin creation (temporary fallback)
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name || '' }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Profile creation with conflict handling
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .upsert({
      user_id: data.user.id,
      email,
      full_name: full_name || null,
      role: role || 'user'
    })
    .select()
    .single();

  if (profileError) {
    // Cleanup auth user if profile fails
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    user: profile,
    message: 'User created successfully'
  });
}
```

## 🎯 Success Verification

Your admin system is working when:
- ✅ Login redirects admin users to `/admin`
- ✅ User creation succeeds without errors
- ✅ User list displays with correct data
- ✅ No 403 errors in console
- ✅ Search functionality works
- ✅ Statistics update correctly
- ✅ Edge function responds properly

Follow this guide step by step to resolve any issues! 🚀