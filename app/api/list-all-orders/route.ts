import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { isAdmin } from '@/lib/admin/check'

// Use service role key for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * List all orders with user email addresses
 * GET /api/list-all-orders?email=user@example.com (optional filter)
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const supabase = createServerComponentClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const emailFilter = searchParams.get('email')

    console.log('📦 [List All Orders] Fetching orders...')
    if (emailFilter) {
      console.log('📦 [List All Orders] Filtering by email:', emailFilter)
    }

    // Get all orders
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, total, status, tracking_number, shipped_at, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('❌ [List All Orders] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ 
        message: 'No orders found',
        orders: [] 
      })
    }

    // Enrich with user emails
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        try {
          // Get user email from auth
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(order.user_id)
          
          return {
            orderId: order.id,
            orderNumber: order.id.substring(0, 8).toUpperCase(),
            userEmail: authUser?.user?.email || 'Unknown',
            total: order.total,
            status: order.status,
            trackingNumber: order.tracking_number,
            shippedAt: order.shipped_at,
            createdAt: order.created_at,
          }
        } catch (err) {
          console.error('Error fetching user for order:', order.id, err)
          return {
            orderId: order.id,
            orderNumber: order.id.substring(0, 8).toUpperCase(),
            userEmail: 'Error fetching email',
            total: order.total,
            status: order.status,
            trackingNumber: order.tracking_number,
            shippedAt: order.shipped_at,
            createdAt: order.created_at,
          }
        }
      })
    )

    // Filter by email if provided
    const filteredOrders = emailFilter
      ? enrichedOrders.filter(order => order.userEmail.toLowerCase() === emailFilter.toLowerCase())
      : enrichedOrders

    console.log(`✅ [List All Orders] Found ${filteredOrders.length} orders`)

    return NextResponse.json({
      message: `Found ${filteredOrders.length} orders`,
      total: filteredOrders.length,
      orders: filteredOrders,
    })
  } catch (error: any) {
    console.error('❌ [List All Orders] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

