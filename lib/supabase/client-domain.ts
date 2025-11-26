/**
 * Domain-Based Supabase Client
 * 
 * Creates Supabase client based on current domain/brand.
 * Used by client components to connect to the correct Supabase project.
 */

'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Cache clients by domain to avoid recreating
const clientCache = new Map<string, SupabaseClient>()

/**
 * Get Supabase client for current domain
 * Fetches brand config from API to determine which Supabase project to use
 */
export async function createDomainSupabaseClient(): Promise<SupabaseClient> {
  // Get current domain
  const domain = typeof window !== 'undefined' ? window.location.hostname : null
  
  // Check cache
  if (domain && clientCache.has(domain)) {
    return clientCache.get(domain)!
  }
  
  try {
    // Fetch brand config to get brand slug
    const response = await fetch('/api/brand-config')
    const data = await response.json()
    
    if (data.success && data.brandSlug) {
      const brandSlug = data.brandSlug.toLowerCase().replace(/\s+/g, '-')
      
      // Route to correct Supabase project based on brand slug
      let url: string
      let key: string
      
      if (brandSlug === 'grocery-store' || brandSlug === 'grocerystore') {
        // Grocery brand uses BRAND_A Supabase project
        url = process.env.NEXT_PUBLIC_SUPABASE_URL_BRAND_A || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      } else {
        // Default to main Supabase project
        url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      }
      
      if (url && key) {
        const client = createClient(url, key)
        if (domain) {
          clientCache.set(domain, client)
        }
        return client
      }
    }
  } catch (error) {
    console.error('Error creating domain-based Supabase client:', error)
  }
  
  // Fallback to default client
  return createClientComponentClient()
}

/**
 * Get Supabase client (with domain-based routing)
 * This is a drop-in replacement for createSupabaseClient()
 */
export function createSupabaseClientWithDomain() {
  // For client components, we need to use the async version
  // But since hooks can't be async, we'll use a different approach
  // Return the default client for now, and update components to use the async version
  return createClientComponentClient()
}

