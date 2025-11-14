-- ============================================
-- Diagnostic Script for Contacts Not Loading
-- ============================================
-- Run this to understand the issue

-- 1. Check customers table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name = 'user_id';

-- 2. Check if customers table has any data
SELECT COUNT(*) as total_customers FROM customers;

-- 3. Check user_id values in customers table
SELECT 
    user_id,
    COUNT(*) as customer_count
FROM customers
GROUP BY user_id
LIMIT 10;

-- 4. Check user_profiles table
SELECT 
    id as profile_id,
    user_id as auth_user_id,
    role,
    status
FROM user_profiles
LIMIT 10;

-- 5. Check if customers.user_id matches user_profiles.id
SELECT 
    c.user_id as customer_user_id,
    up.id as profile_id,
    up.user_id as auth_user_id,
    COUNT(*) as customer_count
FROM customers c
LEFT JOIN user_profiles up ON c.user_id = up.id::text
GROUP BY c.user_id, up.id, up.user_id
LIMIT 10;

-- 6. Check auth.uid() format
SELECT 
    auth.uid() as current_auth_uid,
    auth.uid()::text as current_auth_uid_text;

-- 7. Test: Find customers that should be visible to current user
-- This will show if RLS is working
SELECT 
    c.id,
    c.user_id,
    c.first_name,
    c.last_name,
    c.phone,
    up.user_id as profile_auth_user_id
FROM customers c
LEFT JOIN user_profiles up ON c.user_id = up.id::text
WHERE up.user_id = auth.uid()::text
LIMIT 10;

-- 8. Check RLS policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'customers';

