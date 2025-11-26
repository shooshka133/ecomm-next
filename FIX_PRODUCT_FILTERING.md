# 🔧 Fix: Products Not Filtered by Brand

## Problem

Brand routing is working (you see grocery brand colors/name), but products shown are e-commerce products instead of grocery products.

## Solution

Add `brand_id` to products table and filter products by brand based on current domain.

---

## Step 1: Run Database Migration

**In Supabase SQL Editor, run:**

```sql
-- File: migrations/003_add_brand_id_to_products.sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id) WHERE brand_id IS NOT NULL;
```

---

## Step 2: Update Grocery Products with Brand ID

**In Supabase SQL Editor, run:**

```sql
-- File: UPDATE_GROCERY_PRODUCTS_BRAND_ID.sql
-- Update all grocery products with your grocery brand ID
UPDATE products 
SET brand_id = 'e4c2ebd7-59fa-4abb-a523-a74a47395e75'
WHERE category IN (
  'Fresh Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Bakery',
  'Pantry Staples',
  'Beverages',
  'Snacks',
  'Frozen Foods',
  'Organic & Natural',
  'Household Essentials'
);
```

**Or if you want to be more specific, update by product names:**

```sql
-- Update specific grocery products by name pattern
UPDATE products 
SET brand_id = 'e4c2ebd7-59fa-4abb-a523-a74a47395e75'
WHERE name ILIKE '%organic%' 
   OR name ILIKE '%fresh%'
   OR name ILIKE '%grocery%'
   OR category IN (
     'Fresh Produce', 'Dairy & Eggs', 'Meat & Seafood', 
     'Bakery', 'Pantry Staples', 'Beverages', 'Snacks', 
     'Frozen Foods', 'Organic & Natural', 'Household Essentials'
   );
```

---

## Step 3: Verify the Update

**Run this to check:**

```sql
-- Check grocery products
SELECT 
  COUNT(*) as total_grocery_products,
  category,
  COUNT(*) as count_per_category
FROM products 
WHERE brand_id = 'e4c2ebd7-59fa-4abb-a523-a74a47395e75'
GROUP BY category
ORDER BY category;

-- Should show ~64 grocery products across 10 categories
```

---

## Step 4: Deploy Code Changes

The code has been updated to:
- ✅ Filter products by `brand_id` on homepage
- ✅ Show products with matching `brand_id` OR `brand_id IS NULL` (available for all brands)

**Commit and push:**

```bash
git add .
git commit -m "Add brand-based product filtering"
git push
```

---

## How It Works

1. **User visits:** `grocery.shooshka.online`
2. **Brand API:** Returns `brandId = 'e4c2ebd7-59fa-4abb-a523-a74a47395e75'`
3. **Product query:** Filters products where `brand_id = 'e4c2ebd7-59fa-4abb-a523-a74a47395e75' OR brand_id IS NULL`
4. **Result:** Only grocery products (and products available for all brands) are shown

---

## Product Assignment Rules

- **Products with `brand_id = 'e4c2ebd7-59fa-4abb-a523-a74a47395e75'`** → Show only on grocery domain
- **Products with `brand_id = NULL`** → Show on all domains (shared products)
- **Products with other `brand_id`** → Show only on that brand's domain

---

## After Setup

✅ **Visit `grocery.shooshka.online`:**
- Should show grocery products only
- Green brand colors
- Grocery brand name

✅ **Visit main domain:**
- Should show e-commerce products (with `brand_id = NULL` or different brand_id)
- Default brand colors

---

## Troubleshooting

### Still showing e-commerce products?

1. **Check if brand_id was set:**
   ```sql
   SELECT COUNT(*) FROM products 
   WHERE brand_id = 'e4c2ebd7-59fa-4abb-a523-a74a47395e75';
   ```
   Should return ~64 products

2. **Check API returns brandId:**
   Visit: `https://grocery.shooshka.online/api/brand-config`
   Should include `"brandId": "e4c2ebd7-59fa-4abb-a523-a74a47395e75"`

3. **Check browser console:**
   Open F12 → Console
   Look for product loading errors

### Products not showing at all?

- Check if grocery products exist in database
- Check if `brand_id` column was added
- Check browser console for errors

---

## Summary

1. ✅ Run migration to add `brand_id` column
2. ✅ Update grocery products with brand ID
3. ✅ Deploy code changes
4. ✅ Test on `grocery.shooshka.online`

After this, grocery domain will show only grocery products! 🎉

