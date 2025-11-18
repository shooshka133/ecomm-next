# Data Migration Plan: Replacing Demo Data with Real Data

## 📋 Overview

This comprehensive guide will help you replace all dummy/demo data with your real product data, images, and content.

---

## 🎯 Phase 1: Preparation

### Step 1: Gather Your Real Data

#### 1.1 Product Information
Create a spreadsheet or document with:
- Product names
- Product descriptions
- Prices (in USD)
- Product images (URLs or files)
- Categories (if applicable)
- Stock quantities (if tracking)

**Template:**
```
Product Name | Description | Price | Image URL | Category
-------------|-------------|-------|-----------|----------
Product 1    | Description | 29.99 | URL       | Category
```

#### 1.2 Image Preparation

**Image Requirements:**
- Format: JPG, PNG, or WebP
- Recommended size: 800x800px minimum
- Max file size: 2MB per image
- Optimize images before uploading

**Image Optimization Tools:**
- Online: TinyPNG, Squoosh
- Desktop: ImageOptim, GIMP
- Command line: ImageMagick

---

## 🖼️ Phase 2: Image Hosting Setup

### Option A: Supabase Storage (Recommended)

#### Step 1: Create Storage Bucket

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub
2. Navigate to **Storage**
3. Click **New bucket**
4. Name: `products`
5. **Make it PUBLIC** (important!)
6. Click **Create bucket**

#### Step 2: Upload Images

**Method 1: Via Dashboard**
1. Click on `products` bucket
2. Click **Upload file**
3. Select your product images
4. Upload
5. Click on uploaded file
6. Copy the **Public URL**

**Method 2: Via Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Upload files
supabase storage upload products image1.jpg --bucket products
```

**Method 3: Via API (Programmatic)**
```typescript
// See scripts/upload-images.ts example below
```

#### Step 3: Get Image URLs

Format: `https://eqqcidlflclgegsalbub.supabase.co/storage/v1/object/public/products/your-image.jpg`

---

### Option B: Cloudinary (Alternative)

#### Step 1: Sign Up
1. Go to https://cloudinary.com
2. Sign up for free account
3. Get your cloud name

#### Step 2: Upload Images
1. Go to Media Library
2. Upload images
3. Copy image URLs

#### Step 3: Configure Next.js
Add to `next.config.js`:
```javascript
images: {
  domains: ['res.cloudinary.com'],
}
```

---

### Option C: AWS S3 / Other CDN

1. Upload images to your CDN
2. Make them publicly accessible
3. Get public URLs
4. Add domain to `next.config.js` if needed

---

## 📦 Phase 3: Product Data Migration

### Method 1: Supabase Dashboard (Easiest - For < 50 Products)

#### Step 1: Delete Dummy Products

1. Go to Supabase Dashboard > **Table Editor**
2. Click on **products** table
3. Select all rows (or individual ones)
4. Click **Delete** button
5. Confirm deletion

#### Step 2: Add Real Products

**For Each Product:**
1. Click **Insert row**
2. Fill in:
   - **name**: Your product name
   - **description**: Product description
   - **price**: Price (e.g., 29.99)
   - **image_url**: Full URL to image
3. Click **Save**
4. Repeat for all products

---

### Method 2: CSV Import (For 50-500 Products)

#### Step 1: Prepare CSV File

Create `products.csv`:
```csv
name,description,price,image_url
"Product Name 1","Product description here",29.99,"https://your-image-url.com/product1.jpg"
"Product Name 2","Product description here",49.99,"https://your-image-url.com/product2.jpg"
"Product Name 3","Product description here",79.99,"https://your-image-url.com/product3.jpg"
```

