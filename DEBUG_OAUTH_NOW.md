# Debug OAuth - Step by Step

## What We Need to Know

Please share:

1. **What happens when you click "Sign in with Google"?**
   - Does it redirect to Google?
   - Does Google show the consent screen?
   - What happens after you authorize?

2. **What URL do you end up on?**
   - Check the browser address bar
   - Is it: `http://localhost:3000/api/auth/callback?code=...`?
   - Or: `http://localhost:3000/?code=...`?
   - Or: `http://localhost:3000/auth?error=...`?
   - Or something else?

3. **Any error messages?**
   - In the browser console (F12 → Console)
   - On the page itself
   - In the terminal where `npm run dev` is running

4. **Check Supabase Redirect URLs RIGHT NOW**

Go to: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub/auth/url-configuration

**What redirect URLs do you see?** Please list them exactly as they appear.

**What is the Site URL set to?**

5. **Check Your .env.local**

Open `.env.local` and verify:
```
NEXT_PUBLIC_SUPABASE_URL=https://eqqcidlflclgegsalbub.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Quick Test

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Click "Sign in with Google"
4. Watch the network requests:
   - Should see request to Google
   - Should see redirect to Supabase
   - Should see redirect to your callback
   - Which one fails?

## Most Common Issues

### Issue 1: Supabase Redirect URL Wrong

**Symptom:** Redirects to home page (`/?code=...`) instead of callback

**Fix:** Add `http://localhost:3000/api/auth/callback` to Supabase redirect URLs

### Issue 2: Google Console Missing Supabase URL

**Symptom:** "redirect_uri_mismatch" error

**Fix:** Add `https://eqqcidlflclgegsalbub.supabase.co/auth/v1/callback` to Google Console

### Issue 3: Code Verifier Missing (PKCE)

**Symptom:** "code verifier should be non-empty" error

**Fix:** This happens when redirect URL is wrong - fix Supabase redirect URLs

## Share These Details

Please copy and paste:
1. The exact URL you end up on after OAuth
2. Any error messages from console
3. The redirect URLs from Supabase dashboard
4. What you see on the page (signed in? error message?)

This will help me identify the exact problem!

