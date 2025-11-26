# 🗄️ Grocery Store Supabase Setup - Which Option?

## Quick Answer

**You have 2 options:**

1. **✅ Option A: Separate Supabase Project (RECOMMENDED)**
   - Create a NEW Supabase project for grocery store
   - Complete data isolation
   - Uses service router automatically
   - **Best for production**

2. **Option B: Same Supabase Project**
   - Use EXISTING Supabase project
   - Add `brand_id` column to products
   - Filter products by brand
   - **Good for testing/development**

---

## 🎯 Option A: Separate Supabase Project (Recommended)

### Why This is Better:
- ✅ **Complete isolation** - Grocery products separate from electronics
- ✅ **Service router works automatically** - No code changes needed
- ✅ **Scalable** - Each brand can grow independently
- ✅ **Safer** - One brand's issues don't affect others
- ✅ **Free tier available** - Supabase allows multiple free projects

### Steps:

1. **Create New Supabase Project:**
   ```
   - Go to: https://supabase.com/dashboard
   - Click "New Project"
   - Name: "Shooshka Grocery"
   - Set password
   - Wait for project to be ready (~2 minutes)
   ```

2. **Run Database Schema:**
   - Go to SQL Editor in NEW project
   - Run `supabase-schema.sql` (creates products, cart, orders tables)
   - This is a one-time setup

3. **Import Grocery Products:**
   - Copy `grocery-products.sql`
   - Paste in SQL Editor
   - Run it
   - ✅ 64 grocery products imported!

4. **Set Environment Variables:**
   In Vercel or `.env.local`:
   ```env
   # Grocery Store (Brand A)
   NEXT_PUBLIC_SUPABASE_URL_BRAND_A=https://your-grocery-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY_BRAND_A=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. **Service Router Automatically Routes:**
   - When grocery brand is active → Uses `_BRAND_A` variables
   - When electronics brand is active → Uses `_BRAND_B` or default
   - ✅ No code changes needed!

---

## 🔄 Option B: Same Supabase Project

### When to Use This:
- Testing/development
- Want to save on Supabase projects
- Don't need complete isolation

### Steps:

1. **Add Brand ID Column:**
   ```sql
   -- Run this in your EXISTING Supabase project
   ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id TEXT;
   CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
   ```

2. **Update Existing Products:**
   ```sql
   -- Mark existing products as electronics brand
   UPDATE products 
   SET brand_id = 'ecommerce-start' 
   WHERE brand_id IS NULL;
   ```

3. **Import Grocery Products with Brand ID:**
   ```sql
   -- Modify grocery-products.sql to include brand_id
   INSERT INTO products (name, description, price, image_url, category, brand_id) VALUES
   ('Organic Red Apples', '...', 4.99, '...', 'Fresh Produce', 'grocery-store'),
   -- ... rest of products
   ```

4. **Update Product Queries:**
   You'll need to filter by brand_id in your code:
   ```typescript
   // In app/page.tsx or wherever you load products
   const { data: products } = await supabase
     .from('products')
     .select('*')
     .eq('brand_id', activeBrandSlug) // Filter by brand
   ```

5. **Update All Product Queries:**
   - Homepage product loading
   - Search functionality
   - Category filtering
   - Product detail pages
   - Cart (products must match brand)
   - Orders (products must match brand)

---

## 📊 Comparison

| Feature | Option A (Separate) | Option B (Same) |
|---------|-------------------|-----------------|
| **Setup Time** | 5 minutes | 10-15 minutes |
| **Data Isolation** | ✅ Complete | ⚠️ Requires filtering |
| **Code Changes** | ✅ None needed | ❌ Need to update queries |
| **Scalability** | ✅ Excellent | ⚠️ Limited |
| **Safety** | ✅ High | ⚠️ Medium |
| **Cost** | Free (2 projects) | Free (1 project) |
| **Service Router** | ✅ Works automatically | ⚠️ Still works, but need filtering |

---

## 🎯 My Recommendation

**Use Option A (Separate Supabase Project)** because:

1. ✅ **Service router is already set up** - It routes to different Supabase projects automatically
2. ✅ **No code changes needed** - Just set environment variables
3. ✅ **Complete isolation** - Grocery products completely separate
4. ✅ **Free tier** - Supabase allows multiple free projects
5. ✅ **Future-proof** - Easy to scale each brand independently

---

## 🚀 Quick Start (Option A)

1. **Create Supabase Project:**
   - https://supabase.com/dashboard → New Project
   - Name: "Shooshka Grocery"

2. **Run Schema:**
   - SQL Editor → Run `supabase-schema.sql`

3. **Import Products:**
   - SQL Editor → Copy/paste `grocery-products.sql` → Run

4. **Set Environment Variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL_BRAND_A=https://your-grocery-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY_BRAND_A=your_service_role_key
   ```

5. **Done!** ✅
   - Service router automatically uses grocery Supabase when grocery brand is active
   - No code changes needed!

---

## ❓ Which Should You Choose?

**Choose Option A if:**
- ✅ You want the easiest setup
- ✅ You want complete data isolation
- ✅ You're okay creating a new Supabase project
- ✅ You want production-ready setup

**Choose Option B if:**
- ⚠️ You want to test quickly
- ⚠️ You don't want to create a new project
- ⚠️ You're okay with code changes
- ⚠️ You don't need strict isolation

---

## 💡 Final Answer

**I recommend Option A (Separate Supabase Project)** because:
- Your service router is already configured for it
- No code changes needed
- Complete isolation
- Free tier available
- Production-ready

**Total setup time: ~5 minutes!** 🚀

