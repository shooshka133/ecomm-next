# Troubleshooting: Grocery Products Not Showing

## Quick Check

1. **Visit the debug endpoint** on your grocery domain:
   ```
   https://grocery.shooshka.online/api/debug-supabase
   ```
   
   This will show you:
   - Which brand is detected
   - Which Supabase project should be used
   - Whether environment variables are set

2. **Check browser console** when visiting `grocery.shooshka.online`
   - Look for `[Homepage]` log messages
   - Check which Supabase URL is being used
   - See how many products are loaded

## Common Issues

### Issue 1: Environment Variables Not Set

**Symptom:** Debug endpoint shows `NEXT_PUBLIC_SUPABASE_URL_BRAND_A: false`

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL_BRAND_A=<your-grocery-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A=<your-grocery-supabase-anon-key>
   SUPABASE_SERVICE_ROLE_KEY_BRAND_A=<your-grocery-supabase-service-role-key>
   ```
3. **Redeploy** your application (Vercel will auto-deploy or you can manually redeploy)

### Issue 2: Wrong Supabase Project

**Symptom:** Products are loading but they're e-commerce products, not grocery products

**Check:**
1. Verify your grocery Supabase project has products:
   - Go to Supabase Dashboard → Your Grocery Project
   - Go to Table Editor → `products` table
   - Check if products exist (should be ~64 grocery products)

2. Verify the correct Supabase project URL is being used:
   - Visit `/api/debug-supabase` on grocery domain
   - Check `expectedConfig.urlPrefix` - should match your grocery Supabase project URL

### Issue 3: Brand Not Detected

**Symptom:** Debug endpoint shows `normalizedSlug: "default"` instead of `"grocery-store"`

**Solution:**
1. Check that the domain is set in the brands table:
   ```sql
   SELECT id, slug, name, domain, is_active 
   FROM brands 
   WHERE slug = 'Grocery-store';
   ```
   
2. Verify the domain matches exactly:
   - Should be: `grocery.shooshka.online` (no https://, no trailing slash)

### Issue 4: Products in Wrong Supabase Project

**Symptom:** Grocery products are in the main Supabase project, not the grocery one

**Solution:**
You have two options:

**Option A: Move products to grocery Supabase project**
1. Export products from main Supabase
2. Import them into grocery Supabase project
3. Make sure environment variables point to grocery Supabase

**Option B: Keep products in main Supabase, use brand_id filtering**
1. Make sure `brand_id` column exists in products table
2. Update grocery products with the correct `brand_id`
3. The code will filter products by `brand_id` when using main Supabase

## Step-by-Step Verification

### Step 1: Check Environment Variables
```bash
# In Vercel, check if these exist:
NEXT_PUBLIC_SUPABASE_URL_BRAND_A
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A
```

### Step 2: Check Brand Configuration
Visit: `https://grocery.shooshka.online/api/brand-config`

Should return:
```json
{
  "success": true,
  "domain": "grocery.shooshka.online",
  "brandSlug": "grocery-store",
  "brandId": "e4c2ebd7-59fa-4abb-a523-a74a47395e75"
}
```

### Step 3: Check Supabase Configuration
Visit: `https://grocery.shooshka.online/api/supabase-config`

Should return:
```json
{
  "success": true,
  "domain": "grocery.shooshka.online",
  "brandSlug": "grocery-store",
  "source": "BRAND_A",
  "supabaseUrl": "https://<your-grocery-supabase>.supabase.co",
  "supabaseKey": "eyJ..."
}
```

### Step 4: Check Products in Grocery Supabase
1. Go to your **grocery Supabase project** dashboard
2. Table Editor → `products` table
3. Should see ~64 grocery products

### Step 5: Check Browser Console
1. Visit `grocery.shooshka.online`
2. Open browser DevTools → Console
3. Look for logs:
   ```
   [Homepage] Supabase config response: { brandSlug: "grocery-store", ... }
   [Homepage] Loading products: { brandSlug: "grocery-store", ... }
   [Homepage] Loaded products: 64 items
   ```

## Still Not Working?

1. **Clear browser cache** and hard refresh (Ctrl+Shift+R)
2. **Check Vercel deployment logs** for errors
3. **Verify DNS** - make sure `grocery.shooshka.online` points to your Vercel deployment
4. **Check Supabase RLS policies** - make sure products table is readable

## Expected Behavior

When visiting `grocery.shooshka.online`:
- ✅ Brand config should show `brandSlug: "grocery-store"`
- ✅ Supabase config should show `source: "BRAND_A"`
- ✅ Products should load from grocery Supabase project
- ✅ Should see ~64 grocery products (Fresh Produce, Dairy, etc.)

When visiting main domain (`shooshka.online`):
- ✅ Brand config should show default brand
- ✅ Supabase config should show `source: "MAIN"`
- ✅ Products should load from main Supabase project

