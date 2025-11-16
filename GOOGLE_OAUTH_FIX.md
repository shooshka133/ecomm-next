# Google OAuth Sign-In Fix

## Issue
Google OAuth works for creating new accounts but doesn't work for signing in to existing accounts.

## Solutions

### 1. Check Supabase Settings

Go to your Supabase Dashboard:
1. Navigate to **Authentication** > **Providers** > **Google**
2. Make sure these settings are correct:
   - **Enabled**: Should be ON
   - **Confirm email**: Should be OFF (for OAuth providers, this can cause issues)
   - **Authorized redirect URLs**: Should include:
     - `http://localhost:3000/auth/callback` (for local development)
     - `https://yourdomain.com/auth/callback` (for production)

### 2. Check Google Cloud Console Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your OAuth 2.0 Client ID
4. Check **Authorized redirect URIs**:
   - Should include: `https://eqqcidlflclgegsalbub.supabase.co/auth/v1/callback`
   - This is Supabase's callback URL, not your app's URL

### 3. Common Issues

#### Issue: "Account already exists" error
- **Cause**: Supabase is trying to create a new account when one already exists
- **Solution**: This is actually expected behavior - Supabase will automatically link the account if the email matches

#### Issue: Redirects but doesn't sign in
- **Cause**: Session not being properly set in the callback
- **Solution**: The updated callback route should fix this

#### Issue: Creates duplicate accounts
- **Cause**: Email confirmation enabled for OAuth
- **Solution**: Disable email confirmation for OAuth providers in Supabase settings

### 4. Testing

1. **First time (should create account)**:
   - Click "Sign in with Google"
   - Authorize the app
   - Should redirect back and be signed in

2. **Second time (should sign in to existing account)**:
   - Sign out
   - Click "Sign in with Google" again
   - Should sign in to the same account (not create a new one)

### 5. Debug Steps

If it's still not working:

1. **Check browser console** for errors
2. **Check Supabase logs**:
   - Go to Supabase Dashboard > Logs > Auth Logs
   - Look for any errors during the OAuth flow
3. **Check network tab**:
   - Look for the callback request
   - Check if the session is being set correctly

### 6. Alternative: Use Email Link Instead

If Google OAuth continues to have issues, users can:
1. Sign up with email/password
2. Later link their Google account in account settings (if you add this feature)

## Code Changes Made

1. **Improved callback route** (`app/auth/callback/route.ts`):
   - Better error handling
   - Proper session exchange
   - Error redirects with messages

2. **Updated auth page** (`app/auth/page.tsx`):
   - Added OAuth query parameters for better compatibility
   - Better error handling and display
   - Checks for errors from callback

## If Still Not Working

The issue might be in Supabase's configuration. Try:

1. **Disable and re-enable Google provider** in Supabase
2. **Check if email confirmation is required** - disable it for OAuth
3. **Verify redirect URLs** match exactly in both Supabase and Google Console
4. **Check Supabase project settings** - ensure OAuth is properly configured

