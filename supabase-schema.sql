-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  stripe_payment_intent_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running the script)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Users can view their own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view items from their orders" ON order_items;
DROP POLICY IF EXISTS "Order items can be inserted for user orders" ON order_items;

-- Products policies (public read)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Cart items policies (users can only see their own cart)
CREATE POLICY "Users can view their own cart" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Orders policies (users can only see their own orders)
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items policies (users can view items from their orders)
CREATE POLICY "Users can view items from their orders" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Order items can be inserted for user orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Insert real dummy product data with images
INSERT INTO products (name, description, price, image_url) VALUES
  ('Wireless Bluetooth Headphones', 'Premium noise-cancelling headphones with 30-hour battery life, crystal-clear sound quality, and comfortable over-ear design. Perfect for music lovers and professionals.', 129.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop'),
  ('Smart Watch Pro', 'Feature-rich smartwatch with heart rate monitor, GPS tracking, sleep analysis, and 7-day battery life. Water-resistant and compatible with iOS and Android.', 299.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop'),
  ('Wireless Mouse', 'Ergonomic wireless mouse with precision tracking, long battery life, and silent clicks. Perfect for office work and gaming.', 29.99, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&h=800&fit=crop'),
  ('Mechanical Keyboard', 'RGB backlit mechanical keyboard with Cherry MX switches, programmable keys, and aluminum frame. Ideal for gamers and typists.', 149.99, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop'),
  ('USB-C Hub', '7-in-1 USB-C hub with HDMI, USB 3.0 ports, SD card reader, and power delivery. Compatible with MacBook, iPad, and Windows laptops.', 49.99, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&h=800&fit=crop'),
  ('Portable Power Bank', '20000mAh high-capacity power bank with fast charging, dual USB ports, and LED indicator. Charges phones, tablets, and laptops on the go.', 39.99, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c7?w=800&h=800&fit=crop'),
  ('Wireless Earbuds', 'True wireless earbuds with active noise cancellation, 24-hour battery with case, and premium sound quality. Perfect for workouts and commuting.', 89.99, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=800&fit=crop'),
  ('4K Monitor', '27-inch 4K UHD monitor with HDR support, 99% sRGB color accuracy, and ultra-slim bezels. Perfect for designers, photographers, and content creators.', 399.99, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&h=800&fit=crop'),
  ('Webcam HD', '1080p HD webcam with auto-focus, built-in microphone, and privacy shutter. Ideal for video calls, streaming, and content creation.', 79.99, 'https://images.unsplash.com/photo-1587825147138-346c006b5b98?w=800&h=800&fit=crop'),
  ('Laptop Stand', 'Adjustable aluminum laptop stand with ergonomic design, ventilation slots, and foldable portability. Fits laptops up to 17 inches.', 34.99, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop'),
  ('Desk Lamp', 'Modern LED desk lamp with adjustable brightness, color temperature control, and USB charging port. Eye-friendly lighting for work and study.', 45.99, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=800&fit=crop'),
  ('Cable Organizer', 'Cable management kit with adhesive clips, velcro ties, and cable sleeves. Keep your workspace clean and organized.', 19.99, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop'),
  ('Gaming Mouse Pad', 'Large RGB gaming mouse pad with smooth surface, water-resistant coating, and customizable lighting effects. Perfect for gaming setups.', 24.99, 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&h=800&fit=crop'),
  ('USB Flash Drive 128GB', 'High-speed USB 3.0 flash drive with 128GB storage, metal casing, and keychain design. Transfer files quickly and securely.', 18.99, 'https://images.unsplash.com/photo-1591488320449-11f0e6e9449e?w=800&h=800&fit=crop'),
  ('Wireless Charger', 'Fast wireless charging pad with LED indicator, compatible with Qi-enabled devices. Sleek design with non-slip base.', 32.99, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&h=800&fit=crop'),
  ('Bluetooth Speaker', 'Portable Bluetooth speaker with 360-degree sound, waterproof design, and 20-hour battery life. Perfect for outdoor adventures.', 59.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop'),
  ('Tablet Stand', 'Adjustable tablet stand with multiple viewing angles, sturdy aluminum construction, and foldable design. Compatible with all tablets.', 27.99, 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=800&fit=crop'),
  ('Phone Case', 'Protective phone case with shock absorption, raised edges, and clear design. Available for all major phone models.', 15.99, 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=800&fit=crop'),
  ('Screen Protector', 'Tempered glass screen protector with anti-fingerprint coating, easy installation, and bubble-free application. Protects your screen from scratches.', 12.99, 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=800&fit=crop'),
  ('Laptop Sleeve', 'Premium laptop sleeve with padding, water-resistant material, and multiple pockets. Available in various sizes and colors.', 28.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop'),
  ('HDMI Cable', 'High-speed HDMI 2.0 cable with gold-plated connectors, supports 4K resolution and HDR. Perfect for connecting devices to monitors and TVs.', 16.99, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&h=800&fit=crop'),
  ('Gaming Headset', 'Professional gaming headset with 7.1 surround sound, noise-cancelling microphone, and RGB lighting. Comfortable for long gaming sessions.', 99.99, 'https://images.unsplash.com/photo-1599669454699-248893623440?w=800&h=800&fit=crop'),
  ('External Hard Drive', '2TB portable external hard drive with USB 3.0, fast transfer speeds, and compact design. Backup your important files securely.', 79.99, 'https://images.unsplash.com/photo-1591488320449-11f0e6e9449e?w=800&h=800&fit=crop'),
  ('Smartphone Gimbal', '3-axis smartphone gimbal with AI tracking, gesture control, and app integration. Create smooth, professional videos on the go.', 119.99, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=800&fit=crop'),
  ('Ring Light', 'LED ring light with adjustable brightness and color temperature, tripod stand included. Perfect for video calls, streaming, and photography.', 44.99, 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=800&fit=crop'),
  ('Microphone USB', 'Plug-and-play USB microphone with cardioid pickup pattern, mute button, and adjustable stand. Ideal for podcasting and streaming.', 69.99, 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=800&fit=crop'),
  ('Desk Mat', 'Large desk mat with smooth surface, water-resistant, and easy to clean. Protects your desk and provides comfortable mouse movement.', 22.99, 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&h=800&fit=crop'),
  ('Monitor Arm', 'Dual monitor arm with gas spring, VESA mount compatible, and cable management. Ergonomic positioning for better productivity.', 89.99, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&h=800&fit=crop'),
  ('USB-C Cable', 'Braided USB-C to USB-C cable with fast charging support, 6ft length, and durable construction. Compatible with all USB-C devices.', 14.99, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&h=800&fit=crop'),
  ('Wireless Keyboard', 'Slim wireless keyboard with quiet keys, long battery life, and compact design. Perfect for home office and travel.', 49.99, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop'),
  ('Phone Mount', 'Car phone mount with magnetic attachment, 360-degree rotation, and strong grip. Keep your phone secure while driving.', 19.99, 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=800&fit=crop'),
  ('Smart Light Bulb', 'WiFi-enabled smart light bulb with color changing, dimming control, and voice assistant compatibility. Control from your phone.', 24.99, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=800&fit=crop'),
  ('Security Camera', 'Wireless security camera with night vision, motion detection, and mobile app. Monitor your home from anywhere.', 89.99, 'https://images.unsplash.com/photo-1587825147138-346c006b5b98?w=800&h=800&fit=crop'),
  ('Smart Doorbell', 'Video doorbell with HD camera, two-way audio, and motion alerts. See who is at your door from your smartphone.', 129.99, 'https://images.unsplash.com/photo-1587825147138-346c006b5b98?w=800&h=800&fit=crop'),
  ('Fitness Tracker', 'Activity tracker with heart rate monitor, sleep tracking, and 7-day battery. Track your fitness goals and stay healthy.', 79.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop'),
  ('Action Camera', '4K action camera with waterproof case, image stabilization, and wide-angle lens. Capture your adventures in stunning detail.', 199.99, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=800&fit=crop'),
  ('Drone Mini', 'Compact drone with HD camera, GPS positioning, and 30-minute flight time. Perfect for aerial photography and videography.', 299.99, 'https://images.unsplash.com/photo-1473968512647-3f4478c5b1a1?w=800&h=800&fit=crop'),
  ('VR Headset', 'Virtual reality headset with high-resolution display, motion tracking, and comfortable design. Immerse yourself in virtual worlds.', 249.99, 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&h=800&fit=crop'),
  ('Projector Mini', 'Portable mini projector with 1080p resolution, built-in speaker, and wireless connectivity. Turn any wall into a screen.', 179.99, 'https://images.unsplash.com/photo-1591488320449-11f0e6e9449e?w=800&h=800&fit=crop'),
  ('Smart Thermostat', 'WiFi smart thermostat with learning capabilities, energy saving features, and mobile app control. Save money on heating and cooling.', 149.99, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop'),
  ('Robot Vacuum', 'Smart robot vacuum with mapping technology, app control, and self-charging. Keep your floors clean automatically.', 299.99, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop'),
  ('Air Purifier', 'HEPA air purifier with 3-stage filtration, quiet operation, and smart sensors. Breathe cleaner air in your home.', 199.99, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop'),
  ('Smart Lock', 'Keyless smart lock with fingerprint recognition, app control, and guest access. Secure your home with modern technology.', 179.99, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop'),
  ('Coffee Maker Smart', 'Programmable smart coffee maker with WiFi connectivity, voice control, and customizable brewing. Start your day right.', 129.99, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop'),
  ('Electric Toothbrush', 'Sonic electric toothbrush with multiple modes, pressure sensor, and long battery life. Achieve a cleaner, healthier smile.', 89.99, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&h=800&fit=crop'),
  ('Hair Dryer Professional', 'Ionic hair dryer with multiple heat settings, cool shot button, and lightweight design. Professional results at home.', 79.99, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=800&fit=crop'),
  ('Massage Gun', 'Deep tissue massage gun with multiple speed settings, interchangeable heads, and long battery life. Relieve muscle tension and soreness.', 149.99, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop'),
  ('Yoga Mat', 'Premium yoga mat with non-slip surface, extra thick padding, and carrying strap. Perfect for yoga, pilates, and exercise.', 34.99, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=800&fit=crop'),
  ('Resistance Bands', 'Set of 5 resistance bands with different resistance levels, door anchor, and exercise guide. Full-body workout at home.', 24.99, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop'),
  ('Dumbbells Adjustable', 'Adjustable dumbbells with quick-change weight system, compact design, and weight range from 5-50 lbs. Complete home gym solution.', 199.99, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop'),
  ('Running Shoes', 'Lightweight running shoes with cushioned sole, breathable mesh upper, and durable outsole. Perfect for daily runs and workouts.', 89.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop'),
  ('Backpack Laptop', 'Waterproof laptop backpack with padded compartment, USB charging port, and multiple pockets. Carry your gear in style.', 59.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop'),
  ('Sunglasses', 'Polarized sunglasses with UV protection, lightweight frame, and scratch-resistant lenses. Protect your eyes in style.', 39.99, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop'),
  ('Watch Classic', 'Classic analog watch with leather strap, water-resistant, and elegant design. Timeless style for any occasion.', 129.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop'),
  ('Wallet RFID', 'Slim RFID-blocking wallet with card slots, cash pocket, and minimalist design. Protect your cards from electronic theft.', 29.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop'),
  ('Water Bottle', 'Insulated water bottle with double-wall construction, keeps drinks cold for 24 hours, and leak-proof lid. Stay hydrated on the go.', 24.99, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=800&fit=crop'),
  ('Travel Pillow', 'Memory foam travel pillow with adjustable strap, machine washable cover, and compact design. Comfortable rest during travel.', 19.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop'),
  ('Luggage Set', '3-piece luggage set with spinner wheels, TSA locks, and expandable design. Travel in style with durable luggage.', 249.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop'),
  ('Bluetooth Car Adapter', 'Bluetooth car adapter with hands-free calling, music streaming, and voice assistant. Upgrade your car audio system.', 34.99, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c7?w=800&h=800&fit=crop'),
  ('Dash Cam', '1080p dash cam with loop recording, G-sensor, and night vision. Record your drives for safety and security.', 89.99, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=800&fit=crop'),
  ('Car Phone Holder', 'Magnetic car phone holder with strong grip, 360-degree rotation, and easy installation. Keep your phone accessible while driving.', 16.99, 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=800&fit=crop')
ON CONFLICT DO NOTHING;
