# 🛒 Grocery Store Setup Guide
## Setting Up grocery.shooshka.online

Complete guide to set up your grocery store brand with all the products ready to go!

---

## ✅ What's Ready

1. **✅ 50+ Grocery Products** - All prepared and ready to import
2. **✅ Grocery Categories** - Fresh Produce, Dairy, Meat, Bakery, etc.
3. **✅ Product Images** - Using Unsplash (high-quality food images)
4. **✅ Realistic Prices** - Grocery-appropriate pricing
5. **✅ Product Descriptions** - Detailed and appealing

---

## 📋 Step 1: Create Grocery Brand in Admin

1. **Go to Admin Panel:**
   - Visit: `http://localhost:3000/admin/brand-settings`
   - Or: `https://store.shooshka.online/admin/brand-settings`

2. **Create New Brand:**
   - Click **"Create New Brand"**
   - Fill in the form:

   **Basic Information:**
   - **Slug:** `grocery-store` (or `grocery`)
   - **Name:** `Shooshka Grocery`
   - **Slogan:** `Fresh groceries delivered to your door. Quality you can trust.`

   **Brand Assets:**
   - Upload a grocery-themed logo (or use placeholder)
   - Upload favicon, Apple Icon, OG Image

   **Colors:**
   - **Primary:** `#10B981` (Green - fresh food theme)
   - **Accent:** `#059669` (Dark Green)
   - **Secondary:** `#3B82F6` (Blue)
   - **Background:** `#FFFFFF`
   - **Text:** `#1F2937`

   **Typography:**
   - **Primary Font:** `Inter, sans-serif`
   - **Heading Font:** `Poppins, sans-serif`

   **Hero Section:**
   - **Title:** `Welcome to Shooshka Grocery`
   - **Subtitle:** `Fresh groceries delivered to your door. Quality you can trust.`
   - **CTA Text:** `Shop Now`
   - **Badge:** `Fresh & Organic`

   **SEO:**
   - **Title:** `Shooshka Grocery - Fresh Groceries Online`
   - **Description:** `Shop fresh groceries online. Organic produce, quality meats, and pantry staples delivered to your door.`

   **Contact:**
   - **Email:** `orders@grocery.shooshka.online`

3. **Save the Brand:**
   - Click **"Save Brand"**
   - Note the brand ID/slug for later

---

## 🗄️ Step 2: Set Up Supabase for Grocery Store

### Option A: Use Separate Supabase Project (Recommended)

1. **Create New Supabase Project:**
   - Go to: https://supabase.com/dashboard
   - Click **"New Project"**
   - Name: `Shooshka Grocery`
   - Set password
   - Wait for project to be ready

2. **Run Database Schema:**
   - Go to SQL Editor
   - Run `supabase-schema.sql` (if not already run)
   - This creates products, cart, orders tables

3. **Import Grocery Products:**

   **Method 1: Using SQL (Easiest)**
   - Open SQL Editor in Supabase
   - Copy contents of `grocery-products.sql`
   - Paste and run
   - ✅ Products imported!

   **Method 2: Using Script**
   ```bash
   # Set environment variables
   export NEXT_PUBLIC_SUPABASE_URL_BRAND_A="https://your-grocery-project.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY_BRAND_A="your_service_role_key"
   
   # Run import script
   npx tsx scripts/import-grocery-products.ts
   ```

### Option B: Use Same Supabase (Different Products)

If you want to use the same Supabase project but separate products:

1. **Add Brand ID to Products:**
   ```sql
   -- Add brand_id column if not exists
   ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id TEXT;
   
   -- Update grocery products with brand_id
   UPDATE products 
   SET brand_id = 'grocery-store' 
   WHERE category IN ('Fresh Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery', 'Pantry Staples', 'Beverages', 'Snacks', 'Frozen Foods', 'Organic & Natural', 'Household Essentials');
   ```

2. **Filter Products by Brand:**
   - Update your product queries to filter by `brand_id`
   - Only show products matching active brand

---

## 🌐 Step 3: Configure Domain

### Add Subdomain to Vercel

1. **Go to Vercel Dashboard:**
   - Project → Settings → Domains

2. **Add Domain:**
   - Enter: `grocery.shooshka.online`
   - Click **"Add"**

3. **Configure DNS:**
   - Type: `CNAME`
   - Name: `grocery`
   - Value: `cname.vercel-dns.com`
   - Save in your DNS provider

4. **Wait for SSL:**
   - Vercel automatically issues SSL
   - Takes ~5 minutes

---

## ⚙️ Step 4: Set Environment Variables

### In Vercel Dashboard:

Go to **Settings** → **Environment Variables** and add:

