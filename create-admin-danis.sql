-- ============================================
-- Create Admin User - danisbermainaja@gmail.com
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create admin user with your preferred email
SELECT auth.signup(
  email := 'danisbermainaja@gmail.com',
  password := 'AdminPassword123!',
  email_confirmed := true,
  data := '{"name": "Danis Bermain"}'
);

-- Create admin profile
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'danisbermainaja@gmail.com'
  LIMIT 1;
  
  INSERT INTO public.user_profiles (user_id, email, full_name, role)
  VALUES (
    admin_user_id,
    'danisbermainaja@gmail.com',
    'Danis Bermain',
    'admin'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Show the created admin user
SELECT 
  u.email,
  u.created_at as user_created,
  p.role,
  p.full_name,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
WHERE u.email = 'danisbermainaja@gmail.com';

-- ============================================
-- INSTRUCTIONS
-- ============================================

/*
ADMIN CREDENTIALS AFTER RUNNING:
- Email: danisbermainaja@gmail.com
- Password: AdminPassword123!

NEXT STEPS:
1. Go to http://localhost:3000/login
2. Login with: danisbermainaja@gmail.com / AdminPassword123!
3. Should redirect to /admin dashboard

ALTERNATIVE MANUAL APPROACH:
If SQL doesn't work, create manually in Supabase dashboard:
1. Go to Authentication → Users
2. Click "Add user"
3. Email: danisbermainaja@gmail.com, Password: AdminPassword123!
4. Click "Confirm email manually"
5. Run the profile creation SQL above
*/