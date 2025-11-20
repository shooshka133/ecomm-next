# Testing OAuth Flow - Step by Step

## Current Issue

The OAuth code is not appearing in the URL when testing locally. This is because:

1. **Redirect URL mismatch**: The code was using `process.env.NEXT_PUBLIC_APP_URL` which might be set to production URL
2. **Supabase redirect URLs**: Need to ensure localhost is configured in Supabase

## Fix Applied

✅ Changed `app/auth/page.tsx` to always use `window.location.origin` for redirect URL
- This ensures localhost is used when testing locally
- Production URL is used when deployed

## Next Steps to Test

### 1. Clear Browser Data
```bash
# Clear cookies, cache, and sessionStorage
# In Chrome DevTools: Application → Clear storage → Clear site data
```

### 2. Verify Supabase Redirect URLs

Go to: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub/auth/url-configuration

**Must have these URLs:**
- ✅ `http://localhost:3000/api/auth/callback`
- ✅ `https://ecomm-next-yf7p.vercel.app/api/auth/callback`
- ✅ `https://shooshka.online/api/auth/callback` (if using custom domain)

**Remove these if they exist:**
- ❌ `http://localhost:3000/`
- ❌ `http://localhost:3000/auth/callback`
- ❌ Any URL that doesn't end with `/api/auth/callback`

### 3. Test Google Sign-In

1. Open: `http://localhost:3000/auth`
2. Click "Sign in with Google"
3. **Check console** - should see:
   ```
   🔗 Google OAuth - Redirect URL: http://localhost:3000/api/auth/callback?next=/
   ```
4. After Google authorization, check the URL:
   - ✅ Should be: `http://localhost:3000/api/auth/callback?code=...`
   - ❌ NOT: `http://localhost:3000/?code=...`

### 4. Check Pre-Hydration Script

After redirect, check console for:
```
🔍 [Pre-Hydration Script] Running... {url: "...", search: "?code=...", hasCode: true}
🚨 [Pre-Hydration] OAuth code captured: ...
✅ [Pre-Hydration] Code stored in sessionStorage
```

### 5. Check OAuth Handler

Should see:
```
🚨 [OAuth Handler] Found code in sessionStorage (captured before hydration)
🔄 [OAuth Handler] OAuth code detected on home page, exchanging directly...
```

## If Code Still Doesn't Appear

### Check 1: Verify Redirect URL in Console
When clicking "Sign in with Google", check the console log:
```
🔗 Google OAuth - Redirect URL: ...
```

Should show `http://localhost:3000/api/auth/callback?next=/` (not production URL)

### Check 2: Check Supabase Logs
1. Go to: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub/logs/edge-logs
2. Filter by "auth"
3. Look for redirect errors

### Check 3: Test Direct Callback Route
Try accessing directly:
```
http://localhost:3000/api/auth/callback?code=test123
```

Should see error in console (but confirms route is accessible)

## Expected Flow

1. User clicks "Sign in with Google"
2. Redirects to Google OAuth
3. User authorizes
4. Google redirects to: `http://localhost:3000/api/auth/callback?code=...`
5. Server-side route (`app/api/auth/callback/route.ts`) exchanges code for session
6. Redirects to: `/?auth=success`
7. Client-side handler (`app/page.tsx`) detects `auth=success` and reloads page
8. User is signed in ✅

## If Redirect Goes to Home Page Instead

If the code appears on `/?code=...` instead of `/api/auth/callback?code=...`:

1. **Check Supabase redirect URLs** - must include `/api/auth/callback`
2. **Check redirect URL in console** - should show `/api/auth/callback`
3. **Clear browser cache** - old redirect URLs might be cached

## Debugging Commands

In browser console:
```javascript
// Check sessionStorage for captured code
sessionStorage.getItem('oauth_code_pending')

// Check all sessionStorage keys
Object.keys(sessionStorage).filter(k => k.includes('oauth') || k.includes('auth'))

// Check current URL
window.location.href

// Check URL params
new URLSearchParams(window.location.search).get('code')
```

