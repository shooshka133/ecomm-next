/**
 * Brand Storage Utilities
 * 
 * Handles storage of brand configurations with dual backend:
 * 1. Database (Supabase) if BRAND_USE_DB=true
 * 2. File-based (JSON files) as fallback
 * 
 * Always falls back to existing brand.config.ts if no brands found.
 */

import { createClient } from '@supabase/supabase-js'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { brand } from '@/brand.config'

const USE_DB = process.env.BRAND_USE_DB === 'true'
const BRANDS_DIR = path.join(process.cwd(), 'data', 'brands')

// Supabase client (service role for admin operations)
const getSupabaseAdmin = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export interface BrandData {
  id?: string
  slug: string
  name: string
  is_active: boolean
  config: typeof brand
  asset_urls?: {
    logo?: string
    favicon?: string
    appleIcon?: string
    ogImage?: string
  }
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
}

/**
 * Ensure brands directory exists
 */
async function ensureBrandsDir() {
  if (!existsSync(BRANDS_DIR)) {
    await mkdir(BRANDS_DIR, { recursive: true })
  }
}

/**
 * Get all brands (from DB or files)
 */
export async function getAllBrands(): Promise<BrandData[]> {
  if (USE_DB) {
    const supabase = getSupabaseAdmin()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (!error && data) {
          return data.map(b => ({
            id: b.id,
            slug: b.slug,
            name: b.name,
            is_active: b.is_active,
            config: b.config,
            asset_urls: b.asset_urls || {},
            created_at: b.created_at,
            updated_at: b.updated_at,
            created_by: b.created_by,
            updated_by: b.updated_by,
          }))
        }
      } catch (error) {
        console.error('Error fetching brands from DB:', error)
      }
    }
  }

  // Fallback to file-based
  try {
    await ensureBrandsDir()
    const brandsFile = path.join(BRANDS_DIR, 'brands.json')
    
    if (existsSync(brandsFile)) {
      const content = await readFile(brandsFile, 'utf-8')
      const brands = JSON.parse(content)
      return Array.isArray(brands) ? brands : []
    }
  } catch (error) {
    console.error('Error reading brands from files:', error)
  }

  // Ultimate fallback: return default brand from brand.config.ts
  return [{
    slug: 'default',
    name: brand.name,
    is_active: true,
    config: brand,
    asset_urls: {},
  }]
}

/**
 * Get active brand
 */
export async function getActiveBrand(): Promise<BrandData | null> {
  if (USE_DB) {
    const supabase = getSupabaseAdmin()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .eq('is_active', true)
          .single()
        
        if (!error && data) {
          return {
            id: data.id,
            slug: data.slug,
            name: data.name,
            is_active: data.is_active,
            config: data.config,
            asset_urls: data.asset_urls || {},
            created_at: data.created_at,
            updated_at: data.updated_at,
            created_by: data.created_by,
            updated_by: data.updated_by,
          }
        }
      } catch (error) {
        console.error('Error fetching active brand from DB:', error)
      }
    }
  }

  // Fallback to file-based
  try {
    const brands = await getAllBrands()
    const active = brands.find(b => b.is_active)
    if (active) return active
  } catch (error) {
    console.error('Error finding active brand:', error)
  }

  // Ultimate fallback: return default brand
  return {
    slug: 'default',
    name: brand.name,
    is_active: true,
    config: brand,
    asset_urls: {},
  }
}

/**
 * Get brand by ID or slug
 */
export async function getBrandById(idOrSlug: string): Promise<BrandData | null> {
  if (USE_DB) {
    const supabase = getSupabaseAdmin()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
          .single()
        
        if (!error && data) {
          return {
            id: data.id,
            slug: data.slug,
            name: data.name,
            is_active: data.is_active,
            config: data.config,
            asset_urls: data.asset_urls || {},
            created_at: data.created_at,
            updated_at: data.updated_at,
            created_by: data.created_by,
            updated_by: data.updated_by,
          }
        }
      } catch (error) {
        console.error('Error fetching brand from DB:', error)
      }
    }
  }

  // Fallback to file-based
  try {
    const brands = await getAllBrands()
    const brand = brands.find(b => b.id === idOrSlug || b.slug === idOrSlug)
    if (brand) return brand
  } catch (error) {
    console.error('Error finding brand:', error)
  }

  return null
}

/**
 * Create or update brand
 */
