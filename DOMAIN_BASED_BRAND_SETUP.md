# 🌐 Domain-Based Brand Setup Guide

## Problem
When you visit `grocery.shooshka.online`, it shows the e-commerce website instead of the grocery brand, even though you activated the grocery brand.

## Solution
The system now supports domain-based brand routing. Each brand can be associated with a specific domain/subdomain.

---

## ✅ Step 1: Run Database Migration

**In your Supabase SQL Editor**, run the migration to add the `domain` field:

```sql
-- Run this file: migrations/002_add_domain_to_brands.sql
-- Or copy and paste the contents
```

This adds a `domain` column to the `brands` table.

---

## ✅ Step 2: Update Grocery Brand with Domain

**In Supabase SQL Editor**, update your grocery brand to include the domain:

```sql
-- Update grocery brand with domain
UPDATE brands 
SET domain = 'grocery.shooshka.online'
WHERE slug = 'grocery-store' OR name LIKE '%Grocery%';

-- Verify the update
SELECT id, slug, name, domain, is_active 
FROM brands 
WHERE domain = 'grocery.shooshka.online';
```

**Or via Admin Panel:**
1. Go to `/admin/brand-settings`
2. Find your grocery brand
3. Edit the brand
4. Add `grocery.shooshka.online` to the **Domain** field
5. Save

---

## ✅ Step 3: Update Other Brands (Optional)

If you have other brands, you can set their domains too:

```sql
-- Example: Set domain for main e-commerce store
UPDATE brands 
SET domain = 'store.shooshka.online'  -- or 'shooshka.online'
WHERE slug = 'default' OR is_active = true;
```

---

## ✅ Step 4: How It Works

1. **Middleware** extracts the domain from the request (`grocery.shooshka.online`)
2. **Brand Loader** looks for a brand with matching `domain` field
3. If found, that brand's configuration is used
4. If not found, falls back to the `is_active` brand

---

## 🧪 Testing

1. **Visit `grocery.shooshka.online`**
   - Should show grocery brand (green theme, grocery products)

2. **Visit main domain** (e.g., `store.shooshka.online` or `shooshka.online`)
   - Should show the active brand (or default if no domain match)

---

## 📋 Database Schema

The `brands` table now has:
- `domain` (TEXT, nullable) - Domain/subdomain for this brand
- Example: `grocery.shooshka.online`

**Important:**
- Multiple brands can have different domains
- If a brand has no domain, it uses the `is_active` flag (backward compatible)
- Domain matching is exact (case-sensitive)

---

## 🔧 Troubleshooting

### Brand Still Shows Wrong Domain

1. **Check database:**
   ```sql
   SELECT id, slug, name, domain, is_active FROM brands;
   ```

2. **Verify domain is set:**
   ```sql
   SELECT * FROM brands WHERE domain = 'grocery.shooshka.online';
   ```

3. **Clear cache and redeploy:**
   - Vercel may cache responses
   - Redeploy after updating brand

### Domain Not Matching

- Check for typos in domain field
- Ensure domain matches exactly (including subdomain)
- Check middleware is running (should add `x-brand-domain` header)

### Both Brands Show Same Content

- Make sure each brand has a unique domain
- Check that products are filtered by brand (if using separate Supabase projects)

---

## 🎯 Quick SQL Commands

```sql
-- Set grocery brand domain
UPDATE brands SET domain = 'grocery.shooshka.online' WHERE slug = 'grocery-store';

-- Set main store domain  
UPDATE brands SET domain = 'store.shooshka.online' WHERE slug = 'default';

-- View all brands with domains
SELECT slug, name, domain, is_active FROM brands ORDER BY domain;

-- Remove domain (use is_active instead)
UPDATE brands SET domain = NULL WHERE slug = 'some-brand';
```

---

## ✅ After Setup

- ✅ Domain field added to brands table
- ✅ Grocery brand has `domain = 'grocery.shooshka.online'`
- ✅ Middleware extracts domain from requests
- ✅ Brand loader matches domain to brand
- ✅ `grocery.shooshka.online` shows grocery brand
- ✅ Other domains show their respective brands

**You're all set!** 🎉

