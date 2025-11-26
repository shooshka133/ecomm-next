# ✅ Simple Domain Routing Checklist

## Step 1: Run SQL Queries

**Go to Supabase SQL Editor and run `DEBUG_DOMAIN_ROUTING.sql`**

Or run these key queries:

```sql
-- Check if domain column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'brands' AND column_name = 'domain';

-- Check all brands
SELECT slug, name, domain, is_active FROM brands;

-- Check if grocery has domain
SELECT * FROM brands WHERE domain = 'grocery.shooshka.online';
```

---

## Step 2: Fix Database (if needed)

**If domain column missing:**
```sql
ALTER TABLE brands ADD COLUMN IF NOT EXISTS domain TEXT;
```

**If domain not set:**
```sql
-- Find your grocery brand first
SELECT slug, name FROM brands WHERE name ILIKE '%grocery%';

-- Then set domain (replace 'grocery-store' with your actual slug)
UPDATE brands 
SET domain = 'grocery.shooshka.online'
WHERE slug = 'grocery-store';
```

---

## Step 3: Verify Vercel Environment Variables

**In Vercel Dashboard → Settings → Environment Variables:**

- ✅ `NEXT_PUBLIC_SUPABASE_URL` = Your main Supabase project URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = Service role key from same project

**Important:** The brands table MUST be in the same project as these variables!

---

## Step 4: Redeploy

1. **Commit and push** the new debug route (if you want to use it later)
2. **Or just redeploy** current version after fixing database
3. **Wait 2-3 minutes** for deployment

---

## Step 5: Test

Visit: `https://grocery.shooshka.online`

**What should happen:**
- Shows grocery brand (green colors, grocery name)
- Shows grocery products
- Different from main site

**If still not working:**
1. Check browser console (F12) for errors
2. Check Vercel logs for errors
3. Share SQL query results from Step 1

---

## Quick Test Without Debug Route

Since the debug route isn't deployed yet, you can:

1. **Check Supabase directly:**
   - Run the SQL queries above
   - Verify domain is set correctly

2. **Check Vercel logs:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click latest deployment → Functions
   - Look for any errors about brand loading

3. **Check browser console:**
   - Visit `grocery.shooshka.online`
   - Open browser console (F12)
   - Look for errors or logs

---

## Most Common Issues

### Issue 1: Domain column doesn't exist
**Fix:** Run `ALTER TABLE brands ADD COLUMN domain TEXT;`

### Issue 2: Domain not set on brand
**Fix:** Run `UPDATE brands SET domain = 'grocery.shooshka.online' WHERE slug = 'your-slug';`

### Issue 3: Wrong Supabase project
**Fix:** Make sure `NEXT_PUBLIC_SUPABASE_URL` points to the project with your brands table

### Issue 4: Cache
**Fix:** Hard refresh (Ctrl+Shift+R) or wait 5 minutes

---

## What to Share

If still not working, share:

1. **SQL query results** from Step 1
2. **What you see** when visiting `grocery.shooshka.online`
3. **Any errors** from browser console or Vercel logs

This will help pinpoint the exact issue! 🔍

