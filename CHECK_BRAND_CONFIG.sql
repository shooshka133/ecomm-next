-- Check what's actually stored in the database for the grocery brand
-- Run this in your MAIN Supabase project (where brands table is)

SELECT 
  id,
  slug,
  name,
  domain,
  is_active,
  config->>'name' as config_name,
  config->'seo'->>'title' as seo_title,
  config->'seo'->>'description' as seo_description,
  config->>'faviconUrl' as favicon_url,
  config->>'appleIconUrl' as apple_icon_url,
  updated_at
FROM brands
WHERE slug = 'Grocery-store' OR domain = 'grocery.shooshka.online'
ORDER BY updated_at DESC;

-- If the config_name or seo_title is still "Ecommerce Start", run the update below:

