# Fix Supabase Redirect URL Configuration

## Critical Issue

The OAuth code is being redirected to `/?code=...` instead of `/api/auth/callback?code=...`. This means **Supabase redirect URL configuration is wrong**.

## Solution: Update Supabase Redirect URLs

### Step 1: Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub
2. Navigate to **Authentication** → **URL Configuration**

### Step 2: Update Redirect URLs

In the **Redirect URLs** field, make sure you have:

**For Local Development:**
```
http://localhost:3000/api/auth/callback
```

**For Production (Vercel):**
```
https://ecomm-next-yf7p.vercel.app/api/auth/callback
```

**For Custom Domain (if using):**
```
https://shooshka.online/api/auth/callback
```

### Step 3: Update Site URL

**Site URL** should be:
- Local: `http://localhost:3000`
- Production: `https://ecomm-next-yf7p.vercel.app`
- Custom Domain: `https://shooshka.online`

### Step 4: Remove Wrong URLs

**Remove these if they exist:**
- `http://localhost:3000/` ❌
- `http://localhost:3000/auth/callback` ❌
- `https://ecomm-next-yf7p.vercel.app/` ❌
- Any URL that doesn't end with `/api/auth/callback` ❌

### Step 5: Save and Test

1. Click **Save**
2. Clear browser cache
3. Try Google sign-in again
4. Should redirect to `/api/auth/callback?code=...` ✅

## Why This Matters

- Supabase uses the redirect URL to know where to send the OAuth code
- If it's set to `/`, the code goes to the home page
- If it's set to `/api/auth/callback`, the code goes to the callback route
- The callback route can then exchange the code for a session

## Current Code Expects

The code in `app/auth/page.tsx` sets:
```typescript
const callbackUrl = `${redirectUrl}/api/auth/callback?next=/`
```

So Supabase **must** have `/api/auth/callback` in the redirect URLs list.

## Verification

After updating, test by:
1. Clicking "Sign in with Google"
2. After authorizing, check the URL
3. Should be: `http://localhost:3000/api/auth/callback?code=...`
4. NOT: `http://localhost:3000/?code=...`

