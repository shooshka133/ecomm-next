# Supabase Configuration Check

## Your Current Configuration

Based on your Vercel deployment URL: `https://ecomm-next-yf7p.vercel.app`

### ✅ Correct Supabase Settings:

**Site URL:**
```
https://ecomm-next-yf7p.vercel.app
```

**Redirect URLs (should include ALL of these):**
```
https://ecomm-next-yf7p.vercel.app/api/auth/callback
http://localhost:3000/api/auth/callback
http://localhost:3001/api/auth/callback
https://ecomm-next-yf7p.vercel.app/auth/reset-password
http://localhost:3000/auth/reset-password
http://localhost:3001/auth/reset-password
```

## How Your Code Uses These URLs

### 1. Google OAuth Sign-In
- **Code location:** `app/auth/page.tsx` line 202
- **Uses:** `process.env.NEXT_PUBLIC_APP_URL || window.location.origin`
- **Redirects to:** `${redirectUrl}/api/auth/callback?next=/`

### 2. Email Sign-Up
- **Code location:** `app/auth/page.tsx` line 113
- **Uses:** `window.location.origin` (dynamic based on where user is)
- **Redirects to:** `${window.location.origin}/api/auth/callback`

### 3. Password Reset
- **Code location:** `app/auth/page.tsx` line 173
- **Uses:** `process.env.NEXT_PUBLIC_APP_URL || window.location.origin`
- **Redirects to:** `${redirectUrl}/auth/reset-password`

## Required Vercel Environment Variable

Make sure this is set in Vercel:

```
NEXT_PUBLIC_APP_URL=https://ecomm-next-yf7p.vercel.app
```

## Verification Checklist

### In Supabase Dashboard:
- [ ] **Site URL** = `https://ecomm-next-yf7p.vercel.app`
- [ ] **Redirect URLs** includes:
  - [ ] `https://ecomm-next-yf7p.vercel.app/api/auth/callback`
  - [ ] `http://localhost:3000/api/auth/callback`
  - [ ] `http://localhost:3001/api/auth/callback` (if you use this port)
  - [ ] `https://ecomm-next-yf7p.vercel.app/auth/reset-password`
  - [ ] `http://localhost:3000/auth/reset-password`

### In Vercel Dashboard:
- [ ] `NEXT_PUBLIC_APP_URL` = `https://ecomm-next-yf7p.vercel.app`

## Testing

### Test Production (Vercel):
1. Go to: https://ecomm-next-yf7p.vercel.app/auth
2. Try Google sign-in → Should redirect correctly
3. Try email sign-up → Should redirect correctly
4. Try password reset → Should redirect correctly

### Test Local:
1. Go to: http://localhost:3001/auth (or 3000)
2. Try Google sign-in → Should redirect correctly
3. Try email sign-up → Should redirect correctly

## Common Issues

### Issue: "Redirect URL not allowed"
**Solution:** Make sure the exact URL is in Supabase Redirect URLs list

### Issue: OAuth works but doesn't sign in
**Solution:** Check that callback route exists and `NEXT_PUBLIC_APP_URL` is set correctly

### Issue: Password reset link doesn't work
**Solution:** Add `/auth/reset-password` URL to Redirect URLs

## Notes

- You can have **multiple redirect URLs** in Supabase - it will use the one that matches
- The **Site URL** should be your production domain
- **Redirect URLs** can include both production and localhost URLs
- The callback route is at `/api/auth/callback` (not `/auth/callback`)

