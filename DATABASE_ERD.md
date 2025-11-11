# DNwerks SMS Dashboard - Database Entity Relationship Diagram

## ERD Visualization

```
┌─────────────────────────────────────┐
│           auth.users               │
│  ───────────────────────────────   │
│  id (UUID) - PK                    │
│  email (TEXT)                      │
│  ... (other auth fields)           │
└─────────────────────────────────────┘
                    │
                    │ 1:1
                    │
┌─────────────────────────────────────┐
│          user_profiles             │
│  ───────────────────────────────   │
│  id (UUID) - PK                    │
│  user_id (UUID) - FK → auth.users  │
│  role (TEXT: admin/user)           │
│  status (TEXT: pending/approved)   │
│  invited_by (UUID) - FK → self     │
│  invite_code (TEXT) - UNIQUE       │
│  invited_at (TIMESTAMP)            │
│  approved_at (TIMESTAMP)           │
│  last_login_at (TIMESTAMP)         │
│  created_at (TIMESTAMP)            │
│  updated_at (TIMESTAMP)            │
└─────────────────────────────────────┘
    │                    │
    │ 1:N                │ 1:N
    │                    │
    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│   customers     │  │   campaigns     │
│  ─────────────  │  │  ─────────────  │
│  id (UUID) - PK │  │  id (UUID) - PK │
│  user_id (UUID) │  │  user_id (UUID) │
│  phone (TEXT)   │  │  name (TEXT)    │
│  first_name     │  │  message_body   │
│  last_name      │  │  status (TEXT)   │
│  email (TEXT)   │  │  total_recipients│
│  state (TEXT)   │  │  sent_count     │
│  status (TEXT)  │  │  delivered_count│
│  created_at     │  │  failed_count   │
│  updated_at     │  │  scheduled_at   │
└─────────────────┘  │  sent_at        │
         │            │  created_at     │
         │ 1:N        │  updated_at     │
         │            └─────────────────┘
         │                     │
         │                     │ 1:N
         │                     │
         ▼                     ▼
┌─────────────────────────────────────┐
│       campaign_messages              │
│  ───────────────────────────────   │
│  id (UUID) - PK                    │
│  campaign_id (UUID) - FK           │
│  customer_id (UUID) - FK           │
│  phone_number (TEXT)               │
│  message_body (TEXT)               │
│  status (TEXT)                     │
│  twilio_sid (TEXT)                 │
│  sent_at (TIMESTAMP)               │
│  delivered_at (TIMESTAMP)          │
│  error_message (TEXT)              │
│  created_at (TIMESTAMP)            │
│  updated_at (TIMESTAMP)            │
└─────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐
│  invite_codes   │  │campaign_templates│
│  ─────────────  │  │  ─────────────  │
│  id (UUID) - PK │  │  id (UUID) - PK │
│  code (TEXT)    │  │  user_id (UUID) │
│  created_by     │  │  name (TEXT)    │
│  expires_at     │  │  message_body   │
│  max_uses       │  │  category (TEXT)│
│  email (TEXT)   │  │  is_default     │
│  notes (TEXT)   │  │  created_at     │
│  created_at     │  │  updated_at     │
└─────────────────┘  └─────────────────┘
         │                     │
         │ 1:N                 │ 1:N
         │                     │
         ▼                     ▼
┌─────────────────────────────────────┐
│    password_reset_tokens             │
│  ───────────────────────────────   │
│  id (UUID) - PK                    │
│  token (TEXT) - UNIQUE             │
│  user_id (UUID) - FK               │
│  email (TEXT)                      │
│  expires_at (TIMESTAMP)            │
│  created_at (TIMESTAMP)            │
│  used_at (TIMESTAMP)               │
│  is_used (BOOLEAN)                 │
│  created_by (UUID) - FK            │
│  reset_type (TEXT)                 │
│  notes (TEXT)                      │
└─────────────────────────────────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────────────────────┐
│   admin_password_resets             │
│  ───────────────────────────────   │
│  id (UUID) - PK                    │
│  user_id (UUID) - FK               │
│  admin_id (UUID) - FK              │
│  reset_token_id (UUID) - FK        │
│  reason (TEXT)                     │
│  created_at (TIMESTAMP)            │
│  completed_at (TIMESTAMP)          │
│  status (TEXT)                     │
└─────────────────────────────────────┘
```

## Relationship Summary

### Primary Relationships

1. **auth.users ↔ user_profiles** (1:1)
   - Each auth user has one profile
   - Profile extends auth with application-specific fields

2. **user_profiles → customers** (1:N)
   - Users can have multiple customers
   - Customers belong to one user

3. **user_profiles → campaigns** (1:N)
   - Users can create multiple campaigns
   - Campaigns belong to one user

4. **campaigns → campaign_messages** (1:N)
   - Campaigns have multiple messages
   - Each message belongs to one campaign

5. **customers → campaign_messages** (1:N)
   - Customers can receive multiple messages
   - Each message is sent to one customer

6. **user_profiles → invite_codes** (1:N)
   - Users can create multiple invite codes
   - Each invite code is created by one user

7. **user_profiles → campaign_templates** (1:N)
   - Users can create multiple templates
   - Each template belongs to one user

8. **user_profiles → password_reset_tokens** (1:N)
   - Users can have multiple reset tokens
   - Each token belongs to one user

9. **password_reset_tokens → admin_password_resets** (1:N)
   - Tokens can be used in multiple admin resets
   - Each admin reset uses one token

### Self-Referencing Relationships

1. **user_profiles → user_profiles** (invited_by)
   - Users can invite other users
   - Creates a hierarchical relationship

### Indexes for Performance

```sql
-- User indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_user_profiles_invite_code ON user_profiles(invite_code);

-- Customer indexes
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_status ON customers(status);

-- Campaign indexes
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_scheduled_at ON campaigns(scheduled_at);

-- Campaign message indexes
CREATE INDEX idx_campaign_messages_campaign_id ON campaign_messages(campaign_id);
CREATE INDEX idx_campaign_messages_customer_id ON campaign_messages(customer_id);
CREATE INDEX idx_campaign_messages_status ON campaign_messages(status);

-- Template indexes
CREATE INDEX idx_campaign_templates_user_id ON campaign_templates(user_id);
CREATE INDEX idx_campaign_templates_category ON campaign_templates(category);

-- Password reset indexes
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
```

## Data Flow

1. **User Registration Flow**
   - User signs up with invite code
   - Creates auth.users record
   - Creates user_profiles record (status: pending)
   - Admin approves user (status: approved)

2. **Campaign Creation Flow**
   - User creates campaign
   - Selects customers or imports new ones
   - Schedule or send immediately
   - Creates campaign_messages for each recipient
   - Updates campaign status as messages are sent

3. **Password Reset Flow**
   - User requests reset
   - Creates password_reset_token
   - Sends email with reset link
   - User validates token
   - Updates password
   - Marks token as used

4. **Admin Password Reset Flow**
   - Admin initiates reset for user
   - Creates password_reset_token
   - Creates admin_password_resets record
   - Sends reset email to user
   - Tracks completion status

## Security Considerations

1. **Row Level Security (RLS)**
   - Users can only access their own data
   - Admins can access all data
   - Secure foreign key relationships

2. **Data Isolation**
   - Strict user_id filtering on all queries
   - No cross-user data leakage
   - Admin-only operations protected

3. **Audit Trail**
   - created_at/updated_at on all tables
   - Track who created/modified records
   - Password reset audit trail