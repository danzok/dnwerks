# Development Testing Guide - Two-Step Authentication

## 🚀 Current Status
- ✅ **Development Server**: Running on http://localhost:3000
- ✅ **Login Page**: http://localhost:3000/login (two-step auth)
- ✅ **Admin Panel**: http://localhost:3000/admin (with dev bypass)
- ✅ **Development Bypass**: Enabled for easier testing

## 🧪 Testing Steps

### Step 1: Test Password Validation
1. **Go to**: http://localhost:3000/login
2. **Enter**: Any email (e.g., `test@example.com`)
3. **Enter**: Any password (e.g., `password123`)
4. **Click**: "Validate Password"
5. **Expected**: Success message and token input appears

### Step 2: Generate Authentication Token
1. **Go to**: http://localhost:3000/admin
2. **Click**: "Tokens" tab
3. **Fill out**:
   - Expires In: `24` (hours)
   - Description: `Test token`
4. **Click**: "Generate Token"
5. **Copy**: The generated token (e.g., `ABC123DEF456`)

### Step 3: Complete Two-Step Authentication
1. **Return to**: http://localhost:3000/login
2. **Enter**: Token from Step 2 in the token field
3. **Click**: "Submit Token"
4. **Expected**: Success message and redirect to dashboard

## 🔧 Development Features Enabled

### Password Validation Bypass
- Any email/password combination will work
- Returns mock user data for testing
- Bypasses Supabase authentication

### Admin Token Generation Bypass
- No admin authentication required
- Mock admin user (`dev-admin@example.com`)
- Full token management functionality

### Token Validation
- Works with real database tokens
- Creates session cookies
- Proper one-time use token behavior

## 🐛 Common Issues & Solutions

### Issue: "Password validation failed: Invalid API key"
**Solution**: Development bypass should now handle this automatically

### Issue: 401 Unauthorized on admin endpoints
**Solution**: Development bypass is enabled - try refreshing the admin page

### Issue: Token validation fails
**Solution**: Make sure you're using a token generated in the last 24 hours

## 📋 Test Checklist

- [ ] Password validation with any credentials works
- [ ] Token input appears after password validation
- [ ] Admin panel loads without authentication errors
- [ ] Token generation works in admin panel
- [ ] Generated tokens can be copied to clipboard
- [ ] Token validation works and creates session
- [ ] User is redirected to dashboard after successful auth
- [ ] Session persists on page refresh
- [ ] Logout functionality works

## 🎯 Quick Test Commands

### Test Password Validation
```bash
curl -X POST http://localhost:3000/api/validate-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### Test Token Generation
```bash
curl -X POST http://localhost:3000/api/admin/generate-token \
  -H "Content-Type: application/json" \
  -d '{"expiresIn": 24, "description": "Test token"}'
```

### Test Token Validation
```bash
# Use the token from the previous command
curl -X POST http://localhost:3000/api/validate-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN_HERE",
    "userId": "dev-user-id",
    "email": "test@example.com"
  }'
```

## 🔍 Debugging Tips

1. **Check Browser Console**: Look for any JavaScript errors
2. **Check Network Tab**: Verify API calls are successful
3. **Check Server Logs**: Look for error messages in terminal
4. **Check Cookies**: Verify sessionToken is set after successful auth
5. **Check Database**: Verify tokens are being created and marked as used

## 🎉 Success Indicators

- Password validation returns success message
- Token input field appears smoothly
- Admin panel loads without 401 errors
- Token generation shows success message
- Token validation completes and sets cookie
- User redirected to dashboard with welcome message
- Session persists across page refreshes

The authentication system is now ready for full testing! 🚀