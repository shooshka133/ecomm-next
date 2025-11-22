# 🔄 Update Stripe Webhook to store.shooshka.online

## Quick Steps

### 1. Go to Stripe Dashboard

1. Go to: https://dashboard.stripe.com
2. Make sure you're in the **correct mode** (Test or Live - match your current setup)
3. Navigate to: **Developers** → **Webhooks**

### 2. Update Webhook Endpoint

**Option A: Edit Existing Webhook**
1. Find your existing webhook endpoint
2. Click on it to edit
3. Update the **Endpoint URL** to:
   ```
   https://store.shooshka.online/api/webhook
   ```
4. Click **Save**

**Option B: Create New Webhook** (if you want to keep the old one)
1. Click **"Add endpoint"**
2. Enter endpoint URL:
   ```
   https://store.shooshka.online/api/webhook
   ```
3. Select event: **`checkout.session.completed`**
4. Click **Add endpoint**

### 3. Get New Signing Secret (if you created a new webhook)

1. After creating/updating the webhook, click on it
2. Find **"Signing secret"** (starts with `whsec_`)
3. Copy it

### 4. Update Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. Find `STRIPE_WEBHOOK_SECRET`
4. Update it with the new signing secret (if you created a new webhook)
5. If you edited the existing webhook, the secret should be the same
6. Click **Save**

### 5. Redeploy (if you updated the secret)

1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**

---

## ✅ Verification

After updating:

1. **Test a payment:**
   - Make a test purchase
   - Check if order is created in Supabase
   - Check if confirmation email is sent

2. **Check Stripe Webhook Logs:**
   - Go to Stripe Dashboard → **Developers** → **Webhooks**
   - Click on your webhook
   - Check **"Recent events"** tab
   - Should see successful `checkout.session.completed` events

3. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project
   - **Deployments** → Click on latest deployment
   - Check **"Functions"** tab for webhook logs

---

## 🔍 Current Configuration

- **Webhook URL:** `https://store.shooshka.online/api/webhook`
- **Event:** `checkout.session.completed`
- **Route:** `app/api/webhook/route.ts` (no code changes needed)

---

## ⚠️ Important Notes

- The webhook code itself doesn't need changes - it works on any domain
- Only the Stripe dashboard configuration needs updating
- Make sure `NEXT_PUBLIC_APP_URL` in Vercel is set to `https://store.shooshka.online`
- The webhook will work automatically once the URL is updated in Stripe

