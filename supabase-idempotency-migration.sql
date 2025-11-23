-- ============================================================================
-- Idempotency & Email Tracking Migration
-- ============================================================================
-- This migration adds:
-- 1. UNIQUE constraint on stripe_payment_intent_id (prevents duplicate orders)
-- 2. Email tracking flags (prevents duplicate emails)
-- 3. Indexes for performance
-- 4. Processed webhook events table (for Stripe idempotency)
--
-- Run this in your Supabase SQL Editor
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Add UNIQUE constraint on stripe_payment_intent_id
-- ============================================================================
-- This prevents duplicate orders at the database level
-- Even if code has race conditions, database enforces uniqueness

DO $$ 
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_stripe_payment_intent_id'
  ) THEN
    -- Add unique constraint (allows NULL values, but only one NULL)
    ALTER TABLE orders 
    ADD CONSTRAINT unique_stripe_payment_intent_id 
    UNIQUE (stripe_payment_intent_id);
    
    RAISE NOTICE 'Added UNIQUE constraint on stripe_payment_intent_id';
  ELSE
    RAISE NOTICE 'UNIQUE constraint on stripe_payment_intent_id already exists';
  END IF;
END $$;

-- ============================================================================
-- 2. Add email tracking flags to orders table
-- ============================================================================
-- These flags track which emails have been sent for each order
-- Prevents duplicate emails on webhook retries or manual triggers

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS confirmation_email_sent BOOLEAN DEFAULT FALSE NOT NULL;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_email_sent BOOLEAN DEFAULT FALSE NOT NULL;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_email_sent BOOLEAN DEFAULT FALSE NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN orders.confirmation_email_sent IS 'Tracks if order confirmation email has been sent. Prevents duplicates.';
COMMENT ON COLUMN orders.shipping_email_sent IS 'Tracks if shipping notification email has been sent. Prevents duplicates.';
COMMENT ON COLUMN orders.delivery_email_sent IS 'Tracks if delivery notification email has been sent. Prevents duplicates.';

-- ============================================================================
-- 3. Create table for processed Stripe webhook events
-- ============================================================================
-- This table stores processed webhook event IDs for idempotency
-- Prevents processing the same Stripe event twice

CREATE TABLE IF NOT EXISTS processed_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_processed_webhook_events_stripe_event_id 
ON processed_webhook_events(stripe_event_id);

CREATE INDEX IF NOT EXISTS idx_processed_webhook_events_order_id 
ON processed_webhook_events(order_id);

-- RLS policy (only service role can access)
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;

-- Allow service role to access (webhook uses service role)
CREATE POLICY "Service role can manage webhook events" 
ON processed_webhook_events 
FOR ALL 
USING (true)
WITH CHECK (true);

COMMENT ON TABLE processed_webhook_events IS 'Tracks processed Stripe webhook events for idempotency. Prevents duplicate processing.';

-- ============================================================================
-- 4. Add composite indexes for common query patterns
-- ============================================================================
-- These indexes optimize frequently used queries

-- User order history (orders page)
CREATE INDEX IF NOT EXISTS idx_orders_user_status_created 
ON orders(user_id, status, created_at DESC);

-- Order items lookup
CREATE INDEX IF NOT EXISTS idx_order_items_order_product 
ON order_items(order_id, product_id);

-- Cart queries
CREATE INDEX IF NOT EXISTS idx_cart_items_user_created 
ON cart_items(user_id, created_at DESC);

-- Email tracking queries
CREATE INDEX IF NOT EXISTS idx_orders_email_flags 
ON orders(confirmation_email_sent, shipping_email_sent, delivery_email_sent) 
WHERE confirmation_email_sent = FALSE OR shipping_email_sent = FALSE OR delivery_email_sent = FALSE;

-- ============================================================================
-- 5. Create function to safely update email flags
-- ============================================================================
-- This function atomically updates email flags
-- Prevents race conditions when multiple processes try to send emails

