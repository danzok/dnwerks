# Two-Step Authentication System Test

## Testing the Authentication Flow

### 1. Password Validation Test
```bash
curl -X POST http://localhost:3000/api/validate-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

Expected response:
```json
{
  "message": "OK",
  "userId": "user-id-here",
  "userEmail": "test@example.com",
  "userRole": "user",
  "requiresToken": true
}
```

### 2. Token Generation Test (Admin Only)
First log in as admin, then:
```bash
curl -X POST http://localhost:3000/api/admin/generate-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_SESSION_TOKEN" \
  -d '{"expiresIn": 24, "description": "Test token"}'
```

Expected response:
```json
{
  "success": true,
  "token": "ABC123DEF456",
  "tokenId": "token-id",
  "expiresAt": "2025-11-11T14:30:00.000Z",
  "expiresIn": 24,
  "description": "Test token",
  "createdBy": "admin@example.com",
  "createdAt": "2025-11-10T14:30:00.000Z"
}
```

### 3. Token Validation Test
```bash
curl -X POST http://localhost:3000/api/validate-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ABC123DEF456",
    "userId": "user-id-here",
    "email": "test@example.com"
  }'
```

Expected response with sessionToken cookie:
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "id": "user-id-here",
    "email": "test@example.com",
    "role": "user"
  },
  "sessionToken": "generated-session-token",
  "expiresAt": "2025-11-11T14:30:00.000Z"
}
```

## Manual Testing Steps

### Step 1: Admin Login and Token Generation
1. Navigate to http://localhost:3000/sign-in
2. Log in as an admin user
3. Go to http://localhost:3000/admin
4. Click on the "Tokens" tab
5. Generate a new authentication token
6. Copy the generated token

### Step 2: User Authentication Flow
1. Open an incognito window
2. Navigate to http://localhost:3000/sign-in
3. Enter email and password, click "Submit Password"
4. You should see the token input field
5. Enter the token copied from the admin panel
6. Click "Submit Token"
7. You should see the welcome message and be redirected to dashboard

### Step 3: Session Validation
1. Check that sessionToken cookie is set
2. Navigate to different pages
3. Session should persist across page refreshes
4. Test logout functionality

## Key Features Implemented

✅ **Two-Step Authentication**: Password validation followed by token validation
✅ **Admin Token Generation**: Secure token creation with expiration
✅ **One-Time Use Tokens**: Tokens expire after first use
✅ **JavaScript-Accessible Cookies**: Session management for frontend
✅ **Admin Panel Integration**: Token management interface
✅ **Security Features**: Rate limiting, IP tracking, user validation
✅ **Error Handling**: Comprehensive error responses and validation

## Files Created/Modified

### New API Routes:
- `/api/validate-password` - Password validation endpoint
- `/api/validate-token` - Token validation and session creation
- `/api/admin/generate-token` - Admin token generation

### Modified Files:
- `/sign-in/page.tsx` - Two-step authentication UI
- `/admin/page.tsx` - Added token management tab

### Security Features:
- Rate limiting on password attempts
- Token expiration and one-time use
- IP and user agent logging
- Admin access controls
- Session token management

The authentication system is now fully functional and ready for testing!