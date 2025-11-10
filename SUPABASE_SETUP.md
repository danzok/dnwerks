# Complete Supabase Database Setup Guide

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Sign in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `sms-campaign-platform`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait for project initialization (2-3 minutes)

## Step 2: Get Connection Details

1. In your Supabase project dashboard:
   - Go to **Settings** > **Database**
   - Find **Connection string** section
   - Copy the **URI** (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`)
2. Replace `[YOUR-PASSWORD]` with the password you set earlier

## Step 3: Update Environment Variables

Copy your `.env.example` to `.env.local` and update:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase details:
```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

## Step 4: Install Dependencies & Setup Database

Run the complete database setup:

```bash
# Install dependencies (including new ones for database setup)
npm install

# Setup complete database with all tables, indexes, and RLS policies
npm run db:setup

# Create your first admin user (replace with your actual user ID)
npm run db:create-admin user_your_actual_user_id

# Open Drizzle Studio to verify tables
npm run db:studio
```

## Step 5: Verify Setup

1. **Check Tables**: Run `npm run db:studio` and verify all tables exist:
   - ✅ customers
   - ✅ campaigns  
   - ✅ messages
   - ✅ short_links
   - ✅ campaign_templates
   - ✅ user_profiles
   - ✅ invite_codes

2. **Check Admin User**: Your admin user should be visible in the `user_profiles` table with:
   - `role`: 'admin'
   - `status`: 'approved'

3. **Test Application**: Start your development server and login with your admin user:
   ```bash
   npm run dev
   ```

## Database Commands Reference

- `npm run db:setup` - Complete database setup with all tables
- `npm run db:create-admin <user-id>` - Create/update admin user
- `npm run db:studio` - Visual database browser
- `npm run db:generate` - Generate migrations from schema changes
- `npm run db:push` - Push schema changes to database

## Troubleshooting

**Connection Issues**: 
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Ensure password has no special characters that need URL encoding

**Permission Issues**:
- RLS (Row Level Security) is enabled on all tables
- Users can only access their own data
- Admins have full access to manage users and invites

Your SMS Campaign Platform database is now ready! 🎉