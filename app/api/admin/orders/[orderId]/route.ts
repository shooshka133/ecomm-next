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
 * Update order status
 * PATCH /api/admin/orders/[orderId]
 * Body: { status: 'processing' | 'shipped' | 'delivered' | 'cancelled', tracking_number?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
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

    const { orderId } = params
    const body = await request.json()
    const { status, tracking_number } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    // Set timestamps based on status
    if (status === 'shipped') {
      updateData.shipped_at = new Date().toISOString()
      if (tracking_number) {
        updateData.tracking_number = tracking_number
      }
    }

    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
    }

    // Update the order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      order,
      message: `Order status updated to ${status}`,
    })
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Get order details with items
 * GET /api/admin/orders/[orderId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
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

    const { orderId } = params

    // Get order with items and products
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('id', orderId)
      .single()

    if (orderError) {
      console.error('Error fetching order:', orderError)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Get user email
    let userEmail = 'Unknown'
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(order.user_id)
      userEmail = authUser?.user?.email || 'Unknown'
    } catch (err) {
      console.error('Error fetching user email:', err)
    }

    return NextResponse.json({
      order: {
        ...order,
        userEmail,
      },
    })
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

