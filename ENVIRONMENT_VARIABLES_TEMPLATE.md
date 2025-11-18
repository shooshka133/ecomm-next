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

# Application Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
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
3. Click on your webhook endpoint
4. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)

### App URL

- Your production domain (e.g., `https://yourstore.com`)
- Or Vercel URL (e.g., `https://yourproject.vercel.app`)

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

