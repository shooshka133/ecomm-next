# 🔧 Troubleshooting Domain-Based Brand Routing

## Step-by-Step Debugging

### Step 1: Verify Database Setup

**Run this in Supabase SQL Editor to check if domain column exists:**

```sql
-- Check if domain column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'brands' AND column_name = 'domain';
```

**Expected result:** Should show `domain | text`

**If column doesn't exist, run:**
```sql
ALTER TABLE brands ADD COLUMN IF NOT EXISTS domain TEXT;
```

---

### Step 2: Check if Domain is Set on Brand

**Run this to see all brands and their domains:**

```sql
SELECT id, slug, name, domain, is_active 
FROM brands 
ORDER BY created_at DESC;
```

**What to look for:**
- ✅ Grocery brand should have `domain = 'grocery.shooshka.online'`
- ✅ At least one brand should have `is_active = true`

**If domain is NULL, set it:**
```sql
-- First, find your grocery brand slug
SELECT slug, name FROM brands WHERE name ILIKE '%grocery%';

-- Then set the domain (replace 'grocery-store' with your actual slug)
UPDATE brands 
SET domain = 'grocery.shooshka.online'
WHERE slug = 'grocery-store';
```

---

### Step 3: Verify Middleware is Running

**Check Vercel deployment logs:**

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment → Functions tab
3. Look for middleware logs

**Or add temporary logging:**

The middleware should be adding `x-brand-domain` header. Check if it's working.

---

### Step 4: Test Domain Extraction

**Create a test API route to debug:**

Create `app/api/test-domain/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getDomainFromRequest } from '@/lib/brand/admin-loader'
import { getBrandByDomain } from '@/lib/brand/storage'

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host')
  const domain = host ? host.split(':')[0] : undefined
  
  let brand = null
  if (domain) {
    brand = await getBrandByDomain(domain)
  }
  
  return NextResponse.json({
    host,
    domain,
    brand: brand ? {
      id: brand.id,
      slug: brand.slug,
      name: brand.name,
      domain: brand.domain,
      is_active: brand.is_active,
    } : null,
    allBrands: await getAllBrandsDebug(),
  })
}

async function getAllBrandsDebug() {
  // This will be a simplified version - you'll need to implement
  return []
}
```

**Then visit:** `https://grocery.shooshka.online/api/test-domain`

This will show you:
- What domain is being detected
- What brand is being found
- If the lookup is working

---

### Step 5: Check Environment Variables

**In Vercel Dashboard → Settings → Environment Variables:**

Verify these are set:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

**Important:** These should point to the Supabase project where your `brands` table is located!

---

### Step 6: Check Browser Console

**Visit `grocery.shooshka.online` and open browser console (F12):**

Look for:
- ❌ Supabase connection errors
- ❌ Brand loading errors
- ✅ Any logs about brand selection

---

### Step 7: Verify Brand is Active

**Even with domain routing, the brand should be active:**

```sql
-- Make sure grocery brand is active
UPDATE brands 
SET is_active = true
WHERE domain = 'grocery.shooshka.online';
```

**Note:** Domain routing takes priority, but `is_active` is still used as fallback.

---

### Step 8: Clear Cache

**Try these:**

1. **Hard refresh:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear browser cache:** Settings → Clear browsing data
3. **Redeploy on Vercel:** Sometimes helps clear edge cache

---

### Step 9: Check Vercel Edge Network

**Vercel caches responses at the edge. Try:**

1. Add a query parameter: `https://grocery.shooshka.online/?v=2`
2. Or wait 5-10 minutes for cache to expire

---

## 🔍 Common Issues & Solutions

### Issue 1: "Still shows e-commerce site"

**Possible causes:**
- Domain not set in database
- Brand not found by domain
- Middleware not running
- Cache issue

**Solution:**
1. Verify domain is set: `SELECT domain FROM brands WHERE slug = 'grocery-store';`
2. Check middleware is deployed
3. Clear cache and try again

---

### Issue 2: "Brand loads but wrong products"

**Possible causes:**
- Products not filtered by brand
- Using wrong Supabase project for products

**Solution:**
- If using single Supabase project, products should all be there
- If using separate projects, check `NEXT_PUBLIC_SUPABASE_URL_BRAND_A` is set

---

### Issue 3: "404 or error page"

**Possible causes:**
- Domain not configured in Vercel
- DNS not pointing correctly

**Solution:**
1. Check Vercel Dashboard → Settings → Domains
2. Verify `grocery.shooshka.online` is listed
3. Check DNS records in Cloudflare

---

### Issue 4: "Middleware not running"

**Check middleware.ts matcher:**

```typescript
export const config = {
  matcher: [
    '/cart/:path*', 
    '/checkout/:path*', 
    '/orders/:path*', 
    '/admin/:path*',
    '/', // Should match homepage
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

**If homepage (`/`) is not in matcher, add it!**

---

## 🧪 Quick Test Script

**Run this in Supabase SQL Editor to test everything:**

```sql
-- 1. Check domain column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'brands' AND column_name = 'domain';

-- 2. Check all brands
SELECT id, slug, name, domain, is_active FROM brands;

-- 3. Check grocery brand specifically
SELECT * FROM brands WHERE domain = 'grocery.shooshka.online';

-- 4. If no results, find grocery brand
SELECT * FROM brands WHERE name ILIKE '%grocery%' OR slug ILIKE '%grocery%';
```

---

## 📞 Next Steps

If still not working, provide:

1. **Database check results:** Run the SQL queries above and share results
2. **Browser console errors:** Any errors in F12 console?
3. **Vercel logs:** Any errors in deployment logs?
4. **What you see:** What exactly shows when visiting `grocery.shooshka.online`?

This will help pinpoint the exact issue! 🔍

