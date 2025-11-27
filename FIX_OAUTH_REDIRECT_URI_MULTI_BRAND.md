# Fix OAuth Redirect URI Mismatch - Multi-Brand Setup

## The Problem

You're getting `Error 400: redirect_uri_mismatch` because:
1. Each brand now uses its own Supabase project
2. Each Supabase project needs its own redirect URIs configured
3. Google OAuth console needs callback URLs for each Supabase project

## Current Callback URL

The app sends this callback URL:
```
${origin}/auth/callback?next=...
```

Examples:
- `https://grocery.shooshka.online/auth/callback?next=/`
- `https://store.shooshka.online/auth/callback?next=/`
- `http://grocery.local:3000/auth/callback?next=/` (local)

---

## Step 1: Configure Each Supabase Project

### For Grocery Supabase Project

1. Go to your **Grocery Supabase Dashboard**
2. Navigate to **Authentication** → **URL Configuration**
3. **Site URL:** `https://grocery.shooshka.online`
4. **Redirect URLs** (add each on a new line):
   ```
   https://grocery.shooshka.online/auth/callback
   http://grocery.local:3000/auth/callback
   https://grocery.shooshka.online/**
   http://grocery.local:3000/**
   ```

### For Store Supabase Project

1. Go to your **Store Supabase Dashboard** (main project)
2. Navigate to **Authentication** → **URL Configuration**
3. **Site URL:** `https://store.shooshka.online`
4. **Redirect URLs** (add each on a new line):
   ```
   https://store.shooshka.online/auth/callback
   http://store.local:3000/auth/callback
   https://store.shooshka.online/**
   http://store.local:3000/**
   ```

---

## Step 2: Configure Google OAuth Console

### Important: You Need Separate OAuth Clients OR Shared Client

**Option A: Separate OAuth Clients (Recommended for Production)**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. For each brand, create a separate OAuth 2.0 Client:
   - **Grocery OAuth Client:**
     - **Authorized JavaScript origins:**
       ```
       https://grocery.shooshka.online
       http://grocery.local:3000
       ```
     - **Authorized redirect URIs:**
       ```
       https://YOUR_GROCERY_SUPABASE_PROJECT.supabase.co/auth/v1/callback
       ```
       (Replace `YOUR_GROCERY_SUPABASE_PROJECT` with your actual grocery Supabase project reference)
   
   - **Store OAuth Client:**
     - **Authorized JavaScript origins:**
       ```
       https://store.shooshka.online
       http://store.local:3000
       ```
     - **Authorized redirect URIs:**
       ```
       https://YOUR_STORE_SUPABASE_PROJECT.supabase.co/auth/v1/callback
       ```
       (Replace `YOUR_STORE_SUPABASE_PROJECT` with your actual store Supabase project reference)

3. **Configure each Supabase project:**
   - **Grocery Supabase:** Use Grocery OAuth Client ID and Secret
   - **Store Supabase:** Use Store OAuth Client ID and Secret

**Option B: Shared OAuth Client (Easier for Testing)**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Use your existing OAuth 2.0 Client
3. **Authorized JavaScript origins:**
   ```
   https://grocery.shooshka.online
   https://store.shooshka.online
   http://grocery.local:3000
   http://store.local:3000
   ```
4. **Authorized redirect URIs:**
   ```
   https://YOUR_GROCERY_SUPABASE_PROJECT.supabase.co/auth/v1/callback
   https://YOUR_STORE_SUPABASE_PROJECT.supabase.co/auth/v1/callback
   ```
   (Add both Supabase callback URLs)

5. **Use the same Client ID and Secret in both Supabase projects**

---

## Step 3: Verify Supabase Project URLs

### Find Your Supabase Project URLs

**Grocery Supabase:**
- Go to Grocery Supabase Dashboard → Settings → API
- Copy the **Project URL** (e.g., `https://xxxxx.supabase.co`)
- The callback URL is: `https://xxxxx.supabase.co/auth/v1/callback`

**Store Supabase:**
- Go to Store Supabase Dashboard → Settings → API
- Copy the **Project URL** (e.g., `https://yyyyy.supabase.co`)
- The callback URL is: `https://yyyyy.supabase.co/auth/v1/callback`

---

## Step 4: Update Supabase Provider Settings

### For Grocery Supabase

1. Go to **Grocery Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. **Enabled:** ON
3. **Client ID:** Your Google OAuth Client ID
4. **Client Secret:** Your Google OAuth Client Secret
5. **Auto confirm:** ON (recommended)

### For Store Supabase

1. Go to **Store Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. **Enabled:** ON
3. **Client ID:** Your Google OAuth Client ID
4. **Client Secret:** Your Google OAuth Client Secret
5. **Auto confirm:** ON (recommended)

---

## Step 5: Test

1. **Test Grocery:**
   - Visit `https://grocery.shooshka.online` (or `http://grocery.local:3000`)
   - Click "Sign in with Google"
   - Should redirect to Google → back to grocery domain
   - Should authenticate successfully

2. **Test Store:**
   - Visit `https://store.shooshka.online` (or `http://store.local:3000`)
   - Click "Sign in with Google"
   - Should redirect to Google → back to store domain
   - Should authenticate successfully

---

## Quick Checklist

### Grocery Supabase:
- [ ] Redirect URLs include `https://grocery.shooshka.online/auth/callback`
- [ ] Redirect URLs include `http://grocery.local:3000/auth/callback` (for local)
- [ ] Site URL is `https://grocery.shooshka.online`
- [ ] Google OAuth provider is enabled
- [ ] Google OAuth Client ID and Secret are set

### Store Supabase:
- [ ] Redirect URLs include `https://store.shooshka.online/auth/callback`
- [ ] Redirect URLs include `http://store.local:3000/auth/callback` (for local)
- [ ] Site URL is `https://store.shooshka.online`
- [ ] Google OAuth provider is enabled
- [ ] Google OAuth Client ID and Secret are set

### Google Cloud Console:
- [ ] Authorized redirect URIs include grocery Supabase callback: `https://xxxxx.supabase.co/auth/v1/callback`
- [ ] Authorized redirect URIs include store Supabase callback: `https://yyyyy.supabase.co/auth/v1/callback`
- [ ] Authorized JavaScript origins include both domains

---

## Common Mistakes

1. **Wrong callback URL in Supabase:**
   - ❌ `/api/auth/callback` (old path)
   - ✅ `/auth/callback` (current path)

2. **Missing wildcards:**
   - Add `/**` wildcards for flexibility

3. **Wrong Supabase callback in Google:**
   - ❌ `https://grocery.shooshka.online/auth/callback` (your app URL)
   - ✅ `https://xxxxx.supabase.co/auth/v1/callback` (Supabase URL)

4. **Not configuring both Supabase projects:**
   - Each brand needs its own Supabase project configured

---

## Still Not Working?

1. **Check browser console** for exact error message
2. **Check Network tab** to see what redirect URI is being sent
3. **Verify the Supabase project URL** matches what's in Google OAuth console
4. **Clear browser cache** and try again
5. **Check Supabase logs** for authentication errors

---

## Need Help?

Share:
1. Which domain you're testing (`grocery` or `store`)
2. The exact error message
3. Your Supabase project URLs (you can mask the sensitive parts)
4. Whether you're using separate or shared OAuth clients

