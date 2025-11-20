# Fix PKCE "code verifier should be non-empty" Error

## Problem

The error "invalid request: both auth code and code verifier should be non-empty" occurs when:
1. The OAuth flow starts and stores the PKCE code verifier in `sessionStorage`
2. The callback happens, but the code verifier is missing
3. The server-side callback can't access `sessionStorage` (client-side only)

## Root Causes

1. **SessionStorage cleared**: Browser cleared `sessionStorage` between OAuth start and callback
2. **Different tab/window**: OAuth started in one tab, callback in another
3. **Cookie storage issue**: Code verifier should be in cookies but isn't being stored properly
4. **Redirect URL mismatch**: OAuth redirects to wrong URL, losing the session

## Solutions Applied

### 1. Enhanced Error Detection

Updated `app/api/auth/callback/route.ts` to:
- Detect PKCE errors (including "non-empty" message)
- Redirect to home page for client-side handling when PKCE fails
- Log cookie information for debugging

### 2. Client-Side Fallback

Updated `app/page.tsx` to:
- Better detect PKCE errors
- Provide clear error messages
- Guide users to try again from the same tab

### 3. Redirect URL Fix

Updated `app/auth/page.tsx` to:
- Always use `window.location.origin` (not `NEXT_PUBLIC_APP_URL`)
- Ensures redirect URL matches current environment

## How to Fix

### Step 1: Clear Browser Data
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Clear storage**
4. Check all boxes
5. Click **Clear site data**

### Step 2: Verify Supabase Redirect URLs

Go to: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub/auth/url-configuration

**Must have:**
- ✅ `http://localhost:3000/api/auth/callback`
- ✅ `https://ecomm-next-yf7p.vercel.app/api/auth/callback`

**Remove:**
- ❌ `http://localhost:3000/`
- ❌ Any URL that doesn't end with `/api/auth/callback`

### Step 3: Test OAuth Flow

1. **Open ONE browser tab** (important!)
2. Go to: `http://localhost:3000/auth`
3. Click "Sign in with Google"
4. **Stay in the same tab** - don't open new tabs
5. Complete Google authorization
6. Should redirect back to your app

### Step 4: Check Console Logs

After clicking "Sign in with Google", check console for:
```
🔗 Google OAuth - Redirect URL: http://localhost:3000/api/auth/callback?next=/
```

After callback, check for:
```
[OAuth Callback] Callback route hit
[OAuth Callback] Exchanging code for session...
```

If you see PKCE errors, check:
```
🔍 PKCE check: { storageKey: "...", hasVerifier: true/false, ... }
```

## Prevention

1. **Always use same tab**: Don't open OAuth in a new tab
2. **Don't clear storage**: Avoid clearing `sessionStorage` during OAuth flow
3. **Check redirect URLs**: Ensure Supabase has correct redirect URLs
4. **Use correct origin**: Always use `window.location.origin` for redirect URL

## Debugging

If error persists, check:

1. **SessionStorage keys**:
   ```javascript
   // In browser console
   Object.keys(sessionStorage).filter(k => k.includes('auth') || k.includes('supabase'))
   ```

2. **Cookies**:
   ```javascript
   // In browser console
   document.cookie.split(';').filter(c => c.includes('supabase') || c.includes('auth'))
   ```

3. **Network tab**: Check if callback request includes cookies

4. **Supabase logs**: Check Supabase dashboard → Logs → Auth logs

## Alternative: Force Client-Side Only

If server-side callback keeps failing, you can force client-side only:

1. Change redirect URL to home page:
   ```typescript
   const callbackUrl = `${redirectUrl}/?oauth_callback=true`
   ```

2. Handle OAuth entirely client-side in `app/page.tsx`

But this is less secure and not recommended for production.

