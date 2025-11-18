# Comprehensive Deployment Plan: Going Live

## 📋 Overview

This guide provides step-by-step instructions to deploy your e-commerce website to production. Follow each section in order.

---

## 🎯 Pre-Deployment Phase

### Step 1: Final Code Review

#### 1.1 Remove Development Code
```bash
# Check for any test/dummy code
grep -r "test\|dummy\|example" app/ components/ --exclude-dir=node_modules
```

#### 1.2 Verify No Hardcoded Values
- [ ] No hardcoded API keys
- [ ] No hardcoded URLs (use environment variables)
- [ ] No test Stripe keys
- [ ] No localhost URLs

#### 1.3 Build Test
```bash
# Test production build locally
npm run build
npm start

# Test on http://localhost:3000
# Verify everything works
```

#### 1.4 Lint Check
```bash
npm run lint
npm run type-check
```

---

### Step 2: Environment Variables Preparation

#### 2.1 Create Production Environment Variables List

Create a document with all required variables:

```env
# ============================================
# PRODUCTION ENVIRONMENT VARIABLES
# ============================================
# DO NOT COMMIT THIS FILE TO GIT
# ============================================

# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://eqqcidlflclgegsalbub.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key_here

# Stripe (LIVE MODE - CRITICAL!)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

#### 2.2 Get Your Production Keys

**Supabase Keys:**
1. Go to: https://supabase.com/dashboard/project/eqqcidlflclgegsalbub
2. Settings > API
3. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **KEEP SECRET!**

**Stripe Live Keys:**
1. Go to: https://dashboard.stripe.com
2. **Toggle to LIVE mode** (top right)
3. Developers > API keys
4. Copy:
   - Secret key → `STRIPE_SECRET_KEY` (starts with `sk_live_`)
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_live_`)

⚠️ **CRITICAL:** Make sure you're in **LIVE mode**, not test mode!

---

### Step 3: Database Setup

#### 3.1 Run Database Schemas

1. Go to Supabase Dashboard > SQL Editor
2. Run `supabase-schema.sql`:
   - Copy entire file content
   - Paste in SQL Editor
   - Click "Run"
   - Verify success

3. Run `supabase-user-profiles.sql`:
   - Copy entire file content
   - Paste in SQL Editor
   - Click "Run"
   - Verify success

#### 3.2 Verify RLS Policies

1. Go to Authentication > Policies
2. Verify RLS is enabled on:
   - ✅ products
   - ✅ cart_items
   - ✅ orders
   - ✅ order_items
   - ✅ user_profiles
   - ✅ user_addresses

#### 3.3 Test Database Access

1. Go to Table Editor
2. Verify you can see tables
3. Test inserting a product (will be deleted later)

---

### Step 4: Third-Party Service Configuration

#### 4.1 Supabase OAuth Configuration

1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add Site URL: `https://yourdomain.com`
3. Add Redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/api/auth/callback`

#### 4.2 Google OAuth Configuration

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Select your project
3. APIs & Services > Credentials
4. Edit your OAuth 2.0 Client
5. Add Authorized redirect URIs:
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/api/auth/callback`
6. Save

#### 4.3 Stripe Webhook Configuration

1. Go to Stripe Dashboard (LIVE mode)
2. Developers > Webhooks
3. Click "Add endpoint"
4. Endpoint URL: `https://yourdomain.com/api/webhook`
5. Select event: `checkout.session.completed`
6. Click "Add endpoint"
7. Copy the **Signing secret** (starts with `whsec_`)
8. Add to environment variables as `STRIPE_WEBHOOK_SECRET`

---

## 🚀 Deployment Phase

### Step 5: Choose Hosting Platform

#### Option A: Vercel (Recommended for Next.js)

**Why Vercel:**
- ✅ Optimized for Next.js
- ✅ Automatic HTTPS
- ✅ Easy environment variable management
- ✅ Automatic deployments from Git
- ✅ Free tier available

**Deployment Steps:**

1. **Prepare Repository**
   ```bash
   # Make sure .env.local is in .gitignore
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Sign up/Login with GitHub
   - Click "Add New Project"
   - Import your repository
   - Configure:
     - Framework Preset: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Add Environment Variables**
   - In Vercel project settings
   - Go to "Environment Variables"
   - Add all variables from Step 2.1
   - Make sure to select "Production" environment
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note your deployment URL (e.g., `https://yourproject.vercel.app`)

5. **Custom Domain (Optional)**
   - Go to Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

#### Option B: Netlify

**Deployment Steps:**

1. **Prepare Repository** (same as Vercel)

2. **Deploy on Netlify**
   - Go to https://netlify.com
   - Sign up/Login
   - Click "Add new site" > "Import an existing project"
   - Connect GitHub repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`

3. **Add Environment Variables**
   - Site settings > Environment variables
   - Add all variables
   - Save

4. **Deploy**
   - Click "Deploy site"
   - Wait for build

#### Option C: Self-Hosted (VPS/Server)

**Requirements:**
- Node.js 18+ installed
- PM2 or similar process manager
- Nginx or reverse proxy
- SSL certificate (Let's Encrypt)

**Deployment Steps:**

1. **Server Setup**
   ```bash
   # On your server
   git clone your-repo-url
   cd ecomm
   npm install
   npm run build
   ```

2. **Environment Variables**
   ```bash
   # Create .env.production
   nano .env.production
   # Add all environment variables
   ```

3. **Start Application**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start npm --name "ecommerce" -- start
   pm2 save
   pm2 startup
   ```

4. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **SSL Certificate**
   ```bash
   # Using Let's Encrypt
   sudo certbot --nginx -d yourdomain.com
   ```

---

### Step 6: Post-Deployment Configuration

#### 6.1 Update Webhook URL

