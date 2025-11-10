/**
 * Supabase Database Setup using JavaScript Client
 * Alternative to direct PostgreSQL connection
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔌 Connecting to Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup with Supabase client...\n');

    // Create all tables using raw SQL via RPC
    console.log('📋 Creating customers table...');
    const { error: customersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS customers (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          phone TEXT UNIQUE NOT NULL,
          first_name TEXT,
          last_name TEXT,
          email TEXT,
          status TEXT DEFAULT 'active' NOT NULL,
          state TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
        
        CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
        CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
        CREATE INDEX IF NOT EXISTS idx_customers_state ON customers(state);
        CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
      `
    });

    if (customersError) {
      console.error('❌ Error creating customers table:', customersError);
      return;
    }
    console.log('✅ customers table created');

    console.log('📋 Creating campaigns table...');
    const { error: campaignsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS campaigns (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          message_body TEXT NOT NULL,
          status TEXT DEFAULT 'draft' NOT NULL,
          scheduled_at TIMESTAMP WITH TIME ZONE,
          total_recipients INTEGER DEFAULT 0,
          sent_count INTEGER DEFAULT 0,
          delivered_count INTEGER DEFAULT 0,
          failed_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
        
        CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
        CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
        CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_at ON campaigns(scheduled_at);
      `
    });

    if (campaignsError) {
      console.error('❌ Error creating campaigns table:', campaignsError);
      return;
    }
    console.log('✅ campaigns table created');

    console.log('📋 Creating messages table...');
    const { error: messagesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS messages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
          customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
          twilio_sid TEXT UNIQUE,
          status TEXT DEFAULT 'queued' NOT NULL,
          failure_reason TEXT,
          sent_at TIMESTAMP WITH TIME ZONE,
          delivered_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
        
        CREATE INDEX IF NOT EXISTS idx_messages_campaign_id ON messages(campaign_id);
        CREATE INDEX IF NOT EXISTS idx_messages_customer_id ON messages(customer_id);
        CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
        CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);
      `
    });

    if (messagesError) {
      console.error('❌ Error creating messages table:', messagesError);
      return;
    }
    console.log('✅ messages table created');

    console.log('📋 Creating short_links table...');
    const { error: linksError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS short_links (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          original_url TEXT NOT NULL,
          short_code TEXT UNIQUE NOT NULL,
          full_short_url TEXT UNIQUE NOT NULL,
          click_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `
    });

    if (linksError) {
      console.error('❌ Error creating short_links table:', linksError);
      return;
    }
    console.log('✅ short_links table created');

    console.log('📋 Creating campaign_templates table...');
    const { error: templatesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS campaign_templates (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          message_body TEXT NOT NULL,
          category TEXT DEFAULT 'general' NOT NULL,
          is_public BOOLEAN DEFAULT false NOT NULL,
          usage_count INTEGER DEFAULT 0 NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
        
        CREATE INDEX IF NOT EXISTS idx_templates_user_id ON campaign_templates(user_id);
        CREATE INDEX IF NOT EXISTS idx_templates_category ON campaign_templates(category);
        CREATE INDEX IF NOT EXISTS idx_templates_is_public ON campaign_templates(is_public);
      `
    });

    if (templatesError) {
      console.error('❌ Error creating campaign_templates table:', templatesError);
      return;
    }
    console.log('✅ campaign_templates table created');

    console.log('📋 Creating user_profiles table...');
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT UNIQUE NOT NULL,
          role TEXT DEFAULT 'user' NOT NULL,
          status TEXT DEFAULT 'pending' NOT NULL,
          invited_by TEXT,
          invite_code TEXT UNIQUE,
          invited_at TIMESTAMP WITH TIME ZONE,
          approved_at TIMESTAMP WITH TIME ZONE,
          last_login_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
        CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
      `
    });

    if (profilesError) {
      console.error('❌ Error creating user_profiles table:', profilesError);
      return;
    }
    console.log('✅ user_profiles table created');

    console.log('📋 Creating invite_codes table...');
    const { error: invitesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS invite_codes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          email TEXT,
          created_by TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          used_at TIMESTAMP WITH TIME ZONE,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          max_uses INTEGER DEFAULT 1 NOT NULL,
          used_count INTEGER DEFAULT 0 NOT NULL,
          is_active BOOLEAN DEFAULT true NOT NULL,
          notes TEXT
        );
        
        CREATE INDEX IF NOT EXISTS idx_invite_codes_created_by ON invite_codes(created_by);
        CREATE INDEX IF NOT EXISTS idx_invite_codes_expires_at ON invite_codes(expires_at);
        CREATE INDEX IF NOT EXISTS idx_invite_codes_is_active ON invite_codes(is_active);
      `
    });

    if (invitesError) {
      console.error('❌ Error creating invite_codes table:', invitesError);
      return;
    }
    console.log('✅ invite_codes table created');

    console.log('\n🔒 Setting up Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
        ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
        ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;
        ALTER TABLE campaign_templates ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
    } else {
      console.log('✅ RLS enabled on all tables');
    }

    console.log('\n🛡️ Creating RLS policies...');
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Customers: Users can only access their own customers
        CREATE POLICY IF NOT EXISTS "Users can access own customers" ON customers
          FOR ALL USING (user_id = auth.uid()::text);

        -- Campaigns: Users can only access their own campaigns  
        CREATE POLICY IF NOT EXISTS "Users can access own campaigns" ON campaigns
          FOR ALL USING (user_id = auth.uid()::text);

        -- Messages: Users can access messages for their campaigns
        CREATE POLICY IF NOT EXISTS "Users can access own messages" ON messages
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM campaigns 
              WHERE campaigns.id = messages.campaign_id 
              AND campaigns.user_id = auth.uid()::text
            )
          );

        -- Templates: Users can access their own templates and public ones
        CREATE POLICY IF NOT EXISTS "Users can access templates" ON campaign_templates
          FOR SELECT USING (user_id = auth.uid()::text OR is_public = true);
        
        CREATE POLICY IF NOT EXISTS "Users can modify own templates" ON campaign_templates
          FOR ALL USING (user_id = auth.uid()::text);

        -- User profiles: Users can view their own profile, admins can view all
        CREATE POLICY IF NOT EXISTS "Users can view profiles" ON user_profiles
          FOR SELECT USING (
            user_id = auth.uid()::text OR 
            EXISTS (
              SELECT 1 FROM user_profiles 
              WHERE user_id = auth.uid()::text 
              AND role = 'admin' 
              AND status = 'approved'
            )
          );

        -- Invite codes: Only admins can manage
        CREATE POLICY IF NOT EXISTS "Admins can manage invites" ON invite_codes
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM user_profiles 
              WHERE user_id = auth.uid()::text 
              AND role = 'admin' 
              AND status = 'approved'
            )
          );
      `
    });

    if (policiesError) {
      console.error('❌ Error creating RLS policies:', policiesError);
    } else {
      console.log('✅ RLS policies created');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Create your first admin user');
    console.log('2. Run "npm run db:studio" to view your database');
    console.log('3. Start building your application!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

setupDatabase();