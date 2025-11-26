# 🔧 Fix: "Cannot save brand" Error

## Problem
Error when saving brand:
```
Cannot save brand: Database storage required in production. 
Please set BRAND_USE_DB=true and ensure Supabase is configured.
```

## Cause
The environment variables for Supabase are not set in Vercel, or the deployment hasn't picked them up yet.

---

## ✅ Solution

### Step 1: Add Environment Variables in Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project

2. **Go to Settings → Environment Variables**

3. **Add/Verify These Variables:**

```
NEXT_PUBLIC_SUPABASE_URL = (your main Supabase project URL)
SUPABASE_SERVICE_ROLE_KEY = (your main Supabase service role key)
BRAND_USE_DB = true
```

**Where to find these:**
- Go to your **main Supabase project** (not grocery)
- Settings → API
- Copy:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Keep secret!**

4. **Set Environment:**
   - Select **"Production"** (or "All" if you want dev too)

5. **Click "Save"**

---

### Step 2: Redeploy (IMPORTANT!)

**Environment variables are only loaded during deployment!**

1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait 2-5 minutes for deployment to complete

---

### Step 3: Test

1. Go to `/admin/brand-settings`
2. Try creating a brand again
3. Should work now! ✅

---

## 🔍 Verify Variables Are Set

After redeploy, you can verify:

1. Go to **Deployments** → Latest deployment
2. Click **"Functions"** tab
3. Look for any errors mentioning missing environment variables

Or check the build logs for environment variable warnings.

---

## 📝 Quick Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set in Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- [ ] `BRAND_USE_DB=true` is set in Vercel (optional, auto-detects)
- [ ] Variables are set for **Production** environment
- [ ] Redeployed after adding variables
- [ ] `brands` table exists in Supabase (you already did this ✅)

---

## ✅ After Fix

Once variables are set and you've redeployed:
- ✅ Brand saving should work
- ✅ Brands stored in database
- ✅ No more file system errors

---

## 🆘 Still Not Working?

If it still doesn't work after redeploy:

1. **Check Supabase connection:**
   - Verify the URL and key are correct
   - Make sure you're using the **main project** (not grocery)

2. **Check `brands` table exists:**
   - Go to Supabase → Table Editor
   - Should see `brands` table

3. **Check deployment logs:**
   - Vercel → Deployments → Latest → Logs
   - Look for any errors

4. **Try localhost:**
   - If it works locally but not in production, it's definitely an environment variable issue

---

**The fix is simple: Add the environment variables and redeploy!** 🚀

