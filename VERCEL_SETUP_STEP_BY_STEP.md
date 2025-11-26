# Vercel Setup Guide - Step by Step

Complete guide to deploy your multi-brand e-commerce store on Vercel.

---

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Vercel account (free tier works)
- [ ] Code pushed to GitHub repository
- [ ] Supabase projects created (one per brand)
- [ ] Resend account (optional: one per brand)
- [ ] Stripe account (optional: one per brand)

---

## 🚀 Step 1: Connect GitHub to Vercel

### 1.1 Create Vercel Account

1. Go to: https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub

### 1.2 Import Project

1. Go to: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select your repository (e.g., `your-username/ecomm`)
4. Click **"Import"**

---

## ⚙️ Step 2: Configure Build Settings

Vercel should auto-detect Next.js, but verify:

1. **Framework Preset:** `Next.js`
2. **Root Directory:** `./` (or your project root)
3. **Build Command:** `npm run build` (auto-detected)
4. **Output Directory:** `.next` (auto-detected)
5. **Install Command:** `npm install` (auto-detected)

Click **"Deploy"** (we'll add environment variables next)

---

## 🔐 Step 3: Add Environment Variables

### 3.1 Go to Environment Variables

1. After first deployment, go to: **Settings** → **Environment Variables**
2. Or: **Project** → **Settings** → **Environment Variables**

### 3.2 Add Brand A (Green Theme Store) Variables

Click **"Add"** for each variable:

```env
# Supabase - Brand A
NEXT_PUBLIC_SUPABASE_URL_BRAND_A=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY_BRAND_A=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend - Brand A (optional, can share one account)
RESEND_API_KEY_BRAND_A=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL_BRAND_A=orders@greentheme.com
RESEND_FROM_NAME_BRAND_A=Green Theme Store

# Stripe - Brand A (optional, can share one account)
STRIPE_SECRET_KEY_BRAND_A=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_A=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET_BRAND_A=whsec_xxxxxxxxxxxxx
```

**Important:** Select environments:
- ✅ **Production**
- ✅ **Preview** (for testing)
- ✅ **Development** (optional)

### 3.3 Add Brand B (Ecommerce Start) Variables

```env
# Supabase - Brand B
NEXT_PUBLIC_SUPABASE_URL_BRAND_B=https://yyyyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_B=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY_BRAND_B=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend - Brand B (optional)
RESEND_API_KEY_BRAND_B=re_yyyyyyyyyyyyy
RESEND_FROM_EMAIL_BRAND_B=orders@ecommercestart.com
RESEND_FROM_NAME_BRAND_B=Ecommerce Start

# Stripe - Brand B (optional)
STRIPE_SECRET_KEY_BRAND_B=sk_test_yyyyyyyyyyyyy
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_B=pk_test_yyyyyyyyyyyyy
STRIPE_WEBHOOK_SECRET_BRAND_B=whsec_yyyyyyyyyyyyy
```

### 3.4 Add Default/Fallback Variables

These are used if brand-specific variables are missing:

```env
# Default Supabase (fallback)
NEXT_PUBLIC_SUPABASE_URL=https://default.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Default Resend (fallback)
RESEND_API_KEY=re_default_key
RESEND_FROM_EMAIL=orders@yourplatform.com

# Default Stripe (fallback)
STRIPE_SECRET_KEY=sk_test_default
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_default
STRIPE_WEBHOOK_SECRET=whsec_default

# Application
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
BRAND_USE_DB=true
```

### 3.5 Mark Sensitive Variables

For security, mark these as **"Sensitive"**:
- `SUPABASE_SERVICE_ROLE_KEY*`
- `RESEND_API_KEY*`
- `STRIPE_SECRET_KEY*`
- `STRIPE_WEBHOOK_SECRET*`

---

## 🌐 Step 4: Configure Custom Domains

### 4.1 Add Main Domain

1. Go to: **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain: `yourplatform.com`
4. Click **"Add"**

### 4.2 Configure DNS

Vercel will show DNS instructions:

**For Root Domain (yourplatform.com):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21` (Vercel's IP)

**For Subdomain (www.yourplatform.com):**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

### 4.3 Add Brand-Specific Domains

**Option A: Subdomains (Recommended)**
```
branda.yourplatform.com → Brand A
brandb.yourplatform.com → Brand B
```

**Option B: Separate Domains**
```
greentheme.com → Brand A
ecommercestart.com → Brand B
```

**Setup:**
1. Add each domain in Vercel
2. Configure DNS (CNAME to `cname.vercel-dns.com`)
3. Wait for SSL certificate (automatic, ~5 minutes)

---

## 🔄 Step 5: Redeploy with Environment Variables

After adding environment variables:

1. Go to: **Deployments**
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Or: Push a new commit to trigger auto-deploy

**Verify:**
- Check build logs for errors
- Environment variables are loaded
- Build completes successfully

---

## ✅ Step 6: Verify Deployment

### 6.1 Check Homepage

1. Visit: `https://your-vercel-app.vercel.app`
2. Should see your store homepage
3. Check browser console for errors

### 6.2 Test Brand Switching

1. Go to: `/admin/brand-settings`
2. Create/activate a brand
3. Verify UI updates (colors, logo, name)
4. Check that services route correctly

### 6.3 Test Services

**Supabase:**
- Sign up/login works
- Products load
- Cart functions

**Resend:**
- Order confirmation emails send
- Check Resend dashboard for logs

**Stripe:**
- Checkout creates session
- Payments process
- Webhooks receive events

---

## 🔧 Step 7: Configure Stripe Webhooks

### 7.1 Get Webhook URL

Your webhook URL:
```
https://your-vercel-app.vercel.app/api/webhook
```

### 7.2 Add to Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter webhook URL
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copy **"Signing secret"**
6. Add to Vercel as `STRIPE_WEBHOOK_SECRET`

### 7.3 Test Webhook

1. Make a test purchase
2. Check Stripe dashboard → Webhooks → Latest events
3. Should show `200 OK`

---

## 📊 Step 8: Monitor Deployments

### 8.1 View Logs

1. Go to: **Deployments** → Click deployment
2. Click **"Functions"** tab
3. View real-time logs

### 8.2 Check Errors

1. Go to: **Deployments** → **Logs**
2. Filter by error level
3. Fix issues and redeploy

### 8.3 Analytics (Pro Only)

- **Vercel Analytics:** Built-in
- **Web Vitals:** Performance metrics
- **Real User Monitoring:** User experience data

---

## 🚨 Troubleshooting

### Issue: Environment Variables Not Loading

**Solution:**
1. Check variable names (case-sensitive)
2. Ensure correct environment selected
3. Redeploy after adding variables
4. Check build logs for errors

### Issue: Build Fails

**Solution:**
1. Check build logs for specific error
2. Verify `package.json` has all dependencies
3. Check Node.js version (Vercel auto-detects)
4. Ensure TypeScript compiles

### Issue: Domain Not Working

**Solution:**
1. Wait 5-10 minutes for DNS propagation
2. Check DNS records match Vercel instructions
3. Verify SSL certificate issued (green lock icon)
4. Check Vercel dashboard → Domains → Status

### Issue: Services Not Routing Correctly

**Solution:**
1. Verify brand is activated in admin
2. Check environment variables are set
3. Verify service router logs
4. Test with default brand first

---

## 📝 Environment Variables Checklist

Copy this checklist:

### Brand A (Green Theme Store)
- [ ] `NEXT_PUBLIC_SUPABASE_URL_BRAND_A`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A`
- [ ] `SUPABASE_SERVICE_ROLE_KEY_BRAND_A`
- [ ] `RESEND_API_KEY_BRAND_A` (optional)
- [ ] `RESEND_FROM_EMAIL_BRAND_A` (optional)
- [ ] `STRIPE_SECRET_KEY_BRAND_A` (optional)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_A` (optional)
- [ ] `STRIPE_WEBHOOK_SECRET_BRAND_A` (optional)

### Brand B (Ecommerce Start)
- [ ] `NEXT_PUBLIC_SUPABASE_URL_BRAND_B`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_B`
- [ ] `SUPABASE_SERVICE_ROLE_KEY_BRAND_B`
- [ ] `RESEND_API_KEY_BRAND_B` (optional)
- [ ] `RESEND_FROM_EMAIL_BRAND_B` (optional)
- [ ] `STRIPE_SECRET_KEY_BRAND_B` (optional)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_B` (optional)
- [ ] `STRIPE_WEBHOOK_SECRET_BRAND_B` (optional)

### Default/Fallback
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NODE_ENV`
- [ ] `BRAND_USE_DB`

---

## 🎯 Next Steps

After deployment:

1. **Test all features:**
   - User registration/login
   - Product browsing
   - Cart and checkout
   - Order confirmation emails
   - Brand switching

2. **Set up monitoring:**
   - Vercel Analytics (if Pro)
   - Error tracking (Sentry, LogRocket)
   - Uptime monitoring (UptimeRobot)

3. **Optimize:**
   - Enable Vercel Edge Caching
   - Optimize images (Next.js Image)
   - Enable compression

4. **Scale:**
   - Add more brands (just environment variables!)
   - Monitor usage
   - Upgrade to Pro if needed

---

## 💡 Pro Tips

1. **Preview Deployments:**
   - Every Git branch gets a preview URL
   - Perfect for testing brand changes
   - Uses preview environment variables

2. **Environment-Specific Variables:**
   - Production: Real keys
   - Preview: Test keys
   - Development: Local keys

3. **Automatic Deployments:**
   - Push to `main` → Production
   - Push to other branch → Preview
   - No manual deployment needed

4. **Rollback:**
   - Go to Deployments
   - Click "..." on previous deployment
   - Click "Promote to Production"

---

## 📚 Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables
- **Custom Domains:** https://vercel.com/docs/concepts/projects/domains

---

**Your multi-brand store is now live on Vercel! 🎉**