CREATE OR REPLACE FUNCTION mark_email_sent(
  p_order_id UUID,
  p_email_type TEXT -- 'confirmation', 'shipping', 'delivery'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_flag BOOLEAN;
  v_flag_column TEXT;
BEGIN
  -- Determine which flag to update
  CASE p_email_type
    WHEN 'confirmation' THEN v_flag_column := 'confirmation_email_sent';
    WHEN 'shipping' THEN v_flag_column := 'shipping_email_sent';
    WHEN 'delivery' THEN v_flag_column := 'delivery_email_sent';
    ELSE
      RAISE EXCEPTION 'Invalid email type: %. Must be confirmation, shipping, or delivery', p_email_type;
  END CASE;

  -- Check current flag value
  EXECUTE format('SELECT %I FROM orders WHERE id = $1', v_flag_column)
  INTO v_current_flag
  USING p_order_id;

  -- If already sent, return false (idempotent - already processed)
  IF v_current_flag = TRUE THEN
    RETURN FALSE;
  END IF;

  -- Update flag atomically
  EXECUTE format('UPDATE orders SET %I = TRUE, updated_at = NOW() WHERE id = $1', v_flag_column)
  USING p_order_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_email_sent IS 'Atomically marks an email as sent for an order. Returns TRUE if updated, FALSE if already sent (idempotent).';

-- ============================================================================
-- 6. Update existing orders to have email flags set to FALSE
-- ============================================================================
-- This ensures all existing orders have the new columns with correct defaults
-- If emails were already sent, you may want to manually update these

-- No action needed - columns default to FALSE which is correct
-- If you want to mark existing orders as having emails sent, run:
-- UPDATE orders SET confirmation_email_sent = TRUE WHERE created_at < NOW();

-- ============================================================================
-- 7. Create helper function to check if webhook event was processed
-- ============================================================================

CREATE OR REPLACE FUNCTION is_webhook_event_processed(p_stripe_event_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM processed_webhook_events 
    WHERE stripe_event_id = p_stripe_event_id
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_webhook_event_processed IS 'Checks if a Stripe webhook event has already been processed. Returns TRUE if processed, FALSE otherwise.';

-- ============================================================================
-- 8. Create helper function to mark webhook event as processed
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_webhook_event_processed(
  p_stripe_event_id TEXT,
  p_event_type TEXT,
  p_order_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO processed_webhook_events (
    stripe_event_id,
    event_type,
    order_id,
    metadata
  ) VALUES (
    p_stripe_event_id,
    p_event_type,
    p_order_id,
    p_metadata
  )
  ON CONFLICT (stripe_event_id) DO NOTHING
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_webhook_event_processed IS 'Marks a Stripe webhook event as processed. Returns the record ID if inserted, NULL if already exists (idempotent).';

-- ============================================================================
-- Migration Complete
-- ============================================================================

COMMIT;

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Run these to verify the migration:

-- Check UNIQUE constraint exists
-- SELECT conname, contype 
-- FROM pg_constraint 
-- WHERE conrelid = 'orders'::regclass 
-- AND conname = 'unique_stripe_payment_intent_id';

-- Check email flags exist
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'orders'
-- AND column_name IN ('confirmation_email_sent', 'shipping_email_sent', 'delivery_email_sent');

-- Check processed_webhook_events table exists
-- SELECT * FROM information_schema.tables WHERE table_name = 'processed_webhook_events';

-- Check indexes exist
-- SELECT indexname FROM pg_indexes WHERE tablename = 'orders' AND indexname LIKE 'idx_orders%';

-- ============================================================================
-- Rollback (if needed)
-- ============================================================================
-- If you need to rollback this migration:

-- BEGIN;
-- ALTER TABLE orders DROP CONSTRAINT IF EXISTS unique_stripe_payment_intent_id;
-- ALTER TABLE orders DROP COLUMN IF EXISTS confirmation_email_sent;
-- ALTER TABLE orders DROP COLUMN IF EXISTS shipping_email_sent;
-- ALTER TABLE orders DROP COLUMN IF EXISTS delivery_email_sent;
-- DROP TABLE IF EXISTS processed_webhook_events CASCADE;
-- DROP FUNCTION IF EXISTS mark_email_sent(UUID, TEXT);
-- DROP FUNCTION IF EXISTS is_webhook_event_processed(TEXT);
-- DROP FUNCTION IF EXISTS mark_webhook_event_processed(TEXT, TEXT, UUID, JSONB);
-- DROP INDEX IF EXISTS idx_orders_user_status_created;
-- DROP INDEX IF EXISTS idx_order_items_order_product;
-- DROP INDEX IF EXISTS idx_cart_items_user_created;
-- DROP INDEX IF EXISTS idx_orders_email_flags;
-- COMMIT;

