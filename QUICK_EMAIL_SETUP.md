# 📧 Quick Email Setup (5 Minutes)

Get order confirmation emails working in 5 simple steps!

---

## 🚀 Setup Steps:

### **Step 1: Stop Your Dev Server**
```bash
# Press Ctrl+C in your terminal
```

### **Step 2: Install Packages**
```bash
npm install resend react-email @react-email/components
```

### **Step 3: Get Resend API Key**

1. Go to: https://resend.com/signup
2. Sign up (free - no credit card needed)
3. Go to: https://resend.com/api-keys
4. Click "Create API Key"
5. Copy the key (starts with `re_...`)

### **Step 4: Add to Environment Variables**

**Local (.env.local):**
```bash
# Add these lines to .env.local
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Production (Vercel):**
1. Go to Vercel → Settings → Environment Variables
2. Add: `RESEND_API_KEY` = `re_your_api_key_here`
3. Add: `RESEND_FROM_EMAIL` = `onboarding@resend.dev`
4. Redeploy

### **Step 5: Test It!**

```bash
# Restart your dev server
npm run dev
```

1. Make a test purchase
2. Check your email → You should receive order confirmation! ✅

---

## 📧 What You Get:

✅ **Order Confirmation** - Sent automatically after payment  
✅ **Shipping Notification** - Sent when you mark order as "shipped"  
✅ **Professional Design** - Beautiful HTML emails  
✅ **Works in Test Mode** - No need to activate Stripe account  
✅ **Free Tier** - 3,000 emails/month, 100/day  

---

## 🎯 Next Steps:

- ✅ Push your code to deploy
- ✅ Read full guide: `EMAIL_SETUP_GUIDE.md`
- ✅ Customize email templates
- ✅ Add your custom domain (optional)

---

**That's it! Your store now sends professional emails! 📧✨**

