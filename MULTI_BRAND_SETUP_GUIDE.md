# Multi-Brand Setup Guide: Using 2 Free Supabase Projects

## 🎯 Goal

Set up complete separation for 2 brands using free tiers:
- ✅ Supabase: 2 projects (free)
- ✅ Resend: 1-2 accounts (free tier: 3,000 emails/month each)
- ✅ Stripe: 1-2 accounts (free, no monthly fee)
- ✅ Total Cost: **$0/month** for testing

---

## 📋 Step-by-Step Setup

### Step 1: Create Second Supabase Project

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Click "New Project"

2. **Create Project for Brand B**
   - Name: "Brand B - Ecommerce Start"
   - Database Password: (save this!)
   - Region: Choose closest to your users
   - Click "Create new project"

3. **Wait for Setup** (2-3 minutes)

4. **Get API Keys**
   - Go to Settings > API
   - Copy:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL_BRAND_B`
     - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_B`
     - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY_BRAND_B` ⚠️ **SECRET!**

5. **Run Migrations**
   - Go to SQL Editor
   - Run these files in order:
     ```
     supabase-schema.sql
     supabase-user-profiles.sql
     supabase-admin-role.sql
     supabase-wishlist.sql
     migrations/001_create_brands_table.sql
     ```

6. **Add Products**
   - Go to Table Editor > products
   - Add products for Brand B
   - (These will be separate from Brand A)

---

### Step 2: Configure Resend

#### Option A: Single Resend Account (Recommended Start)

**Why:** Free tier allows 1 domain, but you can use different "From Name"

1. **Keep Your Existing Resend Account**
   - No changes needed
   - Domain: `yourplatform.com` (or `onboarding@resend.dev` for testing)

2. **Update Environment Variables**
   ```env
   # Brand A
   RESEND_API_KEY_BRAND_A=re_your_existing_key
   RESEND_FROM_EMAIL_BRAND_A=noreply@yourplatform.com
   RESEND_FROM_NAME_BRAND_A=Green Theme Store
   
   # Brand B
   RESEND_API_KEY_BRAND_B=re_your_existing_key  # Same key
   RESEND_FROM_EMAIL_BRAND_B=noreply@yourplatform.com  # Same domain
   RESEND_FROM_NAME_BRAND_B=Ecommerce Start  # Different name
   ```

3. **Result:**
   - Brand A emails: `Green Theme Store <noreply@yourplatform.com>`
   - Brand B emails: `Ecommerce Start <noreply@yourplatform.com>`

#### Option B: Separate Resend Accounts (For Custom Domains)

**Why:** If you want `noreply@branda.com` and `noreply@brandb.com`

1. **Create Second Resend Account**
   - Use different email address
   - Sign up at https://resend.com
   - Verify domain for Brand B

2. **Get API Key**
   - Dashboard > API Keys
   - Copy API key

3. **Update Environment Variables**
   ```env
   # Brand A
   RESEND_API_KEY_BRAND_A=re_key_from_account_1
   RESEND_FROM_EMAIL_BRAND_A=noreply@branda.com
   RESEND_FROM_NAME_BRAND_A=Green Theme Store
   
   # Brand B
   RESEND_API_KEY_BRAND_B=re_key_from_account_2
   RESEND_FROM_EMAIL_BRAND_B=noreply@brandb.com
   RESEND_FROM_NAME_BRAND_B=Ecommerce Start
   ```

**Free Tier Limits:**
- Account 1: 3,000 emails/month
- Account 2: 3,000 emails/month
- **Total: 6,000 emails/month** ✅

---

### Step 3: Configure Stripe

#### Option A: Single Stripe Account (Recommended Start)

**Why:** Simpler, use metadata to separate brands

1. **Keep Your Existing Stripe Account**
   - No changes needed

2. **Update Environment Variables**
   ```env
   # Brand A
   STRIPE_SECRET_KEY_BRAND_A=sk_test_your_existing_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_A=pk_test_your_existing_key
   STRIPE_WEBHOOK_SECRET_BRAND_A=whsec_your_existing_webhook
   
   # Brand B
   STRIPE_SECRET_KEY_BRAND_B=sk_test_your_existing_key  # Same key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_B=pk_test_your_existing_key  # Same key
   STRIPE_WEBHOOK_SECRET_BRAND_B=whsec_your_existing_webhook  # Same webhook
   ```

3. **Add Brand Metadata to Payments**
   - Code will automatically add `brand_id` to Stripe metadata
   - Filter payments in Stripe dashboard by metadata

#### Option B: Separate Stripe Accounts (For Financial Separation)

**Why:** If you need separate financials, tax reporting, or white-label

1. **Create Second Stripe Account**
   - Go to https://dashboard.stripe.com/register
   - Use different email
   - Complete business verification

2. **Get API Keys**
   - Dashboard > Developers > API keys
   - Copy:
     - Secret key (starts with `sk_test_`)
     - Publishable key (starts with `pk_test_`)

3. **Create Webhook**
   - Developers > Webhooks
   - Endpoint: `https://yourdomain.com/api/webhook`
   - Event: `checkout.session.completed`
   - Copy webhook secret

