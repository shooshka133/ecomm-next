-- Update Grocery Products with Brand ID
-- Run this AFTER running migration 003_add_brand_id_to_products.sql

-- Your grocery brand ID (from the brand data you shared)
-- Brand ID: e4c2ebd7-59fa-4abb-a523-a74a47395e75
-- Brand Slug: Grocery-store

-- Step 1: Update all grocery products with the brand_id
-- This assumes your grocery products are in categories like:
-- 'Fresh Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery', 
-- 'Pantry Staples', 'Beverages', 'Snacks', 'Frozen Foods', 
-- 'Organic & Natural', 'Household Essentials'

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

-- Step 2: Verify the update
SELECT 
  COUNT(*) as total_grocery_products,
  category,
  COUNT(*) as count_per_category
FROM products 
WHERE brand_id = 'e4c2ebd7-59fa-4abb-a523-a74a47395e75'
GROUP BY category
ORDER BY category;

-- Step 3: Check products without brand_id (these will show on all brands)
SELECT 
  COUNT(*) as products_without_brand,
  category,
  COUNT(*) as count_per_category
FROM products 
WHERE brand_id IS NULL
GROUP BY category
ORDER BY category;

-- Step 4: View all products with their brand assignments
SELECT 
  id,
  name,
  category,
  brand_id,
  CASE 
    WHEN brand_id = 'e4c2ebd7-59fa-4abb-a523-a74a47395e75' THEN 'Grocery'
    WHEN brand_id IS NULL THEN 'All Brands'
    ELSE 'Other Brand'
  END as brand_assignment
FROM products 
ORDER BY brand_id NULLS LAST, category, name
LIMIT 50;

