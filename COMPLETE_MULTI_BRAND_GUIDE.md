# 🚀 Complete Multi-Brand Store Guide
## Everything You Need to Know - Tablet Friendly Edition

---

## 📖 Table of Contents

1. [What Was Done](#what-was-done)
2. [How It Works](#how-it-works)
3. [Setting Up Environment Variables](#setting-up-environment-variables)
4. [Deploying to Vercel](#deploying-to-vercel)
5. [Self-Hosting with Docker](#self-hosting-with-docker)
6. [Custom Domains Setup](#custom-domains-setup)
7. [Testing Your Store](#testing-your-store)
8. [Troubleshooting](#troubleshooting)
9. [Quick Reference](#quick-reference)

---

## 🎯 What Was Done

Your multi-brand e-commerce store has been upgraded with a **Service Router** system. This means:

✅ **Each brand can have its own:**
- Supabase database project
- Resend email account
- Stripe payment account

✅ **Complete data isolation:**
- Brand A's products are separate from Brand B's
- Brand A's customers are separate from Brand B's
- Each brand's data is completely isolated

✅ **Works everywhere:**
- Vercel (recommended for start)
- AWS
- DigitalOcean
- Docker (self-hosting)
- Any platform!

✅ **Backward compatible:**
- All existing code still works
- No breaking changes
- Gradual migration possible

---

## 🔧 How It Works

### The Service Router Flow

```
1. User visits your store
   ↓
2. System detects active brand (from database or domain)
   ↓
3. Service Router automatically routes to:
   - Correct Supabase project
   - Correct Resend account
   - Correct Stripe account
   ↓
4. Everything works seamlessly!
```

### Brand Detection

The system detects which brand to use from:
1. **Database:** Active brand set in admin panel
2. **Domain:** (Future) Can detect from domain/subdomain
3. **Fallback:** Uses default brand if none found

---

## ⚙️ Setting Up Environment Variables

### What Are Environment Variables?

Environment variables are secret keys and configuration values that tell your app which services to use. Think of them as passwords and addresses for each brand's services.

### Where to Add Them

You need to add these in **three places**:

1. **Local Development:** `.env.local` file
2. **Vercel:** Dashboard → Settings → Environment Variables
3. **Docker:** `.env.docker` file (if self-hosting)

### Complete Environment Variables Template

Copy this template and fill in your actual values:

```env
# ============================================
# BRAND A (Green Theme Store)
# ============================================

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

# ============================================
# BRAND B (Ecommerce Start)
# ============================================

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

# ============================================
# DEFAULT/FALLBACK (Used if brand-specific not found)
# ============================================

# Default Supabase
NEXT_PUBLIC_SUPABASE_URL=https://default.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Default Resend
RESEND_API_KEY=re_default_key
RESEND_FROM_EMAIL=orders@yourplatform.com

# Default Stripe
STRIPE_SECRET_KEY=sk_test_default
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_default
STRIPE_WEBHOOK_SECRET=whsec_default

# ============================================
# APPLICATION SETTINGS
# ============================================

NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
BRAND_USE_DB=true
```

### Where to Find These Values

**Supabase:**
- Go to your Supabase project dashboard
- Settings → API
- Copy "Project URL" and "anon public" key
- Copy "service_role" key (secret!)

**Resend:**
- Go to Resend dashboard
- API Keys section
- Copy your API key
- Use verified domain for FROM_EMAIL

**Stripe:**
- Go to Stripe dashboard
- Developers → API keys
- Copy "Secret key" and "Publishable key"
- Webhooks → Copy signing secret

---

## 🚀 Deploying to Vercel

### Step 1: Create Vercel Account

1. Go to: https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub

### Step 2: Import Your Project

1. Go to: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select your repository
4. Click **"Import"**

### Step 3: Configure Build Settings

Vercel should auto-detect Next.js, but verify:

- **Framework Preset:** `Next.js`
- **Root Directory:** `./`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)

Click **"Deploy"** (we'll add environment variables next)

### Step 4: Add Environment Variables

1. Go to: **Settings** → **Environment Variables**
2. Click **"Add"** for each variable from the template above
3. **Important:** Select environments:
   - ✅ **Production**
   - ✅ **Preview** (for testing)
   - ✅ **Development** (optional)

4. **Mark sensitive variables as "Sensitive":**
   - `SUPABASE_SERVICE_ROLE_KEY*`
   - `RESEND_API_KEY*`
   - `STRIPE_SECRET_KEY*`
   - `STRIPE_WEBHOOK_SECRET*`

### Step 5: Redeploy

After adding environment variables:

1. Go to: **Deployments**
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

Or just push a new commit to trigger auto-deploy.

### Step 6: Verify Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Should see your store homepage
3. Check browser console for errors

### Step 7: Test Brand Switching

1. Go to: `/admin/brand-settings`
2. Create/activate a brand
3. Verify UI updates (colors, logo, name)
4. Test that services route correctly

---

## 🐳 Self-Hosting with Docker

### Why Docker?

Docker lets you run your store on your own server (VPS, cloud, etc.) with complete control and potentially lower costs.

### Step 1: Create Dockerfile

Create a file named `Dockerfile` in your project root:

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Step 2: Update next.config.js

Add this to your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

### Step 3: Create docker-compose.yml

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - .env.docker
    restart: unless-stopped
```

### Step 4: Create .env.docker

Copy all environment variables from the template above into `.env.docker`.

**Important:** Add `.env.docker` to `.gitignore`!

### Step 5: Build and Run

```bash
# Build Docker image
docker-compose build

# Start container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop container
docker-compose down
```

### Step 6: Deploy to VPS

1. **DigitalOcean Droplet:**
   - Create Droplet (Ubuntu 22.04)
   - Install Docker
   - Clone repository
   - Copy `.env.docker`
   - Run `docker-compose up -d`

2. **AWS EC2:**
   - Launch EC2 instance (Ubuntu)
   - Install Docker
   - Clone repository
   - Copy `.env.docker`
   - Run `docker-compose up -d`

---

## 🌐 Custom Domains Setup

### Option 1: Subdomains (Recommended)

**Example:**
- `branda.yourplatform.com` → Brand A
- `brandb.yourplatform.com` → Brand B

**Setup on Vercel:**

1. Go to: **Settings** → **Domains**
2. Click **"Add"**
3. Enter: `branda.yourplatform.com`
4. Configure DNS:
   - Type: `CNAME`
   - Name: `branda`
   - Value: `cname.vercel-dns.com`
5. Wait for SSL (~5 minutes)

**Repeat for Brand B.**

### Option 2: Separate Domains

**Example:**
- `greentheme.com` → Brand A
- `ecommercestart.com` → Brand B

**Setup:**

1. Add both domains in Vercel
2. Configure DNS for each:
   - Type: `A` (root) or `CNAME` (www)
   - Value: Vercel's IP or `cname.vercel-dns.com`
3. Wait for SSL certificates

### DNS Configuration Examples

**Cloudflare:**
- Type: `CNAME`
- Name: `branda`
- Target: `cname.vercel-dns.com`
- Proxy: Off (gray cloud)

**Namecheap:**
- Type: `CNAME Record`
- Host: `branda`
- Value: `cname.vercel-dns.com`
- TTL: Automatic

**GoDaddy:**
- Type: `CNAME`
- Name: `branda`
- Value: `cname.vercel-dns.com`
- TTL: 1 hour

---

## ✅ Testing Your Store

### Testing Checklist

**Brand A (Green Theme Store):**
- [ ] Activate Brand A in admin panel
- [ ] Verify UI shows Brand A colors/logo
- [ ] Test product loading (uses Brand A's Supabase)
- [ ] Test user signup/login (uses Brand A's Supabase)
- [ ] Test checkout (uses Brand A's Stripe)
- [ ] Test order confirmation email (uses Brand A's Resend)

**Brand B (Ecommerce Start):**
- [ ] Activate Brand B in admin panel
- [ ] Verify UI shows Brand B colors/logo
- [ ] Test product loading (uses Brand B's Supabase)
- [ ] Test user signup/login (uses Brand B's Supabase)
- [ ] Test checkout (uses Brand B's Stripe)
- [ ] Test order confirmation email (uses Brand B's Resend)

**Data Isolation:**
- [ ] Brand A's products don't show in Brand B
- [ ] Brand A's customers can't access Brand B's data
- [ ] Complete separation confirmed

**Services:**
- [ ] Supabase routes correctly
- [ ] Resend routes correctly
- [ ] Stripe routes correctly
- [ ] Webhooks work correctly

---

## 🚨 Troubleshooting

### Issue: Environment Variables Not Loading

**Symptoms:**
- Services not routing correctly
- Errors about missing API keys

**Solution:**
1. Check variable names (case-sensitive!)
2. Ensure correct environment selected (Production/Preview)
3. Redeploy after adding variables
4. Check build logs for errors

### Issue: Build Fails

**Symptoms:**
- Deployment fails
- Build errors in logs

**Solution:**
1. Check build logs for specific error
2. Verify `package.json` has all dependencies
3. Check TypeScript compiles
4. Ensure Node.js version is compatible

### Issue: Domain Not Working

**Symptoms:**
- Domain shows "Invalid Configuration"
- SSL certificate not issued

**Solution:**
1. Wait 5-10 minutes for DNS propagation
2. Check DNS records match Vercel instructions
3. Verify SSL certificate issued (green lock icon)
4. Check Vercel dashboard → Domains → Status

### Issue: Wrong Brand Showing

**Symptoms:**
- Brand A shows when Brand B is active
- Services route to wrong brand

**Solution:**
1. Check brand is activated in admin panel
2. Verify environment variables are set
3. Check service router logs
4. Test with default brand first

### Issue: Services Not Routing

**Symptoms:**
- All brands use same Supabase/Resend/Stripe
- No isolation between brands

**Solution:**
1. Verify brand-specific environment variables are set
2. Check service router logs
3. Verify brand slug matches environment variable names
4. Test with one brand at a time

### Issue: Docker Container Won't Start

**Symptoms:**
- Container exits immediately
- Port already in use

**Solution:**
```bash
# Check logs
docker-compose logs

# Check if port 3000 is in use
lsof -i :3000

# Kill process on port 3000
kill -9 $(lsof -t -i:3000)

# Rebuild without cache
docker-compose build --no-cache
```

---

## 📋 Quick Reference

### Environment Variables Checklist

**Brand A:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL_BRAND_A`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A`
- [ ] `SUPABASE_SERVICE_ROLE_KEY_BRAND_A`
- [ ] `RESEND_API_KEY_BRAND_A` (optional)
- [ ] `RESEND_FROM_EMAIL_BRAND_A` (optional)
- [ ] `STRIPE_SECRET_KEY_BRAND_A` (optional)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_A` (optional)
- [ ] `STRIPE_WEBHOOK_SECRET_BRAND_A` (optional)

**Brand B:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL_BRAND_B`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_B`
- [ ] `SUPABASE_SERVICE_ROLE_KEY_BRAND_B`
- [ ] `RESEND_API_KEY_BRAND_B` (optional)
- [ ] `RESEND_FROM_EMAIL_BRAND_B` (optional)
- [ ] `STRIPE_SECRET_KEY_BRAND_B` (optional)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_B` (optional)
- [ ] `STRIPE_WEBHOOK_SECRET_BRAND_B` (optional)

**Default:**
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

### Common Commands

**Vercel:**
```bash
# Deploy (automatic on git push)
git push

# View logs
vercel logs

# Check status
vercel status
```

**Docker:**
```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart
```

**Local Development:**
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Important URLs

**Vercel Dashboard:**
- https://vercel.com/dashboard

**Supabase Dashboard:**
- https://app.supabase.com

**Resend Dashboard:**
- https://resend.com/dashboard

**Stripe Dashboard:**
- https://dashboard.stripe.com

---

## 💡 Pro Tips

1. **Start Simple:**
   - Use one Resend account for all brands (free tier allows this)
   - Use one Stripe account for all brands (test mode)
   - Only separate Supabase projects (required for data isolation)

2. **Test Locally First:**
   - Set up `.env.local` with test values
   - Test brand switching locally
   - Verify everything works before deploying

3. **Use Preview Deployments:**
   - Every Git branch gets a preview URL
   - Perfect for testing brand changes
   - Uses preview environment variables

4. **Monitor Logs:**
   - Check Vercel function logs regularly
   - Watch for errors
   - Monitor service routing

5. **Backup Regularly:**
   - Export Supabase data regularly
   - Keep environment variables backed up
   - Document any custom configurations

---

## 🎯 Next Steps

1. **Set Up Environment Variables:**
   - Add to `.env.local` for local testing
   - Add to Vercel for production
   - Test locally first

2. **Test Brand Switching:**
   - Activate Brand A
   - Verify services route correctly
   - Activate Brand B
   - Verify complete isolation

3. **Deploy to Vercel:**
   - Follow deployment steps above
   - Add all environment variables
   - Test in production

4. **Configure Custom Domains (Optional):**
   - Add domains in Vercel
   - Configure DNS
   - Test domain-based routing

5. **Scale:**
   - Add more brands (just environment variables!)
   - Monitor usage
   - Optimize as needed

---

## 📚 Additional Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Docker Docs:** https://docs.docker.com
- **Supabase Docs:** https://supabase.com/docs
- **Resend Docs:** https://resend.com/docs
- **Stripe Docs:** https://stripe.com/docs

---

## 🎉 Summary

Your multi-brand store is now **fully ready** for:

✅ Multiple Supabase projects (complete data isolation)
✅ Multiple Resend accounts (optional)
✅ Multiple Stripe accounts (optional)
✅ Easy scaling (just add environment variables)
✅ Deployment on any platform (Vercel, AWS, Docker, etc.)
✅ Backward compatible (no breaking changes)

**The service router handles everything automatically!** 🚀

---

**Happy Building! 🎊**

*Last Updated: 2024*

