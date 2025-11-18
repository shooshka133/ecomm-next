# Go-Live Guide: Complete Checklist

## 🎯 Quick Start

This guide consolidates everything you need to go live. Follow these steps in order.

## Step 1: Review Security & Performance ✅

**Status:** Security and performance issues have been reviewed and fixed.

**Key Fixes Applied:**
- ✅ Console logs replaced with production-safe logging
- ✅ Input validation added to API routes
- ✅ Security headers added
- ✅ Error messages sanitized
- ✅ Performance optimizations configured

**See:** `PRODUCTION_ISSUES_AND_FIXES.md` for details

## Step 2: Replace Dummy Data 📦

**See:** `REPLACE_DUMMY_DATA.md` for complete instructions

**Quick Options:**
1. **Supabase Dashboard** (Easiest for few products)
   - Go to Table Editor > products
   - Delete dummy products
   - Add your real products manually

2. **SQL Script** (For bulk operations)
   - Run SQL in Supabase SQL Editor
   - Delete existing, insert new products

3. **Import Script** (For many products)
   - Use `scripts/import-products.ts`
   - Update products array
   - Run the script

**Image Hosting:**
- Recommended: Supabase Storage
- Alternative: Cloudinary, AWS S3, or your CDN

## Step 3: Set Production Environment Variables 🔐

**Critical:** Switch from TEST to LIVE keys!

### Required Variables:

```env
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://eqqcidlflclgegsalbub.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Stripe (LIVE MODE - NOT TEST!)
STRIPE_SECRET_KEY=sk_live_... (NOT sk_test_...)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (NOT pk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_... (Production webhook secret)

# App URL (Production)
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Node Environment
NODE_ENV=production
```

**⚠️ WARNING:**
- Never commit these to Git
- Use hosting platform's environment variables
- Double-check you're using LIVE Stripe keys

## Step 4: Configure Supabase for Production 🗄️

1. **Run Database Schemas:**
   ```sql
   -- Run in Supabase SQL Editor (Production)
   -- 1. supabase-schema.sql
   -- 2. supabase-user-profiles.sql
   ```

2. **Update OAuth Redirect URLs:**
   - Supabase Dashboard > Authentication > URL Configuration
   - Add: `https://yourdomain.com/auth/callback`
   - Add: `https://yourdomain.com/api/auth/callback`

3. **Google OAuth:**
   - Google Cloud Console > Credentials
   - Add redirect URI: `https://yourdomain.com/auth/callback`

## Step 5: Configure Stripe for Production 💳

1. **Switch to Live Mode:**
   - Stripe Dashboard > Toggle to "Live mode"
   - Get your LIVE API keys

2. **Set Up Production Webhook:**
   - Stripe Dashboard > Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhook`
   - Event: `checkout.session.completed`
   - Copy signing secret

3. **Test Webhook:**
   - Send test event from Stripe
   - Verify it reaches your endpoint

## Step 6: Build & Test Locally 🧪

```bash
# Build the application
npm run build

# Test production build
npm start

# Check for errors
npm run lint
```

**Test Checklist:**
- [ ] Homepage loads
- [ ] Products display correctly
- [ ] User can sign up
- [ ] User can sign in (email + Google)
- [ ] User can add to cart
- [ ] User can checkout
- [ ] Payment processes
- [ ] Order is created
- [ ] Cart is cleared
- [ ] User can view orders
- [ ] User can manage profile
- [ ] User can manage addresses

## Step 7: Deploy to Production 🚀

### Vercel (Recommended):

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Deploy:**
   - Go to https://vercel.com
   - Import repository
   - Add all environment variables
   - Deploy

3. **Post-Deployment:**
   - Update Stripe webhook URL
   - Update Google OAuth redirect URLs
   - Test complete flow

**See:** `PRODUCTION_DEPLOYMENT.md` for detailed steps

## Step 8: Post-Launch Verification ✅

### Immediate Checks:
- [ ] Website is accessible
- [ ] HTTPS is working
- [ ] All pages load
- [ ] Images display correctly
- [ ] Authentication works
- [ ] Payment processing works
- [ ] Webhook is receiving events
- [ ] Orders are being created

### First 24 Hours:
- [ ] Monitor error logs
- [ ] Check Stripe dashboard for payments
- [ ] Verify orders in database
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Check page load times

## Step 9: Set Up Monitoring 📊

### Recommended Services:

1. **Error Tracking:**
   - Sentry (https://sentry.io)
   - LogRocket
   - Or similar

2. **Analytics:**
   - Google Analytics
   - Vercel Analytics

3. **Uptime Monitoring:**
   - UptimeRobot
   - Pingdom
   - Or similar

## Common Issues & Solutions

### Issue: Images Not Loading
**Solution:** 
- Check image URLs are accessible
- Verify Supabase Storage bucket is public
- Check CORS settings

### Issue: Payments Not Processing
**Solution:**
- Verify using LIVE Stripe keys (not test)
- Check webhook is configured
- Verify webhook secret is correct

### Issue: Orders Not Creating
**Solution:**
- Check webhook is receiving events
- Verify SUPABASE_SERVICE_ROLE_KEY is set
- Check webhook logs in Stripe

### Issue: Authentication Not Working
**Solution:**
- Verify redirect URLs are correct
- Check Supabase settings
- Verify Google OAuth credentials

## Support Resources

- **Documentation:**
  - `PRODUCTION_CHECKLIST.md` - Complete checklist
  - `REPLACE_DUMMY_DATA.md` - Data replacement guide
  - `PRODUCTION_DEPLOYMENT.md` - Deployment guide
  - `PRODUCTION_ISSUES_AND_FIXES.md` - Issues review

- **External Docs:**
  - [Next.js Deployment](https://nextjs.org/docs/deployment)
  - [Supabase Production](https://supabase.com/docs/guides/hosting)
  - [Stripe Production](https://stripe.com/docs/keys)

## Final Checklist Before Going Live

- [ ] All dummy data replaced with real data
- [ ] All environment variables set (production)
- [ ] Using LIVE Stripe keys (not test)
- [ ] Supabase configured for production
- [ ] Stripe webhook configured
- [ ] Google OAuth redirect URLs updated
- [ ] Build succeeds without errors
- [ ] All functionality tested
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Backup plan ready

## 🎉 You're Ready!

Once all checkboxes are complete, your e-commerce site is ready for production!

**Remember:**
- Monitor closely for first few days
- Keep backups
- Have rollback plan ready
- Document any issues

Good luck with your launch! 🚀

