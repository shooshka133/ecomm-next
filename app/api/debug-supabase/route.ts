import { NextRequest, NextResponse } from 'next/server'
import { getDomainFromRequest } from '@/lib/brand/admin-loader'
import { getActiveBrand } from '@/lib/brand/storage'
import { headers } from 'next/headers'

/**
 * GET /api/debug-supabase
 * Debug endpoint to check Supabase configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Get domain from request
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host')
    const domain = host ? host.split(':')[0] : undefined
    
    const headersList = await headers()
    const domainFromHeaders = getDomainFromRequest(headersList)
    const finalDomain = domain || domainFromHeaders
    
    // Get active brand
    const activeBrand = await getActiveBrand(finalDomain)
    const brandSlug = activeBrand?.slug || 'default'
    const normalizedSlug = brandSlug.toLowerCase().replace(/\s+/g, '-')
    
    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SUPABASE_URL_BRAND_A: !!process.env.NEXT_PUBLIC_SUPABASE_URL_BRAND_A,
      NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A,
    }
    
    // Determine which Supabase project should be used
    let expectedUrl: string
    let expectedKey: string
    let source: string
    
    if (normalizedSlug === 'grocery-store' || normalizedSlug === 'grocerystore') {
      expectedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_BRAND_A || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      expectedKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BRAND_A || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      source = process.env.NEXT_PUBLIC_SUPABASE_URL_BRAND_A ? 'BRAND_A (grocery)' : 'MAIN (fallback - WRONG!)'
    } else {
      expectedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      expectedKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      source = 'MAIN'
    }
    
    return NextResponse.json({
      domain: finalDomain,
      brand: {
        id: activeBrand?.id,
        slug: brandSlug,
        normalizedSlug,
        name: activeBrand?.name,
      },
      environment: {
        ...envCheck,
        nodeEnv: process.env.NODE_ENV,
      },
      expectedConfig: {
        source,
        hasUrl: !!expectedUrl,
        hasKey: !!expectedKey,
        urlPrefix: expectedUrl ? expectedUrl.substring(0, 30) + '...' : 'MISSING',
      },
      issue: !process.env.NEXT_PUBLIC_SUPABASE_URL_BRAND_A && normalizedSlug === 'grocery-store' 
        ? 'BRAND_A environment variables are not set! Add them in Vercel.'
        : null,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Internal server error',
    }, { status: 500 })
  }
}

