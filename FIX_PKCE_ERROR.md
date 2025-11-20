# Fix PKCE Error: "both auth code and code verifier should be non-empty"

## Problem
The error occurs because the server-side callback route (`/api/auth/callback`) cannot access the browser's `sessionStorage` where Supabase stores the PKCE code verifier.

## Solution
Created a **client-side callback page** (`/auth/callback`) that can access `sessionStorage` and properly exchange the OAuth code for a session.

## Changes Made

1. **Created `/app/auth/callback/page.tsx`**:
   - Client-side component that can access `sessionStorage`
   - Properly handles PKCE code verifier retrieval
   - Exchanges code for session using client-side Supabase client

2. **Updated `/app/auth/page.tsx`**:
   - Changed redirect URL from `/api/auth/callback` to `/auth/callback`

## Required Configuration Updates

### 1. Update Supabase Redirect URLs

Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**:

**Redirect URLs** should include:
- `http://localhost:3000/auth/callback` (for local development)
- `https://shooshka.online/auth/callback` (for production)

**Site URL** should be:
- `http://localhost:3000` (for local)
- `https://shooshka.online` (for production)

### 2. Update Google Cloud Console (if needed)

The Google OAuth redirect URL in Google Cloud Console should still point to Supabase:
- `https://[your-supabase-project].supabase.co/auth/v1/callback`

This doesn't need to change - Google redirects to Supabase, then Supabase redirects to your app.

## Testing

1. **Clear browser cache and cookies** (important!)
2. Go to `/auth` page
3. Click "Continue with Google"
4. Authorize with Google
5. Should redirect to `/auth/callback` and then to home page
6. Should be signed in automatically

## Why This Works

- **PKCE Flow**: Supabase uses PKCE (Proof Key for Code Exchange) for security
- **Code Verifier**: Generated client-side and stored in `sessionStorage`
- **Server Limitation**: Server-side routes cannot access `sessionStorage`
- **Client Solution**: Client-side callback page can access `sessionStorage` and retrieve the code verifier

## If Still Not Working

1. **Check browser console** for errors
2. **Verify redirect URLs** in Supabase match exactly
3. **Clear all cookies and sessionStorage**:
   ```javascript
   // In browser console:
   localStorage.clear()
   sessionStorage.clear()
   document.cookie.split(";").forEach(c => {
     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   });
   ```
4. **Check Supabase logs** for authentication errors

