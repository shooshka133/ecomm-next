import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { isAdmin } from '@/lib/admin/check'
import { getBrandById, activateBrand } from '@/lib/brand/storage'
import { logBrandAction } from '@/lib/brand/storage'

/**
 * POST /api/admin/brands/[id]/activate
 * Activate a brand (deactivates all others)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin status
    const supabase = createServerComponentClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // Get brand
    const brand = await getBrandById(params.id)
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Activate brand
    const success = await activateBrand(params.id, user.id)

    if (!success) {
      return NextResponse.json({ error: 'Failed to activate brand' }, { status: 500 })
    }

    // Log action
    await logBrandAction('activate', brand.id || null, user.id, user.email || null, {
      brand_name: brand.name,
      brand_slug: brand.slug,
    })

    return NextResponse.json({ 
      success: true,
      message: 'Brand activated successfully. Site appearance will update immediately.',
    })
  } catch (error: any) {
    console.error('Error activating brand:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

