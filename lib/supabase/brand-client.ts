/**
 * Brand-Aware Supabase Client
 * 
 * Creates Supabase clients based on the active brand.
 * Each brand can have its own Supabase project (URL + anon key).
 * 
 * Priority:
 * 1. Brand config from DB (brand.config.supabase.*)
 * 2. Environment variables based on brand slug (NEXT_PUBLIC_SUPABASE_URL_${SLUG})
 * 3. Fallback to main Supabase (NEXT_PUBLIC_SUPABASE_URL)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Get Supabase URL and anon key for a brand
 * 
 * Priority:
 * 1. brandConfig.supabase.url and brandConfig.supabase.anonKey (from DB)
 * 2. NEXT_PUBLIC_SUPABASE_URL_${envPrefix} and NEXT_PUBLIC_SUPABASE_ANON_KEY_${envPrefix}
 * 3. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (main/fallback)
 */
export function getSupabaseConfigForBrand(
  brandSlug?: string | null,
  brandConfig?: any
): { url: string; anonKey: string } {
  // Priority 1: Brand config from DB
  if (brandConfig?.supabase?.url && brandConfig?.supabase?.anonKey) {
    return {
      url: brandConfig.supabase.url,
      anonKey: brandConfig.supabase.anonKey,
    }
  }

  // Priority 2: Environment variables based on brand slug
  if (brandSlug) {
    // Normalize slug to env prefix (e.g., "grocery-store" -> "GROCERY_STORE")
    const envPrefix = brandSlug
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')

    if (envPrefix) {
      const envUrl = process.env[`NEXT_PUBLIC_SUPABASE_URL_${envPrefix}`]
      const envKey = process.env[`NEXT_PUBLIC_SUPABASE_ANON_KEY_${envPrefix}`]

      if (envUrl && envKey) {
        return {
          url: envUrl,
          anonKey: envKey,
        }
      }
    }
  }

  // Priority 3: Fallback to main Supabase
  const mainUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const mainKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!mainUrl || !mainKey) {
    throw new Error(
      'Supabase configuration not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  return {
    url: mainUrl,
    anonKey: mainKey,
  }
}

/**
 * Create Supabase client for server components
 * 
 * @param brandSlug - Brand slug (e.g., "grocery-store")
 * @param brandConfig - Brand configuration object (optional, will be fetched if not provided)
 * @returns Supabase client configured for the brand
 */
export async function createSupabaseServerClient(
  brandSlug?: string | null,
  brandConfig?: any
): Promise<SupabaseClient> {
  const config = getSupabaseConfigForBrand(brandSlug, brandConfig)

  // For server components, we need to use createServerComponentClient
  // But it doesn't support custom URLs, so we use createClient directly
  // and handle cookies manually if needed for auth
  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false, // Server components don't persist sessions
      autoRefreshToken: false,
    },
  })
}

/**
 * Create Supabase client for client components
 * 
 * @param brandSlug - Brand slug (e.g., "grocery-store")
 * @param brandConfig - Brand configuration object (optional, will be read from __BRAND_CONFIG__ if not provided)
 * @returns Supabase client configured for the brand
 */
export function createSupabaseClient(
  brandSlug?: string | null,
  brandConfig?: any
): SupabaseClient {
  // If no brand info provided, try to read from server-injected config
  if (!brandConfig && typeof window !== 'undefined') {
    try {
      const configScript = document.getElementById('__BRAND_CONFIG__')
      if (configScript && configScript.textContent) {
        brandConfig = JSON.parse(configScript.textContent)
        brandSlug = brandConfig?.slug || brandSlug
      }
    } catch (error) {
      // Silently fail, will use fallback
    }
  }

  const config = getSupabaseConfigForBrand(brandSlug, brandConfig)

  // For client components, we prefer createClientComponentClient for auth handling
  // But if we need a custom URL, we use createClient directly
  // Check if this is the main Supabase (same URL as default)
  const mainUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const mainKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (config.url === mainUrl && config.anonKey === mainKey) {
    // Use the Next.js helper for proper cookie handling
    return createClientComponentClient() as unknown as SupabaseClient
  }

  // Custom Supabase project - use createClient directly
  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

/**
 * Get brand slug from request headers (for server components)
 */
export function getBrandSlugFromHeaders(headers: Headers): string | null {
  return headers.get('x-brand-slug') || null
}

/**
 * Get brand config from server-injected JSON (for client components)
 */
export function getBrandConfigFromDOM(): any | null {
  if (typeof window === 'undefined') return null

  try {
    const configScript = document.getElementById('__BRAND_CONFIG__')
    if (configScript && configScript.textContent) {
      return JSON.parse(configScript.textContent)
    }
  } catch (error) {
    // Silently fail
  }

  return null
}

/**
 * Hook for client components to get brand-aware Supabase client
 * 
 * Usage:
 * ```tsx
 * 'use client'
 * import { useBrandSupabaseClient } from '@/lib/supabase/brand-client'
 * 
 * export default function MyComponent() {
 *   const supabase = useBrandSupabaseClient()
 *   // Use supabase...
 * }
 * ```
 */
export function useBrandSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('useBrandSupabaseClient can only be used in client components')
  }

  const brandConfig = getBrandConfigFromDOM()
  const brandSlug = brandConfig?.slug || null

  return createSupabaseClient(brandSlug, brandConfig)
}

