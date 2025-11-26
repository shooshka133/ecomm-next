# 📦 Migrate Brands from File to Database

## What Happened

The migration **didn't delete anything** - it just created an empty `brands` table. 

Now the code is using the **database** (which is empty) instead of the **file** (which might have brands).

---

## ✅ Solution: Migrate Brands from File to Database

I found **2 brands** in your file:
- ✅ "Ecommerce Start" (default, active)
- ✅ "Green Theme Store" (test-green-store, inactive)

---

### Option A: Use Migration Script (Recommended)

1. **Make sure environment variables are set:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_main_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Run the migration script:**
   ```bash
   npx tsx scripts/migrate-brands-to-db.ts
   ```

3. **The script will:**
   - ✅ Read brands from `data/brands/brands.json`
   - ✅ Insert them into the database
   - ✅ Skip brands that already exist
   - ✅ Show a summary

---

### Option B: Manual SQL Migration

1. **Go to Main Supabase Project → SQL Editor**

2. **Run this SQL** (for "Ecommerce Start" brand):
   ```sql
   INSERT INTO brands (slug, name, is_active, config, asset_urls, created_at, updated_at)
   VALUES (
     'default',
     'Ecommerce Start',
     true,
     '{"name": "Ecommerce Start", "slogan": "Your trusted destination for quality products and exceptional service.", "logoUrl": "/icon.svg", "colors": {"primary": "#4F46E5", "accent": "#7C3AED", "secondary": "#6366F1", "background": "#F9FAFB", "text": "#111827"}, "fontFamily": {"primary": "Inter, sans-serif", "heading": "Poppins, sans-serif"}, "domain": "store.shooshka.online", "contactEmail": "support@example.com", "adminEmails": ["admin@example.com"], "seo": {"title": "Ecommerce Start - Modern Shopping Experience", "description": "Discover amazing products at great prices", "keywords": "ecommerce, shopping, products, online store"}, "hero": {"title": "Welcome to Ecommerce Start", "subtitle": "Discover amazing products at unbeatable prices. Shop the latest trends and technology with confidence.", "ctaText": "Shop Now", "badge": "Premium Quality Products"}}'::jsonb,
     '{}'::jsonb,
     NOW(),
     NOW()
   );
   ```

3. **For "Green Theme Store"** (if you want it):
   - Use the data from `data/brands/brands.json` (line 118-241)
   - Convert to SQL INSERT statement

---

### Option C: Just Create New Brands (Easier)

Since you have the data, just recreate them:

1. **Go to:** `/admin/brand-settings`
2. **Click:** "Create Brand"
3. **Fill in the form** using values from the file
4. **Save** - Will be stored in database now ✅

---

## 🔍 Why This Happened

### Before Migration:
- Brands stored in: `data/brands/brands.json` (file)
- Code read from: File

### After Migration:
- Brands stored in: `brands` table (database)
- Code reads from: Database (which is empty)

**The file still exists, but code doesn't use it anymore!**

---

## 📋 Quick Fix

**Just create your brands again in the admin panel:**
1. Go to `/admin/brand-settings`
2. Create "Shooshka Grocery" brand
3. Save - it will be in the database now

**No data was lost** - the file still has the old data, but you'll need to recreate brands in the database (or migrate them if you have the data).

---

## 🎯 Summary

- ✅ Migration didn't delete anything
- ✅ Table is just empty (new)
- ✅ Create brands fresh in admin panel
- ✅ Or migrate from file if you have the data

**The easiest solution: Just create the brands again in `/admin/brand-settings`!** 🚀

