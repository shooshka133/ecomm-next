/**
 * Brand Configuration Utilities
 * 
 * This module provides safe access to brand configuration.
 * All functions have fallbacks to ensure the store works even if
 * brand.config.ts is missing or incomplete.
 * 
 * NO BUSINESS LOGIC - Only configuration reading with fallbacks.
 */

import { brand } from '@/brand.config';

// Default fallback values
const DEFAULTS = {
  name: 'E-Commerce Store',
  slogan: 'Your trusted destination for quality products and exceptional service.',
  logoUrl: '/icon.svg',
  faviconUrl: '/icon.svg',
  appleIconUrl: '/apple-icon.svg',
  ogImage: '/icon.svg',
  primaryColor: '#4F46E5',
  accentColor: '#7C3AED',
  contactEmail: 'support@example.com',
  adminEmails: [] as string[],
  seoTitle: 'E-Commerce Store - Modern Shopping Experience',
  seoDescription: 'Discover amazing products at great prices',
  heroTitle: 'Welcome to Our Store',
  heroSubtitle: 'Discover amazing products at unbeatable prices.',
  heroCtaText: 'Shop Now',
  heroBadge: 'Premium Quality Products',
  fontPrimary: 'Inter, sans-serif',
  fontHeading: 'Poppins, sans-serif',
};

/**
 * Get store name with fallback
 */
export function getBrandName(): string {
  try {
    return brand?.name || DEFAULTS.name;
  } catch {
    return DEFAULTS.name;
  }
}

/**
 * Get store slogan with fallback
 */
export function getBrandSlogan(): string {
  try {
    return brand?.slogan || DEFAULTS.slogan;
  } catch {
    return DEFAULTS.slogan;
  }
}

/**
 * Get logo URL with fallback
 * Checks if file exists, falls back to default if not
 */
export function getLogoUrl(): string {
  try {
    return brand?.logoUrl || DEFAULTS.logoUrl;
  } catch {
    return DEFAULTS.logoUrl;
  }
}

/**
 * Get favicon URL with fallback
 */
export function getFaviconUrl(): string {
  try {
    return brand?.faviconUrl || DEFAULTS.faviconUrl;
  } catch {
    return DEFAULTS.faviconUrl;
  }
}

/**
 * Get Apple icon URL with fallback
 */
export function getAppleIconUrl(): string {
  try {
    return brand?.appleIconUrl || DEFAULTS.appleIconUrl;
  } catch {
    return DEFAULTS.appleIconUrl;
  }
}

/**
 * Get OG image URL with fallback
 */
export function getOgImageUrl(): string {
  try {
    return brand?.ogImage || brand?.logoUrl || DEFAULTS.ogImage;
  } catch {
    return DEFAULTS.ogImage;
  }
}

/**
 * Get primary color with fallback
 */
export function getPrimaryColor(): string {
  try {
    return brand?.colors?.primary || DEFAULTS.primaryColor;
  } catch {
    return DEFAULTS.primaryColor;
  }
}

/**
 * Get accent color with fallback
 */
export function getAccentColor(): string {
  try {
    return brand?.colors?.accent || DEFAULTS.accentColor;
  } catch {
    return DEFAULTS.accentColor;
  }
}

/**
 * Get secondary color with fallback
 */
export function getSecondaryColor(): string {
  try {
    return brand?.colors?.secondary || brand?.colors?.accent || DEFAULTS.accentColor;
  } catch {
    return DEFAULTS.accentColor;
  }
}

/**
 * Get all brand colors
 */
export function getBrandColors() {
  try {
    return {
      primary: getPrimaryColor(),
      accent: getAccentColor(),
      secondary: getSecondaryColor(),
      background: brand?.colors?.background || DEFAULTS.primaryColor,
      text: brand?.colors?.text || DEFAULTS.primaryColor,
    };
  } catch {
    return {
      primary: DEFAULTS.primaryColor,
      accent: DEFAULTS.accentColor,
      secondary: DEFAULTS.accentColor,
      background: DEFAULTS.primaryColor,
      text: DEFAULTS.primaryColor,
    };
  }
}

/**
 * Get contact email with fallback
 */
export function getContactEmail(): string {
  try {
    return brand?.contactEmail || DEFAULTS.contactEmail;
  } catch {
    return DEFAULTS.contactEmail;
  }
}

/**
 * Get admin emails with fallback
 */
export function getAdminEmails(): string[] {
  try {
    if (brand?.adminEmails) {
      return Array.from(brand.adminEmails) as string[];
    }
    return DEFAULTS.adminEmails;
  } catch {
    return DEFAULTS.adminEmails;
  }
}

/**
 * Get SEO title with fallback
 */
export function getSeoTitle(): string {
  try {
    return brand?.seo?.title || DEFAULTS.seoTitle;
  } catch {
    return DEFAULTS.seoTitle;
  }
}

/**
 * Get SEO description with fallback
 */
export function getSeoDescription(): string {
  try {
    return brand?.seo?.description || DEFAULTS.seoDescription;
  } catch {
    return DEFAULTS.seoDescription;
  }
}

/**
 * Get hero title with fallback
 */
export function getHeroTitle(): string {
  try {
    return brand?.hero?.title || DEFAULTS.heroTitle;
  } catch {
    return DEFAULTS.heroTitle;
  }
}

/**
 * Get hero subtitle with fallback
 */