1. Go to Stripe Dashboard > Webhooks
2. Edit your webhook endpoint
3. Update URL to: `https://yourdomain.com/api/webhook`
4. Save

#### 6.2 Update OAuth Redirect URLs

1. **Supabase:**
   - Dashboard > Authentication > URL Configuration
   - Update redirect URLs to production domain

2. **Google Cloud Console:**
   - Update OAuth redirect URIs to production domain

#### 6.3 Test Webhook

1. Go to Stripe Dashboard > Webhooks
2. Click on your webhook endpoint
3. Click "Send test webhook"
4. Select `checkout.session.completed`
5. Verify it reaches your endpoint

---

## ✅ Post-Deployment Testing

### Step 7: Comprehensive Testing

#### 7.1 Authentication Testing
- [ ] Sign up with email (production)
- [ ] Verify email confirmation works
- [ ] Sign in with email
- [ ] Sign in with Google
- [ ] Password reset
- [ ] Sign out

#### 7.2 Shopping Flow Testing
- [ ] Browse products
- [ ] Search products
- [ ] View product details
- [ ] Add to cart
- [ ] Update cart
- [ ] Remove from cart

#### 7.3 Checkout Testing
- [ ] Add address
- [ ] Select address
- [ ] Proceed to checkout
- [ ] Complete payment with **LIVE** Stripe (use test card: 4242 4242 4242 4242)
- [ ] Verify order created
- [ ] Verify cart cleared
- [ ] View order in orders page

#### 7.4 Profile Testing
- [ ] Update profile
- [ ] Add address
- [ ] Edit address
- [ ] Delete address
- [ ] Set default address

#### 7.5 Cross-Device Testing
- [ ] Desktop (Chrome, Firefox, Safari, Edge)
- [ ] Mobile (iOS Safari, Android Chrome)
- [ ] Tablet

#### 7.6 Performance Testing
- [ ] Page load times (< 3 seconds)
- [ ] Image loading
- [ ] API response times
- [ ] Check browser console for errors

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: Build Fails
**Solution:**
- Check environment variables are set
- Verify all dependencies installed
- Check for TypeScript errors: `npm run type-check`

#### Issue: Webhook Not Working
**Solution:**
- Verify webhook URL is correct
- Check `STRIPE_WEBHOOK_SECRET` is set
- Verify webhook signature verification
- Check Stripe Dashboard > Webhooks > Recent events

#### Issue: OAuth Not Working
**Solution:**
- Verify redirect URLs match exactly
- Check Google Cloud Console settings
- Verify Supabase OAuth settings
- Check browser console for errors

#### Issue: Images Not Loading
**Solution:**
- Verify image URLs are accessible
- Check CORS settings
- Verify Supabase Storage bucket is public (if using)

#### Issue: Orders Not Creating
**Solution:**
- Check webhook is receiving events
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check server logs
- Verify user_id is in checkout metadata

---

## 📊 Monitoring Setup

### Step 8: Set Up Monitoring

#### 8.1 Error Tracking (Recommended: Sentry)

1. Sign up at https://sentry.io
2. Create Next.js project
3. Install: `npm install @sentry/nextjs`
4. Configure Sentry
5. Replace `logError` functions with Sentry

#### 8.2 Analytics (Recommended: Google Analytics)

1. Create Google Analytics account
2. Get tracking ID
3. Add to `app/layout.tsx`:
   ```tsx
   <Script src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" />
   ```

#### 8.3 Uptime Monitoring (Recommended: UptimeRobot)

1. Sign up at https://uptimerobot.com
2. Add monitor for your domain
3. Set up alerts

---

## 🔄 Rollback Plan

### If Something Goes Wrong

#### Vercel Rollback
1. Go to Deployments
2. Find previous working deployment
3. Click "..." > "Promote to Production"

#### Database Rollback
- Supabase has automatic backups
- Can restore from backup if needed
- Contact Supabase support if necessary

#### Code Rollback
```bash
git revert HEAD
git push origin main
# Vercel will auto-deploy
```

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and tested
- [ ] Build succeeds locally
- [ ] All environment variables prepared
- [ ] Database schemas ready
- [ ] Third-party services configured

### Deployment
- [ ] Repository pushed to Git
- [ ] Hosting platform configured
- [ ] Environment variables added
- [ ] Build successful
- [ ] Domain configured (if custom)

### Post-Deployment
- [ ] Webhook URL updated
- [ ] OAuth redirect URLs updated
- [ ] Complete flow tested
- [ ] Mobile devices tested
- [ ] Monitoring set up

### Go-Live
- [ ] All tests passed
- [ ] Monitoring active
- [ ] Support channels ready
- [ ] Backup plan in place

---

## 🎉 Launch Day Checklist

### Morning of Launch
- [ ] Final code review
- [ ] Backup database
- [ ] Test complete flow one more time
- [ ] Verify all environment variables
- [ ] Check monitoring is active

### During Launch
- [ ] Deploy to production
- [ ] Verify deployment successful
- [ ] Test critical paths
- [ ] Monitor error logs
- [ ] Be ready to rollback if needed

### After Launch
- [ ] Monitor for first hour
- [ ] Check error tracking
- [ ] Verify analytics working
- [ ] Test on multiple devices
- [ ] Gather user feedback

---

## 📞 Support & Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs
- Vercel: https://vercel.com/docs

### Getting Help
- Next.js Discord
- Supabase Discord
- Stripe Support
- Vercel Support

---

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ All pages load correctly
- ✅ Authentication works
- ✅ Payments process successfully
- ✅ Orders are created
- ✅ No critical errors in logs
- ✅ Performance is acceptable
- ✅ Mobile experience is good

---

**Last Updated:** $(date)  
**Status:** Ready for Deployment ✅

