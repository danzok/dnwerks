-- ============================================
-- DNwerks SMS Dashboard - Database Setup Script
-- ============================================
-- Run this script in your Supabase SQL Editor

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  invited_by UUID REFERENCES user_profiles(id),
  invite_code TEXT UNIQUE,
  invited_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  phone TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  state TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message_body TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_messages table
CREATE TABLE IF NOT EXISTS campaign_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  message_body TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  twilio_sid TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invite_codes table
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER DEFAULT 1,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage own customers" ON customers;
DROP POLICY IF EXISTS "Users can manage own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can view own campaign messages" ON campaign_messages;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all users" ON user_profiles;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own customers" ON customers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own campaigns" ON campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own campaign messages" ON campaign_messages FOR SELECT USING (auth.uid() IN (SELECT user_id FROM campaigns WHERE id = campaign_id));

-- Admin policies
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin' AND status = 'approved')
);

CREATE POLICY "Admins can manage all users" ON user_profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin' AND status = 'approved')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_messages_campaign_id ON campaign_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_messages_status ON campaign_messages(status);

-- Insert sample invite code for first admin
INSERT INTO invite_codes (code, email, notes)
VALUES ('ADMIN2024', 'admin@example.com', 'Initial admin access code')
ON CONFLICT (code) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_messages_updated_at BEFORE UPDATE ON campaign_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Next Steps:
-- 1. Sign up for an account in your application
-- 2. Run this query to make yourself an admin:
--    UPDATE user_profiles SET role = 'admin', status = 'approved' WHERE user_id = 'YOUR_USER_ID';
-- 3. Configure Twilio credentials in Vercel environment variables