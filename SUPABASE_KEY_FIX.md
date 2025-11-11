# Supabase Key Fix Instructions

## Problem Identified
Your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is invalid or expired, but your `SUPABASE_SERVICE_ROLE_KEY` is working correctly.

## Quick Fix Steps

### 1. Get the Correct Anonymous Key

1. **Go to your Supabase project dashboard**: https://supabase.com/dashboard
2. **Select your project**: `gjaekyfjwhtxicppbnsf`
3. **Navigate to Settings**: Click the gear icon ⚙️ in the left sidebar
4. **Go to API**: Find "API" in the settings menu
5. **Copy the correct keys**:
   - **Project URL** (should be): `https://gjaekyfjwhtxicppbnsf.supabase.co`
   - **anon public** key: Copy this value
   - **service_role** key: This one is already working

### 2. Update Your Environment

Replace the `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your `.env.local` file with the correct "anon public" key from your Supabase dashboard.

### 3. Restart Your Development Server

After updating the key:
```bash
# Stop the current server (Ctrl+C)
# Restart it
npm run dev
```

### 4. Test the Fix

1. Run the validation script again to confirm:
   ```bash
   npx tsx scripts/validate-supabase-config.ts
   ```

2. If all checks pass, create test users:
   ```bash
   npx tsx scripts/create-test-users.ts
   ```

3. Test login at: http://localhost:3000/login

## What Happened?

The anonymous key is used for client-side operations (like login forms), while the service role key is used for server-side admin operations. Your service key was working, which is why the validation script could see users, but the client-side login was failing.

## Current Working Configuration
- ✅ URL: `https://gjaekyfjwhtxicppbnsf.supabase.co`
- ❌ Anon Key: Invalid/Expired
- ✅ Service Key: Working

## After Fix
Both keys should work, and you'll be able to:
- Login with test users
- Create new users
- Access the dashboard

## Test Credentials (after creating users)
- Admin: `admin@dnwerks.com` / `AdminPassword123!`
- User: `user1@dnwerks.com` / `UserPassword123!`
- User: `user2@dnwerks.com` / `UserPassword123!`

---

**Important**: Never share your service role key publicly - it's a secret key with admin privileges. The anonymous key is safe to use in client-side code.