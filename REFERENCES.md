# How to Revert to Working Version (auth/callback)

This document explains how to revert your codebase to the working version that uses `/auth/callback` for Google OAuth.

## Current Working Version Information

- **Commit**: `cdcff00`
- **Tag**: `v-working-auth-callback`
- **Description**: Working version with `/auth/callback` - Google OAuth functional
- **Key Change**: Uses `/auth/callback` instead of `/api/auth/callback`

## Files in This Version

- ✅ `lib/auth/googleOAuth.ts` - Uses `/auth/callback` for OAuth redirect
- ✅ `app/auth/callback/route.ts` - Active callback route handler
- ✅ All production features working

## How to Revert to This Version

### Method 1: Using Git Log (Find the Commit)

1. **Find the commit hash**:
   ```bash
   git log --oneline -10
   ```
   Look for the commit with message about "working version" or "auth/callback"

2. **Reset to that commit**:
   ```bash
   git reset --hard <commit-hash>
   ```

### Method 2: Using Git Tag (Recommended)

A tag was created for this version:

```bash
git reset --hard v-working-auth-callback
```

### Method 3: Using Git Reflog (If You Just Committed)

If you just made this commit and want to go back:

```bash
# See recent commits
git reflog

# Reset to the commit you want
git reset --hard HEAD@{n}
```

## Quick Revert Command

After finding the commit hash, use:

```bash
git reset --hard <commit-hash>
```

## Verify After Reverting

1. **Check the callback URL** in `lib/auth/googleOAuth.ts`:
   ```bash
   grep "callback" lib/auth/googleOAuth.ts
   ```
   Should show: `/auth/callback`

2. **Verify the route exists**:
   ```bash
   ls app/auth/callback/route.ts
   ```
   File should exist

3. **Test the application**:
   ```bash
   npm run dev
   ```

## Important Notes

⚠️ **WARNING**: Using `git reset --hard` will **permanently delete** all uncommitted changes. Make sure you've saved or committed anything important before reverting.

### Before Reverting

1. **Check your current status**:
   ```bash
   git status
   ```

2. **Save any important changes** (if needed):
   ```bash
   # Option A: Commit your changes
   git add -A
   git commit -m "Save current work before revert"

   # Option B: Create a backup branch
   git branch backup-before-revert
   ```

## What This Version Contains

- ✅ Google OAuth using `/auth/callback`
- ✅ Active callback route at `app/auth/callback/route.ts`
- ✅ All production features working
- ✅ No experimental changes

## Troubleshooting

### If revert doesn't work:

1. **Make sure you're on the main branch**:
   ```bash
   git checkout main
   ```

2. **Fetch latest from remote**:
   ```bash
   git fetch origin
   ```

3. **Try the revert again**

### If you have uncommitted changes:

1. **Stash your changes**:
   ```bash
   git stash
   ```

2. **Revert**:
   ```bash
   git reset --hard <commit-hash>
   ```

3. **If you need your stashed changes later**:
   ```bash
   git stash list
   git stash apply
   ```

---

*This version uses `/auth/callback` for Google OAuth and is the working version.*

