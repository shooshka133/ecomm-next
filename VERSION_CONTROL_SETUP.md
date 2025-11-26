# 📦 Version Control Setup - Ecommerce Start Default

## ✅ Current State

- **Brand:** Ecommerce Start (default/fallback)
- **Branch:** `admin/brand-ui`
- **Status:** Ready to commit

---

## 🎯 Step 1: Verify Current Brand

Your `brand.config.ts` is set to:
- ✅ **Name:** "Ecommerce Start"
- ✅ **Colors:** Indigo/Purple (original)
- ✅ **Logo:** `/icon.svg` (original)

**This is correct!** ✅

---

## 📝 Step 2: Prepare Commit

### What to Include:

**Core Changes:**
- ✅ Multi-brand system (admin UI, storage, service router)
- ✅ Service router implementation (Supabase, Resend, Stripe routing)
- ✅ Brand configuration restored to Ecommerce Start
- ✅ All component updates for dynamic branding

**Documentation:**
- ✅ Complete multi-brand guides
- ✅ Grocery store setup guides
- ✅ Deployment guides (Vercel, Docker)
- ✅ Troubleshooting guides

**New Features:**
- ✅ Grocery products SQL
- ✅ Import scripts
- ✅ Test assets

---

## 🚀 Step 3: Commit Commands

### Option A: Commit Everything (Recommended)

```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: Multi-brand system with service router

- Add admin brand management UI
- Implement service router for multi-tenant support
- Add grocery store products and setup guides
- Restore Ecommerce Start as default brand
- Add comprehensive documentation
- Update all components for dynamic branding

Brands supported:
- Ecommerce Start (default)
- Green Theme Store
- Grocery Store (ready for setup)

Service router supports:
- Multiple Supabase projects
- Multiple Resend accounts
- Multiple Stripe accounts"

# Push to remote
git push origin admin/brand-ui
```

### Option B: Commit in Stages

```bash
# 1. Commit core multi-brand system
git add app/admin/brand-settings/ app/api/admin/brands/ components/admin/ lib/brand/ migrations/
git commit -m "feat: Add admin brand management system"

# 2. Commit service router
git add lib/services/ lib/stripe.ts lib/email/send.ts app/api/checkout/route.ts app/api/webhook/route.ts
git commit -m "feat: Add service router for multi-tenant support"

# 3. Commit component updates
git add components/ app/page.tsx app/layout.tsx app/globals.css
git commit -m "feat: Update components for dynamic branding"

# 4. Commit brand config
git add brand.config.ts
git commit -m "chore: Restore Ecommerce Start as default brand"

# 5. Commit documentation
git add *.md grocery-products.sql scripts/
git commit -m "docs: Add comprehensive multi-brand documentation"

# 6. Commit test assets
git add public/brand/
git commit -m "chore: Add test brand assets"

# Push all commits
git push origin admin/brand-ui
```

---

## 🏷️ Step 4: Create Version Tag (Optional)

After committing, create a tag for this version:

```bash
# Create tag
git tag -a v1.0.0-ecommerce-start -m "Ecommerce Start default version with multi-brand support"

# Push tag
git push origin v1.0.0-ecommerce-start
```

---

## ✅ Step 5: Verify Before Push

### Check What Will Be Pushed:

```bash
# See what will be pushed
git log origin/admin/brand-ui..HEAD

# See file changes
git diff --stat origin/admin/brand-ui
```

### Make Sure Sensitive Files Are Ignored:

Check `.gitignore` includes:
- ✅ `.env*.local`
- ✅ `.env`
- ✅ `node_modules/`
- ✅ `.next/`
- ✅ `logs/` (if contains sensitive data)

---

## 📋 Pre-Push Checklist

- [ ] `brand.config.ts` is set to Ecommerce Start ✅
- [ ] All changes are committed
- [ ] No sensitive data in commits (API keys, passwords)
- [ ] Documentation is complete
- [ ] Code compiles without errors
- [ ] Ready to push

---

## 🚨 Important Notes

### Files NOT to Commit:

- ❌ `.env.local` (already in .gitignore)
- ❌ `.env` (already in .gitignore)
- ❌ `node_modules/` (already in .gitignore)
- ❌ `.next/` (already in .gitignore)

### Files TO Commit:

- ✅ `brand.config.ts` (Ecommerce Start config)
- ✅ All code changes
- ✅ Documentation files
- ✅ Grocery products SQL
- ✅ Test assets

---

## 🎯 Quick Commit (Copy & Paste)

```bash
# Add everything
git add .

# Commit
git commit -m "feat: Multi-brand system with Ecommerce Start as default

- Complete multi-brand management system
- Service router for multi-tenant support
- Grocery store setup ready
- Comprehensive documentation
- Ecommerce Start restored as default"

# Push
git push origin admin/brand-ui
```

---

## 📝 Commit Message Best Practices

**Format:**
```
type: Short description

Longer description explaining:
- What was changed
- Why it was changed
- What it enables
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `chore:` Maintenance
- `refactor:` Code restructuring

---

## ✅ After Pushing

1. **Verify on GitHub:**
   - Check branch: `admin/brand-ui`
   - Verify all files are there
   - Check commit message

2. **Vercel Auto-Deploy:**
   - If branch is connected to Vercel
   - Should auto-deploy
   - Check Vercel dashboard

3. **Create Pull Request (if needed):**
   - Merge `admin/brand-ui` → `main`
   - Review changes
   - Merge when ready

---

## 🎉 Summary

**Current State:**
- ✅ Ecommerce Start is default (brand.config.ts)
- ✅ Multi-brand system complete
- ✅ Service router implemented
- ✅ Documentation complete
- ✅ Ready to commit and push

**Next Steps:**
1. Run commit commands above
2. Push to remote
3. Verify on GitHub
4. Continue with grocery store setup

---

**You're ready to push!** 🚀

