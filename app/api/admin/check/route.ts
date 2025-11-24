import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { isAdmin } from '@/lib/admin/check'

/**
 * Check if current user is an admin
 * GET /api/admin/check
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 })
    }

    const adminStatus = await isAdmin(user.id)

    return NextResponse.json({ isAdmin: adminStatus })
  } catch (error: any) {
    console.error('Error checking admin status:', error)
    return NextResponse.json({ isAdmin: false }, { status: 500 })
  }
}

