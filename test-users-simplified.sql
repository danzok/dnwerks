-- ============================================
-- DNwerks SMS Dashboard - Simplified Test Users Setup Script
-- ============================================
-- Run this script in your Supabase SQL Editor
-- This will create test users for the simplified authentication system

-- Clear any existing test users (optional - uncomment if needed)
-- DELETE FROM user_profiles WHERE email LIKE '%@dnwerks.com';
-- DELETE FROM auth.users WHERE email LIKE '%@dnwerks.com';

-- ============================================
-- ADMIN USER
-- ============================================

-- Create admin user in auth.users
-- Password: AdminPassword123!
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change_token_new,
  email_change,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'admin@dnwerks.com',
  crypt('AdminPassword123!', gen_salt('bf')),
  NOW(),
  '',
  NULL,
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin User", "avatar_url": ""}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Create admin user profile
INSERT INTO user_profiles (
  id,
  user_id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'admin@dnwerks.com',
  'Admin User',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- REGULAR USERS
-- ============================================

-- Regular User 1 - user1@dnwerks.com
-- Password: UserPassword123!
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change_token_new,
  email_change,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated',
  'authenticated',
  'user1@dnwerks.com',
  crypt('UserPassword123!', gen_salt('bf')),
  NOW(),
  '',
  NULL,
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Test User One", "avatar_url": ""}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (
  id,
  user_id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222',
  'user1@dnwerks.com',
  'Test User One',
  'user',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Regular User 2 - user2@dnwerks.com
-- Password: UserPassword123!
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change_token_new,
  email_change,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated',
  'authenticated',
  'user2@dnwerks.com',
  crypt('UserPassword123!', gen_salt('bf')),
  NOW(),
  '',
  NULL,
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Test User Two", "avatar_url": ""}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (
  id,
  user_id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '33333333-3333-3333-3333-333333333333',
  'user2@dnwerks.com',
  'Test User Two',
  'user',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify users were created
SELECT
  u.email,
  u.created_at as user_created,
  p.role,
  p.created_at as profile_created
FROM auth.users u
JOIN user_profiles p ON u.id = p.user_id
WHERE u.email LIKE '%@dnwerks.com'
ORDER BY p.role, u.email;

-- ============================================
-- LOGIN INSTRUCTIONS
-- ============================================

/*
SIMPLIFIED TEST LOGIN CREDENTIALS:

🔑 ADMIN USER:
   Email: admin@dnwerks.com
   Password: AdminPassword123!
   - Should see Admin menu in sidebar
   - Should access /admin successfully
   - Can create new users

👤 REGULAR USERS:
   Email: user1@dnwerks.com
   Password: UserPassword123!
   Email: user2@dnwerks.com
   Password: UserPassword123!
   - Should NOT see Admin menu in sidebar
   - Should be redirected from /admin to /dashboard

TESTING URLS:
- Login page: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard
- Admin panel: http://localhost:3000/admin

STEPS TO TEST:
1. Run this SQL script in Supabase
2. Open http://localhost:3000/login
3. Test with admin credentials first
4. Test with regular user credentials
5. Verify admin menu hiding functionality
6. Test user creation from admin panel

NEW AUTHENTICATION FLOW:
1. Admin creates user → User receives email with password from admin
2. User logs in → User logs in with email/password
3. Admin manages users → Admin can view, edit, and delete users
*/