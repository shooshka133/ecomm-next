# 🔧 Fix: "Could not find the table 'public.brands'"

## Problem
Error when saving brand:
```
Failed to create brand: Could not find the table 'public.brands' in the schema cache
```

## Cause
The `brands` table doesn't exist in the Supabase project that the code is connecting to.

---

## ✅ Solution

### Step 1: Verify Which Supabase Project Is Being Used

The brand storage uses:
- `NEXT_PUBLIC_SUPABASE_URL` (main project)
- `SUPABASE_SERVICE_ROLE_KEY` (main project)

**Make sure these point to the project where you ran the migration!**

---

### Step 2: Verify Table Exists in Supabase

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your **MAIN project** (the one with `NEXT_PUBLIC_SUPABASE_URL`)

2. **Check Table Editor:**
   - Click "Table Editor" in sidebar
   - Look for `brands` table
   - If it's not there, the migration wasn't run

3. **Or Check SQL Editor:**
   - Run this query:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'brands';
   ```
   - Should return: `brands`

---

### Step 3: Run Migration (If Table Doesn't Exist)

If the table doesn't exist:

1. **Go to SQL Editor** in your **MAIN Supabase project**
2. **Copy the migration:**
   - File: `migrations/001_create_brands_table.sql`
   - Copy all contents
3. **Paste and Run** in SQL Editor
4. **Verify:**
   - Should see: "Success. No rows returned"
   - Check Table Editor → Should see `brands` table

---

### Step 4: Verify Environment Variables

Make sure Vercel is using the **correct Supabase project**:

1. **Go to Vercel Dashboard:**
   - Settings → Environment Variables

2. **Check these match your MAIN project:**
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   ```
   - This URL should match the project where you ran the migration

3. **Verify service role key:**
   ```
   SUPABASE_SERVICE_ROLE_KEY = eyJ...
   ```
   - Get this from: Main project → Settings → API → service_role key

---

### Step 5: Check Schema Permissions

If table exists but still getting error:

1. **Run this in SQL Editor:**
   ```sql
   -- Check if table exists
   SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name = 'brands'
   );
   ```

2. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'brands';
   ```

3. **If needed, grant permissions:**
   ```sql
   GRANT ALL ON public.brands TO authenticated;
   GRANT ALL ON public.brands TO service_role;
   ```

---

## 🔍 Troubleshooting Checklist

- [ ] `brands` table exists in MAIN Supabase project
- [ ] Migration was run in the MAIN project (not grocery project)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` points to MAIN project
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is from MAIN project
- [ ] Environment variables are set in Vercel
- [ ] Redeployed after setting variables
- [ ] Table is in `public` schema (not another schema)

---

## 🎯 Quick Test

Run this in your MAIN Supabase project SQL Editor:

```sql
-- Test if you can access the table
SELECT COUNT(*) FROM brands;
```

If this works, the table exists and is accessible.  
If it fails, the table doesn't exist or there's a permission issue.

---

## ✅ Most Likely Issue

**The migration was run in the wrong Supabase project!**

- ❌ Grocery project (where you have `_BRAND_A` variables)
- ✅ Main project (where `NEXT_PUBLIC_SUPABASE_URL` points)

**Solution:** Run the migration in your **MAIN Supabase project** (the one without `_BRAND_A` suffix).

---

## 📝 Summary

1. **Verify table exists** in MAIN project
2. **Run migration** if it doesn't exist
3. **Check environment variables** point to correct project
4. **Redeploy** after any changes

The `brands` table must be in the **same project** as your `NEXT_PUBLIC_SUPABASE_URL`! 🚀

