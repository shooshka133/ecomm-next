# Fix: Testing Local Domains That Are Already in Production

## The Problem

Your domains `grocery.shooshka.online` and `store.shooshka.online` are already deployed to production. When you try to access them locally with port 3000, you're getting SSL errors because:

1. **Browser forces HTTPS** - Modern browsers remember that these domains use HTTPS and force it
2. **Hosts file may not override** - Some browsers ignore hosts file for known HTTPS domains
3. **Production server blocks port 3000** - Your production server doesn't listen on port 3000

## Solution: Use Local Test Domains

Instead of using your production domains, use **local-only test domains** that won't conflict:

### Option 1: Use `.local` Domains (Recommended)

Edit your hosts file to use `.local` domains:

```
127.0.0.1 store.local
127.0.0.1 grocery.local
127.0.0.1 fashion.local
```

Then test:
- `http://store.local:3000`
- `http://grocery.local:3000`
- `http://fashion.local:3000`

**Why this works:**
- `.local` domains are reserved for local network use
- Browsers won't force HTTPS
- No conflict with production domains

### Option 2: Use `localhost` with Subdomains

Some setups allow `localhost` subdomains. Try:
- `http://store.localhost:3000`
- `http://grocery.localhost:3000`

**Note:** This may require additional configuration.

### Option 3: Use Different Ports (If Needed)

If port 3000 is blocked, use different ports:

```bash
# Start dev server on port 3001
npm run dev -- -p 3001
```

Then access:
- `http://store.local:3001`
- `http://grocery.local:3001`

---

## Quick Fix Steps

### Step 1: Update Hosts File

**Windows:**
1. Open PowerShell as Administrator
2. Run:
   ```powershell
   notepad C:\Windows\System32\drivers\etc\hosts
   ```
3. Replace or add:
   ```
   127.0.0.1 store.local
   127.0.0.1 grocery.local
   127.0.0.1 fashion.local
   ```
4. Save and close
5. Flush DNS:
   ```powershell
   ipconfig /flushdns
   ```

### Step 2: Update Your Code (If Needed)

If your code checks for specific domains, you may need to add `.local` as valid test domains. But the middleware should work with any domain.

### Step 3: Test

1. Make sure dev server is running: `npm run dev`
2. Open browser in **Incognito/Private mode** (to avoid HTTPS cache)
3. Test:
   - `http://store.local:3000`
   - `http://grocery.local:3000`

---

## Why Production Domains Don't Work Locally

### The SSL Error Explained

When you access `http://grocery.shooshka.online:3000`:

1. **Browser checks hosts file** → Should find `127.0.0.1`
2. **BUT** if browser has HSTS (HTTP Strict Transport Security) for `shooshka.online`, it **forces HTTPS**
3. **Browser tries** `https://grocery.shooshka.online:3000`
4. **Local dev server** doesn't have SSL certificate → **ERR_SSL_PROTOCOL_ERROR**

### HSTS (HTTP Strict Transport Security)

Your production site likely sends HSTS headers, which tell browsers:
- "Always use HTTPS for this domain"
- Browsers remember this for weeks/months
- Even with hosts file, browser may force HTTPS

### Solutions

1. **Use `.local` domains** (best solution)
2. **Clear HSTS cache** (temporary, complex)
3. **Use different test domains** (like `test-store.local`)

---

## Alternative: Test with Production Domains (Advanced)

If you MUST use production domain names locally:

### Method 1: Disable HSTS in Browser

**Chrome:**
1. Go to `chrome://net-internals/#hsts`
2. Under "Delete domain security policies", enter: `shooshka.online`
3. Click "Delete"
4. Clear browser cache
5. Try `http://grocery.shooshka.online:3000` again

**Note:** This is temporary and may not work if HSTS is set at domain level.

### Method 2: Use HTTPS Locally

Set up local SSL certificate (complex, not recommended for quick testing).

---

## Recommended Approach

**Use `.local` domains for local testing:**

1. ✅ No conflict with production
2. ✅ No SSL issues
3. ✅ No HSTS problems
4. ✅ Works immediately
5. ✅ Clear separation between local and production

**Your hosts file should have:**
```
127.0.0.1 store.local
127.0.0.1 grocery.local
127.0.0.1 fashion.local
```

**Test URLs:**
- `http://store.local:3000` → Ecommerce Start
- `http://grocery.local:3000` → Shooshka Grocery
- `http://fashion.local:3000` → Fashion Brand

---

## Verify Hosts File is Working

Test if hosts file is working:

```powershell
# Test DNS resolution
nslookup store.local
nslookup grocery.local
```

Should return `127.0.0.1`

If it doesn't:
1. Verify hosts file was saved
2. Run `ipconfig /flushdns` again
3. Restart browser
4. Try incognito mode

---

## Summary

**Problem:** Production domains have HTTPS/HSTS, causing SSL errors when testing locally.

**Solution:** Use `.local` domains for local testing:
- `store.local:3000`
- `grocery.local:3000`
- `fashion.local:3000`

This avoids all SSL/HSTS issues and clearly separates local testing from production.

