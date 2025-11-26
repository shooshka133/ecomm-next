# ✅ Correct Supabase Redirect URLs

## 🚨 Issues Found

You have some incorrect redirect URLs. Here's what needs to be fixed:

### ❌ Wrong URLs (Remove These):
```
https://ecomm-next-yf7p.vercel.app/auth/callback
https://grocery.shooshka.online/auth/callback
```

**Problem:** These use `/auth/callback` but should use `/api/auth/callback`

### ✅ Correct URLs (Keep These):
```
http://localhost:3000/api/auth/callback
https://store.shooshka.online/api/auth/callback
https://grocery.shooshka.online/api/auth/callback
```

---

## 📋 Complete Correct List

**Copy and paste this into Supabase Dashboard → Authentication → URL Configuration → Redirect URLs:**

```
http://localhost:3000/api/auth/callback
https://ecomm-next-yf7p.vercel.app/api/auth/callback
https://store.shooshka.online/api/auth/callback
https://grocery.shooshka.online/api/auth/callback
```

**One URL per line** (Supabase will accept them as a comma-separated list or one per line)

---

## 🔧 How to Fix

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **URL Configuration**

### Step 2: Update Redirect URLs
1. **Remove** these incorrect URLs:
   - ❌ `https://ecomm-next-yf7p.vercel.app/auth/callback`
   - ❌ `https://grocery.shooshka.online/auth/callback`

2. **Add** these correct URLs (if not already there):
   - ✅ `https://ecomm-next-yf7p.vercel.app/api/auth/callback`
   - ✅ `http://localhost:3000/api/auth/callback`
   - ✅ `https://store.shooshka.online/api/auth/callback`
   - ✅ `https://grocery.shooshka.online/api/auth/callback`

### Step 3: Update Site URL
**Site URL should be:**
```
https://grocery.shooshka.online
```
(Or your main domain - this is just the default, redirect URLs are what matter)

### Step 4: Save
Click **Save** at the bottom

---

## ✅ Final Configuration

**Redirect URLs (all should end with `/api/auth/callback`):**
```
http://localhost:3000/api/auth/callback
https://ecomm-next-yf7p.vercel.app/api/auth/callback
https://store.shooshka.online/api/auth/callback
https://grocery.shooshka.online/api/auth/callback
```

**Site URL:**
```
https://grocery.shooshka.online
```

---

## 🧪 Why This Matters

- **`/auth/callback`** ❌ - This route doesn't exist in your app
- **`/api/auth/callback`** ✅ - This is the actual callback route that handles OAuth

If you use `/auth/callback`, users will get a 404 error after signing in!

---

## 📝 Quick Checklist

- [ ] Removed `/auth/callback` URLs
- [ ] Added `/api/auth/callback` URLs for all domains
- [ ] Site URL set to your main domain
- [ ] Clicked Save
- [ ] Tested sign-in from `grocery.shooshka.online`
- [ ] Tested sign-in from `store.shooshka.online`

---

## 🎯 Summary

**The key rule:** All redirect URLs must end with `/api/auth/callback`, not `/auth/callback`!

