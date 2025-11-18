/**
 * Script to import products into Supabase
 * 
 * Usage:
 * 1. Update the products array below with your real products
 * 2. Set environment variables:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - SUPABASE_SERVICE_ROLE_KEY
 * 3. Run: npx tsx scripts/import-products.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Replace this array with your real products
const products = [
  {
    name: 'Your Product Name 1',
    description: 'Product description here',
    price: 29.99,
    image_url: 'https://your-image-url.com/product1.jpg'
  },
  {
    name: 'Your Product Name 2',
    description: 'Product description here',
    price: 49.99,
    image_url: 'https://your-image-url.com/product2.jpg'
  },
  // Add more products...
]

async function importProducts() {
  console.log('Starting product import...')
  
  // Optionally delete existing products first
  // Uncomment the next lines if you want to clear existing products
  /*
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
  
  if (deleteError) {
    console.error('Error deleting existing products:', deleteError)
    return
  }
  console.log('Deleted existing products')
  */

  // Insert new products
  const { data, error } = await supabase
    .from('products')
    .insert(products)
    .select()

  if (error) {
    console.error('Error importing products:', error)
    process.exit(1)
  }

  console.log(`Successfully imported ${data.length} products!`)
  console.log('Products:', data)
}

importProducts()

