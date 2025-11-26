# Multi-Brand: Separating Products and Authentication

## 🔍 Current Situation

You have **two brands** but they're sharing:
- ✅ **Brand Config**: Separate (Green Theme Store vs Ecommerce Start)
- ❌ **Products**: Same products for both brands
- ❌ **Users**: Same authentication for both brands

### Why This Happens

1. **Products Table** doesn't have a `brand_id` field
   - All products are in one table
   - No way to filter by brand

2. **Authentication** is shared
   - Single `auth.users` table
   - All sign-ups work for all brands

---

## 🎯 Solution Options

### Option 1: Separate Products Per Brand (Recommended)

**Structure:**
- Add `brand_id` to products table
- Filter products by active brand
- Keep shared authentication (users can shop at any brand)

**Pros:**
✅ Each brand has its own products  
✅ Users can shop at multiple brands  
✅ Single authentication system  
✅ Easier to manage  

**Cons:**
❌ Users are shared (but can be separated later)  

---

### Option 2: Complete Separation (Products + Auth)

**Structure:**
- Separate Supabase projects per brand
- Each brand has its own products AND users

**Pros:**
✅ Complete isolation  
✅ Independent scaling  
✅ Separate user bases  

**Cons:**
❌ More complex  
❌ Users can't shop across brands  
❌ More expensive (multiple projects)  

---

## 🚀 Implementation: Option 1 (Recommended)

### Step 1: Add Brand ID to Products

Run this SQL in Supabase:

```sql
-- Add brand_id column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);

-- Update existing products (assign to default brand or leave NULL for shared)
-- Option A: Leave NULL (products visible to all brands)
-- Option B: Assign to a specific brand
UPDATE products SET brand_id = (SELECT id FROM brands WHERE slug = 'ecommerce-start' LIMIT 1);
```

### Step 2: Update Product Queries

**Before:**
```typescript
const { data: products } = await supabase.from('products').select('*')
```

**After:**
```typescript
// Get active brand
const activeBrand = await getActiveBrand()

// Filter products by brand (or show all if brand_id is NULL)
const { data: products } = await supabase
  .from('products')
  .select('*')
  .or(`brand_id.eq.${activeBrand?.id},brand_id.is.null`)
```

### Step 3: Update All Product Queries

Files to update:
- `app/page.tsx` - Homepage products
- `app/products/[id]/page.tsx` - Product detail
- `components/ProductCard.tsx` - Product cards
- `components/ProductGrid.tsx` - Product grid
- `components/AutoScrollProducts.tsx` - Auto-scroll products
- `components/SearchBar.tsx` - Search results

### Step 4: Update Product Creation

When adding products via admin:
```typescript
// Get active brand
const activeBrand = await getActiveBrand()

// Insert product with brand_id
await supabase.from('products').insert({
  name: 'Product Name',
  price: 29.99,
  brand_id: activeBrand?.id, // Link to active brand
  // ... other fields
})
```

---

## 🔐 User Separation (Optional)

### Option A: Keep Shared Auth (Recommended)

**Users can:**
- Sign up once
- Shop at any brand
- Have separate carts per brand (if needed)

**Implementation:**
- No changes needed
- Users are shared across brands

### Option B: Separate Users Per Brand

**Add `brand_id` to user tables:**

```sql
-- Add brand_id to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id);

-- Add brand_id to cart_items
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id);

-- Add brand_id to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id);

-- Update RLS policies to filter by brand
-- Users can only see their cart/orders for their brand
```

**On Sign Up:**
```typescript
// Get active brand
const activeBrand = await getActiveBrand()

// Create user profile with brand_id
await supabase.from('user_profiles').insert({
  id: user.id,
  brand_id: activeBrand?.id,
  // ... other fields
})
```

---

## 📋 Complete Migration Plan

### Phase 1: Add Brand Support to Products

1. ✅ Run SQL to add `brand_id` column
2. ✅ Update product queries to filter by brand
3. ✅ Update admin product creation
4. ✅ Test: Each brand shows only its products

### Phase 2: Assign Existing Products

**Option A: Assign to Default Brand**
```sql
-- Assign all products to "Ecommerce Start"
UPDATE products 
SET brand_id = (SELECT id FROM brands WHERE slug = 'ecommerce-start' LIMIT 1)
WHERE brand_id IS NULL;
```

**Option B: Split Products**
```sql
-- Assign some products to "Green Theme Store"
UPDATE products 
SET brand_id = (SELECT id FROM brands WHERE slug = 'green-theme-store' LIMIT 1)
WHERE id IN ('product-id-1', 'product-id-2', ...);

-- Assign others to "Ecommerce Start"
UPDATE products 
SET brand_id = (SELECT id FROM brands WHERE slug = 'ecommerce-start' LIMIT 1)
WHERE id IN ('product-id-3', 'product-id-4', ...);
```

**Option C: Keep Products Shared**
```sql
-- Leave brand_id as NULL - products visible to all brands
-- No UPDATE needed
```

### Phase 3: User Separation (Optional)

1. ✅ Add `brand_id` to user tables
2. ✅ Update sign-up flow
3. ✅ Update RLS policies
4. ✅ Test: Users only see their brand's data

---

## 🎯 Recommended Setup for Your Case

### For "Green Theme Store" and "Ecommerce Start":

**Products:**
- Add `brand_id` to products
- Assign products to specific brands
- Each brand shows only its products

**Users:**
- Keep shared authentication (Option A)
- Users can shop at both brands
- Simpler to manage

**Why:**
- Users might want to shop at both stores
- Easier to manage one user base
- Can separate later if needed

---

## 🔧 Quick Implementation

Would you like me to:

1. **Create SQL migration** to add `brand_id` to products?
2. **Update product queries** to filter by brand?
3. **Update admin product creation** to assign brand?
4. **Create helper functions** for brand-aware product queries?

Let me know and I'll implement it!

---

## 📊 Database Schema After Migration

```
products
├── id
├── name
├── price
├── brand_id (NEW) → references brands(id)
└── ...

brands
├── id
├── slug
├── name
├── is_active
└── ...

cart_items
├── id
├── user_id
├── product_id → references products(id)
└── ... (brand_id optional for user separation)

orders
├── id
├── user_id
└── ... (brand_id optional for user separation)
```

---

## ✅ Testing Checklist

After implementation:

- [ ] Green Theme Store shows only its products
- [ ] Ecommerce Start shows only its products
- [ ] Products can be assigned to brands in admin
- [ ] Product queries filter by active brand
- [ ] Users can sign up (shared or per-brand)
- [ ] Cart/orders work correctly

