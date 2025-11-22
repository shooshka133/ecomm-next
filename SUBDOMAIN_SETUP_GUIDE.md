# 🌐 Subdomain Setup Guide: store.shooshka.online

## 📋 Overview

This guide will help you add `store.shooshka.online` as a subdomain pointing to your Vercel deployment. Your main domain `shooshka.online` will continue working normally.

---

## ✅ Prerequisites

- ✅ Vercel account with deployed project
- ✅ Domain `shooshka.online` already configured
- ✅ Access to your DNS provider (Namecheap, Cloudflare, etc.)
- ✅ Access to Vercel dashboard

---

## 🚀 Step-by-Step Instructions

### **Step 1: Add Custom Domain in Vercel**

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project (ecomm-next or similar)

2. **Navigate to Domain Settings:**
   - Click on **Settings** tab
   - Click on **Domains** in the left sidebar

3. **Add the Subdomain:**
   - Click **Add** or **Add Domain** button
   - Enter: `store.shooshka.online`
   - Click **Add** or **Continue**

4. **Vercel will show you DNS instructions:**
   - You'll see something like:
     ```
     Type: CNAME
     Name: store
     Value: cname.vercel-dns.com
     ```
   - **Don't close this page yet!** You'll need these values.

---

### **Step 2: Configure DNS Records**

The DNS configuration depends on your DNS provider. Choose the one you're using:

---

#### **Option A: Using Cloudflare** (Recommended - Free SSL)

1. **Log in to Cloudflare:**
   - Go to: https://dash.cloudflare.com
   - Select your domain: `shooshka.online`

2. **Go to DNS Settings:**
   - Click **DNS** in the left sidebar
   - Click **Records** tab

3. **Add CNAME Record:**
   - Click **Add record**
   - **Type:** Select `CNAME`
   - **Name:** Enter `store` (just the subdomain part, not `store.shooshka.online`)
   - **Target:** Enter `cname.vercel-dns.com` (or what Vercel showed you)
   - **Proxy status:** 
     - ✅ **Proxied** (orange cloud) - Recommended for free SSL
     - ⚠️ **DNS only** (gray cloud) - If you want direct DNS
   - **TTL:** Leave as Auto
   - Click **Save**

4. **Verify:**
   - You should see a new record:
     ```
     Type: CNAME
     Name: store
     Content: cname.vercel-dns.com
     Proxy: Proxied (orange cloud)
     ```

---

#### **Option B: Using Namecheap**

1. **Log in to Namecheap:**
   - Go to: https://www.namecheap.com
   - Click **Domain List** → Select `shooshka.online`

2. **Go to Advanced DNS:**
   - Click **Advanced DNS** tab
   - Scroll to **Host Records** section

3. **Add CNAME Record:**
   - Click **Add New Record**
   - **Type:** Select `CNAME Record`
   - **Host:** Enter `store` (just the subdomain part)
   - **Value:** Enter `cname.vercel-dns.com` (or what Vercel showed you)
   - **TTL:** Select `Automatic` or `30 min`
   - Click **Save** (checkmark icon)

4. **Verify:**
   - You should see:
     ```
     Type: CNAME
     Host: store
     Value: cname.vercel-dns.com
     ```

---

#### **Option C: Using Other DNS Providers (GoDaddy, Google Domains, etc.)**

1. **Log in to your DNS provider**
2. **Find DNS Management / DNS Settings**
3. **Add CNAME Record:**
   - **Type:** CNAME
   - **Name/Host:** `store` (or `store.shooshka.online` - depends on provider)
   - **Value/Target:** `cname.vercel-dns.com`
   - **TTL:** Auto or 3600
   - **Save**

---

### **Step 3: Wait for DNS Propagation**

DNS changes can take **5 minutes to 48 hours** to propagate, but usually:
- ✅ **Cloudflare:** 1-5 minutes (fastest)
- ✅ **Namecheap:** 15-30 minutes
- ⚠️ **Other providers:** 1-24 hours

**While waiting:**
- Check Vercel dashboard - it will show "Valid Configuration" when DNS is ready
- Don't delete or modify the DNS record during this time

---

### **Step 4: Verify in Vercel**

1. **Go back to Vercel Dashboard:**
   - Settings → Domains
   - Find `store.shooshka.online`

2. **Check Status:**
   - ✅ **Valid Configuration** = DNS is correct, waiting for propagation
   - ✅ **Valid** = Ready! SSL certificate is being issued
   - ❌ **Invalid Configuration** = DNS record is wrong (check Step 2)

3. **SSL Certificate:**
   - Vercel automatically issues SSL certificates
   - Usually takes **5-10 minutes** after DNS is valid
   - You'll see a green checkmark when ready

---

### **Step 5: Test Your Subdomain**

Once Vercel shows "Valid" status:

1. **Open a new browser tab (or incognito)**
2. **Visit:** `https://store.shooshka.online`
3. **You should see:**
   - ✅ Your website loads
   - ✅ HTTPS (green lock icon)
   - ✅ No SSL warnings

---

## 🔒 HTTPS/SSL Configuration

**Vercel automatically handles SSL!** ✅

- ✅ **Automatic SSL:** Vercel issues free SSL certificates via Let's Encrypt
- ✅ **Auto-renewal:** Certificates renew automatically
- ✅ **HTTPS redirect:** HTTP automatically redirects to HTTPS
- ✅ **No action needed:** Just wait 5-10 minutes after DNS is valid

