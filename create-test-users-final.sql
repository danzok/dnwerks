-- ============================================
-- Create Test Users - Final Script
-- Run this AFTER creating the user_profiles table
-- ============================================

-- ============================================
-- CREATE ADMIN USER
-- ============================================

-- Create admin user using Supabase auth
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
  gen_random_uuid(),
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
  '{"name": "Admin User"}',
  false,
  '',
  '',
  '',
  ''
);

-- Create admin profile
INSERT INTO public.user_profiles (user_id, email, full_name, role)
SELECT 
  id,
  email,
  'Admin User',
  'admin'
FROM auth.users 
WHERE email = 'admin@dnwerks.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_profiles WHERE user_id = auth.users.id
);

-- ============================================
-- CREATE REGULAR USER 1
-- ============================================

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
  gen_random_uuid(),
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
  '{"name": "Test User One"}',
  false,
  '',
  '',
  '',
  ''
);

-- Create user1 profile
INSERT INTO public.user_profiles (user_id, email, full_name, role)
SELECT 
  id,
  email,
  'Test User One',
  'user'
FROM auth.users 
WHERE email = 'user1@dnwerks.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_profiles WHERE user_id = auth.users.id
);

-- ============================================
-- CREATE REGULAR USER 2
-- ============================================

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
  gen_random_uuid(),
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
  '{"name": "Test User Two"}',
  false,
  '',
  '',
  '',
  ''
);

-- Create user2 profile
INSERT INTO public.user_profiles (user_id, email, full_name, role)
SELECT 
  id,
  email,
  'Test User Two',
  'user'
FROM auth.users 
WHERE email = 'user2@dnwerks.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_profiles WHERE user_id = auth.users.id
);

-- ============================================
-- VERIFICATION
-- ============================================

-- Show created users
SELECT 
  u.email,
  u.created_at as user_created,
  p.role,
  p.full_name,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
WHERE u.email LIKE '%@dnwerks.com'
ORDER BY p.role DESC, u.email;

-- ============================================
-- INSTRUCTIONS
-- ============================================

/*
TEST CREDENTIALS AFTER RUNNING:
- Admin: admin@dnwerks.com / AdminPassword123!
- User1: user1@dnwerks.com / UserPassword123!
- User2: user2@dnwerks.com / UserPassword123!

NEXT STEPS:
1. Go to http://localhost:3000/login
2. Try logging in with admin credentials first
3. Admin should redirect to /admin
4. Try regular user credentials
5. Regular users should redirect to /

If login still fails, check browser console for detailed error messages.
*/