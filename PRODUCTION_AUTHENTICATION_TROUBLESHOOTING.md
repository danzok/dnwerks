# Production Authentication Troubleshooting Guide

## 🔍 Issue Analysis

Based on your console logs, the authentication process is working correctly up to the redirect:
- ✅ Login successful
- ✅ Profile loaded
- 👑 Redirecting to admin dashboard...
- 🎉 Login complete, redirecting...

However, you cannot access the dashboard after deployment. This indicates a **session/cookie handling issue in production**.

## 🛠️ Immediate Fixes Applied

### 1. Enhanced Cookie Handling in `src/lib/auth-server.ts`
- Added support for multiple cookie naming patterns
- Improved token extraction from cookies
- Better fallback mechanisms for production

### 2. Enhanced Middleware in `src/middleware.ts`
- Added debug logging for production
- Better error handling and redirect logic
- Improved authentication flow tracking

## 🚀 Deployment Checklist

### Step 1: Verify Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to **Settings → Environment Variables**
4. Ensure ALL these variables are set:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://gjaekyfjwhtxicppbnsf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# Optional but recommended
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

### Step 2: Redeploy After Environment Changes

After setting environment variables:
1. Go to your project's **Deployments** tab
2. Click **Redeploy** or push a new commit
3. Wait for deployment to complete

### Step 3: Test Authentication Flow

Run the test script to verify authentication:

```bash
# Update the production URL in test-auth-production.js
# Then run:
node test-auth-production.js
```

### Step 4: Check Vercel Function Logs

1. Go to your Vercel dashboard
2. Select your project
3. Click on the **Functions** tab
4. Look for any authentication-related errors

## 🔧 Common Issues and Solutions

### Issue 1: "No authentication token found" in Production

**Cause**: Cookie names differ between development and production.

**Solution**: The updated `auth-server.ts` now handles multiple cookie patterns. Ensure you've redeployed with the latest changes.

### Issue 2: Environment Variables Not Loading

**Cause**: Variables not properly set in Vercel or missing prefixes.

**Solution**: 
- Double-check variable names in Vercel dashboard
- Ensure `NEXT_PUBLIC_` prefix for client-side variables
- Redeploy after changes

### Issue 3: Supabase RLS Policies Blocking Access

**Cause**: Row Level Security policies not properly configured.

**Solution**: Run this SQL in your Supabase SQL Editor:

```sql
-- Check if RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- If missing, create admin policy
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin' OR
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### Issue 4: CORS Issues with Supabase

**Cause**: Supabase project not configured for your production domain.

**Solution**: 
1. Go to Supabase dashboard
2. Navigate to **Settings → API**
3. Add your Vercel domain to **Additional Redirect URLs**
4. Add to **Allowed Hostnames** if needed

## 🧪 Advanced Debugging

### Enable Debug Logging

Add this to your Vercel environment variables:
```bash
DEBUG=supabase:*
```

### Check Browser Cookies

1. Open browser developer tools
2. Go to **Application → Cookies**
3. Look for Supabase-related cookies:
   - `sb-access-token`
   - `sb-refresh-token`
   - `supabase.auth.token`

### Test API Directly

```bash
# Test the admin API endpoint
curl -X GET https://your-vercel-app.vercel.app/api/admin/users \
  -H "Content-Type: application/json"
```

## 📋 Final Verification Steps

1. **Clear browser cache and cookies**
2. **Try login in incognito/private mode**
3. **Check browser console for errors**
4. **Verify network requests in browser dev tools**
5. **Test with different browsers**

## 🆘 If Still Not Working

### 1. Create a Minimal Test Route

Create `src/app/test-auth/page.tsx`:

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function TestAuth() {
  const [session, setSession] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      console.log('Session:', session)
    })
  }, [])

  return (
    <div>
      <h1>Auth Test</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}
```

### 2. Check Supabase Auth Configuration

Ensure your Supabase project has:
- Site URL set to your Vercel domain
- Redirect URLs configured
- Auth providers enabled

### 3. Verify Database Schema

Run this in Supabase SQL Editor:

```sql
-- Check if admin user exists
SELECT * FROM user_profiles WHERE email = 'danisbermainaja@gmail.com';

-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## 🎯 Success Indicators

Your authentication is working when:
- ✅ Login completes without errors
- ✅ Browser shows Supabase cookies
- ✅ Redirect to `/admin` works
- ✅ Admin dashboard loads
- ✅ API endpoints return data
- ✅ No 401/403 errors in console

## 📞 Support Resources

- [Vercel Deployment Logs](https://vercel.com/docs/concepts/projects/overview#logs)
- [Supabase Auth Debugging](https://supabase.com/docs/guides/auth/auth-debugging)
- [Next.js Middleware Debugging](https://nextjs.org/docs/advanced-features/middleware)

---

**Remember**: After making any changes to environment variables or code, you must redeploy your Vercel application for changes to take effect.