# Fix Brand Title, Logo, and Subtitle

## Problem
- Title still shows "Ecommerce" instead of "Shooshka Grocery"
- Logo in navbar and footer not updating
- Subtitle on homepage not updating

## Root Cause
The brand `config` field in the database has the wrong data. The code has been updated to fetch from the API, but the database still has the old e-commerce config.

## Solution: Update Database Config

### Step 1: Check Current Config

Run this in your **main Supabase project** SQL Editor:

```sql
-- Check what's currently stored
SELECT 
  id,
  slug,
  name,
  domain,
  config->>'name' as config_name,
  config->'seo'->>'title' as seo_title,
  config->'hero'->>'subtitle' as hero_subtitle,
  config->>'logoUrl' as logo_url
FROM brands
WHERE slug = 'Grocery-store' OR domain = 'grocery.shooshka.online';
```

### Step 2: Update the Config

If the values are wrong, run this complete update:

```sql
UPDATE brands
SET config = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
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
          '{hero,title}',
          '"Welcome to Shooshka Grocery"'
        ),
        '{hero,subtitle}',
        '"Fresh groceries delivered to your door. Quality you can trust, convenience you deserve."'
      ),
      '{hero,ctaText}',
      '"Shop Fresh Now"'
    ),
    '{hero,badge}',
    '"🛒 Free Delivery on Orders Over $50"'
  ),
  '{logoUrl}',
  '"/icon.svg"'
)
WHERE slug = 'Grocery-store' OR domain = 'grocery.shooshka.online';
```

### Step 3: Verify the Update

```sql
-- Verify it worked
SELECT 
  config->>'name' as config_name,
  config->'seo'->>'title' as seo_title,
  config->'hero'->>'subtitle' as hero_subtitle,
  config->>'logoUrl' as logo_url
FROM brands
WHERE slug = 'Grocery-store' OR domain = 'grocery.shooshka.online';
```

Should show:
- `config_name`: "Shooshka Grocery"
- `seo_title`: "Shooshka Grocery - Fresh Groceries Delivered..."
- `hero_subtitle`: "Fresh groceries delivered to your door..."
- `logo_url`: "/icon.svg"

## After Updating

1. **Clear browser cache** or use incognito
2. **Hard refresh**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. **Check the website:**
   - Browser tab title should be "Shooshka Grocery - Fresh Groceries..."
   - Navbar should show "Shooshka Grocery" (or first letter "S")
   - Footer should show "Shooshka Grocery"
   - Homepage subtitle should be "Fresh groceries delivered to your door..."

## Code Changes Made

✅ **Navbar** - Now fetches brand config from `/api/brand-config`
✅ **Homepage** - Now fetches brand config from `/api/brand-config` for subtitle
✅ **Footer** - Already using dynamic config (was already correct)
✅ **Layout** - Already using dynamic config for metadata (was already correct)

## If Still Not Working

1. **Check API response:**
   ```
   https://grocery.shooshka.online/api/brand-config
   ```
   Should show `"name": "Shooshka Grocery"` in the brand object

2. **Check browser console:**
   - Open DevTools → Console
   - Look for errors fetching `/api/brand-config`
   - Check if brand config is being loaded

3. **Verify database:**
   - Make sure the SQL update actually ran
   - Check if there are multiple brand records (might be updating the wrong one)

4. **Clear all caches:**
   - Browser cache
   - Vercel edge cache (wait a few minutes or redeploy)

