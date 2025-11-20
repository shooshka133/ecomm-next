# Fix Google Sign-In and Wishlist Visibility

## ✅ Fixed Issues

### 1. Google Sign-In Not Working

**Problem:** `supabase` variable was not defined in `handleGoogleAuth` function.

**Fix:** Added `const supabase = createSupabaseClient()` inside the function.

**Location:** `app/auth/page.tsx` line 198

### 2. Wishlist Not Shown

**Current Status:** 
- ✅ Wishlist link is in Navbar (desktop and mobile)
- ✅ Only visible when user is signed in
- ✅ Links to `/wishlist` page

**If wishlist link is not visible:**
1. Make sure you're signed in
2. Check if `user` state is properly set in AuthProvider
3. The link should appear between "Products" and "Cart" in the navbar

## 🔍 Troubleshooting

### Google Sign-In Issues

1. **Check Supabase Redirect URLs:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Make sure these URLs are in Redirect URLs:
     - `http://localhost:3000/api/auth/callback`
     - `http://localhost:3001/api/auth/callback` (if using port 3001)
     - `https://ecomm-next-yf7p.vercel.app/api/auth/callback`
     - `https://shooshka.online/api/auth/callback` (if using custom domain)

2. **Check Google OAuth Setup:**
   - Supabase Dashboard → Authentication → Providers → Google
   - Make sure Google OAuth is enabled
   - Verify Client ID and Client Secret are set

3. **Check Environment Variables:**
   - `NEXT_PUBLIC_APP_URL` should be set in Vercel
   - Should match your production URL

### Wishlist Visibility Issues

1. **Check if you're signed in:**
   - Look for your email/username in the navbar
   - If you see "Sign In" button, you're not signed in

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for any errors related to authentication

3. **Force refresh:**
   - After signing in, try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - This ensures the AuthProvider picks up the new session

## 🧪 Testing

### Test Google Sign-In:
1. Go to `/auth` page
2. Click "Continue with Google"
3. Should redirect to Google
4. After authorizing, should redirect back and sign you in
5. Should see your email in navbar

### Test Wishlist:
1. Sign in (email or Google)
2. Look for "Wishlist" link in navbar (with heart icon)
3. Click it → Should go to `/wishlist` page
4. Click heart on a product → Should add to wishlist
5. Go back to wishlist page → Should see the product

## 📝 Next Steps

If Google sign-in still doesn't work:
1. Check browser console for errors
2. Verify Supabase redirect URLs are correct
3. Check if Google OAuth is properly configured in Supabase

If wishlist is still not visible:
1. Make sure you're actually signed in (check navbar for user info)
2. Check if the wishlist page exists: `app/wishlist/page.tsx`
3. Try accessing `/wishlist` directly in the browser

