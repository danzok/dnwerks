-- ============================================
-- Simple Test Users Creation Script
-- Run this in your Supabase SQL Editor
-- ============================================

-- First, let's check if the user_profiles table exists
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to update their own profile  
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for authenticated users to insert their profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CREATE ADMIN USER
-- ============================================

-- Insert admin user using Supabase's built-in function
SELECT auth.signup(
  email := 'admin@dnwerks.com',
  password := 'AdminPassword123!',
  email_confirmed := true
);

-- Get the admin user ID and create profile
INSERT INTO user_profiles (user_id, email, full_name, role)
SELECT 
  id,
  email,
  'Admin User' as full_name,
  'admin' as role
FROM auth.users 
WHERE email = 'admin@dnwerks.com'
AND NOT EXISTS (
  SELECT 1 FROM user_profiles WHERE user_id = auth.users.id
);

-- ============================================
-- CREATE REGULAR USERS
-- ============================================

-- User 1
SELECT auth.signup(
  email := 'user1@dnwerks.com',
  password := 'UserPassword123!',
  email_confirmed := true
);

INSERT INTO user_profiles (user_id, email, full_name, role)
SELECT 
  id,
  email,
  'Test User One' as full_name,
  'user' as role
FROM auth.users 
WHERE email = 'user1@dnwerks.com'
AND NOT EXISTS (
  SELECT 1 FROM user_profiles WHERE user_id = auth.users.id
);

-- User 2
SELECT auth.signup(
  email := 'user2@dnwerks.com',
  password := 'UserPassword123!',
  email_confirmed := true
);

INSERT INTO user_profiles (user_id, email, full_name, role)
SELECT 
  id,
  email,
  'Test User Two' as full_name,
  'user' as role
FROM auth.users 
WHERE email = 'user2@dnwerks.com'
AND NOT EXISTS (
  SELECT 1 FROM user_profiles WHERE user_id = auth.users.id
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
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE u.email LIKE '%@dnwerks.com'
ORDER BY p.role DESC, u.email;

-- ============================================
-- INSTRUCTIONS
-- ============================================

/*
HOW TO USE THIS SCRIPT:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste this entire script
4. Click "Run" to execute
5. Check the results at the bottom

TEST CREDENTIALS AFTER RUNNING:
- Admin: admin@dnwerks.com / AdminPassword123!
- User1: user1@dnwerks.com / UserPassword123!
- User2: user2@dnwerks.com / UserPassword123!

AFTER RUNNING THIS SCRIPT:
1. Go to http://localhost:3000/login
2. Try logging in with the test credentials
3. Admin should redirect to /admin
4. Regular users should redirect to /

TROUBLESHOOTING:
- If you get "duplicate key" errors, users already exist
- If you get "relation does not exist", run the table creation first
- If login still fails, check the browser console for detailed errors
*/