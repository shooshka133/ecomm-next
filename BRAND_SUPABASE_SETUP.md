# Multi-Brand Supabase Setup Guide

This guide explains how to configure multiple Supabase projects for different brands in your e-commerce platform.

## Overview

Each brand can have its own isolated Supabase project, ensuring complete data separation:
- **Products** - Each brand has its own product catalog
- **Orders** - Orders are isolated per brand
- **Customers** - Customer data is separated by brand
- **Cart** - Shopping carts are brand-specific

## Configuration Priority

The system uses the following priority order to determine which Supabase project to use:

1. **Brand Config (Database)** - `brands.config.supabase.*` (highest priority)
2. **Environment Variables** - `NEXT_PUBLIC_SUPABASE_URL_${BRAND_SLUG}` (fallback)
3. **Main Supabase** - `NEXT_PUBLIC_SUPABASE_URL` (default/fallback)

## Environment Variable Naming

### Main Supabase (Default)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Brand-Specific Supabase

For each brand, you can set environment variables using the brand slug:

**Format:**
- `NEXT_PUBLIC_SUPABASE_URL_${BRAND_SLUG_UPPERCASE}`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY_${BRAND_SLUG_UPPERCASE}`

**Examples:**

For brand slug `grocery-store`:
```bash
NEXT_PUBLIC_SUPABASE_URL_GROCERY_STORE=https://grocery-xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_GROCERY_STORE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

For brand slug `fashion`:
```bash
NEXT_PUBLIC_SUPABASE_URL_FASHION=https://fashion-xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_FASHION=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Slug Normalization:**
- Brand slug is converted to uppercase
- Special characters are replaced with underscores
- Example: `grocery-store` → `GROCERY_STORE`

## Database Configuration (Recommended)

The recommended approach is to store Supabase configuration in the `brands` table:

```sql
UPDATE brands
SET config = config || '{
  "supabase": {
    "url": "https://xxxxx.supabase.co",
    "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "envPrefix": "GROCERY"
  }
}'::jsonb
WHERE slug = 'grocery-store';
```

**Benefits:**
- ✅ No need to set environment variables per brand
- ✅ Can be updated via Admin UI
- ✅ Easier to manage multiple brands
- ✅ Configuration is versioned in database

**Structure:**
```json
{
  "supabase": {
    "url": "https://xxxxx.supabase.co",
    "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "envPrefix": "GROCERY"  // Optional: for env var fallback
  }
}
```

## Setting Up a New Brand with Its Own Supabase

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Note the **Project URL** and **anon/public key**

### Step 2: Configure Brand in Database

**Option A: Via Admin UI (Recommended)**
1. Go to `/admin/brand-settings`
2. Select or create your brand
3. Fill in Supabase settings:
   - Supabase URL
   - Supabase Anon Key
   - Environment Prefix (optional)
4. Save

**Option B: Via SQL**
```sql
UPDATE brands
SET config = config || '{
  "supabase": {
    "url": "https://your-project.supabase.co",
    "anonKey": "your-anon-key-here"
  }
}'::jsonb
WHERE slug = 'your-brand-slug';
```

### Step 3: Set Up Database Schema

Run your schema migrations in the new Supabase project:
- `supabase-schema.sql` (products, cart_items, orders, etc.)
- Any brand-specific migrations

### Step 4: Import Products

Import products into the brand's Supabase project (not the main one).

### Step 5: Configure Domain

Ensure the brand has the correct domain:
```sql
UPDATE brands
SET domain = 'your-brand.shooshka.online'
WHERE slug = 'your-brand-slug';
```

## Vercel Environment Variables

If you prefer using environment variables instead of database config:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add variables for each brand:
   ```
   NEXT_PUBLIC_SUPABASE_URL_GROCERY_STORE
   NEXT_PUBLIC_SUPABASE_ANON_KEY_GROCERY_STORE
   NEXT_PUBLIC_SUPABASE_URL_FASHION
   NEXT_PUBLIC_SUPABASE_ANON_KEY_FASHION
   ```
3. Set for **Production**, **Preview**, and **Development** environments

## Security Notes

⚠️ **Important:**
- **Never** store service role keys in environment variables or database
- Only use **anon/public keys** in `NEXT_PUBLIC_*` variables
- Service role keys should only be in server-side code (never exposed to client)
- The `SUPABASE_SERVICE_ROLE_KEY` is only used for admin operations in the main Supabase project

## Testing Locally

### Option 1: Host Mapping (Recommended)

Add to your `hosts` file:

**Windows:** `C:\Windows\System32\drivers\etc\hosts`
**Mac/Linux:** `/etc/hosts`

```
127.0.0.1 store.shooshka.online
127.0.0.1 grocery.shooshka.online
127.0.0.1 fashion.shooshka.online
```

Then access:
- `http://store.shooshka.online:3000`
- `http://grocery.shooshka.online:3000`
- `http://fashion.shooshka.online:3000`

