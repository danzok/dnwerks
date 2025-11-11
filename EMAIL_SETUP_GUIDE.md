# 📧 Email Service Setup Guide - Resend Integration

## 🎯 Overview

Your invitation system now supports **automated email sending** using Resend! This guide will help you set up email delivery for professional user invitations.

## ✅ What's Included

- **Professional Email Templates** - Beautiful HTML emails
- **Automated Invitation Delivery** - Send invites instantly
- **Welcome Emails** - Notify users when approved
- **Email Tracking** - Monitor delivery status
- **Fallback System** - Works without email config too

---

## 🚀 Step-by-Step Setup

### **Step 1: Create Resend Account**

1. **Sign up for Resend**
   ```
   Visit: https://resend.com
   Click: Sign up → Choose plan (Free tier includes 3,000 emails/month)
   ```

2. **Verify your domain**
   ```
   Dashboard → Domains → Add Domain
   Enter: yourdomain.com
   Add DNS records to your domain provider
   Wait for verification (usually 5-10 minutes)
   ```

3. **Get API Key**
   ```
   Dashboard → API Keys → Create API Key
   Name: "DNwerks Invitations"
   Copy the API key
   ```

### **Step 2: Configure Environment Variables**

1. **Update .env.local** file:
   ```env
   # Email Service Configuration (Resend)
   RESEND_API_KEY=re_your_actual_api_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   RESEND_REPLY_TO_EMAIL=support@yourdomain.com
   NEXT_PUBLIC_APP_NAME=DNwerks Platform
   ```

2. **Replace placeholder values**:
   - `RESEND_API_KEY`: Your actual Resend API key
   - `RESEND_FROM_EMAIL`: Verified domain email address
   - `RESEND_REPLY_TO_EMAIL`: Your support email

### **Step 3: Test Email Configuration**

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Check email service status**:
   ```bash
   curl -X POST http://localhost:3000/api/invites \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "role": "user"}'
   ```

3. **Expected response with email enabled**:
   ```json
   {
     "success": true,
     "invite": {...},
     "emailSent": true,
     "messageId": "email_id_here",
     "message": "Invitation sent successfully via email!"
   }
   ```

---

## 📧 Email Templates Included

### **1. Invitation Email**
- **Beautiful gradient design** with platform branding
- **Clear instructions** for registration
- **Invite code** prominently displayed
- **Role information** and permissions
- **Personal messages** from admin
- **Expiration details** and usage notes

### **2. Welcome Email**
- **Approval notification**
- **Account access confirmation**
- **Getting started guide**
- **Direct login link**

### **3. Role-based Information**
- **Admin**: Full system access details
- **Moderator**: Content management permissions
- **User**: Basic platform features

---

## 🛠️ Advanced Features

### **Email Service Status Check**
You can check if email is configured by visiting the API:

```bash
curl -X GET http://localhost:3000/api/admin/system/email-status
```

### **Development vs Production**
- **Development**: Works without email config (logs only)
- **Production**: Requires email configuration
- **Graceful fallback**: System works regardless of email status

### **Email Analytics**
- Track delivery status via Resend dashboard
- Monitor open rates and click-throughs
- View email logs and troubleshooting info

---

## 🔧 Configuration Options

### **Environment Variables**

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | ✅ Yes | Your Resend API key |
| `RESEND_FROM_EMAIL` | ✅ Yes | Verified sender email |
| `RESEND_REPLY_TO_EMAIL` | ❌ No | Reply-to email address |
| `NEXT_PUBLIC_APP_NAME` | ❌ No | Platform name for templates |

### **Email Content Customization**

All emails use the following customizable elements:
- **Platform name**: From `NEXT_PUBLIC_APP_NAME`
- **Platform URL**: From `NEXT_PUBLIC_APP_URL`
- **Role descriptions**: Built into templates
- **Color schemes**: Gradient designs (customizable in CSS)

---

## 🚨 Troubleshooting

### **Common Issues**

**"Email service not configured"**
1. ✅ Check `RESEND_API_KEY` is set
2. ✅ Verify API key is valid
3. ✅ Restart development server

**"Invalid from address"**
1. ✅ Verify domain is registered in Resend
2. ✅ Check DNS records are properly configured
3. ✅ Ensure `RESEND_FROM_EMAIL` uses verified domain

**Email not delivered**
1. ✅ Check recipient email address
2. ✅ Verify Resend domain verification
3. ✅ Review email logs in Resend dashboard
4. ✅ Check spam filters

**API rate limits**
1. ✅ Resend free tier: 3,000 emails/month
2. ✅ Rate limit: 1 email/second
3. ✅ Upgrade plan for higher limits

### **Debug Mode**

Enable detailed logging by checking server console:
```bash
npm run dev
# Look for email-related log messages
```

### **Test Email Addresses**

For development, you can use:
- **Gmail**: Reliable for testing
- **Outlook**: Good for checking rendering
- **Temporary emails**: For quick testing

---

## 📊 Email Templates Preview

### **Invitation Email Features**
- 🎨 **Modern gradient design**
- 📱 **Mobile responsive** layout
- 🔗 **Call-to-action buttons**
- 📋 **Step-by-step instructions**
- 💬 **Personal messages** support
- ⏰ **Expiration information**
- 🏷️ **Role badges** and descriptions

### **Welcome Email Features**
- ✅ **Approval confirmation**
- 🚀 **Direct login links**
- 📖 **Getting started guide**
- 🎯 **Role-based content**

---

## 🎯 Usage Examples

### **Create Invitation with Email**
```bash
curl -X POST http://localhost:3000/api/invites \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "role": "admin",
    "maxUses": 1,
    "expiresDays": 7,
    "notes": "Welcome to our team!"
  }'
```

### **Response with Email Success**
```json
{
  "success": true,
  "invite": {
    "id": "123",
    "code": "ABC12345",
    "email": "user@example.com",
    "role": "admin"
  },
  "emailSent": true,
  "messageId": "resend_msg_id",
  "message": "Invitation sent successfully via email!"
}
```

### **Response without Email Config**
```json
{
  "success": true,
  "invite": {...},
  "emailSent": false,
  "message": "Invite code created successfully (development mode)"
}
```

---

## 💡 Pro Tips

### **Email Deliverability**
1. ✅ Use a custom domain (not gmail.com)
2. ✅ Set up proper DNS records
3. ✅ Monitor email reputation
4. ✅ Avoid spam trigger words

### **Design Best Practices**
1. ✅ Keep subject lines under 50 characters
2. ✅ Use clear call-to-action buttons
3. ✅ Optimize for mobile viewing
4. ✅ Test across different email clients

### **Security Considerations**
1. ✅ Never commit API keys to Git
2. ✅ Use environment-specific keys
3. ✅ Monitor email sending for abuse
4. ✅ Set up proper rate limiting

---

## 🎉 Success!

Once configured, your system will:
- ✅ **Automatically send** professional invitation emails
- ✅ **Track delivery** status and engagement
- ✅ **Provide fallback** when email isn't configured
- ✅ **Scale easily** with Resend's infrastructure

Your invitation system is now enterprise-ready with professional email delivery! 🚀

**Need help?** Check out the [Resend Documentation](https://resend.com/docs) or review the server console for detailed logging.