# 🛒 Grocery Project Setup - Correct Order

## Problem
Error: `relation "products" does not exist`

**Cause:** You're trying to insert products before creating the `products` table.

---

## ✅ Correct Setup Order

### Step 1: Create Database Schema (Run First!)

**In Grocery Supabase Project → SQL Editor:**

1. **Run `supabase-schema.sql`** (creates products, cart, orders tables)
   - This creates the `products` table
   - Creates `cart_items`, `orders`, `order_items` tables
   - Sets up RLS policies

2. **Run `supabase-user-profiles.sql`** (if needed)
   - Creates user_profiles table

3. **Run `supabase-wishlist.sql`** (if needed)
   - Creates wishlist table

---

### Step 2: Insert Grocery Products (Run After Schema!)

**In Grocery Supabase Project → SQL Editor:**

1. **Run `grocery-products.sql`**
   - This inserts 64 grocery products
   - Now the `products` table exists, so it will work! ✅

---

## 📋 Complete Setup Checklist

### Grocery Supabase Project:

- [ ] **Step 1:** Run `supabase-schema.sql` ← **DO THIS FIRST!**
- [ ] **Step 2:** Run `supabase-user-profiles.sql` (optional)
- [ ] **Step 3:** Run `supabase-wishlist.sql` (optional)
- [ ] **Step 4:** Run `grocery-products.sql` ← **Then this!**

---

## 🎯 Quick Fix

**Right now, just run:**

1. **Go to Grocery Supabase Project → SQL Editor**
2. **Copy and run:** `supabase-schema.sql`
3. **Then run:** `grocery-products.sql`

**That's it!** The products will be inserted successfully. ✅

---

## 📝 Files to Run (In Order)

1. ✅ `supabase-schema.sql` - Creates tables
2. ✅ `grocery-products.sql` - Inserts products

**Don't skip step 1!** The schema must be created first.

---

## ✅ After Setup

- ✅ Products table exists
- ✅ 64 grocery products inserted
- ✅ Ready to use in grocery store

**Run the schema first, then the products!** 🚀

