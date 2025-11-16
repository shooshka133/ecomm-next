# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Environment File

Create a `.env.local` file in the root directory with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://eqqcidlflclgegsalbub.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcWNpZGxmbGNsZ2Vnc2FsYnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjIyNTQsImV4cCI6MjA3ODc5ODI1NH0.OA_Q1nDFzNjETg5765s35BPeWMe0Gut59g4pbSb4SKo
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Important**: Replace the Stripe keys with your actual Stripe API keys from your Stripe dashboard.

## Step 3: Set Up Supabase Database

1. Go to your Supabase project: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **Run** to execute the SQL script

This will create:
- Products table
- Cart items table
- Orders table
- Order items table
- Row Level Security policies
- Sample products

## Step 4: Enable Google OAuth (Optional)

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - Get Client ID and Secret from [Google Cloud Console](https://console.cloud.google.com/)
   - Add authorized redirect URL: `http://localhost:3000/auth/callback`
4. Save the changes

## Step 5: Set Up Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. Set endpoint URL to: `http://localhost:3000/api/webhook` (for local testing)
4. Select event: `checkout.session.completed`
5. Copy the **Signing secret** and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`

**For Production**: Update the webhook URL to your production domain.

## Step 6: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing the Application

1. **Sign Up/Sign In**: Go to `/auth` and create an account or sign in with Google
2. **Browse Products**: View products on the home page
3. **Add to Cart**: Click "Add to Cart" on any product (requires sign-in)
4. **View Cart**: Go to `/cart` to see your items
5. **Checkout**: Click "Proceed to Checkout" and complete payment with Stripe test card: `4242 4242 4242 4242`
6. **View Orders**: After successful payment, view your orders at `/orders`

## Stripe Test Cards

Use these test card numbers for testing:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Use any future expiry date, any CVC, and any ZIP code

## Troubleshooting

### Authentication not working
- Check that your Supabase URL and anon key are correct in `.env.local`
- Verify Google OAuth is properly configured in Supabase dashboard

### Cart not working
- Make sure you're signed in
- Check browser console for errors
- Verify database tables were created correctly

### Stripe payment not working
- Verify Stripe keys are correct
- Check that webhook endpoint is configured
- Use test mode keys (starting with `sk_test_` and `pk_test_`)

### Database errors
- Run the `supabase-schema.sql` script again
- Check that Row Level Security policies are enabled
- Verify user is authenticated before accessing protected data

