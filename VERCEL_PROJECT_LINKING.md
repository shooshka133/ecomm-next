# Link Local Project to Existing Vercel Project

## Step 1: Install Vercel CLI (if not installed)

```bash
npm install -g vercel
```

Or use npx (no installation needed):
```bash
npx vercel
```

## Step 2: Link Your Local Project

In your project directory (`C:\ecomm`), run:

```bash
vercel link
```

This will:
1. Ask you to log in to Vercel (if not already logged in)
2. Show you a list of your projects
3. Let you select `ecomm-next-yf7p` (your main project)
4. Link your local code to that Vercel project

## Step 3: Verify the Link

After linking, you'll see a `.vercel` folder created with:
- `project.json` - Contains your project ID
- `org.json` - Contains your organization ID

**Don't commit this folder!** It should already be in `.gitignore`.

## Step 4: Test the Connection

```bash
vercel
```

This will:
- Deploy to your linked project (`ecomm-next-yf7p`)
- Create a preview deployment
- NOT create a new project

## How Auto-Deployment Works

### Current Setup (After Linking)

1. **You push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Vercel automatically:**
   - Detects the push
   - Builds your project
   - Deploys to `ecomm-next-yf7p`
   - Updates `shooshka.online` (if it's the production branch)

### No Manual Deployment Needed

Once linked, you just:
- Make changes locally
- Commit: `git commit -m "your message"`
- Push: `git push origin main`
- Vercel auto-deploys! 🚀

## Verify GitHub Integration

1. Go to Vercel Dashboard → `ecomm-next-yf7p`
2. Click **Settings** → **Git**
3. Verify:
   - ✅ Repository: `shooshka133/ecomm-next`
   - ✅ Production Branch: `main`
   - ✅ Auto-deployments: Enabled

## Future Deployments

### ✅ Correct Way (After Linking)

```bash
# Make changes
# ... edit files ...

# Commit
git add .
git commit -m "Your changes"

# Push (Vercel auto-deploys)
git push origin main
```

### ❌ Wrong Way (Creates Duplicate Projects)

- Don't click "Import Project" in Vercel dashboard
- Don't create a new project for the same repo
- Don't use `vercel --prod` without linking first

## Troubleshooting

### If `vercel link` doesn't show your project:

1. Make sure you're logged in:
   ```bash
   vercel login
   ```

2. Check your projects:
   ```bash
   vercel projects list
   ```

3. If project doesn't appear, it might be in a different team/org

### If you accidentally create a new project:

1. Delete it immediately in Vercel dashboard
2. Run `vercel link` again
3. Select the correct project (`ecomm-next-yf7p`)

## Quick Reference

```bash
# Link to existing project
vercel link

# Deploy preview (test)
vercel

# Deploy to production
vercel --prod

# Check linked project
cat .vercel/project.json
```

## Summary

After linking:
- ✅ Local project → Linked to `ecomm-next-yf7p`
- ✅ GitHub pushes → Auto-deploy to Vercel
- ✅ No duplicate projects created
- ✅ All deployments under one project

