# Multi-Brand Multi-Supabase Testing Checklist

Use this checklist to verify that the multi-brand, multi-Supabase system is working correctly.

## Pre-Deployment Checks

### ✅ Database Configuration

- [ ] Brand exists in `brands` table with correct `slug` and `domain`
- [ ] Brand has `config.supabase.url` and `config.supabase.anonKey` (if using DB config)
- [ ] Brand has correct `config.name`, `config.seo.title`, `config.colors`
- [ ] Only one brand is marked `is_active: true` (the default/fallback)

**SQL Check:**
```sql
SELECT 
  id,
  slug,
  domain,
  is_active,
  config->>'name' as brand_name,
  config->'seo'->>'title' as seo_title,
  config->'supabase'->>'url' as supabase_url,
  CASE 
    WHEN config->'supabase'->>'anonKey' IS NOT NULL THEN 'configured'
    ELSE 'not configured'
  END as supabase_status
FROM brands
ORDER BY is_active DESC, domain;
```

### ✅ Environment Variables

- [ ] Main Supabase: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- [ ] Brand-specific env vars (if using): `NEXT_PUBLIC_SUPABASE_URL_${BRAND_SLUG}` are set
- [ ] All env vars are set in Vercel for Production, Preview, and Development

### ✅ Supabase Projects

- [ ] Each brand's Supabase project is accessible
- [ ] Products are imported into the correct Supabase project
- [ ] Database schema is set up in each Supabase project
- [ ] RLS policies allow reading products (if using RLS)

---

## Domain Testing

### ✅ Domain Routing

Test each domain in an **incognito/private window**:

#### Test 1: Main Store (store.shooshka.online)
- [ ] Domain loads correctly
- [ ] Title shows correct brand name (no flashing)
- [ ] Logo shows correct brand logo (no flashing)
- [ ] Colors are correct from first render (no flashing)
- [ ] Products load from main Supabase project
- [ ] Products match the brand (not grocery products)

