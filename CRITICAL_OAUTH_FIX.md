# Critical OAuth Fix - Do These Steps NOW

## Step 1: Fix Supabase Redirect URLs (MOST IMPORTANT)

Go to: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub/auth/url-configuration

### Site URL:
Set to: `http://localhost:3000`

### Redirect URLs:
**MUST have EXACTLY these (one per line):**
```
http://localhost:3000/api/auth/callback
https://ecomm-next-yf7p.vercel.app/api/auth/callback
```

**❌ Remove these if they exist:**
- `http://localhost:3000/`
- `http://localhost:3000/auth/callback`
- Any URL without `/api/auth/callback`

**Click SAVE**

## Step 2: Check Google Cloud Console

Go to: https://console.cloud.google.com/apis/credentials

1. Find your OAuth 2.0 Client ID
2. Click to edit it
3. **Authorized redirect URIs** must have:
   ```
   https://eqqcidlflclgegsalbub.supabase.co/auth/v1/callback
   ```
4. **Save**

## Step 3: Clear Everything

```bash
# Kill Node processes
taskkill /F /IM node.exe

# Clear browser cache
# In Chrome: F12 → Application → Clear storage → Clear site data
```

## Step 4: Restart Dev Server

```bash
npm run dev
```

## Step 5: Test OAuth

1. Go to: `http://localhost:3000/auth`
2. Open DevTools (F12) → Console tab
3. Click "Sign in with Google"
4. **Watch the console** - you should see:
   ```
   🔗 Google OAuth - Redirect URL: http://localhost:3000/api/auth/callback?next=/
   ```
5. After Google authorization, check the URL:
   - ✅ Should be: `http://localhost:3000/api/auth/callback?code=...`
   - ❌ NOT: `http://localhost:3000/?code=...`

## Step 6: Check Terminal Logs

In the terminal where `npm run dev` is running, you should see:
```
[OAuth Callback] Callback route hit
[OAuth Callback] Exchanging code for session...
[OAuth Callback] OAuth success - Session created for user: your@email.com
```

## If Still Not Working

Share:
1. **The exact URL** you end up on after OAuth
2. **Console errors** (copy/paste)
3. **Terminal logs** (copy/paste)
4. **Supabase redirect URLs** (screenshot or list them)

## Quick Checklist

- [ ] Supabase Site URL = `http://localhost:3000`
- [ ] Supabase Redirect URLs include `http://localhost:3000/api/auth/callback`
- [ ] Google Console has `https://eqqcidlflclgegsalbub.supabase.co/auth/v1/callback`
- [ ] Browser cache cleared
- [ ] Dev server restarted
- [ ] Testing in same browser tab (not new tab)

Do these steps in order and let me know what happens!

