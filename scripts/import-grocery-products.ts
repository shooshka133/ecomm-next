/**
 * Script to import grocery products into Supabase
 * 
 * Usage:
 * 1. Set environment variables:
 *    - NEXT_PUBLIC_SUPABASE_URL (for grocery brand)
 *    - SUPABASE_SERVICE_ROLE_KEY (for grocery brand)
 * 2. Run: npx tsx scripts/import-grocery-products.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_BRAND_A || process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY_BRAND_A || process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Grocery Products Data
const products = [
  // Fresh Produce
  { name: 'Organic Red Apples', description: 'Crisp, sweet organic red apples. Perfect for snacking, baking, or juicing. Grown without pesticides, packed with vitamins and fiber.', price: 4.99, image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&h=800&fit=crop', category: 'Fresh Produce' },
  { name: 'Fresh Bananas', description: 'Ripe, yellow bananas. Rich in potassium and natural energy. Perfect for breakfast, smoothies, or as a healthy snack.', price: 2.49, image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&h=800&fit=crop', category: 'Fresh Produce' },
  { name: 'Organic Baby Spinach', description: 'Tender organic baby spinach leaves. Perfect for salads, smoothies, or cooking. Rich in iron, vitamins A, C, and K.', price: 3.99, image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=800&fit=crop', category: 'Fresh Produce' },
  { name: 'Fresh Carrots', description: 'Crunchy, sweet fresh carrots. Great for snacking, salads, or cooking. High in beta-carotene and fiber. 1 lb bag.', price: 2.99, image_url: 'https://images.unsplash.com/photo-1598170845058-32a9af518aa2?w=800&h=800&fit=crop', category: 'Fresh Produce' },
  { name: 'Organic Tomatoes', description: 'Juicy, vine-ripened organic tomatoes. Perfect for salads, sandwiches, or cooking. Rich in lycopene and vitamin C.', price: 4.49, image_url: 'https://images.unsplash.com/photo-1546470427-e26264be0b01?w=800&h=800&fit=crop', category: 'Fresh Produce' },
  { name: 'Fresh Broccoli', description: 'Crisp, fresh broccoli florets. High in vitamins C and K, fiber, and antioxidants. Perfect for steaming, roasting, or stir-frying.', price: 3.49, image_url: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=800&h=800&fit=crop', category: 'Fresh Produce' },
  { name: 'Organic Avocados', description: 'Creamy, ripe organic avocados. Perfect for guacamole, toast, or salads. Rich in healthy fats, fiber, and potassium.', price: 5.99, image_url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&h=800&fit=crop', category: 'Fresh Produce' },
  { name: 'Fresh Strawberries', description: 'Sweet, juicy fresh strawberries. Perfect for desserts, smoothies, or snacking. High in vitamin C and antioxidants.', price: 4.99, image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&h=800&fit=crop', category: 'Fresh Produce' },
  { name: 'Organic Bell Peppers', description: 'Colorful organic bell peppers. Available in red, yellow, and green. Perfect for salads, stir-fries, or roasting.', price: 4.99, image_url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&h=800&fit=crop', category: 'Fresh Produce' },
  { name: 'Fresh Cucumbers', description: 'Crisp, refreshing fresh cucumbers. Perfect for salads, pickling, or snacking. High in water content and low in calories.', price: 2.99, image_url: 'https://images.unsplash.com/photo-1604977049386-4b1b9e69b8a2?w=800&h=800&fit=crop', category: 'Fresh Produce' },
  
  // Dairy & Eggs
  { name: 'Organic Whole Milk', description: 'Fresh, creamy organic whole milk. From grass-fed cows, rich in calcium and vitamin D. 1 gallon.', price: 5.99, image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&h=800&fit=crop', category: 'Dairy & Eggs' },
  { name: 'Free-Range Eggs', description: 'Large free-range eggs. From humanely raised chickens. High in protein and essential nutrients. 12 count.', price: 4.99, image_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&h=800&fit=crop', category: 'Dairy & Eggs' },
  { name: 'Greek Yogurt', description: 'Creamy, protein-rich Greek yogurt. Perfect for breakfast, smoothies, or as a healthy snack. 32 oz container.', price: 6.99, image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=800&fit=crop', category: 'Dairy & Eggs' },
  { name: 'Organic Butter', description: 'Rich, creamy organic butter. Made from grass-fed cow milk. Perfect for cooking and baking. 1 lb.', price: 6.49, image_url: 'https://images.unsplash.com/photo-1589985270826-4b7fe135a938?w=800&h=800&fit=crop', category: 'Dairy & Eggs' },
  { name: 'Cheddar Cheese', description: 'Sharp, aged cheddar cheese. Perfect for sandwiches, snacks, or cooking. Rich in calcium and protein. 8 oz block.', price: 5.99, image_url: 'https://images.unsplash.com/photo-1618164436268-32d5f513d4c9?w=800&h=800&fit=crop', category: 'Dairy & Eggs' },
  
  // Meat & Seafood
  { name: 'Grass-Fed Ground Beef', description: 'Premium grass-fed ground beef. 85% lean, 15% fat. Perfect for burgers, meatballs, or tacos. 1 lb.', price: 8.99, image_url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop', category: 'Meat & Seafood' },
  { name: 'Organic Chicken Breast', description: 'Boneless, skinless organic chicken breast. Tender and juicy. High in protein, perfect for grilling or baking. 1 lb.', price: 9.99, image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=800&fit=crop', category: 'Meat & Seafood' },
  { name: 'Fresh Salmon Fillet', description: 'Fresh Atlantic salmon fillet. Rich in omega-3 fatty acids. Perfect for grilling, baking, or pan-searing. 1 lb.', price: 12.99, image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=800&fit=crop', category: 'Meat & Seafood' },
  { name: 'Fresh Shrimp', description: 'Large, fresh wild-caught shrimp. Perfect for grilling, sautéing, or pasta dishes. High in protein and low in calories. 1 lb.', price: 14.99, image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=800&fit=crop', category: 'Meat & Seafood' },
  
  // Bakery
  { name: 'Fresh Sourdough Bread', description: 'Artisan sourdough bread. Made with natural fermentation, crispy crust, and tangy flavor. Perfect for sandwiches or toast.', price: 5.99, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=800&fit=crop', category: 'Bakery' },
  { name: 'Whole Grain Bread', description: 'Nutritious whole grain bread. High in fiber and protein. Perfect for sandwiches or toast. 1 loaf.', price: 4.99, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=800&fit=crop', category: 'Bakery' },
  { name: 'Fresh Croissants', description: 'Buttery, flaky fresh croissants. Baked daily. Perfect for breakfast or brunch. 4 count.', price: 6.99, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=800&fit=crop', category: 'Bakery' },
  { name: 'Chocolate Chip Cookies', description: 'Homemade chocolate chip cookies. Soft, chewy, and loaded with chocolate chips. Perfect for dessert or snacks. 12 count.', price: 5.49, image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=800&fit=crop', category: 'Bakery' },
  
  // Pantry Staples
  { name: 'Organic Olive Oil', description: 'Extra virgin organic olive oil. Cold-pressed, rich in antioxidants. Perfect for cooking, salads, or dipping. 16.9 fl oz.', price: 12.99, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=800&fit=crop', category: 'Pantry Staples' },
  { name: 'Organic Pasta', description: 'High-quality organic pasta. Made from durum wheat semolina. Perfect for any pasta dish. 1 lb.', price: 3.99, image_url: 'https://images.unsplash.com/photo-1551462147-858f1c3c8c0b?w=800&h=800&fit=crop', category: 'Pantry Staples' },
  { name: 'Organic Rice', description: 'Long-grain organic white rice. Fluffy and perfect for any meal. 2 lb bag.', price: 4.99, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop', category: 'Pantry Staples' },
  { name: 'Organic Black Beans', description: 'Canned organic black beans. Ready to eat, high in protein and fiber. Perfect for salads, soups, or tacos. 15 oz can.', price: 2.99, image_url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=800&fit=crop', category: 'Pantry Staples' },
  { name: 'Organic Honey', description: 'Pure, raw organic honey. Unfiltered and unpasteurized. Perfect for tea, baking, or as a natural sweetener. 16 oz jar.', price: 9.99, image_url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=800&fit=crop', category: 'Pantry Staples' },
  
  // Beverages
  { name: 'Organic Orange Juice', description: 'Fresh-squeezed organic orange juice. Rich in vitamin C. No added sugar. 64 fl oz.', price: 5.99, image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&h=800&fit=crop', category: 'Beverages' },
  { name: 'Sparkling Water', description: 'Refreshing sparkling water. Zero calories, zero sugar. Available in lemon, lime, or plain. 12 pack.', price: 4.99, image_url: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&h=800&fit=crop', category: 'Beverages' },
  { name: 'Organic Coffee', description: 'Premium organic coffee beans. Medium roast, rich and smooth. Perfect for your morning cup. 12 oz bag.', price: 12.99, image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop', category: 'Beverages' },
  { name: 'Green Tea', description: 'Premium organic green tea. Rich in antioxidants. Perfect for a healthy boost. 20 tea bags.', price: 5.99, image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=800&fit=crop', category: 'Beverages' },
  
  // Snacks
  { name: 'Organic Trail Mix', description: 'Nutritious organic trail mix. Contains almonds, cashews, raisins, and dark chocolate chips. Perfect for on-the-go snacking. 12 oz.', price: 7.99, image_url: 'https://images.unsplash.com/photo-1606312619070-d48b4bdc5e3b?w=800&h=800&fit=crop', category: 'Snacks' },
  { name: 'Organic Granola Bars', description: 'Healthy organic granola bars. Made with whole grains, nuts, and honey. Perfect for breakfast or snacks. 6 count.', price: 5.99, image_url: 'https://images.unsplash.com/photo-1606312619070-d48b4bdc5e3b?w=800&h=800&fit=crop', category: 'Snacks' },
  { name: 'Dark Chocolate', description: 'Premium dark chocolate. 70% cacao, rich and smooth. High in antioxidants. 3.5 oz bar.', price: 4.99, image_url: 'https://images.unsplash.com/photo-1606312619070-d48b4bdc5e3b?w=800&h=800&fit=crop', category: 'Snacks' },
  
  // Frozen Foods
  { name: 'Organic Frozen Berries', description: 'Mixed organic frozen berries. Contains strawberries, blueberries, and raspberries. Perfect for smoothies or baking. 16 oz.', price: 6.99, image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&h=800&fit=crop', category: 'Frozen Foods' },
  { name: 'Frozen Vegetables', description: 'Mixed frozen vegetables. Contains broccoli, carrots, and peas. Perfect for quick meals. 16 oz bag.', price: 3.99, image_url: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=800&h=800&fit=crop', category: 'Frozen Foods' },
  { name: 'Ice Cream', description: 'Premium vanilla ice cream. Creamy and rich. Made with real vanilla. 1.5 quart.', price: 6.99, image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1b5?w=800&h=800&fit=crop', category: 'Frozen Foods' },
  
  // Organic & Natural
  { name: 'Organic Quinoa', description: 'Premium organic quinoa. High in protein and fiber. Perfect for salads, bowls, or side dishes. 1 lb.', price: 7.99, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop', category: 'Organic & Natural' },
  { name: 'Organic Almonds', description: 'Raw organic almonds. High in protein, healthy fats, and vitamin E. Perfect for snacking or cooking. 16 oz.', price: 11.99, image_url: 'https://images.unsplash.com/photo-1606312619070-d48b4bdc5e3b?w=800&h=800&fit=crop', category: 'Organic & Natural' },
  
  // Household Essentials
  { name: 'Paper Towels', description: 'Absorbent paper towels. Strong and durable. Perfect for cleaning and spills. 2 pack.', price: 8.99, image_url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop', category: 'Household Essentials' },
  { name: 'Toilet Paper', description: 'Soft, strong toilet paper. 2-ply, septic-safe. 12 rolls.', price: 12.99, image_url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop', category: 'Household Essentials' },
  { name: 'Dish Soap', description: 'Effective dish soap. Cuts through grease and leaves dishes sparkling clean. 24 fl oz.', price: 4.99, image_url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop', category: 'Household Essentials' },
]

async function importProducts() {
  console.log('🛒 Starting grocery products import...')
  console.log(`📦 Total products to import: ${products.length}`)
  
  // Optionally delete existing products first
  // Uncomment the next lines if you want to clear existing products
  /*
  console.log('🗑️  Deleting existing products...')
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  
  if (deleteError) {
    console.error('❌ Error deleting existing products:', deleteError)
    return
  }
  console.log('✅ Deleted existing products')
  */

  // Insert products in batches
  const batchSize = 50
  let imported = 0
  
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    
    console.log(`📤 Importing batch ${batchNum} (${batch.length} products)...`)
    
    const { data, error } = await supabase
      .from('products')
      .insert(batch)
      .select()

    if (error) {
      console.error(`❌ Error importing batch ${batchNum}:`, error)
      continue
    }

    imported += data.length
    console.log(`✅ Batch ${batchNum} imported: ${data.length} products`)
  }

  console.log(`\n🎉 Successfully imported ${imported} grocery products!`)
  
  // Show summary by category
  const { data: summary } = await supabase
    .from('products')
    .select('category')
  
  if (summary) {
    const categoryCount: Record<string, number> = {}
    summary.forEach(p => {
      categoryCount[p.category || 'Uncategorized'] = (categoryCount[p.category || 'Uncategorized'] || 0) + 1
    })
    
    console.log('\n📊 Products by category:')
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`)
    })
  }
}

importProducts().catch(console.error)

