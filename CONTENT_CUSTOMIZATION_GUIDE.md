# Content Customization Guide

## 📝 Customizable Content

This guide shows you what text/content you can customize on your website.

---

## 🏠 Homepage Content

### Hero Section (`app/page.tsx`)

**Current Text:**
- Title: "Welcome to Ecommerce Start"
- Subtitle: "Discover amazing products at unbeatable prices. Shop the latest trends and technology with confidence."
- Badge: "Premium Quality Products"

**How to Change:**
1. Open `app/page.tsx`
2. Find the hero section (around line 32)
3. Update the text:
   ```tsx
   <h1 className="...">
     Your Custom Title Here
   </h1>
   <p className="...">
     Your custom subtitle here
   </p>
   ```

### Stats Section (`app/page.tsx`)

**Current Stats:**
- 10K+ Happy Customers
- 500+ Products
- 50+ Countries
- 24/7 Support

**How to Change:**
1. Open `app/page.tsx`
2. Find stats section (around line 149)
3. Update numbers and text

### Features Section (`app/page.tsx`)

**Current Features:**
- Quality Guaranteed
- Fast Shipping
- Premium Support
- Secure Payment

**How to Change:**
1. Open `app/page.tsx`
2. Find features section (around line 80)
3. Update titles and descriptions

---

## 🦶 Footer Content (`app/layout.tsx`)

**Current Content:**
- Brand: "Ecommerce Start"
- Tagline: "Your trusted destination for quality products and exceptional service."
- Links: Shop, Support, Account sections

**How to Change:**
1. Open `app/layout.tsx`
2. Find footer section (around line 52)
3. Update:
   - Brand name
   - Tagline
   - Footer links
   - Copyright text

---

## 🏷️ Brand Name

**Where Brand Name Appears:**
- Navbar logo
- Footer
- Page titles
- Meta tags

**How to Change Globally:**
1. Search for "Ecommerce Start" in codebase
2. Replace with your brand name
3. Update `app/layout.tsx` metadata

---

## 📧 Contact Information

**Current:** Links point to "/" (homepage)

**How to Add Real Links:**
1. Open `app/layout.tsx`
2. Find footer links
3. Update href attributes:
   ```tsx
   <li><a href="mailto:contact@yourdomain.com">Contact Us</a></li>
   <li><a href="/shipping">Shipping Info</a></li>
   ```

---

## 🎨 Color Scheme

**Current Colors:**
- Primary: Indigo/Purple gradient
- Accent: Pink
- Background: Gray/White

**How to Change:**
1. Open `tailwind.config.ts`
2. Update color values
3. Open `app/globals.css`
4. Update CSS variables

---

## 📱 Meta Tags (`app/layout.tsx`)

**Current:**
- Title: "Ecommerce Start - Modern Shopping Experience"
- Description: "Discover amazing products at great prices"

**How to Change:**
1. Open `app/layout.tsx`
2. Find `metadata` export
3. Update:
   ```tsx
   export const metadata: Metadata = {
     title: 'Your Store Name - Your Tagline',
     description: 'Your store description',
   }
   ```

---

## 🔗 Social Media Links (Optional)

**To Add:**
1. Open `app/layout.tsx`
2. Add to footer:
   ```tsx
   <div>
     <h4>Follow Us</h4>
     <a href="https://facebook.com/yourpage">Facebook</a>
     <a href="https://instagram.com/yourpage">Instagram</a>
   </div>
   ```

---

## 📞 Support Information

**To Add Contact Info:**
1. Create contact page: `app/contact/page.tsx`
2. Add link in footer
3. Add contact form if needed

---

## 🎯 Call-to-Action Buttons

**Current CTAs:**
- "Shop Now"
- "Learn More"
- "Add to Cart"
- "Proceed to Checkout"

**How to Change:**
- Search for button text in components
- Update to match your brand voice

---

## ✅ Content Review Checklist

Before going live, review:

- [ ] Brand name updated everywhere
- [ ] Taglines match your brand
- [ ] Contact information added
- [ ] Footer links point to real pages
- [ ] Meta tags updated
- [ ] Stats reflect your business (or removed)
- [ ] Features match your offerings
- [ ] All placeholder text replaced

---

**Note:** Most content is in:
- `app/page.tsx` - Homepage
- `app/layout.tsx` - Footer, metadata
- `components/Navbar.tsx` - Navigation

