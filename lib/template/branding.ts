/**
 * Branding Configuration
 * 
 * This module reads branding configuration from JSON files.
 * It supports template mode for easy customization.
 * 
 * NO BUSINESS LOGIC - Only configuration reading.
 */

import brandingConfig from './branding.json';

export interface BrandingConfig {
  storeName: string;
  storeSlogan: string;
  logoUrl: string;
  faviconUrl: string;
  appleIconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  supportEmail: string;
  footerText: string;
  metaTitle: string;
  metaDescription: string;
}

/**
 * Get store branding configuration
 * 
 * In template mode, uses values from branding.json
 * Otherwise, returns default values (existing behavior)
 */
export function getStoreBranding(): BrandingConfig {
  const isTemplateMode = process.env.NEXT_PUBLIC_TEMPLATE_MODE === 'true';

  if (isTemplateMode) {
    // Template mode: use JSON config
    return {
      storeName: brandingConfig.storeName,
      storeSlogan: brandingConfig.storeSlogan,
      logoUrl: brandingConfig.logoUrl,
      faviconUrl: brandingConfig.faviconUrl,
      appleIconUrl: brandingConfig.appleIconUrl,
      primaryColor: brandingConfig.primaryColor,
      secondaryColor: brandingConfig.secondaryColor,
      supportEmail: brandingConfig.supportEmail,
      footerText: brandingConfig.footerText,
      metaTitle: brandingConfig.metaTitle,
      metaDescription: brandingConfig.metaDescription,
    };
  }

  // Default mode: return existing hardcoded values
  // This ensures no breaking changes when template mode is off
  return {
    storeName: 'Ecommerce Start',
    storeSlogan: 'Your trusted destination for quality products and exceptional service.',
    logoUrl: '/icon.svg',
    faviconUrl: '/icon.svg',
    appleIconUrl: '/apple-icon.svg',
    primaryColor: '#4F46E5',
    secondaryColor: '#7C3AED',
    supportEmail: 'support@example.com',
    footerText: '© 2024 Ecommerce Start. All rights reserved.',
    metaTitle: 'Ecommerce Start - Modern Shopping Experience',
    metaDescription: 'Discover amazing products at great prices',
  };
}

/**
 * Get store name
 */
export function getStoreName(): string {
  return getStoreBranding().storeName;
}

/**
 * Get store logo URL
 */
export function getLogoUrl(): string {
  return getStoreBranding().logoUrl;
}

/**
 * Get primary color
 */
export function getPrimaryColor(): string {
  return getStoreBranding().primaryColor;
}

/**
 * Get support email
 */
export function getSupportEmail(): string {
  return getStoreBranding().supportEmail;
}

