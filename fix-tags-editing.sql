-- ============================================
-- Fix Tags Editing Issue
-- ============================================
-- This script ensures tags can be edited on the live site
-- Run this in your Supabase SQL Editor

-- 1. Ensure tags column exists (if not already added)
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 2. Remove the old single 'tag' column if it exists and is not needed
-- (Uncomment if you want to remove it)
-- ALTER TABLE customers DROP COLUMN IF EXISTS tag;

-- 3. Ensure the GIN index exists for efficient tag queries
CREATE INDEX IF NOT EXISTS idx_customers_tags_gin ON customers USING GIN(tags) WHERE tags IS NOT NULL;

-- 4. Update existing NULL tags to empty array
UPDATE customers 
SET tags = '{}' 
WHERE tags IS NULL;

-- 5. Verify RLS policies allow updates to tags
-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'customers';

-- 6. Ensure users can update their own customers (including tags)
-- Drop existing policy if it's too restrictive
DROP POLICY IF EXISTS "Users can manage own customers" ON customers;

-- Create a comprehensive policy that allows all operations including tag updates
CREATE POLICY "Users can manage own customers" 
ON customers 
FOR ALL 
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- 7. Grant necessary permissions (if needed)
GRANT ALL ON customers TO authenticated;

-- 8. Verify the tags column structure
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name IN ('tag', 'tags')
ORDER BY column_name;

-- 9. Test query to verify tags can be read
SELECT 
    id,
    user_id,
    first_name,
    tags,
    array_length(tags, 1) as tag_count
FROM customers 
WHERE tags IS NOT NULL 
LIMIT 5;

