# Services Separation & Free Tiers Analysis

## 🎯 Goal: Test Multi-Brand Separation with Free Tiers

You want to:
1. ✅ Use 2 free Supabase projects to test separation
2. ✅ Identify all services that need separation
3. ✅ Check free tier availability for testing
4. ✅ Understand Resend domain limitations
5. ✅ Be ready for all scenarios

---

## 📊 Current Services Analysis

### 1. Supabase (Database + Auth)

**Current Usage:**
- Database: Products, users, cart, orders
- Authentication: User sign-up/login
- Storage: Brand assets (optional)

**Free Tier:**
- ✅ **2 projects** (perfect for testing!)
- 500MB database per project
- 2GB bandwidth per project
- 50,000 monthly active users

**Separation Strategy:**
```
Supabase Project 1: "Brand A"
├── products (brand A only)
├── users (brand A only)
├── cart_items
└── orders

Supabase Project 2: "Brand B"
├── products (brand B only)
├── users (brand B only)
├── cart_items
└── orders
```

**Cost After Free Tier:**
- $25/month per project
- 10 brands = $250/month (if using separate projects)

---

### 2. Resend (Email Service)

**Current Usage:**
- Order confirmation emails
- Shipping notifications
- Delivery notifications
- Password reset (if implemented)

**Free Tier:**
- ✅ **3,000 emails/month**
- ✅ **1 domain** per account
- ❌ **No multi-domain support** on free tier

**Domain Limitation:**
- One account = One domain
- Example: `noreply@yourdomain.com`
- Can't use `noreply@branda.com` and `noreply@brandb.com` on same account

**Separation Options:**

#### Option A: Single Resend Account (Shared Domain)
```
Resend Account (Free)
└── Domain: yourplatform.com
    ├── noreply@yourplatform.com (Brand A)
    └── noreply@yourplatform.com (Brand B)
    └── Use "From Name" to differentiate:
        - "Green Theme Store <noreply@yourplatform.com>"
        - "Ecommerce Start <noreply@yourplatform.com>"
```

**Pros:**
- ✅ Free tier works
- ✅ Simple setup
- ✅ One account to manage

**Cons:**
- ❌ Can't use custom domains per brand
- ❌ Less professional for white-label

#### Option B: Multiple Resend Accounts (One Per Brand)
```
Resend Account 1 (Free)
└── Domain: branda.com
    └── noreply@branda.com

Resend Account 2 (Free)
└── Domain: brandb.com
    └── noreply@brandb.com
```

**Pros:**
- ✅ Custom domain per brand
- ✅ True white-label
- ✅ Professional appearance

**Cons:**
- ❌ Need separate email accounts
- ❌ More complex setup
- ❌ 3,000 emails/month per account (6,000 total)

#### Option C: Resend Pro ($20/month)
- ✅ Multiple domains
- ✅ 50,000 emails/month
- ✅ Better deliverability
- ✅ Custom domains per brand

**Recommendation:**
- **Start:** Option A (shared domain, use From Name)
- **Scale:** Option C (Resend Pro for custom domains)

---

### 3. Stripe (Payment Processing)

**Current Usage:**
- Checkout sessions
- Payment processing
- Webhooks
- Order creation

**Free Tier:**
- ✅ **No monthly fee**
- ✅ **2.9% + $0.30 per transaction**
- ✅ **Test mode** (unlimited)
- ✅ **Multiple accounts** allowed

**Separation Strategy:**

#### Option A: Single Stripe Account (Recommended)
```
Stripe Account (Free)
├── Products: All brands
├── Customers: All brands
└── Use metadata to tag by brand:
    {
      "brand_id": "brand-a",
      "brand_name": "Green Theme Store"
    }
```

**Pros:**
- ✅ Simple setup
- ✅ One dashboard
- ✅ Easy reconciliation
- ✅ Lower fees (volume discounts)

**Cons:**
- ❌ All brands in one account
- ❌ Can't separate financials easily

#### Option B: Separate Stripe Accounts (Per Brand)
```
Stripe Account 1 (Free)
└── Brand A payments

Stripe Account 2 (Free)
└── Brand B payments
```

**Pros:**
- ✅ Complete financial separation
- ✅ Each brand has own dashboard
- ✅ Better for white-label/reseller model
- ✅ Independent tax reporting

**Cons:**
- ❌ More accounts to manage
- ❌ Need to switch between accounts
- ❌ Slightly more complex code