**Important:**
- Use double quotes for text fields
- No header row needed (but can include)
- Ensure prices are numbers (29.99, not "$29.99")
- Image URLs must be full URLs (https://...)

#### Step 2: Import CSV

1. Go to Supabase Dashboard > **Table Editor** > **products**
2. Click **...** (three dots menu)
3. Select **Import data from CSV**
4. Upload your CSV file
5. Map columns if needed
6. Click **Import**

#### Step 3: Verify Import

1. Check products appear in table
2. Verify all fields populated correctly
3. Test on website

---

### Method 3: SQL Script (For Bulk Operations)

#### Step 1: Prepare SQL

Create `import-real-products.sql`:

```sql
-- Delete all dummy products
DELETE FROM products;

-- Insert your real products
INSERT INTO products (name, description, price, image_url) VALUES
  (
    'Your Product Name 1',
    'Detailed product description here. Include key features, benefits, and specifications.',
    29.99,
    'https://eqqcidlflclgegsalbub.supabase.co/storage/v1/object/public/products/product1.jpg'
  ),
  (
    'Your Product Name 2',
    'Detailed product description here.',
    49.99,
    'https://eqqcidlflclgegsalbub.supabase.co/storage/v1/object/public/products/product2.jpg'
  ),
  (
    'Your Product Name 3',
    'Detailed product description here.',
    79.99,
    'https://eqqcidlflclgegsalbub.supabase.co/storage/v1/object/public/products/product3.jpg'
  );
-- Add more products as needed
```

#### Step 2: Run SQL

1. Go to Supabase Dashboard > **SQL Editor**
2. Paste your SQL script
3. Click **Run**
4. Verify success message
5. Check products table

---

### Method 4: Programmatic Import (For Many Products)

#### Step 1: Update Import Script

Edit `scripts/import-products.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// REPLACE THIS ARRAY WITH YOUR REAL PRODUCTS
const products = [
  {
    name: 'Your Real Product Name 1',
    description: 'Your product description here. Make it detailed and compelling.',
    price: 29.99,
    image_url: 'https://eqqcidlflclgegsalbub.supabase.co/storage/v1/object/public/products/product1.jpg'
  },
  {
    name: 'Your Real Product Name 2',
    description: 'Your product description here.',
    price: 49.99,
    image_url: 'https://eqqcidlflclgegsalbub.supabase.co/storage/v1/object/public/products/product2.jpg'
  },
  // Add all your products here...
]

async function importProducts() {
  console.log('Starting product import...')
  
  // Delete existing products (optional - comment out if you want to keep existing)
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  
  if (deleteError) {
    console.error('Error deleting existing products:', deleteError)
    return
  }
  console.log('Deleted existing products')

  // Insert new products in batches (100 at a time)
  const batchSize = 100
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize)
    const { data, error } = await supabase
      .from('products')
      .insert(batch)
      .select()

    if (error) {
      console.error(`Error importing batch ${i / batchSize + 1}:`, error)
      continue
    }

    console.log(`Imported batch ${i / batchSize + 1}: ${data.length} products`)
  }

  console.log(`Successfully imported ${products.length} products!`)
}

importProducts()
```

#### Step 2: Run Script

```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="https://eqqcidlflclgegsalbub.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Run script
npx tsx scripts/import-products.ts
```

Or with `.env.local`:
```bash
# Load from .env.local
source .env.local
npx tsx scripts/import-products.ts
```

---

## 🖼️ Phase 4: Image Upload Script (Optional)

Create `scripts/upload-images.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// Map of local image files to product names
const imageMap: Record<string, string> = {
  'product1.jpg': 'Product Name 1',
  'product2.jpg': 'Product Name 2',
  // Add more mappings...
}

async function uploadImages() {
  const imagesDir = path.join(process.cwd(), 'images', 'products')
  
  for (const [filename, productName] of Object.entries(imageMap)) {
    const filePath = path.join(imagesDir, filename)
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`)
      continue
    }

    const file = fs.readFileSync(filePath)
    const { data, error } = await supabase.storage
      .from('products')
      .upload(filename, file, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (error) {
      console.error(`Error uploading ${filename}:`, error)
      continue
    }

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(filename)

    console.log(`${productName}: ${urlData.publicUrl}`)
  }
}

uploadImages()
```

---

## ✅ Phase 5: Verification

### Step 1: Verify Products

1. **In Supabase Dashboard:**
   - Go to Table Editor > products
   - Verify all products are there
   - Check data looks correct

2. **On Website:**
   - Go to homepage
   - Verify products appear
   - Check images load
   - Verify prices display correctly

### Step 2: Test Product Pages

1. Click on each product
2. Verify product detail page loads
3. Check description displays
4. Verify image displays
5. Test "Add to Cart"

### Step 3: Test Search

1. Use search bar
2. Search for product names
3. Verify results appear

---

## 🔄 Phase 6: Updating Existing Products

### Update Single Product

**Via Dashboard:**
1. Go to Table Editor > products
2. Click on product row
3. Edit fields
4. Save

**Via SQL:**
```sql
UPDATE products
SET 
  name = 'Updated Product Name',
  description = 'Updated description',
  price = 39.99,
  image_url = 'https://new-image-url.com/image.jpg'
