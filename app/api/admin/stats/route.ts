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
 * Get admin statistics
 * GET /api/admin/stats
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

    // Get total orders count
    const { count: totalOrders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })

    if (ordersError) {
      console.error('Error fetching total orders:', ordersError)
    }

    // Get total revenue
    const { data: ordersData, error: revenueError } = await supabaseAdmin
      .from('orders')
      .select('total, status')

    if (revenueError) {
      console.error('Error fetching revenue:', revenueError)
    }

    const totalRevenue = ordersData?.reduce((sum, order) => {
      // Only count completed/delivered orders
      if (order.status === 'delivered' || order.status === 'shipped' || order.status === 'processing') {
        return sum + Number(order.total)
      }
      return sum
    }, 0) || 0

    // Get orders by status
    const statusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }

    ordersData?.forEach(order => {
      const status = order.status as keyof typeof statusCounts
      if (status in statusCounts) {
        statusCounts[status]++
      }
    })

    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentOrders, error: recentError } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    if (recentError) {
      console.error('Error fetching recent orders:', recentError)
    }

    // Get total products
    const { count: totalProducts, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (productsError) {
      console.error('Error fetching products:', productsError)
    }

    return NextResponse.json({
      totalOrders: totalOrders || 0,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      recentOrders: recentOrders || 0,
      totalProducts: totalProducts || 0,
      statusCounts,
    })
  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

