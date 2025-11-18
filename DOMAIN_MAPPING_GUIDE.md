# 🌐 Domain Mapping Guide: Connect shooshka.online to Vercel

## 📋 Overview

This guide shows you how to connect your domain `shooshka.online` to your Vercel-hosted website.

---

## Step 1: Add Domain in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in to your account

2. **Select Your Project**
   - Click on your e-commerce project

3. **Go to Settings**
   - Click **"Settings"** tab (top navigation)
   - Click **"Domains"** (left sidebar)

4. **Add Domain**
   - Click **"Add Domain"** button
   - Enter: `shooshka.online`
   - Click **"Add"**

5. **Vercel will show DNS configuration**
   - You'll see instructions for DNS records
   - **Note the values** (you'll need them in the next step)

---

## Step 2: Configure DNS Records

You need to add DNS records at your domain registrar (where you bought `shooshka.online`).

### Option A: Using CNAME (Recommended - Easier)

**If Vercel shows a CNAME record:**

1. **Go to your domain registrar** (e.g., Namecheap, GoDaddy, Cloudflare, etc.)
2. **Find DNS Management** (usually under "DNS Settings" or "Domain Settings")
3. **Add a CNAME record:**
   - **Type:** `CNAME`
   - **Name/Host:** `@` (or leave blank, or `www` if you want www.shooshka.online)
   - **Value/Target:** Vercel will show something like `cname.vercel-dns.com` or `yourproject.vercel.app`
   - **TTL:** `3600` (or Auto)
4. **Save the record**

**For both www and non-www:**
- Add CNAME for `@` → Vercel target
- Add CNAME for `www` → Vercel target

### Option B: Using A Records (If CNAME not supported)

**If your registrar doesn't support CNAME for root domain:**

1. **Vercel will show A record IP addresses** (usually 4 IPs)
2. **Add A records at your registrar:**
   - **Type:** `A`
   - **Name/Host:** `@` (or leave blank)
   - **Value:** Each IP address Vercel provides (add 4 separate A records)
   - **TTL:** `3600`

**Example A records:**
```
Type: A, Name: @, Value: 76.76.21.21
Type: A, Name: @, Value: 76.76.21.22
Type: A, Name: @, Value: 76.76.21.23
Type: A, Name: @, Value: 76.76.21.24
```

---

## Step 3: Wait for DNS Propagation

1. **DNS changes take time to propagate**
   - Usually: **5-30 minutes**
   - Can take up to: **24-48 hours** (rare)

2. **Check DNS propagation:**
   - Visit: https://dnschecker.org
   - Enter: `shooshka.online`
   - Select: `A` or `CNAME` record type
   - Click "Search"
   - Wait until all locations show the correct values

3. **Vercel will verify automatically**
   - Go back to Vercel → Settings → Domains
   - Status will change from "Pending" to "Valid" when ready
   - You'll see a green checkmark ✅

---

## Step 4: SSL Certificate (Automatic)

1. **Vercel automatically issues SSL certificate**
   - No action needed from you
   - Usually takes 5-10 minutes after DNS is verified

2. **Check SSL status:**
   - In Vercel → Settings → Domains
   - You'll see "SSL Certificate" status
   - Should show "Valid" with a green checkmark ✅

---

## Step 5: Update Environment Variables

After your domain is connected:

1. **Go to Vercel → Settings → Environment Variables**
2. **Update `NEXT_PUBLIC_APP_URL`:**
   - Change from: `https://yourproject.vercel.app`
   - Change to: `https://shooshka.online`
3. **Click "Save"**
4. **Redeploy:**
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

---

## Step 6: Update Supabase & Stripe

### Supabase Configuration

1. **Go to Supabase Dashboard** → Your Project
2. **Authentication** → **URL Configuration**
3. **Update Site URL:**
   - Change to: `https://shooshka.online`
4. **Update Redirect URLs:**
   - Add: `https://shooshka.online/api/auth/callback`
   - Keep Vercel URL as backup: `https://yourproject.vercel.app/api/auth/callback`
5. **Click "Save"**

### Stripe Webhook (if not done yet)

1. **Go to Stripe Dashboard** → **Developers** → **Webhooks**
2. **Add endpoint** (or edit existing):
   - **Endpoint URL:** `https://shooshka.online/api/webhook`
   - **Event:** `checkout.session.completed`
3. **Save and copy the signing secret**
4. **Add to Vercel environment variables** as `STRIPE_WEBHOOK_SECRET`

---

## 🎯 Common Domain Registrars - Quick Guides

### Namecheap

1. Go to **Domain List** → Click **"Manage"** next to your domain
2. Go to **Advanced DNS** tab
3. Click **"Add New Record"**
4. Select **CNAME Record** or **A Record**
5. Enter values from Vercel
6. Click **"Save"**

### GoDaddy

1. Go to **My Products** → Click **"DNS"** next to your domain
2. Scroll to **"Records"** section
3. Click **"Add"**
4. Select **CNAME** or **A** record type
5. Enter values from Vercel
6. Click **"Save"**

### Cloudflare

1. Go to your domain in Cloudflare dashboard
2. Click **"DNS"** tab
3. Click **"Add record"**
4. Select **CNAME** or **A** record type
5. Enter values from Vercel
6. **Proxy status:** Can be "Proxied" (orange cloud) or "DNS only" (gray cloud)
7. Click **"Save"**

### Google Domains

1. Go to **My Domains** → Click your domain
2. Click **"DNS"** tab
3. Scroll to **"Custom resource records"**
4. Click **"Add"**
5. Select **CNAME** or **A** record
6. Enter values from Vercel
7. Click **"Save"**

---

## ✅ Verification Checklist

After DNS propagation:

- [ ] Visit `https://shooshka.online` - should show your website
- [ ] Check browser shows 🔒 (SSL certificate working)
- [ ] Vercel dashboard shows domain as "Valid"
- [ ] `NEXT_PUBLIC_APP_URL` updated in Vercel
- [ ] Supabase Site URL updated
- [ ] Supabase Redirect URLs updated
- [ ] Stripe webhook URL updated
- [ ] Test authentication (sign up/sign in)
- [ ] Test checkout flow

---

## 🐛 Troubleshooting

### Domain Not Working After 24 Hours

**Check:**
1. DNS records are correct (use https://dnschecker.org)
2. No typos in DNS values
3. TTL is not too high (should be 3600 or lower)
4. Domain is not expired

**Solution:**
- Double-check DNS values match exactly what Vercel shows
- Wait a bit longer (can take up to 48 hours)
- Contact your domain registrar support

### SSL Certificate Not Issuing

**Check:**
1. DNS is fully propagated
2. Domain is verified in Vercel
3. No firewall blocking Vercel's verification

**Solution:**
- Wait 10-15 minutes after DNS verification
- Check Vercel dashboard for any error messages
- Try removing and re-adding domain in Vercel

### Website Shows "Not Found" or Error

**Check:**
1. Domain is connected to correct Vercel project
2. Project is deployed successfully
3. Environment variables are set correctly

**Solution:**
- Verify domain is in correct project
- Check deployment status
- Redeploy the project

### Can't Access Domain Registrar

**Solution:**
- Check your email for domain purchase confirmation
- Look for registrar name in domain WHOIS: https://whois.net
- Contact registrar support with domain name

---

## 📝 Quick Reference

### Your Domain
- **Domain:** `shooshka.online`
- **Vercel URL:** `https://yourproject.vercel.app` (backup)

### DNS Records Needed
- **CNAME:** `@` → Vercel target (or)
- **A Records:** `@` → 4 IP addresses from Vercel

### URLs to Update
- **Vercel:** `NEXT_PUBLIC_APP_URL = https://shooshka.online`
- **Supabase Site URL:** `https://shooshka.online`
- **Supabase Redirect:** `https://shooshka.online/api/auth/callback`
- **Stripe Webhook:** `https://shooshka.online/api/webhook`

---

## 🎉 Success!

Once everything is configured:
- Your site will be live at `https://shooshka.online`
- SSL certificate will be active (🔒)
- All redirects and webhooks will work
- Users can access your site via your custom domain

**Need help?** Check Vercel's domain documentation: https://vercel.com/docs/concepts/projects/domains

