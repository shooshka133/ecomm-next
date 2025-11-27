# Deploy Store and Grocery Brands

## ✅ Current Status

- ✅ **Store Brand** - Using main Supabase, fully configured
- ✅ **Grocery Brand** - Using separate Supabase project, fully configured
- ⏸️ **Fashion Brand** - Will be added later (same process as grocery)

---

## 🚀 Deployment Steps

### Step 1: Final Code Check

Make sure all changes are committed:

```bash
git status
git add .
git commit -m "Multi-brand system: Store and Grocery ready for production"
git push origin main
```

### Step 2: Verify Vercel Environment Variables

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Main Supabase (for Store brand)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Main Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Main Supabase service role (for admin operations)

**Note:** Grocery Supabase config is stored in the database, so no additional env vars needed!

### Step 3: Deploy to Vercel

**Option A: Auto-deploy (Recommended)**
- Push to `main` branch
- Vercel will automatically deploy

**Option B: Manual Deploy**
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deploy" → "Redeploy"

### Step 4: Configure Domains in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Add domains:
   - `store.shooshka.online` ✅
   - `grocery.shooshka.online` ✅
   - ~~`fashion.shooshka.online`~~ (skip for now)

3. **DNS Configuration** (if not already done):
   - In your DNS provider (Cloudflare, etc.)
   - Add CNAME records:
     - `store` → Vercel domain
     - `grocery` → Vercel domain

### Step 5: Test Production

**Test Store Domain:**
- URL: `https://store.shooshka.online`
- ✅ Should show: "Ecommerce Start" brand
- ✅ Favicon: Blue "E" icon
- ✅ Colors: Indigo/blue
- ✅ Products: Ecommerce products from main Supabase

**Test Grocery Domain:**
- URL: `https://grocery.shooshka.online`
- ✅ Should show: "Shooshka Grocery" brand
- ✅ Favicon: Green "G" icon
- ✅ Colors: Green (#10B981)
- ✅ Products: Grocery products from grocery Supabase

---

## ✅ Pre-Deployment Checklist

- [ ] Code committed and pushed
- [ ] Environment variables set in Vercel
- [ ] Database has correct brand configs (Store and Grocery)
- [ ] Grocery Supabase project is accessible
- [ ] Products are in grocery Supabase
- [ ] Local testing passed (both `.local` domains work)

---

## 🎯 Post-Deployment Verification

After deployment, test:

1. **No Flashing:**
   - Open each domain in incognito
   - Title, logo, colors should be correct from start
   - No "Ecommerce Start" flash

2. **Correct Products:**
   - Store shows ecommerce products
   - Grocery shows grocery products
   - No cross-contamination

3. **Correct Branding:**
   - Store: Blue favicon, indigo colors
   - Grocery: Green favicon, green colors
   - All UI elements use brand colors

4. **Console Check:**
   - No errors in browser console
   - Correct Supabase URLs in logs
   - Correct brand slugs in logs

---

## 📝 Adding Fashion Brand Later

When you're ready to add Fashion brand, follow the same process as Grocery:

1. **Create Fashion Supabase project**
2. **Run SQL to create/update Fashion brand:**
   ```sql
   -- From CREATE_ALL_THREE_BRANDS.sql (Step 4)
   INSERT INTO brands (slug, name, domain, is_active, config, asset_urls)
   VALUES ('fashion-store', 'Shooshka Fashion', 'fashion.shooshka.online', false, {...}, '{}');
   ```

3. **Add Supabase config:**
   ```sql
   UPDATE brands
   SET config = config || '{
     "supabase": {
       "url": "https://fashion-xxxxx.supabase.co",
       "anonKey": "eyJ..."
     }
   }'::jsonb
   WHERE slug = 'fashion-store';
   ```

4. **Import products to Fashion Supabase**
5. **Add domain in Vercel:** `fashion.shooshka.online`
6. **Test:** `https://fashion.shooshka.online`

**Same process as Grocery!** ✅

---

## 🆘 Troubleshooting

### Grocery Not Loading Products

**Check:**
1. Grocery Supabase project is accessible
2. Products are imported into grocery Supabase
3. Brand config has correct Supabase URL/key
4. Browser console for Supabase errors

**Debug:**
```sql
SELECT 
  slug,
  config->'supabase'->>'url' as supabase_url
FROM brands
WHERE slug = 'Grocery-store';
```

### Store Showing Grocery Products

**Check:**
1. Store domain is correct in database
2. Store brand doesn't have Supabase config (should use main)
3. Products in main Supabase don't have wrong brand_id

### Favicons Not Showing

**Check:**
1. Favicon files exist in `/public`:
   - `favicon-store.svg`
   - `favicon-grocery.svg`
2. Database has correct `faviconUrl` in brand config
3. Clear browser cache

---

## 🎉 Success!

Once both Store and Grocery work in production:
- ✅ Multi-brand system is live
- ✅ Each brand uses correct Supabase
- ✅ Zero flashing
- ✅ All branding correct

**Fashion can be added anytime using the same process!**

