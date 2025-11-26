# 🔧 Fix: Grocery Products Not Showing

## Problem

You're seeing e-commerce products (Electronics, Accessories) on `grocery.shooshka.online` instead of grocery products.

**This means:**
- ❌ Grocery products either don't exist in database, OR
- ❌ Grocery products exist but `brand_id` is not set

---

## Step 1: Check if Grocery Products Exist

**Run this in Supabase SQL Editor:**

```sql
-- Check if grocery products exist
SELECT 
  COUNT(*) as total_products,
  category,
  COUNT(*) as count_per_category
FROM products
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
)
GROUP BY category
ORDER BY category;
```

**Expected Result:** Should show ~64 products across 10 categories

**If returns 0:** Grocery products haven't been inserted yet! → Go to Step 2

**If returns products:** Products exist but `brand_id` not set → Go to Step 3

---

## Step 2: Insert Grocery Products (If They Don't Exist)

**If Step 1 returned 0 products:**

1. Go to Supabase SQL Editor
2. Open `GROCERY_PRODUCTS_CLEAN.sql`
3. Copy entire contents
4. Paste and run in SQL Editor
5. Should insert 64 grocery products

**Then verify:**
```sql
SELECT COUNT(*) FROM products 
WHERE category IN ('Fresh Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery');
```

Should return ~40 products.

---

## Step 3: Set Brand ID on Grocery Products

**If products exist but `brand_id` is NULL:**

```sql
-- First, make sure brand_id column exists
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

-- Then update grocery products
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
)
AND brand_id IS NULL;
```

---

## Step 4: Verify Fix

**Run this to check:**

```sql
-- Check grocery products with brand_id
SELECT 
  COUNT(*) as total_grocery_products,
  category,
  COUNT(*) as count_per_category
FROM products 
WHERE brand_id = 'e4c2ebd7-59fa-4abb-a523-a74a47395e75'
GROUP BY category
ORDER BY category;
```

**Expected:** Should show ~64 products across 10 categories

---

## Step 5: Check What Categories Actually Exist

**If the UPDATE didn't work, check actual category names:**

```sql
SELECT DISTINCT category 
FROM products 
ORDER BY category;
```

**Possible issues:**
- Category names might be slightly different (e.g., "Fresh Produce" vs "Produce")
- Products might be in different categories
- Products might not exist at all

---

## Step 6: Alternative - Update by Product Names

**If categories don't match, update by product names:**

```sql
UPDATE products 
SET brand_id = 'e4c2ebd7-59fa-4abb-a523-a74a47395e75'
WHERE name ILIKE '%organic%'
   OR name ILIKE '%fresh%'
   OR name IN (
     'Organic Red Apples',
     'Fresh Bananas',
     'Organic Baby Spinach',
     'Fresh Carrots',
     'Organic Tomatoes',
     'Fresh Broccoli',
     'Organic Avocados',
     'Fresh Strawberries',
     'Organic Bell Peppers',
     'Fresh Cucumbers',
     'Organic Whole Milk',
     'Free-Range Eggs',
     'Greek Yogurt',
     'Organic Butter',
     'Cheddar Cheese',
     -- Add more grocery product names as needed
   );
```

---

## Quick Diagnostic Query

**Run this to see everything:**

```sql
-- See all products with their brand assignments
SELECT 
  id,
  name,
  category,
  brand_id,
  CASE 
    WHEN brand_id = 'e4c2ebd7-59fa-4abb-a523-a74a47395e75' THEN 'Grocery'
    WHEN brand_id IS NULL THEN 'All Brands (E-commerce)'
    ELSE 'Other Brand'
  END as brand_assignment
FROM products 
ORDER BY 
  CASE 
    WHEN brand_id = 'e4c2ebd7-59fa-4abb-a523-a74a47395e75' THEN 1
    WHEN brand_id IS NULL THEN 2
    ELSE 3
  END,
  category,
  name
LIMIT 100;
```

This will show you:
- Which products are assigned to grocery
- Which products are available for all brands
- What categories exist

---

## Most Likely Issue

Based on your data showing only e-commerce products, **grocery products probably don't exist in the database yet**.

**Solution:**
1. Run `GROCERY_PRODUCTS_CLEAN.sql` to insert grocery products
2. Then run the UPDATE query to set `brand_id`
3. Verify with the diagnostic query

---

## After Fix

✅ **Visit `grocery.shooshka.online`:**
- Should show grocery products (Fresh Produce, Dairy, etc.)
- Green brand colors
- Grocery brand name

✅ **Visit main domain:**
- Should show e-commerce products (Electronics, Accessories)
- Default brand colors

---

## Summary

1. **Check if grocery products exist** (Step 1)
2. **If not, insert them** (Step 2 - run `GROCERY_PRODUCTS_CLEAN.sql`)
3. **Set brand_id on grocery products** (Step 3)
4. **Verify** (Step 4)
5. **Deploy code** (already done)
6. **Test** on `grocery.shooshka.online`

Run the diagnostic queries and share the results! 🔍