#### Test 2: Grocery Store (grocery.shooshka.online)
- [ ] Domain loads correctly
- [ ] Title shows "Shooshka Grocery" (no flashing)
- [ ] Logo shows grocery logo (no flashing)
- [ ] Colors are green (#10B981) from first render (no flashing)
- [ ] Products load from grocery Supabase project
- [ ] Only grocery products are shown
- [ ] Categories show grocery categories

#### Test 3: Additional Brands
- [ ] Each brand domain loads correctly
- [ ] Each brand shows correct title, logo, colors
- [ ] Each brand loads products from its own Supabase
- [ ] No cross-brand product leakage

---

## No Flashing Tests

### ✅ Title Flashing
- [ ] Open domain in incognito window
- [ ] Check browser tab title immediately
- [ ] Title should be correct from first render
- [ ] No "Ecommerce Start" flash before correct title
- [ ] Title remains correct on page navigation

### ✅ Logo Flashing
- [ ] Open domain in incognito window
- [ ] Check navbar logo immediately
- [ ] Logo should be correct from first render
- [ ] No default logo flash before brand logo
- [ ] Logo remains correct on page navigation

### ✅ Color Flashing
- [ ] Open domain in incognito window
- [ ] Check page colors immediately
- [ ] Colors should be correct from first render
- [ ] No default indigo flash before brand colors
- [ ] Product cards use correct brand colors
- [ ] Category buttons use correct brand colors
- [ ] Add-to-cart buttons use correct brand colors
- [ ] Price badges use correct brand colors

**How to Test:**
1. Open DevTools → Network tab
2. Throttle to "Slow 3G"
3. Reload page
4. Watch for any color/title/logo changes
5. Should be correct from first paint

---

## Supabase Connection Tests

### ✅ Correct Supabase Project

For each brand:

1. **Check Browser Console:**
   ```
   [Homepage] Loading products: { 
     brandSlug: 'grocery-store', 
     hasCustomSupabase: true 
   }
   ```

2. **Check Network Tab:**
   - Open DevTools → Network
   - Filter by "supabase"
   - Check request URLs
   - Should point to brand's Supabase project

3. **Verify Products:**
   - Products should match the brand
   - Grocery domain → grocery products only
   - Store domain → ecommerce products only

### ✅ Product Filtering

- [ ] Grocery domain shows only grocery products
- [ ] Store domain shows only ecommerce products
- [ ] No products from wrong brand appear
- [ ] Product count matches brand's Supabase project

---

## Component Tests

### ✅ Navbar
- [ ] Shows correct brand name
- [ ] Shows correct brand logo
- [ ] Uses correct brand colors
- [ ] No client-side fetching (check Network tab)
- [ ] Reads from `__BRAND_CONFIG__` JSON

### ✅ Footer
- [ ] Shows correct brand name
- [ ] Shows correct brand logo
- [ ] Uses correct brand colors
- [ ] Footer links are correct

### ✅ Homepage
- [ ] Hero title is correct
- [ ] Hero subtitle is correct
- [ ] Hero CTA button uses brand colors
- [ ] Products load from correct Supabase
- [ ] Category filter uses brand colors
- [ ] Product cards use brand colors

### ✅ Product Cards
- [ ] Use CSS variables for colors (no client fetching)
- [ ] Price badges use brand colors
- [ ] Add-to-cart buttons use brand colors
- [ ] No color flashing

### ✅ Category Filter
- [ ] Buttons use brand colors
- [ ] Active state uses brand colors
- [ ] No color flashing

---

## Authentication Tests

### ✅ Brand-Specific Auth

**Note:** If brands use separate Supabase projects, each has its own auth.

- [ ] Sign up on grocery domain → account created in grocery Supabase
- [ ] Sign up on store domain → account created in store Supabase
- [ ] Login works correctly per domain
- [ ] Session persists correctly per domain
- [ ] Cart is isolated per brand

### ✅ Cross-Brand Access

- [ ] User logged into grocery cannot access store cart
- [ ] User logged into store cannot access grocery cart
- [ ] Orders are isolated per brand

---

## API Route Tests

### ✅ Brand Config API

Visit `/api/brand-config` on each domain:

**Grocery domain:**
```json
{
  "success": true,
  "domain": "grocery.shooshka.online",
  "brandSlug": "grocery-store",
  "brand": { ... }
}
```

**Store domain:**
```json
{
  "success": true,
  "domain": "store.shooshka.online",
  "brandSlug": "default",
  "brand": { ... }
}
```

### ✅ Supabase Config API

Visit `/api/supabase-config` on each domain:

**Grocery domain:**
```json
{
  "success": true,
  "domain": "grocery.shooshka.online",
  "brandSlug": "grocery-store",
  "supabaseUrl": "https://grocery-xxxxx.supabase.co",
  "source": "BRAND_CONFIG" // or "ENV_VAR" or "DEFAULT"
}
```

**Store domain:**
```json
{
  "success": true,
  "domain": "store.shooshka.online",
  "brandSlug": "default",
  "supabaseUrl": "https://main-xxxxx.supabase.co",
  "source": "DEFAULT"
}
```

---

## Performance Tests

### ✅ Initial Load
- [ ] Page loads with correct brand from first render
- [ ] No layout shift (CLS)
- [ ] No title/logo/color flashing
- [ ] First Contentful Paint (FCP) is fast
- [ ] Largest Contentful Paint (LCP) is fast

### ✅ Navigation
- [ ] Navigating between pages maintains brand
- [ ] No flashing on route changes
- [ ] Brand config persists across navigation

---

## Error Handling Tests

### ✅ Missing Brand Config
- [ ] If brand not found, falls back to default
- [ ] No errors in console
- [ ] Page still loads (graceful degradation)

### ✅ Missing Supabase Config
- [ ] If brand Supabase not configured, falls back to main Supabase
- [ ] No errors in console
- [ ] Products still load (from main Supabase)

### ✅ Invalid Supabase URL
- [ ] Error is logged but doesn't crash app
- [ ] Falls back to main Supabase
- [ ] User sees appropriate message

---

## Local Development Tests

### ✅ Host Mapping

1. Add to `hosts` file:
   ```
   127.0.0.1 store.shooshka.online
   127.0.0.1 grocery.shooshka.online
   ```

2. Test:
   - `http://store.shooshka.online:3000`
   - `http://grocery.shooshka.online:3000`

3. Verify:
   - [ ] Each domain loads correct brand
   - [ ] Each domain uses correct Supabase
   - [ ] No flashing

### ✅ Environment Variables

Test with `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL_GROCERY_STORE=https://grocery-xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_GROCERY_STORE=eyJ...
```

- [ ] Brand uses env var Supabase
- [ ] Products load correctly
- [ ] No errors

---

## Production Deployment Tests

### ✅ Vercel Deployment

1. **Deploy to Preview:**
   - [ ] Build succeeds
   - [ ] No TypeScript errors
   - [ ] No ESLint errors
   - [ ] Preview URL works

2. **Deploy to Production:**
   - [ ] Production build succeeds
   - [ ] Production domains work
   - [ ] All brands load correctly
   - [ ] No console errors

### ✅ Post-Deployment

- [ ] Check Vercel logs for errors
- [ ] Check browser console for errors
- [ ] Test each domain in production
- [ ] Verify Supabase connections
- [ ] Monitor for any flashing issues

---

## Regression Tests

### ✅ Existing Functionality

- [ ] Cart still works
- [ ] Checkout still works
- [ ] Orders still work
- [ ] Authentication still works
- [ ] Product search still works
- [ ] Category filtering still works
- [ ] Pagination still works

### ✅ Backward Compatibility

- [ ] Brands without Supabase config still work (use main Supabase)
- [ ] Brands without domain still work (use is_active)
- [ ] Default brand (brand.config.ts) still works

---

## Final Verification

### ✅ Complete Test Run

Run through this complete flow:

1. **Open grocery.shooshka.online in incognito**
   - [ ] Correct title, logo, colors from start
   - [ ] Grocery products load
   - [ ] Can add to cart
   - [ ] Can checkout

2. **Open store.shooshka.online in incognito**
   - [ ] Correct title, logo, colors from start
   - [ ] Ecommerce products load
   - [ ] Can add to cart
   - [ ] Can checkout

3. **Switch between domains**
   - [ ] Each domain maintains its brand
   - [ ] No cross-contamination
   - [ ] Carts are separate

4. **Check browser console**
   - [ ] No errors
   - [ ] Correct Supabase URLs in logs
   - [ ] Correct brand slugs in logs

---

## Sign-Off

- [ ] All tests passed
- [ ] No flashing issues
- [ ] All brands work correctly
- [ ] Supabase connections are correct
- [ ] Ready for production

**Tested by:** _______________  
**Date:** _______________  
**Environment:** Production / Staging  
**Notes:** _______________

