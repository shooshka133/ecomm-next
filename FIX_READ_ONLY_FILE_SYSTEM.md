# 🔧 Fix: Read-Only File System Error

## Problem
When saving a brand in production, you get:
```
EROFS: read-only file system, open '/var/task/data/brands/brands.json'
```

## Cause
Vercel's serverless environment has a **read-only file system**. The code was trying to write to files instead of using the database.

## ✅ Solution

The code has been updated to **automatically use the database** when:
- Running in production (Vercel)
- Supabase credentials are available

### Step 1: Run Database Migration

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor:**
   - Click "SQL Editor" in the sidebar
   - Click "New query"

3. **Run the Migration:**
   - Copy the contents of `migrations/001_create_brands_table.sql`
   - Paste into SQL Editor
   - Click "Run"
   - ✅ Table `brands` created!

### Step 2: Set Environment Variable (Optional)

The code now **auto-detects** production and uses the database automatically. But you can explicitly enable it:

**In Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Add:
   - **Name:** `BRAND_USE_DB`
   - **Value:** `true`
   - **Environment:** Production, Preview, Development
3. Save

**Or in `.env.local` (for local testing):**
```env
BRAND_USE_DB=true
```

### Step 3: Verify Supabase Credentials

Make sure these are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## ✅ What Was Fixed

1. **Auto-detect production** - Code now detects Vercel/production environment
2. **Default to database** - Uses Supabase if credentials are available
3. **Graceful fallback** - If file write fails, tries database automatically
4. **Better error messages** - Clear instructions if database isn't configured

---

## 🧪 Test

1. **Go to:** `/admin/brand-settings`
2. **Create a new brand**
3. **Save** - Should work now! ✅

---

## 📝 Notes

- **Local Development:** Can still use file-based storage (optional)
- **Production:** Always uses database (required)
- **No file writes in production** - All data stored in Supabase

---

## 🚀 Status

✅ Code updated  
✅ Auto-detects production  
✅ Uses database by default  
✅ Handles read-only errors gracefully  

**Next:** Run the migration and test saving a brand!

