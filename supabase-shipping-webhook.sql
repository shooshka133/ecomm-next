-- Supabase Database Webhook for Automatic Shipping Emails
-- This triggers a webhook when an order status changes to 'shipped'

-- Step 1: Create a function that will be called by the trigger
CREATE OR REPLACE FUNCTION notify_order_shipped()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if status changed TO 'shipped' (not already shipped)
  IF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
    -- Call the webhook endpoint
    PERFORM
      net.http_post(
        url := current_setting('app.settings.webhook_url') || '/api/send-shipping-email',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := json_build_object('orderId', NEW.id)::text
      );
    
    RAISE NOTICE 'Shipping email webhook triggered for order: %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger
DROP TRIGGER IF EXISTS order_shipped_webhook ON orders;
CREATE TRIGGER order_shipped_webhook
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'shipped' AND OLD.status IS DISTINCT FROM 'shipped')
  EXECUTE FUNCTION notify_order_shipped();

-- Step 3: Set the webhook URL (replace with your actual URL)
-- For production: https://shooshka.online
-- For localhost: http://localhost:3000
ALTER DATABASE postgres SET app.settings.webhook_url = 'https://shooshka.online';

-- ========================================
-- HOW IT WORKS
-- ========================================
-- 
-- 1. You change order status to 'shipped' in Supabase Table Editor
-- 2. The trigger automatically fires
-- 3. It calls your /api/send-shipping-email endpoint
-- 4. The shipping notification email is sent!
-- 
-- ========================================
-- IMPORTANT NOTES
-- ========================================
-- 
-- This requires the 'pg_net' extension to be enabled.
-- Enable it by running: CREATE EXTENSION IF NOT EXISTS pg_net;
-- 
-- If pg_net is not available, you'll need to manually call
-- the API endpoint after changing order status:
-- https://shooshka.online/api/send-all-shipping-emails

