# 🔧 Fix: Migration Run in Wrong Project

## Problem
You ran the `brands` table migration in the **grocery project**, but it needs to be in the **main project**.

---

## ✅ Solution

### Step 1: Run Migration in Main Project

1. **Go to your MAIN Supabase project:**
   - The one that matches `NEXT_PUBLIC_SUPABASE_URL` in Vercel
   - (Not the grocery project)

2. **Open SQL Editor**

3. **Copy the migration:**
   - File: `migrations/001_create_brands_table.sql`
   - Copy all contents

4. **Paste and Run** in SQL Editor

5. **Verify:**
   - Go to Table Editor
   - Should see `brands` table ✅
   - Should see `brand_audit` table ✅

---

### Step 2: (Optional) Clean Up Grocery Project

The `brands` table in the grocery project won't hurt anything, but you can remove it if you want:

**In Grocery Project SQL Editor:**
```sql
-- Only if you want to clean up
DROP TABLE IF EXISTS brand_audit CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
```

**Or just leave it** - it won't cause any issues since the code doesn't use it.

---

## 🎯 Why This Matters

### Brand Storage Uses Main Project:
- `lib/brand/storage.ts` uses `NEXT_PUBLIC_SUPABASE_URL`
- This is your **main project** (not grocery)
- The `brands` table must be there

### Grocery Project is For:
- Grocery products
- Grocery orders
- Grocery users
- **NOT** for brand configurations

---

## ✅ After Fix

1. **Run migration in main project** ✅
2. **Try creating a brand again** in `/admin/brand-settings`
3. **Should work now!** 🎉

---

## 📋 Quick Checklist

- [ ] Migration run in **MAIN project** (not grocery)
- [ ] `brands` table visible in MAIN project Table Editor
- [ ] `NEXT_PUBLIC_SUPABASE_URL` points to MAIN project
- [ ] Try creating brand - should work!

---

**Just run the migration in your main project and you're good to go!** 🚀

