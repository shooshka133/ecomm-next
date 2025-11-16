-- Fix duplicate orders by adding unique constraint
-- Run this in your Supabase SQL Editor

-- Add unique constraint to prevent duplicate orders for the same session
ALTER TABLE orders 
ADD CONSTRAINT unique_stripe_payment_intent_id 
UNIQUE (stripe_payment_intent_id);

-- If you already have duplicate orders, you can clean them up with:
-- (Run this only if you want to delete duplicates, keeping the first one)
-- DELETE FROM orders
-- WHERE id NOT IN (
--   SELECT MIN(id)
--   FROM orders
--   GROUP BY stripe_payment_intent_id
--   HAVING COUNT(*) > 1
-- );

