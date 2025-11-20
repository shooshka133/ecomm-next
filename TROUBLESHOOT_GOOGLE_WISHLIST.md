# Troubleshoot Google Sign-In and Wishlist

## What I Just Fixed

1. **Improved OAuth callback handling:**
   - Changed from `router.replace()` to `window.location.href = '/'` for full page reload
   - This ensures AuthProvider picks up the new session

2. **Improved AuthProvider:**
   - Immediately updates user state on `SIGNED_IN` event
   - No longer waits for delayed refresh

## Quick Diagnostic Steps

### Step 1: Check if Google OAuth is configured

1. Go to **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. Verify:
   - ✅ **Enabled**: ON
   - ✅ **Client ID**: Set
   - ✅ **Client Secret**: Set

### Step 2: Check Redirect URLs

**Supabase Dashboard** → **Authentication** → **URL Configuration**:

**Redirect URLs must include:**
```
http://localhost:3000/api/auth/callback
http://localhost:3001/api/auth/callback
https://ecomm-next-yf7p.vercel.app/api/auth/callback
```

**Site URL:**
```
http://localhost:3000
```

### Step 3: Test Google Sign-In

1. Open browser DevTools (F12)
2. Go to `/auth` page
3. Click "Continue with Google"
4. Watch the console for:
   - Any error messages
   - "Auth state changed" logs
   - Network requests

5. After authorizing with Google:
   - Check what URL you're redirected to
   - Check if you see any errors
   - Check if session is created

### Step 4: Check if You're Actually Signed In

After Google OAuth:

1. **Look at the navbar:**
   - Do you see your email/username? → You're signed in ✅
   - Do you see "Sign In" button? → You're NOT signed in ❌

2. **Check browser console:**
   - Type: `localStorage.getItem('sb-eqqcidlflclgegsalbub-auth-token')`
   - If it returns a value → Session exists ✅
   - If it returns `null` → No session ❌

3. **Check Network tab:**
   - Look for requests to `/api/auth/callback`
   - Check if they succeeded (200 status)

### Step 5: Check Wishlist Visibility

The wishlist link should appear when:
- ✅ `user` is truthy (you're signed in)
- ✅ `loading` is false (AuthProvider finished loading)

**If wishlist is not visible:**
1. Make sure you're actually signed in (see Step 4)
2. Try hard refresh: `Ctrl+Shift+R`
3. Check browser console for errors
4. Try accessing `/wishlist` directly in the browser

## Common Issues

### Issue 1: Google redirects but doesn't sign in

**Symptoms:**
- Redirects to Google ✅
- Authorizes ✅
- Redirects back ✅
- But still shows "Sign In" button ❌

**Possible causes:**
1. Redirect URL not in Supabase allowed list
2. Session cookies not being set
3. AuthProvider not detecting session

**Fix:**
- Verify redirect URLs in Supabase
- Try hard refresh after OAuth
- Check browser console for errors

### Issue 2: Wishlist link not visible

**Symptoms:**
- You're signed in (see email in navbar)
- But wishlist link is missing

**Possible causes:**
1. Navbar component not re-rendering
2. User state not updating
3. CSS hiding the link

**Fix:**
- Hard refresh the page
- Check if you can access `/wishlist` directly
- Check browser console for errors

## Manual Test

1. **Clear browser cache and cookies**
2. **Go to** `http://localhost:3000/auth`
3. **Click** "Continue with Google"
4. **Authorize** with Google
5. **After redirect:**
   - Check navbar for your email
   - Look for "Wishlist" link
   - Try clicking it

## If Still Not Working

Please provide:
1. **Browser console errors** (F12 → Console tab)
2. **Network tab** - Check `/api/auth/callback` request
3. **What happens** when you click "Continue with Google"
4. **What URL** you're redirected to after Google authorization

This will help me identify the exact issue.

