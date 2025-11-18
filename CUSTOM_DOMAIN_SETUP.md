# 🌐 Custom Domain Setup: shooshka.online

## ✅ Correct Webhook Endpoint

For your custom domain `https://shooshka.online`, the correct Stripe webhook endpoint is:

```
https://shooshka.online/api/webhook
```

**⚠️ Important Notes:**
- ✅ Use `/api/webhook` (singular, not plural)
- ✅ No `/stripe` at the end
- ✅ Must use `https://` (not `http://`)

---

## 📋 Complete Configuration Checklist

### 1. Vercel Custom Domain Setup

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Domains**
3. Click **"Add Domain"**
4. Enter: `shooshka.online`
5. Follow DNS configuration instructions:
   - Add a CNAME record pointing to Vercel
   - Or add A records as instructed
6. Wait for DNS propagation (usually 5-30 minutes)
7. Vercel will automatically issue SSL certificate

### 2. Environment Variables

Update in **Vercel** → **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_APP_URL = https://shooshka.online
```

**Redeploy** after updating!

### 3. Supabase Configuration

Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**:

**Site URL:**
```
https://shooshka.online
```

**Redirect URLs:**
```
https://shooshka.online/api/auth/callback
https://shooshka.online/auth/callback
```

**Additional Redirect URLs (for development):**
```
http://localhost:3000/api/auth/callback
https://yourproject.vercel.app/api/auth/callback
```

### 4. Stripe Webhook Configuration

Go to **Stripe Dashboard** → **Developers** → **Webhooks**:

**Endpoint URL:**
```
https://shooshka.online/api/webhook
```

**Events to listen for:**
- ✅ `checkout.session.completed`

**After creating webhook:**
1. Copy the **Signing secret** (starts with `whsec_`)
2. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
3. **Redeploy** your project

### 5. Google OAuth (if using)

If you're using Google OAuth:

1. Go to **Google Cloud Console**
2. **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client
4. Add to **Authorized redirect URIs:**
   ```
   https://shooshka.online/api/auth/callback
   ```

---

## 🔍 Verification Steps

### Test 1: Domain is Live
- Visit `https://shooshka.online`
- Should see your website (not a placeholder)

### Test 2: Authentication
- Try signing up/signing in
- Should redirect correctly after authentication

### Test 3: Stripe Webhook
1. Make a test purchase
2. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
3. Click on your webhook endpoint
4. Check **"Events"** tab
5. Should see `checkout.session.completed` events
6. Events should show **"Succeeded"** status

### Test 4: SSL Certificate
- Check browser shows 🔒 (secure lock icon)
- URL should show `https://` (not `http://`)

---

## 🐛 Troubleshooting

### Domain Not Working

**Check:**
1. DNS records are correct (CNAME or A records)
2. DNS propagation completed (can take up to 48 hours)
3. Domain is verified in Vercel
4. SSL certificate is issued (check in Vercel dashboard)

**Tools to check DNS:**
- https://dnschecker.org
- https://mxtoolbox.com/DNSLookup.aspx

### Webhook Not Receiving Events

**Check:**
1. Webhook URL is exactly: `https://shooshka.online/api/webhook`
2. No trailing slash
3. Using `https://` not `http://`
4. `STRIPE_WEBHOOK_SECRET` is set in Vercel
5. Webhook is enabled in Stripe dashboard
6. Check webhook logs in Stripe dashboard

### Authentication Redirect Issues

**Check:**
1. Supabase redirect URLs include `https://shooshka.online/api/auth/callback`
2. Site URL is set to `https://shooshka.online`
3. `NEXT_PUBLIC_APP_URL` is set correctly in Vercel
4. Redeploy after updating environment variables

---

## 📝 Quick Reference

### Your URLs

**Main Site:**
- Production: `https://shooshka.online`
- Vercel: `https://yourproject.vercel.app` (backup)

**API Endpoints:**
- Auth Callback: `https://shooshka.online/api/auth/callback`
- Stripe Webhook: `https://shooshka.online/api/webhook`
- Checkout: `https://shooshka.online/api/checkout`

### Environment Variables

```
NEXT_PUBLIC_APP_URL=https://shooshka.online
NEXT_PUBLIC_SUPABASE_URL=https://eqqcidlflclgegsalbub.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here
STRIPE_SECRET_KEY=your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key_here
STRIPE_WEBHOOK_SECRET=your_key_here
```

---

## ✅ Final Checklist

- [ ] Custom domain added in Vercel
- [ ] DNS records configured correctly
- [ ] SSL certificate issued
- [ ] `NEXT_PUBLIC_APP_URL` set to `https://shooshka.online`
- [ ] Supabase Site URL updated
- [ ] Supabase Redirect URLs updated
- [ ] Stripe webhook endpoint: `https://shooshka.online/api/webhook`
- [ ] Stripe webhook secret added to Vercel
- [ ] Project redeployed after all changes
- [ ] Tested authentication
- [ ] Tested checkout flow
- [ ] Verified webhook events in Stripe dashboard

---

**🎉 Your custom domain is now configured!**