WHERE id = 'product-uuid-here';
```

### Bulk Update

**Update All Prices:**
```sql
-- Increase all prices by 10%
UPDATE products
SET price = price * 1.1;
```

**Update Image URLs:**
```sql
-- Update image base URL for all products
UPDATE products
SET image_url = REPLACE(image_url, 'old-base-url.com', 'new-base-url.com');
```

---

## 📊 Phase 7: Data Quality Checklist

### Product Data Quality

- [ ] All products have names
- [ ] All products have prices
- [ ] Prices are positive numbers
- [ ] Descriptions are meaningful (not empty)
- [ ] Image URLs are valid and accessible
- [ ] Images load correctly
- [ ] No duplicate products
- [ ] Product names are clear and descriptive

### Image Quality

- [ ] All images load
- [ ] Images are properly sized
- [ ] Images are optimized
- [ ] No broken image links
- [ ] Images match products

---

## 🚨 Common Issues & Solutions

### Issue: Images Not Loading

**Causes:**
- Image URL is incorrect
- Supabase Storage bucket not public
- CORS issues
- Image file doesn't exist

**Solutions:**
1. Verify image URL in browser
2. Check Supabase Storage bucket is public
3. Check CORS settings
4. Re-upload image if needed

### Issue: Products Not Appearing

**Causes:**
- RLS policy blocking access
- Products not inserted correctly
- Cache issues

**Solutions:**
1. Check RLS policies allow SELECT
2. Verify products in database
3. Clear browser cache
4. Hard refresh (Ctrl+Shift+R)

### Issue: Prices Display Incorrectly

**Causes:**
- Price format incorrect
- Currency formatting issue
- Database type mismatch

**Solutions:**
1. Verify prices are decimal numbers
2. Check price formatting in code
3. Verify database column type is DECIMAL

---

## 📝 Migration Checklist

### Preparation
- [ ] Product data gathered
- [ ] Images prepared and optimized
- [ ] Image hosting set up
- [ ] Image URLs ready

### Migration
- [ ] Dummy products deleted
- [ ] Real products added
- [ ] Images uploaded
- [ ] Image URLs updated in products

### Verification
- [ ] Products appear on website
- [ ] Images load correctly
- [ ] Product pages work
- [ ] Search works
- [ ] Add to cart works
- [ ] Prices display correctly

### Testing
- [ ] Test complete purchase flow
- [ ] Verify order creation
- [ ] Check mobile display
- [ ] Test on different browsers

---

## 🎯 Best Practices

### Product Names
- Keep concise (50-100 characters)
- Be descriptive
- Include key features if short
- Use consistent naming

### Descriptions
- Include key features
- Mention benefits
- 100-500 characters recommended
- Use bullet points if needed

### Prices
- Use 2 decimal places
- Be consistent with currency
- Update regularly if needed

### Images
- Use high quality (800x800px+)
- Optimize before uploading
- Use consistent aspect ratio
- Name files descriptively

---

## 🔄 Ongoing Maintenance

### Regular Updates

1. **Add New Products:**
   - Use same methods as above
   - Maintain data quality
   - Update images

2. **Update Existing Products:**
   - Use dashboard or SQL
   - Update prices if needed
   - Refresh images

3. **Remove Discontinued Products:**
   ```sql
   DELETE FROM products WHERE id = 'product-uuid';
   ```

---

## 📊 Data Migration Summary

### What Gets Replaced

1. **Products Table:**
   - Product names
   - Descriptions
   - Prices
   - Image URLs

### What Stays the Same

1. **Database Structure:**
   - Table schemas
   - RLS policies
   - Indexes

2. **User Data:**
   - User accounts
   - Orders (if any)
   - Addresses
   - Profiles

---

## 🎉 Post-Migration

After migration:
1. Test complete flow
2. Verify all products display
3. Check images load
4. Test search functionality
5. Test checkout with real products
6. Monitor for any issues

---

**Migration Guide Version:** 1.0  
**Last Updated:** $(date)  
**Status:** Ready for Use ✅

