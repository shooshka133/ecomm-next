-- Check and Fix Grocery Products
-- Run this to diagnose and fix the issue

-- Step 1: Check if grocery products exist in database
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

-- Expected: Should show ~64 products across 10 categories
-- If this returns 0, grocery products haven't been inserted yet!

-- ============================================

-- Step 2: Check what categories actually exist
SELECT DISTINCT category 
FROM products 
ORDER BY category;

-- This will show you what categories are in your database

-- ============================================

-- Step 3: Check products by name pattern (grocery products)
SELECT 
  id,
  name,
  category,
  brand_id
FROM products
WHERE name ILIKE '%organic%'
   OR name ILIKE '%fresh%'
   OR name ILIKE '%grocery%'
   OR name ILIKE '%apple%'
   OR name ILIKE '%banana%'
   OR name ILIKE '%milk%'
   OR name ILIKE '%bread%'
ORDER BY category, name
LIMIT 20;

-- This will help identify if grocery products exist with different names

-- ============================================

-- Step 4: If grocery products DON'T exist, you need to insert them
-- Run: GROCERY_PRODUCTS_CLEAN.sql in Supabase SQL Editor

-- ============================================

-- Step 5: If grocery products DO exist but brand_id is NULL, update them
-- First, check how many need updating:
SELECT COUNT(*) as products_needing_brand_id
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
AND brand_id IS NULL;

-- ============================================

-- Step 6: Update grocery products with brand_id
-- ONLY run this if Step 1 shows grocery products exist!
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

-- ============================================

-- Step 7: Verify the update
SELECT 
  COUNT(*) as total_grocery_products,
  category,
  COUNT(*) as count_per_category
FROM products 
WHERE brand_id = 'e4c2ebd7-59fa-4abb-a523-a74a47395e75'
GROUP BY category
ORDER BY category;

-- Should show ~64 products

-- ============================================

-- Step 8: Check for duplicate products (if you see same product multiple times)
SELECT 
  name,
  category,
  COUNT(*) as duplicate_count
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
GROUP BY name, category
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- If you see duplicates, you may need to clean them up