**You don't need to:**
- ❌ Buy an SSL certificate
- ❌ Configure SSL manually
- ❌ Set up certificate renewal

---

## 🎯 Verify Both Domains Work

After setup, both should work:

- ✅ `https://shooshka.online` → Your main site (unchanged)
- ✅ `https://store.shooshka.online` → Your store subdomain (new)

**They both point to the same Vercel deployment!**

---

## 🔧 Troubleshooting

### **Problem 1: "Invalid Configuration" in Vercel**

**Symptoms:**
- Vercel shows "Invalid Configuration" error
- DNS record not found

**Solutions:**
1. **Check DNS record exists:**
   - Go to your DNS provider
   - Verify CNAME record for `store` exists
   - Value should be `cname.vercel-dns.com`

2. **Check record type:**
   - Must be **CNAME**, not A record
   - Some providers call it "Alias" - that's fine

3. **Check name field:**
   - Should be `store` (not `store.shooshka.online`)
   - Some providers require full domain - check your provider's docs

4. **Wait longer:**
   - DNS can take up to 48 hours
   - Check again in 1 hour

---

### **Problem 2: Site Not Loading After DNS Propagation**

**Symptoms:**
- DNS shows as valid
- Vercel shows "Valid" status
- But site doesn't load

**Solutions:**
1. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
   - Clear cached images and files
   - Try again

2. **Try incognito/private window:**
   - Opens without cache
   - Tests if it's a cache issue

3. **Check DNS propagation:**
   - Visit: https://dnschecker.org
   - Enter: `store.shooshka.online`
   - Check if CNAME points to `cname.vercel-dns.com` globally

4. **Check Vercel deployment:**
   - Go to Vercel → Deployments
   - Make sure latest deployment is "Ready"
   - If failed, redeploy

---

### **Problem 3: SSL Certificate Not Issued**

**Symptoms:**
- Site loads but shows "Not Secure"
- Browser SSL warning

**Solutions:**
1. **Wait longer:**
   - SSL certificates take 5-10 minutes after DNS is valid
   - Check again in 10 minutes

2. **Check Vercel status:**
   - Settings → Domains
   - Look for SSL certificate status
   - Should show "Valid" or "Issued"

3. **Force HTTPS:**
   - Visit: `https://store.shooshka.online` (not http://)
   - Vercel should redirect automatically

4. **Check DNS:**
   - Make sure DNS is fully propagated
   - SSL can't be issued if DNS isn't ready

---

### **Problem 4: "Too Many Redirects" Error**

**Symptoms:**
- Browser shows redirect loop
- Site won't load

**Solutions:**
1. **Check if you have redirect rules:**
   - Vercel → Settings → Redirects
   - Make sure no conflicting rules

2. **Check DNS:**
   - Make sure CNAME points to `cname.vercel-dns.com`
   - Not to another domain

3. **Clear browser cache:**
   - Old redirects might be cached

---

### **Problem 5: Subdomain Works But Main Domain Doesn't**

**Symptoms:**
- `store.shooshka.online` works
- `shooshka.online` doesn't work

**Solutions:**
1. **Check main domain DNS:**
   - Main domain should have its own DNS records
   - Don't modify main domain records

2. **Check Vercel domains:**
   - Both domains should be listed
   - Both should show "Valid"

3. **Wait for DNS:**
   - Main domain might be re-propagating
   - Wait 1 hour and check again

---

## 📊 DNS Record Summary

**What you need to add:**

```
Type: CNAME
Name: store
Value: cname.vercel-dns.com
TTL: Auto (or 3600)
```

**What you should NOT do:**
- ❌ Don't delete existing DNS records for `shooshka.online`
- ❌ Don't change A records
- ❌ Don't add A record for subdomain (use CNAME)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] DNS record added in your DNS provider
- [ ] Vercel shows "Valid Configuration" or "Valid"
- [ ] Can access `https://store.shooshka.online`
- [ ] SSL certificate is active (green lock)
- [ ] Main domain `shooshka.online` still works
- [ ] Both domains show the same website

---

## 🎯 Quick Reference

**Vercel Domain Settings:**
- URL: https://vercel.com/dashboard → Your Project → Settings → Domains

**Common DNS Providers:**
- Cloudflare: https://dash.cloudflare.com
- Namecheap: https://www.namecheap.com → Domain List
- GoDaddy: https://www.godaddy.com → My Products → DNS

**DNS Checker:**
- https://dnschecker.org (check global DNS propagation)

**Vercel Status:**
- https://vercel-status.com (check if Vercel is having issues)

---

## 📝 Notes

- ✅ **Both domains point to same deployment** - Any code changes affect both
- ✅ **SSL is automatic** - No manual configuration needed
- ✅ **Free on Vercel** - No additional cost for subdomains
- ✅ **Unlimited subdomains** - You can add more if needed

---

## 🚀 Next Steps After Setup

Once `store.shooshka.online` is working:

1. **Update environment variables** (if needed):
   - `NEXT_PUBLIC_APP_URL` can stay as `shooshka.online` or change to `store.shooshka.online`
   - Or use both (your app should handle both)

2. **Test OAuth redirects:**
   - If using Google OAuth, add `https://store.shooshka.online/auth/callback` to:
     - Google Cloud Console → Authorized redirect URIs
     - Supabase → Authentication → URL Configuration → Redirect URLs

3. **Update any hardcoded URLs:**
   - Check your code for hardcoded `shooshka.online` references
   - Consider using environment variables instead

---

**That's it! Your subdomain should be working in 5-30 minutes!** 🎉

