# Webhook Setup Guide

## Important: Service Role Key

The webhook needs to use the Supabase **Service Role Key** (not the anon key) to bypass Row Level Security (RLS) and create orders.

### Steps:

1. **Get your Service Role Key:**
   - Go to Supabase Dashboard: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub
   - Navigate to **Settings** > **API**
   - Copy the **service_role** key (NOT the anon key - this is secret!)

2. **Add to Environment Variables:**
   Add this to your `.env.local` file:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

   **⚠️ WARNING:** Never commit the service role key to version control! It has admin access to your database.

3. **For Production (Vercel/Netlify):**
   - Add `SUPABASE_SERVICE_ROLE_KEY` to your hosting platform's environment variables
   - Make sure it's marked as a secret/encrypted variable

## Webhook Endpoint Setup

1. **In Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/test/webhooks (or https://dashboard.stripe.com/webhooks for production)
   - Click **Add endpoint**
   - Endpoint URL: `https://yourdomain.com/api/webhook`
   - For local testing, use: `https://your-ngrok-url.ngrok.io/api/webhook` (or similar tunnel)
   - Select event: `checkout.session.completed`
   - Copy the **Signing secret** and add to `.env.local`:
     ```env
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```

2. **Test the Webhook:**
   - Make a test purchase
   - Check Stripe Dashboard > Webhooks > Your endpoint > Recent events
   - Should see successful `checkout.session.completed` event
   - Check your Supabase database - order should be created and cart should be cleared

## Troubleshooting

### Orders not being created:
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check webhook logs in Stripe Dashboard
- Check server logs for errors
- Verify the user_id is being passed in checkout session metadata

### Cart not clearing:
- Webhook might be failing silently
- Check webhook response in Stripe Dashboard
- Verify the service role key has proper permissions

### Webhook not receiving events:
- Verify the webhook URL is correct
- Check that the signing secret matches
- Ensure the endpoint is publicly accessible (not localhost)

