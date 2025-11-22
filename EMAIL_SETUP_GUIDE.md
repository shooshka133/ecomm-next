# 📧 Email Setup Guide - Order Confirmation & Shipping Notifications

Complete guide to set up automated email notifications for your ecommerce store using Resend.

---

## ✨ What You Get

### 1. **Order Confirmation Email** (Automatic)
Sent immediately after successful payment:
- ✅ Order number and date
- ✅ Itemized list of products
- ✅ Order total
- ✅ Professional design with your branding
- ✅ Works in Test Mode!

### 2. **Shipping Notification Email** (When you mark as shipped)
Sent when order status changes to "shipped":
- ✅ Tracking number
- ✅ Estimated delivery date
- ✅ Link to order details
- ✅ Professional shipping confirmation

### 3. **Delivery Confirmation Email** (Optional)
Sent when order is delivered:
- ✅ Delivery confirmation
- ✅ Thank you message
- ✅ Simple and clean design

---

## 🚀 Setup Steps (15 minutes)

### **Step 1: Install Packages**

Stop your dev server (`Ctrl+C`), then run:

```bash
npm install resend react-email @react-email/components
```

After installation, restart your dev server:

```bash
npm run dev
```

---

### **Step 2: Sign Up for Resend** (2 minutes)

1. **Go to**: https://resend.com/signup
2. **Sign up** (free account - 3,000 emails/month, 100/day)
3. **Verify your email**

---

### **Step 3: Get Your API Key** (1 minute)

1. **Go to**: https://resend.com/api-keys
2. **Click "Create API Key"**
3. **Name**: `ecommerce-production`
4. **Permission**: `Sending access`
5. **Click "Add"**
6. **Copy the API key** (starts with `re_...`)

---

### **Step 4: Add API Key to Environment Variables**

#### **For Local Development (.env.local):**

Add to your `.env.local` file:

```bash
# Resend Email
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev  # For testing
```

#### **For Production (Vercel):**

1. **Go to Vercel**: Your project → **Settings** → **Environment Variables**
2. **Add new variable**:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_your_api_key_here`
   - **Environment**: Select all (Production, Preview, Development)
3. **Add another variable** (optional):
   - **Name**: `RESEND_FROM_EMAIL`
   - **Value**: `onboarding@resend.dev` (or your verified domain)
4. **Click "Save"**
5. **Redeploy** your app (or let Vercel auto-redeploy)

---

### **Step 5: (Optional) Add Your Own Domain** 

For professional emails like `orders@yourdomain.com`:

1. **Go to Resend**: https://resend.com/domains
2. **Click "Add Domain"**
3. **Enter your domain**: `shooshka.online`
4. **Add DNS records** to your domain provider:
   ```
   TXT  @  "resend-verification=..."
   MX   @  "mx1.resend.com" (priority 10)
   MX   @  "mx2.resend.com" (priority 20)
   ```
5. **Wait for verification** (usually 5-30 minutes)
6. **Update** `RESEND_FROM_EMAIL` to `orders@shooshka.online`

---

## 🧪 Test It!

### **Test 1: Order Confirmation Email**

1. **Visit**: http://localhost:3000 (or your production URL)
2. **Add item to cart**
3. **Checkout** with test card: `4242 4242 4242 4242`
4. **Check your email** → You should receive order confirmation! 📧

### **Test 2: Shipping Notification Email**

1. **Go to Supabase** → Table Editor → `orders`
2. **Find your test order**
3. **Change status** to `shipped`
4. **Add tracking number** (e.g., `TRK-20251121-10001`)
5. **Check your email** → You should receive shipping notification! 📦

---

## 📝 Email Templates

### **Order Confirmation Email Preview:**

```
┌─────────────────────────────────────────┐
│           Ecommerce Start               │
│      Thank you for your order!          │
├─────────────────────────────────────────┤
│                                         │
│   ✅ Order Confirmed                    │
│   Order #A1B2C3D4                       │
│   November 21, 2025                     │
│                                         │
├─────────────────────────────────────────┤
│   Hi John,                              │
│                                         │
│   We've received your order and are     │
│   processing it now...                  │
│                                         │
├─────────────────────────────────────────┤
│   Order Details                         │
│                                         │
│   Product Name          Qty    $29.99   │
│   Another Product       Qty    $49.99   │
│   ─────────────────────────────────     │
│   Total                        $79.98   │
│                                         │
├─────────────────────────────────────────┤
│   Questions about your order?           │
│   support@ecommercestart.com           │
└─────────────────────────────────────────┘
```

### **Shipping Notification Email Preview:**

```
┌─────────────────────────────────────────┐
│               📦                        │
│      Your Order Has Shipped!            │
├─────────────────────────────────────────┤
│   Order #A1B2C3D4                       │
│   Shipped on November 21, 2025          │
├─────────────────────────────────────────┤
│   Hi John,                              │
│                                         │
│   Good news! Your order has been        │
│   shipped and is on its way to you. 🎉  │
│                                         │
├─────────────────────────────────────────┤
│   Tracking Number                       │
│   TRK-20251121-10001                    │
│                                         │
│   Estimated Delivery                    │
│   November 25, 2025                     │
│                                         │
├─────────────────────────────────────────┤
│   [View Order Details] (Button)         │
└─────────────────────────────────────────┘
```

---

## 🎨 Customize Email Templates

All templates are in: `lib/email/templates/`

### **Customize Colors:**

Edit the template files:

```tsx
// lib/email/templates/OrderConfirmation.tsx

