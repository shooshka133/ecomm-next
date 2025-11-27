# Fix Brand Title and Product Flashing Issues

## Issues
1. **Title still shows "Ecommerce"** instead of "Shooshka Grocery"
2. **Products flash e-commerce products** before showing grocery products

## Fix 1: Brand Title (Database Issue)

The brand config in the database is still wrong. Run this SQL in your **main Supabase project**:

```sql
-- Check current config
SELECT 
  id,
  slug,
  name,
  domain,
  config->>'name' as config_name,
  config->'seo'->>'title' as seo_title,
  config->'seo'->>'description' as seo_description
FROM brands
WHERE slug = 'Grocery-store' OR domain = 'grocery.shooshka.online';

-- If config_name or seo_title is wrong, run this update:
UPDATE brands
SET config = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          config,
          '{name}',
          '"Shooshka Grocery"'
        ),
        '{seo,title}',
        '"Shooshka Grocery - Fresh Groceries Delivered | Online Grocery Store"'
      ),
      '{seo,description}',
      '"Shop fresh groceries online at Shooshka Grocery. Quality produce, dairy, meat, bakery items, and more delivered to your door. Free delivery on orders over $50."'
    ),
    '{faviconUrl}',
    '"/icon.svg"'
  ),
  '{appleIconUrl}',
  '"/apple-icon.svg"'
)
WHERE slug = 'Grocery-store' OR domain = 'grocery.shooshka.online';

-- Verify it worked
SELECT 
  config->>'name' as config_name,
  config->'seo'->>'title' as seo_title
FROM brands
WHERE slug = 'Grocery-store' OR domain = 'grocery.shooshka.online';
```

**After running the SQL:**
- Clear browser cache or use incognito
- Hard refresh: `Ctrl+Shift+R`
- Title should update immediately (no redeploy needed)

## Fix 2: Product Flashing (Code Issue)

The code has been updated to:
1. Clear products when initializing Supabase client
2. Only load products after the correct client is ready
3. Show loading state until products are loaded

**After deploying the code changes:**
- Products should load directly from the correct Supabase project
- No flashing of e-commerce products

## Verify Both Fixes

1. **Check brand config API:**
   ```
   https://grocery.shooshka.online/api/brand-config
   ```
   Should show:
   ```json
   {
     "brand": {
       "name": "Shooshka Grocery",
       "seo": {
         "title": "Shooshka Grocery - Fresh Groceries Delivered..."
       }
     }
   }
   ```

2. **Check website:**
   - Visit `https://grocery.shooshka.online`
   - Browser tab title should be "Shooshka Grocery - Fresh Groceries..."
   - Products should load directly (no flashing)
   - Should see grocery products only

3. **Check browser console:**
   - Open DevTools → Console
   - Should see: `[Homepage] Created domain-based Supabase client for: grocery-store`
   - Should see: `[Homepage] Loaded products: 64 items` (or your count)
   - Should NOT see e-commerce products loading first

## If Still Not Working

### Title Issue:
- Check if the SQL update actually ran (verify with SELECT query)
- Check if there are multiple brand records (might be updating the wrong one)
- Check browser cache (try incognito)

### Flashing Issue:
- Check browser console for errors
- Verify `/api/supabase-config` returns `"source": "BRAND_A"`
- Make sure environment variables are set in Vercel
- Redeploy after code changes

