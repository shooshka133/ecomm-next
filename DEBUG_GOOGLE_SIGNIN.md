# Debug Google Sign-In Issue

## CSP Warnings (Can Ignore)
The Content Security Policy warnings you're seeing are from Google's OAuth scripts and are harmless. They won't prevent sign-in from working.

## What to Check

### 1. Filter Console to Errors Only
1. Open DevTools (F12)
2. Go to Console tab
3. Click the filter icon (funnel)
4. Select **"Errors"** only
5. Clear the console
6. Try signing in with Google

### 2. Look for These Messages

**From our code:**
- `"Exchanging code for session..."`
- `"❌ Error exchanging code for session:"` ← **This is the important one**
- `"OAuth success - Session created for user:"`
- `"Session verified, redirecting..."`

**What to share:**
- Any message starting with `"❌ Error"`
- The full error object details

### 3. Check Network Tab

1. Open DevTools → Network tab
2. Try signing in with Google
3. Look for request to `/auth/callback`
4. Click on it
5. Check:
   - **Status code** (should be 200)
   - **Response** tab - what does it show?
   - **Headers** - any error headers?

### 4. What Happens Visually?

After clicking "Sign in with Google":
- [ ] Redirects to Google? (Yes/No)
- [ ] After authorizing, redirects back? (Yes/No)
- [ ] Shows error message? (What does it say?)
- [ ] Stays on callback page? (Yes/No)
- [ ] Redirects to home but not signed in? (Yes/No)

### 5. Check Supabase Dashboard

1. Go to **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Try signing in
3. Look for errors in the logs
4. Share any error messages

## Common Error Messages

### "both auth code and code verifier should be non-empty"
- **Fixed**: We're now using client-side callback

### "Account already exists"
- **Normal**: Supabase should link accounts automatically
- **Check**: Supabase settings → Email confirmation should be OFF for OAuth

### "Invalid redirect URL"
- **Fix**: Check Supabase redirect URLs match exactly

### "Session could not be verified"
- **Possible cause**: Session not persisting in cookies
- **Check**: Browser cookie settings, third-party cookies

## Next Steps

After gathering the above information, we can pinpoint the exact issue and fix it.

