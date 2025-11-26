# Vercel Multi-Brand Deployment Guide

## 🎯 Vercel's Role in Multi-Brand Architecture

### Current Situation

**Vercel hosts:**
- ✅ Next.js application (frontend + API routes)
- ✅ Serverless functions (API routes)
- ✅ Static assets
- ❌ **NOT** the database (Supabase)
- ❌ **NOT** email service (Resend)
- ❌ **NOT** payment processing (Stripe)

**Key Point:** Vercel only hosts your **application code**. All services (Supabase, Resend, Stripe) are external and work the same regardless of where you deploy.

---

## 📊 Vercel Deployment Options for Multi-Brand

### Option 1: Single Vercel Project (Recommended)

**Structure:**
```
Vercel Project (Single)
├── Next.js App
├── Routes to Supabase Project 1 (Brand A)
├── Routes to Supabase Project 2 (Brand B)
└── Uses service router to switch based on active brand
```

**How It Works:**
- One Vercel deployment
- Environment variables for both brands
- Service router (`lib/services/router.ts`) selects correct service based on active brand
- Brand switching happens at runtime (no redeployment needed)

**Pros:**
- ✅ Simple setup
- ✅ One deployment
- ✅ Easy to manage
- ✅ Free tier available
- ✅ Automatic deployments from Git

**Cons:**
- ❌ All brands share same deployment
- ❌ Can't scale brands independently
- ❌ One deployment issue affects all brands

**Cost:**
- Free tier: Unlimited projects, 100GB bandwidth
- Pro: $20/month (if needed)

---

### Option 2: Separate Vercel Projects Per Brand

**Structure:**
```
Vercel Project 1 (Brand A)
├── Next.js App
├── Environment: Supabase Project 1
├── Environment: Resend Account 1
└── Environment: Stripe Account 1

Vercel Project 2 (Brand B)
├── Next.js App
├── Environment: Supabase Project 2
├── Environment: Resend Account 2
└── Environment: Stripe Account 2
```

**How It Works:**
- Separate Vercel project per brand
- Each has its own environment variables
- Each can have different domains
- Independent deployments

**Pros:**
- ✅ Complete deployment isolation
- ✅ Independent scaling
- ✅ Different domains per brand
- ✅ One brand issue doesn't affect others
- ✅ Can use different Vercel plans per brand

**Cons:**
- ❌ More projects to manage
- ❌ Code duplication (or need monorepo)
- ❌ More complex CI/CD
- ❌ More environment variables to manage

**Cost:**
- Free tier: Unlimited projects ✅
- Each project gets free tier limits
- Pro: $20/month per project (if needed)

---

### Option 3: Vercel + Custom Domains (Subdomain Routing)

**Structure:**
```
Vercel Project (Single)
├── branda.yourplatform.com → Routes to Brand A services
├── brandb.yourplatform.com → Routes to Brand B services
└── Uses domain/subdomain to determine brand
```

**How It Works:**
- Single Vercel deployment
- Multiple custom domains
- Detect brand from domain/subdomain
- Route to correct services

**Pros:**
- ✅ One deployment
- ✅ Custom domains per brand
- ✅ Professional appearance
- ✅ Easy to manage

**Cons:**
- ❌ Need domain routing logic
- ❌ More complex brand detection

**Cost:**
- Free tier: Unlimited custom domains ✅
- No extra cost

---

## 🚀 Recommended Setup: Single Vercel Project

### Why Single Project?

1. **Simpler Management**
   - One deployment
   - One set of code
   - One CI/CD pipeline

2. **Cost Effective**
   - Free tier covers everything
   - No need for multiple projects

3. **Service Router Handles Separation**
   - Code routes to correct services
   - No need for separate deployments

4. **Easy to Scale**
   - Add more brands = just update environment variables
   - No new deployments needed

---

## 📋 Vercel Configuration for Multi-Brand

### Environment Variables Setup

In Vercel Dashboard → Settings → Environment Variables:

