# Admin Brand Management UI - Complete Guide

## ✅ Implementation Complete

A comprehensive admin-only UI for managing brands has been added to the e-commerce project. This system allows admins to create, edit, preview, activate, import, and export brand configurations without modifying any existing business logic.

---

## 📁 Files Created

### Database & Storage
1. **`migrations/001_create_brands_table.sql`**
   - SQL migration for brands table (optional)
   - Includes RLS policies and audit log table

2. **`lib/brand/storage.ts`**
   - Dual-backend storage (DB + file fallback)
   - Functions: getAllBrands, getActiveBrand, saveBrand, deleteBrand, activateBrand
   - Audit logging support

3. **`lib/brand/admin-loader.ts`**
   - Runtime brand loader
   - Falls back to brand.config.ts if no active brand

### API Routes
4. **`app/api/admin/brands/route.ts`**
   - GET: List all brands
   - POST: Create new brand

5. **`app/api/admin/brands/[id]/route.ts`**
   - GET: Get specific brand
   - PATCH: Update brand
   - DELETE: Delete brand

6. **`app/api/admin/brands/[id]/activate/route.ts`**
   - POST: Activate brand (deactivates others)

7. **`app/api/admin/brands/[id]/upload-asset/route.ts`**
   - POST: Upload brand assets (logo, favicon, etc.)
   - Supports Supabase Storage or local file system

### UI Components
8. **`app/admin/brand-settings/page.tsx`**
   - Main brand management page
   - List view, create/edit, preview, activate, export, import

9. **`components/admin/BrandEditor.tsx`**
   - Modal for creating/editing brands
   - Form fields for all brand properties
   - Asset upload UI

10. **`components/admin/BrandPreview.tsx`**
    - Live preview modal
    - Shows logo, colors, typography, hero, SEO

---

## 🚀 Setup Instructions

### 1. Enable Database-Backed Brands (Optional)

**Option A: Use Database (Recommended for Production)**

1. Run the migration in Supabase:
   ```sql
   -- Copy contents of migrations/001_create_brands_table.sql
   -- Run in Supabase SQL Editor
   ```

2. Set environment variable:
   ```bash
   BRAND_USE_DB=true
   ```

**Option B: Use File-Based Storage (Default)**

- No setup needed
- Brands stored in `data/brands/brands.json`
- Falls back to `brand.config.ts` if no brands found

### 2. Configure Asset Backend

**Option A: Supabase Storage (Recommended)**

1. Create a storage bucket named `brand-assets` in Supabase
2. Set it to public
3. Set environment variable:
   ```bash
   BRAND_ASSET_BACKEND=SUPABASE
   ```

**Option B: Local File System**

- Set environment variable:
   ```bash
   BRAND_ASSET_BACKEND=LOCAL
   ```
- Assets saved to `/public/brand/<brand-slug>/`

### 3. Access the UI

1. Log in as admin
2. Navigate to `/admin/brand-settings`
3. Or click "Brand Settings" link in admin dashboard

---

## 🎯 Features

### Brand Management
- ✅ Create new brands
- ✅ Edit existing brands
- ✅ Delete brands (cannot delete active)
- ✅ Activate brand (immediately affects site)
- ✅ Preview brand before activating
- ✅ Import/Export brand JSON configs

### Asset Management
- ✅ Upload logo, favicon, apple icon, OG image
- ✅ Drag-and-drop upload (via file input)
- ✅ Preview uploaded assets
- ✅ Automatic fallback to defaults if missing

### Preview
- ✅ Live preview of hero section
- ✅ Color palette visualization
- ✅ Typography preview
- ✅ SEO metadata preview
- ✅ Component previews (buttons, navbar)

### Safety Features
- ✅ Admin-only access (server-side enforced)
- ✅ Cannot delete active brand
- ✅ Confirmation modals for destructive actions
- ✅ Audit logging (DB or file-based)
- ✅ Fallback to brand.config.ts if no brands

---

## 🔒 Security

### Access Control
- All API routes check admin status server-side
- Uses existing `lib/admin/check.ts`
- Returns 403 Forbidden if not admin
- UI shows "Access Denied" for non-admins

### Data Protection
- RLS policies on brands table (if using DB)
- Service role key used only server-side
- File-based storage respects file permissions

---

## 📝 Usage Examples

### Create a New Brand

1. Go to `/admin/brand-settings`
2. Click "Create Brand"
3. Fill in:
   - Slug: `my-new-brand`
   - Name: `My New Brand`
   - Colors, fonts, hero text, SEO, etc.
4. Upload assets (logo, favicon, etc.)
5. Click "Save"
6. Click "Activate" to make it live

