-- ============================================
-- Fix Contacts Not Loading - User ID Mismatch
-- ============================================
-- This fixes the issue where customers.user_id references user_profiles.id
-- but we need to match against auth.uid() directly

-- OPTION 1: If customers.user_id should directly match auth.uid()
-- (Recommended if you want direct auth.uid() matching)

-- Step 1: Add a new column to store auth user_id directly
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS auth_user_id TEXT;

-- Step 2: Populate auth_user_id from user_profiles
UPDATE customers c
SET auth_user_id = up.user_id::text
FROM user_profiles up
WHERE c.user_id = up.id::text
AND c.auth_user_id IS NULL;

-- Step 3: Update RLS policy to use auth_user_id
DROP POLICY IF EXISTS "Users can manage own customers" ON customers;

CREATE POLICY "Users can manage own customers" 
ON customers 
FOR ALL 
USING (auth.uid()::text = auth_user_id)
WITH CHECK (auth.uid()::text = auth_user_id);

-- Step 4: Create index for performance
CREATE INDEX IF NOT EXISTS idx_customers_auth_user_id 
ON customers(auth_user_id);

-- Step 5: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- OPTION 2: If you want to keep the current structure
-- (Use this if customers.user_id should reference user_profiles.id)
-- Update the RLS policy to join through user_profiles

-- DROP POLICY IF EXISTS "Users can manage own customers" ON customers;
-- 
-- CREATE POLICY "Users can manage own customers" 
-- ON customers 
-- FOR ALL 
-- USING (
--   EXISTS (
--     SELECT 1 FROM user_profiles up
--     WHERE up.id::text = customers.user_id
--     AND up.user_id = auth.uid()
--   )
-- )
-- WITH CHECK (
--   EXISTS (
--     SELECT 1 FROM user_profiles up
--     WHERE up.id::text = customers.user_id
--     AND up.user_id = auth.uid()
--   )
-- );

-- Verify the fix
SELECT 
    c.id,
    c.user_id as customer_user_id,
    c.auth_user_id,
    up.user_id as profile_auth_user_id,
    c.first_name,
    c.last_name
FROM customers c
LEFT JOIN user_profiles up ON c.user_id = up.id::text
LIMIT 10;

