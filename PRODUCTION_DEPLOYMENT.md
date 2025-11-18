# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables Setup

Create `.env.production` or set in your hosting platform:

```env
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://eqqcidlflclgegsalbub.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Stripe (Production - Switch from test to live keys!)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# App URL (Production)
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Node Environment
NODE_ENV=production
```

**⚠️ CRITICAL:**
- Use **LIVE** Stripe keys (not test keys)
- Use **PRODUCTION** Supabase keys
- Never commit these to Git
- Set in hosting platform's environment variables

### 2. Supabase Production Setup

1. **Run Database Schemas:**
   - Run `supabase-schema.sql` in production database
   - Run `supabase-user-profiles.sql` in production database

2. **Update OAuth Redirect URLs:**
   - Go to Supabase Dashboard > Authentication > URL Configuration
   - Add production URL: `https://yourdomain.com/auth/callback`
   - Add production API callback: `https://yourdomain.com/api/auth/callback`

3. **Google OAuth:**
   - Update Google Cloud Console redirect URIs
   - Add: `https://yourdomain.com/auth/callback`

### 3. Stripe Production Setup

1. **Switch to Live Mode:**
   - Go to Stripe Dashboard
   - Toggle from "Test mode" to "Live mode"
   - Get your live API keys

2. **Webhook Configuration:**
   - Go to Stripe Dashboard > Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhook`
   - Select event: `checkout.session.completed`
   - Copy the signing secret

3. **Test Webhook:**
   - Use Stripe CLI or dashboard to send test event
   - Verify it reaches your endpoint

### 4. Build and Test

```bash
# Build the application
npm run build

# Test the production build locally
npm start

# Check for build errors
npm run lint
```

### 5. Deployment to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add all environment variables
   - Deploy

3. **Post-Deployment:**
   - Update Stripe webhook URL to production
   - Update Google OAuth redirect URLs
   - Test complete flow

### 6. Security Hardening

1. **Remove Console Logs:**
   - All console.log statements should be removed or replaced
   - Use proper logging service (Sentry, LogRocket, etc.)

2. **Enable HTTPS:**
   - Vercel provides HTTPS by default
   - Ensure all external links use HTTPS

3. **Review RLS Policies:**
   - Verify all tables have RLS enabled
   - Test that users can't access others' data

4. **API Security:**
   - All API routes check authentication
   - Webhook verifies Stripe signature
   - Input validation on all endpoints

### 7. Performance Optimization

1. **Image Optimization:**
   - Use Next.js Image component
   - Optimize image sizes
   - Use CDN for images

2. **Caching:**
   - Enable caching for static assets
   - Consider caching product data

3. **Bundle Size:**
   - Check bundle sizes
   - Remove unused dependencies
   - Code splitting where needed

### 8. Monitoring Setup

1. **Error Tracking:**
   - Set up Sentry or similar
   - Monitor for errors

2. **Analytics:**
   - Add Google Analytics
   - Track user behavior

3. **Uptime Monitoring:**
   - Set up uptime monitoring
   - Get alerts for downtime

## Post-Deployment Testing

1. ✅ Test user registration
2. ✅ Test user login (email + Google)
3. ✅ Test password reset
4. ✅ Test adding products to cart
5. ✅ Test checkout flow
6. ✅ Test payment processing
7. ✅ Test order creation
8. ✅ Test address management
9. ✅ Test profile updates
10. ✅ Test on mobile devices
11. ✅ Test on different browsers
12. ✅ Check page load times
13. ✅ Verify all images load
14. ✅ Test error handling

## Rollback Plan

If something goes wrong:

1. **Vercel:**
   - Go to Deployments
   - Find previous working deployment
   - Click "..." > "Promote to Production"

2. **Database:**
   - Keep backups before major changes
   - Can restore from Supabase backups

## Maintenance

1. **Regular Updates:**
   - Update dependencies regularly
   - Security patches
   - Feature updates

2. **Monitoring:**
   - Check error logs daily
   - Monitor performance
   - Review user feedback

3. **Backups:**
   - Database backups (Supabase handles this)
   - Code backups (Git)

## Support

- Monitor error logs
- Set up alerts
- Have support email ready
- Document common issues

