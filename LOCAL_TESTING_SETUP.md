# Local Testing Setup with Host Mapping

This guide helps you test multiple brand domains locally using host mapping.

## Step 1: Edit Windows Hosts File

### Location
The hosts file is located at:
```
C:\Windows\System32\drivers\etc\hosts
```

### How to Edit (Windows)

**Option A: Using Notepad as Administrator (Recommended)**

1. Press `Win + X` and select **"Windows Terminal (Admin)"** or **"Command Prompt (Admin)"**
2. Run:
   ```powershell
   notepad C:\Windows\System32\drivers\etc\hosts
   ```
3. Add these lines at the end of the file:
   ```
   127.0.0.1 store.shooshka.online
   127.0.0.1 grocery.shooshka.online
   127.0.0.1 fashion.shooshka.online
   ```
4. Save the file (Ctrl+S)
5. Close Notepad

**Option B: Using VS Code as Administrator**

1. Open VS Code as Administrator (Right-click → Run as administrator)
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add the lines above
4. Save

**Option C: Using PowerShell (Run as Admin)**

```powershell
# Add entries to hosts file
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "`n127.0.0.1 store.shooshka.online"
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "127.0.0.1 grocery.shooshka.online"
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "127.0.0.1 fashion.shooshka.online"
```

### Verify Hosts File

After editing, verify the entries:

```powershell
Get-Content C:\Windows\System32\drivers\etc\hosts | Select-String "shooshka"
```

You should see:
```
127.0.0.1 store.shooshka.online
127.0.0.1 grocery.shooshka.online
127.0.0.1 fashion.shooshka.online
```

---

## Step 2: Start Development Server

In your project directory, start the Next.js dev server:

```bash
npm run dev
```

The server should start on `http://localhost:3000`

---

## Step 3: Test Each Domain

### Test Store Domain

1. Open browser (Chrome, Firefox, Edge)
2. Go to: `http://store.shooshka.online:3000`
3. **Expected:**
   - Title: "Ecommerce Start - Modern Shopping Experience"
   - Logo: Default ecommerce logo
   - Colors: Indigo (#4F46E5)
   - Products: Ecommerce products from main Supabase

### Test Grocery Domain

1. Go to: `http://grocery.shooshka.online:3000`
2. **Expected:**
   - Title: "Shooshka Grocery - Fresh Groceries Delivered..."
   - Logo: Grocery logo (or first letter "S")
   - Colors: Green (#10B981)
   - Products: Grocery products from grocery Supabase

### Test Fashion Domain (if configured)

1. Go to: `http://fashion.shooshka.online:3000`
2. **Expected:**
   - Title: Fashion brand title
   - Logo: Fashion logo
   - Colors: Fashion brand colors
   - Products: Fashion products

---

## Step 4: Verify in Browser DevTools

### Check Console Logs

Open DevTools (F12) → Console tab:

**For Store Domain:**
```
[getActiveBrandConfig] { domain: 'store.shooshka.online', brandSlug: 'default', ... }
[Homepage] Loading products: { brandSlug: 'default', hasCustomSupabase: false }
```

**For Grocery Domain:**
```
[getActiveBrandConfig] { domain: 'grocery.shooshka.online', brandSlug: 'grocery-store', ... }
[Homepage] Loading products: { brandSlug: 'grocery-store', hasCustomSupabase: true }
```

### Check Network Tab

1. Open DevTools → Network tab
2. Filter by "supabase"
3. Check the request URLs:
   - Store: Should use main Supabase URL
   - Grocery: Should use grocery Supabase URL (if configured)

### Check Injected Brand Config

1. View page source (Ctrl+U)
2. Search for `__BRAND_CONFIG__`
3. You should see:
   ```html
   <script type="application/json" id="__BRAND_CONFIG__">
     {"name":"Shooshka Grocery","slug":"grocery-store",...}
   </script>
   ```

---

## Step 5: Test No Flashing

### Test Title Flashing

1. Open domain in **Incognito/Private window**
2. Watch the browser tab title
3. **Expected:** Title should be correct from the start (no "Ecommerce Start" flash)

### Test Color Flashing

1. Open domain in **Incognito/Private window**
2. Watch the page colors
3. **Expected:** Colors should be correct from first render (no indigo flash before green)

### Test Logo Flashing

1. Open domain in **Incognito/Private window**
2. Watch the navbar logo
3. **Expected:** Logo should be correct from first render (no default logo flash)

---

## Troubleshooting

### "This site can't be reached" Error

**Problem:** Browser can't resolve the domain

**Solutions:**
1. Verify hosts file was saved correctly
2. Clear browser DNS cache:
   ```powershell
   ipconfig /flushdns
   ```
3. Restart browser
4. Try accessing `http://127.0.0.1:3000` first to verify server is running

### Domain Still Shows Main Brand

**Problem:** Grocery domain shows ecommerce brand

**Check:**
1. Database has brand with `domain = 'grocery.shooshka.online'`
2. Brand config is correct in database
3. Check browser console for errors

**Debug:**
```sql
SELECT slug, domain, config->>'name' as brand_name
FROM brands
WHERE domain = 'grocery.shooshka.online';
```

### Products Not Loading

**Problem:** Products don't appear or wrong products show

**Check:**
1. Supabase project is accessible
2. Products are imported into correct Supabase project
3. Check browser console for Supabase errors
4. Verify Supabase URL in brand config

### Port 3000 Already in Use

**Problem:** Another process is using port 3000

**Solution:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

Then access: `http://grocery.shooshka.online:3001`

---

## Quick Test Checklist

- [ ] Hosts file edited and saved
- [ ] DNS cache flushed (`ipconfig /flushdns`)
- [ ] Dev server running (`npm run dev`)
- [ ] Store domain loads: `http://store.shooshka.online:3000`
- [ ] Grocery domain loads: `http://grocery.shooshka.online:3000`
- [ ] Each domain shows correct brand (title, logo, colors)
- [ ] Each domain loads correct products
- [ ] No flashing on initial load
- [ ] Browser console shows correct brand logs
- [ ] Network tab shows correct Supabase URLs

---

## Next Steps

After local testing passes:

1. Configure brands in database (if not done)
2. Set up Supabase projects for each brand
3. Deploy to Vercel (see `DEPLOYMENT_GUIDE.md`)
4. Test in production

---

## Notes

- **Hosts file changes require admin privileges**
- **You may need to restart browser after editing hosts file**
- **Some browsers cache DNS aggressively - use incognito mode for testing**
- **If testing fails, verify the dev server is actually running on port 3000**

