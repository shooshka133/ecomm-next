/**
 * Admin Brand Loader
 * 
 * Loads the active brand at runtime for use in the application.
 * This is a safe wrapper that falls back to brand.config.ts if no active brand is found.
 * 
 * Usage in app/layout.tsx or other server components:
 * import { getActiveBrandConfig } from '@/lib/brand/admin-loader'
 * const activeBrand = await getActiveBrandConfig()
 */

import { getActiveBrand } from './storage'
import { brand } from '@/brand.config'

/**
 * Get domain from request headers
 */
export function getDomainFromRequest(headers: Headers): string | undefined {
  // Try host header first (most reliable)
  const host = headers.get('host') || headers.get('x-forwarded-host')
  if (host) {
    // Remove port if present
    return host.split(':')[0]
  }
  
  // Fallback to referer if available
  const referer = headers.get('referer')
  if (referer) {
    try {
      const url = new URL(referer)
      return url.hostname
    } catch {
      // Invalid URL, ignore
    }
  }
  
  return undefined
}

/**
 * Get active brand configuration
 * Falls back to brand.config.ts if no active brand found
 * @param domain Optional domain to match brand by domain first
 */
export async function getActiveBrandConfig(domain?: string) {
  try {
    const activeBrand = await getActiveBrand(domain)
    if (activeBrand && activeBrand.config) {
      return activeBrand.config
    }
  } catch (error) {
    console.error('Error loading active brand:', error)
  }

  // Fallback to default brand.config.ts
  return brand
}

/**
 * Get active brand with metadata (id, slug, etc.)
 * @param domain Optional domain to match brand by domain first
 */
export async function getActiveBrandWithMetadata(domain?: string) {
  try {
    const activeBrand = await getActiveBrand(domain)
    if (activeBrand) {
      return activeBrand
    }
  } catch (error) {
    console.error('Error loading active brand:', error)
  }

  // Fallback to default
  return {
    slug: 'default',
    name: brand.name,
    is_active: true,
    config: brand,
    asset_urls: {},
  }
}

