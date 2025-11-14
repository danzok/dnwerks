-- ============================================
-- Fix RLS Policy for Tags Editing
-- ============================================
-- This script fixes RLS policies to allow tag updates
-- Run this in your Supabase SQL Editor

-- 1. First, ensure tags column exists
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 2. Update NULL tags to empty array
UPDATE customers 
SET tags = '{}' 
WHERE tags IS NULL;

-- 3. Check current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'customers';

-- 4. Drop the existing restrictive policy if it exists
DROP POLICY IF EXISTS "Users can manage own customers" ON customers;
DROP POLICY IF EXISTS "Users can access own customers" ON customers;
DROP POLICY IF EXISTS "Users can update own customers" ON customers;

-- 5. Create a comprehensive policy that allows ALL operations including tag updates
-- This policy allows users to SELECT, INSERT, UPDATE, and DELETE their own customers
CREATE POLICY "Users can manage own customers" 
ON customers 
FOR ALL 
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- 6. Alternative: If you want separate policies for each operation (more granular)
-- Uncomment these if you prefer separate policies:

-- SELECT policy
-- CREATE POLICY "Users can view own customers" 
-- ON customers 
-- FOR SELECT 
-- USING (auth.uid()::text = user_id);

-- INSERT policy
-- CREATE POLICY "Users can insert own customers" 
-- ON customers 
-- FOR INSERT 
-- WITH CHECK (auth.uid()::text = user_id);

-- UPDATE policy (this is the critical one for tag editing)
-- CREATE POLICY "Users can update own customers" 
-- ON customers 
-- FOR UPDATE 
-- USING (auth.uid()::text = user_id)
-- WITH CHECK (auth.uid()::text = user_id);

-- DELETE policy
-- CREATE POLICY "Users can delete own customers" 
-- ON customers 
-- FOR DELETE 
-- USING (auth.uid()::text = user_id);

-- 7. Verify the policy was created
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'customers';

-- 8. Test that tags column is accessible
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name = 'tags';

-- 9. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO authenticated;

-- 10. Verify RLS is enabled on the table
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'customers';

-- If rowsecurity is false, enable it:
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

