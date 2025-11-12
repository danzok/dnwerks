-- ============================================
-- Create Users Using Supabase Auth Functions
-- This uses Supabase's built-in auth.signup() function
-- ============================================

-- Enable the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- CREATE ADMIN USER
-- ============================================

-- Create admin user
SELECT auth.signup(
  email := 'admin@dnwerks.com',
  password := 'AdminPassword123!',
  email_confirmed := true,
  data := '{"name": "Admin User"}'
);

-- Get the admin user ID and create profile
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@dnwerks.com'
  LIMIT 1;
  
  INSERT INTO public.user_profiles (user_id, email, full_name, role)
  VALUES (
    admin_user_id,
    'admin@dnwerks.com',
    'Admin User',
    'admin'
  )
  ON CONFLICT (user_id) DO NOTHING;
END $$;

-- ============================================
-- CREATE REGULAR USER 1
-- ============================================

-- Create user1
SELECT auth.signup(
  email := 'user1@dnwerks.com',
  password := 'UserPassword123!',
  email_confirmed := true,
  data := '{"name": "Test User One"}'
);

-- Create user1 profile
DO $$
DECLARE
  user1_id UUID;
BEGIN
  SELECT id INTO user1_id 
  FROM auth.users 
  WHERE email = 'user1@dnwerks.com'
  LIMIT 1;
  
  INSERT INTO public.user_profiles (user_id, email, full_name, role)
  VALUES (
    user1_id,
    'user1@dnwerks.com',
    'Test User One',
    'user'
  )
  ON CONFLICT (user_id) DO NOTHING;
END $$;

-- ============================================
-- CREATE REGULAR USER 2
-- ============================================

-- Create user2
SELECT auth.signup(
  email := 'user2@dnwerks.com',
  password := 'UserPassword123!',
  email_confirmed := true,
  data := '{"name": "Test User Two"}'
);

-- Create user2 profile
DO $$
DECLARE
  user2_id UUID;
BEGIN
  SELECT id INTO user2_id 
  FROM auth.users 
  WHERE email = 'user2@dnwerks.com'
  LIMIT 1;
  
  INSERT INTO public.user_profiles (user_id, email, full_name, role)
  VALUES (
    user2_id,
    'user2@dnwerks.com',
    'Test User Two',
    'user'
  )
  ON CONFLICT (user_id) DO NOTHING;
END $$;

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
-- ALTERNATIVE: Manual User Creation
-- ============================================

/*
If the above doesn't work, try this manual approach:

1. Go to Authentication → Users in your Supabase dashboard
2. Click "Add user" for each:
   - Email: admin@dnwerks.com, Password: AdminPassword123!
   - Email: user1@dnwerks.com, Password: UserPassword123!
   - Email: user2@dnwerks.com, Password: UserPassword123!
3. For each user, click "Confirm email manually"
4. Then run this SQL to create profiles:

INSERT INTO public.user_profiles (user_id, email, full_name, role)
SELECT 
  id,
  email,
  CASE 
    WHEN email = 'admin@dnwerks.com' THEN 'Admin User'
    WHEN email = 'user1@dnwerks.com' THEN 'Test User One'
    WHEN email = 'user2@dnwerks.com' THEN 'Test User Two'
  END,
  CASE 
    WHEN email = 'admin@dnwerks.com' THEN 'admin'
    ELSE 'user'
  END
FROM auth.users 
WHERE email LIKE '%@dnwerks.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_profiles WHERE user_id = auth.users.id
);
*/

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

If SQL approach doesn't work, use the manual approach described in the comments.
*/