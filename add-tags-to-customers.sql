-- ============================================
-- Add Tags Field to Customers Table
-- ============================================
-- Run this script in your Supabase SQL Editor

-- Add tags field as TEXT array to store multiple tags per contact
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for better performance on tag queries
CREATE INDEX IF NOT EXISTS idx_customers_tags ON customers USING GIN(tags);

-- Update existing customers to have empty tags array (optional, as DEFAULT handles this)
UPDATE customers 
SET tags = '{}' 
WHERE tags IS NULL;

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'tags';