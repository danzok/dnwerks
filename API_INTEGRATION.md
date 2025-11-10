# API Integration Guide

This guide covers the setup and configuration of external APIs used in DNwerks.

## 📋 Overview

DNwerks integrates with several external services:

- **Supabase**: Database and authentication
- **Twilio**: SMS messaging and webhooks
- **Bitly**: URL shortening (optional)

## 🗄️ Supabase Integration

### Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Set project name and password
   - Select a region closest to your users

2. **Get Project Credentials**
   - Go to Project Settings → API
   - Copy the Project URL and API keys
   - You'll need these for environment variables

3. **Configure Authentication**
   - Go to Authentication → Settings
   - Configure site URL and redirect URLs
   - Enable email/password authentication
   - Set up custom SMTP if desired

### Database Setup

Run the database setup script:

```bash
npm run db:setup
```

This will:
- Create all necessary tables
- Set up relationships and constraints
- Create indexes for performance
- Set up Row Level Security (RLS)

### Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
DATABASE_URL=postgresql://postgres:your_password@db.your-project-id.supabase.co:5432/postgres?sslmode=require
```

### Row Level Security (RLS)

DNwerks uses Supabase's RLS for security:

```sql
-- Example: Users can only access their own data
CREATE POLICY "Users can view own campaigns" ON campaigns
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns" ON campaigns
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON campaigns
FOR UPDATE USING (auth.uid() = user_id);
```

### Real-time Subscriptions

Enable real-time updates:

```typescript
// lib/supabase-client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

// Subscribe to campaign updates
const subscription = supabase
  .channel('campaign_changes')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'campaigns',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // Handle real-time updates
      console.log('Campaign updated:', payload)
    }
  )
  .subscribe()
```

## 📱 Twilio Integration

### Setup

1. **Create a Twilio Account**
   - Go to [twilio.com](https://twilio.com)
   - Sign up for a free trial
   - Verify your phone number

2. **Get a Phone Number**
   - Go to Phone Numbers → Buy a Number
   - Choose a number with SMS capability
   - Complete the purchase

3. **Get API Credentials**
   - Go to Console → Settings
   - Copy Account SID and Auth Token

### Environment Variables

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_URL=https://your-domain.com/api/webhooks/twilio
```

### Sending SMS Messages

```typescript
// lib/twilio.ts
import { Twilio } from 'twilio'

const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function sendSMS(
  to: string,
  body: string,
  mediaUrl?: string[]
) {
  try {
    const message = await twilioClient.messages.create({
      body,
      to,
      from: process.env.TWILIO_PHONE_NUMBER!,
      mediaUrl: mediaUrl || []
    })

    return {
      success: true,
      messageId: message.sid,
      status: message.status
    }
  } catch (error) {
    console.error('Twilio error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
```

### Webhook Configuration

1. **Configure Phone Number Webhook**
   - Go to Phone Numbers → Active Numbers
   - Select your number
   - Under "Messaging", configure "A MESSAGE COMES IN"
   - Set Webhook URL to: `https://your-domain.com/api/webhooks/twilio`

2. **Webhook Handler**

```typescript
// app/api/webhooks/twilio/route.ts
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const twiml = twilio.twiml.MessagingResponse

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const messageSid = formData.get('MessageSid') as string
  const from = formData.get('From') as string
  const body = formData.get('Body') as string

  // Handle incoming message
  console.log(`Received message from ${from}: ${body}`)

  // Process opt-out requests
  if (body.toLowerCase().trim() === 'stop') {
    // Add customer to opt-out list
    await handleOptOut(from)

    const response = new twiml()
    response.message({
      body: "You've been opted out. Reply START to opt back in."
    })

    return new NextResponse(response.toString(), {
      headers: { 'Content-Type': 'text/xml' }
    })
  }

  // Handle other message types
  await handleIncomingMessage(from, body)

  // Empty response
  return new NextResponse('', { status: 200 })
}
```

### Handling Message Status Updates

```typescript
// lib/message-tracking.ts
export async function handleMessageStatus(
  messageSid: string,
  status: string
) {
  // Update message status in database
  const { error } = await supabase
    .from('campaign_messages')
    .update({
      status: status.toLowerCase(),
      delivered_at: status === 'delivered' ? new Date().toISOString() : null
    })
    .eq('twilio_sid', messageSid)

  if (error) {
    console.error('Error updating message status:', error)
  }
}
```

## 🔗 Bitly Integration (Optional)

### Setup

