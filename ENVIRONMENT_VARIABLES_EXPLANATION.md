# 🔑 Environment Variables Explanation

## Understanding the Two Sets of Variables

You have **two different purposes** for Supabase variables:

---

## 1️⃣ Main Project Variables (For Brand Management)

**These store the `brands` table and brand configurations:**

```
NEXT_PUBLIC_SUPABASE_URL = (main project URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY = (main project anon key)
SUPABASE_SERVICE_ROLE_KEY = (main project service role key)
```

**Used by:**
- `lib/brand/storage.ts` - Stores brand configurations
- Brand management in `/admin/brand-settings`
- The `brands` table is in the **main project**

**You said these already exist** ✅ - That's correct!

---

## 2️⃣ Brand-Specific Variables (For Product/Order Data)

**These are for when a specific brand is active:**

```
NEXT_PUBLIC_SUPABASE_URL_BRAND_A = (grocery project URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A = (grocery project anon key)
SUPABASE_SERVICE_ROLE_KEY_BRAND_A = (grocery project service role key)
```

**Used by:**
- `lib/services/router.ts` - Routes to grocery project when grocery brand is active
- Grocery products, orders, users
- Only used when `grocery-store` brand is active

---

## 🎯 How It Works

### When Managing Brands:
- Uses: `NEXT_PUBLIC_SUPABASE_URL` (main project)
- Stores: Brand configurations in `brands` table
- Location: Main Supabase project

### When Grocery Brand is Active:
- Uses: `NEXT_PUBLIC_SUPABASE_URL_BRAND_A` (grocery project)
- Stores: Grocery products, orders
- Location: Grocery Supabase project

### When Ecommerce Start Brand is Active:
- Uses: `NEXT_PUBLIC_SUPABASE_URL` (main project, default)
- Stores: Ecommerce Start products, orders
- Location: Main Supabase project

---

## ✅ Your Current Setup

You have:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` (main project) - **Correct!**
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (main project) - **Correct!**
- ✅ `NEXT_PUBLIC_SUPABASE_URL_BRAND_A` (grocery project) - **Correct!**
- ✅ `SUPABASE_SERVICE_ROLE_KEY_BRAND_A` (grocery project) - **Correct!**

**This is the right setup!** 🎉

---

## 🔧 If Brand Save Still Fails

The error means the **main project variables** aren't being detected. Check:

1. **Variable Names (exact match):**
   - `NEXT_PUBLIC_SUPABASE_URL` (not `NEXT_PUBLIC_SUPABASE_URL_BRAND_A`)
   - `SUPABASE_SERVICE_ROLE_KEY` (not `SUPABASE_SERVICE_ROLE_KEY_BRAND_A`)

2. **Environment:**
   - Set for **Production** environment
   - (Or "All" if you want dev too)

3. **Redeploy:**
   - After adding/changing variables, **must redeploy**
   - Variables only load during deployment

---

## 📋 Complete Variable List

### Main Project (Brand Management)
```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ...
BRAND_USE_DB = true
```

### Grocery Project (Brand A)
```
NEXT_PUBLIC_SUPABASE_URL_BRAND_A = https://yyyyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A = eyJ...
SUPABASE_SERVICE_ROLE_KEY_BRAND_A = eyJ...
```

### Optional: Ecommerce Start (Brand B)
```
NEXT_PUBLIC_SUPABASE_URL_BRAND_B = (if different from main)
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_B = (if different from main)
SUPABASE_SERVICE_ROLE_KEY_BRAND_B = (if different from main)
```

---

## 🎯 Summary

- **Brand storage** = Uses main project variables (no suffix)
- **Grocery data** = Uses `_BRAND_A` variables (when grocery brand active)
- **Both sets needed** = One for brand management, one for brand data

Your setup is correct! Just make sure the main project variables are set and you've redeployed. 🚀