const heading = {
  color: '#4F46E5',  // Change this to your brand color
}

const button = {
  backgroundColor: '#4F46E5',  // Change button color
}
```

### **Customize From Name:**

In `lib/email/send.ts`:

```tsx
from: `Your Store Name <${FROM_EMAIL}>`,
```

### **Customize Subject Lines:**

In `lib/email/send.ts`:

```tsx
subject: `Order Confirmation #${data.orderNumber} - Thank You!`,
// Change to:
subject: `🎉 Your Order is Confirmed! #${data.orderNumber}`,
```

---

## 📊 Monitoring Emails

### **Check Email Status in Resend:**

1. **Go to**: https://resend.com/emails
2. **See all sent emails**
3. **Click on any email** to see:
   - Delivery status
   - Open rate (if tracking enabled)
   - Recipient info
   - Full email preview

### **Common Statuses:**
- ✅ **Delivered** - Email successfully delivered
- ⏳ **Sent** - Email sent, awaiting delivery confirmation
- ❌ **Bounced** - Invalid email address
- ❌ **Failed** - Delivery failed

---

## 🛠️ Troubleshooting

### **Issue: Emails not sending**

**Check 1: API Key**
```bash
# In your terminal (check environment variable is set)
# Local:
cat .env.local | grep RESEND_API_KEY

# Production: Check Vercel dashboard
```

**Check 2: Check Logs**
- Local: Look at terminal output for `📧` or `❌` emoji
- Production: Check Vercel logs (Vercel Dashboard → Deployments → Logs)

**Check 3: Resend Dashboard**
- Go to https://resend.com/emails
- Check if emails are showing up (even if failed)

---

### **Issue: Emails going to spam**

**Solution 1: Verify Your Domain** (if using custom domain)
- Ensure all DNS records are correctly added
- Wait for full DNS propagation (can take up to 48 hours)

**Solution 2: Use `onboarding@resend.dev`** (for testing)
- This is a verified Resend domain
- Works immediately
- Good for testing and development

**Solution 3: Warm Up Your Domain**
- Start with low volume
- Gradually increase over days/weeks
- Resend will automatically improve deliverability

---

### **Issue: Order confirmation not sending but shipping email works**

**Check**: Webhook might be failing silently

```bash
# Check webhook logs in Stripe
https://dashboard.stripe.com/test/webhooks
# Look for your endpoint and check recent events
```

---

## 🔐 Security Best Practices

### **✅ DO:**
- Store `RESEND_API_KEY` in environment variables
- Never commit API keys to Git
- Use different API keys for dev/production
- Verify email addresses before sending
- Log email sends for auditing

### **❌ DON'T:**
- Don't hardcode API keys in code
- Don't expose API keys in client-side code
- Don't send emails to unverified addresses in production
- Don't send excessive emails (rate limits)

---

## 📈 Resend Free Tier Limits

| Feature | Free Tier |
|---------|-----------|
| **Emails per month** | 3,000 |
| **Emails per day** | 100 |
| **Domains** | 1 |
| **API Keys** | Unlimited |
| **Team Members** | 1 |

**Upgrade when you need more:**
- $20/month: 50,000 emails/month
- Custom plans available for higher volume

---

## 🎯 Next Steps

### **After Basic Setup:**
1. ✅ Test order confirmation email
2. ✅ Test shipping notification email
3. ✅ Customize email templates with your branding
4. ✅ Add your logo to email templates
5. ✅ Set up custom domain for professional emails

### **Advanced Features (Optional):**
1. Add email tracking (open rates, click rates)
2. Send abandoned cart emails
3. Send promotional emails
4. Add unsubscribe functionality
5. Segment customers for targeted emails

---

## 📞 Support

### **Resend Support:**
- Documentation: https://resend.com/docs
- Discord: https://resend.com/discord
- Email: support@resend.com

### **React Email (Templates):**
- Documentation: https://react.email/docs
- Examples: https://demo.react.email

---

## ✅ Quick Checklist

Before going live, make sure:

- [ ] Resend account created
- [ ] API key added to Vercel
- [ ] Test order confirmation received
- [ ] Test shipping notification received
- [ ] Email templates reviewed and customized
- [ ] From email address set correctly
- [ ] Domain verified (if using custom domain)
- [ ] Emails not going to spam
- [ ] Logging working for troubleshooting

---

## 🎉 You're All Set!

Your store now sends professional email notifications automatically! 📧✨

**Test it thoroughly before going live with real customers!**