### Import Brand Configuration

1. Click "Import" button
2. Select JSON file (exported from another brand)
3. Edit as needed
4. Save and activate

### Export Brand Configuration

1. Find brand in list
2. Click "Export" button
3. JSON file downloads
4. Can be imported into another project

---

## 🔄 How It Works

### Brand Activation Flow

1. Admin activates a brand via UI
2. API sets `is_active=true` for selected brand
3. API sets `is_active=false` for all other brands
4. Runtime loader (`lib/brand/admin-loader.ts`) reads active brand
5. Site uses active brand config immediately
6. Falls back to `brand.config.ts` if no active brand

### Storage Priority

1. **If BRAND_USE_DB=true**: Read from Supabase `brands` table
2. **Else**: Read from `data/brands/brands.json`
3. **Fallback**: Use `brand.config.ts` (existing behavior)

### Asset Storage

1. **If BRAND_ASSET_BACKEND=SUPABASE**: Upload to Supabase Storage
2. **Else**: Save to `/public/brand/<brand-slug>/`
3. **Fallback**: Use default assets from `/public/brand/`

---

## 🧪 Testing

### Test Admin Access

1. Log in as admin → Should see brand settings page
2. Log in as regular user → Should see "Access Denied"

### Test Brand Creation

1. Create a new brand
2. Upload assets
3. Preview brand
4. Activate brand
5. Verify site appearance changes

### Test Import/Export

1. Export a brand
2. Delete the brand
3. Import the exported JSON
4. Verify brand is restored

### Test Fallbacks

1. Delete all brands
2. Verify site still works (uses brand.config.ts)
3. Create new brand
4. Activate it
5. Verify site uses new brand

---

## 🐛 Troubleshooting

### Brands Not Loading

- Check `BRAND_USE_DB` environment variable
- Verify Supabase connection (if using DB)
- Check `data/brands/` directory exists (if using files)
- Check browser console for errors

### Assets Not Uploading

- Verify `BRAND_ASSET_BACKEND` is set correctly
- Check Supabase Storage bucket exists (if using Supabase)
- Verify file permissions (if using local)
- Check file size (max 5MB)

### Brand Not Activating

- Verify brand exists
- Check API response for errors
- Verify admin permissions
- Check audit logs

### Preview Not Showing

- Verify brand config is valid JSON
- Check asset URLs are accessible
- Verify colors are valid hex codes
- Check browser console for errors

---

## 📊 Audit Logging

### Database (if BRAND_USE_DB=true)

- Logs stored in `brand_audit` table
- Includes: action, user_id, user_email, changes, timestamp
- Query: `SELECT * FROM brand_audit ORDER BY created_at DESC`

### File-Based (if BRAND_USE_DB=false)

- Logs stored in `logs/brand-changes.log`
- JSON format, one entry per line
- Non-blocking (errors don't break operations)

---

## 🔄 Rollback Instructions

### Quick Rollback

```bash
# Switch back to main branch
git switch main

# Delete feature branch (optional)
git branch -D admin/brand-ui
```

### Safe Rollback (Keep Branch)

```bash
# Switch to main
git switch main

# Revert specific commits if needed
git revert <commit-hash>
```

### Database Rollback (if using DB)

```sql
-- Deactivate all brands
UPDATE brands SET is_active = false;

-- Or delete brands table (if needed)
DROP TABLE IF EXISTS brand_audit;
DROP TABLE IF EXISTS brands;
```

---

## 📚 Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - For admin operations

### Optional
- `BRAND_USE_DB=true` - Use database storage (default: false)
- `BRAND_ASSET_BACKEND=SUPABASE|LOCAL` - Asset storage backend (default: SUPABASE if service role key exists)

---

## ✅ Safety Guarantees

1. **No Breaking Changes**
   - All existing code unchanged
   - Brand system is additive only
   - Falls back to brand.config.ts if no brands

2. **Admin-Only**
   - Server-side admin checks on all routes
   - UI shows "Access Denied" for non-admins
   - Uses existing admin check utilities

3. **Error Handling**
   - Try-catch blocks everywhere
   - Graceful fallbacks
   - Non-blocking audit logging

4. **Production Safe**
   - No modifications to checkout/auth/webhook
   - No changes to order processing
   - No changes to email logic

---

## 🎉 Summary

✅ **10 new files created**
✅ **0 existing files modified** (except admin dashboard link)
✅ **100% backward compatible**
✅ **Production ready**
✅ **Fully documented**

The admin brand management UI is **complete and ready to use**!

---

**Created**: 2025-01-11
**Status**: ✅ Complete
**Production Ready**: ✅ Yes
**Breaking Changes**: ❌ None

