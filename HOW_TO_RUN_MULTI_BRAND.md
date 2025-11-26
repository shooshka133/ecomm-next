# How to Run & Test Multi-Brand System

## 🚀 Quick Start Guide

### Step 1: Access Admin Brand Settings

1. **Make sure you're logged in as admin**
2. **Navigate to:** `http://localhost:3000/admin/brand-settings`
3. **You should see:** Brand management interface

---

## 📝 Creating Your First Test Brand

### Step 1: Click "Create Brand"

- Click the **"Create Brand"** button (top right)
- A modal will open with the brand editor

### Step 2: Fill in Basic Information

**Required Fields:**
- **Slug:** `test-brand-1` (lowercase, hyphens, no spaces)
- **Name:** `Test Brand Store` (display name)

**Example:**
```
Slug: test-green-store
Name: Green Theme Store
```

### Step 3: Configure Colors

Set different colors to see the difference:

```
Primary Color: #10B981 (Green)
Accent Color: #059669 (Dark Green)
Secondary Color: #3B82F6 (Blue)
Background Color: #FFFFFF (White)
Text Color: #1F2937 (Dark Gray)
```

### Step 4: Set Typography

```
Primary Font: Roboto, sans-serif
Heading Font: Montserrat, sans-serif
```

### Step 5: Configure Hero Section

```
Title: Welcome to Test Brand Store
Subtitle: Experience premium quality products with exceptional service.
CTA Text: Start Shopping
Badge: New Arrivals
```

### Step 6: Set SEO

```
Title: Test Brand Store - Quality Products Online
Description: Shop the best products at Test Brand Store. Fast shipping, quality guaranteed.
```

### Step 7: Set Contact Email

```
Contact Email: test@testbrandstore.com
```

### Step 8: Save the Brand

1. **Click "Save" button** (bottom right)
2. **Wait for success message**
3. **Modal will close**
4. **Brand appears in the list**

---

## 🖼️ Uploading Assets (After Saving)

### Important: Save First!

**You must save the brand before uploading assets.**

### Step 1: Edit the Brand

1. Find your brand in the list
2. Click **"Edit"** button
3. Brand editor opens

### Step 2: Upload Assets

For each asset type:

1. **Click "Upload" button**
2. **Select file** from your computer
3. **Wait for upload** (shows "Uploading...")
4. **Success message** appears
5. **Image preview** shows in the editor

**Available Assets:**
- **Logo** - Main store logo (200x200px or larger)
- **Favicon** - Browser icon (32x32px or 64x64px)
- **Apple Icon** - iOS home screen (180x180px)
- **OG Image** - Social sharing (1200x630px)

**Test Assets Available:**
- `public/brand/test-logo.svg`
- `public/brand/test-favicon.svg`
- `public/brand/test-apple-icon.svg`
- `public/brand/test-og-image.svg`

### Step 3: Save Again

After uploading assets:
1. Click **"Save"** to update the brand
2. Assets are now linked to the brand

---

## 👀 Previewing a Brand

### Step 1: Open Preview

1. Find your brand in the list
2. Click **"Preview"** button (eye icon)
3. Preview modal opens

### Step 2: See Brand Details

The preview shows:
- ✅ Logo
- ✅ Colors (color swatches)
- ✅ Typography (font samples)
- ✅ Hero section (title, subtitle, CTA)
- ✅ SEO metadata

### Step 3: Close Preview

- Click **"X"** or outside the modal to close

---

## 🔄 Managing Brands

### View All Brands

The main page shows:
- Brand name
- Slug
- Active status (green checkmark if active)
- Actions (Edit, Delete, Activate, Preview, Export)

### Edit a Brand

1. Click **"Edit"** button
2. Make changes
3. Click **"Save"**

### Delete a Brand

1. Click **"Delete"** button (trash icon)
2. Confirm deletion
3. **Note:** Cannot delete active brand

### Activate a Brand

