# 🔗 Supabase Redirect URLs Configuration Guide

## 📋 Overview

This guide helps you configure Supabase redirect URLs for both **local development** and **production** (online) environments.

---

## 🎯 What Redirect URLs Are Used?

Based on your code, these are the redirect URLs your app uses:

1. **Email Sign-Up Confirmation:**
   - Local: `http://localhost:3000/api/auth/callback`
   - Production: `https://shooshka.online/api/auth/callback`

2. **Google OAuth:**
   - Local: `http://localhost:3000/api/auth/callback?next=/`
   - Production: `https://shooshka.online/api/auth/callback?next=/`

3. **Password Reset:**
   - Local: `http://localhost:3000/auth/reset-password`
   - Production: `https://shooshka.online/auth/reset-password`

---

## ✅ Step-by-Step Configuration

### 1. Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub
2. Navigate to: **Authentication** → **URL Configuration**

### 2. Configure Site URL

**For Local Development:**
```
http://localhost:3000
```

**For Production:**
```
https://shooshka.online
```

⚠️ **Note:** You can only set ONE Site URL at a time. For local development, you'll need to temporarily change this.

### 3. Configure Redirect URLs

Add ALL of these URLs to the **Redirect URLs** list (one per line):

**For Local Development:**
```
http://localhost:3000/api/auth/callback
http://localhost:3000/auth/reset-password
```

**For Production:**
```
https://shooshka.online/api/auth/callback
https://shooshka.online/auth/reset-password
```

**Recommended: Add BOTH local and production URLs** so you can test both:
```
http://localhost:3000/api/auth/callback
http://localhost:3000/auth/reset-password
https://shooshka.online/api/auth/callback
https://shooshka.online/auth/reset-password
```

### 4. Save Changes

Click **"Save"** at the bottom of the page.

---

## 🔍 How to Verify Your Settings

### Check Current Configuration

1. Go to: **Authentication** → **URL Configuration**
2. Verify:
   - ✅ Site URL matches your environment
   - ✅ All redirect URLs are listed
   - ✅ No typos in URLs

### Test Local Development

1. **Set Site URL to:** `http://localhost:3000`
2. **Make sure redirect URLs include:**
   - `http://localhost:3000/api/auth/callback`
   - `http://localhost:3000/auth/reset-password`
3. **Start your dev server:**
   ```bash
   npm run dev
   ```
4. **Test:**
   - Sign up with email → Check email confirmation link
   - Sign in with Google → Should redirect back to your app
   - Request password reset → Check email reset link

### Test Production (Online)

1. **Set Site URL to:** `https://shooshka.online`
2. **Make sure redirect URLs include:**
   - `https://shooshka.online/api/auth/callback`
   - `https://shooshka.online/auth/reset-password`
3. **Test on your live site:**
   - Visit: https://shooshka.online/auth
   - Try signing up/signing in
   - Test Google OAuth
   - Test password reset

---

## 🐛 Common Issues & Solutions

### Issue 1: "Redirect URL not allowed"

**Error Message:**
```
redirect_uri_mismatch
The redirect_uri MUST match the registered callback URLs
```

**Solution:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add the exact URL that's failing to the Redirect URLs list
3. Make sure there are no trailing slashes or extra parameters
4. Save and wait 1-2 minutes for changes to propagate

### Issue 2: Email confirmation link doesn't work

**Symptoms:**
- Clicking email confirmation link shows error
- Link redirects to wrong page

**Solution:**
1. Check that `http://localhost:3000/api/auth/callback` (or production URL) is in Redirect URLs
2. Verify Site URL matches your environment
3. Check email link format - should be: `.../api/auth/callback?token=...`

### Issue 3: Google OAuth redirects but doesn't sign in

**Symptoms:**
- Redirects back to your app
- But user is not signed in
- Shows error message

**Solution:**
1. Verify redirect URL in Supabase: `https://shooshka.online/api/auth/callback`
2. Check Google Cloud Console redirect URI (should be Supabase's callback, not yours)
3. Make sure callback route is working: `/api/auth/callback`

### Issue 4: Password reset link doesn't work

**Symptoms:**
- Reset link in email doesn't work
- Shows "Invalid or expired reset link"

**Solution:**
1. Add `https://shooshka.online/auth/reset-password` to Redirect URLs
2. For local: `http://localhost:3000/auth/reset-password`
3. Verify Site URL matches your environment

---

## 📝 Quick Reference

### Local Development URLs

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000/api/auth/callback
http://localhost:3000/auth/reset-password
```

### Production URLs

**Site URL:**
```
https://shooshka.online
```

**Redirect URLs:**
```
https://shooshka.online/api/auth/callback
https://shooshka.online/auth/reset-password
```

---

## 🔄 Switching Between Local and Production

Since you can only set ONE Site URL at a time, here's how to switch:

### For Local Testing:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL:** `http://localhost:3000`
3. Make sure local redirect URLs are in the list
4. Save
5. Test locally

### For Production:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL:** `https://shooshka.online`
3. Make sure production redirect URLs are in the list
4. Save
5. Test on live site

**Pro Tip:** You can keep BOTH local and production redirect URLs in the list at the same time. Only the Site URL needs to be changed.

---

## ✅ Checklist

Before going live, verify:

- [ ] Site URL is set to `https://shooshka.online`
- [ ] Redirect URLs include:
  - [ ] `https://shooshka.online/api/auth/callback`
  - [ ] `https://shooshka.online/auth/reset-password`
- [ ] Tested email sign-up on production
- [ ] Tested Google OAuth on production
- [ ] Tested password reset on production
- [ ] All authentication flows work correctly

---

## 🆘 Still Having Issues?

1. **Check Supabase Logs:**
   - Go to: Authentication → Logs
   - Look for errors related to redirects

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Verify Environment Variables:**
   - Make sure `NEXT_PUBLIC_APP_URL` is set correctly
   - For production: `https://shooshka.online`
   - For local: Not needed (uses `window.location.origin`)

4. **Wait for Propagation:**
   - Supabase changes can take 1-2 minutes to propagate
   - Clear browser cache and cookies
   - Try in incognito/private window

---

**Last Updated:** $(date)  
**Project:** shooshka.online

