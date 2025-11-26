-- Grocery Store Products
-- For grocery.shooshka.online
-- Run this in your Supabase SQL Editor for the grocery brand's database

-- Clear existing products (optional - comment out if you want to keep existing)
-- DELETE FROM products;

-- Insert Grocery Products
INSERT INTO products (name, description, price, image_url, category) VALUES

-- ============================================
-- FRESH PRODUCE (Fruits & Vegetables)
-- ============================================
('Organic Red Apples', 'Crisp, sweet organic red apples. Perfect for snacking, baking, or juicing. Grown without pesticides, packed with vitamins and fiber.', 4.99, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&h=800&fit=crop', 'Fresh Produce'),
('Fresh Bananas', 'Ripe, yellow bananas. Rich in potassium and natural energy. Perfect for breakfast, smoothies, or as a healthy snack.', 2.49, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&h=800&fit=crop', 'Fresh Produce'),
('Organic Baby Spinach', 'Tender organic baby spinach leaves. Perfect for salads, smoothies, or cooking. Rich in iron, vitamins A, C, and K.', 3.99, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=800&fit=crop', 'Fresh Produce'),
('Fresh Carrots', 'Crunchy, sweet fresh carrots. Great for snacking, salads, or cooking. High in beta-carotene and fiber. 1 lb bag.', 2.99, 'https://images.unsplash.com/photo-1598170845058-32a9af518aa2?w=800&h=800&fit=crop', 'Fresh Produce'),
('Organic Tomatoes', 'Juicy, vine-ripened organic tomatoes. Perfect for salads, sandwiches, or cooking. Rich in lycopene and vitamin C.', 4.49, 'https://images.unsplash.com/photo-1546470427-e26264be0b01?w=800&h=800&fit=crop', 'Fresh Produce'),
('Fresh Broccoli', 'Crisp, fresh broccoli florets. High in vitamins C and K, fiber, and antioxidants. Perfect for steaming, roasting, or stir-frying.', 3.49, 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=800&h=800&fit=crop', 'Fresh Produce'),
('Organic Avocados', 'Creamy, ripe organic avocados. Perfect for guacamole, toast, or salads. Rich in healthy fats, fiber, and potassium.', 5.99, 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&h=800&fit=crop', 'Fresh Produce'),
('Fresh Strawberries', 'Sweet, juicy fresh strawberries. Perfect for desserts, smoothies, or snacking. High in vitamin C and antioxidants.', 4.99, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&h=800&fit=crop', 'Fresh Produce'),
('Organic Bell Peppers', 'Colorful organic bell peppers. Available in red, yellow, and green. Perfect for salads, stir-fries, or roasting.', 4.99, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&h=800&fit=crop', 'Fresh Produce'),
('Fresh Cucumbers', 'Crisp, refreshing fresh cucumbers. Perfect for salads, pickling, or snacking. High in water content and low in calories.', 2.99, 'https://images.unsplash.com/photo-1604977049386-4b1b9e69b8a2?w=800&h=800&fit=crop', 'Fresh Produce'),

-- ============================================
-- DAIRY & EGGS
-- ============================================
('Organic Whole Milk', 'Fresh, creamy organic whole milk. From grass-fed cows, rich in calcium and vitamin D. 1 gallon.', 5.99, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&h=800&fit=crop', 'Dairy & Eggs'),
('Free-Range Eggs', 'Large free-range eggs. From humanely raised chickens. High in protein and essential nutrients. 12 count.', 4.99, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&h=800&fit=crop', 'Dairy & Eggs'),
('Greek Yogurt', 'Creamy, protein-rich Greek yogurt. Perfect for breakfast, smoothies, or as a healthy snack. 32 oz container.', 6.99, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=800&fit=crop', 'Dairy & Eggs'),
('Organic Butter', 'Rich, creamy organic butter. Made from grass-fed cow milk. Perfect for cooking and baking. 1 lb.', 6.49, 'https://images.unsplash.com/photo-1589985270826-4b7fe135a938?w=800&h=800&fit=crop', 'Dairy & Eggs'),
('Cheddar Cheese', 'Sharp, aged cheddar cheese. Perfect for sandwiches, snacks, or cooking. Rich in calcium and protein. 8 oz block.', 5.99, 'https://images.unsplash.com/photo-1618164436268-32d5f513d4c9?w=800&h=800&fit=crop', 'Dairy & Eggs'),
('Organic Cottage Cheese', 'Creamy organic cottage cheese. High in protein, low in fat. Perfect for breakfast or as a healthy snack. 16 oz.', 4.49, 'https://images.unsplash.com/photo-1606914501443-4c3a0b0c0b0b?w=800&h=800&fit=crop', 'Dairy & Eggs'),
('Sour Cream', 'Rich, tangy sour cream. Perfect for tacos, baked potatoes, or cooking. 16 oz container.', 3.99, 'https://images.unsplash.com/photo-1606914501443-4c3a0b0c0b0b?w=800&h=800&fit=crop', 'Dairy & Eggs'),
('Organic Cream Cheese', 'Smooth, creamy organic cream cheese. Perfect for bagels, dips, or baking. 8 oz package.', 4.99, 'https://images.unsplash.com/photo-1606914501443-4c3a0b0c0b0b?w=800&h=800&fit=crop', 'Dairy & Eggs'),

-- ============================================
-- MEAT & SEAFOOD
-- ============================================
('Grass-Fed Ground Beef', 'Premium grass-fed ground beef. 85% lean, 15% fat. Perfect for burgers, meatballs, or tacos. 1 lb.', 8.99, 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop', 'Meat & Seafood'),
('Organic Chicken Breast', 'Boneless, skinless organic chicken breast. Tender and juicy. High in protein, perfect for grilling or baking. 1 lb.', 9.99, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=800&fit=crop', 'Meat & Seafood'),
('Fresh Salmon Fillet', 'Fresh Atlantic salmon fillet. Rich in omega-3 fatty acids. Perfect for grilling, baking, or pan-searing. 1 lb.', 12.99, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=800&fit=crop', 'Meat & Seafood'),
('Organic Turkey Breast', 'Lean, tender organic turkey breast. Perfect for sandwiches, salads, or cooking. High in protein, low in fat. 1 lb.', 7.99, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=800&fit=crop', 'Meat & Seafood'),
('Fresh Shrimp', 'Large, fresh wild-caught shrimp. Perfect for grilling, sautéing, or pasta dishes. High in protein and low in calories. 1 lb.', 14.99, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=800&fit=crop', 'Meat & Seafood'),
('Organic Pork Chops', 'Thick-cut organic pork chops. Tender and flavorful. Perfect for grilling or pan-frying. 1 lb.', 8.49, 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop', 'Meat & Seafood'),

-- ============================================
-- BAKERY
-- ============================================
('Fresh Sourdough Bread', 'Artisan sourdough bread. Made with natural fermentation, crispy crust, and tangy flavor. Perfect for sandwiches or toast.', 5.99, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=800&fit=crop', 'Bakery'),
('Whole Grain Bread', 'Nutritious whole grain bread. High in fiber and protein. Perfect for sandwiches or toast. 1 loaf.', 4.99, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=800&fit=crop', 'Bakery'),
('Fresh Croissants', 'Buttery, flaky fresh croissants. Baked daily. Perfect for breakfast or brunch. 4 count.', 6.99, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=800&fit=crop', 'Bakery'),
('Chocolate Chip Cookies', 'Homemade chocolate chip cookies. Soft, chewy, and loaded with chocolate chips. Perfect for dessert or snacks. 12 count.', 5.49, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=800&fit=crop', 'Bakery'),
('Fresh Bagels', 'Fresh-baked bagels. Available in plain, sesame, or everything. Perfect for breakfast. 6 count.', 4.99, 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&h=800&fit=crop', 'Bakery'),
('Artisan Muffins', 'Fresh-baked artisan muffins. Available in blueberry, chocolate chip, or bran. Perfect for breakfast. 4 count.', 6.99, 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800&h=800&fit=crop', 'Bakery'),

-- ============================================
-- PANTRY STAPLES
-- ============================================
('Organic Olive Oil', 'Extra virgin organic olive oil. Cold-pressed, rich in antioxidants. Perfect for cooking, salads, or dipping. 16.9 fl oz.', 12.99, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=800&fit=crop', 'Pantry Staples'),
('Organic Pasta', 'High-quality organic pasta. Made from durum wheat semolina. Perfect for any pasta dish. 1 lb.', 3.99, 'https://images.unsplash.com/photo-1551462147-858f1c3c8c0b?w=800&h=800&fit=crop', 'Pantry Staples'),
('Organic Rice', 'Long-grain organic white rice. Fluffy and perfect for any meal. 2 lb bag.', 4.99, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop', 'Pantry Staples'),
('Organic Black Beans', 'Canned organic black beans. Ready to eat, high in protein and fiber. Perfect for salads, soups, or tacos. 15 oz can.', 2.99, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=800&fit=crop', 'Pantry Staples'),
('Organic Tomato Sauce', 'Rich, flavorful organic tomato sauce. Made from vine-ripened tomatoes. Perfect for pasta, pizza, or cooking. 24 oz jar.', 4.49, 'https://images.unsplash.com/photo-1546470427-e26264be0b01?w=800&h=800&fit=crop', 'Pantry Staples'),
('Organic Honey', 'Pure, raw organic honey. Unfiltered and unpasteurized. Perfect for tea, baking, or as a natural sweetener. 16 oz jar.', 9.99, 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=800&fit=crop', 'Pantry Staples'),
('Sea Salt', 'Fine sea salt. Natural and unrefined. Perfect for cooking, baking, or finishing dishes. 16 oz.', 3.99, 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop', 'Pantry Staples'),
('Organic Flour', 'All-purpose organic flour. Perfect for baking bread, cookies, or cakes. 5 lb bag.', 6.99, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop', 'Pantry Staples'),

-- ============================================
-- BEVERAGES
-- ============================================
('Organic Orange Juice', 'Fresh-squeezed organic orange juice. Rich in vitamin C. No added sugar. 64 fl oz.', 5.99, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&h=800&fit=crop', 'Beverages'),
('Sparkling Water', 'Refreshing sparkling water. Zero calories, zero sugar. Available in lemon, lime, or plain. 12 pack.', 4.99, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&h=800&fit=crop', 'Beverages'),
('Organic Coffee', 'Premium organic coffee beans. Medium roast, rich and smooth. Perfect for your morning cup. 12 oz bag.', 12.99, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop', 'Beverages'),
('Green Tea', 'Premium organic green tea. Rich in antioxidants. Perfect for a healthy boost. 20 tea bags.', 5.99, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=800&fit=crop', 'Beverages'),
('Organic Apple Juice', 'Pure organic apple juice. No added sugar. Rich in vitamin C. 64 fl oz.', 4.99, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&h=800&fit=crop', 'Beverages'),
('Coconut Water', 'Natural coconut water. Hydrating and refreshing. Rich in electrolytes. 33.8 fl oz.', 3.99, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&h=800&fit=crop', 'Beverages'),

-- ============================================
-- SNACKS
-- ============================================
('Organic Trail Mix', 'Nutritious organic trail mix. Contains almonds, cashews, raisins, and dark chocolate chips. Perfect for on-the-go snacking. 12 oz.', 7.99, 'https://images.unsplash.com/photo-1606312619070-d48b4bdc5e3b?w=800&h=800&fit=crop', 'Snacks'),
('Organic Granola Bars', 'Healthy organic granola bars. Made with whole grains, nuts, and honey. Perfect for breakfast or snacks. 6 count.', 5.99, 'https://images.unsplash.com/photo-1606312619070-d48b4bdc5e3b?w=800&h=800&fit=crop', 'Snacks'),
('Organic Potato Chips', 'Crispy organic potato chips. Made with real potatoes and sea salt. No artificial flavors. 8 oz bag.', 4.99, 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=800&fit=crop', 'Snacks'),
('Organic Popcorn', 'Light and airy organic popcorn. Perfect for movie nights. Available in sea salt or butter flavor. 8 oz bag.', 3.99, 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=800&fit=crop', 'Snacks'),
('Dark Chocolate', 'Premium dark chocolate. 70% cacao, rich and smooth. High in antioxidants. 3.5 oz bar.', 4.99, 'https://images.unsplash.com/photo-1606312619070-d48b4bdc5e3b?w=800&h=800&fit=crop', 'Snacks'),
('Organic Nuts', 'Mixed organic nuts. Contains almonds, walnuts, and cashews. High in protein and healthy fats. 16 oz.', 12.99, 'https://images.unsplash.com/photo-1606312619070-d48b4bdc5e3b?w=800&h=800&fit=crop', 'Snacks'),

-- ============================================
-- FROZEN FOODS
-- ============================================
('Organic Frozen Berries', 'Mixed organic frozen berries. Contains strawberries, blueberries, and raspberries. Perfect for smoothies or baking. 16 oz.', 6.99, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&h=800&fit=crop', 'Frozen Foods'),
('Frozen Vegetables', 'Mixed frozen vegetables. Contains broccoli, carrots, and peas. Perfect for quick meals. 16 oz bag.', 3.99, 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=800&h=800&fit=crop', 'Frozen Foods'),
('Frozen Pizza', 'Gourmet frozen pizza. Made with fresh ingredients and real cheese. Perfect for quick dinners. 12 inch.', 8.99, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=800&fit=crop', 'Frozen Foods'),
('Ice Cream', 'Premium vanilla ice cream. Creamy and rich. Made with real vanilla. 1.5 quart.', 6.99, 'https://images.unsplash.com/photo-1563805042-7684c019e1b5?w=800&h=800&fit=crop', 'Frozen Foods'),
('Frozen Chicken Nuggets', 'Crispy frozen chicken nuggets. Made with white meat chicken. Perfect for kids or quick meals. 1 lb.', 5.99, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=800&fit=crop', 'Frozen Foods'),

-- ============================================
-- ORGANIC & NATURAL
-- ============================================
('Organic Quinoa', 'Premium organic quinoa. High in protein and fiber. Perfect for salads, bowls, or side dishes. 1 lb.', 7.99, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop', 'Organic & Natural'),
('Organic Chia Seeds', 'Nutritious organic chia seeds. High in omega-3 fatty acids and fiber. Perfect for smoothies, yogurt, or baking. 16 oz.', 8.99, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop', 'Organic & Natural'),
('Organic Almonds', 'Raw organic almonds. High in protein, healthy fats, and vitamin E. Perfect for snacking or cooking. 16 oz.', 11.99, 'https://images.unsplash.com/photo-1606312619070-d48b4bdc5e3b?w=800&h=800&fit=crop', 'Organic & Natural'),
('Organic Coconut Oil', 'Unrefined organic coconut oil. Perfect for cooking, baking, or skincare. Rich in healthy fats. 16 oz jar.', 9.99, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=800&fit=crop', 'Organic & Natural'),

-- ============================================
-- HOUSEHOLD ESSENTIALS
-- ============================================
('Paper Towels', 'Absorbent paper towels. Strong and durable. Perfect for cleaning and spills. 2 pack.', 8.99, 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop', 'Household Essentials'),
('Toilet Paper', 'Soft, strong toilet paper. 2-ply, septic-safe. 12 rolls.', 12.99, 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop', 'Household Essentials'),
('Dish Soap', 'Effective dish soap. Cuts through grease and leaves dishes sparkling clean. 24 fl oz.', 4.99, 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop', 'Household Essentials'),
('Laundry Detergent', 'Concentrated laundry detergent. Works in all washing machines. Removes stains and odors. 100 fl oz.', 14.99, 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop', 'Household Essentials'),
('Trash Bags', 'Heavy-duty trash bags. Leak-proof and tear-resistant. Perfect for kitchen or bathroom. 45 count.', 9.99, 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop', 'Household Essentials');

-- Verify products were inserted
SELECT COUNT(*) as total_products, category, COUNT(*) as count_per_category
FROM products
GROUP BY category
ORDER BY category;

