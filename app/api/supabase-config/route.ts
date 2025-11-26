import { NextRequest, NextResponse } from 'next/server'
import { getDomainFromRequest } from '@/lib/brand/admin-loader'
import { getActiveBrand } from '@/lib/brand/storage'
import { headers } from 'next/headers'

/**
 * GET /api/supabase-config
 * Returns the Supabase URL and anon key for the current domain/brand
 * Used by client components to connect to the correct Supabase project
 */
export async function GET(request: NextRequest) {
  try {
    // Get domain from request
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host')
    const domain = host ? host.split(':')[0] : undefined
    
    // Also try from headers() for server components
    const headersList = await headers()
    const domainFromHeaders = getDomainFromRequest(headersList)
    
    // Use domain from request or headers
    const finalDomain = domain || domainFromHeaders
    
    // Get active brand to determine which Supabase project to use
    const activeBrand = await getActiveBrand(finalDomain)
    const brandSlug = activeBrand?.slug || 'default'
    const normalizedSlug = brandSlug.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-')
    
    console.log('[Supabase Config API]', {
      domain: finalDomain,
      brandSlug,
      normalizedSlug,
      brandName: activeBrand?.name,
      hasBrandAUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL_BRAND_A,
      hasBrandAKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A,
      hasMainUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    })
    
    // Route to correct Supabase project based on brand slug
    // Check for grocery-related slugs (case-insensitive, handles variations)
    const isGroceryBrand = normalizedSlug === 'grocery-store' || 
                          normalizedSlug === 'grocerystore' ||
                          normalizedSlug === 'grocery' ||
                          (brandSlug && brandSlug.toLowerCase().includes('grocery'))
    
    let url: string
    let key: string
    let source: string
    
    if (isGroceryBrand) {
      // Grocery brand uses BRAND_A Supabase project
      url = process.env.NEXT_PUBLIC_SUPABASE_URL_BRAND_A || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      source = process.env.NEXT_PUBLIC_SUPABASE_URL_BRAND_A ? 'BRAND_A' : 'MAIN (fallback)'
    } else {
      // Default to main Supabase project
      url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      source = 'MAIN'
    }
    
    if (!url || !key) {
      console.error('[Supabase Config API] Missing configuration:', {
        url: !!url,
        key: !!key,
        normalizedSlug,
      })
      return NextResponse.json({
        success: false,
        error: 'Supabase configuration missing',
        details: {
          normalizedSlug,
          hasUrl: !!url,
          hasKey: !!key,
        }
      }, { status: 500 })
    }
    
    console.log('[Supabase Config API] Returning config:', {
      domain: finalDomain,
      brandSlug: normalizedSlug,
      source,
      urlPrefix: url.substring(0, 30) + '...',
    })
    
    return NextResponse.json({
      success: true,
      domain: finalDomain,
      brandSlug: normalizedSlug,
      supabaseUrl: url,
      supabaseKey: key,
      source, // For debugging
    })
  } catch (error: any) {
    console.error('Error getting Supabase config:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
    }, { status: 500 })
  }
}

