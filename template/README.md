# 🚀 E-Commerce Template Deployment Guide

This guide will help you deploy your own e-commerce store in **under 5 minutes** using this template.

## 📋 Prerequisites

Before starting, make sure you have:
- Node.js 18+ installed
- Accounts for:
  - [Supabase](https://supabase.com) (free tier available)
  - [Stripe](https://stripe.com) (test mode is free)
  - [Resend](https://resend.com) (free tier: 3,000 emails/month)
  - [Vercel](https://vercel.com) (free tier available)

---

## ⚡ Quick Start (< 5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Run Installation Script

```bash
node template/scripts/install-template.js
```

This interactive script will:
- ✅ Guide you through setting up environment variables
- ✅ Create `.env.local` with your credentials
- ✅ Provide next steps for database and webhook setup

**Or manually create `.env.local`:**

Copy `template/config/env.example.json` and fill in your values, then run:
```bash
node template/scripts/sync-env.js
```

### Step 3: Set Up Supabase Database

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → **SQL Editor**
3. Run these SQL files **in order**:
   ```
   supabase-schema.sql
   supabase-user-profiles.sql
   supabase-order-tracking.sql
   supabase-admin-role.sql
   supabase-wishlist.sql
   ```
4. Set your admin user:
   ```sql
   UPDATE user_profiles
   SET is_admin = true
   WHERE id = (SELECT id FROM auth.users WHERE email = 'your-admin@email.com');
   ```

### Step 4: Set Up Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your webhook URL:
   - **Local**: `https://your-ngrok-url.ngrok.io/api/webhook` (use [ngrok](https://ngrok.com) for local testing)
   - **Production**: `https://yourdomain.com/api/webhook`
4. Select event: `checkout.session.completed`
5. Copy the **Signing secret** → Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### Step 5: Configure Resend Email

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add and verify your domain (or use `onboarding@resend.dev` for testing)
3. Copy your API key → Add to `.env.local` as `RESEND_API_KEY`
4. Set `RESEND_FROM_EMAIL` in `.env.local`

### Step 6: Apply Branding (Optional)

1. Place your custom files in `template/override/`:
   - `logo.svg` - Your store logo
   - `favicon.svg` - Your favicon
   - `branding.json` - Custom branding values
2. Run:
   ```bash
   node template/scripts/apply-branding.js
   ```

### Step 7: Enable Template Mode (Optional)

In `.env.local`, set:
```env
NEXT_PUBLIC_TEMPLATE_MODE=true
```

This enables:
- ✅ Custom branding from `template/config/branding.json`
- ✅ Template mode banner in admin dashboard
- ✅ Centralized configuration management

### Step 8: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your store! 🎉

---

## 🔧 What Values Must Be Replaced

### Required Replacements

#### 1. **Supabase Credentials** (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
**Where to find**: Supabase Dashboard → Settings → API

#### 2. **Stripe Credentials** (`.env.local`)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
**Where to find**: Stripe Dashboard → Developers → API keys / Webhooks

#### 3. **Resend Credentials** (`.env.local`)
```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```
**Where to find**: Resend Dashboard → API Keys

#### 4. **App URL** (`.env.local`)
```env
NEXT_PUBLIC_APP_URL=https://yourstore.com
```
- **Local**: `http://localhost:3000`
- **Production**: Your Vercel domain or custom domain

#### 5. **Admin Email** (`.env.local`)
```env
ADMIN_EMAILS=admin@yourstore.com
```
Comma-separated list of admin emails.

### Optional Customizations

#### Branding (`template/config/branding.json` or `template/override/branding.json`)
```json
{
  "storeName": "Your Store Name",
  "storeSlogan": "Your slogan here",
  "primaryColor": "#YOUR_COLOR",
  "supportEmail": "support@yourstore.com"
}
```

#### Store Settings (`.env.local`)
```env
STORE_CURRENCY=USD
STORE_CURRENCY_SYMBOL=$
STORE_SHIPPING_COUNTRIES=US,CA,GB,AU
```

---

## 🔄 Safe Update Workflow

This template is designed so you can update from the main repository without losing your customizations.

### How It Works

1. **Template files** (`template/`) are separate from production code
2. **Override files** (`template/override/`) are never overwritten
3. **Template mode** is optional - existing code works without it

### Updating from Main Repository

```bash
# 1. Commit your customizations
git add template/override/
git commit -m "Save custom branding"

# 2. Pull updates from main repo
git pull origin main

# 3. Re-apply your branding
node template/scripts/apply-branding.js

# 4. Test your store
npm run dev
```

### What Gets Preserved

✅ **Your customizations**:
- `template/override/branding.json` - Never overwritten
- `template/override/logo.svg` - Never overwritten
- `.env.local` - Never committed (in .gitignore)

✅ **Your database**:
- All data in Supabase
- All orders, users, products

❌ **What might change**:
- Core application code (if you pull updates)
- Default template files (safe to overwrite)

### Best Practices

1. **Never modify core files directly**
   - Use `template/override/` for customizations
   - Use template mode for branding

2. **Keep template/override/ in version control**
   ```bash
   git add template/override/
   git commit -m "Custom branding"
   ```

3. **Test updates in a branch first**
   ```bash
   git checkout -b test-update
   git pull origin main
   npm run dev
   # Test everything works
   git checkout main
   git merge test-update
   ```

---

## 📁 Template File Structure

```
template/
├── config/                    # Default configuration templates
│   ├── branding.json         # Store branding (name, colors, etc.)
│   ├── env.example.json      # Environment variable template
│   └── database-config.json  # Database migration info
│
├── override/                  # YOUR custom files (never overwritten)
│   ├── branding.json         # Override branding values
│   ├── logo.svg              # Your custom logo
│   ├── favicon.svg           # Your custom favicon
│   └── README.md             # Override instructions
│
├── scripts/                   # Automation scripts
│   ├── install-template.js   # Interactive setup wizard
│   ├── apply-branding.js     # Apply custom branding
│   └── sync-env.js           # Sync env vars from JSON
│
└── README.md                 # This file
```

---

## 🎨 Customizing Branding

### Method 1: Using Override Files (Recommended)

1. Create `template/override/branding.json`:
```json
{
  "storeName": "My Awesome Store",
  "primaryColor": "#FF6B6B",
  "supportEmail": "hello@mystore.com"
}
```

2. Place your logo files in `template/override/`:
   - `logo.svg` → Will replace `app/icon.svg`
   - `favicon.svg` → Will replace `app/icon.svg`
   - `apple-icon.svg` → Will replace `app/apple-icon.svg`

3. Run:
```bash
node template/scripts/apply-branding.js
```

### Method 2: Direct JSON Edit

1. Edit `template/config/branding.json`
2. Run:
```bash
node template/scripts/apply-branding.js
```

### Method 3: Using Template Mode

1. Set `NEXT_PUBLIC_TEMPLATE_MODE=true` in `.env.local`
2. Edit `lib/template/branding.json` (generated by apply-branding.js)
3. Restart dev server

---

## 🚀 Deploying to Production

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **Add New Project**
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add all variables from `.env.local`
   - **Important**: Set `NEXT_PUBLIC_APP_URL` to your Vercel domain

4. **Deploy**
   - Vercel will automatically deploy
   - Visit your store URL!

### Update Stripe Webhook for Production

1. Go to Stripe Dashboard → Webhooks
2. Edit your webhook endpoint
3. Update URL to: `https://your-vercel-domain.vercel.app/api/webhook`
4. Test the webhook (Stripe will send a test event)

### Update Supabase Redirect URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add to **Redirect URLs**:
   - `https://your-vercel-domain.vercel.app/auth/callback`
   - `https://yourdomain.com/auth/callback` (if using custom domain)

---

## 🔍 Template Mode Explained

### What is Template Mode?

Template mode (`NEXT_PUBLIC_TEMPLATE_MODE=true`) enables:
- ✅ Centralized branding from JSON files
- ✅ Easy customization without code changes
- ✅ Template banner in admin dashboard

### When to Use Template Mode

**Use it if**:
- You want to customize branding easily
- You're deploying multiple stores from this template
- You want to update branding without code changes

**Don't use it if**:
- You've heavily customized the code
- You want to keep existing hardcoded values
- You're not using the template system

### How Template Mode Works

1. **Branding**: Reads from `lib/template/branding.json`
2. **Environment**: Uses centralized env helpers
3. **No Logic Changes**: All business logic remains the same

### Disabling Template Mode

Simply remove or set to false:
```env
NEXT_PUBLIC_TEMPLATE_MODE=false
```

The app will use default hardcoded values (existing behavior).

---

## 🛠️ Troubleshooting

### Issue: "Cannot find module './branding.json'"

**Solution**: Run branding script first:
```bash
node template/scripts/apply-branding.js
```

### Issue: Environment variables not loading

**Solution**: 
1. Check `.env.local` exists in project root
2. Restart dev server after changing `.env.local`
3. Verify variable names match exactly (case-sensitive)

### Issue: Stripe webhook not working

**Solution**:
1. Verify webhook URL is correct in Stripe dashboard
2. Check `STRIPE_WEBHOOK_SECRET` matches Stripe's signing secret
3. For local testing, use [ngrok](https://ngrok.com) to expose localhost

### Issue: Admin dashboard shows "Access Denied"

**Solution**:
1. Verify admin user in database:
   ```sql
   SELECT * FROM user_profiles WHERE is_admin = true;
   ```
2. Check `ADMIN_EMAILS` in `.env.local` matches your email
3. Ensure you're logged in with the admin account

### Issue: Emails not sending

**Solution**:
1. Verify `RESEND_API_KEY` is set correctly
2. Check `RESEND_FROM_EMAIL` is verified in Resend dashboard
3. Check Resend dashboard for error logs

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Resend Docs**: https://resend.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs

---

## ✅ Checklist

Before going live, make sure:

- [ ] All environment variables are set in Vercel
- [ ] Stripe webhook is configured for production URL
- [ ] Supabase redirect URLs include production domain
- [ ] Resend domain is verified (or using onboarding@resend.dev)
- [ ] Admin user is set in database
- [ ] Test a complete checkout flow
- [ ] Test email delivery
- [ ] Custom branding is applied (if using)
- [ ] `NEXT_PUBLIC_APP_URL` points to production domain

---

## 🎉 You're Done!

Your e-commerce store is now ready! If you need help, check the troubleshooting section or refer to the main project documentation.

**Happy selling! 🛍️**

