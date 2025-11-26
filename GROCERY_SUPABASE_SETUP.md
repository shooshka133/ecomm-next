# Grocery Supabase Project Setup

## Problem
The grocery products exist in a **separate Supabase project** (grocery Supabase project), but the application was using the main Supabase project. This caused the grocery products to not appear when visiting `grocery.shooshka.online`.

## Solution
The code has been updated to route to the correct Supabase project based on the domain/brand:

- **Grocery brand** (`grocery.shooshka.online`) → Uses `BRAND_A` Supabase project
- **Default/E-commerce** → Uses main Supabase project

## Required Environment Variables

Add these to your **Vercel project settings** (Environment Variables):

### For Grocery Brand (BRAND_A)
```
NEXT_PUBLIC_SUPABASE_URL_BRAND_A=<your-grocery-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A=<your-grocery-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY_BRAND_A=<your-grocery-supabase-service-role-key>
```

### Example
If your grocery Supabase project URL is:
```
https://abcdefghijklmnop.supabase.co
```

Then set:
```
NEXT_PUBLIC_SUPABASE_URL_BRAND_A=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY_BRAND_A=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## How to Find Your Grocery Supabase Credentials

1. Go to your **grocery Supabase project** dashboard
2. Click **Settings** → **API**
3. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL_BRAND_A`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A`
   - **service_role key** (secret) → Use for `SUPABASE_SERVICE_ROLE_KEY_BRAND_A`

## What Changed

### 1. Service Router (`lib/services/router.ts`)
- Added support for `grocery-store` brand slug
- Routes grocery brand to `BRAND_A` Supabase project

### 2. New API Route (`app/api/supabase-config/route.ts`)
- Returns the correct Supabase URL and key based on current domain
- Used by client components to connect to the right Supabase project

### 3. Homepage (`app/page.tsx`)
- Now fetches Supabase config from `/api/supabase-config`
- Creates Supabase client with the correct project URL/key
- Products will now load from the grocery Supabase project when on `grocery.shooshka.online`

## Testing

1. **Set environment variables** in Vercel (see above)
2. **Redeploy** your application
3. **Visit** `grocery.shooshka.online`
4. **Check browser console** - should see products loading from grocery Supabase project
5. **Verify products** - should see grocery products (64 items) instead of e-commerce products

## Notes

- The main Supabase project (`NEXT_PUBLIC_SUPABASE_URL`) is still used for:
  - Default/e-commerce brand
  - Brand configuration storage (brands table)
  - Authentication (if shared)
  
- The grocery Supabase project (`NEXT_PUBLIC_SUPABASE_URL_BRAND_A`) is used for:
  - Grocery brand products
  - Grocery-specific data

## Troubleshooting

### Products still not showing?
1. Check that environment variables are set correctly in Vercel
2. Verify the grocery Supabase project has products in the `products` table
3. Check browser console for errors
4. Verify the brand domain is set correctly: `grocery.shooshka.online`

### Getting "Supabase configuration missing" error?
- Make sure `NEXT_PUBLIC_SUPABASE_URL_BRAND_A` and `NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A` are set
- Redeploy after adding environment variables

### Still seeing e-commerce products?
- Clear browser cache
- Check that the domain routing is working: visit `/api/brand-config` and verify it returns `brandSlug: "grocery-store"`

