# 🚀 Deploy to Vercel (Free Tier) - Step by Step Guide

## 📋 Prerequisites

✅ Your code is already on GitHub (you've done this!)  
✅ GitHub repository: `shooshka133/ecomm-next`  
✅ You have your Supabase and Stripe keys ready

---

## Step 1: Sign Up for Vercel (Free)

1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub account
5. Complete the sign-up process

**Free Tier Includes:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth per month
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Environment variables
- ✅ Preview deployments

---

## Step 2: Import Your Project

1. After logging in, click **"Add New Project"** (or **"Import Project"**)
2. You'll see your GitHub repositories
3. Find and select **`ecomm-next`** (or `shooshka133/ecomm-next`)
4. Click **"Import"**

---

## Step 3: Configure Project Settings

Vercel will auto-detect Next.js, but verify these settings:

### Framework Preset
- **Framework Preset:** `Next.js` ✅ (auto-detected)

### Build Settings
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build` (auto-filled)
- **Output Directory:** `.next` (auto-filled)
- **Install Command:** `npm install` (auto-filled)

### Environment Variables
**⚠️ IMPORTANT: Add these BEFORE deploying!**

Click **"Environment Variables"** section and add:

#### 1. Supabase Variables

```
NEXT_PUBLIC_SUPABASE_URL
```
- **Value:** `https://eqqcidlflclgegsalbub.supabase.co`
- **Environment:** Select all (Production, Preview, Development)

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
- **Value:** Your Supabase anon key (from Supabase Dashboard > Settings > API)
- **Environment:** Select all

```
SUPABASE_SERVICE_ROLE_KEY
```
- **Value:** Your Supabase service_role key (from Supabase Dashboard > Settings > API)
- **Environment:** Production only ⚠️ (keep this secret!)

#### 2. Stripe Variables

**⚠️ For testing, use TEST keys. For production, use LIVE keys!**

```
STRIPE_SECRET_KEY
```
- **Value:** `sk_test_...` (for testing) or `sk_live_...` (for production)
- **Environment:** Production only

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```
- **Value:** `pk_test_...` (for testing) or `pk_live_...` (for production)
- **Environment:** Select all

```
STRIPE_WEBHOOK_SECRET
```
- **Value:** `whsec_...` (you'll get this after setting up webhook)
- **Environment:** Production only

#### 3. Application Variables

```
NEXT_PUBLIC_APP_URL
```
- **Value:** Leave empty for now (we'll update after first deployment)
- **Environment:** Production

**Note:** After first deployment, update this with your Vercel URL (e.g., `https://yourproject.vercel.app`)

---

## Step 4: Deploy!

1. After adding all environment variables, click **"Deploy"**
2. Wait for the build to complete (usually 2-5 minutes)
3. You'll see build logs in real-time
4. Once complete, you'll get a URL like: `https://yourproject.vercel.app`

---

## Step 5: Post-Deployment Configuration

### 5.1 Update App URL

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Find `NEXT_PUBLIC_APP_URL`
4. Update it with your Vercel URL: `https://yourproject.vercel.app`
5. Click **Save**
6. Go to **Deployments** tab
7. Click the **"..."** menu on the latest deployment
8. Click **"Redeploy"** to apply the change

### 5.2 Update Supabase Redirect URLs

1. Go to **Supabase Dashboard** → Your Project
2. Go to **Authentication** → **URL Configuration**
3. Add to **Redirect URLs:**
   - `https://yourproject.vercel.app/api/auth/callback`
   - `https://yourproject.vercel.app/auth/callback` (if you have this route)
4. Add to **Site URL:**
   - `https://yourproject.vercel.app`
5. Click **Save**

### 5.3 Set Up Stripe Webhook

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://yourproject.vercel.app/api/webhook`
4. Select event: **`checkout.session.completed`**
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Go back to Vercel → **Settings** → **Environment Variables**
8. Add/Update `STRIPE_WEBHOOK_SECRET` with the copied value
9. **Redeploy** your project

---

## Step 6: Test Your Deployment

### ✅ Test Checklist

1. **Homepage loads:** Visit `https://yourproject.vercel.app`
2. **Products display:** Check if products are showing
3. **Authentication:**
   - Sign up with email
   - Sign in with Google
4. **Cart:**
   - Add items to cart
   - View cart
5. **Checkout:**
   - Go through checkout flow
   - Test with Stripe test card: `4242 4242 4242 4242`
6. **Orders:**
   - Check if orders appear after payment

---

## 🔄 Automatic Deployments

Vercel automatically deploys when you push to GitHub:

1. **Push to `main` branch** → Deploys to Production
2. **Push to other branches** → Creates Preview deployment
3. **Pull Requests** → Creates Preview deployment

### To trigger a new deployment:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically build and deploy!

---

## 📊 Vercel Dashboard Features

### View Deployments
- Go to **Deployments** tab
- See all your deployments
- Click on any deployment to see details
- View build logs

### Monitor Performance
- **Analytics** tab (available on free tier)
- See page views, performance metrics
- Monitor errors

### Environment Variables
- **Settings** → **Environment Variables**
- Add/Edit/Delete variables
- Different values for Production/Preview/Development

### Custom Domain
- **Settings** → **Domains**
- Add your custom domain (e.g., `yourstore.com`)
- Follow DNS configuration instructions
- Free SSL certificate included!

---

## 🐛 Troubleshooting

### Build Fails

**Check:**
1. Build logs in Vercel dashboard
2. All environment variables are set
3. No syntax errors in code
4. All dependencies are in `package.json`

**Common Issues:**
- Missing environment variables → Add them in Settings
- TypeScript errors → Fix in your code
- Missing dependencies → Check `package.json`

### Environment Variables Not Working

1. Make sure variables are set for correct environment (Production/Preview)
2. Variables starting with `NEXT_PUBLIC_` are available in browser
3. Other variables are server-side only
4. **Redeploy** after adding/updating variables

### Authentication Not Working

1. Check Supabase redirect URLs are updated
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
3. Check browser console for errors

### Stripe Payments Not Working

1. Verify Stripe keys are correct (test vs live)
2. Check webhook is configured
3. Verify `STRIPE_WEBHOOK_SECRET` is set
4. Check Stripe dashboard for webhook events

---

## 💡 Tips for Free Tier

1. **Bandwidth:** 100GB/month is usually enough for small-medium traffic
2. **Builds:** Unlimited builds, but each build has a time limit
3. **Preview Deployments:** Great for testing before production
4. **Custom Domain:** Free SSL included!
5. **Analytics:** Basic analytics included in free tier

---

## 📝 Quick Reference

### Vercel URLs
- **Dashboard:** https://vercel.com/dashboard
- **Documentation:** https://vercel.com/docs

### Your Project
- **GitHub:** https://github.com/shooshka133/ecomm-next
- **Vercel Project:** https://vercel.com/dashboard (after deployment)

### Required Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
```

---

## ✅ Success Checklist

- [ ] Signed up for Vercel
- [ ] Imported GitHub repository
- [ ] Added all environment variables
- [ ] First deployment successful
- [ ] Updated `NEXT_PUBLIC_APP_URL`
- [ ] Updated Supabase redirect URLs
- [ ] Set up Stripe webhook
- [ ] Tested authentication
- [ ] Tested checkout flow
- [ ] Verified orders are created

---

**🎉 Congratulations! Your e-commerce site is now live on Vercel!**

For support, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- Your project's build logs in Vercel dashboard

