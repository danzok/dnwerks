# DNwerks SMS Dashboard - API Schema Documentation

## Base URL
```
https://your-domain.com/api
```

## Authentication
All API endpoints (except public ones) require authentication via:
- Supabase JWT token in `Authorization: Bearer <token>` header
- Session-based authentication for web requests

## Response Format
All API responses follow this standard format:

```typescript
// Success Response
{
  "success": true,
  "data": <response_data>,
  "message": "Operation completed successfully"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional additional error details
  }
}
```

## API Endpoints

### Authentication Endpoints

#### POST /auth/login
Authenticate user and return session.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    user: UserProfile;
    session: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  };
}
```

#### POST /auth/register
Register new user with invite code.

**Request Body:**
```typescript
{
  email: string;
  password: string;
  invite_code: string;
  first_name?: string;
  last_name?: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    user: UserProfile;
    message: "Registration successful. Awaiting admin approval.";
  };
}
```

#### POST /auth/logout
End user session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  data: null;
}
```

### Password Reset Endpoints

#### POST /password-reset/request
Request password reset for user email.

**Request Body:**
```typescript
{
  email: string;
  reset_type?: 'user' | 'admin'; // Default: 'user'
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    message: "Password reset email sent";
    expires_at: string; // ISO timestamp
  };
}
```

#### POST /password-reset/validate
Validate password reset token.

**Request Body:**
```typescript
{
  token: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    valid: boolean;
    email: string;
    expires_at: string;
  };
}
```

#### POST /password-reset/confirm
Confirm password reset with new password.

**Request Body:**
```typescript
{
  token: string;
  new_password: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    message: "Password reset successful";
  };
}
```

### Admin Password Reset Endpoints

#### POST /admin/password-reset
Admin initiates password reset for a user.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```typescript
{
  user_id: string;
  reason?: string;
  notes?: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    reset_id: string;
    message: "Password reset initiated";
    expires_at: string;
  };
}
```

#### GET /admin/password-resets
List all admin password resets.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
```typescript
{
  status?: 'pending' | 'completed' | 'expired' | 'cancelled';
  user_id?: string;
  limit?: number; // Default: 50
  offset?: number; // Default: 0
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    resets: AdminPasswordReset[];
    total: number;
    has_more: boolean;
  };
}
```

### Customer Management Endpoints

#### GET /customers
List customers for authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  search?: string; // Search by name, email, or phone
  status?: 'active' | 'inactive';
  state?: string;
  limit?: number; // Default: 50
  offset?: number; // Default: 0
  order_by?: 'created_at' | 'updated_at' | 'first_name' | 'last_name';
  ascending?: boolean; // Default: true
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    customers: Customer[];
    total: number;
    has_more: boolean;
  };
}
```

#### POST /customers
Create new customer.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  phone: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  state?: string;
  status?: 'active' | 'inactive'; // Default: 'active'
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    customer: Customer;
  };
}
```

#### PUT /customers/[id]
Update existing customer.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  phone?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  state?: string;
  status?: 'active' | 'inactive';
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    customer: Customer;
  };
}
```

#### DELETE /customers/[id]
Delete customer.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  data: {
    message: "Customer deleted successfully";
  };
}
```

#### POST /customers/import
Bulk import customers from CSV.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
file: CSV file with columns: phone, first_name, last_name, email, state
```

**Response:**
```typescript
{
  success: true;
  data: {
    imported: number;
    failed: number;
    errors: string[]; // Validation errors for failed rows
  };
}
```

### Campaign Management Endpoints

#### GET /campaigns
List campaigns for authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  search?: string; // Search by campaign name
  date_from?: string; // ISO date
  date_to?: string; // ISO date
  limit?: number; // Default: 50
  offset?: number; // Default: 0
  order_by?: 'created_at' | 'updated_at' | 'scheduled_at' | 'name';
  ascending?: boolean; // Default: false
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    campaigns: Campaign[];
    total: number;
    has_more: boolean;
  };
}
```

#### POST /campaigns
Create new campaign.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name: string;
  message_body: string;
  customer_ids?: string[]; // Optional: specific customers
  scheduled_at?: string; // ISO timestamp for scheduling
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    campaign: Campaign;
  };
}
```

#### GET /campaigns/[id]
Get campaign details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  data: {
    campaign: Campaign;
    messages: CampaignMessage[];
    customers: Customer[];
  };
}
```

#### PUT /campaigns/[id]
Update campaign (only draft campaigns can be updated).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name?: string;
  message_body?: string;
  scheduled_at?: string; // ISO timestamp
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    campaign: Campaign;
  };
}
```

#### DELETE /campaigns/[id]
Delete campaign (only draft campaigns can be deleted).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  data: {
    message: "Campaign deleted successfully";
  };
}
```

#### POST /campaigns/[id]/send
Send campaign immediately.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  customer_ids?: string[]; // Optional: override campaign recipients
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    campaign: Campaign;
    message: "Campaign sending started";
  };
}
```

#### GET /campaigns/[id]/messages
Get messages for a campaign.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  status?: 'pending' | 'sent' | 'delivered' | 'failed';
  limit?: number; // Default: 50
  offset?: number; // Default: 0
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    messages: CampaignMessage[];
    total: number;
    has_more: boolean;
  };
}
```

### Campaign Template Endpoints

#### GET /templates
List campaign templates.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  category?: 'general' | 'marketing' | 'reminders' | 'alerts' | 'announcements';
  search?: string;
  limit?: number; // Default: 50
  offset?: number; // Default: 0
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    templates: CampaignTemplate[];
    total: number;
    has_more: boolean;
  };
}
```

#### POST /templates
Create new template.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name: string;
  message_body: string;
  category: 'general' | 'marketing' | 'reminders' | 'alerts' | 'announcements';
  is_default?: boolean; // Default: false
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    template: CampaignTemplate;
  };
}
```

