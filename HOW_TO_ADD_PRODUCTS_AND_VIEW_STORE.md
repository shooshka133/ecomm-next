# How to Add Products & View Your Store

## 🚀 Quick Start

### View Your Store in Browser

**Simply open:**
```
http://localhost:3000
```

That's it! Your store homepage will load automatically.

---

## 📦 Adding Products to Your Store

### Method 1: Using Supabase Dashboard (Easiest - Recommended)

#### Step 1: Access Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor**
3. Click on the **`products`** table

#### Step 2: Add a Product

1. Click **"Insert row"** button (or **"New row"**)
2. Fill in the fields:

   **Required Fields:**
   - **`name`** (text): Product name
     - Example: `Wireless Bluetooth Headphones`
   
   - **`price`** (number): Product price
     - Example: `29.99`
   
   - **`image_url`** (text): Full URL to product image
     - Example: `https://example.com/image.jpg`
     - Or use Supabase Storage: `https://your-project.supabase.co/storage/v1/object/public/products/image.jpg`

   **Optional Fields:**
   - **`description`** (text): Product description
     - Example: `Premium noise-cancelling headphones with 30-hour battery life`
   
   - **`category`** (text): Product category
     - Example: `Electronics`, `Clothing`, `Home`, etc.

3. Click **"Save"** (or press Enter)

#### Step 3: Verify Product Appears

1. Go to `http://localhost:3000`
2. Refresh the page
3. Your product should appear on the homepage!

---

### Method 2: Using SQL (For Multiple Products)

#### Step 1: Access SQL Editor

1. Go to Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **"New query"**

#### Step 2: Insert Products

Copy and paste this SQL (modify with your products):

```sql
-- Insert multiple products at once
INSERT INTO products (name, description, price, image_url, category) VALUES
  (
    'Wireless Bluetooth Headphones',
    'Premium noise-cancelling headphones with 30-hour battery life, crystal-clear sound quality.',
    129.99,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    'Electronics'
  ),
  (
    'Smart Watch Pro',
    'Fitness tracker with heart rate monitor, GPS, and 7-day battery life.',
    199.99,
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    'Electronics'
  ),
  (
    'Cotton T-Shirt',
    'Comfortable 100% cotton t-shirt, available in multiple colors.',
    24.99,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    'Clothing'
  ),
  (
    'Coffee Maker',
    'Programmable coffee maker with thermal carafe, makes 12 cups.',
    79.99,
    'https://images.unsplash.com/photo-1517668808824-7012e6c3e5e1?w=500',
    'Home'
  );
```

#### Step 3: Run Query

1. Click **"Run"** button (or press Ctrl+Enter)
2. Wait for success message
3. Check products table to verify

---

### Method 3: Using Import Script (For Many Products)

#### Step 1: Edit Import Script

Open `scripts/import-products.ts` and update the products array:

```typescript
const products = [
  {
    name: 'Your Product Name 1',
    description: 'Product description here',
    price: 29.99,
    image_url: 'https://your-image-url.com/product1.jpg',
    category: 'Electronics'
  },
  {
    name: 'Your Product Name 2',
    description: 'Product description here',
    price: 49.99,
    image_url: 'https://your-image-url.com/product2.jpg',
    category: 'Clothing'
  },
  // Add more products...
]
```

#### Step 2: Run Script

```bash
# Make sure you're in the project directory
cd C:\ecomm

# Run the import script
npx tsx scripts/import-products.ts
```

#### Step 3: Verify

1. Check terminal for success message
2. Go to `http://localhost:3000`
3. Products should appear!

---

## 🖼️ Adding Product Images

### Option 1: Use External URLs (Easiest)

**Free Image Sources:**
- **Unsplash:** https://unsplash.com
- **Pexels:** https://pexels.com
- **Pixabay:** https://pixabay.com

**How to use:**
1. Find an image you like
2. Right-click → "Copy image address"
3. Paste URL in `image_url` field

**Example:**
```
https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500
```

### Option 2: Upload to Supabase Storage

#### Step 1: Create Storage Bucket

1. Go to Supabase Dashboard
2. Navigate to **Storage**
3. Click **"New bucket"**
4. Name: `products`
5. Make it **Public**
6. Click **"Create bucket"**

#### Step 2: Upload Images

1. Click on `products` bucket
2. Click **"Upload file"**
3. Select your image
4. Click **"Upload"**

#### Step 3: Get Public URL

1. Click on uploaded image
2. Copy the **Public URL**
3. Use this URL in `image_url` field

**Example URL format:**
```
https://your-project.supabase.co/storage/v1/object/public/products/image.jpg
```