export async function saveBrand(brandData: BrandData, userId?: string): Promise<BrandData> {
  if (USE_DB) {
    const supabase = getSupabaseAdmin()
    if (supabase) {
      try {
        if (brandData.id) {
          // Update existing
          const { data, error } = await supabase
            .from('brands')
            .update({
              slug: brandData.slug,
              name: brandData.name,
              is_active: brandData.is_active,
              config: brandData.config,
              asset_urls: brandData.asset_urls || {},
              updated_by: userId,
            })
            .eq('id', brandData.id)
            .select()
            .single()
          
          if (!error && data) {
            return {
              id: data.id,
              slug: data.slug,
              name: data.name,
              is_active: data.is_active,
              config: data.config,
              asset_urls: data.asset_urls || {},
              created_at: data.created_at,
              updated_at: data.updated_at,
              created_by: data.created_by,
              updated_by: data.updated_by,
            }
          }
        } else {
          // Create new
          const { data, error } = await supabase
            .from('brands')
            .insert({
              slug: brandData.slug,
              name: brandData.name,
              is_active: brandData.is_active,
              config: brandData.config,
              asset_urls: brandData.asset_urls || {},
              created_by: userId,
              updated_by: userId,
            })
            .select()
            .single()
          
          if (!error && data) {
            return {
              id: data.id,
              slug: data.slug,
              name: data.name,
              is_active: data.is_active,
              config: data.config,
              asset_urls: data.asset_urls || {},
              created_at: data.created_at,
              updated_at: data.updated_at,
              created_by: data.created_by,
              updated_by: data.updated_by,
            }
          }
        }
      } catch (error) {
        console.error('Error saving brand to DB:', error)
        throw error
      }
    }
  }

  // Fallback to file-based
  try {
    await ensureBrandsDir()
    const brands = await getAllBrands()
    
    if (brandData.id) {
      // Update existing
      const index = brands.findIndex(b => b.id === brandData.id)
      if (index >= 0) {
        brands[index] = { ...brandData, updated_at: new Date().toISOString() }
      } else {
        brands.push(brandData)
      }
    } else {
      // Create new
      brandData.id = `brand-${Date.now()}`
      brandData.created_at = new Date().toISOString()
      brandData.updated_at = new Date().toISOString()
      brands.push(brandData)
    }

    const brandsFile = path.join(BRANDS_DIR, 'brands.json')
    await writeFile(brandsFile, JSON.stringify(brands, null, 2), 'utf-8')
    
    return brandData
  } catch (error) {
    console.error('Error saving brand to file:', error)
    throw error
  }
}

/**
 * Delete brand
 */
export async function deleteBrand(idOrSlug: string): Promise<boolean> {
  if (USE_DB) {
    const supabase = getSupabaseAdmin()
    if (supabase) {
      try {
        const { error } = await supabase
          .from('brands')
          .delete()
          .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        
        return !error
      } catch (error) {
        console.error('Error deleting brand from DB:', error)
        return false
      }
    }
  }

  // Fallback to file-based
  try {
    const brands = await getAllBrands()
    const filtered = brands.filter(b => b.id !== idOrSlug && b.slug !== idOrSlug)
    
    const brandsFile = path.join(BRANDS_DIR, 'brands.json')
    await writeFile(brandsFile, JSON.stringify(filtered, null, 2), 'utf-8')
    
    return true
  } catch (error) {
    console.error('Error deleting brand from file:', error)
    return false
  }
}

/**
 * Activate a brand (deactivates all others)
 */
export async function activateBrand(idOrSlug: string, userId?: string): Promise<boolean> {
  if (USE_DB) {
    const supabase = getSupabaseAdmin()
    if (supabase) {
      try {
        // Deactivate all brands
        await supabase
          .from('brands')
          .update({ is_active: false })
          .neq('is_active', false)
        
        // Activate selected brand
        const { error } = await supabase
          .from('brands')
          .update({ 
            is_active: true,
            updated_by: userId,
          })
          .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        
        return !error
      } catch (error) {
        console.error('Error activating brand in DB:', error)
        return false
      }
    }
  }

  // Fallback to file-based
  try {
    const brands = await getAllBrands()
    brands.forEach(b => {
      b.is_active = (b.id === idOrSlug || b.slug === idOrSlug)
    })
    
    const brandsFile = path.join(BRANDS_DIR, 'brands.json')
    await writeFile(brandsFile, JSON.stringify(brands, null, 2), 'utf-8')
    
    return true
  } catch (error) {
    console.error('Error activating brand in file:', error)
    return false
  }
}

/**
 * Log brand action for audit
 */
export async function logBrandAction(
  action: string,
  brandId: string | null,
  userId: string | null,
  userEmail: string | null,
  changes?: any
): Promise<void> {
  // Non-blocking - if logging fails, don't break the operation
  try {
    if (USE_DB) {
      const supabase = getSupabaseAdmin()
      if (supabase) {
        await supabase.from('brand_audit').insert({
          brand_id: brandId,
          action,
          user_id: userId,
          user_email: userEmail,
          changes,
        })
        return
      }
    }

    // Fallback to file-based logging
    const logDir = path.join(process.cwd(), 'logs')
    if (!existsSync(logDir)) {
      await mkdir(logDir, { recursive: true })
    }
    
    const logFile = path.join(logDir, 'brand-changes.log')
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      brand_id: brandId,
      user_id: userId,
      user_email: userEmail,
      changes,
    }
    
    const existing = existsSync(logFile) 
      ? await readFile(logFile, 'utf-8').catch(() => '') 
      : ''
    const logs = existing ? existing.split('\n').filter(Boolean) : []
    logs.push(JSON.stringify(logEntry))
    
    await writeFile(logFile, logs.join('\n') + '\n', 'utf-8')
  } catch (error) {
    // Silently fail - logging is non-critical
    console.error('Error logging brand action:', error)
  }
}

