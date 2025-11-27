# Quick Test Checklist - Local Multi-Brand Testing

## ✅ Hosts File Setup Complete

Your hosts file should now have:
- `127.0.0.1 store.local`
- `127.0.0.1 grocery.local`
- `127.0.0.1 fashion.local`

## 🧪 Test Each Domain

### 1. Store Domain Test
**URL:** `http://store.local:3000`

**Expected Results:**
- ✅ Title: "Ecommerce Start - Modern Shopping Experience"
- ✅ Logo: Ecommerce logo (or "E" letter)
- ✅ Colors: Indigo (#4F46E5)
- ✅ Hero: "Welcome to Ecommerce Start"
- ✅ Products: Ecommerce products from main Supabase
- ✅ Footer: "© 2024 Ecommerce Start. All rights reserved."

**Check Browser Console (F12):**
```
[getActiveBrandConfig] { domain: 'store.local', brandSlug: 'default', ... }
[Homepage] Loading products: { brandSlug: 'default', hasCustomSupabase: false }
```

---

### 2. Grocery Domain Test
**URL:** `http://grocery.local:3000`

**Expected Results:**
- ✅ Title: "Shooshka Grocery - Fresh Groceries Delivered..."
- ✅ Logo: Grocery logo (or "S" letter)
- ✅ Colors: Green (#10B981)
- ✅ Hero: "Welcome to Shooshka Grocery"
- ✅ Products: Grocery products from grocery Supabase (if configured)
- ✅ Footer: "© 2024 Shooshka Grocery. All rights reserved."

**Check Browser Console (F12):**
```
[getActiveBrandConfig] { domain: 'grocery.local', brandSlug: 'grocery-store', ... }
[Homepage] Loading products: { brandSlug: 'grocery-store', hasCustomSupabase: true }
```

---

### 3. Fashion Domain Test
**URL:** `http://fashion.local:3000`

**Expected Results:**
- ✅ Title: Fashion brand title (if configured)
- ✅ Logo: Fashion logo
- ✅ Colors: Fashion brand colors
- ✅ Products: Fashion products (if configured)

---

## 🔍 Verification Steps

### Step 1: Check No Flashing
1. Open domain in **Incognito/Private window**
2. Watch browser tab title - should be correct from start
3. Watch page colors - should be correct from first render
4. Watch navbar logo - should be correct from start

**Expected:** No "Ecommerce Start" flash before correct brand appears

### Step 2: Check Browser Console
Open DevTools (F12) → Console tab:

**Look for:**
- `[getActiveBrandConfig]` logs showing correct domain
- `[Homepage] Loading products` logs showing correct brand slug
- No errors related to Supabase or brand loading

### Step 3: Check Network Tab
Open DevTools (F12) → Network tab:

**Filter by "supabase":**
- Store: Should connect to main Supabase URL
- Grocery: Should connect to grocery Supabase URL (if configured)
- Check for any failed requests

### Step 4: Check Injected Brand Config
1. View page source (Ctrl+U)
2. Search for `__BRAND_CONFIG__`
3. Should see JSON with correct brand data:
   ```json
   {
     "name": "Shooshka Grocery",
     "slug": "grocery-store",
     "colors": { "primary": "#10B981" },
     ...
   }
   ```

---

## ⚠️ Common Issues & Fixes

### Issue: Domain Shows Wrong Brand

**Check:**
1. Database has brand with correct domain:
   ```sql
   SELECT slug, domain, config->>'name' as brand_name
   FROM brands
   WHERE domain = 'grocery.local';
   ```

2. If using `.local` domains, you may need to update database:
   ```sql
   -- For local testing, you can temporarily update domain
   UPDATE brands
   SET domain = 'grocery.local'
   WHERE slug = 'grocery-store';
   ```

   **OR** better: Keep production domains in DB, middleware will match by domain pattern

### Issue: Products Not Loading

**Check:**
1. Supabase project is accessible
2. Products are imported into correct Supabase
3. Browser console for Supabase errors
4. Network tab for failed requests

### Issue: Still Shows "Ecommerce Start"

**Check:**
1. Brand config in database is correct
2. Domain matches exactly in database
3. Browser console for brand loading errors

---

## ✅ Success Criteria

All tests pass when:

- [ ] Store domain shows Ecommerce Start brand
- [ ] Grocery domain shows Shooshka Grocery brand
- [ ] Fashion domain shows Fashion brand (if configured)
- [ ] No title/logo/color flashing on any domain
- [ ] Each domain loads products from correct Supabase
- [ ] Browser console shows correct brand logs
- [ ] No errors in console or network tab

---

## 📝 Next Steps

After local testing passes:

1. **Update Database** (if needed):
   - Ensure brands have correct production domains
   - Configure Supabase settings for each brand

2. **Deploy to Production**:
   - Follow `DEPLOYMENT_GUIDE.md`
   - Test production domains

3. **Monitor**:
   - Check Vercel logs
   - Monitor user feedback
   - Verify no flashing in production

---

## 🎯 Quick Test Commands

**Test DNS Resolution:**
```powershell
nslookup store.local
nslookup grocery.local
```

Should return `127.0.0.1`

**Test Dev Server:**
```bash
# Make sure server is running
npm run dev
```

**Test in Browser:**
- Open incognito window
- Test each `.local:3000` domain
- Check console and network tabs

