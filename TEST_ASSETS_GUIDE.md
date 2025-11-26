# Test Brand Assets Guide

## 📁 Test Assets Created

I've created simple SVG placeholder assets for testing. These are located in `/public/brand/`:

### ✅ Created Files:

1. **`test-logo.svg`** (200x200px)
   - Green background with "TB" text
   - Use as: Logo

2. **`test-favicon.svg`** (64x64px)
   - Green background with "TB" text
   - Use as: Favicon

3. **`test-apple-icon.svg`** (180x180px)
   - Green background with "TB" text
   - Use as: Apple Touch Icon

4. **`test-og-image.svg`** (1200x630px)
   - Green background with "TEST BRAND STORE" text
   - Use as: Open Graph Image (social sharing)

---

## 🎨 How to Use These Assets

### Option 1: Use SVG Files Directly

In the Brand Editor:
1. Click "Upload" for each asset type
2. Navigate to `public/brand/`
3. Select:
   - `test-logo.svg` for Logo
   - `test-favicon.svg` for Favicon
   - `test-apple-icon.svg` for Apple Icon
   - `test-og-image.svg` for OG Image

### Option 2: Convert to PNG (Recommended)

For better compatibility, convert SVG to PNG:

**Logo:**
- Size: 200x200px or larger
- File: `test-logo.png`

**Favicon:**
- Size: 32x32px or 64x64px
- File: `test-favicon.png`

**Apple Icon:**
- Size: 180x180px
- File: `test-apple-icon.png`

**OG Image:**
- Size: 1200x630px
- File: `test-og-image.png`

---

## 🛠️ Converting SVG to PNG

### Online Tools (Free):

1. **CloudConvert** (https://cloudconvert.com/svg-to-png)
   - Upload SVG
   - Set dimensions
   - Download PNG

2. **Convertio** (https://convertio.co/svg-png/)
   - Simple drag-and-drop
   - Batch conversion available

3. **SVG to PNG** (https://svgtopng.com/)
   - Quick conversion
   - No signup required

### Using ImageMagick (Command Line):

```bash
# Install ImageMagick first
# Then convert:

# Logo (200x200)
magick public/brand/test-logo.svg -resize 200x200 public/brand/test-logo.png

# Favicon (64x64)
magick public/brand/test-favicon.svg -resize 64x64 public/brand/test-favicon.png

# Apple Icon (180x180)
magick public/brand/test-apple-icon.svg -resize 180x180 public/brand/test-apple-icon.png

# OG Image (1200x630)
magick public/brand/test-og-image.svg -resize 1200x630 public/brand/test-og-image.png
```

---

## 🎨 Creating Custom Test Assets

### Simple Logo Design Tools:

1. **Canva** (https://www.canva.com/)
   - Free logo maker
   - Export as PNG
   - Templates available

2. **LogoMaker** (https://www.logomaker.com/)
   - Simple logo creation
   - Free tier available

3. **Figma** (https://www.figma.com/)
   - Professional design tool
   - Free for personal use
   - Export as PNG/SVG

### Quick Test Logo Ideas:

**Option 1: Text Logo**
- Background: Your brand color
- Text: First 2 letters of brand name
- Example: "TB" for "Test Brand"

**Option 2: Icon Logo**
- Use emoji or icon
- Example: 🛍️ (shopping bag)
- Convert to image

**Option 3: Simple Shape**
- Circle/square with brand color
- Add text inside
- Minimal design

---

## 📐 Recommended Sizes

### Logo
- **Minimum:** 200x200px
- **Recommended:** 400x400px
- **Format:** PNG (transparent background) or SVG

### Favicon
- **Size:** 32x32px or 64x64px
- **Format:** PNG or ICO
- **Note:** Can also use SVG (modern browsers)

### Apple Touch Icon
- **Size:** 180x180px
- **Format:** PNG
- **Note:** Required for iOS home screen

### OG Image (Social Sharing)
- **Size:** 1200x630px (1.91:1 ratio)
- **Format:** PNG or JPG
- **Note:** Shows when sharing on Facebook, Twitter, etc.

---

## 🧪 Testing Without Assets

**You can skip asset uploads for initial testing:**
- System will use fallback images (`/icon.svg`)
- Colors and text will still work
- You can add assets later

**To test with assets:**
1. Upload at least the logo
2. See it in preview
3. Verify it appears in Navbar/Footer (if components updated)

---

## 📝 Quick Test Checklist

- [ ] Logo uploaded (200x200px or larger)
- [ ] Favicon uploaded (32x32px or 64x64px)
- [ ] Apple Icon uploaded (180x180px)
- [ ] OG Image uploaded (1200x630px)
- [ ] Preview shows all assets correctly
- [ ] Assets display in brand preview modal

---

## 💡 Pro Tips

1. **Start Simple:** Use the SVG files I created for quick testing
2. **Test First:** Upload one asset, preview, then add more
3. **Keep Originals:** Save original files before uploading
4. **File Names:** Use descriptive names (e.g., `test-brand-logo.png`)
5. **File Size:** Keep images under 5MB for faster uploads

---

## 🚨 Common Issues

**Issue: "File too large"**
- Solution: Compress image or reduce dimensions

**Issue: "Invalid file type"**
- Solution: Use PNG, JPG, or SVG format

**Issue: "Image not showing"**
- Solution: Check file path, verify upload succeeded

**Issue: "Wrong dimensions"**
- Solution: Resize image to recommended size

---

## 🎯 Next Steps

1. **Use SVG files** I created (in `/public/brand/`)
2. **Or convert to PNG** using online tools
3. **Upload in Brand Editor** when creating test brand
4. **Preview** to verify they display correctly
5. **Save** and test the brand

---

## 📚 Additional Resources

- **Free Stock Images:** Unsplash, Pexels
- **Icon Libraries:** Font Awesome, Heroicons
- **Logo Templates:** Canva, LogoMaker
- **Image Optimization:** TinyPNG, Squoosh

