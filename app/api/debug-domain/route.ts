import { NextRequest, NextResponse } from 'next/server'
import { getDomainFromRequest } from '@/lib/brand/admin-loader'
import { getBrandByDomain, getActiveBrand } from '@/lib/brand/storage'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get domain from request
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host')
    const domain = host ? host.split(':')[0] : undefined
    
    // Also try from headers() for server components
    const headersList = await headers()
    const domainFromHeaders = getDomainFromRequest(headersList)
    
    // Try to get brand by domain
    let brandByDomain = null
    if (domain) {
      brandByDomain = await getBrandByDomain(domain)
    }
    
    // Get active brand (fallback)
    const activeBrand = await getActiveBrand()
    
    return NextResponse.json({
      success: true,
      debug: {
        host,
        domain,
        domainFromHeaders,
        brandByDomain: brandByDomain ? {
          id: brandByDomain.id,
          slug: brandByDomain.slug,
          name: brandByDomain.name,
          domain: brandByDomain.domain,
          is_active: brandByDomain.is_active,
        } : null,
        activeBrand: activeBrand ? {
          id: activeBrand.id,
          slug: activeBrand.slug,
          name: activeBrand.name,
          domain: activeBrand.domain,
          is_active: activeBrand.is_active,
        } : null,
        env: {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}

