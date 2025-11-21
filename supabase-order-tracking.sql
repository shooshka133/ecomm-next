-- Order Tracking System Migration
-- Run this in your Supabase SQL Editor to add order tracking

-- Step 1: Create enum type for order status (dropdown in Supabase!)
DO $$ 
BEGIN
    -- Drop the type if it exists (for re-running)
    DROP TYPE IF EXISTS order_status_enum CASCADE;
    
    -- Create the enum type
    CREATE TYPE order_status_enum AS ENUM (
        'pending', 
        'processing', 
        'shipped', 
        'delivered', 
        'cancelled'
    );
END $$;

-- Step 2: Drop the old status constraint
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

-- Step 3: Change status column to use enum type
DO $$ 
BEGIN
  -- Check if status column exists and has data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'status'
  ) THEN
    -- Update any existing data to valid enum values
    UPDATE orders 
    SET status = 'processing' 
    WHERE status NOT IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
    
    -- Drop the existing default value
    ALTER TABLE orders ALTER COLUMN status DROP DEFAULT;
    
    -- Alter the column to use the enum type
    ALTER TABLE orders 
    ALTER COLUMN status TYPE order_status_enum 
    USING status::order_status_enum;
    
    -- Set new default value
    ALTER TABLE orders 
    ALTER COLUMN status SET DEFAULT 'processing'::order_status_enum;
  ELSE
    -- Column doesn't exist, create it with enum type
    ALTER TABLE orders 
    ADD COLUMN status order_status_enum DEFAULT 'processing'::order_status_enum NOT NULL;
  END IF;
END $$;

-- Step 3: Add estimated delivery date (optional but useful)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP WITH TIME ZONE;

-- Step 4: Add shipped_at and delivered_at timestamps
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Step 5: Add tracking number (optional for future use)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- Step 5b: Create sequence for tracking numbers
CREATE SEQUENCE IF NOT EXISTS tracking_number_seq START 10000;

-- Step 5c: Create function to generate tracking numbers
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TEXT AS $$
DECLARE
  seq_val INTEGER;
  date_part TEXT;
  random_part TEXT;
BEGIN
  -- Get next sequence value
  seq_val := nextval('tracking_number_seq');
  
  -- Format: TRK-YYYYMMDD-XXXXX
  -- Example: TRK-20240115-10523
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Return formatted tracking number
  RETURN 'TRK-' || date_part || '-' || LPAD(seq_val::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);

-- Step 7: Create a function to update order status with timestamps
CREATE OR REPLACE FUNCTION update_order_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update updated_at timestamp
  NEW.updated_at = NOW();
  
  -- Set shipped_at when status changes to 'shipped'
  IF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
    NEW.shipped_at = NOW();
    
    -- Auto-generate tracking number if not already set
    -- This allows manual carrier tracking numbers to be preserved
    IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
      NEW.tracking_number = generate_tracking_number();
    END IF;
  END IF;
  
  -- Set delivered_at when status changes to 'delivered'
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.delivered_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_order_status_trigger ON orders;
CREATE TRIGGER update_order_status_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_status();

-- Step 9: Add comment for admin reference
COMMENT ON COLUMN orders.status IS 'Order status (DROPDOWN): pending, processing, shipped, delivered, cancelled';

-- ========================================
-- HOW TO UPDATE ORDER STATUS AS ADMIN
-- ========================================

-- ✅ IN SUPABASE TABLE EDITOR (EASIEST):
-- 1. Go to Supabase Dashboard → Table Editor → "orders"
-- 2. Click on the "status" cell
-- 3. Select from dropdown: pending, processing, shipped, delivered, or cancelled
-- 4. Done! Status updates automatically with timestamps!
--
-- 🎯 AUTO-GENERATED TRACKING NUMBERS:
-- When you mark order as "shipped", a tracking number is automatically generated!
-- Format: TRK-YYYYMMDD-XXXXX (e.g., TRK-20240115-10523)
--
-- You can:
-- ✅ Use auto-generated number for internal tracking
-- ✅ Replace with real carrier tracking (USPS, FedEx, etc.) anytime
-- ✅ Leave empty when shipping, it auto-generates
-- ✅ Integrate with shipping APIs in the future

-- 📝 VIA SQL (ADVANCED):

-- Example 1: Mark order as shipped (tracking number auto-generates!)
-- UPDATE orders 
-- SET status = 'shipped'
-- WHERE id = 'order-uuid-here';
-- Result: tracking_number automatically set to TRK-20240115-10523

-- Example 2: Mark order as shipped with custom carrier tracking
-- UPDATE orders 
-- SET status = 'shipped', tracking_number = 'USPS9400111899563892621895'
-- WHERE id = 'order-uuid-here';
-- Result: Uses your carrier tracking number instead of auto-generated

-- Example 3: Mark order as delivered
-- UPDATE orders 
-- SET status = 'delivered'
-- WHERE id = 'order-uuid-here';

-- Example 3: View all orders pending shipment
-- SELECT id, user_id, total, status, created_at 
-- FROM orders 
-- WHERE status = 'processing' 
-- ORDER BY created_at ASC;

-- Example 4: View order with user email
-- SELECT 
--   o.id,
--   o.status,
--   o.total,
--   o.created_at,
--   o.tracking_number,
--   u.email as customer_email
-- FROM orders o
-- JOIN auth.users u ON o.user_id = u.id
-- WHERE o.status IN ('processing', 'shipped')
-- ORDER BY o.created_at DESC;

-- ========================================
-- VERIFICATION
-- ========================================

-- Check the new constraint is in place
-- SELECT constraint_name, check_clause 
-- FROM information_schema.check_constraints 
-- WHERE constraint_name = 'orders_status_check';

-- View table structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'orders'
-- ORDER BY ordinal_position;

