/**
 * Environment Configuration
 * 
 * This module provides a centralized way to access environment variables.
 * It supports template mode for easier configuration management.
 * 
 * NO BUSINESS LOGIC - Only environment variable access.
 */

/**
 * Get app URL from environment
 */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Check if template mode is enabled
 */
export function isTemplateMode(): boolean {
  return process.env.NEXT_PUBLIC_TEMPLATE_MODE === 'true';
}

/**
 * Get admin emails from environment
 */
export function getAdminEmails(): string[] {
  const emails = process.env.ADMIN_EMAILS || '';
  return emails
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
}

/**
 * Get store currency
 */
export function getStoreCurrency(): string {
  return process.env.STORE_CURRENCY || 'USD';
}

/**
 * Get store currency symbol
 */
export function getStoreCurrencySymbol(): string {
  return process.env.STORE_CURRENCY_SYMBOL || '$';
}

/**
 * Get shipping countries
 */
export function getShippingCountries(): string[] {
  const countries = process.env.STORE_SHIPPING_COUNTRIES || 'US,CA,GB,AU';
  return countries.split(',').map(c => c.trim());
}

/**
 * Get Resend from name
 */
export function getResendFromName(): string {
  return process.env.RESEND_FROM_NAME || 'Ecommerce Start';
}