1. Click **"Activate"** button (checkmark icon)
2. Confirm activation
3. **Note:** This activates the brand (but won't affect store unless components are updated)

### Export a Brand

1. Click **"Export"** button (download icon)
2. JSON file downloads
3. Can be imported into another project

### Import a Brand

1. Click **"Import"** button (upload icon)
2. Select JSON file
3. Brand editor opens with imported data
4. Edit if needed
5. Click **"Save"**

---

## 🧪 Testing Checklist

### Basic Functionality

- [ ] Can access `/admin/brand-settings` as admin
- [ ] Can create a new brand
- [ ] Can edit an existing brand
- [ ] Can delete a brand (non-active)
- [ ] Can preview a brand
- [ ] Can export a brand
- [ ] Can import a brand

### Asset Upload

- [ ] Can upload logo (after saving brand)
- [ ] Can upload favicon
- [ ] Can upload Apple icon
- [ ] Can upload OG image
- [ ] Images display in preview
- [ ] Images save correctly

### Brand Configuration

- [ ] Colors save correctly
- [ ] Typography saves correctly
- [ ] Hero section saves correctly
- [ ] SEO metadata saves correctly
- [ ] Contact email saves correctly

### Storage

- [ ] Brands stored in database (if `BRAND_USE_DB=true`)
- [ ] OR brands stored in `data/brands/brands.json` (file-based)
- [ ] Assets stored in Supabase Storage (if configured)
- [ ] OR assets stored in `public/brand/<slug>/` (local)

---

## 🔍 Verifying Brand Storage

### File-Based Storage (Default)

**Check if brands are saved:**
```bash
# Windows PowerShell
Get-Content data\brands\brands.json

# Or check if file exists
Test-Path data\brands\brands.json
```

**Location:** `C:\ecomm\data\brands\brands.json`

### Database Storage (If Enabled)

**Check Supabase:**
1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. Open `brands` table
4. See your brands listed

---

## 🎯 Current Status

### What Works Now

✅ **Admin UI** - Create, edit, delete, preview brands
✅ **Asset Upload** - Upload logos, favicons, etc.
✅ **Brand Storage** - Saved to database or files
✅ **Import/Export** - Share brands between projects

### What Doesn't Affect Store Yet

❌ **Store Appearance** - Still uses `brand.config.ts`
❌ **Navbar/Footer** - Still shows default brand
❌ **Homepage** - Still shows default hero section

**Why?** Components read from `brand.config.ts` directly, not from database.

---

## 🚨 Common Issues & Solutions

### Issue: "Brand not found" Error

**Cause:** Trying to upload assets before saving brand

**Solution:**
1. Fill in Slug and Name
2. Click "Save" first
3. Then upload assets

### Issue: "Access Denied"

**Cause:** Not logged in as admin

**Solution:**
1. Make sure you're logged in
2. Verify you have admin privileges
3. Check `/api/admin/check` returns `isAdmin: true`

### Issue: Assets Not Uploading

**Cause:** Brand not saved, or file too large

**Solution:**
1. Save brand first
2. Check file size (max 5MB)
3. Use PNG, JPG, SVG, or WebP format

### Issue: Can't Delete Brand

**Cause:** Brand is active

**Solution:**
1. Activate another brand first
2. Then delete the inactive brand

---

## 📊 Next Steps

### To See Multi-Brand in Action

**Option 1: Test Admin UI Only (Current - Safe)**
- Create brands
- Preview them
- Export/Import
- **Store remains unchanged** ✅

**Option 2: Connect to Store (Requires Code Changes)**
- Update components to use `getActiveBrandConfig()`
- Set `BRAND_USE_DB=true`
- Activate a brand
- Store will use database brand

---

## 🎓 Learning Path

### Beginner
1. ✅ Create a test brand
2. ✅ Preview it
3. ✅ Export it

### Intermediate
1. ✅ Upload assets
2. ✅ Create multiple brands
3. ✅ Test import/export

### Advanced
1. ✅ Connect to database
2. ✅ Update components
3. ✅ See multi-brand in action

---

## 💡 Pro Tips

1. **Start Simple:** Create one brand first, test it, then create more
2. **Use Test Assets:** Use the SVG files in `public/brand/` for quick testing
3. **Export Before Delete:** Always export before deleting (backup)
4. **Test Preview:** Use preview to see how brand looks before activating
5. **Check Storage:** Verify brands are saved in database or files

---

## 📚 Related Files

- **Admin UI:** `app/admin/brand-settings/page.tsx`
- **Brand Editor:** `components/admin/BrandEditor.tsx`
- **Storage:** `lib/brand/storage.ts`
- **API Routes:** `app/api/admin/brands/*`
- **Test Assets:** `public/brand/test-*.svg`

---

## ✅ Success Indicators

You've successfully set up multi-brand when:

- ✅ Can access `/admin/brand-settings`
- ✅ Can create a brand
- ✅ Can save it
- ✅ Can upload assets
- ✅ Can preview it
- ✅ Can see it in the brands list

**Remember:** The store still uses `brand.config.ts` - this is normal and safe for testing!

---

## 🆘 Need Help?

**Check:**
1. Browser console for errors
2. Terminal/command prompt for server errors
3. Network tab for API errors
4. Storage location (database or files)

**Common Commands:**
```bash
# Check if dev server is running
npm run dev

# Check for errors
# Look in terminal where npm run dev is running
```

---

**You're all set! Start creating brands and testing the system! 🎉**

