# 🚀 Vercel Setup for Multi-Brand System

## ✅ Recommended: Use Same Vercel Project

**You don't need a new Vercel project!** Use your existing one with environment variables.

---

## 🎯 Why Same Project?

✅ **One codebase** - Same deployment for all brands  
✅ **Service router** - Automatically routes to correct Supabase project  
✅ **Easier management** - One place to manage deployments  
✅ **Cost effective** - No duplicate deployments  
✅ **Custom domains** - Each brand can have its own domain  

---

## 📋 Step-by-Step Setup

### Step 1: Add Environment Variables in Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project

2. **Go to Settings → Environment Variables**

3. **Add These Variables:**

#### Main Project (Default/Ecommerce Start)
```
NEXT_PUBLIC_SUPABASE_URL = (your main project URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY = (your main project anon key)
SUPABASE_SERVICE_ROLE_KEY = (your main project service role key)
```

#### Grocery Project (Brand A)
```
NEXT_PUBLIC_SUPABASE_URL_BRAND_A = (your grocery project URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A = (your grocery project anon key)
SUPABASE_SERVICE_ROLE_KEY_BRAND_A = (your grocery project service role key)
```

#### Brand Management (Uses Main Project)
```
BRAND_USE_DB = true
```

#### Optional: Resend (if different for each brand)
```
RESEND_API_KEY_BRAND_A = (grocery resend key, if separate)
RESEND_FROM_EMAIL_BRAND_A = (grocery from email)
RESEND_FROM_NAME_BRAND_A = Shooshka Grocery
```

#### Optional: Stripe (if different for each brand)
```
STRIPE_SECRET_KEY_BRAND_A = (grocery stripe key, if separate)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_A = (grocery stripe key, if separate)
```

4. **Set Environment:**
   - Select **"Production"** for all variables
   - (Or "All" if you want them in preview/dev too)

5. **Click "Save"**

---

## 🔄 How It Works

### Brand Routing Logic

The service router (`lib/services/router.ts`) automatically:

1. **Checks active brand** from `brands` table (in main project)
2. **Routes to correct Supabase:**
   - `grocery-store` → Uses `NEXT_PUBLIC_SUPABASE_URL_BRAND_A`
   - `ecommerce-start` → Uses `NEXT_PUBLIC_SUPABASE_URL_BRAND_B` (or default)
   - Default → Uses `NEXT_PUBLIC_SUPABASE_URL`

3. **Routes to correct services:**
   - Resend (if `RESEND_API_KEY_BRAND_A` exists)
   - Stripe (if `STRIPE_SECRET_KEY_BRAND_A` exists)

---

## 🌐 Custom Domains Setup

### Option 1: Same Vercel Project, Different Domains

1. **Add Domain in Vercel:**
   - Settings → Domains
   - Add: `grocery.shooshka.online`
   - Add: `store.shooshka.online`

2. **Both point to same deployment**
3. **Service router detects brand by domain** (if configured)

### Option 2: Subdomain Routing (Advanced)

You can configure middleware to detect domain and set active brand:
- `store.shooshka.online` → Ecommerce Start
- `grocery.shooshka.online` → Shooshka Grocery

---

## 📝 Environment Variables Template

Copy this to Vercel:

```env
# Main Project (Default)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Grocery Project (Brand A)
NEXT_PUBLIC_SUPABASE_URL_BRAND_A=https://yyyyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A=eyJ...
SUPABASE_SERVICE_ROLE_KEY_BRAND_A=eyJ...

# Brand Management
BRAND_USE_DB=true

# Optional: Grocery-specific Resend
RESEND_API_KEY_BRAND_A=re_...
RESEND_FROM_EMAIL_BRAND_A=orders@grocery.shooshka.online
RESEND_FROM_NAME_BRAND_A=Shooshka Grocery

# Optional: Grocery-specific Stripe
STRIPE_SECRET_KEY_BRAND_A=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_A=pk_...
```

---

## 🔄 After Adding Variables

### Step 1: Redeploy

**Important:** Environment variables are only loaded during deployment!

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait 2-5 minutes

### Step 2: Test

1. Go to `/admin/brand-settings`
2. Create grocery brand
3. Activate it
4. Verify it routes to grocery Supabase project

---

## ❌ Alternative: Separate Vercel Projects

**Only if you want complete isolation:**

### Pros:
- ✅ Complete separation
- ✅ Independent deployments
- ✅ Different build settings

### Cons:
- ❌ Duplicate deployments
- ❌ More complex management
- ❌ Higher costs (if on paid plan)

### If You Choose This:

1. Create new Vercel project
2. Connect same GitHub repo
3. Set different environment variables
4. Deploy to different domain

**But this is NOT necessary!** Same project works great.

---

## ✅ Recommended Setup

**Use ONE Vercel project with environment variables:**
- ✅ Simpler
- ✅ One deployment
- ✅ Service router handles routing
- ✅ Easy to manage

---

## 🎯 Summary

**Answer: NO, you don't need a new Vercel project!**

Just add the environment variables to your existing Vercel project:
1. Add `NEXT_PUBLIC_SUPABASE_URL_BRAND_A` (grocery project)
2. Add `SUPABASE_SERVICE_ROLE_KEY_BRAND_A` (grocery project)
3. Set `BRAND_USE_DB=true`
4. Redeploy

The service router will automatically use the correct Supabase project based on the active brand! 🚀

