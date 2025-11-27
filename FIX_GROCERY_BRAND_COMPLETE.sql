-- Complete fix for Grocery brand configuration
-- Run this in your MAIN Supabase project (not the grocery one)

-- Step 1: Check current config
SELECT 
  id,
  name,
  slug,
  domain,
  is_active,
  config->>'name' as config_name,
  config->'seo'->>'title' as seo_title,
  config->'seo'->>'description' as seo_description,
  config->>'logoUrl' as logo_url,
  config->>'slogan' as slogan,
  config->'hero'->>'title' as hero_title,
  config->'hero'->>'subtitle' as hero_subtitle,
  config->'colors'->>'primary' as primary_color,
  config->'colors'->>'accent' as accent_color
FROM brands
WHERE slug = 'Grocery-store' OR domain = 'grocery.shooshka.online';

-- Step 2: Update the complete brand configuration
-- Using a simpler approach: merge the new config with existing config
UPDATE brands
SET config = config || '{
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

-- Step 3: Verify the update
SELECT 
  id,
  name,
  slug,
  domain,
  config->>'name' as config_name,
  config->'seo'->>'title' as seo_title,
  config->>'logoUrl' as logo_url,
  config->'hero'->>'title' as hero_title,
  config->'colors'->>'primary' as primary_color
FROM brands
WHERE slug = 'Grocery-store' OR domain = 'grocery.shooshka.online';