### Option 2: Environment Variables

Set environment variables in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL_GROCERY_STORE=https://grocery-xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_GROCERY_STORE=eyJ...
```

## Verification

### Check Which Supabase Project is Being Used

1. Open browser DevTools → Console
2. Look for logs:
   ```
   [Homepage] Loading products: { brandSlug: 'grocery-store', hasCustomSupabase: true }
   ```

### Verify Database Connection

Visit `/test-products` (if available) to see:
- Which Supabase project is connected
- Product count
- Connection status

## Troubleshooting

### Brand Still Using Main Supabase

**Check:**
1. Brand config in database has `supabase.url` and `supabase.anonKey`
2. Environment variables are set correctly (if using env vars)
3. Brand slug matches exactly (case-sensitive for env vars)

**Debug:**
```sql
SELECT 
  slug,
  domain,
  config->'supabase'->>'url' as supabase_url,
  CASE 
    WHEN config->'supabase'->>'anonKey' IS NOT NULL THEN 'configured'
    ELSE 'not configured'
  END as supabase_status
FROM brands;
```

### Products Not Loading

**Check:**
1. Supabase project has the `products` table
2. Products are imported into the correct Supabase project
3. RLS (Row Level Security) policies allow reading products

### Authentication Issues

**Note:** Each Supabase project has its own authentication. Users need to sign up separately for each brand if using separate Supabase projects.

**Solution:** Consider using a shared authentication service or Supabase SSO if you want users to access multiple brands with one account.

## Migration from Single to Multi-Supabase

If you're migrating an existing brand to its own Supabase:

1. **Create new Supabase project**
2. **Export data** from main Supabase:
   ```sql
   -- Export products
   COPY (SELECT * FROM products WHERE brand_id = 'brand-id') TO '/tmp/products.csv';
   ```
3. **Import to new Supabase** project
4. **Update brand config** with new Supabase URL/key
5. **Test** thoroughly before deploying
6. **Deploy** and monitor

## Best Practices

1. ✅ **Use database config** for Supabase settings (easier to manage)
2. ✅ **Test locally** with host mapping before deploying
3. ✅ **Verify** each brand connects to correct Supabase
4. ✅ **Monitor** logs for any connection issues
5. ✅ **Document** which Supabase project each brand uses
6. ✅ **Backup** brand configurations regularly

## Example: Complete Grocery Brand Setup

```sql
-- 1. Update brand with Supabase config
UPDATE brands
SET 
  domain = 'grocery.shooshka.online',
  config = config || '{
    "name": "Shooshka Grocery",
    "supabase": {
      "url": "https://grocery-xxxxx.supabase.co",
      "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "colors": {
      "primary": "#10B981"
    }
  }'::jsonb
WHERE slug = 'grocery-store';

-- 2. Verify
SELECT 
  slug,
  domain,
  config->'supabase'->>'url' as supabase_url
FROM brands
WHERE slug = 'grocery-store';
```

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase project is accessible
3. Check network tab for failed requests
4. Review server logs in Vercel
5. Verify environment variables are set correctly

