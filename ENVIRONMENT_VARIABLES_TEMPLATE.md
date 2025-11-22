# Environment Variables Template

## 📋 Production Environment Variables

Copy this template and fill in your production values. **NEVER commit this file with real values!**

```env
# ============================================
# PRODUCTION ENVIRONMENT VARIABLES
# ============================================
# Copy this file to .env.production
# Fill in your actual values
# DO NOT COMMIT TO GIT
# ============================================

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://eqqcidlflclgegsalbub.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key_here

# Stripe Configuration (LIVE MODE - NOT TEST!)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Resend Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=orders@shooshka.online  # or onboarding@resend.dev for testing

# Application Configuration
NEXT_PUBLIC_APP_URL=https://shooshka.online
NODE_ENV=production
```

---

## 🔍 Where to Get These Values

### Supabase Keys

1. Go to: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub
2. Settings > API
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **SECRET!**

### Stripe Keys (LIVE MODE)

1. Go to: https://dashboard.stripe.com
2. **Toggle to LIVE mode** (top right - very important!)
3. Developers > API keys
4. Copy:
   - **Secret key** → `STRIPE_SECRET_KEY` (starts with `sk_live_`)
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_live_`)

### Stripe Webhook Secret

1. Go to Stripe Dashboard (LIVE mode)
2. Developers > Webhooks
3. Click **"Add endpoint"** (if not created yet)
4. **Endpoint URL:** `https://shooshka.online/api/webhook`
5. Select event: `checkout.session.completed`
6. Click **"Add endpoint"**
7. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)
8. Add this secret to your environment variables

**Note:** The webhook URL is configured in Stripe Dashboard, NOT as an environment variable. Only the `STRIPE_WEBHOOK_SECRET` goes in environment variables.

### Resend Email Keys

1. Go to: https://resend.com
2. Sign up for free account (3,000 emails/month, 100/day)
3. Go to: https://resend.com/api-keys
4. Click **"Create API Key"**
5. Copy **API key** → `RESEND_API_KEY` (starts with `re_`)

**For From Email:**
- **Testing/Development:** Use `onboarding@resend.dev` (works immediately)
- **Production:** Add your domain in Resend and use `orders@yourdomain.com`

**To Add Custom Domain:**
1. Go to: https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain: `shooshka.online`
4. Add DNS records to your domain provider (TXT, MX records)
5. Wait for verification (5-30 minutes)
6. Use: `orders@shooshka.online` or `support@shooshka.online`

### App URL

- **For your site:** `https://shooshka.online`
- This is your base domain (NOT the webhook URL)
- Used for redirects and success/cancel URLs

**⚠️ Important:** The webhook URL (`https://shooshka.online/api/webhook`) is **NOT** an environment variable. It's configured in **Stripe Dashboard** → **Webhooks** → **Add endpoint**.

---

## ⚠️ Critical Warnings

1. **Stripe Keys:**
   - ✅ Must be **LIVE** keys (starts with `sk_live_` and `pk_live_`)
   - ❌ NOT test keys (don't use `sk_test_` or `pk_test_`)

2. **Service Role Key:**
   - ⚠️ **NEVER** expose this key
   - ⚠️ Only use server-side
   - ⚠️ Has admin access to database

3. **Never Commit:**
   - ❌ Don't commit `.env.local` or `.env.production`
   - ✅ Already in `.gitignore`
   - ✅ Use hosting platform's environment variables

---

## 📝 Setting in Hosting Platforms

### Vercel

1. Go to Project Settings
2. Environment Variables
3. Add each variable
4. Select "Production" environment
5. Save

### Netlify

1. Site Settings
2. Environment Variables
3. Add each variable
4. Save

### Self-Hosted

Create `.env.production` file:
```bash
# Copy template
cp ENVIRONMENT_VARIABLES_TEMPLATE.md .env.production

# Edit with your values
nano .env.production
```

---

## ✅ Verification

After setting variables:

1. **Build Test:**
   ```bash
   npm run build
   # Should complete without errors
   ```

2. **Check Variables:**
   - Verify all variables are set
   - Check no test keys are used
   - Confirm production URLs

---

## 🔄 Updating Variables

To update a variable:

1. **Vercel/Netlify:**
   - Go to Environment Variables
   - Edit value
   - Redeploy

2. **Self-Hosted:**
   - Edit `.env.production`
   - Restart application

---

**Template Version:** 1.0  
**Last Updated:** $(date)

