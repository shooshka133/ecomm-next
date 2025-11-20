# Re-Link Vercel Project

## Issue
The `.vercel/project.json` and `.vercel/org.json` files are empty, which means your local project is not linked to Vercel.

## Solution: Re-Link the Project

### Step 1: Install Vercel CLI (if needed)

```bash
npm install -g vercel
```

Or use npx (no installation needed):
```bash
npx vercel
```

### Step 2: Link Your Project

Run this command in your project directory (`C:\ecomm`):

```bash
vercel link
```

This will:
1. Ask you to log in to Vercel (if not already logged in)
2. Show you a list of your projects
3. Let you select `ecomm-next-yf7p` (your main project)
4. Create/update the `.vercel` folder with project info

### Step 3: Verify the Link

After running `vercel link`, check that the files are populated:

```bash
# Windows PowerShell
type .vercel\project.json
type .vercel\org.json
```

You should see JSON content like:
```json
{
  "projectId": "prj_xxxxxxxxxxxxx",
  "orgId": "team_xxxxxxxxxxxxx"
}
```

### Step 4: Test the Connection

```bash
vercel
```

This will:
- Deploy a preview to your linked project
- Confirm the link is working
- NOT create a new project

---

## Alternative: Manual Configuration

If `vercel link` doesn't work, you can manually create the files:

### 1. Get Your Project ID

1. Go to: https://vercel.com/ashrahalimo-8415s-projects/ecomm-next-yf7p
2. Go to **Settings** → **General**
3. Copy the **Project ID** (starts with `prj_`)

### 2. Get Your Organization ID

1. In the same Vercel dashboard
2. Look at the URL or Settings
3. Copy the **Organization ID** (starts with `team_` or `user_`)

### 3. Create the Files

Create `.vercel/project.json`:
```json
{
  "projectId": "prj_YOUR_PROJECT_ID",
  "orgId": "team_YOUR_ORG_ID"
}
```

Create `.vercel/org.json`:
```json
{
  "orgId": "team_YOUR_ORG_ID"
}
```

---

## Verify Auto-Deployment

After linking, verify that auto-deployment is set up:

1. Go to: https://vercel.com/ashrahalimo-8415s-projects/ecomm-next-yf7p
2. Click **Settings** → **Git**
3. Verify:
   - ✅ Repository: `shooshka133/ecomm-next`
   - ✅ Production Branch: `main`
   - ✅ Auto-deployments: Enabled

---

## Next Steps

Once linked:

1. **Test the link:**
   ```bash
   vercel
   ```

2. **Push to trigger auto-deployment:**
   ```bash
   git add .
   git commit -m "Re-link Vercel project"
   git push origin main
   ```

3. **Check Vercel dashboard** - should see a new deployment

---

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

### If files are still empty after linking:

1. Check file permissions
2. Make sure you're in the correct directory
3. Try deleting `.vercel` folder and running `vercel link` again

---

## Summary

The `.vercel` folder should contain:
- `project.json` - With `projectId` and `orgId`
- `org.json` - With `orgId`

If these are empty, run `vercel link` to populate them.

