# Guide: Replacing Dummy Data with Real Data

## Overview
This guide will help you replace the dummy product data with your real products and images.

## Method 1: Using Supabase Dashboard (Easiest)

### Step 1: Access Supabase Table Editor
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub
2. Navigate to **Table Editor**
3. Click on the **products** table

### Step 2: Delete Dummy Products
1. Select all rows (or individual rows)
2. Click **Delete** button
3. Confirm deletion

### Step 3: Add Your Real Products

#### Option A: Manual Entry (Few Products)
1. Click **Insert row** button
2. Fill in the fields:
   - **name**: Product name (required)
   - **description**: Product description
   - **price**: Product price (decimal, e.g., 29.99)
   - **image_url**: URL to your product image
3. Click **Save**
4. Repeat for each product

#### Option B: Bulk Import (Many Products)
1. Click the **...** menu (three dots) in the table
2. Select **Import data from CSV**
3. Prepare a CSV file with columns:
   ```csv
   name,description,price,image_url
   "Product Name","Product description",29.99,"https://your-image-url.com/image.jpg"
   ```
4. Upload the CSV file
5. Map columns if needed
6. Import

## Method 2: Using SQL (For Bulk Operations)

### Step 1: Delete Dummy Products
Run this SQL in Supabase SQL Editor:
```sql
-- Delete all existing products
DELETE FROM products;
```

### Step 2: Insert Your Real Products
```sql
-- Insert your real products
INSERT INTO products (name, description, price, image_url) VALUES
  ('Your Product Name 1', 'Product description here', 29.99, 'https://your-image-url.com/product1.jpg'),
  ('Your Product Name 2', 'Product description here', 49.99, 'https://your-image-url.com/product2.jpg'),
  ('Your Product Name 3', 'Product description here', 79.99, 'https://your-image-url.com/product3.jpg');
-- Add more products as needed
```

## Method 3: Using Supabase API (Programmatic)

Create a script to import products:

```typescript
// scripts/import-products.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const products = [
  {
    name: 'Your Product Name',
    description: 'Product description',
    price: 29.99,
    image_url: 'https://your-image-url.com/image.jpg'
  },
  // Add more products...
]

async function importProducts() {
  const { data, error } = await supabase
    .from('products')
    .insert(products)
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Products imported:', data)
  }
}

importProducts()
```

## Image Hosting Options

### Option 1: Supabase Storage (Recommended)
1. Go to Supabase Dashboard > **Storage**
2. Create a bucket named `products`
3. Make it public
4. Upload your product images
5. Get the public URL for each image
6. Use format: `https://eqqcidlflclgegsalbub.supabase.co/storage/v1/object/public/products/image-name.jpg`

### Option 2: Cloudinary
1. Sign up at https://cloudinary.com
2. Upload images
3. Get image URLs
4. Use URLs in product data

### Option 3: AWS S3 / Other CDN
1. Upload to your CDN
2. Get public URLs
3. Use URLs in product data

### Option 4: Image URLs from Your Existing Site
If you have existing product images, use their URLs directly.

## Product Data Structure

Each product needs:
- **name** (required): Product name
- **description** (optional): Product description
- **price** (required): Decimal number (e.g., 29.99)
- **image_url** (optional): Full URL to product image

## Best Practices

1. **Image Sizes**: 
   - Recommended: 800x800px or larger
   - Format: JPG or PNG
   - Optimize images before uploading

2. **Product Names**: 
   - Keep concise but descriptive
   - 50-100 characters recommended

3. **Descriptions**: 
   - Include key features
   - 100-500 characters recommended

4. **Prices**: 
   - Use 2 decimal places
   - Ensure prices are accurate

## Example: Complete Product Entry

```sql
INSERT INTO products (name, description, price, image_url) VALUES
  (
    'Wireless Bluetooth Headphones Pro',
    'Premium noise-cancelling headphones with 30-hour battery life, crystal-clear sound quality, and comfortable over-ear design. Perfect for music lovers and professionals.',
    129.99,
    'https://eqqcidlflclgegsalbub.supabase.co/storage/v1/object/public/products/headphones.jpg'
  );
```

## Updating Existing Products

To update a product:
```sql
UPDATE products
SET 
  name = 'New Product Name',
  description = 'New description',
  price = 39.99,
  image_url = 'https://new-image-url.com/image.jpg'
WHERE id = 'product-uuid-here';
```

Or use Supabase Dashboard:
1. Find the product in Table Editor
2. Click on the row to edit
3. Update fields
4. Save

## Bulk Update Script

If you need to update many products:

```typescript
// Update all products with new image base URL
const { data, error } = await supabase
  .from('products')
  .update({ 
    image_url: supabase.storage.from('products').getPublicUrl('new-path').data.publicUrl
  })
  .eq('some_condition', 'value')
```

## Verification

After adding products:
1. Go to your website homepage
2. Verify products appear correctly
3. Check images load properly
4. Test product detail pages
5. Test adding to cart

## Troubleshooting

### Images Not Loading
- Check image URLs are accessible
- Verify Supabase Storage bucket is public
- Check CORS settings if using external images

### Products Not Appearing
- Refresh the page
- Check browser console for errors
- Verify RLS policies allow SELECT on products table

### Price Display Issues
- Ensure prices are decimal numbers
- Check for currency formatting

## Next Steps

1. Add your real products using one of the methods above
2. Test the complete flow
3. Update product images if needed
4. Consider adding product categories (future enhancement)
5. Add product inventory tracking (future enhancement)

