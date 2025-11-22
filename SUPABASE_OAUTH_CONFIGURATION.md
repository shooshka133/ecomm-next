# 🔐 Supabase OAuth Configuration Checklist

## ✅ Current Configuration Status

### **Site URL:**
```
✅ store.shooshka.online
```

### **Redirect URLs:**
```
✅ https://ecomm-next-yf7p.vercel.app/auth/callback
✅ https://ecomm-next-yf7p.vercel.app/**
✅ http://localhost:3000/auth/callback
✅ http://localhost:3000/**
✅ https://store.shooshka.online/auth/callback
```

---

## 📋 Complete Supabase Configuration Checklist

### **1. Authentication → URL Configuration** ✅

**Site URL:**
```
store.shooshka.online
```

**Redirect URLs:**
```
✅ https://store.shooshka.online/auth/callback
✅ https://ecomm-next-yf7p.vercel.app/auth/callback
✅ http://localhost:3000/auth/callback
```

**Note:** The `/**` wildcards are fine, but specific URLs are better for security.

---

### **2. Authentication → Providers → Google** ⚠️ CHECK THIS

Go to: **Supabase Dashboard** → **Authentication** → **Providers** → **Google**

**Required Settings:**
- ✅ **Enabled:** Should be **ON**
- ✅ **Client ID:** Your Google OAuth Client ID
- ✅ **Client Secret:** Your Google OAuth Client Secret

**Important Settings:**
- ⚠️ **Confirm email:** Should be **OFF** (for OAuth providers)
  - If ON, users need to confirm email even after OAuth (causes issues)
- ⚠️ **Auto confirm:** Should be **ON** (recommended)
  - Automatically confirms email for OAuth users

**Current Status:** Check these settings now!

---

### **3. Google Cloud Console Configuration** ⚠️ CHECK THIS

Go to: **Google Cloud Console** → **APIs & Services** → **Credentials**

**Authorized JavaScript origins:**
```
✅ https://store.shooshka.online
✅ https://ecomm-next-yf7p.vercel.app
✅ http://localhost:3000
```

**Authorized redirect URIs:**
```
✅ https://eqqcidlflclgegsalbub.supabase.co/auth/v1/callback
```

**⚠️ IMPORTANT:** 
- The redirect URI should be **Supabase's callback URL**, NOT your app's callback URL
- Format: `https://[your-project-ref].supabase.co/auth/v1/callback`
- Your project ref: `eqqcidlflclgegsalbub`

**Current Status:** Verify this is set correctly!

---

### **4. Email Settings** (Optional but Recommended)

Go to: **Supabase Dashboard** → **Authentication** → **Settings**

**Email Confirmation:**
- ⚠️ For OAuth users: Should be **OFF** or **Auto-confirm**
- ✅ For email/password users: Can be ON or OFF (your choice)

**Email Templates:**
- Customize if needed
- Default templates work fine

---

### **5. Row Level Security (RLS)** ✅ (Should already be set)

**Verify RLS is enabled on:**
- ✅ `profiles` table
- ✅ `cart_items` table
- ✅ `orders` table
- ✅ `order_items` table
- ✅ `wishlist` table

**Check:** Go to **Table Editor** → Select table → **RLS** tab → Should show "RLS enabled"

---

### **6. Environment Variables** ⚠️ VERIFY IN VERCEL

**In Vercel Dashboard** → **Settings** → **Environment Variables**:

```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ NEXT_PUBLIC_APP_URL = https://store.shooshka.online
```

**⚠️ Important:** 
- `NEXT_PUBLIC_APP_URL` should be `https://store.shooshka.online` (not the old domain)
- Redeploy after changing environment variables!

---

## 🔍 What to Check Right Now

### **Priority 1: Google Provider Settings**

1. Go to: **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. Verify:
   - ✅ Enabled: **ON**
   - ✅ Client ID: Set
   - ✅ Client Secret: Set
   - ⚠️ **Confirm email: OFF** (important!)
   - ⚠️ **Auto confirm: ON** (recommended)

### **Priority 2: Google Cloud Console**

1. Go to: **Google Cloud Console** → **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client
3. Verify **Authorized redirect URIs** includes:
   ```
   https://eqqcidlflclgegsalbub.supabase.co/auth/v1/callback
   ```

### **Priority 3: Environment Variables**

1. Go to: **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Verify `NEXT_PUBLIC_APP_URL` is:
   ```
   https://store.shooshka.online
   ```
3. If changed, **redeploy** your project!

---

## 🎯 Why It Works Now

**Before:**
- PKCE error was cryptic
- Users didn't know to retry
- Second attempt worked but was confusing

**After:**
- Clear error message: "OAuth session expired. Please try signing in again."
- Users know to retry
- Second attempt works (same as before, but now expected)

**The fix didn't change the OAuth flow** - it just made the error handling better!

---

## 📝 Optional: Remove Unnecessary Redirect URLs

You can clean up your redirect URLs to be more specific:

**Keep:**
```
✅ https://store.shooshka.online/auth/callback
✅ https://ecomm-next-yf7p.vercel.app/auth/callback
✅ http://localhost:3000/auth/callback
```

**Remove (if you want):**
```
❌ https://ecomm-next-yf7p.vercel.app/** (wildcard - less secure)
❌ http://localhost:3000/** (wildcard - less secure)
```

**Note:** Wildcards work but specific URLs are more secure.

---

## ✅ Summary

**What you have:**
- ✅ Site URL: `store.shooshka.online`
- ✅ Redirect URLs: All necessary URLs added
- ✅ OAuth working: Google sign-in works

**What to verify:**
- ⚠️ Google Provider settings (confirm email OFF)
- ⚠️ Google Cloud Console redirect URI (Supabase callback)
- ⚠️ Environment variable `NEXT_PUBLIC_APP_URL` in Vercel

**Everything else looks good!** 🎉

