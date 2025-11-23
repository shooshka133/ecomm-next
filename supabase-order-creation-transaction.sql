-- ============================================================================
-- Transactional Order Creation Function
-- ============================================================================
-- This function creates an order atomically using PostgreSQL transactions.
-- All operations (order, order_items, cart clearing, wishlist removal) 
-- happen in a single transaction - if any step fails, everything rolls back.
--
-- Run this in your Supabase SQL Editor AFTER running supabase-idempotency-migration.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- Function: create_order_from_cart_transaction
-- ============================================================================
-- Creates an order with all related operations in a single transaction
--
-- Parameters:
--   p_user_id: UUID of the user
--   p_session_id: Stripe checkout session ID (for idempotency)
--   p_total: Total order amount
--   p_order_items: JSONB array of order items with product_id, quantity, price
--
-- Returns:
--   JSONB with success status, order_id, and was_duplicate flag
-- ============================================================================

CREATE OR REPLACE FUNCTION create_order_from_cart_transaction(
  p_user_id UUID,
  p_session_id TEXT,
  p_total DECIMAL(10, 2),
  p_order_items JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_existing_order_id UUID;
  v_item JSONB;
  v_result JSONB;
BEGIN
  -- Step 1: Check if order already exists (idempotency)
  SELECT id INTO v_existing_order_id
  FROM orders
  WHERE stripe_payment_intent_id = p_session_id
  LIMIT 1;

  IF v_existing_order_id IS NOT NULL THEN
    -- Order already exists, return it
    RETURN jsonb_build_object(
      'success', true,
      'order_id', v_existing_order_id,
      'was_duplicate', true
    );
  END IF;

  -- Step 2: Validate inputs
  IF p_user_id IS NULL OR p_session_id IS NULL OR p_total IS NULL OR p_total <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid input parameters'
    );
  END IF;

  IF p_order_items IS NULL OR jsonb_array_length(p_order_items) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order items cannot be empty'
    );
  END IF;

  -- Step 3: Begin transaction (implicit in function)
  -- Create order
  INSERT INTO orders (
    user_id,
    total,
    status,
    stripe_payment_intent_id,
    confirmation_email_sent
  ) VALUES (
    p_user_id,
    p_total,
    'processing',
    p_session_id,
    FALSE
  )
  RETURNING id INTO v_order_id;

  -- Step 4: Create order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_order_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      product_id,
      quantity,
      price
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price')::DECIMAL(10, 2)
    );
  END LOOP;

  -- Step 5: Clear cart (delete all cart items for this user)
  DELETE FROM cart_items
  WHERE user_id = p_user_id;

  -- Step 6: Remove purchased items from wishlist
  DELETE FROM wishlist
  WHERE user_id = p_user_id
  AND product_id IN (
    SELECT (value->>'product_id')::UUID
    FROM jsonb_array_elements(p_order_items)
  );

  -- Step 7: Return success
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'was_duplicate', false
  );

EXCEPTION
  WHEN unique_violation THEN
    -- Race condition: order was created by another process
    SELECT id INTO v_existing_order_id
    FROM orders
    WHERE stripe_payment_intent_id = p_session_id
    LIMIT 1;

    IF v_existing_order_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'success', true,
        'order_id', v_existing_order_id,
        'was_duplicate', true
      );
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Unique constraint violation but order not found'
      );
    END IF;

  WHEN OTHERS THEN
    -- Rollback is automatic in case of exception
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_order_from_cart_transaction IS 'Creates an order atomically with all related operations in a single transaction. Returns JSONB with success status and order_id.';

-- ============================================================================
-- Grant execute permission to service role (for webhook)
-- ============================================================================
-- The function will be called by the service role key, which bypasses RLS
-- No explicit grant needed as functions run with definer privileges

COMMIT;

-- ============================================================================
-- Verification
-- ============================================================================
-- Test the function (example):
-- 
-- SELECT create_order_from_cart_transaction(
--   'user-uuid-here'::UUID,
--   'stripe-session-id-here',
--   99.99,
--   '[
--     {"product_id": "product-uuid-1", "quantity": 2, "price": 49.99},
--     {"product_id": "product-uuid-2", "quantity": 1, "price": 29.99}
--   ]'::JSONB
-- );
-- ============================================================================

