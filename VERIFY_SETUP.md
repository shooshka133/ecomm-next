# Verify Multi-Brand Multi-Supabase Setup

## ✅ Current Status

- ✅ Grocery brand is using its own Supabase project
- ✅ Products are loading from grocery Supabase
- ✅ All three brands configured in database
- ✅ Favicons set up for each brand
- ✅ Local testing working with `.local` domains

---

## 🔍 Quick Verification

### 1. Check Grocery Brand Config

Run in your MAIN Supabase:
```sql
SELECT 
  slug,
  name,
  domain,
  config->'supabase'->>'url' as supabase_url,
  config->>'faviconUrl' as favicon,
  config->'colors'->>'primary' as primary_color
FROM brands
WHERE slug = 'Grocery-store' OR slug = 'grocery-store';
```

**Expected:**
- `supabase_url`: Should show grocery Supabase URL (not main Supabase)
- `favicon`: `/favicon-grocery.svg`
- `primary_color`: `#10B981` (green)

### 2. Test Grocery Domain Locally

Visit: `http://grocery.local:3000`

**Check:**
- ✅ Title: "Shooshka Grocery - Fresh Groceries Delivered..."
- ✅ Favicon: Green "G" icon in browser tab
- ✅ Colors: Green theme (#10B981)
- ✅ Products: Grocery products from grocery Supabase
- ✅ Console: Shows `hasCustomSupabase: true`

### 3. Test Store Domain Locally

Visit: `http://store.local:3000`

**Check:**
- ✅ Title: "Ecommerce Start - Modern Shopping Experience"
- ✅ Favicon: Blue "E" icon
- ✅ Colors: Indigo/blue theme
- ✅ Products: Ecommerce products from main Supabase

### 4. Test Fashion Domain Locally

Visit: `http://fashion.local:3000`

**Check:**
- ✅ Title: "Shooshka Fashion - Trendy Fashion & Style..."
- ✅ Favicon: Pink "F" icon
- ✅ Colors: Pink theme (#EC4899)
- ✅ Products: Fashion products (if configured)

---

## 🎯 Next: Deploy to Production

Since everything is working locally, you're ready to deploy!

### Step 1: Commit and Push Code

```bash
git add .
git commit -m "Complete multi-brand multi-Supabase system with grocery integration"
git push origin main
```

### Step 2: Verify Environment Variables in Vercel

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Main Supabase (for store brand)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Main Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Main Supabase service role (for admin operations)

**Optional (if using env vars instead of DB config):**
- `NEXT_PUBLIC_SUPABASE_URL_GROCERY_STORE` - Grocery Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY_GROCERY_STORE` - Grocery Supabase anon key

**Note:** If grocery Supabase config is in the database (which it is), you don't need the env vars.

### Step 3: Deploy

Vercel will auto-deploy when you push, or:
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deploy" or wait for auto-deploy

### Step 4: Configure Domains in Vercel

1. Go to **Settings** → **Domains**
2. Add each domain:
   - `store.shooshka.online`
   - `grocery.shooshka.online`
   - `fashion.shooshka.online`

3. Configure DNS (if not already done):
   - CNAME records pointing to Vercel

### Step 5: Test Production

**Test each domain:**

1. **Store:** `https://store.shooshka.online`
   - Should show ecommerce brand
   - Products from main Supabase

2. **Grocery:** `https://grocery.shooshka.online`
   - Should show grocery brand
   - Products from grocery Supabase ✅ (already working!)

3. **Fashion:** `https://fashion.shooshka.online`
   - Should show fashion brand
   - Products from fashion Supabase (if configured)

---

## ✅ Success Checklist

- [ ] Grocery loads products from grocery Supabase ✅ (you confirmed)
- [ ] Store loads products from main Supabase
- [ ] Fashion loads products (if configured)
- [ ] Each domain shows correct favicon
- [ ] Each domain shows correct colors
- [ ] No flashing on any domain
- [ ] All UI elements use brand colors

---

## 🚀 Ready to Deploy?

If everything is working locally and grocery is successfully using its own Supabase, you're ready to deploy to production!

**Quick Deploy:**
```bash
git add .
git commit -m "Multi-brand system ready for production"
git push origin main
```

Then configure domains in Vercel and test!

