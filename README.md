# Ecommerce Start

A modern e-commerce website built with Next.js, Supabase, and Stripe.

## Features

- 🔐 **Authentication**: Email/password and Google OAuth via Supabase
- 🛒 **Shopping Cart**: Protected cart functionality (sign-in required)
- 💳 **Payment Processing**: Stripe integration for secure payments
- 📦 **Order Management**: View and track your orders
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Payments**: Stripe
- **Deployment**: Vercel (recommended)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `supabase-schema.sql` to create all necessary tables and policies

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://eqqcidlflclgegsalbub.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcWNpZGxmbGNsZ2Vnc2FsYnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjIyNTQsImV4cCI6MjA3ODc5ODI1NH0.OA_Q1nDFzNjETg5765s35BPeWMe0Gut59g4pbSb4SKo
STRIPE_SECRET_KEY=your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
```

### 4. Set Up Google OAuth (Optional but Recommended)

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Add your Google OAuth credentials (Client ID and Client Secret)
5. Add authorized redirect URLs:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://yourdomain.com/auth/callback` (for production)

### 5. Set Up Stripe

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add them to your `.env.local` file
4. Set up a webhook endpoint:
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhook`
   - Select events: `checkout.session.completed`
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `.env.local`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── checkout/      # Stripe checkout endpoint
│   │   └── webhook/       # Stripe webhook handler
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout pages
│   ├── orders/            # Orders page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── AuthProvider.tsx   # Auth context provider
│   ├── Navbar.tsx         # Navigation bar
│   ├── ProductCard.tsx    # Product card component
│   └── ProductGrid.tsx    # Product grid component
├── lib/                   # Utility libraries
│   ├── supabase/          # Supabase clients
│   └── stripe.ts          # Stripe client
├── types/                 # TypeScript types
└── supabase-schema.sql    # Database schema
```

## Database Schema

The application uses the following tables:

- **products**: Store product information
- **cart_items**: User shopping cart items
- **orders**: Customer orders
- **order_items**: Items within each order

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Features in Detail

### Authentication
- Email/password authentication
- Google OAuth authentication
- Protected routes (cart, checkout, orders)

### Shopping Cart
- Add products to cart (requires sign-in)
- Update quantities
- Remove items
- View cart total

### Checkout
- Secure payment processing via Stripe
- Order creation after successful payment
- Automatic cart clearing after checkout

### Orders
- View order history
- Track order status
- View order details

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

### Important Notes for Production

1. Update `NEXT_PUBLIC_APP_URL` to your production domain
2. Update Stripe webhook URL to your production domain
3. Update Google OAuth redirect URLs in Supabase
4. Ensure all environment variables are set in your hosting platform

## Security Notes

- Never commit `.env.local` to version control
- Use environment variables for all sensitive data
- Row Level Security (RLS) is enabled on all tables
- Stripe webhooks are verified using signature checking

## Support

For issues or questions, please check:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

