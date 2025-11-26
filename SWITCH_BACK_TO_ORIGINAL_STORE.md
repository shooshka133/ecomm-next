# 🔄 Switch Back to Original Store (store.shooshka.online)

## Quick Answer

You're currently on **Green Theme Store** and want to switch back to the **original store** (Ecommerce Start).

---

## 🎯 Method 1: Using Admin Panel (Easiest)

### Step 1: Access Admin Panel

1. **Go to:** `http://localhost:3000/admin/brand-settings`
   - If you get 404, see `FIX_ADMIN_BRAND_SETTINGS_404.md`
   - Or go to: `http://localhost:3000/admin` and click "Brand Settings"

2. **Sign in** if needed

### Step 2: Find Original Brand

Look for:
- **"Ecommerce Start"** brand
- Or **"Default"** brand
- Or the brand with slug: `ecommerce-start`

### Step 3: Activate Original Brand

1. **Find the brand** in the list
2. **Click "Activate"** button
3. ✅ **Done!** Store switches back

---

## 🎯 Method 2: Using API Directly

If admin panel doesn't work, use API:

### Step 1: Find Brand ID/Slug

The original brand is likely:
- **Slug:** `ecommerce-start`
- **Name:** `Ecommerce Start`

### Step 2: Activate via API

Open browser console (F12) and run:

```javascript
// Activate ecommerce-start brand
fetch('/api/admin/brands/ecommerce-start/activate', {
  method: 'POST',
  credentials: 'include'
})
.then(res => res.json())
.then(data => {
  console.log('Brand activated:', data)
  window.location.reload()
})
.catch(err => console.error('Error:', err))
```

Or use curl:

```bash
curl -X POST http://localhost:3000/api/admin/brands/ecommerce-start/activate \
  -H "Cookie: your-auth-cookie"
```

---

## 🎯 Method 3: Direct Database Update

If you have access to Supabase:

### Step 1: Go to Supabase Dashboard

1. **Open:** https://supabase.com/dashboard
2. **Select your project**
3. **Go to:** SQL Editor

### Step 2: Run SQL

```sql
-- Deactivate all brands
UPDATE brands
SET is_active = false
WHERE is_active = true;

-- Activate ecommerce-start brand
UPDATE brands
SET is_active = true
WHERE slug = 'ecommerce-start';

-- If ecommerce-start doesn't exist, activate default
-- The system will fall back to brand.config.ts
```

---

## 🎯 Method 4: Use brand.config.ts (Fallback)

If no brand is active, the system uses `brand.config.ts`:

### Step 1: Deactivate All Brands

In Supabase SQL Editor:

```sql
UPDATE brands
SET is_active = false;
```

### Step 2: System Falls Back

- System will use `brand.config.ts` automatically
- This is your original store configuration

---

## 🔍 Check Current Active Brand

To see which brand is currently active:

### Method 1: Check Admin Panel

1. Go to: `http://localhost:3000/admin/brand-settings`
2. Look for brand with **green checkmark** or **"Active"** badge

### Method 2: Check API

Visit: `http://localhost:3000/api/admin/brands`

Look for brand with `"is_active": true`

### Method 3: Check Browser Console

```javascript
fetch('/api/admin/brands')
  .then(res => res.json())
  .then(data => {
    const active = data.brands.find(b => b.is_active)
    console.log('Active brand:', active)
  })
```

---

## 🎨 What You'll See After Switching

**Original Store (Ecommerce Start):**
- ✅ Original logo/name
- ✅ Original colors (indigo/purple theme)
- ✅ Original products (electronics, etc.)
- ✅ Original branding

**Green Theme Store:**
- ❌ Green colors
- ❌ Green Theme Store name
- ❌ Grocery products (if imported)

---

## 🚀 Quick Steps Summary

1. **Go to:** `http://localhost:3000/admin/brand-settings`
2. **Find:** "Ecommerce Start" brand
3. **Click:** "Activate"
4. **Refresh:** Homepage
5. ✅ **Done!**

---

## ❓ Troubleshooting

### Issue: Can't Access Admin Panel

**Solution:**
- Make sure you're logged in
- Make sure you're an admin
- See `FIX_ADMIN_BRAND_SETTINGS_404.md`

### Issue: No "Ecommerce Start" Brand

**Solution:**
- The system might be using `brand.config.ts` (default)
- Deactivate all brands in database
- System will fall back to `brand.config.ts`

### Issue: Brand Not Switching

**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Check browser console for errors

---

## 💡 Pro Tip

**To quickly switch between brands:**

1. Bookmark: `http://localhost:3000/admin/brand-settings`
2. One click to switch brands
3. Refresh homepage to see changes

---

## 📝 Brand Slugs Reference

- **Original Store:** `ecommerce-start` or uses `brand.config.ts`
- **Green Theme Store:** `green-theme-store`
- **Grocery Store:** `grocery-store` (when created)

---

**After switching, refresh the homepage to see the original store!** 🎉

