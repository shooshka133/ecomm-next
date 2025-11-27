# Configure Grocery Google OAuth Credentials

## Step 1: Get Your Google OAuth Credentials

From your Google Cloud Console, you should have:
- **Client ID:** `xxxxx.apps.googleusercontent.com`
- **Client Secret:** `xxxxx`

---

## Step 2: Configure Grocery Supabase Project

### 2.1: Set Google OAuth Provider

1. Go to your **Grocery Supabase Dashboard**
2. Navigate to **Authentication** → **Providers** → **Google**
3. Configure:
   - ✅ **Enabled:** ON
   - ✅ **Client ID:** (paste your grocery Google OAuth Client ID)
   - ✅ **Client Secret:** (paste your grocery Google OAuth Client Secret)
   - ✅ **Auto confirm:** ON (recommended)
   - ⚠️ **Confirm email:** OFF (for OAuth providers)

4. Click **Save**

### 2.2: Configure Redirect URLs

1. Still in Grocery Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. **Site URL:** `https://grocery.shooshka.online`
4. **Redirect URLs** (add each on a new line):
   ```
   https://grocery.shooshka.online/auth/callback
   http://grocery.local:3000/auth/callback
   https://grocery.shooshka.online/**
   http://grocery.local:3000/**
   ```

5. Click **Save**

---

## Step 3: Configure Google Cloud Console (Grocery OAuth Client)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your **Grocery OAuth 2.0 Client** (the one you just created)
3. Go to **Authorized JavaScript origins** and add:
   ```
   https://grocery.shooshka.online
   http://grocery.local:3000
   ```

4. Go to **Authorized redirect URIs** and add:
   ```
   https://YOUR_GROCERY_SUPABASE_PROJECT.supabase.co/auth/v1/callback
   ```
   
   **Important:** 
   - Replace `YOUR_GROCERY_SUPABASE_PROJECT` with your actual grocery Supabase project reference
   - You can find this in: Grocery Supabase Dashboard → Settings → API → Project URL
   - Example: If your project URL is `https://arcfjjpafjecsliiwdcg.supabase.co`, then the callback is:
     ```
     https://arcfjjpafjecsliiwdcg.supabase.co/auth/v1/callback
     ```

5. Click **Save**

---

## Step 4: Verify Configuration

### Check Grocery Supabase:
- [ ] Google OAuth provider is enabled
- [ ] Client ID matches your Google OAuth Client ID
- [ ] Client Secret is set
- [ ] Redirect URLs include `https://grocery.shooshka.online/auth/callback`
- [ ] Site URL is `https://grocery.shooshka.online`

### Check Google Cloud Console (Grocery OAuth Client):
- [ ] Authorized JavaScript origins include `https://grocery.shooshka.online`
- [ ] Authorized redirect URIs include your grocery Supabase callback URL
- [ ] Format: `https://xxxxx.supabase.co/auth/v1/callback`

---

## Step 5: Test

1. Visit `https://grocery.shooshka.online` (or `http://grocery.local:3000` locally)
2. Click "Sign in with Google"
3. You should be redirected to Google
4. After authorizing, you should be redirected back to grocery domain
5. You should be signed in successfully

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
- **Check:** Is the Supabase callback URL in Google OAuth console?
- **Format:** Must be `https://xxxxx.supabase.co/auth/v1/callback` (Supabase URL, not your app URL)

### Error: "Provider not enabled"
- **Check:** Is Google OAuth enabled in Grocery Supabase?
- **Fix:** Go to Authentication → Providers → Google → Enable

### Error: "Invalid client"
- **Check:** Does the Client ID in Supabase match the one in Google Cloud Console?
- **Fix:** Copy the exact Client ID from Google Cloud Console to Supabase

### Still not working?
1. Clear browser cache
2. Try in incognito mode
3. Check browser console for errors
4. Check Supabase logs: Dashboard → Logs → Auth Logs

---

## Next Steps

Once grocery OAuth is working:
1. Test that users created in grocery are in the grocery Supabase `auth.users` table
2. Verify that grocery users can't access store data (isolation test)
3. Consider creating separate OAuth credentials for store brand too (optional but recommended)

---

## Quick Reference

**Grocery Supabase Project URL:**
- Find in: Dashboard → Settings → API → Project URL
- Format: `https://xxxxx.supabase.co`

**Grocery Supabase Callback URL:**
- Format: `https://xxxxx.supabase.co/auth/v1/callback`
- This is what goes in Google OAuth console

**Grocery App Callback URL:**
- Format: `https://grocery.shooshka.online/auth/callback`
- This is what goes in Supabase Redirect URLs

