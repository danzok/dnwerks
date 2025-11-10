# 👑 Admin Management Guide

This guide explains how to create and manage admin users for your DNwerks SMS Dashboard.

## 📋 Overview

The application uses **role-based access control** with the following user types:
- **Admin**: Full access to all features, user management, and system settings
- **User**: Limited access to campaigns and customers (requires admin approval)

## 🚀 Quick Start

### Method 1: Create Custom Admin (Recommended)

**Usage:**
```bash
npm run db:create-custom-admin <email> <password>
```

**Examples:**
```bash
# Create admin with custom credentials
npm run db:create-custom-admin admin@yourcompany.com SecurePassword123

# Create admin with custom name
ADMIN_NAME="John Admin" npm run db:create-custom-admin john@company.com MyP@ssw0rd!
```

**Features:**
- ✅ Creates Supabase auth user automatically
- ✅ Sets up admin profile with approved status
- ✅ Generates invite codes for team members
- ✅ Works in both development and production

### Method 2: Update Default Admin Credentials

**For Development:**
```bash
# Set custom credentials via environment variables
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword npm run db:create-admin-supabase
```

**For Production:**
1. Set environment variables in Vercel Dashboard
2. Run the setup script

### Method 3: Promote Existing User to Admin

**Steps:**
1. Have the user sign up through the application first
2. Get their user ID from Supabase auth.users table
3. Run:
```bash
npm run db:create-admin <user-id>
```

**Example:**
```bash
npm run db:create-admin 12345678-1234-1234-1234-123456789012
```

## 🔧 Configuration

### Required Environment Variables

Make sure these are set in your environment:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Application URL (optional)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Available Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `db:create-custom-admin` | Create new admin with custom credentials | `npm run db:create-custom-admin email password` |
| `db:create-admin-supabase` | Setup default admin with env vars | `ADMIN_EMAIL=x ADMIN_PASSWORD=y npm run db:create-admin-supabase` |
| `db:create-admin` | Promote existing user to admin | `npm run db:create-admin user-id` |

## 🎯 Admin Features

Once logged in as an admin, you can access:

### Admin Panel (`/admin`)
- **User Management**: View, approve, reject users
- **System Overview**: Application statistics and health
- **Invite Management**: Create and manage invite codes
- **Security Settings**: Monitor authentication activity

### API Endpoints
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users` - Update user details
- `POST /api/admin/users/approve` - Approve user registration
- `POST /api/admin/users/reject` - Reject user registration

## 🔒 Security Best Practices

### Password Requirements
- Minimum 8 characters
- Include uppercase, lowercase, numbers, and special characters
- Change default passwords immediately

### Admin Account Security
1. **Change Default Credentials**: Always change default passwords
2. **Use Strong Passwords**: Follow password complexity requirements
3. **Enable 2FA**: Set up two-factor authentication in Supabase
4. **Limit Admin Accounts**: Create only necessary admin accounts
5. **Regular Audits**: Periodically review admin access

### Environment Security
- Never commit credentials to version control
- Use environment variables for sensitive data
- Rotate service keys regularly
- Monitor authentication logs

## 🗄️ Database Schema

### User Profiles Table
```sql
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
```

### Invite Codes Table
```sql
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
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Supabase configuration is required"
**Solution**: Make sure your environment variables are properly set
```bash
# Check your variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

#### 2. "User not found in auth system"
**Solution**: Verify the user ID is correct and exists in auth.users table
```sql
-- Check in Supabase SQL Editor
SELECT id, email FROM auth.users WHERE id = 'your-user-id';
```

#### 3. "Invalid email format"
**Solution**: Use a valid email address format
```bash
# Valid examples
admin@company.com
user.name@domain.org
# Invalid examples
admin@localhost
user@.com
```

#### 4. "Password must be at least 8 characters"
**Solution**: Use a stronger password
```bash
# Good examples
SecurePass123!
MyP@ssw0rd!
CompanyAdmin2024
```

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=true npm run db:create-custom-admin email password
```

## 📱 Production Deployment

### Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add your Supabase credentials
3. Redeploy the application

### Production Admin Setup

1. **Create Admin User**:
```bash
ADMIN_EMAIL=admin@yourcompany.com ADMIN_PASSWORD=YourSecurePassword123 npm run db:create-admin-supabase
```

2. **Test Login**:
   - Visit your application
   - Sign in with admin credentials
   - Access admin panel

3. **Invite Team Members**:
   - Use admin panel to generate invite codes
   - Share codes with team members
   - Approve new user registrations

## 🔄 Backup and Recovery

### Backup Admin Data
```sql
-- Export admin users
SELECT * FROM user_profiles WHERE role = 'admin';

-- Export invite codes
SELECT * FROM invite_codes WHERE created_by IN (
  SELECT user_id FROM user_profiles WHERE role = 'admin'
);
```

### Recovery Process
1. Restore Supabase database
2. Run admin setup script
3. Recreate admin users as needed
4. Update environment variables

## 📞 Support

If you encounter issues:

1. **Check Logs**: Review application logs for error details
2. **Verify Configuration**: Ensure all environment variables are correct
3. **Database Status**: Confirm Supabase is accessible
4. **Network Issues**: Check firewall and connection settings

## 🎉 Success!

You now have admin users configured for your SMS Dashboard! Your admins can:
- Manage user registrations
- Access all application features
- Monitor system health
- Generate invite codes for team members

For additional features or customizations, refer to the source code or create a GitHub issue.