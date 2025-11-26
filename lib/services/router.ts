/**
 * Service Router
 * 
 * Routes to correct service instances based on active brand.
 * Supports multiple Supabase projects, Resend accounts, and Stripe accounts.
 * 
 * Usage:
 * - const supabase = await getSupabaseClient()
 * - const resend = await getResendClient()
 * - const stripe = await getStripeClient()
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import Stripe from 'stripe'
import { getActiveBrand } from '@/lib/brand/storage'

// Cache clients to avoid recreating
let supabaseClientCache: Map<string, SupabaseClient<any, "public", any>> = new Map()
let resendClientCache: Map<string, Resend> = new Map()
let stripeClientCache: Map<string, Stripe> = new Map()

/**
 * Get Supabase client for active brand
 */
export async function getSupabaseClient() {
  const activeBrand = await getActiveBrand()
  const brandSlug = activeBrand?.slug || 'default'
  
  // Check cache
  if (supabaseClientCache.has(brandSlug)) {
    return supabaseClientCache.get(brandSlug)!
  }
  
  // Route to correct Supabase project
  let url: string
  let key: string
  
  // Normalize brand slug for matching
  const normalizedSlug = brandSlug.toLowerCase().replace(/\s+/g, '-')
  
  if (normalizedSlug === 'green-theme-store' || normalizedSlug === 'greenthemestore') {
    url = process.env.NEXT_PUBLIC_SUPABASE_URL_BRAND_A || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  } else if (normalizedSlug === 'ecommerce-start' || normalizedSlug === 'ecommercestart') {
    url = process.env.NEXT_PUBLIC_SUPABASE_URL_BRAND_B || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_B || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  } else {
    // Default/fallback
    url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  }
  
  if (!url || !key) {
    throw new Error(`Supabase configuration missing for brand: ${brandSlug}`)
  }
  
  const client = createClient(url, key)
  supabaseClientCache.set(brandSlug, client)
  return client
}

/**
 * Get Supabase admin client (service role) for active brand
 */
export async function getSupabaseAdminClient() {
  const activeBrand = await getActiveBrand()
  const brandSlug = activeBrand?.slug || 'default'
  
  let url: string
  let key: string
  
  // Normalize brand slug for matching
  const normalizedSlug = brandSlug.toLowerCase().replace(/\s+/g, '-')
  
  if (normalizedSlug === 'green-theme-store' || normalizedSlug === 'greenthemestore') {
    url = process.env.NEXT_PUBLIC_SUPABASE_URL_BRAND_A || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    key = process.env.SUPABASE_SERVICE_ROLE_KEY_BRAND_A || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  } else if (normalizedSlug === 'ecommerce-start' || normalizedSlug === 'ecommercestart') {
    url = process.env.NEXT_PUBLIC_SUPABASE_URL_BRAND_B || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    key = process.env.SUPABASE_SERVICE_ROLE_KEY_BRAND_B || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  } else {
    url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  }
  
  if (!url || !key) {
    throw new Error(`Supabase admin configuration missing for brand: ${brandSlug}`)
  }
  
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Get Resend client for active brand
 */
export async function getResendClient() {
  const activeBrand = await getActiveBrand()
  const brandSlug = activeBrand?.slug || 'default'
  
  // Check cache
  if (resendClientCache.has(brandSlug)) {
    return resendClientCache.get(brandSlug)!
  }
  
  // Route to correct Resend account
  let apiKey: string
  
  // Normalize brand slug for matching
  const normalizedSlug = brandSlug.toLowerCase().replace(/\s+/g, '-')
  
  if (normalizedSlug === 'green-theme-store' || normalizedSlug === 'greenthemestore') {
    apiKey = process.env.RESEND_API_KEY_BRAND_A || process.env.RESEND_API_KEY || ''
  } else if (normalizedSlug === 'ecommerce-start' || normalizedSlug === 'ecommercestart') {
    apiKey = process.env.RESEND_API_KEY_BRAND_B || process.env.RESEND_API_KEY || ''
  } else {
    apiKey = process.env.RESEND_API_KEY || ''
  }
  
  if (!apiKey) {
    throw new Error(`Resend API key missing for brand: ${brandSlug}`)
  }
  
  const client = new Resend(apiKey)
  resendClientCache.set(brandSlug, client)
  return client
}

/**
 * Get Resend configuration (from email, from name) for active brand
 */
export async function getResendConfig() {
  const activeBrand = await getActiveBrand()
  const brandSlug = activeBrand?.slug || 'default'
  const brandName = activeBrand?.name || activeBrand?.config?.name || 'Store'
  
  let fromEmail: string
  let fromName: string
  
  // Normalize brand slug for matching
  const normalizedSlug = brandSlug.toLowerCase().replace(/\s+/g, '-')
  
  if (normalizedSlug === 'green-theme-store' || normalizedSlug === 'greenthemestore') {
    fromEmail = process.env.RESEND_FROM_EMAIL_BRAND_A || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    fromName = process.env.RESEND_FROM_NAME_BRAND_A || brandName
  } else if (normalizedSlug === 'ecommerce-start' || normalizedSlug === 'ecommercestart') {
    fromEmail = process.env.RESEND_FROM_EMAIL_BRAND_B || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    fromName = process.env.RESEND_FROM_NAME_BRAND_B || brandName
  } else {
    fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    fromName = brandName
  }
  
  return {
    fromEmail,
    fromName,
    from: `${fromName} <${fromEmail}>`
  }
}

/**
 * Get Stripe client for active brand
 */
export async function getStripeClient() {
  const activeBrand = await getActiveBrand()
  const brandSlug = activeBrand?.slug || 'default'
  
  // Check cache
  if (stripeClientCache.has(brandSlug)) {
    return stripeClientCache.get(brandSlug)!
  }
  
  // Route to correct Stripe account
  let secretKey: string
  
  // Normalize brand slug for matching
  const normalizedSlug = brandSlug.toLowerCase().replace(/\s+/g, '-')
  
  if (normalizedSlug === 'green-theme-store' || normalizedSlug === 'greenthemestore') {
    secretKey = process.env.STRIPE_SECRET_KEY_BRAND_A || process.env.STRIPE_SECRET_KEY || ''
  } else if (normalizedSlug === 'ecommerce-start' || normalizedSlug === 'ecommercestart') {
    secretKey = process.env.STRIPE_SECRET_KEY_BRAND_B || process.env.STRIPE_SECRET_KEY || ''
  } else {
    secretKey = process.env.STRIPE_SECRET_KEY || ''
  }
  
  if (!secretKey) {
    throw new Error(`Stripe secret key missing for brand: ${brandSlug}`)
  }
  
  const client = new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  })
  
  stripeClientCache.set(brandSlug, client)
  return client
}

/**
 * Get Stripe publishable key for active brand
 */
export async function getStripePublishableKey() {
  const activeBrand = await getActiveBrand()
  const brandSlug = activeBrand?.slug || 'default'
  
  // Normalize brand slug for matching
  const normalizedSlug = brandSlug.toLowerCase().replace(/\s+/g, '-')
  
  if (normalizedSlug === 'green-theme-store' || normalizedSlug === 'greenthemestore') {
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_A || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  } else if (normalizedSlug === 'ecommerce-start' || normalizedSlug === 'ecommercestart') {
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_BRAND_B || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  } else {
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  }
}

/**
 * Clear service caches (useful for testing or brand switching)
 */
export function clearServiceCaches() {
  supabaseClientCache.clear()
  resendClientCache.clear()
  stripeClientCache.clear()
}

