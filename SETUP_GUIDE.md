# 🚀 DNwerks SMS Dashboard - Deployment Setup Guide

## 📋 Overview

Your SMS Campaign Dashboard has been successfully deployed to Vercel! Now follow these steps to configure the essential services.

## 🔗 Live Application

**Your application is live at**: https://dnwerks-sms-dashboard-ivuoumok6-danzok-9785s-projects.vercel.app

## 🛠️ Step 1: Set Up Environment Variables in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: **dnwerks-sms-dashboard**
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

### Required Environment Variables:

```bash
# Application Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://dnwerks-sms-dashboard-ivuoumok6-danzok-9785s-projects.vercel.app

# Supabase Configuration (see Step 2)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Twilio SMS Configuration (see Step 3)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

## 🗄️ Step 2: Set Up Supabase Database

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up/login with GitHub
4. Create a new project:
   - **Organization**: Your name/organization
   - **Project Name**: `dnwerks-sms-dashboard`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users

### 2.2 Get Supabase Credentials

1. In your Supabase project dashboard:
   - Go to **Project Settings** → **API**
   - Copy the **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - Copy the **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Copy the **service_role** key (SUPABASE_SERVICE_ROLE_KEY)

### 2.3 Set Up Database Tables

1. In Supabase, go to **SQL Editor**
2. Click **"New query"**
3. Copy and run the SQL from `scripts/create-tables.ts` or use:

```sql
-- Create user_profiles table
CREATE TABLE user_profiles (
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
CREATE TABLE customers (
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
CREATE TABLE campaigns (
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
CREATE TABLE campaign_messages (
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
CREATE TABLE invite_codes (
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
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaign_messages_campaign_id ON campaign_messages(campaign_id);
CREATE INDEX idx_campaign_messages_status ON campaign_messages(status);
```

### 2.4 Create First Admin User

1. Sign up for an account on your deployed application
2. In Supabase SQL Editor, run:

```sql
-- Update first user to admin
UPDATE user_profiles
SET role = 'admin', status = 'approved'
WHERE user_id = 'YOUR_USER_ID_FROM_AUTH_USERS_TABLE';
```

## 📱 Step 3: Set Up Twilio SMS

### 3.1 Create Twilio Account

1. Go to [twilio.com](https://www.twilio.com/try-twilio)
2. Sign up for a free trial account
3. Verify your phone number

### 3.2 Get Twilio Credentials

1. In Twilio Console:
   - Go to **Account** → **General Settings**
   - Copy **Account SID** (TWILIO_ACCOUNT_SID)
   - Copy **Auth Token** (TWILIO_AUTH_TOKEN)

2. Get a Twilio Phone Number:
   - Go to **Phone Numbers** → **Buy a number**
   - Purchase a number for SMS
   - Copy the phone number (TWILIO_PHONE_NUMBER)

### 3.3 Add Twilio Credentials to Vercel

Go back to Vercel Settings → Environment Variables and add:
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

## 🔄 Step 4: Redeploy Application

After setting up environment variables:

1. In Vercel, go to **Deployments**
2. Click **"Redeploy"** or trigger a new deployment
3. Wait for deployment to complete

## ✅ Step 5: Test Your Application

1. Visit your live application
2. Sign up for an account
3. Create customers and campaigns
4. Send test SMS messages

## 🎯 Next Steps

- Configure custom domain (if desired)
- Set up monitoring and analytics
- Add additional features and customizations
- Set up backup and recovery procedures

## 🆘 Troubleshooting

### Common Issues:

1. **Supabase Connection Issues**
   - Verify environment variables are correctly copied
   - Check Supabase project settings and RLS policies

2. **SMS Not Sending**
   - Verify Twilio credentials
   - Check Twilio account balance
   - Ensure phone numbers are verified

3. **Authentication Issues**
   - Verify user has proper role and status in user_profiles table
   - Check RLS policies in Supabase

### Support Resources:

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Twilio Documentation](https://www.twilio.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 🎉 Congratulations!

Your SMS Campaign Dashboard is now fully configured and ready to use! 🚀