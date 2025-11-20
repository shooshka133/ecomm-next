# OAuth PKCE Troubleshooting

## Error: "invalid flow state, no valid flow state found"

This error means the PKCE code verifier is missing from `sessionStorage`.

## Root Cause

The PKCE code verifier is stored in `sessionStorage` when you click "Sign in with Google". If:
- The redirect URL doesn't match exactly
- The OAuth flow was started in a different tab
- `sessionStorage` was cleared
- The redirect goes to a different domain

Then the code verifier won't be found, causing this error.

## Solution

### Step 1: Verify Supabase Redirect URLs

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Redirect URLs** must include **exactly**:
   ```
   https://ecomm-next-yf7p.vercel.app/api/auth/callback
   ```
3. **Site URL** should be:
   ```
   https://ecomm-next-yf7p.vercel.app
   ```

### Step 2: Check Browser Console

After clicking "Sign in with Google", check the console for:
- `"🔄 OAuth code detected on home page, exchanging directly..."`
- `"🔍 PKCE check:"` - shows if code verifier exists
- Any error messages

### Step 3: Clear Browser Data

If it's still not working:
1. Clear browser cache and cookies
2. Clear `sessionStorage` (DevTools → Application → Session Storage → Clear)
3. Try again

### Step 4: Check Redirect URL in Code

The redirect URL in `app/auth/page.tsx` should match Supabase:
```typescript
const callbackUrl = `${redirectUrl}/api/auth/callback?next=/`
```

Where `redirectUrl` is:
- Production: `https://ecomm-next-yf7p.vercel.app`
- Local: `http://localhost:3000`

## How It Works Now

1. **Server-side callback** tries first (`/api/auth/callback`)
2. If PKCE error → redirects to `/?code=...`
3. **Client-side handler** exchanges code using `sessionStorage`
4. Session created → redirects to `/?auth=success`
5. Page reloads → user signed in

## Debugging

Check browser console for:
- `"🔄 OAuth code detected"` - code found on home page
- `"🔍 PKCE check"` - shows if verifier exists
- `"✅ Session created"` - success
- `"❌ Error"` - failure with details

## If Still Not Working

1. **Check Vercel logs** - look for callback route errors
2. **Check browser console** - look for PKCE errors
3. **Verify Supabase redirect URLs** - must match exactly
4. **Try in incognito mode** - to rule out cache issues