4. **Update Environment Variables**
   ```env
   # Brand A
   STRIPE_SECRET_KEY_BRAND_A=sk_test_account_1_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_A=pk_test_account_1_key
   STRIPE_WEBHOOK_SECRET_BRAND_A=whsec_account_1_webhook
   
   # Brand B
   STRIPE_SECRET_KEY_BRAND_B=sk_test_account_2_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_B=pk_test_account_2_key
   STRIPE_WEBHOOK_SECRET_BRAND_B=whsec_account_2_webhook
   ```

**Free Tier:**
- ✅ No monthly fee
- ✅ 2.9% + $0.30 per transaction
- ✅ Unlimited test mode
- ✅ Multiple accounts allowed

---

### Step 4: Update Code to Use Service Router

The service router (`lib/services/router.ts`) is already created. Now update existing code:

#### Update Supabase Client Usage

**Before:**
```typescript
import { createSupabaseClient } from '@/lib/supabase/client'
const supabase = createSupabaseClient()
```

**After:**
```typescript
import { getSupabaseClient } from '@/lib/services/router'
const supabase = await getSupabaseClient()
```

#### Update Resend Usage

**Before:**
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
```

**After:**
```typescript
import { getResendClient, getResendConfig } from '@/lib/services/router'
const resend = await getResendClient()
const { from } = await getResendConfig()
```

#### Update Stripe Usage

**Before:**
```typescript
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
```

**After:**
```typescript
import { getStripeClient } from '@/lib/services/router'
const stripe = await getStripeClient()
```

---

### Step 5: Update Environment Variables

1. **Copy `.env.example.multi-brand` to `.env.local`**

2. **Fill in your values:**
   - Supabase Project 1 keys (Brand A)
   - Supabase Project 2 keys (Brand B)
   - Resend keys (same or different)
   - Stripe keys (same or different)

3. **For Vercel/Production:**
   - Add all variables to Vercel dashboard
   - Settings > Environment Variables
   - Add each variable

---

## 🧪 Testing

### Test Brand A (Green Theme Store)

1. **Activate Brand A**
   - Go to `/admin/brand-settings`
   - Activate "Green Theme Store"

2. **Verify:**
   - ✅ Products load from Supabase Project 1
   - ✅ Sign up creates user in Project 1
   - ✅ Emails sent from "Green Theme Store"
   - ✅ Payments tagged with brand A metadata

### Test Brand B (Ecommerce Start)

1. **Activate Brand B**
   - Go to `/admin/brand-settings`
   - Activate "Ecommerce Start"

2. **Verify:**
   - ✅ Products load from Supabase Project 2
   - ✅ Sign up creates user in Project 2
   - ✅ Emails sent from "Ecommerce Start"
   - ✅ Payments tagged with brand B metadata

---

## 📊 Free Tier Summary

| Service | Free Tier | What You Get |
|---------|-----------|--------------|
| **Supabase** | 2 projects | 500MB DB × 2 = 1GB total |
| **Resend** | 1-2 accounts | 3,000 emails/month × accounts |
| **Stripe** | Unlimited accounts | No monthly fee, pay per transaction |
| **Storage** | Supabase included | 1GB × 2 projects = 2GB total |
| **Total** | | **$0/month** ✅ |

---

## 🚀 Next Steps

1. ✅ Create second Supabase project
2. ✅ Configure Resend (Option A or B)
3. ✅ Configure Stripe (Option A or B)
4. ✅ Update environment variables
5. ✅ Test both brands
6. ✅ Deploy to production

---

## 💡 Recommendations

### For Testing (Now):
- ✅ **Supabase:** 2 separate projects
- ✅ **Resend:** 1 account (shared domain, different From Name)
- ✅ **Stripe:** 1 account (use metadata)

### For Production (Scale):
- ✅ **Supabase:** 2 projects (or migrate to self-hosted PostgreSQL)
- ✅ **Resend:** Upgrade to Pro ($20/month) for multiple domains
- ✅ **Stripe:** Separate accounts if white-label/reseller model

---

## ❓ Questions?

**Q: Can I use same Resend API key for both brands?**
A: Yes! Use different "From Name" to differentiate.

**Q: Can I use same Stripe account for both brands?**
A: Yes! Use metadata to tag payments by brand.

**Q: What if I need more than 2 brands?**
A: After 2 Supabase projects, consider:
- Self-hosted PostgreSQL (cheaper)
- Supabase Pro ($25/month per project)

**Q: Do I need separate Stripe accounts?**
A: Only if you need:
- Separate financial reporting
- White-label (clients own their Stripe)
- Different tax handling

Let me know if you want me to implement the code updates!

