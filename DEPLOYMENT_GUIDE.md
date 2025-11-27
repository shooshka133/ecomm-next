# Multi-Brand Multi-Supabase Deployment Guide

This guide covers deploying the multi-brand, multi-Supabase system to production.

## Pre-Deployment Checklist

### ✅ Code Changes

- [ ] All files committed to git
- [ ] Branch created: `brand-supabase-integration`
- [ ] All TypeScript errors resolved
- [ ] All ESLint errors resolved
- [ ] Tests pass locally

### ✅ Database Setup

- [ ] Migration `004_add_supabase_to_brand_config.sql` is informational only (no schema changes)
- [ ] Brands table exists with `config` JSONB column
- [ ] Brand configurations are set correctly in database

### ✅ Supabase Projects

- [ ] Main Supabase project is accessible
- [ ] Each brand's Supabase project is created and accessible
- [ ] Products are imported into correct Supabase projects
- [ ] Database schemas are set up in each Supabase project

---

## Step 1: Update Environment Variables in Vercel

### Main Supabase (Required)

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Add/verify:
```
NEXT_PUBLIC_SUPABASE_URL=https://main-xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (server-side only)
```

### Brand-Specific Supabase (Optional - if using env vars)

If you're using environment variables instead of database config:

```
NEXT_PUBLIC_SUPABASE_URL_GROCERY_STORE=https://grocery-xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_GROCERY_STORE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NEXT_PUBLIC_SUPABASE_URL_FASHION=https://fashion-xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_FASHION=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note:** Set for **Production**, **Preview**, and **Development** environments.

---

## Step 2: Configure Brands in Database

### Option A: Via Admin UI (Recommended)

1. Deploy code to preview/staging
2. Go to `/admin/brand-settings`
3. Edit each brand
4. Fill in Supabase settings:
   - Supabase URL
   - Supabase Anon Key
   - Environment Prefix (optional)
5. Save

### Option B: Via SQL

Run in your **main Supabase project** (not brand-specific projects):

```sql
-- Update grocery brand
UPDATE brands
SET config = config || '{
  "supabase": {
    "url": "https://grocery-xxxxx.supabase.co",
    "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "envPrefix": "GROCERY"
  }
}'::jsonb
WHERE slug = 'grocery-store';

-- Verify
SELECT 
  slug,
  domain,
  config->'supabase'->>'url' as supabase_url,
  CASE 
    WHEN config->'supabase'->>'anonKey' IS NOT NULL THEN 'configured'
    ELSE 'not configured'
  END as supabase_status
FROM brands;
```

---

## Step 3: Deploy to Vercel

### Create Branch

```bash
git checkout -b brand-supabase-integration
git add .
git commit -m "Add multi-brand multi-Supabase support"
git push origin brand-supabase-integration
```

### Deploy Preview

1. Push to GitHub
2. Vercel will automatically create a preview deployment
3. Test the preview URL with each domain

### Deploy to Production

**Option A: Merge to Main**
```bash
git checkout main
git merge brand-supabase-integration
git push origin main
```

**Option B: Deploy Branch Directly**
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Deployments**
4. Find the preview deployment
5. Click **"..."** → **"Promote to Production"**

---

## Step 4: Configure Domains in Vercel

### Add Custom Domains

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Add each brand domain:
   - `store.shooshka.online`
   - `grocery.shooshka.online`
   - `fashion.shooshka.online` (if applicable)

### DNS Configuration

Configure DNS records (usually in Cloudflare or your DNS provider):

**For Cloudflare:**
- Type: `CNAME`
- Name: `store` (or `grocery`, `fashion`)
- Target: `cname.vercel-dns.com` (or your Vercel domain)

**For other DNS providers:**
- Follow Vercel's domain setup instructions

---

## Step 5: Post-Deployment Verification

### Test Each Domain

1. **Store Domain** (`store.shooshka.online`)
   - [ ] Loads correctly
   - [ ] Shows correct brand (title, logo, colors)
   - [ ] Products load from main Supabase
   - [ ] No flashing

2. **Grocery Domain** (`grocery.shooshka.online`)
   - [ ] Loads correctly
   - [ ] Shows correct brand (title, logo, colors)
   - [ ] Products load from grocery Supabase
   - [ ] No flashing

3. **Additional Brands**
   - [ ] Each domain works correctly
   - [ ] Each uses correct Supabase project

### Check Browser Console

Open DevTools → Console on each domain:
- [ ] No errors
- [ ] Correct brand slug in logs
- [ ] Correct Supabase URL in logs

### Check Network Tab

Open DevTools → Network:
- [ ] Supabase requests go to correct project
- [ ] No failed requests
- [ ] Products load correctly

---

## Step 6: Monitor and Debug

### Vercel Logs

1. Go to **Vercel Dashboard** → Your Project → **Logs**
2. Check for errors related to:
   - Brand loading
   - Supabase connections
   - Missing environment variables

### Browser Console

Check for:
- `[getActiveBrandConfig]` logs (development only)
- `[Homepage] Loading products` logs
- Any Supabase connection errors

### Database Verification

Run in main Supabase:
```sql
SELECT 
  slug,
  domain,
  config->'supabase'->>'url' as supabase_url,
  CASE 
    WHEN config->'supabase'->>'anonKey' IS NOT NULL THEN 'configured'
    ELSE 'not configured'
  END as supabase_status
