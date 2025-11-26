# 🔧 Fix: Admin Brand Settings 404 Error

## The Problem

You're getting a 404 error when trying to access:
- `https://store.shooshka.online/admin/brand-settings`

## ✅ The Route Exists

The route **does exist** at `app/admin/brand-settings/page.tsx`. The 404 is likely due to:

1. **Not logged in** - Page redirects to `/auth`
2. **Not an admin** - Page shows access denied
3. **Route not deployed** - Changes not pushed to production
4. **Build issue** - Next.js build error

---

## 🔍 Step 1: Check if You're Logged In

1. **Go to:** `https://store.shooshka.online/auth`
2. **Sign in** with your account
3. **Then try:** `https://store.shooshka.online/admin/brand-settings`

**Expected:** If not logged in, it should redirect to `/auth`, not show 404.

---

## 🔍 Step 2: Check if You're an Admin

The page requires admin privileges. Check your admin status:

1. **Go to:** `https://store.shooshka.online/api/admin/check`
2. **Expected response:**
   ```json
   {"isAdmin": true}
   ```
   or
   ```json
   {"isAdmin": false}
   ```

**If `isAdmin: false`:**
- You need to set yourself as admin in Supabase
- See "Make Yourself Admin" section below

---

## 🔍 Step 3: Check if Route is Deployed

The route might not be deployed to production yet.

### Check Local First:

1. **Run locally:**
   ```bash
   npm run dev
   ```

2. **Visit:** `http://localhost:3000/admin/brand-settings`

3. **If it works locally:**
   - Route exists ✅
   - Need to deploy to production
   - See "Deploy to Production" section

4. **If it doesn't work locally:**
   - Check for build errors
   - See "Troubleshooting" section

---

## 🔍 Step 4: Check Build/Deployment

### Check Vercel Deployment:

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project
   - Check **Deployments**

2. **Check Latest Deployment:**
   - Is it successful? ✅
   - Any build errors? ❌
   - Is it the latest code?

3. **If build failed:**
   - Check build logs
   - Fix errors
   - Redeploy

---

## 🛠️ Make Yourself Admin

If you're not an admin, you need to set yourself as admin in Supabase:

### Method 1: Using Supabase Dashboard

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your project
   - Go to **Table Editor**

2. **Find `profiles` table:**
   - If it doesn't exist, create it (see below)

3. **Update your profile:**
   - Find your user row (by email)
   - Set `is_admin = true`
   - Save

### Method 2: Using SQL

Run this in Supabase SQL Editor:

```sql
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Make yourself admin (replace with your email)
UPDATE profiles
SET is_admin = true
WHERE email = 'your-email@example.com';

-- If profile doesn't exist, create it
INSERT INTO profiles (id, email, is_admin)
SELECT id, email, true
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true;
```

**Replace `your-email@example.com` with your actual email!**

---

## 🚀 Deploy to Production

If the route works locally but not in production:

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Add admin brand settings page"
git push origin main
```

### Step 2: Vercel Auto-Deploys

- Vercel should automatically deploy
- Check Vercel dashboard for deployment status

### Step 3: Verify Deployment

1. **Wait for deployment to complete** (~2-5 minutes)
2. **Visit:** `https://store.shooshka.online/admin/brand-settings`
3. **Should work now!** ✅

---

## 🧪 Test Locally First

Before deploying, test locally:

```bash
# 1. Start dev server
npm run dev

# 2. Visit
http://localhost:3000/admin/brand-settings

# 3. Sign in if needed
http://localhost:3000/auth

# 4. Check admin status
http://localhost:3000/api/admin/check
```

---

## 🔍 Troubleshooting

### Issue: Still Getting 404

**Check:**
1. ✅ Are you logged in?
2. ✅ Are you an admin?
3. ✅ Is the route deployed?
4. ✅ Check browser console for errors
5. ✅ Check Vercel function logs

### Issue: "Access Denied"

**Solution:**
- You're logged in but not an admin
- Follow "Make Yourself Admin" section above

### Issue: Redirects to /auth

**Solution:**
- You're not logged in
- Sign in first, then try again

### Issue: Build Fails

**Check:**
- TypeScript errors?
- Missing dependencies?
- Check build logs in Vercel

---

## ✅ Quick Checklist

- [ ] Route exists locally (`http://localhost:3000/admin/brand-settings`)
- [ ] You're logged in
- [ ] You're an admin (`/api/admin/check` returns `true`)
- [ ] Code is pushed to GitHub
- [ ] Vercel deployment is successful
- [ ] Latest deployment is live

---

## 🎯 Expected Behavior

**When you visit `/admin/brand-settings`:**

1. **Not logged in:**
   - Redirects to `/auth?next=/admin/brand-settings`
   - After login, redirects back to brand settings

2. **Logged in, not admin:**
   - Shows "Access Denied: Admin privileges required"
   - Not a 404!

3. **Logged in, is admin:**
   - Shows brand settings page ✅
   - Can create, edit, activate brands

---

## 🚨 If Still Not Working

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard
   - Deployments → Latest → Functions
   - Check for errors

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Try Direct API:**
   - `https://store.shooshka.online/api/admin/brands`
   - Should return brands list (if admin)

4. **Check File Exists:**
   - Verify `app/admin/brand-settings/page.tsx` exists
   - Verify it's in your Git repository

---

## 💡 Quick Fix

**If you just want to test locally:**

```bash
# 1. Make sure you're admin in Supabase
# 2. Run locally
npm run dev
# 3. Visit
http://localhost:3000/admin/brand-settings
```

**If it works locally but not in production:**
- Push code to GitHub
- Wait for Vercel to deploy
- Try again

---

## 📝 Summary

The route **exists** - the 404 is likely because:
1. You're not logged in (should redirect, not 404)
2. Route not deployed to production
3. Build error in Vercel

**Most likely:** Route not deployed yet. Push to GitHub and wait for Vercel deployment! 🚀

