# 🔐 Resend Domain Verification for store.shooshka.online

## Error Message
```
Not authorized to send emails from store.shooshka.online
```

This means the domain `store.shooshka.online` is not verified in Resend.

---

## ✅ Solution: Verify Domain in Resend

### Step 1: Go to Resend Dashboard

1. Go to: https://resend.com/domains
2. Click **"Add Domain"**
3. Enter: `store.shooshka.online`
4. Click **"Add Domain"**

### Step 2: Add DNS Records

Resend will show you DNS records to add. You need to add these to **Cloudflare** (since you're using Cloudflare for DNS):

#### Required DNS Records:

1. **SPF Record** (TXT)
   - Name: `store.shooshka.online` (or `@` if Cloudflare supports it)
   - Value: `v=spf1 include:resend.com ~all`
   - TTL: Auto

2. **DKIM Record** (TXT)
   - Name: `resend._domainkey.store.shooshka.online`
   - Value: (Resend will provide this - looks like `p=...`)
   - TTL: Auto

3. **DMARC Record** (TXT) - Optional but recommended
   - Name: `_dmarc.store.shooshka.online`
   - Value: `v=DMARC1; p=none; rua=mailto:dmarc@store.shooshka.online`
   - TTL: Auto

### Step 3: Add Records in Cloudflare

1. Go to **Cloudflare Dashboard** → Select `shooshka.online` domain
2. Go to **DNS** → **Records**
3. Click **"Add record"**
4. Add each record from Step 2:
   - **Type**: TXT
   - **Name**: (as specified by Resend)
   - **Content**: (as specified by Resend)
   - **TTL**: Auto
5. Click **"Save"**

### Step 4: Wait for Verification

1. Go back to **Resend Dashboard** → **Domains**
2. Click on `store.shooshka.online`
3. Wait for DNS propagation (usually 5-30 minutes)
4. Status should change to **"Verified"** ✅

---

## 🚀 Quick Fix: Use Verified Domain (Temporary)

If you need emails working **right now**, you can temporarily use a verified domain:

### Option A: Use `shooshka.online` (if verified)

1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Find `RESEND_FROM_EMAIL`
3. Change it to: `orders@shooshka.online` (if `shooshka.online` is verified)
4. Click **Save**
5. **Redeploy** your project

### Option B: Use Resend's Test Domain (for testing only)

1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Find `RESEND_FROM_EMAIL`
3. Change it to: `onboarding@resend.dev`
4. Click **Save**
5. **Redeploy** your project

⚠️ **Note**: `onboarding@resend.dev` is for testing only. For production, you must verify your domain.

---

## ✅ After Verification

Once `store.shooshka.online` is verified in Resend:

1. Make sure `RESEND_FROM_EMAIL` in Vercel is set to: `orders@store.shooshka.online`
2. **Redeploy** your project
3. Test sending an email
4. Should work! ✅

---

## 🔍 How to Check Domain Status

1. Go to **Resend Dashboard** → **Domains**
2. Find `store.shooshka.online`
3. Status should be:
   - ✅ **"Verified"** = Ready to use
   - ⏳ **"Pending"** = Waiting for DNS propagation
   - ❌ **"Failed"** = DNS records incorrect, check and fix

---

## 📝 Current Configuration

- **FROM_EMAIL**: `orders@store.shooshka.online` (needs verification)
- **Domain**: `store.shooshka.online` (not verified yet)
- **DNS Provider**: Cloudflare

---

## 🆘 Troubleshooting

### DNS Records Not Working?

1. Check Cloudflare DNS records match exactly what Resend shows
2. Wait 30 minutes for DNS propagation
3. Use `dig` or online DNS checker to verify records:
   ```
   dig TXT store.shooshka.online
   dig TXT resend._domainkey.store.shooshka.online
   ```

### Still Getting "Not Authorized" Error?

1. Make sure domain is **"Verified"** in Resend (not just "Pending")
2. Check `RESEND_FROM_EMAIL` in Vercel matches the verified domain
3. **Redeploy** after changing environment variables
4. Check Vercel function logs for detailed error messages

