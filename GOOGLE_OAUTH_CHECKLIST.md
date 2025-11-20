# Google OAuth Sign-In Checklist

## ✅ What's Working
- Email sign-in works
- Wishlist works (when signed in)

## ❌ What's Not Working
- Google sign-in

## Critical Configuration Steps

### 1. Supabase Redirect URLs (MOST IMPORTANT!)

Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**

**Redirect URLs** (add each on a new line):
```
http://localhost:3000/api/auth/callback
http://localhost:3001/api/auth/callback
https://ecomm-next-yf7p.vercel.app/api/auth/callback
```

**Site URL:**
```
http://localhost:3000
```

⚠️ **CRITICAL**: The redirect URL must be EXACTLY `/api/auth/callback` (not `/auth/callback`)

### 2. Google Cloud Console

Go to [Google Cloud Console](https://console.cloud.google.com/)

**APIs & Services** → **Credentials** → Your OAuth 2.0 Client

**Authorized redirect URIs** must include:
```
https://eqqcidlflclgegsalbub.supabase.co/auth/v1/callback
```

⚠️ **IMPORTANT**: This is Supabase's callback URL, NOT your app's URL!

### 3. Supabase Google Provider

**Supabase Dashboard** → **Authentication** → **Providers** → **Google**

- ✅ **Enabled**: ON
- ✅ **Client ID**: From Google Cloud Console
- ✅ **Client Secret**: From Google Cloud Console

## Testing Steps

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Go to** `http://localhost:3000/auth`
4. **Click** "Continue with Google"
5. **Watch the console** for:
   - "Google OAuth - Redirect URL: ..." (should show the redirect URL)
   - Any error messages
6. **After authorizing with Google:**
   - Check Network tab for `/api/auth/callback` request
   - Check what URL you're redirected to
   - Check console for "OAuth success" or error messages

## Common Errors

### Error: "redirect_uri_mismatch"
- **Cause**: Redirect URL not in Supabase allowed list
- **Fix**: Add exact URL to Supabase Redirect URLs

### Error: "No authorization code"
- **Cause**: Callback route not being hit
- **Fix**: Check redirect URL matches exactly

### Error: "Provider not enabled"
- **Cause**: Google OAuth not enabled in Supabase
- **Fix**: Enable in Supabase Dashboard

## Debug Information

When testing, please check:

1. **What happens when you click "Continue with Google"?**
   - Does it redirect to Google? ✅/❌
   - After authorizing, what URL are you redirected to?
   - Do you see any error messages?

2. **Browser Console (F12):**
   - Any error messages?
   - "Google OAuth - Redirect URL: ..." log?
   - "OAuth success" or error logs?

3. **Network Tab:**
   - Request to `/api/auth/callback`?
   - What's the status code? (200 = success, 4xx/5xx = error)

## Quick Fix Test

Try this exact redirect URL format:

1. Make sure in Supabase Redirect URLs you have:
   ```
   http://localhost:3000/api/auth/callback
   ```

2. Clear browser cache and cookies

3. Try Google sign-in again

4. Check browser console for the redirect URL being used

