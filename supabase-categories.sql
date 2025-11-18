-- Add category column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Update existing products with categories
UPDATE products SET category = 'Electronics' WHERE name IN (
  'Wireless Bluetooth Headphones',
  'Smart Watch Pro',
  'Wireless Mouse',
  'Mechanical Keyboard',
  'USB-C Hub',
  'Portable Power Bank',
  'Wireless Earbuds',
  '4K Monitor',
  'Webcam HD',
  'Gaming Mouse Pad',
  'USB Flash Drive 128GB',
  'Wireless Charger',
  'Bluetooth Speaker',
  'HDMI Cable',
  'Gaming Headset',
  'External Hard Drive',
  'Smartphone Gimbal',
  'Ring Light',
  'Microphone USB',
  'Monitor Arm',
  'USB-C Cable',
  'Wireless Keyboard',
  'Smart Light Bulb',
  'Security Camera',
  'Smart Doorbell',
  'Fitness Tracker',
  'Action Camera',
  'Drone Mini',
  'VR Headset',
  'Projector Mini',
  'Smart Thermostat',
  'Robot Vacuum',
  'Air Purifier',
  'Smart Lock',
  'Coffee Maker Smart',
  'Dash Cam',
  'Bluetooth Car Adapter'
);

UPDATE products SET category = 'Accessories' WHERE name IN (
  'Laptop Stand',
  'Desk Lamp',
  'Cable Organizer',
  'Tablet Stand',
  'Phone Case',
  'Screen Protector',
  'Laptop Sleeve',
  'Phone Mount',
  'Car Phone Holder'
);

UPDATE products SET category = 'Home & Living' WHERE name IN (
  'Desk Mat',
  'Electric Toothbrush',
  'Hair Dryer Professional',
  'Massage Gun',
  'Yoga Mat',
  'Resistance Bands',
  'Dumbbells Adjustable'
);

UPDATE products SET category = 'Fashion & Lifestyle' WHERE name IN (
  'Running Shoes',
  'Backpack Laptop',
  'Sunglasses',
  'Watch Classic',
  'Wallet RFID',
  'Water Bottle',
  'Travel Pillow',
  'Luggage Set'
);

-- Set default category for any remaining products
UPDATE products SET category = 'Electronics' WHERE category IS NULL;

