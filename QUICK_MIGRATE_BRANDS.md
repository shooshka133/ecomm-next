# 🚀 Quick Guide: Migrate Brands to Database

## Problem
Brands are in the file but not showing in admin panel because the database table is empty.

---

## ✅ Quick Fix

### Step 1: Make Sure .env.local Has Variables

Your `.env.local` should have:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Get these from:**
- Main Supabase project → Settings → API
- Copy Project URL and service_role key

---

### Step 2: Run Migration Script

```bash
npx tsx scripts/migrate-brands-to-db.ts
```

**What it does:**
- ✅ Reads brands from `data/brands/brands.json`
- ✅ Inserts them into database
- ✅ Skips duplicates
- ✅ Shows summary

---

### Step 3: Verify

1. Go to `/admin/brand-settings`
2. Should see your brands now! ✅

---

## 🔍 If Script Still Fails

**Check .env.local exists and has:**
- `NEXT_PUBLIC_SUPABASE_URL` (main project, not grocery)
- `SUPABASE_SERVICE_ROLE_KEY` (main project, not grocery)

**Make sure:**
- File is named exactly `.env.local` (not `.env` or `.env.local.txt`)
- Variables are in format: `VARIABLE_NAME=value` (no spaces around `=`)
- No quotes needed (unless value has spaces)

---

## 📝 Alternative: Manual SQL

If script doesn't work, you can manually insert:

1. **Go to Main Supabase → SQL Editor**

2. **Run this** (for Ecommerce Start):
```sql
INSERT INTO brands (slug, name, is_active, config, asset_urls)
VALUES (
  'default',
  'Ecommerce Start',
  true,
  '{"name": "Ecommerce Start", "slogan": "Your trusted destination for quality products and exceptional service.", "logoUrl": "/icon.svg", "colors": {"primary": "#4F46E5", "accent": "#7C3AED", "secondary": "#6366F1", "background": "#F9FAFB", "text": "#111827"}}'::jsonb,
  '{}'::jsonb
);
```

---

**Run the script and your brands will be back!** 🚀

