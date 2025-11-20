# Final Fix for Google Sign-In

## Current Status
- ✅ Code updated to use `/auth/callback` (client-side callback)
- ✅ Singleton pattern implemented for Supabase client
- ⚠️ Vercel deployment may have old code

## Issue
The redirect URL in the error shows `/api/auth/callback` but the code uses `/auth/callback`. This means **Vercel has the old code**.

## Solution

### 1. Deploy Latest Code to Vercel

The code is correct locally, but Vercel needs to be updated:

```bash
# Commit and push your changes
git add .
git commit -m "Fix Google OAuth: Use client-side callback and singleton pattern"
git push origin main
```

Vercel will auto-deploy. Wait for deployment to complete.

### 2. Update Supabase Redirect URLs

After deploying, update Supabase:

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Redirect URLs** should include:
   - `https://ecomm-next-yf7p.vercel.app/auth/callback`
   - `https://shooshka.online/auth/callback` (if using custom domain)
   - `http://localhost:3000/auth/callback` (for local)

3. **Site URL** should be:
   - `https://ecomm-next-yf7p.vercel.app` (or your custom domain)

### 3. Clear Browser Cache

After deployment:
1. Clear browser cache and cookies
2. Try signing in with Google again

### 4. About "Multiple GoTrueClient Instances" Warning

This warning appears but **shouldn't block sign-in**. It's caused by:
- React Strict Mode (development only)
- Hot reload in development
- Multiple components creating clients

The singleton pattern should minimize this, but the warning may still appear in development. It's **not an error** and won't prevent sign-in from working.

## Testing

After deploying:

1. **Test on Vercel**: `https://ecomm-next-yf7p.vercel.app/auth`
2. Click "Continue with Google"
3. Check console for:
   - `"Exchanging code for session..."`
   - `"OAuth success - Session created for user: [email]"`
   - `"🔐 Auth state changed: SIGNED_IN [email]"`

4. Should redirect to home page and be signed in

## If Still Not Working

1. **Check Vercel deployment logs** - make sure latest code is deployed
2. **Verify Supabase redirect URLs** - must match exactly
3. **Check browser console** - look for actual errors (not warnings)
4. **Visit `/debug-auth`** - see session state