**Recommendation:**
- **B2B SaaS (you own brands):** Option A (single account)
- **White-label (clients own brands):** Option B (separate accounts)

---

### 4. Storage (Brand Assets)

**Current Usage:**
- Brand logos
- Favicons
- OG images
- Apple icons

**Options:**

#### Option A: Supabase Storage (Included)
- ✅ Included with Supabase
- ✅ 1GB free per project
- ✅ CDN included
- ✅ Separate per project (if using separate Supabase projects)

#### Option B: Cloudflare R2 (S3-Compatible)
- ✅ **10GB free/month**
- ✅ **No egress fees**
- ✅ **Unlimited requests**
- ✅ Can create separate buckets per brand

#### Option C: AWS S3
- ✅ **5GB free/month** (first year)
- ✅ **20,000 GET requests free**
- ✅ Separate buckets per brand
- ❌ Egress fees after free tier

**Recommendation:**
- **Start:** Supabase Storage (already included)
- **Scale:** Cloudflare R2 (best free tier)

---

### 5. Domain & DNS

**Current Usage:**
- Custom domains per brand
- SSL certificates

**Free Options:**
- ✅ **Cloudflare** (Free tier)
  - Unlimited domains
  - Free SSL
  - CDN included
  - DNS management

**Separation:**
```
Cloudflare Account (Free)
├── branda.com → Points to deployment
├── brandb.com → Points to deployment
└── All free!
```

---

## 🎯 Complete Separation Plan (Using Free Tiers)

### Setup for 2 Brands (Testing)

#### Brand A: "Green Theme Store"
```
Supabase Project 1 (Free)
├── Database: brand_a
├── Auth: brand_a users
└── Storage: brand_a assets

Resend Account 1 (Free)
└── Domain: yourplatform.com
    └── From: "Green Theme Store <noreply@yourplatform.com>"

Stripe Account 1 (Free)
└── Payments tagged with brand_id: "green-theme-store"

Cloudflare (Free)
└── Domain: greentheme.com → Deployment
```

#### Brand B: "Ecommerce Start"
```
Supabase Project 2 (Free)
├── Database: brand_b
├── Auth: brand_b users
└── Storage: brand_b assets

Resend Account 2 (Free)
└── Domain: yourplatform.com (or separate domain)
    └── From: "Ecommerce Start <noreply@yourplatform.com>"

Stripe Account 2 (Free)
└── Payments tagged with brand_id: "ecommerce-start"

Cloudflare (Free)
└── Domain: ecommercestart.com → Deployment
```

---

## 💰 Cost Summary (2 Brands - Free Tier)

| Service | Free Tier | Cost |
|---------|-----------|------|
| Supabase | 2 projects | **$0** |
| Resend | 2 accounts × 3,000 emails | **$0** |
| Stripe | 2 accounts (no monthly fee) | **$0** |
| Cloudflare | Unlimited domains | **$0** |
| Storage | Supabase (1GB × 2) | **$0** |
| **Total** | | **$0/month** |

**Perfect for testing!** ✅

---

## 🚀 Implementation Steps

### Step 1: Create Second Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: "Brand B - Ecommerce Start"
4. Copy URL and keys
5. Run migrations:
   - `supabase-schema.sql`
   - `supabase-user-profiles.sql`
   - `supabase-admin-role.sql`
   - `supabase-wishlist.sql`

### Step 2: Create Second Resend Account (Optional)

**If you want separate domains:**

1. Create new Resend account (different email)
2. Verify domain for Brand B
3. Get API key

**If using shared domain:**

1. Keep one Resend account
2. Use different "From Name" per brand
3. Configure in code

### Step 3: Create Second Stripe Account (Optional)

**If you want financial separation:**

1. Create new Stripe account
2. Get API keys
3. Configure in environment variables

**If using single account:**

1. Keep one Stripe account
2. Add brand metadata to payments
3. Filter in Stripe dashboard

### Step 4: Update Environment Variables

Create `.env.local` structure:

