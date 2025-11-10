# Deployment Guide for DNwerks

This guide covers various deployment options for the DNwerks SMS Campaign Management Platform.

## 🚀 Quick Deploy with Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account
- Supabase project
- Twilio account

### Step 1: Connect Repository

1. **Sign in to Vercel** at [vercel.com](https://vercel.com)
2. **Click "New Project"**
3. **Import Git Repository**
   - Choose your GitHub repository
   - Click "Import"

### Step 2: Configure Environment Variables

Add these environment variables in Vercel:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_URL=https://your-domain.vercel.app/api/webhooks/twilio

# Bitly (optional)
BITLY_ACCESS_TOKEN=your_bitly_token

# Cron Secret
CRON_SECRET=generate_secure_random_string
```

### Step 3: Deploy

1. **Click "Deploy"**
2. **Wait for build** to complete
3. **Visit your deployed site**

## 🐳 Docker Deployment

### Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Build and Run

```bash
# Build image
docker build -t dnwerks .

# Run container
docker run -p 3000:3000 --env-file .env.production dnwerks
```

## 🌐 Manual Deployment

### Build for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm start
```

### Using PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start npm --name "dnwerks" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### PM2 Configuration File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'dnwerks',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
```

## 🔧 Environment Configuration

### Production Environment Variables

Create `.env.production`:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key

# Database
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres

# Twilio Production
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_production_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_URL=https://your-domain.com/api/webhooks/twilio

# Bitly Production
BITLY_ACCESS_TOKEN=your_production_bitly_token

# Cron Secret
CRON_SECRET=your_secure_cron_secret_here
```

### Security Considerations

1. **Use HTTPS** for production
2. **Secure your environment variables**
3. **Update all API keys** before deployment
4. **Configure proper CORS** in Supabase
5. **Set up monitoring** and alerting

## 📊 Monitoring and Logging

### Application Monitoring

**Vercel Analytics** (automatic):
- Page views and performance
- API route performance
- Error tracking

**Custom monitoring**:
```typescript
// lib/monitoring.ts
export function logEvent(event: string, data?: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to your monitoring service
    console.log(`[EVENT] ${event}:`, data);
  }
}

export function logError(error: Error, context?: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service
    console.error(`[ERROR] ${error.message}:`, { error, context });
  }
}
```

### Health Check Endpoint

Create `app/api/health/route.ts`:

```typescript
export async function GET() {
  try {
    // Check database connection
    // Check external service health
    // Return health status

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        supabase: 'connected',
        twilio: 'connected'
      }
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run type check
      run: npm run type-check

    - name: Run linting
      run: npm run lint

    - name: Run tests
      run: npm test

    - name: Build application
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

### Required Secrets

Add these secrets to your GitHub repository:

- `VERCEL_TOKEN`: Your Vercel API token
- `ORG_ID`: Your Vercel organization ID
- `PROJECT_ID`: Your Vercel project ID
- `SUPABASE_URL`: Your Supabase URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key

## 🔍 Troubleshooting

### Common Issues

#### 1. Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 2. Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase project status
- Ensure SSL is properly configured
- Verify network connectivity

#### 3. API Route Errors
- Check environment variables
- Verify API endpoints are properly configured
- Check CORS settings in Supabase
- Review API route implementations

#### 4. Twilio Issues
- Verify Twilio credentials
- Check phone number configuration
- Ensure webhook URL is accessible
- Verify Twilio account status

### Debugging Production Issues

1. **Check logs** in your hosting platform
2. **Use browser developer tools** for client-side issues
3. **Test API endpoints** directly
4. **Verify environment variables** are correctly set
5. **Check external service status** (Supabase, Twilio)

## 📚 Additional Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Production Guide](https://supabase.com/docs/guides/platform/going-into-prod)
- [Twilio Deployment Best Practices](https://www.twilio.com/docs/usage/security)

## 🆘 Support

If you encounter deployment issues:

1. **Check the logs** for specific error messages
2. **Review this guide** for common solutions
3. **Search GitHub issues** for similar problems
4. **Create a new issue** with details about your problem
5. **Contact support** for platform-specific issues

Remember to never commit sensitive information like API keys or database credentials to your repository!