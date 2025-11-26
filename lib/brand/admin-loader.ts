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
 * Get active brand configuration
 * Falls back to brand.config.ts if no active brand found
 */
export async function getActiveBrandConfig() {
  try {
    const activeBrand = await getActiveBrand()
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
 */
export async function getActiveBrandWithMetadata() {
  try {
    const activeBrand = await getActiveBrand()
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

