# Fix Google OAuth Sign-In

## Current Status
- ✅ Email sign-in works
- ✅ Wishlist works (when signed in)
- ❌ Google sign-in not working

## Step 1: Verify Supabase Configuration

### Check Redirect URLs in Supabase

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub
2. Navigate to **Authentication** → **URL Configuration**
3. **Redirect URLs** must include (one per line):
   ```
   http://localhost:3000/api/auth/callback
   http://localhost:3001/api/auth/callback
   https://ecomm-next-yf7p.vercel.app/api/auth/callback
   ```
4. **Site URL** should be:
   ```
   http://localhost:3000
   ```

### Check Google Provider Settings

1. In Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Verify:
   - ✅ **Enabled**: ON
   - ✅ **Client ID**: Set (from Google Cloud Console)
   - ✅ **Client Secret**: Set (from Google Cloud Console)

## Step 2: Check Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. **Authorized redirect URIs** must include:
   ```
   https://eqqcidlflclgegsalbub.supabase.co/auth/v1/callback
   ```
   ⚠️ **Important**: This is Supabase's callback URL, NOT your app's URL!

## Step 3: Test the Flow

1. Open browser DevTools (F12)
2. Go to `/auth` page
3. Click "Continue with Google"
4. Watch:
   - **Console tab**: Any errors?
   - **Network tab**: Check requests to `/api/auth/callback`
   - **What URL** are you redirected to after Google?

## Common Issues

### Issue: "Redirect URI mismatch"
- **Cause**: Redirect URL not in Supabase allowed list
- **Fix**: Add exact URL to Supabase Redirect URLs

### Issue: Redirects but doesn't sign in
- **Cause**: Session not being set properly
- **Fix**: Check callback route is working

### Issue: "Provider not enabled"
- **Cause**: Google OAuth not enabled in Supabase
- **Fix**: Enable Google provider in Supabase Dashboard

## Debug Information Needed

Please check and share:
1. **Browser console errors** (F12 → Console)
2. **Network tab** - Look for `/api/auth/callback` request
3. **What happens** when you click "Continue with Google"
4. **What URL** you're redirected to after Google authorization