---

## 👀 Viewing Your Store

### Homepage

**URL:** `http://localhost:3000`

**What you'll see:**
- ✅ Hero section with brand name
- ✅ Product grid (all your products)
- ✅ Search bar
- ✅ Category filters
- ✅ Pagination (if many products)

### Product Detail Page

**URL:** `http://localhost:3000/products/[product-id]`

**How to access:**
1. Click on any product card on homepage
2. Or type URL directly (need product ID from database)

### Other Pages

- **Cart:** `http://localhost:3000/cart`
- **Checkout:** `http://localhost:3000/checkout`
- **Admin:** `http://localhost:3000/admin`
- **Brand Settings:** `http://localhost:3000/admin/brand-settings`

---

## ✅ Product Requirements

### Required Fields

- **`name`** - Product name (text)
- **`price`** - Product price (decimal number)
- **`image_url`** - Full URL to image (text)

### Optional Fields

- **`description`** - Product description (text)
- **`category`** - Product category (text)

### Example Complete Product

```sql
INSERT INTO products (name, description, price, image_url, category) VALUES
  (
    'Wireless Bluetooth Headphones Pro',
    'Premium noise-cancelling headphones with 30-hour battery life, crystal-clear sound quality, and comfortable over-ear design. Perfect for music lovers and professionals.',
    129.99,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    'Electronics'
  );
```

---

## 🔍 Troubleshooting

### Products Not Showing?

**Check:**
1. ✅ Products exist in Supabase `products` table
2. ✅ `image_url` is a valid URL (starts with `http://` or `https://`)
3. ✅ `price` is a number (not text)
4. ✅ Refresh browser (Ctrl+F5 or Cmd+Shift+R)
5. ✅ Check browser console for errors (F12)

### Images Not Loading?

**Check:**
1. ✅ Image URL is accessible (try opening in new tab)
2. ✅ URL starts with `http://` or `https://`
3. ✅ Image is not too large (recommend under 1MB)
4. ✅ CORS is enabled (if using external images)

### Store Not Loading?

**Check:**
1. ✅ Dev server is running (`npm run dev`)
2. ✅ Supabase connection is working
3. ✅ Environment variables are set (`.env.local`)
4. ✅ Check terminal for errors

---

## 📊 Quick Test Products

**Copy and paste these into Supabase SQL Editor:**

```sql
INSERT INTO products (name, description, price, image_url, category) VALUES
  ('Wireless Headphones', 'Premium noise-cancelling headphones', 129.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'Electronics'),
  ('Smart Watch', 'Fitness tracker with GPS', 199.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 'Electronics'),
  ('Cotton T-Shirt', 'Comfortable 100% cotton', 24.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 'Clothing'),
  ('Coffee Maker', 'Programmable 12-cup maker', 79.99, 'https://images.unsplash.com/photo-1517668808824-7012e6c3e5e1?w=500', 'Home'),
  ('Running Shoes', 'Lightweight athletic shoes', 89.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'Clothing'),
  ('Laptop Stand', 'Ergonomic aluminum stand', 39.99, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', 'Electronics');
```

---

## 🎯 Step-by-Step: First Product

### 1. Open Supabase Dashboard
- Go to your Supabase project
- Click **Table Editor** → **products**

### 2. Insert Row
- Click **"Insert row"** or **"New row"**

### 3. Fill Fields
```
name: Test Product
description: This is my first product
price: 29.99
image_url: https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500
category: Electronics
```

### 4. Save
- Click **"Save"** or press Enter

### 5. View Store
- Open `http://localhost:3000`
- Your product should appear!

---

## 💡 Pro Tips

1. **Start Small:** Add 3-5 products first to test
2. **Use Test Images:** Use Unsplash/Pexels for quick testing
3. **Categories:** Use consistent category names (Electronics, Clothing, Home, etc.)
4. **Descriptions:** Write clear, compelling descriptions
5. **Prices:** Use 2 decimal places (29.99, not 30)

---

## 📚 Related Files

- **Homepage:** `app/page.tsx` - Displays products
- **Product Card:** `components/ProductCard.tsx` - Product display
- **Import Script:** `scripts/import-products.ts` - Bulk import
- **Product Type:** `types/index.ts` - Product interface

---

## ✅ Success Checklist

- [ ] Products added to Supabase `products` table
- [ ] Products have valid `image_url`
- [ ] Products have `name` and `price`
- [ ] Store loads at `http://localhost:3000`
- [ ] Products appear on homepage
- [ ] Can click products to see details
- [ ] Images load correctly

---

**You're all set! Add products and view your store! 🎉**

