# Complete Architecture & Flow Documentation

## Table of Contents
1. [System Architecture Diagrams](#system-architecture-diagrams)
2. [Complete Flow Diagrams](#complete-flow-diagrams)
3. [Step-by-Step Process Explanations](#step-by-step-process-explanations)
4. [Technical Glossary](#technical-glossary)
5. [Learning Roadmap](#learning-roadmap)

---

# System Architecture Diagrams

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js Client Components                    │  │
│  │  - app/page.tsx (Homepage)                                │  │
│  │  - app/cart/page.tsx                                      │  │
│  │  - app/checkout/page.tsx                                  │  │
│  │  - app/orders/page.tsx                                    │  │
│  │  - app/admin/page.tsx                                     │  │
│  │  - components/* (Reusable UI)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↕ HTTP/HTTPS                           │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL SERVERLESS                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Next.js Server Components & API Routes           │  │
│  │  - app/layout.tsx (Server Component)                     │  │
│  │  - middleware.ts (Route Protection)                     │  │
│  │  - app/api/checkout/route.ts                            │  │
│  │  - app/api/webhook/route.ts                             │  │
│  │  - app/api/admin/*/route.ts                             │  │
│  │  - app/api/send-*-email/route.ts                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         ↕                    ↕                    ↕
    ┌─────────┐         ┌──────────┐         ┌──────────┐
    │ SUPABASE│         │  STRIPE  │         │  RESEND  │
    │         │         │          │         │          │
    │ - Auth  │         │ - Payment│         │ - Emails │
    │ - DB    │         │ - Webhook│         │          │
    │ - RLS   │         │          │         │          │
    └─────────┘         └──────────┘         └──────────┘
```

## Data Flow Architecture

```
┌──────────────┐
│   Browser    │
│  (Client)    │
└──────┬───────┘
       │
       │ 1. User Action (click, submit)
       ↓
┌─────────────────────────────────────┐
│   Next.js Middleware                │
│   - Check auth cookie               │
│   - Redirect if not authenticated   │
└──────┬──────────────────────────────┘
       │
       │ 2. Route to Component/API
       ↓
┌─────────────────────────────────────┐
│   Client Component                  │
│   - useState (local state)          │
│   - useEffect (side effects)        │
│   - useAuth (global auth state)    │
└──────┬──────────────────────────────┘
       │
       │ 3. Data Fetch/Mutation
       ↓
┌─────────────────────────────────────┐
│   Supabase Client                   │
│   - createSupabaseClient()          │
│   - Handles cookies automatically   │
└──────┬──────────────────────────────┘
       │
       │ 4. HTTP Request
       ↓
┌─────────────────────────────────────┐
│   Supabase API                      │
│   - PostgreSQL Database             │
│   - Row Level Security (RLS)        │
│   - Returns filtered data           │
└──────┬──────────────────────────────┘
       │
       │ 5. Response
       ↓
┌─────────────────────────────────────┐
│   Component Updates                 │
│   - setState()                      │
│   - Re-render UI                    │
└─────────────────────────────────────┘
```

## Authentication Flow Architecture

```
┌──────────────┐
│   User       │
│  (Browser)   │
└──────┬───────┘
       │
       │ 1. Visit /cart (protected)
       ↓
┌─────────────────────────────────────┐
│   middleware.ts                    │
│   - Check for auth cookie          │
│   - Cookie pattern: sb-*-auth-token│
└──────┬──────────────────────────────┘
       │
       │ 2. No cookie found
       ↓
┌─────────────────────────────────────┐
│   Redirect to /auth                 │
│   ?next=/cart (preserve destination)│
└──────┬──────────────────────────────┘
       │
       │ 3. User clicks "Sign in with Google"
       ↓
┌─────────────────────────────────────┐
│   lib/auth/google.ts                │
│   - signInWithGoogle()              │
│   - Build callback URL              │
│   - Call supabase.auth.signInWithOAuth()│
└──────┬──────────────────────────────┘
       │
       │ 4. Redirect to Google
       ↓
┌─────────────────────────────────────┐
│   Google OAuth                      │
│   - User signs in                   │
│   - Google redirects to Supabase    │
└──────┬──────────────────────────────┘
       │
       │ 5. Supabase processes OAuth
       ↓
┌─────────────────────────────────────┐
│   Supabase Auth                     │
│   - Exchanges code with Google      │
│   - Creates session                 │
│   - Redirects to /auth/callback     │
└──────┬──────────────────────────────┘
       │
       │ 6. Callback with code
       ↓
┌─────────────────────────────────────┐
│   app/auth/callback/route.ts        │
│   - Exchange code for session       │
│   - Set session in cookies          │
│   - Redirect to /cart (from ?next) │
└──────┬──────────────────────────────┘
       │
       │ 7. User lands on /cart
       ↓
┌─────────────────────────────────────┐
│   app/cart/page.tsx                 │
│   - useAuth() gets user             │
│   - Load cart items                 │
└─────────────────────────────────────┘
```

## Checkout Flow Architecture

```
┌──────────────┐
│   User       │
│  (Cart Page) │
└──────┬───────┘
       │
       │ 1. Click "Proceed to Checkout"
       ↓
┌─────────────────────────────────────┐
│   app/checkout/page.tsx             │
│   - Load cart items                 │
│   - Load/select shipping address    │
│   - Calculate total                  │
└──────┬──────────────────────────────┘
       │
       │ 2. Click "Pay Now"
       ↓
┌─────────────────────────────────────┐
│   POST /api/checkout                │
│   - Verify user authenticated       │
│   - Validate cart items              │
│   - Create Stripe checkout session   │
└──────┬──────────────────────────────┘
       │
       │ 3. Return sessionId
       ↓
┌─────────────────────────────────────┐
│   app/checkout/page.tsx             │
│   - stripe.redirectToCheckout()     │
└──────┬──────────────────────────────┘
       │
       │ 4. Redirect to Stripe
       ↓
┌─────────────────────────────────────┐
│   Stripe Checkout                   │
│   - User enters payment info        │
│   - User completes payment          │
└──────┬──────────────────────────────┘
       │
       │ 5a. Payment succeeds → Redirect
       │ 5b. Stripe sends webhook
       ↓                    ↓
┌──────────────┐    ┌──────────────────┐
│ /checkout/   │    │ POST /api/webhook│
│ success      │    │ - Verify sig     │
│              │    │ - Create order   │
│              │    │ - Clear cart     │
│              │    │ - Send email     │
└──────┬───────┘    └──────────────────┘
       │                    │
       │                    │
       └────────┬───────────┘
                │
                │ 6. Order created
                ↓
        ┌───────────────┐
        │   Database    │
        │   - orders    │
        │   - order_items│
        └───────────────┘
```

## Webhook vs Success Page Race Condition

```
TIME →
│
│ User completes payment on Stripe
│
├─→ Stripe sends webhook ──────────────┐
│   (async, may be delayed)            │
│                                       │
└─→ User redirected to /checkout/success│
    (immediate)                         │
                                        │
    ┌───────────────────────────────────┘
    │
    │ Both try to create order:
    │
    ├─→ Webhook: Check for existing order
    │   ├─→ If exists: Return success (idempotent)
    │   └─→ If not: Create order
    │
    └─→ Success Page: Wait 3 seconds
        ├─→ Check for order
        ├─→ If exists: Skip creation (webhook worked)
        └─→ If not: Create order manually (fallback)
```

---

# Complete Flow Diagrams

## Product → Cart → Checkout → Order Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User Browses Products                                    │
└─────────────────────────────────────────────────────────────────┘
│
│  User visits: /
│  ↓
│  app/page.tsx (Server Component)
│  ├─→ Fetches products from Supabase
│  ├─→ Renders ProductGrid
│  └─→ Each product → ProductCard component
│
│  User clicks product
│  ↓
│  Navigate to: /products/[id]
│  ↓
│  app/products/[id]/page.tsx (Client Component)
│  ├─→ useParams() gets product ID
│  ├─→ Fetches product details
│  ├─→ Shows product info, quantity selector
│  └─→ "Add to Cart" button
│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Add to Cart                                              │
└─────────────────────────────────────────────────────────────────┘
│
│  User clicks "Add to Cart"
│  ↓
│  ProductCard.handleAddToCart()
│  ├─→ Check if user authenticated (useAuth())
│  ├─→ If not: Redirect to /auth
│  └─→ If yes: Continue
│       ↓
│  Check if item already in cart
│  ├─→ If exists: Update quantity (+1)
│  └─→ If not: Insert new cart item
│       ↓
│  Supabase mutation:
│  - INSERT INTO cart_items (user_id, product_id, quantity)
│  - RLS ensures user can only insert their own items
│       ↓
│  window.dispatchEvent('cartUpdated')
│  - Navbar listens and updates cart count
│       ↓
│  Show "Added!" confirmation
│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: View Cart                                                │
└─────────────────────────────────────────────────────────────────┘
│
│  User clicks cart icon or navigates to /cart
│  ↓
│  middleware.ts checks auth
│  ├─→ If not authenticated: Redirect to /auth?next=/cart
│  └─→ If authenticated: Continue
│       ↓
│  app/cart/page.tsx (Client Component)
│  ├─→ useAuth() gets current user
│  ├─→ useEffect() loads cart items
│  │    └─→ Supabase query: SELECT * FROM cart_items WHERE user_id = ?
│  │         └─→ RLS automatically filters to user's items
│  ├─→ Display cart items with quantities
│  ├─→ Update quantity buttons
│  ├─→ Remove item buttons
│  └─→ "Proceed to Checkout" button
│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Checkout Process                                         │
└─────────────────────────────────────────────────────────────────┘
│
│  User clicks "Proceed to Checkout"
│  ↓
│  Navigate to: /checkout
│  ↓
│  app/checkout/page.tsx (Client Component)
│  ├─→ Load cart items (same as cart page)
│  ├─→ Load user addresses
│  │    └─→ SELECT * FROM user_addresses WHERE user_id = ?
│  ├─→ User selects or adds shipping address
│  ├─→ Calculate total
│  └─→ "Pay Now" button
│       ↓
│  handleCheckout()
│  ├─→ Prepare checkout data:
│  │    - items: [{ product_id, quantity, price }]
│  │    - address_id: selected address
│  └─→ POST /api/checkout
│       ↓
│  app/api/checkout/route.ts (Server-side)
│  ├─→ Verify user authenticated
│  ├─→ Validate cart items
│  ├─→ Validate address (if provided)
│  ├─→ Calculate total
│  └─→ Create Stripe checkout session:
│       stripe.checkout.sessions.create({
│         line_items: [...],
│         mode: 'payment',
│         success_url: '/checkout/success?session_id={CHECKOUT_SESSION_ID}',
│         cancel_url: '/checkout/cancel',
│         metadata: { user_id, address_id }
│       })
│       ↓
│  Return sessionId to client
│       ↓
│  Client: stripe.redirectToCheckout({ sessionId })
│       ↓
│  User redirected to Stripe Checkout page
│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Payment & Order Creation                                 │
└─────────────────────────────────────────────────────────────────┘
│
│  User completes payment on Stripe
│  ↓
│  TWO PARALLEL PATHS:
│
│  PATH A: Stripe Webhook (Primary)
│  ├─→ Stripe sends POST /api/webhook
│  │    Event: checkout.session.completed
│  │    ↓
│  │  app/api/webhook/route.ts
│  │  ├─→ Verify webhook signature (security)
│  │  ├─→ Check if order already exists (idempotency)
│  │  │    └─→ SELECT * FROM orders WHERE stripe_payment_intent_id = ?
│  │  ├─→ If exists: Return success (already processed)
│  │  └─→ If not: Create order
│  │       ├─→ Get cart items (using service role to bypass RLS)
│  │       ├─→ Calculate total
│  │       ├─→ INSERT INTO orders (user_id, total, status, stripe_payment_intent_id)
│  │       ├─→ INSERT INTO order_items (for each cart item)
│  │       ├─→ DELETE FROM cart_items (clear cart)
│  │       ├─→ DELETE FROM wishlist (remove purchased items)
│  │       └─→ Send order confirmation email
│  │            └─→ lib/email/send.ts → Resend API
│  │
│  PATH B: Success Page (Fallback)
│  ├─→ User redirected to /checkout/success?session_id=xxx
│  │    ↓
│  │  app/checkout/success/page.tsx
│  │  ├─→ Check if order exists
│  │  ├─→ Wait 3 seconds (give webhook time)
│  │  ├─→ Check again if order exists
│  │  ├─→ If exists: Skip (webhook worked)
│  │  └─→ If not: Create order manually (webhook failed)
│  │       └─→ Same steps as webhook (create order, clear cart, etc.)
│
│  RESULT: Order created (either by webhook or fallback)
│
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────────┐
│ AUTHENTICATION FLOW: Email/Password                             │
└─────────────────────────────────────────────────────────────────┘
│
│  User visits: /auth
│  ↓
│  app/auth/page.tsx
│  ├─→ Form: email, password, confirmPassword
│  ├─→ Toggle: Sign Up / Sign In
│  └─→ Submit button
│       ↓
│  handleSubmit()
│  ├─→ Validate form (email format, password strength)
│  └─→ If Sign Up:
│       └─→ supabase.auth.signUp({ email, password })
│            ├─→ Supabase creates user in auth.users
│            ├─→ Sends verification email (if enabled)
│            └─→ Returns session
│       └─→ If Sign In:
│            └─→ supabase.auth.signInWithPassword({ email, password })
│                 ├─→ Supabase verifies credentials
│                 └─→ Returns session
│       ↓
│  Session stored in cookies (automatic by Supabase)
│  ↓
│  AuthProvider detects session change
│  ├─→ onAuthStateChange event fires
│  ├─→ setUser(session.user)
│  └─→ All components using useAuth() get updated user
│       ↓
│  Redirect to destination (from ?next parameter) or home
│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ AUTHENTICATION FLOW: Google OAuth                                │
└─────────────────────────────────────────────────────────────────┘
│
│  User clicks "Sign in with Google"
│  ↓
│  lib/auth/google.ts → signInWithGoogle()
│  ├─→ Get current origin (window.location.origin or NEXT_PUBLIC_APP_URL)
│  ├─→ Build callback URL: ${origin}/auth/callback?next=${redirectTo}
│  └─→ supabase.auth.signInWithOAuth({
│       provider: 'google',
│       options: { redirectTo: callbackUrl }
│     })
│       ↓
│  Supabase generates OAuth URL
│  ├─→ Includes PKCE code verifier (stored in browser)
│  ├─→ Includes state parameter
│  └─→ Redirects to Google
│       ↓
│  User signs in with Google
│  ↓
│  Google redirects to Supabase
│  ├─→ Supabase exchanges code with Google
│  ├─→ Creates user in auth.users (if new)
│  └─→ Redirects to: /auth/callback?code=xxx&next=/cart
│       ↓
│  app/auth/callback/route.ts
│  ├─→ Extract code and next from URL
│  ├─→ supabase.auth.exchangeCodeForSession(code)
│  │    ├─→ Verifies PKCE code verifier (from browser storage)
│  │    ├─→ If missing: PKCE error (incognito mode issue)
│  │    │    └─→ Auto-retry: Redirect to /auth?oauth_retry=true
│  │    └─→ If valid: Returns session
│  ├─→ supabase.auth.setSession() (explicitly set cookies)
│  └─→ Redirect to next URL (preserving query params)
│       ↓
│  User lands on destination (e.g., /cart)
│  ├─→ middleware.ts checks auth cookie (now present)
│  ├─→ Allows access
│  └─→ Component loads with authenticated user
│
└─────────────────────────────────────────────────────────────────┘
```

## Admin Dashboard Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ ADMIN DASHBOARD ACCESS FLOW                                     │
└─────────────────────────────────────────────────────────────────┘
│
│  User navigates to: /admin
│  ↓
│  middleware.ts
│  ├─→ Check for auth cookie
│  └─→ If not authenticated: Redirect to /auth?next=/admin
│       ↓
│  app/admin/page.tsx
│  ├─→ useAuth() gets user
│  ├─→ useEffect() calls checkAdminStatus()
│  │    ↓
│  │  GET /api/admin/check
│  │  ├─→ Server: Verify user authenticated
│  │  ├─→ Server: Call isAdmin(user.id)
│  │  │    └─→ lib/admin/check.ts
│  │  │         ├─→ Check user_profiles.is_admin = true
│  │  │         └─→ OR check ADMIN_EMAILS env variable
│  │  └─→ Return { isAdmin: true/false }
│  │       ↓
│  ├─→ If isAdmin = false:
│  │    └─→ Show "Access Denied" message
│  └─→ If isAdmin = true:
│       ├─→ Load stats (GET /api/admin/stats)
│       ├─→ Load orders (GET /api/list-all-orders)
│       └─→ Display dashboard
│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ADMIN ORDER MANAGEMENT FLOW                                      │
└─────────────────────────────────────────────────────────────────┘
│
│  Admin views order list
│  ├─→ GET /api/list-all-orders
│  │    ├─→ Server: Check admin status
│  │    ├─→ Server: Use service role key (bypass RLS)
│  │    ├─→ SELECT * FROM orders (all orders, not just user's)
│  │    ├─→ Enrich with user emails (from auth.users)
│  │    └─→ Return orders array
│  └─→ Display in table with filters
│
│  Admin clicks "View" on order
│  ├─→ GET /api/admin/orders/[orderId]
│  │    ├─→ Server: Check admin status
│  │    ├─→ Server: Get order with items and products
│  │    └─→ Return full order details
│  └─→ Display order details modal
│
│  Admin updates order status
│  ├─→ PATCH /api/admin/orders/[orderId]
│  │    ├─→ Server: Check admin status
│  │    ├─→ Server: Validate status value
│  │    ├─→ Server: Update order in database
│  │    │    └─→ Database trigger sets timestamps (shipped_at, delivered_at)
│  │    └─→ Return updated order
│  └─→ Refresh order list
│
│  Admin sends shipping email
│  ├─→ POST /api/send-shipping-email
│  │    ├─→ Server: Verify order status = 'shipped'
│  │    ├─→ Server: Verify tracking number exists
│  │    ├─→ Server: Prevent duplicate (check shipped_at < 24h)
│  │    ├─→ Server: Get order details
│  │    ├─→ Server: Get user email
│  │    └─→ Server: Send email via Resend
│  └─→ Show success message
│
└─────────────────────────────────────────────────────────────────┘
```

## Email Sending Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ EMAIL SENDING: Order Confirmation (Automatic)                   │
└─────────────────────────────────────────────────────────────────┘
│
│  Webhook creates order
│  ↓
│  app/api/webhook/route.ts
│  ├─→ Order created successfully
│  └─→ sendOrderConfirmationEmail()
│       ↓
│  lib/email/send.ts → sendOrderConfirmationEmail()
│  ├─→ Prepare email data:
│  │    - orderNumber: order.id.substring(0, 8)
│  │    - customerName: from user_profiles or auth
│  │    - customerEmail: from auth.users
│  │    - orderItems: from cart items
│  │    - total: order total
│  │    - orderUrl: production URL (replace localhost)
│  │    - orderId: full order ID (for auto-expand)
│  ├─→ Render React email template
│  │    └─→ lib/email/templates/OrderConfirmation.tsx
│  │         ├─→ React component with @react-email/components
│  │         ├─→ Build order URL: /orders?orderId=${orderId}
│  │         └─→ render() converts to HTML
│  └─→ resend.emails.send()
│       ├─→ To: customerEmail
│       ├─→ From: RESEND_FROM_EMAIL
│       ├─→ Subject: "Order Confirmation #..."
│       └─→ HTML: rendered email template
│            ↓
│  Resend API sends email
│  ↓
│  Customer receives email
│  ↓
│  Customer clicks "View Order" link
│  ├─→ URL: /orders?orderId=xxx
│  └─→ app/orders/page.tsx
│       ├─→ useSearchParams() gets orderId
│       ├─→ useEffect() finds matching order
│       ├─→ setExpandedOrder(orderId)
│       └─→ Scrolls to order (smooth scroll)
│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ EMAIL SENDING: Shipping/Delivery (Manual from Admin)             │
└─────────────────────────────────────────────────────────────────┘
│
│  Admin marks order as "shipped" in dashboard
│  ↓
│  Admin clicks "Send Shipping Email" button
│  ↓
│  POST /api/send-shipping-email
│  ├─→ Server: Verify admin status
│  ├─→ Server: Verify order.status = 'shipped'
│  ├─→ Server: Verify tracking_number exists
│  ├─→ Server: Prevent duplicate (shipped_at < 24h ago)
│  ├─→ Server: Get order and user details
│  └─→ sendShippingNotificationEmail()
│       ↓
│  lib/email/send.ts → sendShippingNotificationEmail()
│  ├─→ Prepare email data
│  ├─→ Render ShippingNotification template
│  └─→ resend.emails.send()
│
│  (Same flow for delivery email)
│
└─────────────────────────────────────────────────────────────────┘
```

---

# Step-by-Step Process Explanations

## Process 1: User Adds Product to Cart

### Why This Exists
Users need to collect products before checkout. Cart is a temporary storage that persists across page refreshes.

### What Problem It Solves
- **State Management**: Cart persists in database, not just browser memory
- **Multi-Device**: User can add items on phone, checkout on desktop
- **Security**: RLS ensures users can only see their own cart

### How It Technically Works

1. **User clicks "Add to Cart" button**
   - Location: `components/ProductCard.tsx` → `handleAddToCart()`
   - Event handler prevents default link navigation

2. **Check Authentication**
   ```typescript
   if (!user) {
     router.push('/auth')
     return
   }
   ```
   - Uses `useAuth()` hook to get current user
   - If not authenticated, redirect to login

3. **Check if Item Already in Cart**
   ```typescript
   const { data: existingItem } = await supabase
     .from('cart_items')
     .select('*')
     .eq('user_id', user.id)
     .eq('product_id', product.id)
     .single()
   ```
   - Query uses RLS - automatically filters to user's cart
   - If item exists, we'll update quantity instead of inserting

4. **Insert or Update**
   ```typescript
   if (existingItem) {
     // Update quantity
     await supabase
       .from('cart_items')
       .update({ quantity: existingItem.quantity + 1 })
       .eq('id', existingItem.id)
   } else {
     // Insert new item
     await supabase
       .from('cart_items')
       .insert({
         user_id: user.id,
         product_id: product.id,
         quantity: 1,
       })
   }
   ```
   - RLS policy ensures user can only insert/update their own items
   - Database constraint `UNIQUE(user_id, product_id)` prevents duplicates

5. **Notify Other Components**
   ```typescript
   window.dispatchEvent(new Event('cartUpdated'))
   ```
   - Custom event fires
   - Navbar listens and updates cart count badge
   - Cart page can refresh if open

### Alternative Implementations

**Option 1: Browser localStorage**
- ❌ Not persistent across devices
- ❌ Lost if user clears browser data
- ✅ Faster (no network request)

**Option 2: Session-based cart**
- ❌ Lost when session expires
- ❌ Doesn't work across devices
- ✅ Simpler (no user account needed)

**Option 3: Third-party cart service**
- ✅ Handles all cart logic
- ❌ Additional cost
- ❌ Less control

## Process 2: Checkout Creates Stripe Session

### Why This Exists
Stripe Checkout is a hosted payment page that handles PCI compliance. We create a session server-side to ensure security.

### What Problem It Solves
- **Security**: Payment data never touches our servers
- **Compliance**: Stripe handles PCI DSS requirements
- **UX**: Optimized payment form with saved cards, Apple Pay, etc.

### How It Technically Works

1. **Client: Prepare Checkout Data**
   ```typescript
   // app/checkout/page.tsx
   const response = await fetch('/api/checkout', {
     method: 'POST',
     body: JSON.stringify({
       items: cartItems.map(item => ({
         product_id: item.product_id,
         quantity: item.quantity,
         price: item.products.price,
       })),
       address_id: selectedAddress.id,
     }),
   })
   ```
   - Client sends cart items and selected address
   - Prices sent from client (validated server-side)

2. **Server: Validate Request**
   ```typescript
   // app/api/checkout/route.ts
   const supabase = createServerSupabaseClient()
   const { data: { user } } = await supabase.auth.getUser()
   
   if (!user) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   }
   ```
   - Verify user is authenticated (server-side check)
   - Server-side Supabase client reads cookies from request

3. **Server: Validate Cart Items**
   ```typescript
   if (!items || !Array.isArray(items) || items.length === 0) {
     return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
   }
   
   for (const item of items) {
     if (!item.product_id || !item.quantity || !item.price) {
       return NextResponse.json({ error: 'Invalid item data' }, { status: 400 })
     }
     if (item.quantity < 1 || item.price < 0) {
       return NextResponse.json({ error: 'Invalid quantity or price' }, { status: 400 })
     }
   }
   ```
   - Validate structure and values
   - Prevents malicious requests

4. **Server: Validate Address**
   ```typescript
   if (address_id) {
     const { data: address } = await supabase
       .from('user_addresses')
       .select('*')
       .eq('id', address_id)
       .eq('user_id', user.id)  // Ensure user owns address
       .single()
     
     if (!address) {
       return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
     }
   }
   ```
   - Verify address belongs to user (security)
   - RLS automatically filters, but explicit check is safer

5. **Server: Create Stripe Session**
   ```typescript
   const session = await stripe.checkout.sessions.create({
     payment_method_types: ['card'],
     line_items: items.map(item => ({
       price_data: {
         currency: 'usd',
         product_data: { name: `Product ${item.product_id}` },
         unit_amount: Math.round(item.price * 100),  // Convert to cents
       },
       quantity: item.quantity,
     })),
     mode: 'payment',
     success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
     cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
     metadata: {
       user_id: user.id,
       address_id: address_id || '',
     },
     shipping_address_collection: shippingAddress ? undefined : {
       allowed_countries: ['US', 'CA', 'GB', 'AU'],
     },
   })
   ```
   - `line_items`: Products in the order
   - `metadata`: Custom data passed to webhook (user_id, address_id)
   - `success_url`: Where to redirect after payment
   - `{CHECKOUT_SESSION_ID}`: Stripe replaces this with actual session ID

6. **Client: Redirect to Stripe**
   ```typescript
   const stripe = await stripePromise
   await stripe.redirectToCheckout({ sessionId })
   ```
   - Loads Stripe.js library
   - Redirects user to Stripe's hosted checkout page

### Alternative Implementations

**Option 1: Stripe Elements (Custom Form)**
- ✅ More control over UI
- ❌ More complex (handle form validation, errors)
- ❌ Still need PCI compliance measures

**Option 2: Payment Intents API**
- ✅ More flexible (subscriptions, saved cards)
- ❌ More complex implementation
- ✅ Better for recurring payments

**Option 3: Other Payment Processors**
- PayPal, Square, etc.
- Similar flow but different APIs

## Process 3: Webhook Creates Order

### Why This Exists
Webhooks are more reliable than redirects. User might close browser before redirect completes. Webhook ensures order is always created.

### What Problem It Solves
- **Reliability**: Order created even if user closes browser
- **Idempotency**: Same webhook can be processed multiple times safely
- **Security**: Server-side order creation prevents tampering

### How It Technically Works

1. **Stripe Sends Webhook**
   ```
   POST https://yourdomain.com/api/webhook
   Headers:
     stripe-signature: t=1234567890,v1=abc123...
   Body: { "type": "checkout.session.completed", "data": {...} }
   ```
   - Stripe sends HTTP POST to webhook URL
   - Includes signature for verification

2. **Server: Verify Signature**
   ```typescript
   const signature = request.headers.get('stripe-signature')
   const event = stripe.webhooks.constructEvent(
     body,
     signature,
     process.env.STRIPE_WEBHOOK_SECRET
   )
   ```
   - Verifies request is from Stripe (not attacker)
   - Uses webhook secret to verify signature
   - Throws error if signature invalid

3. **Server: Check for Duplicate Order**
   ```typescript
   const { data: existingOrder } = await supabaseAdmin
     .from('orders')
     .select('id')
     .eq('stripe_payment_intent_id', sessionId)
     .single()
   
   if (existingOrder) {
     return NextResponse.json({ received: true, message: 'Order already exists' })
   }
   ```
   - **Idempotency check**: Prevents duplicate orders
   - Uses service role key to bypass RLS (admin access)
   - If order exists, return success (already processed)

4. **Server: Get Cart Items**
   ```typescript
   const { data: cartItems } = await supabaseAdmin
     .from('cart_items')
     .select('*, products(*)')
     .eq('user_id', userId)
   ```
   - Fetch user's cart items
   - Join with products table to get prices
   - Service role key bypasses RLS (needed for webhook)

5. **Server: Create Order**
   ```typescript
   const { data: order } = await supabaseAdmin
     .from('orders')
     .insert({
       user_id: userId,
       total,
       status: 'processing',
       stripe_payment_intent_id: sessionId,  // For idempotency
     })
     .select()
     .single()
   ```
   - Insert order record
   - `stripe_payment_intent_id` has UNIQUE constraint (prevents duplicates at DB level)

6. **Server: Create Order Items**
   ```typescript
   const orderItems = cartItems.map(item => ({
     order_id: order.id,
     product_id: item.product_id,
     quantity: item.quantity,
     price: item.products.price,
   }))
   
   await supabaseAdmin
     .from('order_items')
     .insert(orderItems)
   ```
   - Create one order_item per cart item
   - Store price at time of purchase (prices might change later)

7. **Server: Clear Cart**
   ```typescript
   await supabaseAdmin
     .from('cart_items')
     .delete()
     .eq('user_id', userId)
   ```
   - Delete all cart items for user
   - Cart is now empty

8. **Server: Remove from Wishlist**
   ```typescript
   const purchasedProductIds = cartItems.map(item => item.product_id)
   await supabaseAdmin
     .from('wishlist')
     .delete()
     .eq('user_id', userId)
     .in('product_id', purchasedProductIds)
   ```
   - Remove purchased items from wishlist
   - Side effect: improves UX (don't show items user already bought)

9. **Server: Send Confirmation Email**
   ```typescript
   await sendOrderConfirmationEmail({
     orderNumber: order.id.substring(0, 8).toUpperCase(),
     customerName,
     customerEmail,
     orderItems: emailOrderItems,
     total,
     orderUrl,
     orderId: order.id,
   })
   ```
   - Send email via Resend
   - Include orderId in URL for auto-expansion

### Alternative Implementations

**Option 1: Create Order on Success Page Only**
- ❌ Unreliable (user might close browser)
- ❌ No idempotency
- ✅ Simpler (no webhook needed)

**Option 2: Poll Stripe API**
- ❌ Wastes resources (checking constantly)
- ❌ Delayed order creation
- ✅ No webhook setup needed

**Option 3: Queue System**
- ✅ Better error handling
- ✅ Retry logic
- ❌ More complex (need queue infrastructure)

## Process 4: Success Page Fallback

### Why This Exists
Webhooks can fail or be delayed. Success page ensures order is created even if webhook doesn't fire.

### What Problem It Solves
- **Reliability**: Order created even if webhook fails
- **User Experience**: User sees order confirmation immediately
- **Race Condition**: Handles timing between webhook and redirect

### How It Technically Works

1. **User Lands on Success Page**
   ```typescript
   // app/checkout/success/page.tsx
   const sessionId = searchParams.get('session_id')
   const processedRef = useRef(false)
   ```
   - Get session_id from URL (set by Stripe)
   - `processedRef` prevents multiple executions on refresh

2. **Prevent Multiple Executions**
   ```typescript
   if (processedRef.current || !user || !sessionId) {
     return
   }
   processedRef.current = true
   ```
   - Mark as processed immediately
   - Prevents duplicate order creation on page refresh

3. **Check if Order Already Exists**
   ```typescript
   const { data: existingOrder } = await supabase
     .from('orders')
     .select('*')
     .eq('stripe_payment_intent_id', sessionId)
     .single()
   
   if (existingOrder) {
     // Order exists - webhook worked
     // Clear cart if needed
     return
   }
   ```
   - Check if webhook already created order
   - If exists, skip creation (webhook succeeded)

4. **Wait for Webhook**
   ```typescript
   await new Promise(resolve => setTimeout(resolve, 3000))
   
   // Check again
   const { data: orderAfterWait } = await supabase
     .from('orders')
     .select('*')
     .eq('stripe_payment_intent_id', sessionId)
     .single()
   
   if (orderAfterWait) {
     // Webhook created it during wait
     return
   }
   ```
   - Wait 3 seconds for webhook to process
   - Check again (webhook might have fired during wait)
   - If order exists now, webhook worked

5. **Check Cart Status**
   ```typescript
   const { data: cartItems } = await supabase
     .from('cart_items')
     .select('*')
     .eq('user_id', user.id)
   
   if (cartItems && cartItems.length > 0) {
     // Cart still has items - webhook didn't work
     // Create order manually
   }
   ```
   - If cart is empty, webhook cleared it (order was created)
   - If cart has items, webhook didn't work (create order)

6. **Create Order Manually (Fallback)**
   ```typescript
   // Same steps as webhook:
   // 1. Get cart items
   // 2. Calculate total
   // 3. Create order
   // 4. Create order items
   // 5. Clear cart
   // 6. Remove from wishlist
   // 7. Send email (optional - webhook might send it)
   ```
   - Duplicate webhook logic
   - Ensures order is created

### Alternative Implementations

**Option 1: No Fallback (Webhook Only)**
- ❌ Orders lost if webhook fails
- ✅ Simpler code
- ❌ Poor user experience

**Option 2: Create Order Before Payment**
- ❌ Order created even if payment fails
- ❌ Need to handle payment failures
- ✅ No race condition

**Option 3: Poll for Order**
- ✅ More reliable
- ❌ Wastes resources
- ❌ Delayed confirmation

---

# Technical Glossary

## React Concepts

### useState
**Definition**: React Hook that manages component state (data that can change).

**Example in Project**: 
```typescript
const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
```
- `cartItems`: Current state value
- `setCartItems`: Function to update state
- When state updates, component re-renders

**Why Used**: Needed to store data that changes (cart items, loading states, form inputs).

### useEffect
**Definition**: React Hook that runs side effects (data fetching, subscriptions, DOM manipulation) after render.

**Example in Project**:
```typescript
useEffect(() => {
  if (user) {
    loadCart()
  }
}, [user])
```
- Runs when component mounts
- Runs when `user` changes
- Cleanup function can unsubscribe from events

**Why Used**: Fetch data when component loads, subscribe to changes, perform cleanup.

### useCallback
**Definition**: React Hook that memoizes a function (returns same function reference unless dependencies change).

**Example in Project**:
```typescript
const loadCart = useCallback(async () => {
  // ... load cart logic
}, [user])
```
- Prevents function recreation on every render
- Used to fix React Hook dependency warnings

**Why Used**: Performance optimization, prevent infinite loops in useEffect.

### React Context
**Definition**: Provides a way to share data across components without prop drilling.

**Example in Project**: `components/AuthProvider.tsx`
```typescript
const AuthContext = createContext<AuthContextType>({...})

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)
  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
```
- Any child component can access `user` via `useAuth()`
- No need to pass `user` prop through every component

**Why Used**: Auth state needed in many components (Navbar, protected pages, etc.).

### Client Components vs Server Components
**Definition**: 
- **Server Components**: Render on server, sent as HTML to browser (default in App Router)
- **Client Components**: Render in browser, can use hooks and interactivity (marked with `'use client'`)

**Example in Project**:
- Server Component: `app/layout.tsx` (no interactivity needed)
- Client Component: `app/cart/page.tsx` (needs useState, useEffect, user interactions)

**Why Used**: Server Components reduce JavaScript bundle size. Client Components enable interactivity.

## Next.js Concepts

### App Router
**Definition**: Next.js 14's routing system using `app/` directory. File structure determines routes.

**Example in Project**:
- `app/page.tsx` → `/`
- `app/cart/page.tsx` → `/cart`
- `app/products/[id]/page.tsx` → `/products/123`

**Why Used**: Better performance, Server Components, improved data fetching.

### Middleware
**Definition**: Code that runs before requests are processed. Can redirect, modify headers, etc.

**Example in Project**: `middleware.ts`
```typescript
export async function middleware(req: NextRequest) {
  const isProtected = pathname.startsWith('/cart') || ...
  if (isProtected) {
    // Check for auth cookie
    if (!hasAuthCookie) {
      return NextResponse.redirect(authUrl)
    }
  }
}
```

**Why Used**: Protect routes before rendering (faster than component-level checks).

### API Routes
**Definition**: Serverless functions that handle HTTP requests. Located in `app/api/` directory.

**Example in Project**: `app/api/checkout/route.ts`
```typescript
export async function POST(request: NextRequest) {
  // Server-side logic
  return NextResponse.json({ sessionId: session.id })
}
```

**Why Used**: Server-side logic (Stripe, webhooks, admin operations) that can't run in browser.

### Dynamic Routing
**Definition**: Routes with parameters that change (e.g., `/products/[id]` where `id` is dynamic).

**Example in Project**: `app/products/[id]/page.tsx`
```typescript
const params = useParams()
const productId = params.id  // Gets "123" from /products/123
```

**Why Used**: Show individual product pages without creating separate files for each product.

## Supabase Concepts

### Row Level Security (RLS)
**Definition**: PostgreSQL feature that restricts database access at row level based on user identity.

**Example in Project**:
```sql
CREATE POLICY "Users can view their own cart" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);
```
- `auth.uid()`: Current user's ID from Supabase Auth
- Policy automatically filters queries to user's own rows

**Why Used**: Security - users can only access their own data without application-level checks.

### Supabase Client (Client vs Server)
**Definition**: 
- **Client**: `createClientComponentClient()` - For browser, handles cookies automatically
- **Server**: `createServerComponentClient()` - For server, reads cookies from request

**Example in Project**:
- Client: `lib/supabase/client.ts` → Used in `app/cart/page.tsx`
- Server: `lib/supabase/server.ts` → Used in `app/api/checkout/route.ts`

**Why Used**: Different clients needed because browser and server handle cookies differently.

### Service Role Key
**Definition**: Admin key that bypasses RLS. Only used server-side, never exposed to client.

**Example in Project**:
```typescript
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```
- Used in webhook to access all users' data
- Used in admin API routes to view all orders

**Why Used**: Webhooks and admin operations need to bypass RLS to access all data.

## Stripe Concepts

### Checkout Session
**Definition**: Stripe's hosted payment page. We create a session, user pays on Stripe's servers.

**Example in Project**:
```typescript
const session = await stripe.checkout.sessions.create({
  line_items: [...],
  mode: 'payment',
  success_url: '...',
  metadata: { user_id: user.id },
})
```

**Why Used**: Handles PCI compliance, provides optimized payment experience.

### Webhook
**Definition**: HTTP callback that Stripe sends when events occur (e.g., payment completed).

**Example in Project**: `app/api/webhook/route.ts`
- Receives `checkout.session.completed` event
- Creates order in database

**Why Used**: More reliable than redirects - order created even if user closes browser.

### Idempotency
**Definition**: Same operation can be safely repeated without side effects.

**Example in Project**:
```typescript
// Check if order already exists
const { data: existingOrder } = await supabaseAdmin
  .from('orders')
  .select('id')
  .eq('stripe_payment_intent_id', sessionId)
  .single()

if (existingOrder) {
  return NextResponse.json({ received: true })  // Already processed
}
```

**Why Used**: Stripe may retry webhooks. Idempotency prevents duplicate orders.

## Email Concepts

### React Email
**Definition**: Build email templates as React components that render to HTML.

**Example in Project**: `lib/email/templates/OrderConfirmation.tsx`
```typescript
export default function OrderConfirmationEmail({ orderNumber, ... }) {
  return (
    <Html>
      <Body>
        <Container>...</Container>
      </Body>
    </Html>
  )
}
```

**Why Used**: Professional email templates that are easy to maintain and customize.

### Resend
**Definition**: Email API service for sending transactional emails.

**Example in Project**: `lib/email/send.ts`
```typescript
const resend = new Resend(process.env.RESEND_API_KEY)
await resend.emails.send({
  from: 'Ecommerce Start <onboarding@resend.dev>',
  to: [customerEmail],
  subject: 'Order Confirmation',
  html: emailHtml,
})
```

**Why Used**: Reliable email delivery, better than SMTP for serverless functions.

---

# Learning Roadmap

## Beginner Path (0-3 months)

### Week 1-2: React Basics
1. **Learn React Fundamentals**
   - Components, props, state
   - JSX syntax
   - Event handling
   - **Practice**: Build simple component (button, form)

2. **Learn React Hooks**
   - `useState` - Managing state
   - `useEffect` - Side effects
   - **Practice**: Build counter app, todo list

### Week 3-4: Next.js Basics
1. **Learn Next.js App Router**
   - File-based routing
   - Pages and layouts
   - **Practice**: Build multi-page site

2. **Learn Server vs Client Components**
   - When to use each
   - Data fetching patterns
   - **Practice**: Build page with server and client components

### Week 5-6: Database & Auth
1. **Learn Supabase Basics**
   - Create tables
   - Insert/select data
   - **Practice**: Build simple CRUD app

2. **Learn Supabase Auth**
   - Email/password auth
   - Session management
   - **Practice**: Add auth to your app

### Week 7-8: Build Simple E-commerce
1. **Build Product Catalog**
   - Display products
   - Add to cart (localStorage)
   - **Practice**: Simple shopping cart

## Intermediate Path (3-6 months)

### Month 4: Advanced React
1. **React Context**
   - When to use Context
   - Context vs Props
   - **Practice**: Build app with global state

2. **Custom Hooks**
   - Extract reusable logic
   - **Practice**: Create custom hooks

### Month 5: Next.js Advanced
1. **API Routes**
   - Server-side logic
   - Request/response handling
   - **Practice**: Build REST API

2. **Middleware**
   - Route protection
   - Request modification
   - **Practice**: Add auth middleware

### Month 6: Supabase Advanced
1. **Row Level Security**
   - Writing RLS policies
   - Testing security
   - **Practice**: Secure multi-user app

2. **Real-time Subscriptions**
   - Listen to database changes
   - **Practice**: Real-time chat or notifications

## Advanced Path (6+ months)

### Payments
1. **Stripe Integration**
   - Checkout Sessions
   - Webhooks
   - **Practice**: Add payments to e-commerce app

### Email
1. **React Email**
   - Building email templates
   - **Practice**: Create order confirmation email

2. **Resend API**
   - Sending emails
   - **Practice**: Send transactional emails

### Deployment
1. **Vercel Deployment**
   - Environment variables
   - Domain setup
   - **Practice**: Deploy your app

2. **Production Best Practices**
   - Error handling
   - Logging
   - Monitoring
   - **Practice**: Add error tracking

---

**Document Status**: ✅ Complete - Deep technical documentation with architecture diagrams, flow explanations, and learning roadmap

**Cross-Reference**: This document supplements `PROJECT_FULL_REVIEW.md` with detailed flow diagrams and step-by-step process explanations.

