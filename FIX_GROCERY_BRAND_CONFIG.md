# Fix Grocery Brand Title and Icons

## Problem
The grocery website is showing "Ecommerce Start" as the title and using e-commerce icons instead of the grocery brand configuration.

## Root Cause
The grocery brand's `config` field in the database has the wrong data. The brand is correctly detected by domain, but the config JSON contains the default e-commerce values.

## Solution: Update Brand Config in Database

### Option 1: Update via Admin Panel (Recommended)

1. Go to your admin panel: `https://grocery.shooshka.online/admin/brand-settings`
2. Find the "Grocery-store" brand
3. Edit the brand configuration:
   - **Name:** Should be "Shooshka Grocery"
   - **SEO Title:** Should be "Shooshka Grocery - Fresh Groceries Delivered | Online Grocery Store"
   - **Favicon URL:** Update to grocery-specific favicon if you have one
   - **Apple Icon URL:** Update to grocery-specific icon if you have one
4. Save the changes

### Option 2: Update via SQL (Direct Database Update)

Run this SQL in your **main Supabase project** (where the brands table is):

```sql
-- Update grocery brand config
UPDATE brands
SET config = jsonb_set(
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
)
WHERE slug = 'Grocery-store' OR domain = 'grocery.shooshka.online';
```

### Option 3: Complete Config Update (Full Grocery Brand Config)

If you want to update the entire config with all grocery-specific values:

```sql
UPDATE brands
SET config = '{
  "name": "Shooshka Grocery",
  "slogan": "Fresh groceries delivered to your door. Quality you can trust, convenience you deserve.",
  "logoUrl": "/icon.svg",
  "faviconUrl": "/icon.svg",
  "appleIconUrl": "/apple-icon.svg",
  "ogImage": "/icon.svg",
  "colors": {
    "primary": "#10B981",
    "accent": "#059669",
    "secondary": "#34D399",
    "background": "#FFFFFF",
    "text": "#1F2937"
  },
  "fontFamily": {
    "primary": "Inter, sans-serif",
    "heading": "Poppins, sans-serif"
  },
  "domain": "grocery.shooshka.online",
  "contactEmail": "support@grocery.shooshka.online",
  "adminEmails": ["admin@example.com"],
  "seo": {
    "title": "Shooshka Grocery - Fresh Groceries Delivered | Online Grocery Store",
    "description": "Shop fresh groceries online at Shooshka Grocery. Quality produce, dairy, meat, bakery items, and more delivered to your door. Free delivery on orders over $50.",
    "keywords": "grocery, fresh produce, online grocery, food delivery, groceries"
  },
  "hero": {
    "title": "Welcome to Shooshka Grocery",
    "subtitle": "Fresh groceries delivered to your door. Quality you can trust, convenience you deserve.",
    "ctaText": "Shop Fresh Now",
    "badge": "🛒 Free Delivery on Orders Over $50"
  },
  "stats": {
    "products": "500+",
    "customers": "10K+",
    "countries": "50+",
    "support": "24/7"
  },
  "features": [
    {
      "icon": "Sparkles",
      "title": "Quality Guaranteed",
      "description": "Premium products with satisfaction guarantee"
    },
    {
      "icon": "Truck",
      "title": "Fast Shipping",
      "description": "Quick delivery to your doorstep"
    },
    {
      "icon": "Shield",
      "title": "Premium Support",
      "description": "Dedicated customer service team"
    },
    {
      "icon": "Star",
      "title": "Secure Payment",
      "description": "Safe and encrypted transactions"
    }
  ],
  "footer": {
    "copyright": "© 2024 Shooshka Grocery. All rights reserved.",
    "links": {
      "shop": [
        {"href": "/", "label": "All Products"},
        {"href": "/", "label": "Fresh Produce"},
        {"href": "/", "label": "Dairy & Eggs"},
        {"href": "/", "label": "Meat & Seafood"}
      ],
      "support": [
        {"href": "/", "label": "Contact Us"},
        {"href": "/", "label": "Shipping Info"},
        {"href": "/", "label": "Returns"},
        {"href": "/", "label": "FAQ"}
      ]
    }
  },
  "social": {
    "instagram": "",
    "facebook": "",
    "twitter": "",
    "linkedin": ""
  }
}'::jsonb
WHERE slug = 'Grocery-store' OR domain = 'grocery.shooshka.online';
```

## Verify the Fix

After updating:

1. **Check the API:**
   ```
   https://grocery.shooshka.online/api/brand-config
   ```
   Should show:
   - `"name": "Shooshka Grocery"` (not "Ecommerce Start")
   - `"seo": { "title": "Shooshka Grocery - Fresh Groceries..." }`

2. **Check the website:**
   - Visit `https://grocery.shooshka.online`
   - Browser tab title should show "Shooshka Grocery - Fresh Groceries..."
   - Favicon should update (if you've set a custom one)

3. **Clear browser cache** if changes don't appear immediately

## Notes

- The brand config is stored in the `config` JSONB column in the `brands` table
- Changes take effect immediately (no redeploy needed)
- The layout uses `generateMetadata()` which reads from the brand config
- If the config is missing or has wrong data, it falls back to `brand.config.ts` (default e-commerce config)

