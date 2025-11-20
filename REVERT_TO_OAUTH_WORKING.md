# Revert to Working Google OAuth Version

## Recommended Commit

Based on your git history, the best commit to revert to is:

**`987edd1` - "Fix Google OAuth sign-up redirect and session handling"**

This commit:
- ✅ Has OAuth fixes
- ✅ Is before wishlist was added
- ✅ Should have working Google OAuth

## How to Revert

### Option 1: Checkout the Commit (Recommended)

This will move your code to that commit:

```bash
git checkout 987edd1
```

**Note:** This puts you in "detached HEAD" state. To make this permanent:

```bash
# Create a new branch from this commit
git checkout -b revert-to-working-oauth

# Or, if you want to update main (be careful!)
git checkout main
git reset --hard 987edd1
git push origin main --force
```

### Option 2: Create a New Branch (Safer)

```bash
# Create a new branch from the working commit
git checkout -b working-oauth 987edd1

# Work on this branch
# When ready, merge back to main
```

### Option 3: View What Changed First

Before reverting, see what files changed:

```bash
git diff 987edd1 HEAD --name-only
```

This shows which files are different between the working version and current.

## Alternative Commits to Try

If `987edd1` doesn't work, try these in order:

1. **`bdd9cc6`** - "Enhance auth page: add retype password, field validation..."
   - Has auth improvements
   - Before wishlist

2. **`fadfe54`** - "Add required error.tsx and not-found.tsx components"
   - Stable version with error handling
   - Before wishlist

3. **`67b6a30`** - "Remove empty auth callback route file"
   - Clean callback setup

## After Reverting

1. **Test OAuth:**
   ```bash
   npm run dev
   ```
   - Go to `/auth`
   - Try "Sign in with Google"
   - Should work without PKCE errors

2. **If it works, commit:**
   ```bash
   git add .
   git commit -m "Revert to working OAuth version"
   git push origin main
   ```

3. **If it doesn't work, try the next commit:**
   ```bash
   git checkout bdd9cc6
   ```

## Important Notes

⚠️ **Warning:** Reverting will lose all changes made after that commit, including:
- Wishlist removal (which you already did)
- PKCE error fixes
- Recent OAuth troubleshooting

✅ **Good news:** You can always come back:
```bash
git checkout main
```

## Quick Command

To quickly revert to the working OAuth version:

```bash
git checkout 987edd1
```

Then test OAuth. If it works, you're good! If not, try the alternative commits listed above.

