# Debug Google OAuth and Wishlist Issues

## Current Issues

1. **Google Sign-In Not Working**
2. **Wishlist Not Visible**

## Debugging Steps

### 1. Check Browser Console

Open DevTools (F12) and check:
- Any error messages?
- Look for "Auth state changed" logs
- Check Network tab for failed requests

### 2. Test Google OAuth Flow

1. Go to `/auth` page
2. Click "Continue with Google"
3. Check what happens:
   - Does it redirect to Google?
   - After authorizing, does it redirect back?
   - What URL does it redirect to?
   - Any error messages?

### 3. Check Supabase Redirect URLs

Go to Supabase Dashboard → Authentication → URL Configuration:

**Redirect URLs should include:**
- `http://localhost:3000/api/auth/callback`
- `http://localhost:3001/api/auth/callback` (if using port 3001)
- `https://ecomm-next-yf7p.vercel.app/api/auth/callback`

**Site URL should be:**
- `http://localhost:3000` (for local)
- Or your production URL

### 4. Check Google OAuth Configuration

1. **Supabase Dashboard:**
   - Authentication → Providers → Google
   - Should be **Enabled**
   - Client ID and Secret should be set

2. **Google Cloud Console:**
   - Authorized redirect URIs should include:
   - `https://eqqcidlflclgegsalbub.supabase.co/auth/v1/callback`
   - (This is Supabase's callback, not your app's)

### 5. Check Wishlist Visibility

The wishlist link should appear when:
- ✅ User is signed in (`user` is truthy)
- ✅ AuthProvider has finished loading (`loading` is false)

**To check:**
1. Open browser console
2. Type: `localStorage.getItem('sb-eqqcidlflclgegsalbub-auth-token')`
3. If it returns a value, you have a session
4. Check if you see your email in the navbar

### 6. Force Session Refresh

After Google sign-in, try:
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or clear browser cache and try again
3. Check if session exists in browser storage

## Common Issues and Fixes

### Issue: Google redirects but doesn't sign in

**Possible causes:**
1. Redirect URL not in Supabase allowed list
2. Session cookies not being set properly
3. AuthProvider not detecting the session

**Fix:**
- Check redirect URLs in Supabase
- Try hard refresh after OAuth
- Check browser console for errors

### Issue: Wishlist link not visible

**Possible causes:**
1. User state not updating after sign-in
2. AuthProvider still loading
3. User not actually signed in

**Fix:**
- Check if you see your email in navbar (means you're signed in)
- Check browser console for auth state changes
- Try accessing `/wishlist` directly in browser

## Testing Checklist

- [ ] Google OAuth redirects to Google
- [ ] After authorizing, redirects back to app
- [ ] Session is created (check browser storage)
- [ ] User email appears in navbar
- [ ] Wishlist link appears in navbar
- [ ] Can access `/wishlist` page
- [ ] Can add products to wishlist

## Quick Test

1. **Sign in with Google:**
   - Go to `/auth`
   - Click "Continue with Google"
   - Complete OAuth flow
   - Should redirect back and be signed in

2. **Check if signed in:**
   - Look for your email in navbar
   - If you see "Sign In" button, you're NOT signed in

3. **Check wishlist:**
   - If signed in, "Wishlist" link should be visible
   - Click it → Should go to `/wishlist` page

