-- ============================================
-- Fix Contacts Not Loading Issue
-- ============================================
-- This script ensures contacts can be loaded (SELECT operations work)
-- Run this in your Supabase SQL Editor

-- 1. Check current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'customers';

-- 2. Ensure RLS is enabled but policies allow SELECT
-- First, check if RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'customers';

-- 3. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can manage own customers" ON customers;
DROP POLICY IF EXISTS "Users can access own customers" ON customers;
DROP POLICY IF EXISTS "Users can view own customers" ON customers;
DROP POLICY IF EXISTS "Users can update own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON customers;

-- 4. Create comprehensive policy that allows ALL operations
-- This policy uses auth.uid()::text to match user_id (which is TEXT)
CREATE POLICY "Users can manage own customers" 
ON customers 
FOR ALL 
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- 5. Alternative: If auth.uid() returns UUID and user_id is TEXT, we might need to cast
-- Try this if the above doesn't work:
-- CREATE POLICY "Users can manage own customers" 
-- ON customers 
-- FOR ALL 
-- USING (auth.uid()::text = user_id::text)
-- WITH CHECK (auth.uid()::text = user_id::text);

-- 6. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 7. Verify the policy was created correctly
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'customers';

-- 8. Test query to verify a user can see their own customers
-- Replace 'YOUR_USER_ID' with an actual user_id from auth.users
-- SELECT 
--     id,
--     user_id,
--     first_name,
--     last_name,
--     phone,
--     email,
--     tags
-- FROM customers 
-- WHERE user_id = 'YOUR_USER_ID'
-- LIMIT 5;

-- 9. Check if there are any customers in the database
SELECT 
    COUNT(*) as total_customers,
    COUNT(DISTINCT user_id) as unique_users
FROM customers;

-- 10. Check user_id format in customers table
SELECT 
    user_id,
    COUNT(*) as customer_count
FROM customers
GROUP BY user_id
LIMIT 10;

-- 11. Verify auth.uid() function works
-- This should return the current authenticated user's ID
SELECT auth.uid() as current_user_id;

