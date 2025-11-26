# 🗄️ Supabase Projects Setup - Explained

## Understanding Your Setup

You have **two separate Supabase projects**:

1. **Main Project** (original) - `store.shooshka.online`
   - Stores: Brand configurations, user authentication, orders
   - Has: `user_profiles` table, `brands` table (after migration)

2. **Grocery Project** (new) - `grocery.shooshka.online`
   - Stores: Grocery products, grocery orders, grocery users
   - Does NOT have: `user_profiles` table, `brands` table

---

## ✅ Where to Run the Migration

### The `brands` Table Goes in the MAIN Project

**Why?**
- Brand management happens in the main application
- The `brands` table stores brand configurations (colors, logos, etc.)
- This is shared across all brands
- Admin users manage brands from the main project

**Steps:**
1. Go to your **MAIN Supabase project** (not the grocery one)
2. Open SQL Editor
3. Run: `migrations/001_create_brands_table.sql`
4. ✅ `brands` table created in main project

---

## 🛒 Grocery Project Setup

The **grocery project** is for:
- ✅ Grocery products (run `grocery-products.sql` here)
- ✅ Grocery orders
- ✅ Grocery user authentication
- ❌ NOT for brand configurations

---

## 🔄 How It Works

### Brand Management (Main Project)
```
Main Supabase Project
├── brands table ← Run migration HERE
├── user_profiles table (already exists)
└── Admin manages brands here
```

### Grocery Store Data (Grocery Project)
```
Grocery Supabase Project
├── products table ← Grocery products go here
├── orders table
└── users table
```

### Service Router
The service router (`lib/services/router.ts`) automatically:
- Routes to **main project** for brand management
- Routes to **grocery project** when grocery brand is active (for products/orders)

---

## 📋 Setup Checklist

### Main Project (Original)
- [x] Already has `user_profiles` table
- [ ] Run `migrations/001_create_brands_table.sql` ← **DO THIS**
- [ ] Set environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Grocery Project (New)
- [ ] Run your main schema (products, orders, etc.)
- [ ] Run `grocery-products.sql` to import products
- [ ] Set environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL_BRAND_A` (or appropriate brand variable)
  - `SUPABASE_SERVICE_ROLE_KEY_BRAND_A`

---

## 🎯 Summary

**Run the `brands` migration in the MAIN project**, not the grocery project!

The grocery project is separate and doesn't need the `brands` table - that's only in the main project where brand management happens.

---

## ✅ Next Steps

1. **Go to MAIN Supabase project** (the original one)
2. **Run the migration:** `migrations/001_create_brands_table.sql`
3. **Test:** Try creating a brand in `/admin/brand-settings`
4. **Should work now!** ✅

