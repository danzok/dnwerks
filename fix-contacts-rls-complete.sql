-- ============================================
-- Complete Fix for Contacts Not Loading
-- ============================================
-- This script ensures contacts can be loaded (SELECT) and edited (UPDATE)
-- Run this in your Supabase SQL Editor

-- 1. First, check current state
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'customers';

-- 2. Check existing policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'customers';

-- 3. Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can manage own customers" ON customers;
DROP POLICY IF EXISTS "Users can access own customers" ON customers;
DROP POLICY IF EXISTS "Users can view own customers" ON customers;
DROP POLICY IF EXISTS "Users can update own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON customers;

-- 4. Enable RLS (if not already enabled)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 5. Create a comprehensive policy that allows ALL operations
-- This policy allows SELECT, INSERT, UPDATE, and DELETE for users' own customers
CREATE POLICY "Users can manage own customers" 
ON customers 
FOR ALL 
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- 6. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 7. Verify the policy was created
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'customers';

-- 8. Test: Check if there are any customers
SELECT 
    COUNT(*) as total_customers,
    COUNT(DISTINCT user_id) as unique_users
FROM customers;

-- 9. Test: Check user_id format (should be TEXT matching auth.uid())
SELECT 
    user_id,
    COUNT(*) as customer_count,
    MIN(created_at) as first_contact,
    MAX(created_at) as last_contact
FROM customers
GROUP BY user_id
ORDER BY customer_count DESC
LIMIT 10;

-- 10. Verify auth.uid() returns the correct format
-- This should return the current authenticated user's UUID as TEXT
SELECT 
    auth.uid() as current_user_id,
    auth.uid()::text as current_user_id_text;

-- 11. Test query: Try to select customers for a specific user
-- Replace 'YOUR_USER_ID_HERE' with an actual user_id from auth.users
-- SELECT 
--     id,
--     user_id,
--     first_name,
--     last_name,
--     phone,
--     email,
--     tags,
--     status,
--     created_at
-- FROM customers 
-- WHERE user_id = 'YOUR_USER_ID_HERE'
-- LIMIT 5;

-- 12. Check if tags column exists and has data
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name = 'tags';

-- 13. Update NULL tags to empty array
UPDATE customers 
SET tags = '{}' 
WHERE tags IS NULL;

-- 14. Final verification: Check RLS is working
-- This query should work if you're authenticated
-- SELECT COUNT(*) FROM customers;

