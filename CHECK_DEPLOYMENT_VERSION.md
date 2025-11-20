# Check Current Deployment Version

## Your Linked Project Information

Based on the sync setup, here's what was configured:

### Vercel Project
- **Project Name:** `ecomm-next-yf7p`
- **Vercel URL:** `https://ecomm-next-yf7p.vercel.app`
- **Custom Domain:** `https://shooshka.online` (if configured)

### GitHub Repository
- **Repository:** `shooshka133/ecomm-next`
- **Branch:** `main` (production branch)

### Local Project
- **Directory:** `C:\ecomm`
- **Linked via:** `.vercel` folder (contains project.json and org.json)

---

## How to Check Current Deployment Version

### Method 1: Check Vercel Dashboard

1. Go to: https://vercel.com/ashrahalimo-8415s-projects/ecomm-next-yf7p
2. Click on **"Deployments"** tab
3. Look at the **latest deployment** - it will show:
   - **Commit hash** (e.g., `4495ac4`)
   - **Commit message** (e.g., "Test auto-deployment")
   - **Branch** (should be `main`)
   - **Status** (Ready, Building, Error, etc.)

### Method 2: Check Local Git Commit

Run in your terminal:
```bash
git log --oneline -1
```

This shows the latest commit hash and message.

### Method 3: Check Vercel CLI

If you have Vercel CLI installed:
```bash
vercel ls
```

This shows all deployments for the linked project.

### Method 4: Check .vercel Folder

The `.vercel` folder contains:
- `project.json` - Project ID and name
- `org.json` - Organization ID

To view:
```bash
# Windows PowerShell
type .vercel\project.json
type .vercel\org.json
```

---

## What Version Was Synced?

Based on the conversation history, the sync was done around the time when:
- **Commit:** "Test auto-deployment" (commit hash: `4495ac4`)
- **Date:** When you ran `git push origin main` after linking
- **Status:** This commit should be deployed to Vercel

---

## Verify Sync Status

### Check if Local Matches Vercel

1. **Get local commit:**
   ```bash
   git rev-parse HEAD
   ```

2. **Check Vercel deployment:**
   - Go to Vercel dashboard
   - Look at latest deployment commit hash
   - Compare with local commit hash

3. **If they match:** ✅ Synced!
4. **If they don't match:** Push your local changes:
   ```bash
   git push origin main
   ```

---

## Current Deployment URLs

### Production
- **Vercel:** `https://ecomm-next-yf7p.vercel.app`
- **Custom Domain:** `https://shooshka.online` (if configured)

### Preview Deployments
- Each push to a branch creates a preview URL
- Format: `https://ecomm-next-[hash].vercel.app`

---

## How Auto-Deployment Works

1. **You commit locally:**
   ```bash
   git add .
   git commit -m "Your changes"
   ```

2. **You push to GitHub:**
   ```bash
   git push origin main
   ```

3. **Vercel automatically:**
   - Detects the push
   - Builds the project
   - Deploys to `ecomm-next-yf7p`
   - Updates the production URL

4. **Result:** Your local code is now live on Vercel! 🚀

---

## Check Deployment History

### In Vercel Dashboard:
1. Go to: https://vercel.com/ashrahalimo-8415s-projects/ecomm-next-yf7p/deployments
2. You'll see all deployments with:
   - Commit hash
   - Commit message
   - Deployment time
   - Status
   - URL

### In GitHub:
1. Go to: https://github.com/shooshka133/ecomm-next/commits/main
2. Each commit shows:
   - Commit hash
   - Commit message
   - Author
   - Date

---

## Quick Commands

```bash
# Check current local commit
git log --oneline -1

# Check if local is ahead/behind
git status

# Push to sync with Vercel
git push origin main

# Check Vercel project info
cat .vercel/project.json
```

---

## Summary

- **Project:** `ecomm-next-yf7p`
- **Repository:** `shooshka133/ecomm-next`
- **Branch:** `main`
- **Auto-deploy:** Enabled ✅
- **Latest sync:** Check Vercel dashboard for exact commit

To see the exact deployment version, check the Vercel dashboard or run `git log --oneline -1` locally.