export function getHeroSubtitle(): string {
  try {
    return brand?.hero?.subtitle || DEFAULTS.heroSubtitle;
  } catch {
    return DEFAULTS.heroSubtitle;
  }
}

/**
 * Get hero CTA text with fallback
 */
export function getHeroCtaText(): string {
  try {
    return brand?.hero?.ctaText || DEFAULTS.heroCtaText;
  } catch {
    return DEFAULTS.heroCtaText;
  }
}

/**
 * Get hero badge text with fallback
 */
export function getHeroBadge(): string {
  try {
    return brand?.hero?.badge || DEFAULTS.heroBadge;
  } catch {
    return DEFAULTS.heroBadge;
  }
}

/**
 * Get social media links
 */
export function getSocialLinks() {
  try {
    return {
      instagram: brand?.social?.instagram || '',
      facebook: brand?.social?.facebook || '',
      twitter: brand?.social?.twitter || '',
      linkedin: brand?.social?.linkedin || '',
    };
  } catch {
    return {
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: '',
    };
  }
}

/**
 * Get font family for primary text
 */
export function getPrimaryFont(): string {
  try {
    return brand?.fontFamily?.primary || DEFAULTS.fontPrimary;
  } catch {
    return DEFAULTS.fontPrimary;
  }
}

/**
 * Get font family for headings
 */
export function getHeadingFont(): string {
  try {
    return brand?.fontFamily?.heading || DEFAULTS.fontHeading;
  } catch {
    return DEFAULTS.fontHeading;
  }
}

/**
 * Get footer copyright text
 */
export function getFooterCopyright(): string {
  try {
    return brand?.footer?.copyright || `© ${new Date().getFullYear()} ${getBrandName()}. All rights reserved.`;
  } catch {
    return `© ${new Date().getFullYear()} ${DEFAULTS.name}. All rights reserved.`;
  }
}

/**
 * Get footer links
 */
export function getFooterLinks() {
  try {
    return brand?.footer?.links || {
      shop: [],
      support: [],
    };
  } catch {
    return {
      shop: [],
      support: [],
    };
  }
}

/**
 * Get feature stats
 */
export function getFeatureStats() {
  try {
    return brand?.stats || {
      customers: '10K+',
      products: '500+',
      countries: '50+',
      support: '24/7',
    };
  } catch {
    return {
      customers: '10K+',
      products: '500+',
      countries: '50+',
      support: '24/7',
    };
  }
}

/**
 * Get feature highlights
 */
export function getFeatureHighlights() {
  try {
    return brand?.features || [];
  } catch {
    return [];
  }
}

/**
 * Get full brand configuration (safe)
 */
export function getBrandConfig() {
  try {
    return {
      name: getBrandName(),
      slogan: getBrandSlogan(),
      logoUrl: getLogoUrl(),
      faviconUrl: getFaviconUrl(),
      appleIconUrl: getAppleIconUrl(),
      ogImage: getOgImageUrl(),
      colors: getBrandColors(),
      contactEmail: getContactEmail(),
      adminEmails: getAdminEmails(),
      seo: {
        title: getSeoTitle(),
        description: getSeoDescription(),
        keywords: brand?.seo?.keywords || '',
      },
      hero: {
        title: getHeroTitle(),
        subtitle: getHeroSubtitle(),
        ctaText: getHeroCtaText(),
        badge: getHeroBadge(),
      },
      social: getSocialLinks(),
      fonts: {
        primary: getPrimaryFont(),
        heading: getHeadingFont(),
      },
      footer: {
        copyright: getFooterCopyright(),
        links: getFooterLinks(),
      },
      stats: getFeatureStats(),
      features: getFeatureHighlights(),
    };
  } catch {
    // Ultimate fallback - return all defaults
    return {
      name: DEFAULTS.name,
      slogan: DEFAULTS.slogan,
      logoUrl: DEFAULTS.logoUrl,
      faviconUrl: DEFAULTS.faviconUrl,
      appleIconUrl: DEFAULTS.appleIconUrl,
      ogImage: DEFAULTS.ogImage,
      colors: {
        primary: DEFAULTS.primaryColor,
        accent: DEFAULTS.accentColor,
        secondary: DEFAULTS.accentColor,
        background: DEFAULTS.primaryColor,
        text: DEFAULTS.primaryColor,
      },
      contactEmail: DEFAULTS.contactEmail,
      adminEmails: DEFAULTS.adminEmails,
      seo: {
        title: DEFAULTS.seoTitle,
        description: DEFAULTS.seoDescription,
        keywords: '',
      },
      hero: {
        title: DEFAULTS.heroTitle,
        subtitle: DEFAULTS.heroSubtitle,
        ctaText: DEFAULTS.heroCtaText,
        badge: DEFAULTS.heroBadge,
      },
      social: {
        instagram: '',
        facebook: '',
        twitter: '',
        linkedin: '',
      },
      fonts: {
        primary: DEFAULTS.fontPrimary,
        heading: DEFAULTS.fontHeading,
      },
      footer: {
        copyright: `© ${new Date().getFullYear()} ${DEFAULTS.name}. All rights reserved.`,
        links: {
          shop: [],
          support: [],
        },
      },
      stats: {
        customers: '10K+',
        products: '500+',
        countries: '50+',
        support: '24/7',
      },
      features: [],
    };
  }
}

