-- Order Tracking System Migration
-- Run this in your Supabase SQL Editor to add order tracking

-- Step 1: Drop the old status constraint
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

-- Step 2: Add new status constraint with tracking stages
ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));

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
COMMENT ON COLUMN orders.status IS 'Order status: pending (payment initiated), processing (payment confirmed), shipped (order dispatched), delivered (order received), cancelled (order cancelled)';

-- ========================================
-- HOW TO UPDATE ORDER STATUS AS ADMIN
-- ========================================

-- Example 1: Mark order as shipped
-- UPDATE orders 
-- SET status = 'shipped', tracking_number = 'TRACK123456'
-- WHERE id = 'order-uuid-here';

-- Example 2: Mark order as delivered
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

