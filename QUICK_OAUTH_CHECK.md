# Quick OAuth Configuration Check

## Current Code Analysis

Your code at commit `987edd1` expects:
- **Redirect URL:** `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/auth/callback?next=/`
- **Callback Route:** `/api/auth/callback` ✅ (exists)

## Critical Checks

### 1. Supabase Redirect URLs (MOST IMPORTANT)

Go to: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub/auth/url-configuration

**Must have EXACTLY:**
```
http://localhost:3000/api/auth/callback
https://ecomm-next-yf7p.vercel.app/api/auth/callback
```

**❌ Common mistakes:**
- Missing `/api/auth/callback` (just has `/`)
- Has `/auth/callback` instead of `/api/auth/callback`
- Missing `http://` or `https://`

### 2. Google Cloud Console

Go to: https://console.cloud.google.com/apis/credentials

**Authorized redirect URIs must have:**
```
https://eqqcidlflclgegsalbub.supabase.co/auth/v1/callback
```

**This is Supabase's URL, NOT your app's URL!**

### 3. Local Environment Variables

Check `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://eqqcidlflclgegsalbub.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Test Flow

1. Clear browser cache
2. Go to `http://localhost:3000/auth`
3. Click "Sign in with Google"
4. **Check the URL after Google redirects:**
   - ✅ Should be: `http://localhost:3000/api/auth/callback?code=...`
   - ❌ NOT: `http://localhost:3000/?code=...`

## What Error Are You Seeing?

Please share:
1. **What happens when you click "Sign in with Google"?**
   - Does it redirect to Google?
   - Does it redirect back?
   - What URL does it redirect to?
   - What error message appears?

2. **Browser console errors:**
   - Open DevTools (F12) → Console
   - What errors do you see?

3. **Network tab:**
   - Open DevTools → Network
   - Click "Sign in with Google"
   - What requests fail?

## Most Likely Issues

1. **Supabase redirect URL wrong** (90% of issues)
   - Check: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub/auth/url-configuration
   - Must have: `http://localhost:3000/api/auth/callback`

2. **Google Console missing Supabase URL** (5% of issues)
   - Check: Google Cloud Console → Credentials
   - Must have: `https://eqqcidlflclgegsalbub.supabase.co/auth/v1/callback`

3. **Environment variables not set** (5% of issues)
   - Check: `.env.local` file exists and has correct values

---

## Quick Fix Commands

After checking Supabase, restart your dev server:

```bash
# Kill any running processes
taskkill /F /IM node.exe

# Start fresh
npm run dev
```

Then test OAuth again.

