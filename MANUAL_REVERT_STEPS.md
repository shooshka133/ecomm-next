# Manual Steps to Revert to Working OAuth

## Step 1: Stash Your Current Changes

This saves your current work so you can come back to it later:

```bash
git stash push -m "Saving current OAuth troubleshooting work"
```

This will save all your modified files.

## Step 2: Checkout the Working Commit

```bash
git checkout 987edd1
```

This moves your code to the commit where OAuth was working.

## Step 3: Kill Any Running Node Processes

If port 3000 is in use, kill the process:

```bash
taskkill /F /IM node.exe
```

## Step 4: Start the Dev Server

```bash
npm run dev
```

## Step 5: Test OAuth

1. Go to: `http://localhost:3000/auth`
2. Click "Sign in with Google"
3. Should work without PKCE errors!

## If You Want to Keep This Version

After confirming OAuth works:

```bash
# Create a new branch from this working commit
git checkout -b working-oauth-version

# Or update main (this will overwrite your current main)
git checkout main
git reset --hard 987edd1
git push origin main --force
```

## If You Want to Go Back to Your Changes

```bash
# Go back to main
git checkout main

# Restore your stashed changes
git stash pop
```

---

## Quick Copy-Paste Commands

Run these in order:

```bash
git stash push -m "Saving OAuth troubleshooting"
git checkout 987edd1
taskkill /F /IM node.exe
npm run dev
```

Then test OAuth at `http://localhost:3000/auth`

