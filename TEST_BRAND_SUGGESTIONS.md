# Test Brand Suggestions for Multi-Brand Testing

## 🎨 Suggested Test Brand Values

Use these values to create a test brand that's clearly different from your default `brand.config.ts`, so you can see the difference when testing.

---

## Basic Information

**Slug:** `test-brand-1`
- URL-friendly identifier
- Use lowercase, hyphens, no spaces
- Examples: `test-brand-1`, `demo-store`, `my-test-brand`

**Name:** `Test Brand Store`
- Display name for your brand
- This will show in Navbar/Footer when brand is active
- Examples: `Test Brand Store`, `Demo Ecommerce`, `My Test Shop`

---

## Brand Assets

**Logo:**
- Upload a test logo (PNG/SVG)
- Recommended size: 200x200px or larger
- Use a different logo than your default to see the difference

**Favicon:**
- Upload a small icon (32x32px or 64x64px)
- Will appear in browser tab

**Apple Icon:**
- Upload Apple touch icon (180x180px)
- For iOS home screen

**OG Image:**
- Upload social sharing image (1200x630px)
- Shows when sharing on social media

**Note:** For testing, you can skip asset uploads initially - the system will use fallbacks.

---

## Colors

**Primary Color:** `#10B981` (Green)
- Different from default Indigo (#4F46E5)
- Use for buttons, links, highlights
- Example: `#10B981` (Emerald-500)

**Accent Color:** `#F59E0B` (Amber)
- Different from default Purple (#7C3AED)
- Use for secondary actions
- Example: `#F59E0B` (Amber-500)

**Secondary Color:** `#3B82F6` (Blue)
- Different from default Indigo (#6366F1)
- Use for hover states
- Example: `#3B82F6` (Blue-500)

**Background Color:** `#FFFFFF` (White)
- Page background
- Example: `#FFFFFF` or `#F3F4F6` (Gray-100)

**Text Color:** `#1F2937` (Dark Gray)
- Main text color
- Example: `#1F2937` (Gray-800) or `#111827` (Gray-900)

**Color Scheme Suggestions:**
- **Green Theme:** Primary: `#10B981`, Accent: `#059669`
- **Blue Theme:** Primary: `#3B82F6`, Accent: `#2563EB`
- **Red Theme:** Primary: `#EF4444`, Accent: `#DC2626`
- **Purple Theme:** Primary: `#8B5CF6`, Accent: `#7C3AED`

---

## Typography

**Primary Font:** `Roboto, sans-serif`
- Different from default Inter
- Examples: `Roboto, sans-serif`, `Open Sans, sans-serif`, `Lato, sans-serif`

**Heading Font:** `Montserrat, sans-serif`
- Different from default Poppins
- Examples: `Montserrat, sans-serif`, `Raleway, sans-serif`, `Playfair Display, serif`

**Font Pairing Suggestions:**
- Modern: `Inter` + `Poppins` (your default)
- Classic: `Roboto` + `Montserrat`
- Elegant: `Lato` + `Playfair Display`
- Bold: `Open Sans` + `Raleway`

---

## Hero Section

**Title:** `Welcome to Test Brand Store`
- Main headline on homepage
- Make it different from default: "Welcome to Ecommerce Start"
- Examples: 
  - `Welcome to Test Brand Store`
  - `Discover Amazing Products`
  - `Your One-Stop Shop`

**Subtitle:** `Experience premium quality products with exceptional service. Shop with confidence and enjoy fast, reliable delivery.`
- Supporting text under title
- Make it different from default
- Examples:
  - `Experience premium quality products with exceptional service.`
  - `Your trusted partner for all your shopping needs.`
  - `Quality products, unbeatable prices, delivered to your door.`

**CTA Text:** `Start Shopping`
- Button text
- Different from default "Shop Now"
- Examples: `Start Shopping`, `Browse Products`, `Explore Now`, `Get Started`

**Badge:** `New Arrivals`
- Small badge/tag text
- Different from default "Premium Quality Products"
- Examples: `New Arrivals`, `Limited Time`, `Best Sellers`, `Featured`

---

## SEO

**Title:** `Test Brand Store - Quality Products Online`
- Page title (browser tab, search results)
- Different from default: "Ecommerce Start - Modern Shopping Experience"
- Examples:
  - `Test Brand Store - Quality Products Online`
  - `Shop Test Brand - Best Prices & Fast Shipping`
  - `Test Brand Store | Your Trusted Shopping Destination`

**Description:** `Shop the best products at Test Brand Store. Fast shipping, quality guaranteed, and exceptional customer service.`
- Meta description (search results)
- Different from default: "Discover amazing products at great prices"
- Examples:
  - `Shop the best products at Test Brand Store. Fast shipping, quality guaranteed.`
  - `Your one-stop shop for quality products. Free shipping on orders over $50.`
  - `Discover premium products with unbeatable prices. Shop with confidence.`

---

## Contact

**Contact Email:** `test@testbrandstore.com`
- Different from default: "support@example.com"
- Examples:
  - `test@testbrandstore.com`
  - `hello@testbrand.com`
  - `support@testbrandstore.com`

---

## 📝 Complete Test Brand Example

Here's a complete example you can copy:

```
Slug: test-brand-green
Name: Green Theme Store

Colors:
- Primary: #10B981 (Green)
- Accent: #059669 (Dark Green)
- Secondary: #3B82F6 (Blue)
- Background: #FFFFFF (White)
- Text: #1F2937 (Dark Gray)

Typography:
- Primary Font: Roboto, sans-serif
- Heading Font: Montserrat, sans-serif

Hero:
- Title: Welcome to Green Theme Store
- Subtitle: Experience eco-friendly products with sustainable shipping. Shop green, live better.
- CTA Text: Go Green
- Badge: Eco-Friendly

SEO:
- Title: Green Theme Store - Sustainable Shopping
- Description: Shop eco-friendly products with fast, carbon-neutral shipping. Quality guaranteed.

Contact:
- Email: green@testbrandstore.com
```

---

## 🎯 Testing Strategy

### Test Brand 1: Green Theme
- Use green colors (#10B981)
- Different fonts (Roboto + Montserrat)
- Different hero text
- **Purpose:** See color changes clearly

### Test Brand 2: Blue Theme
- Use blue colors (#3B82F6)
- Different fonts (Open Sans + Raleway)
- Different hero text
- **Purpose:** Compare with Brand 1

### Test Brand 3: Minimal
- Use minimal colors (grays)
- Simple fonts
- Short hero text
- **Purpose:** Test minimal design

---

## ✅ Quick Test Checklist

- [ ] Create brand with different colors
- [ ] Use different fonts
- [ ] Change hero text
- [ ] Update SEO title/description
- [ ] Upload test logo (optional)
- [ ] Save brand
- [ ] Preview brand
- [ ] Verify it's different from default

---

## 💡 Pro Tips

1. **Start Simple:** Don't fill everything at once - test one section at a time
2. **Use Contrast:** Make test values clearly different from defaults
3. **Test Colors:** Use color picker to find complementary colors
4. **Preview First:** Use preview button before saving
5. **Export/Import:** Test export/import functionality with your test brand

---

## 🚨 Remember

- These are **test values** - your store still uses `brand.config.ts`
- Creating brands won't affect your running store
- Only activating a brand (if components are updated) would change the store
- You can safely create/delete test brands without breaking anything

