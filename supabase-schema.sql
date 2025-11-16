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
  ('Cable Organizer', 'Cable management kit with adhesive clips, velcro ties, and cable sleeves. Keep your workspace clean and organized.', 19.99, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop')
ON CONFLICT DO NOTHING;