FROM brands
ORDER BY domain;
```

---

## Rollback Plan

If something goes wrong:

### Option 1: Revert Code

```bash
git revert <commit-hash>
git push origin main
```

### Option 2: Disable Brand-Specific Supabase

Update brand configs to remove Supabase settings:
```sql
UPDATE brands
SET config = config - 'supabase'
WHERE slug = 'grocery-store';
```

This will make the brand fall back to main Supabase.

### Option 3: Emergency Fallback

If brand config is broken, the system will:
1. Fall back to environment variables
2. Fall back to main Supabase
3. Fall back to `brand.config.ts`

---

## Troubleshooting

### Brand Not Loading Correct Supabase

**Check:**
1. Brand config has `supabase.url` and `supabase.anonKey`
2. Environment variables are set (if using env vars)
3. Brand slug matches exactly

**Debug:**
```sql
SELECT 
  slug,
  config->'supabase' as supabase_config
FROM brands
WHERE slug = 'your-brand-slug';
```

### Products Not Loading

**Check:**
1. Supabase project is accessible
2. Products table exists in brand's Supabase
3. RLS policies allow reading (if using RLS)
4. Products are imported into correct Supabase

### Flashing Issues

**Check:**
1. Server-injected `__BRAND_CONFIG__` JSON is present in HTML
2. Inline CSS for colors is in `<head>`
3. Direct `<title>` tag is in HTML
4. No client-side fetching in components

**Debug:**
- View page source → Check for `__BRAND_CONFIG__` script tag
- Check Network tab → No `/api/brand-config` requests

---

## Performance Optimization

### Caching

- Brand config is cached in middleware
- Supabase clients are cached per domain
- No unnecessary API calls

### Monitoring

Monitor:
- Page load times
- Supabase query performance
- Brand switching performance

---

## Security Checklist

- [ ] Only anon keys in `NEXT_PUBLIC_*` variables
- [ ] Service role key only in server-side code
- [ ] No secrets in brand config (use env vars if needed)
- [ ] RLS policies configured in each Supabase project
- [ ] Admin routes are protected

---

## Success Criteria

Deployment is successful when:

- [ ] All domains load correctly
- [ ] Each brand shows correct title, logo, colors
- [ ] Each brand loads products from correct Supabase
- [ ] No flashing on initial load
- [ ] No console errors
- [ ] All functionality works (cart, checkout, orders)
- [ ] Performance is acceptable

---

## Support

If you encounter issues:

1. Check Vercel logs
2. Check browser console
3. Verify database configuration
4. Test locally with host mapping
5. Review `BRAND_SUPABASE_SETUP.md` for configuration details

---

## Next Steps

After successful deployment:

1. Monitor for 24-48 hours
2. Check analytics for any issues
3. Gather user feedback
4. Optimize performance if needed
5. Document any brand-specific configurations

