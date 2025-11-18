# Quick Launch Checklist

## ⚡ Quick Reference - Go Live in 30 Minutes

### Pre-Deployment (10 minutes)

- [ ] **Build Test**
  ```bash
  npm run build
  npm start
  # Test on http://localhost:3000
  ```

- [ ] **Environment Variables Ready**
  - [ ] Supabase production keys
  - [ ] Stripe LIVE keys (not test!)
  - [ ] Webhook secret
  - [ ] Production URL

- [ ] **Database Ready**
  - [ ] Schemas run in production
  - [ ] Dummy data removed
  - [ ] Real products added

### Deployment (10 minutes)

- [ ] **Push to Git**
  ```bash
  git add .
  git commit -m "Production ready"
  git push origin main
  ```

- [ ] **Deploy to Vercel/Netlify**
  - [ ] Import repository
  - [ ] Add environment variables
  - [ ] Deploy

- [ ] **Update URLs**
  - [ ] Stripe webhook URL
  - [ ] OAuth redirect URLs

### Testing (10 minutes)

- [ ] **Critical Paths**
  - [ ] Sign up/Sign in
  - [ ] Add to cart
  - [ ] Checkout
  - [ ] Payment (test card)
  - [ ] Order created

- [ ] **Quick Checks**
  - [ ] Homepage loads
  - [ ] Products display
  - [ ] Images load
  - [ ] Mobile works

### ✅ GO LIVE!

---

## 📋 Detailed Checklist

See `COMPREHENSIVE_DEPLOYMENT_PLAN.md` for full details.

---

## 🆘 Emergency Contacts

- **Vercel Support:** https://vercel.com/support
- **Supabase Support:** https://supabase.com/support
- **Stripe Support:** https://stripe.com/support

---

**Quick Start Guide** - For detailed instructions, see:
- `COMPREHENSIVE_DEPLOYMENT_PLAN.md` - Full deployment guide
- `DATA_MIGRATION_PLAN.md` - Replace dummy data
- `PRE_LAUNCH_EVALUATION.md` - Security & performance review