```env
# Grocery Store Supabase (Brand A)
NEXT_PUBLIC_SUPABASE_URL_BRAND_A=https://your-grocery-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY_BRAND_A=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Grocery Store Resend (optional)
RESEND_API_KEY_BRAND_A=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL_BRAND_A=orders@grocery.shooshka.online
RESEND_FROM_NAME_BRAND_A=Shooshka Grocery

# Grocery Store Stripe (optional)
STRIPE_SECRET_KEY_BRAND_A=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_A=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET_BRAND_A=whsec_xxxxxxxxxxxxx
```

**Important:** Select environments:
- ✅ **Production**
- ✅ **Preview**

---

## 🎨 Step 5: Update Brand Config (Optional)

If you want to update `brand.config.ts` for local development:

```typescript
export const brand = {
  name: "Shooshka Grocery",
  slogan: "Fresh groceries delivered to your door. Quality you can trust.",
  logoUrl: "/brand/grocery-logo.svg",
  colors: {
    primary: "#10B981",  // Green
    accent: "#059669",    // Dark Green
    secondary: "#3B82F6", // Blue
    background: "#FFFFFF",
    text: "#1F2937",
  },
  // ... rest of config
}
```

---

## ✅ Step 6: Activate Grocery Brand

1. **Go to Admin Panel:**
   - `/admin/brand-settings`

2. **Activate Grocery Brand:**
   - Find "Shooshka Grocery" brand
   - Click **"Activate"**
   - ✅ Brand is now active!

3. **Verify:**
   - Visit homepage
   - Should see grocery products
   - UI should show grocery branding

---

## 🧪 Step 7: Test Everything

### Test Checklist:

- [ ] Grocery products load on homepage
- [ ] Categories show correctly (Fresh Produce, Dairy, etc.)
- [ ] Product images display
- [ ] Product detail pages work
- [ ] Add to cart works
- [ ] Checkout works
- [ ] Brand colors applied (green theme)
- [ ] Logo shows correctly
- [ ] Email confirmation works (if configured)

---

## 📦 Product Categories

Your grocery store has these categories:

1. **Fresh Produce** (10 products)
   - Apples, Bananas, Spinach, Carrots, Tomatoes, etc.

2. **Dairy & Eggs** (8 products)
   - Milk, Eggs, Yogurt, Butter, Cheese, etc.

3. **Meat & Seafood** (6 products)
   - Ground Beef, Chicken, Salmon, Shrimp, etc.

4. **Bakery** (6 products)
   - Bread, Croissants, Cookies, Muffins, etc.

5. **Pantry Staples** (8 products)
   - Olive Oil, Pasta, Rice, Beans, Honey, etc.

6. **Beverages** (6 products)
   - Orange Juice, Sparkling Water, Coffee, Tea, etc.

7. **Snacks** (6 products)
   - Trail Mix, Granola Bars, Chocolate, Nuts, etc.

8. **Frozen Foods** (5 products)
   - Frozen Berries, Vegetables, Ice Cream, etc.

9. **Organic & Natural** (4 products)
   - Quinoa, Almonds, Chia Seeds, Coconut Oil, etc.

10. **Household Essentials** (5 products)
    - Paper Towels, Toilet Paper, Dish Soap, etc.

**Total: 64 grocery products!** 🎉

---

## 🚀 Next Steps

After setting up the grocery store:

1. **Test the store:**
   - Browse products
   - Test checkout
   - Verify brand switching

2. **Customize:**
   - Add more products
   - Update branding
   - Customize categories

3. **Deploy:**
   - Push to GitHub
   - Vercel auto-deploys
   - Test on production

4. **Set Up DigitalOcean:**
   - Follow DigitalOcean setup guide
   - Deploy grocery store there
   - Configure domain

---

## 🎯 Quick Start Commands

```bash
# Import grocery products (using script)
npx tsx scripts/import-grocery-products.ts

# Or use SQL directly in Supabase SQL Editor
# Copy and paste grocery-products.sql
```

---

## 📝 Notes

- **Design Compatibility:** ✅ The current design works perfectly for grocery! It's product-based, so it displays any products beautifully.

- **Product Images:** All products use Unsplash images. You can replace these with your own product photos later.

- **Pricing:** Prices are in USD. Adjust as needed for your market.

- **Categories:** Categories are automatically created when you import products.

---

## 🎉 You're Ready!

Your grocery store is set up with:
- ✅ 64 grocery products
- ✅ 10 product categories
- ✅ Realistic pricing
- ✅ Beautiful product images
- ✅ Ready to activate!

**Next:** Set up DigitalOcean deployment! 🚀

