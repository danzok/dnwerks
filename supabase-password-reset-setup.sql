-- ============================================
-- DNwerks SMS Dashboard - Password Reset Setup
-- ============================================
-- Run this script in your Supabase SQL Editor to add password reset functionality

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES user_profiles(id), -- For admin-initiated resets
  reset_type TEXT DEFAULT 'user' CHECK (reset_type IN ('user', 'admin')),
  notes TEXT
);

-- Create admin_password_resets table for tracking admin-initiated resets
CREATE TABLE IF NOT EXISTS admin_password_resets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  reset_token_id UUID REFERENCES password_reset_tokens(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'cancelled'))
);

-- Enable Row Level Security (RLS) for new tables
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_password_resets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own reset tokens" ON password_reset_tokens;
DROP POLICY IF EXISTS "Admins can manage all reset tokens" ON password_reset_tokens;
DROP POLICY IF EXISTS "Admins can manage admin password resets" ON admin_password_resets;

-- Create RLS policies for password_reset_tokens
CREATE POLICY "Users can view own reset tokens" ON password_reset_tokens FOR SELECT USING (
  auth.uid() = user_id
);

CREATE POLICY "Admins can manage all reset tokens" ON password_reset_tokens FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin' AND status = 'approved')
);

-- Create RLS policies for admin_password_resets
CREATE POLICY "Admins can manage admin password resets" ON admin_password_resets FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin' AND status = 'approved')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_is_used ON password_reset_tokens(is_used);

CREATE INDEX IF NOT EXISTS idx_admin_password_resets_user_id ON admin_password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_password_resets_admin_id ON admin_password_resets(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_password_resets_status ON admin_password_resets(status);

-- Add new columns to user_profiles table if they don't exist
DO $$
BEGIN
  -- Check if column exists before adding
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'last_token_used_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_token_used_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'last_sign_in_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_sign_in_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'password_reset_count'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN password_reset_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_reset_tokens()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete tokens that are older than 7 days and already used
  DELETE FROM password_reset_tokens 
  WHERE (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days')
     OR (expires_at < NOW() - INTERVAL '7 days');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run cleanup periodically (you can also set this up as a cron job)
-- This trigger will fire on any insert to the table
CREATE TRIGGER trigger_cleanup_expired_tokens
AFTER INSERT ON password_reset_tokens
FOR EACH ROW
EXECUTE FUNCTION cleanup_expired_reset_tokens();

-- Create function to generate secure reset token
CREATE OR REPLACE FUNCTION generate_password_reset_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Update existing trigger function to include new fields
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Next Steps:
-- 1. Test the password reset functionality through your application
-- 2. Set up cron job for periodic cleanup of expired tokens
-- 3. Configure email service for password reset notifications
-- 4. Update your application to use the new password reset flow