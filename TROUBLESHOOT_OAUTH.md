# Troubleshoot OAuth Sign-In

## Current Issue
OAuth code is being redirected to `/?code=...` instead of `/api/auth/callback?code=...`

## Debugging Steps

### 1. Check Browser Console
Open DevTools (F12) → Console tab and look for:
- `"🔄 OAuth code detected on home page, redirecting to callback route..."`
- Any error messages

### 2. Check Network Tab
1. Open DevTools → Network tab
2. Try signing in with Google
3. Look for:
   - Request to `/api/auth/callback`
   - Status code (should be 200 or 307/308 for redirect)
   - Response headers

### 3. Check Vercel Logs
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Deployments** → Click on latest deployment
4. Go to **Functions** tab
5. Look for `/api/auth/callback` function logs
6. Check for any errors or log messages

### 4. Verify Supabase Configuration

**Critical**: Check Supabase redirect URLs:

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Redirect URLs** must include:
   ```
   https://ecomm-next-yf7p.vercel.app/api/auth/callback
   ```
3. **Site URL** should be:
   ```
   https://ecomm-next-yf7p.vercel.app
   ```

### 5. Test the Callback Route Directly

Try accessing:
```
https://ecomm-next-yf7p.vercel.app/api/auth/callback?code=test
```

Should redirect to `/auth?error=No authorization code` (not a 404)

### 6. Check What's Happening

After clicking "Sign in with Google":
1. **Where does it redirect?**
   - `/?code=...` ❌ (wrong - means Supabase config is wrong)
   - `/api/auth/callback?code=...` ✅ (correct)

2. **If it goes to `/?code=...`:**
   - The home page handler should redirect to `/api/auth/callback`
   - Check browser console for the redirect message

3. **If it goes to `/api/auth/callback?code=...`:**
   - Check Vercel function logs for errors
   - Check if session is being created

## Common Issues

### Issue 1: Code on Home Page
**Symptom**: URL is `/?code=...`

**Cause**: Supabase redirect URL is wrong

**Fix**: Update Supabase redirect URLs to include `/api/auth/callback`

### Issue 2: 404 on Callback Route
**Symptom**: `/api/auth/callback` returns 404

**Cause**: Route file not deployed or wrong path

**Fix**: 
- Check file exists: `app/api/auth/callback/route.ts`
- Redeploy to Vercel

### Issue 3: Session Not Created
**Symptom**: Redirects to `/?auth=success` but user not signed in

**Cause**: Session cookies not being set or read

**Fix**: 
- Check Vercel function logs for errors
- Check browser cookies (DevTools → Application → Cookies)
- Look for Supabase auth cookies

## Next Steps

1. **Check Vercel function logs** - This will show what's happening in the callback route
2. **Verify Supabase redirect URLs** - Must match exactly
3. **Test locally first** - Make sure it works on `localhost:3000`
4. **Share the logs** - If still not working, share:
   - Vercel function logs
   - Browser console errors
   - Network tab requests

