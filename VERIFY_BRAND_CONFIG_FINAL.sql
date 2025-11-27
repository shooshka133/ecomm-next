-- Final verification and fix for brand configuration
-- Run this in your MAIN Supabase project

-- Step 1: Check current state of ALL brands
SELECT 
  id,
  name,
  slug,
  domain,
  is_active,
  config->>'name' as config_name,
  config->'seo'->>'title' as seo_title,
  config->'colors'->>'primary' as primary_color
FROM brands
ORDER BY is_active DESC, domain;

-- Step 2: Ensure grocery brand has correct domain and config
UPDATE brands
SET 
  domain = 'grocery.shooshka.online',
  config = config || '{
    "name": "Shooshka Grocery",
    "slogan": "Fresh groceries delivered to your door. Quality you can trust, convenience you deserve.",
    "logoUrl": "/icon.svg",
    "faviconUrl": "/icon.svg",
    "seo": {
      "title": "Shooshka Grocery - Fresh Groceries Delivered | Online Grocery Store",
      "description": "Shop fresh groceries online at Shooshka Grocery. Quality produce, dairy, meat, bakery items, and more delivered to your door. Free delivery on orders over $50."
    },
    "hero": {
      "title": "Welcome to Shooshka Grocery",
      "subtitle": "Fresh groceries delivered to your door. Quality you can trust, convenience you deserve.",
      "ctaText": "Shop Fresh Now",
      "badge": "Fresh & Organic"
    },
    "colors": {
      "primary": "#10B981",
      "accent": "#059669",
      "secondary": "#34D399",
      "background": "#FFFFFF",
      "text": "#1F2937"
    }
  }'::jsonb
WHERE slug = 'Grocery-store' OR domain = 'grocery.shooshka.online';

-- Step 3: Ensure ecommerce brand has correct domain (if it exists)
-- Only update if you have an ecommerce brand
UPDATE brands
SET 
  domain = 'store.shooshka.online',
  is_active = true
WHERE id IN (
  SELECT id FROM brands 
  WHERE slug = 'ecommerce-start' OR (name ILIKE '%ecommerce%' AND domain IS NULL)
  LIMIT 1
);

-- Step 4: Ensure only ONE brand is active (the default/fallback)
-- Deactivate grocery brand's is_active flag (domain routing will handle it)
UPDATE brands
SET is_active = false
WHERE slug = 'Grocery-store' AND domain = 'grocery.shooshka.online';

-- Step 5: Final verification
SELECT 
  id,
  name,
  slug,
  domain,
  is_active,
  config->>'name' as config_name,
  config->'seo'->>'title' as seo_title,
  config->'colors'->>'primary' as primary_color
FROM brands
ORDER BY is_active DESC, domain;

