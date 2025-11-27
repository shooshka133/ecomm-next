-- Complete setup for all three brands: Store, Grocery, and Fashion
-- Run this in your MAIN Supabase project

-- Step 1: Verify current brands
SELECT 
  id,
  slug,
  name,
  domain,
  is_active,
  config->>'name' as config_name,
  config->'seo'->>'title' as seo_title
FROM brands
ORDER BY slug;

-- Step 2: Update Store Brand (Ecommerce Start)
UPDATE brands
SET 
  domain = 'store.shooshka.online',
  is_active = true,
  config = config || '{
    "name": "Ecommerce Start",
    "slogan": "Your trusted destination for quality products and exceptional service.",
    "logoUrl": "/icon.svg",
    "faviconUrl": "/favicon-store.svg",
    "appleIconUrl": "/apple-icon.svg",
    "seo": {
      "title": "Ecommerce Start - Modern Shopping Experience",
      "description": "Discover amazing products at great prices"
    },
    "hero": {
      "title": "Welcome to Ecommerce Start",
      "subtitle": "Discover amazing products at unbeatable prices. Shop the latest trends and technology with confidence.",
      "ctaText": "Shop Now",
      "badge": "Premium Quality Products"
    },
    "colors": {
      "primary": "#4F46E5",
      "accent": "#7C3AED",
      "secondary": "#6366F1",
      "background": "#FFFFFF",
      "text": "#1F2937"
    }
  }'::jsonb
WHERE slug = 'default' OR slug = 'ecommerce-start';

-- Step 3: Update Grocery Brand
UPDATE brands
SET 
  domain = 'grocery.shooshka.online',
  is_active = false,
  config = config || '{
    "name": "Shooshka Grocery",
    "slogan": "Fresh groceries delivered to your door. Quality you can trust, convenience you deserve.",
    "logoUrl": "/icon.svg",
    "faviconUrl": "/favicon-grocery.svg",
    "appleIconUrl": "/apple-icon.svg",
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
WHERE slug = 'Grocery-store' OR slug = 'grocery-store';

-- Step 4: Create Fashion Brand (if it doesn't exist)
INSERT INTO brands (slug, name, domain, is_active, config, asset_urls)
SELECT 
  'fashion-store',
  'Shooshka Fashion',
  'fashion.shooshka.online',
  false,
  '{
    "name": "Shooshka Fashion",
    "slogan": "Trendy fashion for every style. Discover the latest trends and express your unique personality.",
    "logoUrl": "/icon.svg",
    "faviconUrl": "/favicon-fashion.svg",
    "appleIconUrl": "/apple-icon.svg",
    "seo": {
      "title": "Shooshka Fashion - Trendy Fashion & Style | Online Fashion Store",
      "description": "Shop the latest fashion trends at Shooshka Fashion. Discover stylish clothing, accessories, and more. Express your unique style with our curated collection."
    },
    "hero": {
      "title": "Welcome to Shooshka Fashion",
      "subtitle": "Trendy fashion for every style. Discover the latest trends and express your unique personality.",
      "ctaText": "Shop Fashion Now",
      "badge": "Trendy & Stylish"
    },
    "colors": {
      "primary": "#EC4899",
      "accent": "#DB2777",
      "secondary": "#F472B6",
      "background": "#FFFFFF",
      "text": "#1F2937"
    }
  }'::jsonb,
  '{}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM brands WHERE slug = 'fashion-store'
);

-- Step 5: Verify all brands
SELECT 
  id,
  slug,
  name,
  domain,
  is_active,
  config->>'name' as config_name,
  config->'seo'->>'title' as seo_title,
  config->'colors'->>'primary' as primary_color,
  config->>'faviconUrl' as favicon_url
FROM brands
ORDER BY 
  CASE slug
    WHEN 'default' THEN 1
    WHEN 'Grocery-store' THEN 2
    WHEN 'fashion-store' THEN 3
    ELSE 4
  END;

-- Step 6: Ensure only Store brand is active (for fallback)
UPDATE brands
SET is_active = false
WHERE slug != 'default' AND slug != 'ecommerce-start';

UPDATE brands
SET is_active = true
WHERE slug = 'default' OR slug = 'ecommerce-start';

