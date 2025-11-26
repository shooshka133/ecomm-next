# Deploy and Fix Grocery Products

## Current Situation

The code changes are ready, but they need to be **deployed to Vercel** before they'll work. The new `/api/supabase-config` endpoint doesn't exist yet on the live site.

## Step 1: Deploy the Code

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Add domain-based Supabase routing for grocery brand"
   git push
   ```

2. **Vercel will auto-deploy**, or manually trigger a deployment in Vercel dashboard

3. **Wait for deployment to complete** (usually 2-3 minutes)

## Step 2: Add Environment Variables

**CRITICAL:** After deployment, you MUST add these environment variables in Vercel:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add these two variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL_BRAND_A = <your-grocery-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A = <your-grocery-supabase-anon-key>
   ```

3. **To find these values:**
   - Go to your **Grocery Supabase project** dashboard
   - Click **Settings** → **API**
   - Copy **"Project URL"** → Use for `NEXT_PUBLIC_SUPABASE_URL_BRAND_A`
   - Copy **"anon public" key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A`

4. **Important:** After adding variables, **redeploy** your application (Vercel will prompt you, or go to Deployments → Redeploy)

## Step 3: Verify It's Working

After deployment and adding environment variables:

1. **Visit:** `https://grocery.shooshka.online/api/supabase-config`
   - Should return JSON with `"source": "BRAND_A"` (not "MAIN")
   - Should show your grocery Supabase URL

2. **Visit:** `https://grocery.shooshka.online`
   - Open browser DevTools → Console
   - Look for: `[Homepage] Supabase config response: { source: "BRAND_A", ... }`
   - Look for: `[Homepage] Loaded products: 64 items` (or however many you have)

3. **Check products displayed:**
   - Should see grocery products (Fresh Produce, Dairy, Meat, etc.)
   - NOT e-commerce products (Cable Organizer, etc.)

## Troubleshooting

### Still seeing e-commerce products?

1. **Check environment variables are set:**
   - Visit `/api/debug-supabase` (after deployment)
   - Should show `NEXT_PUBLIC_SUPABASE_URL_BRAND_A: true`

2. **Check browser console:**
   - Look for `[Homepage] Supabase config response`
   - If `source: "MAIN (fallback)"` → Environment variables not set correctly
   - If `source: "BRAND_A"` → Should be working, check if products exist in grocery Supabase

3. **Verify products in grocery Supabase:**
   - Go to Grocery Supabase Dashboard
   - Table Editor → `products` table
   - Should see ~64 grocery products

### API route still 404?

- Make sure you deployed the latest code
- Check Vercel deployment logs for errors
- Wait a few minutes after deployment (sometimes takes time to propagate)

## Quick Test

After everything is set up, you can test by:

1. **Check which Supabase is being used:**
   ```
   https://grocery.shooshka.online/api/supabase-config
   ```
   Should show `"source": "BRAND_A"`

2. **Check brand detection:**
   ```
   https://grocery.shooshka.online/api/brand-config
   ```
   Should show `"brandSlug": "grocery-store"`

3. **Check products:**
   - Visit homepage
   - Browser console should show grocery products loading

## Summary

✅ Code is ready  
⏳ **Next:** Deploy to Vercel  
⏳ **Then:** Add environment variables  
⏳ **Then:** Redeploy  
✅ **Result:** Grocery products will show!

