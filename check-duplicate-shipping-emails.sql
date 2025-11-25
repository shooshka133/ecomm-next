-- Investigation: Check for duplicate shipping emails
-- Run these queries in Supabase SQL Editor

-- 1. Find all shipped orders for a specific user (replace 'USER_ID_HERE' with your user ID)
-- This shows if there are multiple orders
SELECT 
  id as order_id,
  status,
  shipped_at,
  tracking_number,
  total,
  created_at,
  stripe_payment_intent_id
FROM orders 
WHERE user_id = 'USER_ID_HERE'  -- Replace with your user ID
  AND status = 'shipped'
ORDER BY shipped_at DESC;

-- 2. Count how many orders were shipped recently (last 24 hours)
SELECT 
  COUNT(*) as total_shipped_orders,
  COUNT(DISTINCT user_id) as unique_users
FROM orders 
WHERE status = 'shipped'
  AND shipped_at >= NOW() - INTERVAL '24 hours';

-- 3. Check order items for shipped orders (to see if items are in one order or split)
-- Replace 'USER_ID_HERE' with your user ID
SELECT 
  o.id as order_id,
  o.status,
  o.shipped_at,
  o.tracking_number,
  oi.product_id,
  p.name as product_name,
  oi.quantity,
  oi.price as item_price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.user_id = 'USER_ID_HERE'  -- Replace with your user ID
  AND o.status = 'shipped'
ORDER BY o.shipped_at DESC, o.id, oi.product_id;

-- 4. Group by order to see items per order
-- Replace 'USER_ID_HERE' with your user ID
SELECT 
  o.id as order_id,
  o.shipped_at,
  o.tracking_number,
  COUNT(oi.id) as item_count,
  STRING_AGG(p.name, ', ') as product_names
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.user_id = 'USER_ID_HERE'  -- Replace with your user ID
  AND o.status = 'shipped'
GROUP BY o.id, o.shipped_at, o.tracking_number
ORDER BY o.shipped_at DESC;

-- 5. Find orders with same tracking number (might indicate split orders)
SELECT 
  tracking_number,
  COUNT(*) as order_count,
  STRING_AGG(id::text, ', ') as order_ids,
  STRING_AGG(user_id::text, ', ') as user_ids
FROM orders
WHERE status = 'shipped'
  AND tracking_number IS NOT NULL
GROUP BY tracking_number
HAVING COUNT(*) > 1;

-- 6. Find orders shipped at the same time (within 1 minute)
-- Replace 'USER_ID_HERE' with your user ID
SELECT 
  DATE_TRUNC('minute', shipped_at) as shipped_minute,
  COUNT(*) as orders_in_same_minute,
  STRING_AGG(id::text, ', ') as order_ids
FROM orders
WHERE user_id = 'USER_ID_HERE'  -- Replace with your user ID
  AND status = 'shipped'
  AND shipped_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('minute', shipped_at)
HAVING COUNT(*) > 1
ORDER BY shipped_minute DESC;

