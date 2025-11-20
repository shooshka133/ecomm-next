# Google Sign-In Troubleshooting Guide

## Issue
Google OAuth sign-up works, but sign-in fails for existing accounts.

## What I've Fixed

1. **Improved Callback Page** (`app/auth/callback/page.tsx`):
   - Added session verification after exchange
   - Better error logging
   - Full page reload to ensure AuthProvider detects session

2. **Enhanced AuthProvider** (`components/AuthProvider.tsx`):
   - Better logging for auth state changes
   - Improved handling of SIGNED_IN events
   - Session refresh verification

## Debugging Steps

### 1. Check Browser Console

Open DevTools (F12) → Console tab, then try to sign in with Google. Look for:

- `"Exchanging code for session..."`
- `"OAuth success - Session created for user: [email]"`
- `"Session verified, redirecting..."`
- `"Auth state changed: SIGNED_IN [email]"`

**If you see errors**, note them down.

### 2. Check Network Tab

1. Open DevTools → Network tab
2. Try to sign in with Google
3. Look for the `/auth/callback` request
4. Check the response - does it have a session?

### 3. Check Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find the user account
3. Check:
   - Does the account exist?
   - What providers are linked? (Should show "google")
   - Is the account confirmed?

### 4. Check Supabase Auth Logs

1. Go to **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Look for errors during the OAuth flow
3. Common errors:
   - "Account already exists" - This is normal, Supabase should link accounts
   - "Email not confirmed" - Disable email confirmation for OAuth
   - "Invalid redirect URL" - Check redirect URLs in Supabase settings

## Common Issues and Fixes

### Issue 1: Session Created But Not Detected

**Symptoms**: Console shows "Session created" but user is not signed in

**Fix**: 
- The callback now uses `window.location.href` for a full page reload
- AuthProvider should detect the session on page load

### Issue 2: Account Linking Issues

**Symptoms**: Error about "account already exists" or duplicate accounts

**Fix**:
1. Go to **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. Make sure **"Confirm email"** is **OFF**
3. Supabase should automatically link accounts with the same email

### Issue 3: Redirect URL Mismatch

**Symptoms**: Error about invalid redirect URL

**Fix**:
1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Make sure **Redirect URLs** includes:
   - `http://localhost:3000/auth/callback` (local)
   - `https://shooshka.online/auth/callback` (production)

### Issue 4: PKCE Code Verifier Missing

**Symptoms**: "both auth code and code verifier should be non-empty"

**Fix**: 
- This should be fixed with the client-side callback page
- Make sure you're using `/auth/callback` (not `/api/auth/callback`)

## Testing Checklist

- [ ] Clear browser cache and cookies
- [ ] Try signing in with Google (existing account)
- [ ] Check browser console for errors
- [ ] Check if session is created (console logs)
- [ ] Check if AuthProvider detects the session
- [ ] Check Supabase dashboard for the user account
- [ ] Check Supabase auth logs for errors

## What to Share

If it's still not working, please share:

1. **Browser console errors** (screenshot or copy/paste)
2. **Network tab** - the `/auth/callback` request response
3. **Supabase auth logs** - any errors during OAuth
4. **What happens** - does it redirect? Show an error? Stay on callback page?

## Next Steps

If the issue persists, we may need to:
1. Check Supabase project settings
2. Verify Google OAuth configuration
3. Check if there are any RLS (Row Level Security) policies blocking access
4. Consider using a different OAuth flow