1. **Create a Bitly Account**
   - Go to [bitly.com](https://bitly.com)
   - Sign up for a free or paid plan

2. **Generate Access Token**
   - Go to Settings → Developer
   - Generate a Generic Access Token

### Environment Variables

```env
# Bitly Configuration
BITLY_ACCESS_TOKEN=your_bitly_access_token_here
```

### URL Shortening

```typescript
// lib/bitly.ts
interface BitlyResponse {
  id: string
  link: string
  custom_bitlinks: string[]
  long_url: string
  archived: boolean
  tags: string[]
  created_at: string
  references: { group: string }
}

export async function shortenUrl(longUrl: string): Promise<string> {
  try {
    const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BITLY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        long_url: longUrl,
        domain: 'bit.ly'
      })
    })

    if (!response.ok) {
      throw new Error(`Bitly API error: ${response.statusText}`)
    }

    const data: BitlyResponse = await response.json()
    return data.link
  } catch (error) {
    console.error('Bitly error:', error)
    return longUrl // Return original URL if shortening fails
  }
}
```

## 🔧 Configuration Examples

### Development Environment

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev_anon_key
SUPABASE_SERVICE_ROLE_KEY=dev_service_key
TWILIO_ACCOUNT_SID=AC_dev_account_sid
TWILIO_AUTH_TOKEN=dev_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_URL=http://localhost:3000/api/webhooks/twilio
BITLY_ACCESS_TOKEN=dev_bitly_token
```

### Production Environment

```env
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=prod_service_key
TWILIO_ACCOUNT_SID=AC_prod_account_sid
TWILIO_AUTH_TOKEN=prod_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_URL=https://your-domain.com/api/webhooks/twilio
BITLY_ACCESS_TOKEN=prod_bitly_token
```

## 🧪 Testing API Integrations

### Local Testing

```typescript
// scripts/test-apis.ts
import { sendSMS } from '../lib/twilio'
import { shortenUrl } from '../lib/bitly'

async function testTwilio() {
  const result = await sendSMS(
    '+1234567890', // Your phone number
    'Test message from DNwerks'
  )
  console.log('Twilio test result:', result)
}

async function testBitly() {
  const result = await shortenUrl('https://example.com/very-long-url')
  console.log('Bitly test result:', result)
}

// Run tests
async function runTests() {
  console.log('Testing API integrations...')
  await testTwilio()
  await testBitly()
}

runTests().catch(console.error)
```

### Using ngrok for Local Webhook Testing

```bash
# Install ngrok
npm install -g ngrok

# Start your development server
npm run dev

# In another terminal, expose localhost to internet
ngrok http 3000

# Use the ngrok URL for Twilio webhook:
# https://your-ngrok-id.ngrok.io/api/webhooks/twilio
```

## 📊 Monitoring API Usage

### Twilio Usage Monitoring

```typescript
// lib/twilio-monitoring.ts
export async function getTwilioUsage() {
  const client = new Twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  )

  try {
    const usage = await client.usage.records.lastMonth.list({
      category: 'sms'
    })

    return usage
  } catch (error) {
    console.error('Error fetching Twilio usage:', error)
    return []
  }
}
```

### Supabase Usage Monitoring

```typescript
// lib/supabase-monitoring.ts
export async function getDatabaseStats() {
  try {
    const { data: campaignCount } = await supabase
      .from('campaigns')
      .select('id', { count: 'exact' })

    const { data: customerCount } = await supabase
      .from('customers')
      .select('id', { count: 'exact' })

    const { data: messageCount } = await supabase
      .from('campaign_messages')
      .select('id', { count: 'exact' })

    return {
      campaigns: campaignCount?.length || 0,
      customers: customerCount?.length || 0,
      messages: messageCount?.length || 0
    }
  } catch (error) {
    console.error('Error fetching database stats:', error)
    return { campaigns: 0, customers: 0, messages: 0 }
  }
}
```

## 🚨 Error Handling

### Common API Errors

```typescript
// lib/api-error-handler.ts
export class APIError extends Error {
  constructor(
    message: string,
    public service: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export function handleAPIError(error: any, service: string): APIError {
  if (error.code) {
    // Twilio error
    return new APIError(
      error.message,
      'twilio',
      error.code,
      error.status
    )
  } else if (error.status) {
    // Supabase/HTTP error
    return new APIError(
      error.message,
      service,
      undefined,
      error.status
    )
  } else {
    // Generic error
    return new APIError(
      error.message || 'Unknown error',
      service
    )
  }
}
```

## 🔐 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all credentials
3. **Validate all inputs** before API calls
4. **Implement rate limiting** for API endpoints
5. **Use HTTPS** for all API communications
6. **Regularly rotate API keys** and tokens
7. **Monitor API usage** for unusual activity
8. **Implement proper error handling** without exposing sensitive data

## 📞 Support Resources

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Twilio Docs**: [https://www.twilio.com/docs](https://www.twilio.com/docs)
- **Bitly API Docs**: [https://dev.bitly.com/api-reference](https://dev.bitly.com/api-reference)
- **Community Forums**: Ask questions in the respective service communities

For issues specific to DNwerks API integrations, please create an issue in the GitHub repository.