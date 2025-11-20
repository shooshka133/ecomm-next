# Verify OAuth Configuration - Complete Checklist

## Current Status
You've reverted to commit `987edd1` where OAuth should be working. Let's verify all configurations.

---

## 1. Supabase Configuration

### Step 1: Check Supabase Redirect URLs

Go to: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub/auth/url-configuration

**Site URL should be:**
- ✅ `http://localhost:3000` (for local development)
- ✅ `https://ecomm-next-yf7p.vercel.app` (for Vercel)
- ✅ `https://shooshka.online` (if using custom domain)

**Redirect URLs must include:**
- ✅ `http://localhost:3000/api/auth/callback`
- ✅ `https://ecomm-next-yf7p.vercel.app/api/auth/callback`
- ✅ `https://shooshka.online/api/auth/callback` (if using custom domain)

**❌ Remove these if they exist:**
- `http://localhost:3000/`
- `http://localhost:3000/auth/callback`
- Any URL that doesn't end with `/api/auth/callback`

### Step 2: Check Google OAuth Provider

Go to: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub/auth/providers

**Google Provider Settings:**
- ✅ **Enabled:** ON
- ✅ **Client ID:** Should be set (from Google Cloud Console)
- ✅ **Client Secret:** Should be set (from Google Cloud Console)

---

## 2. Google Cloud Console Configuration

Go to: https://console.cloud.google.com/apis/credentials

### Step 1: Find Your OAuth 2.0 Client

1. Navigate to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID (should match Supabase)

### Step 2: Check Authorized Redirect URIs

**Must include:**
- ✅ `https://eqqcidlflclgegsalbub.supabase.co/auth/v1/callback`

**Important:** This is Supabase's callback URL, NOT your app's URL!

**❌ Do NOT add:**
- `http://localhost:3000/api/auth/callback` (wrong!)
- `https://ecomm-next-yf7p.vercel.app/api/auth/callback` (wrong!)

**Why?** Google redirects to Supabase first, then Supabase redirects to your app.

---

## 3. Vercel Configuration

### Step 1: Check Environment Variables

Go to: https://vercel.com/ashrahalimo-8415s-projects/ecomm-next-yf7p/settings/environment-variables

**Required Variables:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` = `https://eqqcidlflclgegsalbub.supabase.co`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)
- ✅ `NEXT_PUBLIC_APP_URL` = `https://ecomm-next-yf7p.vercel.app` (or your custom domain)

### Step 2: Check Git Integration

Go to: https://vercel.com/ashrahalimo-8415s-projects/ecomm-next-yf7p/settings/git

**Verify:**
- ✅ Repository: `shooshka133/ecomm-next`
- ✅ Production Branch: `main`
- ✅ Auto-deployments: Enabled

---

## 4. Local Development Configuration

### Step 1: Check `.env.local`

Make sure you have:

```env
NEXT_PUBLIC_SUPABASE_URL=https://eqqcidlflclgegsalbub.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Check Code Configuration

The code should use:
- Redirect URL: `${window.location.origin}/api/auth/callback`
- Callback route: `/api/auth/callback`

---

## 5. Test OAuth Flow

### Step 1: Clear Browser Data

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Clear storage**
4. Check all boxes
5. Click **Clear site data**

### Step 2: Test Sign-In

1. Go to: `http://localhost:3000/auth`
2. Click "Sign in with Google"
3. **Check the console** for any errors
4. **Check the URL** after Google redirects:
   - Should be: `http://localhost:3000/api/auth/callback?code=...`
   - NOT: `http://localhost:3000/?code=...`

### Step 3: Check for Errors

**Common errors and fixes:**

1. **"redirect_uri_mismatch"**
   - Fix: Add `https://eqqcidlflclgegsalbub.supabase.co/auth/v1/callback` to Google Console

2. **"invalid_request: both auth code and code verifier should be non-empty"**
   - Fix: This is a PKCE error - check Supabase redirect URLs

3. **"No authorization code"**
   - Fix: Check that callback route exists and redirect URL is correct

---

## 6. Debugging Steps

### Check Network Tab

1. Open DevTools → **Network** tab
2. Click "Sign in with Google"
3. Look for:
   - Request to Google OAuth
   - Redirect to Supabase callback
   - Redirect to your app callback
   - Any failed requests

### Check Console Logs

Look for:
- OAuth redirect URL being used
- Callback route being hit
- Any error messages

### Check Supabase Logs

Go to: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub/logs/edge-logs

Filter by "auth" and look for OAuth-related errors.

---

## 7. Quick Verification Checklist

- [ ] Supabase Site URL is correct
- [ ] Supabase Redirect URLs include `/api/auth/callback`
- [ ] Google OAuth is enabled in Supabase
- [ ] Google Console has Supabase callback URL
- [ ] Vercel environment variables are set
- [ ] Local `.env.local` is configured
- [ ] Browser cache is cleared
- [ ] Testing in same browser tab (not new tab)

---

## 8. Common Issues

### Issue: Redirect goes to home page instead of callback

**Cause:** Supabase redirect URL is set to `/` instead of `/api/auth/callback`

**Fix:** Update Supabase redirect URLs

### Issue: "redirect_uri_mismatch"

**Cause:** Google Console doesn't have Supabase callback URL

**Fix:** Add `https://eqqcidlflclgegsalbub.supabase.co/auth/v1/callback` to Google Console

### Issue: OAuth works locally but not on Vercel

**Cause:** Vercel environment variables not set or wrong redirect URLs

**Fix:** Check Vercel environment variables and Supabase redirect URLs for production

---

## Next Steps

1. Go through each section above
2. Verify all settings match
3. Test OAuth again
4. Share any errors you see

Let me know what you find!

