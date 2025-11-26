/**
 * Get Current Brand Helper
 * 
 * Client-side helper to get the current brand based on domain.
 * Used by client components to filter products by brand.
 */

'use client'

/**
 * Get current brand ID from API
 * Returns null if no brand found or error
 */
export async function getCurrentBrandId(): Promise<string | null> {
  try {
    const response = await fetch('/api/brand-config')
    const data = await response.json()
    
    if (data.success && data.brand) {
      // We need to get the brand ID, but the API doesn't return it
      // Let's create a separate endpoint or include it in the response
      return null // Will be fixed in next step
    }
    
    return null
  } catch (error) {
    console.error('Error fetching current brand:', error)
    return null
  }
}

/**
 * Get current domain
 */
export function getCurrentDomain(): string | null {
  if (typeof window === 'undefined') return null
  return window.location.hostname
}

