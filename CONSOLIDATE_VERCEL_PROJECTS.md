# Consolidate Multiple Vercel Projects

## Why You Have Multiple Projects

You have 5 separate Vercel projects all pointing to the same GitHub repository (`shooshka133/ecomm-next`). This happened because:

1. **Multiple imports**: You imported/connected the same repository multiple times
2. **Auto-deployment**: Vercel created a new project each time instead of using an existing one
3. **Different deployment attempts**: Each time you deployed, a new project was created

## Current Situation

Based on your Vercel dashboard, you have:
- `ecomm-next-six` → `ecomm-next-six.vercel.app`
- `ecomm-next-yf7p` → `shooshka.online` (custom domain) ⭐ **This is your main one**
- `ecomm-next-f677` → `ecomm-next-f677.vercel.app`
- `ecomm-next-zg7o` → `ecomm-next-zg7o.vercel.app`
- `ecomm-next-2jgb` → `ecomm-next-2jgb.vercel.app`

## Solution: Keep One, Delete Others

### Step 1: Identify Your Main Project

**Keep:** `ecomm-next-yf7p` because:
- ✅ It has your custom domain (`shooshka.online`)
- ✅ It's the one you've been using
- ✅ It has your production configuration

### Step 2: Delete Duplicate Projects

For each duplicate project (`ecomm-next-six`, `ecomm-next-f677`, `ecomm-next-zg7o`, `ecomm-next-2jgb`):

1. Go to the project in Vercel dashboard
2. Click **Settings** (gear icon)
3. Scroll to the bottom
4. Click **Delete Project**
5. Type the project name to confirm
6. Click **Delete**

### Step 3: Verify Your Main Project

After deleting duplicates, verify `ecomm-next-yf7p`:

1. **Settings** → **Git**
   - Repository: `shooshka133/ecomm-next`
   - Production Branch: `main`

2. **Settings** → **Domains**
   - Should have: `shooshka.online`
   - May also have: `ecomm-next-yf7p.vercel.app`

3. **Settings** → **Environment Variables**
   - All your environment variables should be here
   - `NEXT_PUBLIC_APP_URL` should be `https://shooshka.online`

## Prevention: How to Avoid This

### When Deploying:

1. **If project already exists:**
   - Don't create a new one
   - Use the existing project
   - Push to GitHub → Vercel auto-deploys

2. **If importing from GitHub:**
   - Check if you already have a project for this repo
   - If yes, connect the existing project instead of creating new

3. **Use Vercel CLI:**
   ```bash
   vercel link
   ```
   This links your local project to an existing Vercel project

## Quick Action Plan

1. ✅ **Keep:** `ecomm-next-yf7p` (has custom domain)
2. ❌ **Delete:** All other `ecomm-next-*` projects
3. ✅ **Verify:** Main project has all settings correct
4. ✅ **Test:** Make sure `shooshka.online` still works

## After Consolidation

You should have:
- **1 Vercel project** → `ecomm-next-yf7p`
- **1 custom domain** → `shooshka.online`
- **1 GitHub connection** → `shooshka133/ecomm-next`
- **Multiple deployments** (but all under one project)

## Benefits of Consolidation

- ✅ Cleaner dashboard
- ✅ Easier to manage
- ✅ All deployments in one place
- ✅ Single source of truth
- ✅ No confusion about which project to use

