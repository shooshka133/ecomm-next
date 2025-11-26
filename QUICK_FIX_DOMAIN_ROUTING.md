# 🔧 Quick Fix: Domain Routing Not Working

## Step 1: Test the Debug Endpoint

**First, test if domain detection is working:**

Visit: `https://grocery.shooshka.online/api/debug-domain`

This will show you:
- What domain is detected
- If brand is found by domain
- Database connection status

**Share the results** so we can see what's happening!

---

## Step 2: Verify Database Setup

**Run these SQL queries in Supabase:**

```sql
-- 1. Check if domain column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'brands' AND column_name = 'domain';

-- 2. Check all brands
SELECT id, slug, name, domain, is_active FROM brands;

-- 3. Check if grocery brand has domain set
SELECT * FROM brands WHERE domain = 'grocery.shooshka.online';
```

**If domain column doesn't exist:**
```sql
ALTER TABLE brands ADD COLUMN IF NOT EXISTS domain TEXT;
```

**If grocery brand doesn't have domain:**
```sql
-- First find your grocery brand
SELECT slug, name FROM brands WHERE name ILIKE '%grocery%';

-- Then set domain (replace 'grocery-store' with actual slug)
UPDATE brands 
SET domain = 'grocery.shooshka.online'
WHERE slug = 'grocery-store';
```

---

## Step 3: Check Environment Variables

**In Vercel Dashboard → Settings → Environment Variables:**

Verify these are set and point to the CORRECT Supabase project:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` = Your main project (where brands table is)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = Service role key from same project

**Important:** The brands table MUST be in the same Supabase project as `NEXT_PUBLIC_SUPABASE_URL`!

---

## Step 4: Clear Cache & Redeploy

1. **Redeploy on Vercel:**
   - Go to Deployments
   - Click "..." on latest deployment
   - Click "Redeploy"

2. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear browsing data

3. **Wait 2-3 minutes** for edge cache to clear

---

## Step 5: Test Again

Visit: `https://grocery.shooshka.online`

**What should happen:**
- ✅ Shows grocery brand (green colors, grocery name)
- ✅ Shows grocery products
- ✅ Different from main e-commerce site

**If still not working:**
1. Visit `https://grocery.shooshka.online/api/debug-domain`
2. Share the JSON response
3. Check browser console (F12) for errors
4. Check Vercel logs for errors

---

## Common Issues

### Issue: "Shows e-commerce site still"
- Domain not set in database → Run SQL to set it
- Brand not found → Check debug endpoint
- Cache issue → Clear cache and wait

### Issue: "404 error"
- Domain not in Vercel → Add domain in Vercel Dashboard
- DNS not configured → Check Cloudflare DNS

### Issue: "Database errors"
- Wrong Supabase project → Check environment variables
- Brands table missing → Run migration

---

## Next Steps

1. **Run the debug endpoint** and share results
2. **Run the SQL queries** and share results
3. **Check environment variables** in Vercel
4. **Redeploy** and test again

This will help us pinpoint the exact issue! 🔍