```env
# Brand A (Green Theme Store)
NEXT_PUBLIC_SUPABASE_URL_BRAND_A=https://project-a.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A=key_a
SUPABASE_SERVICE_ROLE_KEY_BRAND_A=service_key_a

RESEND_API_KEY_BRAND_A=re_key_a
RESEND_FROM_EMAIL_BRAND_A=noreply@yourplatform.com
RESEND_FROM_NAME_BRAND_A=Green Theme Store

STRIPE_SECRET_KEY_BRAND_A=sk_test_a
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_A=pk_test_a
STRIPE_WEBHOOK_SECRET_BRAND_A=whsec_a

# Brand B (Ecommerce Start)
NEXT_PUBLIC_SUPABASE_URL_BRAND_B=https://project-b.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_B=key_b
SUPABASE_SERVICE_ROLE_KEY_BRAND_B=service_key_b

RESEND_API_KEY_BRAND_B=re_key_b
RESEND_FROM_EMAIL_BRAND_B=noreply@yourplatform.com
RESEND_FROM_NAME_BRAND_B=Ecommerce Start

STRIPE_SECRET_KEY_BRAND_B=sk_test_b
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_B=pk_test_b
STRIPE_WEBHOOK_SECRET_BRAND_B=whsec_b

# Fallback (for default brand)
NEXT_PUBLIC_SUPABASE_URL=https://default.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=default_key
SUPABASE_SERVICE_ROLE_KEY=default_service_key

RESEND_API_KEY=re_default_key
RESEND_FROM_EMAIL=noreply@yourplatform.com

STRIPE_SECRET_KEY=sk_test_default
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_default
STRIPE_WEBHOOK_SECRET=whsec_default

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
BRAND_USE_DB=true
```

### Environment-Specific Variables

Vercel allows different values per environment:
- **Production:** Production keys
- **Preview:** Test keys
- **Development:** Local keys

**Setup:**
1. Add variable
2. Select environments (Production, Preview, Development)
3. Save

---

## 🌐 Custom Domains Per Brand

### Option A: Subdomains (Recommended)

```
Main Domain: yourplatform.com
├── Brand A: branda.yourplatform.com
├── Brand B: brandb.yourplatform.com
└── Admin: admin.yourplatform.com
```

**Setup:**
1. Vercel Dashboard → Settings → Domains
2. Add domain: `branda.yourplatform.com`
3. Add domain: `brandb.yourplatform.com`
4. Update DNS (CNAME records)
5. Code detects brand from domain

**Brand Detection:**
```typescript
// Detect brand from domain
const hostname = request.headers.get('host') || ''
if (hostname.includes('branda')) {
  // Use Brand A services
} else if (hostname.includes('brandb')) {
  // Use Brand B services
}
```

### Option B: Separate Domains

```
Brand A: greentheme.com
Brand B: ecommercestart.com
```

**Setup:**
1. Add both domains to Vercel
2. Configure DNS for each
3. Code detects brand from domain

---

## 💰 Vercel Pricing for Multi-Brand

### Free Tier (Hobby)

**Limits:**
- ✅ Unlimited projects
- ✅ 100GB bandwidth/month
- ✅ Unlimited serverless function executions
- ✅ Automatic HTTPS
- ✅ Custom domains (unlimited)
- ✅ Preview deployments

**Perfect For:**
- Testing
- Small to medium traffic
- Multiple brands

### Pro Tier ($20/month)

**Additional:**
- ✅ 1TB bandwidth/month
- ✅ Team collaboration
- ✅ Password protection
- ✅ Analytics
- ✅ More function execution time

**When Needed:**
- High traffic
- Team access
- Advanced features

---

## 🔄 Deployment Workflow

### Single Project Workflow

```
1. Code Change
   ↓
2. Git Push
   ↓
3. Vercel Auto-Deploy
   ↓
4. Build Next.js App
   ↓
5. Deploy to Vercel
   ↓
6. All Brands Use New Deployment
```

**Brand Switching:**
- Happens at runtime (no redeployment)
- Service router selects correct services
- Based on active brand in database

### Separate Projects Workflow

```
1. Code Change
   ↓
2. Git Push
   ↓
3. Vercel Deploys Project 1 (Brand A)
   ↓
4. Vercel Deploys Project 2 (Brand B)
   ↓
5. Each Brand Has Independent Deployment
```

**Brand Switching:**
- Each brand has its own deployment
- No runtime switching needed
- Complete isolation

---

## 🚀 Deployment to Other Platforms

### Vercel → AWS Migration

**Why Migrate:**
- More control
- Lower cost at scale
- Enterprise requirements
- Self-hosting needs

**What Changes:**
- ✅ Application code: Same
- ✅ Environment variables: Same structure
- ✅ Service router: Works the same
- ❌ Deployment method: Different

**Options:**
1. **AWS Amplify** (Similar to Vercel)
   - Git-based deployment
   - Serverless functions
   - Easy migration

2. **AWS EC2 + Docker**
   - Full control
   - Self-hosted
   - More complex

3. **AWS ECS Fargate**
   - Container-based
   - Auto-scaling
   - Managed

---

### Vercel → DigitalOcean Migration

**Why Migrate:**
- Lower cost
- More control
- Docker support
- Simpler pricing

**What Changes:**
- ✅ Application code: Same
- ✅ Environment variables: Same
- ✅ Service router: Works the same
- ❌ Deployment: Docker or App Platform

**Options:**
1. **DigitalOcean App Platform**
   - Similar to Vercel
   - Git-based
   - Easy migration

