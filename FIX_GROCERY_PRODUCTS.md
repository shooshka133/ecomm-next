# Fix: Grocery Products Not Showing

## Problem
Grocery domain is showing ecommerce products instead of grocery products.

## Root Cause
The grocery brand needs either:
1. **Its own Supabase project** (with products in that Supabase), OR
2. **Products tagged with `brand_id`** in the main Supabase

## Solution Options

### Option 1: Use Brand's Own Supabase (Recommended)

If grocery has its own Supabase project:

1. **Update brand config in database:**
   ```sql
   UPDATE brands
   SET config = config || '{
     "supabase": {
       "url": "https://grocery-xxxxx.supabase.co",
       "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }
   }'::jsonb
   WHERE slug = 'Grocery-store';
   ```

2. **Import products into grocery Supabase project** (not main Supabase)

3. **Verify:** Grocery domain will automatically use grocery Supabase and load all products from there

### Option 2: Filter by brand_id (If Using Main Supabase)

If grocery uses the main Supabase project:

1. **Get grocery brand ID:**
   ```sql
   SELECT id, slug, name FROM brands WHERE slug = 'Grocery-store';
   ```

2. **Update grocery products with brand_id:**
   ```sql
   -- Replace 'BRAND_ID_HERE' with actual grocery brand ID
   UPDATE products
   SET brand_id = 'BRAND_ID_HERE'
   WHERE category IN ('Groceries', 'Food', 'Beverages', 'Dairy', 'Meat', 'Produce')
   OR name ILIKE '%grocery%'
   OR name ILIKE '%food%';
   ```

3. **Verify products have brand_id:**
   ```sql
   SELECT id, name, category, brand_id 
   FROM products 
   WHERE brand_id = 'BRAND_ID_HERE'
   LIMIT 10;
   ```

## Quick Check

Run this to see current state:

```sql
-- Check brand config
SELECT 
  slug,
  name,
  config->'supabase'->>'url' as supabase_url,
  config->>'name' as config_name
FROM brands
WHERE slug = 'Grocery-store';

-- Check products
SELECT 
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE brand_id IS NOT NULL) as products_with_brand_id,
  COUNT(*) FILTER (WHERE brand_id IS NULL) as products_without_brand_id
FROM products;
```

## After Fix

1. **Restart dev server**
2. **Test grocery domain:** `http://grocery.local:3000`
3. **Check console:** Should see `brandSlug: 'grocery-store'` and correct product count
4. **Verify products:** Should see grocery products only

