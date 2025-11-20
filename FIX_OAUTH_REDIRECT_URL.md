# Fix OAuth Redirect URL Issue

## Problem
OAuth code is being redirected to `/?code=...` instead of `/api/auth/callback?code=...`

## Root Cause
Supabase redirect URL configuration doesn't match what we're using in the code.

## Solution

### Step 1: Check Supabase Redirect URLs

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub
2. Navigate to **Authentication** → **URL Configuration**
3. Check **Redirect URLs**

### Step 2: Update Redirect URLs

Make sure these URLs are in the **Redirect URLs** list:

**For Production (Vercel):**
```
https://ecomm-next-yf7p.vercel.app/api/auth/callback
```

**For Custom Domain (if using):**
```
https://shooshka.online/api/auth/callback
```

**For Local Development:**
```
http://localhost:3000/api/auth/callback
```

### Step 3: Update Site URL

**Site URL** should be:
- Production: `https://ecomm-next-yf7p.vercel.app`
- Custom Domain: `https://shooshka.online`
- Local: `http://localhost:3000`

### Step 4: Important Notes

1. **Exact Match Required**: The redirect URL must match **exactly** what's in the code
2. **No Trailing Slash**: Use `/api/auth/callback` not `/api/auth/callback/`
3. **Include Protocol**: Must include `https://` or `http://`
4. **Multiple URLs**: You can add multiple redirect URLs (one per line)

### Step 5: Test

After updating:
1. Clear browser cache
2. Try Google sign-in again
3. Should redirect to `/api/auth/callback?code=...` (not `/?code=...`)

## Temporary Fix

I've added code to catch the code parameter on the home page and redirect it to the callback route. This is a **safety measure**, but you should still fix the Supabase configuration.

## Why This Happened

Supabase might have been configured with just `/` as the redirect URL, or the redirect URL wasn't updated when we changed from `/auth/callback` to `/api/auth/callback`.