#### PUT /templates/[id]
Update template.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name?: string;
  message_body?: string;
  category?: string;
  is_default?: boolean;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    template: CampaignTemplate;
  };
}
```

#### DELETE /templates/[id]
Delete template.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  data: {
    message: "Template deleted successfully";
  };
}
```

### Admin Endpoints

#### GET /admin/users
List all users (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
```typescript
{
  role?: 'admin' | 'user';
  status?: 'pending' | 'approved' | 'rejected';
  search?: string;
  limit?: number; // Default: 50
  offset?: number; // Default: 0
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    users: UserProfile[];
    total: number;
    has_more: boolean;
  };
}
```

#### PUT /admin/users/[id]
Update user profile (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```typescript
{
  role?: 'admin' | 'user';
  status?: 'pending' | 'approved' | 'rejected';
  approved_at?: string; // ISO timestamp
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    user: UserProfile;
  };
}
```

#### POST /admin/invites
Create new invite code (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```typescript
{
  email?: string;
  max_uses?: number; // Default: 1
  expires_at?: string; // ISO timestamp
  notes?: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    invite_code: InviteCode;
  };
}
```

#### GET /admin/invites
List invite codes (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
```typescript
{
  active_only?: boolean; // Default: false
  limit?: number; // Default: 50
  offset?: number; // Default: 0
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    invite_codes: InviteCode[];
    total: number;
    has_more: boolean;
  };
}
```

### Analytics Endpoints

#### GET /analytics/dashboard
Get dashboard analytics for authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  date_from?: string; // ISO date, default: 30 days ago
  date_to?: string; // ISO date, default: today
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    total_customers: number;
    active_customers: number;
    total_campaigns: number;
    sent_campaigns: number;
    total_messages: number;
    delivered_messages: number;
    delivery_rate: number; // percentage
    recent_campaigns: Campaign[];
    campaign_status_breakdown: {
      draft: number;
      scheduled: number;
      sending: number;
      sent: number;
      failed: number;
    };
  };
}
```

#### GET /analytics/campaigns/[id]
Get detailed analytics for a specific campaign.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  data: {
    campaign: Campaign;
    delivery_stats: {
      sent: number;
      delivered: number;
      failed: number;
      pending: number;
    };
    delivery_rate: number; // percentage
    status_breakdown: {
      pending: number;
      sent: number;
      delivered: number;
      failed: number;
    };
    timeline: Array<{
      date: string; // ISO date
      sent: number;
      delivered: number;
      failed: number;
    }>;
  };
}
```

## Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| AUTH_REQUIRED | 401 | Authentication token required |
| AUTH_INVALID | 401 | Invalid or expired authentication token |
| AUTH_INSUFFICIENT | 403 | Insufficient permissions for operation |
| VALIDATION_ERROR | 400 | Request validation failed |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists or conflict |
| RATE_LIMIT | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |
| DATABASE_ERROR | 500 | Database operation failed |
| TWILIO_ERROR | 502 | Twilio API error |
| EMAIL_ERROR | 502 | Email service error |

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Password reset: 3 requests per hour per email
- Campaign sending: 10 campaigns per hour per user
- General API: 100 requests per minute per user

## Webhooks

### Twilio Webhooks

#### POST /webhooks/twilio/sms-status
Receive SMS delivery status updates from Twilio.

**Request Body (Twilio format):**
```typescript
{
  MessageSid: string;
  MessageStatus: 'queued' | 'sent' | 'delivered' | 'undelivered' | 'failed';
  To: string;
  From: string;
  ErrorCode?: string;
  ErrorMessage?: string;
}
```

**Response:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response/>
```

## SDK Examples

### JavaScript/TypeScript

```typescript
// Initialize client
const client = new DNwerksClient({
  baseURL: 'https://your-domain.com/api',
  authToken: 'your-jwt-token'
});

// Create campaign
const campaign = await client.campaigns.create({
  name: 'Summer Sale',
  message_body: 'Get 20% off this weekend!',
  customer_ids: ['cust1', 'cust2']
});

// Send campaign
await client.campaigns.send(campaign.id);

// Get analytics
const analytics = await client.analytics.getDashboard({
  date_from: '2024-01-01',
  date_to: '2024-01-31'
});
```

### Python

```python
from dnwerks import DNwerksClient

# Initialize client
client = DNwerksClient(
    base_url='https://your-domain.com/api',
    auth_token='your-jwt-token'
)

# Create customer
customer = client.customers.create({
    'phone': '+1234567890',
    'first_name': 'John',
    'last_name': 'Doe',
    'email': 'john@example.com'
})

# List campaigns
campaigns = client.campaigns.list(
    status='sent',
    limit=10
)
```

## Testing

### Test Environment
- Base URL: `https://staging.your-domain.com/api`
- Test credentials provided in developer portal

### Mock Data
Use the `/mock` endpoints for testing:
- `POST /mock/customers` - Generate test customers
- `POST /mock/campaigns` - Generate test campaigns
- `POST /mock/messages` - Generate test message history

## Changelog

### v1.0.0 (Current)
- Initial API release
- Core CRUD operations for customers, campaigns, templates
- Authentication and authorization
- Password reset functionality
- Admin endpoints
- Basic analytics

### Upcoming v1.1.0
- Advanced segmentation
- A/B testing endpoints
- Webhook management
- Bulk operations
- Enhanced analytics