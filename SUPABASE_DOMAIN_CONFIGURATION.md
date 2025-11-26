# 🌐 Supabase URL Configuration for Domain-Based Routing

## 📋 Overview

For domain-based brand routing, you need to understand how Supabase is configured:

1. **Brands Table** - Stored in your MAIN Supabase project
2. **Products** - Can be in the same project OR separate projects per brand
3. **Domain Routing** - Uses the brands table to determine which brand to show

---

## ✅ Configuration Options

### Option 1: Single Supabase Project (Simplest) ⭐ Recommended

**Use ONE Supabase project for everything:**
- Brands table
- Products (all brands)
- Cart, Orders, etc.

**Vercel Environment Variables:**
```env
# Main Supabase Project (used for brands table AND products)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**How it works:**
- All brands stored in `brands` table
- All products in `products` table
- Domain routing selects which brand to display
- Products can be filtered by brand (if you add `brand_id` to products table)

**✅ Pros:**
- Simple setup
- One project to manage
- Lower cost (one Supabase project)

**❌ Cons:**
- All products in one database
- Need to filter products by brand in queries

---

### Option 2: Separate Supabase Projects Per Brand

**Use DIFFERENT Supabase projects:**
- Main project: Brands table only
- Grocery project: Grocery products
- E-commerce project: E-commerce products

**Vercel Environment Variables:**
```env
# Main Supabase Project (for brands table)
NEXT_PUBLIC_SUPABASE_URL=https://main-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Grocery Brand Supabase Project (for grocery products)
NEXT_PUBLIC_SUPABASE_URL_BRAND_A=https://grocery-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A=eyJ...
SUPABASE_SERVICE_ROLE_KEY_BRAND_A=eyJ...
```

**How it works:**
- Brands table in MAIN project
- Grocery products in `_BRAND_A` project
- E-commerce products in main project (or `_BRAND_B`)
- Domain routing selects brand → brand selects which Supabase project to use

**✅ Pros:**
- Complete data separation
- Independent scaling per brand
- Different Supabase tiers per brand

**❌ Cons:**
- More complex setup
- Multiple projects to manage
- Higher cost (multiple Supabase projects)

---

## 🎯 Recommended Setup for Your Case

Since you're using domain-based routing, I recommend **Option 1 (Single Project)**:

### Step 1: Use Your Main Supabase Project

**In Vercel → Settings → Environment Variables:**

```env
# Main Supabase Project (for brands table AND all products)
NEXT_PUBLIC_SUPABASE_URL=https://your-main-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 2: Run Migrations in Main Project

**In your MAIN Supabase project SQL Editor:**

1. Run `migrations/001_create_brands_table.sql` (if not already done)
2. Run `migrations/002_add_domain_to_brands.sql` (adds domain field)
3. Run `supabase-schema.sql` (creates products, cart, orders tables)
4. Run `GROCERY_PRODUCTS_CLEAN.sql` (inserts grocery products)

### Step 3: Set Domain on Brand

```sql
UPDATE brands 
SET domain = 'grocery.shooshka.online'
WHERE slug = 'grocery-store';
```

---

## 🔍 How Domain Routing Works

1. **User visits:** `grocery.shooshka.online`
2. **Middleware extracts:** domain = `grocery.shooshka.online`
3. **Brand loader queries:** `brands` table in MAIN Supabase project
4. **Finds brand:** with `domain = 'grocery.shooshka.online'`
5. **Uses brand config:** colors, logo, name, etc.
6. **Loads products:** from same Supabase project (or brand-specific if using Option 2)

---

## 📝 Supabase Authentication URLs

**Important:** Update Supabase Authentication settings for ALL domains:

### In Supabase Dashboard → Authentication → URL Configuration

**Site URL:**
```
https://grocery.shooshka.online
```
(Or your main domain if you want one primary URL)

**Redirect URLs (add ALL of these):**
```
https://grocery.shooshka.online/api/auth/callback
https://store.shooshka.online/api/auth/callback
https://shooshka.online/api/auth/callback
http://localhost:3000/api/auth/callback
```

**Why:** Users can sign in from any domain, so all domains need to be in the redirect URLs list.

---

## ✅ Configuration Checklist

### Vercel Environment Variables:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = Main project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Main project anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Main project service role key
- [ ] (Optional) `NEXT_PUBLIC_SUPABASE_URL_BRAND_A` = Grocery project (if using separate projects)

### Supabase Database:
- [ ] `brands` table exists in MAIN project
- [ ] `domain` column added to `brands` table
- [ ] Grocery brand has `domain = 'grocery.shooshka.online'`
- [ ] Products table exists (in main project or brand-specific project)

### Supabase Authentication:
- [ ] Site URL configured
- [ ] Redirect URLs include all your domains
- [ ] OAuth providers configured (if using)

---

## 🧪 Testing

1. **Visit `grocery.shooshka.online`**
   - Should show grocery brand
   - Should load grocery products
   - Should use grocery brand colors/logo

2. **Visit main domain**
   - Should show default/active brand
   - Should load default products

3. **Check browser console:**
   - No Supabase connection errors
   - Brand config loads correctly

---

## 🚨 Common Issues

### Issue: "Brands table not found"
**Solution:** Run migrations in your MAIN Supabase project (the one with `NEXT_PUBLIC_SUPABASE_URL`)

### Issue: "Wrong brand showing"
**Solution:** 
1. Check domain is set correctly: `SELECT domain FROM brands WHERE slug = 'grocery-store';`
2. Verify middleware is running (check Vercel logs)
3. Clear browser cache

### Issue: "Products not loading"
**Solution:**
- If using single project: Products should be in main project
- If using separate projects: Check `NEXT_PUBLIC_SUPABASE_URL_BRAND_A` is set correctly

---

## 📚 Summary

**For domain-based routing:**
- ✅ Brands table MUST be in MAIN Supabase project (`NEXT_PUBLIC_SUPABASE_URL`)
- ✅ Domain field in brands table maps domains to brands
- ✅ Products can be in same project OR separate projects
- ✅ Authentication redirect URLs must include all domains

**Simplest setup:** Use one Supabase project for everything! 🎉