```env
# Brand A (Green Theme Store)
NEXT_PUBLIC_SUPABASE_URL_BRAND_A=https://project1.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A=key1
SUPABASE_SERVICE_ROLE_KEY_BRAND_A=key1

RESEND_API_KEY_BRAND_A=re_key1
RESEND_FROM_EMAIL_BRAND_A=noreply@yourplatform.com
RESEND_FROM_NAME_BRAND_A=Green Theme Store

STRIPE_SECRET_KEY_BRAND_A=sk_test_1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_A=pk_test_1

# Brand B (Ecommerce Start)
NEXT_PUBLIC_SUPABASE_URL_BRAND_B=https://project2.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_B=key2
SUPABASE_SERVICE_ROLE_KEY_BRAND_B=key2

RESEND_API_KEY_BRAND_B=re_key2
RESEND_FROM_EMAIL_BRAND_B=noreply@yourplatform.com
RESEND_FROM_NAME_BRAND_B=Ecommerce Start

STRIPE_SECRET_KEY_BRAND_B=sk_test_2
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_B=pk_test_2
```

### Step 5: Create Service Router

Create `lib/services/router.ts`:

```typescript
import { getActiveBrand } from '@/lib/brand/storage'

export async function getSupabaseClient() {
  const activeBrand = await getActiveBrand()
  const brandSlug = activeBrand?.slug || 'default'
  
  // Route to correct Supabase project
  if (brandSlug === 'green-theme-store') {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL_BRAND_A!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A!
    )
  } else {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL_BRAND_B!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_B!
    )
  }
}

export async function getResendConfig() {
  const activeBrand = await getActiveBrand()
  const brandSlug = activeBrand?.slug || 'default'
  
  if (brandSlug === 'green-theme-store') {
    return {
      apiKey: process.env.RESEND_API_KEY_BRAND_A!,
      fromEmail: process.env.RESEND_FROM_EMAIL_BRAND_A!,
      fromName: process.env.RESEND_FROM_NAME_BRAND_A!,
    }
  } else {
    return {
      apiKey: process.env.RESEND_API_KEY_BRAND_B!,
      fromEmail: process.env.RESEND_FROM_EMAIL_BRAND_B!,
      fromName: process.env.RESEND_FROM_NAME_BRAND_B!,
    }
  }
}

export async function getStripeConfig() {
  const activeBrand = await getActiveBrand()
  const brandSlug = activeBrand?.slug || 'default'
  
  if (brandSlug === 'green-theme-store') {
    return {
      secretKey: process.env.STRIPE_SECRET_KEY_BRAND_A!,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_A!,
    }
  } else {
    return {
      secretKey: process.env.STRIPE_SECRET_KEY_BRAND_B!,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_B!,
    }
  }
}
```

---

## 📋 Services That DON'T Need Separation

### 1. Vercel/Deployment
- ✅ Single deployment
- ✅ Routes to correct services based on brand
- ✅ No separation needed

### 2. GitHub/Code Repository
- ✅ Single codebase
- ✅ Handles all brands
- ✅ No separation needed

### 3. Monitoring (Optional)
- Vercel Analytics (included)
- Sentry (free tier: 5,000 events/month)
- No separation needed

---

## 🎯 Recommended Setup (Free Tier Testing)

### Minimal Separation (Recommended Start)

```
✅ Supabase: 2 projects (separate)
✅ Resend: 1 account (shared domain, different From Name)
✅ Stripe: 1 account (use metadata for separation)
✅ Storage: Supabase Storage (included)
✅ Domain: Cloudflare (free)
```

**Why:**
- Maximum testing with free tiers
- Simple to implement
- Can separate more later

### Full Separation (If Needed)

```
✅ Supabase: 2 projects (separate)
✅ Resend: 2 accounts (separate domains)
✅ Stripe: 2 accounts (separate financials)
✅ Storage: Supabase Storage (separate per project)
✅ Domain: Cloudflare (free, separate domains)
```

**Why:**
- Complete isolation
- True white-label
- Better for reseller model

---

## 🚀 Next Steps

Would you like me to:

1. **Create service router** (`lib/services/router.ts`) - Routes to correct services based on active brand
2. **Update Supabase client** - Use router to connect to correct project
3. **Update Resend config** - Use router for email sending
4. **Update Stripe config** - Use router for payments
5. **Create migration guide** - Step-by-step setup for 2 Supabase projects
6. **Create environment template** - `.env.example` with all brand variables

This will make you ready for:
- ✅ Testing with 2 free Supabase projects
- ✅ Complete service separation
- ✅ Easy scaling to more brands
- ✅ All deployment scenarios (AWS, DigitalOcean, Docker)

Let me know which you'd like me to implement first!

