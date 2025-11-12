# DNwerks Cleanup Implementation Plan

## Overview
This document provides step-by-step instructions to fix all identified issues before deploying to Vercel production.

## Phase 1: Fix TypeScript Errors

### 1.1 Property Name Mismatches in Database Models

**Files to Fix:**
- `src/lib/scheduler.ts`
- `src/lib/campaign-queue.ts`

**Issues:**
- `userId` should be `user_id`
- `scheduledAt` should be `scheduled_at`
- `messageBody` should be `message_body`
- `phoneNumber` should be `phone_number`
- `twilioSid` should be `twilio_sid`

**Solution:**
```typescript
// In scheduler.ts, line 40-41
// Change from:
userId: campaign.userId,
scheduledAt: campaign.scheduledAt,
// To:
user_id: campaign.user_id,
scheduled_at: campaign.scheduled_at,

// In scheduler.ts, line 278
// Change from:
userId: campaign.userId,
messageBody: campaign.messageBody,
// To:
user_id: campaign.user_id,
message_body: campaign.message_body,

// In scheduler.ts, line 304, 314
// Change from:
userId: campaign.userId,
scheduledAt: campaign.scheduledAt,
// To:
user_id: campaign.user_id,
scheduled_at: campaign.scheduled_at,

// In campaign-queue.ts, line 317
// Change from:
const supabase = createClient();
// To:
const supabase = await createClient();

// In campaign-queue.ts, line 321, 324
// Change from:
customer.phoneNumber,
customer.twilioSid,
// To:
customer.phone_number,
customer.twilio_sid,
```

### 1.2 Missing Module Declarations

**Files to Fix:**
- `scripts/create-custom-admin.ts`
- `scripts/setup-admin.ts`

**Issue:**
Missing `../src/lib/auth-utils.js` module

**Solution:**
1. Check if `src/lib/auth-utils.ts` exists
2. If not, create it with necessary auth utilities
3. Update import statements to use `.ts` extension

### 1.3 Supabase Edge Function Types

**File to Fix:**
- `supabase/functions/create-user/index.ts`

**Issues:**
- Cannot find Deno types
- Cannot find external module declarations

**Solution:**
Create `supabase/functions/create-user/deno.json`:
```json
{
  "compilerOptions": {
    "allowJs": true,
    "lib": ["deno.window"]
  },
  "lint": {
    "rules": {
      "tags": ["recommended"]
    }
  }
}
```

Add at top of `index.ts`:
```typescript
/// <reference types="https://deno.land/x/deno@v1.36.3/lib/deno.ns.d.ts" />
```

## Phase 2: Fix ESLint Errors

### 2.1 Variable Accessed Before Declaration

**File to Fix:**
- `src/components/theme-provider.tsx`

**Issue:**
`updateTheme` is accessed before it's declared (line 58)

**Solution:**
Move `updateTheme` function declaration before its usage:

```typescript
// Move this function before line 56
const updateTheme = (updates: Partial<ThemeConfig>) => {
  const updated = { ...theme, ...updates };
  setTheme(updated);
  localStorage.setItem('theme-preferences', JSON.stringify(updated));
};

// Then the useEffect can use it
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.matches && !theme.reducedMotion) {
    updateTheme({ reducedMotion: true });
  }
}, []);
```

### 2.2 Impure Function During Render

**File to Fix:**
- `src/components/ui/sidebar.tsx`

**Issue:**
`Math.random()` is called during render (line 665)

**Solution:**
Replace with a deterministic value or move to useEffect:

```typescript
// Option 1: Use a fixed value
const width = "75%"; // Fixed width instead of random

// Option 2: Generate once on mount
const [width, setWidth] = useState("75%");

useEffect(() => {
  setWidth(`${Math.floor(Math.random() * 40) + 50}%`);
}, []);
```

## Phase 3: Dependency Management

### 3.1 Remove Unused Dependencies

**Run these commands:**
```bash
# Remove unused production dependencies
npm uninstall @hookform/resolvers @supabase/auth-helpers-nextjs clerk resend

# Remove unused dev dependencies
npm uninstall --save-dev @chromatic-com/storybook @shadcn/ui @storybook/addon-docs @storybook/addon-onboarding @vitest/coverage-v8 autoprefixer depcheck postcss supabase
```

### 3.2 Add Missing Dependency

**Run this command:**
```bash
npm install --save-dev node-fetch
```

## Phase 4: Git Repository Cleanup

### 4.1 Stage and Commit Changes

```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "Fix TypeScript and ESLint errors, clean up dependencies"
```

### 4.2 Switch to Main Branch

```bash
# Switch to main branch
git checkout main

# Merge clean-slate changes
git merge clean-slate

# Push to remote
git push origin main
```

## Phase 5: Environment Variables Verification

### 5.1 Check Vercel Environment Variables

Ensure these are configured in Vercel dashboard:
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
BITLY_ACCESS_TOKEN=your_bitly_token_here
CRON_SECRET=your_random_secret_here_for_cron_jobs
```

## Phase 6: Final Validation

### 6.1 Run Validation Commands

```bash
# Check TypeScript
npm run type-check

# Check ESLint
npm run lint

# Build project
npm run build
```

### 6.2 Deploy to Vercel

```bash
# Use the deployment script
deploy-to-vercel.bat

# Or manually
git pull origin main
vercel --prod
```

## Success Criteria

The project is ready for deployment when:
- ✅ `npm run type-check` passes without errors
- ✅ `npm run lint` passes without errors
- ✅ `npm run build` completes successfully
- ✅ All changes are committed to main branch
- ✅ Environment variables are configured in Vercel

## Rollback Plan

If deployment fails:
1. Check Vercel build logs for specific errors
2. Fix identified issues
3. Re-run deployment
4. If necessary, rollback to previous working version:
   ```bash
   git checkout HEAD~1
   git push origin main --force
   vercel --prod
   ```

## Time Estimate

- Phase 1 (TypeScript fixes): 30-45 minutes
- Phase 2 (ESLint fixes): 15-20 minutes
- Phase 3 (Dependencies): 10 minutes
- Phase 4 (Git cleanup): 10 minutes
- Phase 5 (Environment): 5 minutes
- Phase 6 (Validation & Deploy): 15 minutes

**Total estimated time: 1.5 - 2 hours**