2. **DigitalOcean Droplet + Docker**
   - Full control
   - Self-hosted
   - $12-24/month

---

### Vercel → Docker Self-Hosting

**Why Migrate:**
- Maximum control
- Lowest cost
- No vendor lock-in
- Works anywhere

**What Changes:**
- ✅ Application code: Same
- ✅ Environment variables: Same
- ✅ Service router: Works the same
- ❌ Deployment: Docker Compose

**Setup:**
```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL_BRAND_A=...
      - NEXT_PUBLIC_SUPABASE_URL_BRAND_B=...
      # ... all environment variables
```

---

## 🎯 Vercel-Specific Considerations

### 1. Serverless Functions

**Current:**
- API routes run as serverless functions
- Each route is a separate function
- Cold start possible (first request)

**Multi-Brand Impact:**
- Service router adds minimal overhead
- Functions are stateless (perfect for multi-brand)
- No issues with brand switching

### 2. Edge Functions (Optional)

**For:**
- Brand detection from domain
- Fast routing
- Global distribution

**Not Required:**
- Service router works fine with regular API routes

### 3. Build Time vs Runtime

**Build Time:**
- Next.js builds static pages
- API routes compiled
- Environment variables injected

**Runtime:**
- Service router selects services
- Brand switching happens at runtime
- No rebuild needed

### 4. Preview Deployments

**How It Works:**
- Each Git branch gets preview URL
- Perfect for testing brand changes
- Uses preview environment variables

**Multi-Brand Testing:**
- Test Brand A on preview
- Test Brand B on preview
- Both use test Supabase projects

---

## 📋 Vercel Setup Checklist

### Initial Setup

- [ ] Create Vercel account (if not exists)
- [ ] Connect GitHub repository
- [ ] Import project
- [ ] Configure build settings:
  - Framework: Next.js
  - Build Command: `npm run build`
  - Output Directory: `.next`

### Environment Variables

- [ ] Add Brand A Supabase keys
- [ ] Add Brand B Supabase keys
- [ ] Add Resend keys (1 or 2 accounts)
- [ ] Add Stripe keys (1 or 2 accounts)
- [ ] Add application config
- [ ] Test in Preview environment

### Custom Domains

- [ ] Add main domain
- [ ] Add Brand A subdomain/domain
- [ ] Add Brand B subdomain/domain
- [ ] Configure DNS
- [ ] Wait for SSL certificate

### Testing

- [ ] Deploy to production
- [ ] Test Brand A (activate in admin)
- [ ] Test Brand B (activate in admin)
- [ ] Verify services route correctly
- [ ] Test email sending
- [ ] Test payments

---

## 💡 Recommendations

### For Your Situation:

**Start: Single Vercel Project**
- ✅ Simple
- ✅ Free tier
- ✅ Easy to manage
- ✅ Service router handles separation

**Scale: Keep Single Project**
- ✅ Add more brands = just environment variables
- ✅ No new deployments
- ✅ Cost-effective

**If Needed: Separate Projects**
- Only if you need:
  - Independent scaling per brand
  - Different Vercel plans per brand
  - Complete deployment isolation

---

## 🔄 Migration Path

### Vercel → Other Platforms

**Code Changes:**
- ✅ None! Service router works everywhere
- ✅ Same environment variables
- ✅ Same code structure

**Deployment Changes:**
- Vercel: Git push → Auto-deploy
- AWS: Git push → CI/CD → Deploy
- DigitalOcean: Git push → App Platform or Docker
- Docker: `docker-compose up`

**Services:**
- ✅ Supabase: Same (external)
- ✅ Resend: Same (external)
- ✅ Stripe: Same (external)

**Result:** Your code is **deployment-agnostic**! ✅

---

## ❓ Common Questions

**Q: Do I need separate Vercel projects for each brand?**
A: No! Single project with service router is recommended.

**Q: Can I use custom domains per brand on Vercel?**
A: Yes! Free tier allows unlimited custom domains.

**Q: What if I exceed Vercel free tier?**
A: Upgrade to Pro ($20/month) or migrate to AWS/DigitalOcean.

**Q: Can I deploy same code to multiple platforms?**
A: Yes! Code is platform-agnostic. Service router works everywhere.

**Q: What about Vercel's serverless functions?**
A: Perfect for multi-brand! Stateless, scales automatically.

---

## 🚀 Next Steps

Would you like me to:

1. **Create Vercel deployment guide** (step-by-step)
2. **Create Docker setup** (for self-hosting option)
3. **Create AWS deployment guide** (for future migration)
4. **Create DigitalOcean deployment guide** (for future migration)
5. **Update code to use service router** (make it deployment-agnostic)

The service router I created makes your code work on **any platform** - Vercel, AWS, DigitalOcean, Docker, or self-hosted! 🎯

