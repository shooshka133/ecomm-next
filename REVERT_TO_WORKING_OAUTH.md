# Revert to Working Google OAuth Version

## Option 1: Find a Previous Working Commit

Check your git history for a commit where OAuth was working:

```bash
git log --oneline -20
```

Look for commits before the PKCE error fixes. Common indicators:
- Commits mentioning "OAuth", "Google sign-in", "authentication"
- Commits before "PKCE", "code verifier" fixes
- Commits that say "working" or "stable"

## Option 2: Simplify Current Code

Instead of reverting, we can simplify the OAuth implementation to remove complex PKCE handling.

### Simplified Approach

The issue is likely that we're over-complicating the PKCE flow. A simpler approach:

1. **Use server-side callback only** (no client-side fallback)
2. **Ensure Supabase redirect URLs are correct**
3. **Remove complex sessionStorage handling**

## Option 3: Check Vercel Deployment History

1. Go to: https://vercel.com/ashrahalimo-8415s-projects/ecomm-next-yf7p
2. Click **Deployments**
3. Find a deployment where OAuth was working
4. Note the commit hash
5. Checkout that commit locally:
   ```bash
   git checkout <commit-hash>
   ```

## Recommended: Simplify Current Code

Rather than reverting, let's simplify the OAuth callback to a working version:

### What to Remove:
- Complex PKCE error handling
- Client-side code exchange fallback
- Pre-hydration scripts
- Multiple redirect attempts

### What to Keep:
- Simple server-side callback
- Proper redirect URL configuration
- Basic error handling

Would you like me to:
1. **Find and checkout a previous working commit?** (requires git history)
2. **Simplify the current OAuth code to a working version?** (recommended)
3. **Check Vercel deployment history for a working version?**

Let me know which approach you prefer!

