# DNwerks SMS Dashboard - Website Schema

## Overview
DNwerks is an SMS marketing dashboard that allows businesses to manage customers, create and send SMS campaigns, and track campaign performance. The application uses Next.js, TypeScript, Supabase for the database, and Twilio for SMS delivery.

## Database Schema

### Core Tables

#### 1. user_profiles
Manages user accounts and permissions within the system.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

**Fields:**
- `id`: Unique identifier for the profile
- `user_id`: Reference to Supabase auth user
- `role`: User role (admin/user)
- `status`: Account approval status
- `invited_by`: Reference to the user who sent the invitation
- `invite_code`: Unique invitation code
- `invited_at`: When the invitation was sent
- `approved_at`: When the account was approved
- `last_login_at`: Last login timestamp

#### 2. customers
Stores customer contact information for SMS campaigns.

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

**Fields:**
- `id`: Unique customer identifier
- `user_id`: Owner of the customer record
- `phone`: Customer phone number (unique)
- `first_name`: Customer's first name
- `last_name`: Customer's last name
- `email`: Customer's email address
- `state`: Customer's state/region
- `status`: Active/inactive status

#### 3. campaigns
Manages SMS marketing campaigns.

```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message_body TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique campaign identifier
- `user_id`: Campaign owner
- `name`: Campaign name
- `message_body`: SMS message content
- `status`: Campaign status
- `total_recipients`: Number of recipients
- `sent_count`: Number of messages sent
- `delivered_count`: Number of messages delivered
- `failed_count`: Number of failed messages
- `scheduled_at`: When to send the campaign
- `sent_at`: When the campaign was sent

#### 4. campaign_messages
Tracks individual messages sent within campaigns.

```sql
CREATE TABLE campaign_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  phone_number TEXT,
  message_body TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  twilio_sid TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique message identifier
- `campaign_id`: Reference to the campaign
- `customer_id`: Reference to the customer
- `phone_number`: Recipient phone number
- `message_body`: Message content
- `status`: Message delivery status
- `twilio_sid`: Twilio message SID
- `sent_at`: When the message was sent
- `delivered_at`: When the message was delivered
- `error_message`: Error details if failed

#### 5. campaign_templates
Stores reusable message templates.

```sql
CREATE TABLE campaign_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message_body TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'marketing', 'reminders', 'alerts', 'announcements')),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique template identifier
- `user_id`: Template owner
- `name`: Template name
- `message_body`: Template message content
- `category`: Template category
- `is_default`: Whether this is a default template

#### 6. invite_codes
Manages invitation codes for new user registration.

```sql
CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER DEFAULT 1,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique invite code identifier
- `code`: The actual invitation code
- `created_by`: Who created the invitation
- `expires_at`: When the code expires
- `max_uses`: Maximum number of uses
- `email`: Associated email (optional)
- `notes`: Additional notes

#### 7. password_reset_tokens
Handles password reset functionality.

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES user_profiles(id),
  reset_type TEXT DEFAULT 'user' CHECK (reset_type IN ('user', 'admin')),
  notes TEXT
);
```

**Fields:**
- `id`: Unique token identifier
- `token`: The reset token
- `user_id`: User requesting reset
- `email`: User's email
- `expires_at`: Token expiration
- `used_at`: When the token was used
- `is_used`: Whether the token has been used
- `created_by`: Who created the token
- `reset_type`: User or admin initiated
- `notes`: Additional notes

#### 8. admin_password_resets
Tracks admin-initiated password resets.

```sql
CREATE TABLE admin_password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  reset_token_id UUID REFERENCES password_reset_tokens(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'cancelled'))
);
```

**Fields:**
- `id`: Unique reset record identifier
- `user_id`: User being reset
- `admin_id`: Admin performing reset
- `reset_token_id`: Reference to the token
- `reason`: Reason for reset
- `completed_at`: When completed
- `status`: Reset status

## Application Architecture

### Frontend Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── forgot-password/   # Password reset request
│   ├── reset-password/    # Password reset confirmation
│   └── api/               # API routes
│       ├── password-reset/
│       └── admin/
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── customers/        # Customer management components
│   └── admin/            # Admin-specific components
├── lib/                  # Utility libraries
│   ├── auth.ts          # Authentication utilities
│   ├── db.ts            # Database client
│   ├── schema.ts        # Type definitions
│   └── types.ts         # TypeScript types
└── blocks/              # Reusable page blocks
```

### Key Features

1. **Authentication & Authorization**
   - Supabase Auth integration
   - Role-based access control (admin/user)
   - Invitation-based registration
   - Password reset functionality

2. **Customer Management**
   - Add/edit/delete customers
   - Bulk import via CSV
   - Customer segmentation by state
   - Active/inactive status management

3. **Campaign Management**
   - Create SMS campaigns
   - Schedule campaigns
   - Track delivery status
   - View campaign analytics
   - Use message templates

4. **Template System**
   - Create reusable message templates
   - Categorize templates
   - Default templates for new users

5. **Admin Features**
   - User management
   - Invitation code generation
   - Password reset management
   - System analytics

### Security Features

1. **Row Level Security (RLS)**
   - Users can only access their own data
   - Admins can access all data
   - Secure API endpoints

2. **Data Validation**
   - Input sanitization
   - Phone number validation
   - Email format validation

3. **Access Control**
   - Role-based permissions
   - Invitation-only registration
   - Admin approval workflow

### Integrations

1. **Twilio**
   - SMS delivery
   - Delivery status tracking
   - Phone number validation

2. **Supabase**
   - Authentication
   - Database
   - Real-time subscriptions
   - File storage (if needed)

3. **Resend**
   - Email notifications
   - Password reset emails
   - Invitation emails

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration (with invite code)

### Password Reset
- `POST /api/password-reset/request` - Request password reset
- `POST /api/password-reset/validate` - Validate reset token
- `POST /api/password-reset/confirm` - Confirm password reset

### Admin Password Reset
- `POST /api/admin/password-reset` - Admin-initiated reset
- `GET /api/admin/password-resets` - List admin resets

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer
- `POST /api/customers/import` - Bulk import customers

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign
- `POST /api/campaigns/[id]/send` - Send campaign

### Templates
- `GET /api/templates` - List templates
- `POST /api/templates` - Create template
- `PUT /api/templates/[id]` - Update template
- `DELETE /api/templates/[id]` - Delete template

### Admin
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/[id]` - Update user
- `POST /api/admin/invites` - Create invite code
- `GET /api/admin/invites` - List invite codes

## State Management

The application uses React state management with:
- Local component state for UI interactions
- Supabase real-time subscriptions for live updates
- Server state management through API calls

## Deployment

The application is designed to be deployed on:
- **Vercel** (recommended for Next.js)
- **Supabase** for backend services
- Environment variables for configuration

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# Resend
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_from_email

# Next.js
NEXTAUTH_URL=your_app_url
NEXTAUTH_SECRET=your_nextauth_secret
```

## Future Enhancements

1. **Analytics Dashboard**
   - Campaign performance metrics
   - Customer engagement analytics
   - Delivery rate tracking

2. **Advanced Segmentation**
   - Customer tags
   - Behavioral targeting
   - Custom attributes

3. **Automation**
   - Drip campaigns
   - Trigger-based messaging
   - Autoresponders

4. **Multi-channel Support**
   - Email campaigns
   - Push notifications
   - Social media integration

5. **Compliance Features**
   - TCPA compliance
   - Consent management
   - Opt-out handling