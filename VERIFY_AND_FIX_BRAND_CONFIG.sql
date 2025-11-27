-- First, check what's currently in the database
SELECT 
  id,
  slug,
  name,
  domain,
  config->>'name' as config_name,
  config->'seo'->>'title' as seo_title,
  config->>'faviconUrl' as favicon_url
FROM brands
WHERE slug = 'Grocery-store' OR domain = 'grocery.shooshka.online';

-- If the config is wrong, run this update:
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

-- Verify the update worked
SELECT 
  id,
  slug,
  name,
  domain,
  config->>'name' as config_name,
  config->'seo'->>'title' as seo_title,
  config->>'faviconUrl' as favicon_url
FROM brands
WHERE slug = 'Grocery-store' OR domain = 'grocery.shooshka.online';

