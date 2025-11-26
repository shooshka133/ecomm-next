/**
 * Brand Configuration
 * 
 * This file allows instant rebranding of the entire store.
 * All fields are optional - missing values fall back to defaults.
 * 
 * To customize your store:
 * 1. Edit this file with your brand values
 * 2. Place logo files in /public/brand/
 * 3. Restart dev server
 * 
 * Safe: If this file is missing or incomplete, store uses defaults.
 */

export const brand = {
  // Store Identity
  name: "Ecommerce Start",
  slogan: "Your trusted destination for quality products and exceptional service.",
  
  // Assets (place files in /public/brand/)
  logoUrl: "/icon.svg",  // Original logo
  faviconUrl: "/icon.svg",  // Falls back to /icon.svg if not found
  appleIconUrl: "/apple-icon.svg",  // Falls back to /apple-icon.svg if not found
  ogImage: "/icon.svg",  // Falls back to logo if not found
  
  // Color Palette (used for Tailwind CSS variables)
  colors: {
    primary: "#4F46E5",  // Indigo-600 (Original)
    accent: "#7C3AED",   // Purple-600 (Original)
    secondary: "#6366F1", // Indigo-500
    background: "#FFFFFF", // White
    text: "#1F2937",      // Gray-800
  },
  
  // Typography
  fontFamily: {
    primary: "Inter, sans-serif",
    heading: "Poppins, sans-serif",
  },
  
  // Domain & Contact
  domain: "store.shooshka.online",
  contactEmail: "support@example.com",
  adminEmails: ["admin@example.com"],
  
  // SEO Metadata
  seo: {
    title: "Ecommerce Start - Modern Shopping Experience",
    description: "Discover amazing products at great prices",
    keywords: "shopping, ecommerce, products, online store",
  },
  
  // Homepage Hero Section
  hero: {
    title: "Welcome to Ecommerce Start",
    subtitle: "Discover amazing products at unbeatable prices. Shop the latest trends and technology with confidence.",
    ctaText: "Shop Now",
    badge: "Premium Quality Products",
  },
  
  // Social Media Links
  social: {
    instagram: "",
    facebook: "",
    twitter: "",
    linkedin: "",
  },
  
  // Footer Content
  footer: {
    copyright: "© 2024 Ecommerce Start. All rights reserved.",
    links: {
      shop: [
        { label: "All Products", href: "/" },
        { label: "New Arrivals", href: "/" },
        { label: "Best Sellers", href: "/" },
        { label: "Sale", href: "/" },
      ],
      support: [
        { label: "Contact Us", href: "/" },
        { label: "Shipping Info", href: "/" },
        { label: "Returns", href: "/" },
        { label: "FAQ", href: "/" },
      ],
    },
  },
  
  // Feature Stats (homepage)
  stats: {
    customers: "10K+",
    products: "500+",
    countries: "50+",
    support: "24/7",
  },
  
  // Feature Highlights (homepage)
  features: [
    {
      title: "Quality Guaranteed",
      description: "Premium products with satisfaction guarantee",
      icon: "Sparkles",
    },
    {
      title: "Fast Shipping",
      description: "Quick delivery to your doorstep",
      icon: "Truck",
    },
    {
      title: "Premium Support",
      description: "Dedicated customer service team",
      icon: "Shield",
    },
    {
      title: "Secure Payment",
      description: "Safe and encrypted transactions",
      icon: "Star",
    },
  ],
} as const;

// Type for brand configuration
export type BrandConfig = typeof brand;

