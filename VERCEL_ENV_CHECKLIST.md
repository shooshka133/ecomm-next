# ✅ Vercel Environment Variables Checklist

## Problem
Emails work from **localhost** but **NOT from production (Vercel)**.

This means your local `.env.local` has the correct values, but Vercel environment variables are missing or incorrect.

---

## 🔍 Quick Check

### Step 1: Go to Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your project: `ecomm-next`
3. Click **Settings** → **Environment Variables**

### Step 2: Verify These Variables Exist

Check that ALL of these are set:

#### ✅ Required Variables:

1. **`RESEND_API_KEY`**
   - Should start with: `re_`
   - Should be set for: **Production** environment
   - Example: `re_1234567890abcdef...`

2. **`RESEND_FROM_EMAIL`**
   - Should be: `orders@store.shooshka.online` (if domain verified)
   - OR: `onboarding@resend.dev` (for testing)
   - Should be set for: **Production** environment

3. **`NEXT_PUBLIC_SUPABASE_URL`**
   - Should be your Supabase project URL
   - Should be set for: **All environments**

4. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - Should start with: `eyJ...`
   - Should be set for: **All environments**

5. **`SUPABASE_SERVICE_ROLE_KEY`**
   - Should start with: `eyJ...`
   - Should be set for: **Production** environment only ⚠️

6. **`STRIPE_SECRET_KEY`**
   - Should start with: `sk_live_...` (production) or `sk_test_...` (testing)
   - Should be set for: **Production** environment

7. **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`**
   - Should start with: `pk_live_...` (production) or `pk_test_...` (testing)
   - Should be set for: **All environments**

8. **`STRIPE_WEBHOOK_SECRET`**
   - Should start with: `whsec_...`
   - Should be set for: **Production** environment

9. **`NEXT_PUBLIC_APP_URL`**
   - Should be: `https://store.shooshka.online`
   - Should be set for: **Production** environment

---

## 🔧 How to Add/Update Variables

### If a variable is missing:

1. Click **"Add New"** button
2. Enter:
   - **Name**: `RESEND_API_KEY` (or whatever is missing)
   - **Value**: Paste the value from your local `.env.local`
   - **Environment**: Select **Production** (or **All** if it's a `NEXT_PUBLIC_` variable)
3. Click **Save**

### If a variable exists but is wrong:

1. Click the **"..."** menu next to the variable
2. Click **"Edit"**
3. Update the value
4. Click **Save**

---

## ⚠️ Important: Redeploy After Changes

**After adding or updating environment variables, you MUST redeploy:**

1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

**Environment variables are only loaded during build/deployment!**

---

## 🧪 Test Your Configuration

### Check Local vs Production:

1. **Local** (works):
   ```bash
   # Check your .env.local file
   cat .env.local | grep RESEND
   ```

2. **Production** (not working):
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Compare with your local `.env.local`
   - Make sure they match!

---

## 📋 Common Issues

### Issue 1: Variable exists but wrong environment

**Problem**: Variable is set for "Development" but not "Production"

**Solution**: 
- Edit the variable
- Check **"Production"** environment
- Save and redeploy

### Issue 2: Variable name typo

**Problem**: `RESEND_API_KEY` vs `RESEND_APIKEY` (missing underscore)

**Solution**: 
- Check exact spelling matches your code
- Variable names are case-sensitive!

### Issue 3: Variable not redeployed

**Problem**: Added variable but didn't redeploy

**Solution**: 
- **Always redeploy after adding/updating variables!**
- Go to Deployments → Redeploy

### Issue 4: Using wrong domain

**Problem**: `RESEND_FROM_EMAIL` is set to `orders@store.shooshka.online` but domain not verified

**Solution**: 
- Either verify domain in Resend (see `RESEND_DOMAIN_VERIFICATION.md`)
- Or temporarily use `onboarding@resend.dev` for testing

---

## ✅ Verification Checklist

Before testing, make sure:

- [ ] All required variables are present in Vercel
- [ ] Variable values match your local `.env.local`
- [ ] Variables are set for the correct environment (Production)
- [ ] You've redeployed after making changes
- [ ] Domain is verified in Resend (if using custom domain)

---

## 🔍 Debug Steps

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Deployments → Latest deployment
   - Click **"Functions"** tab
   - Look for email-related logs
   - Should see: `🔍 [Email] Environment check:`

2. **Compare Local vs Production:**
   - Check your local `.env.local`
   - Compare with Vercel environment variables
   - Make sure they match!

3. **Test Email API:**
   - Make a test payment
   - Check browser console for errors
   - Check Vercel function logs
   - Check Resend dashboard for sent emails

---

## 📞 Still Not Working?

If emails still don't work after checking everything:

1. Check Vercel function logs for detailed error messages
2. Verify `RESEND_API_KEY` is correct (test in Resend dashboard)
3. Verify domain is verified in Resend (if using custom domain)
4. Make sure you redeployed after changing variables

