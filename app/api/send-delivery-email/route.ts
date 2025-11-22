import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendDeliveryNotificationEmail } from '@/lib/email/send'

// Use service role key for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Send delivery notification email for an order
 * POST /api/send-delivery-email
 * Body: { orderId: "order-uuid" }
 * 
 * This should be called after marking an order as "delivered" in Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 })
    }

    console.log('📦 [Delivery Email] Request received for order:', orderId)

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('❌ [Delivery Email] Order not found:', orderError)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if order is in delivered status
    if (order.status !== 'delivered') {
      console.error('❌ [Delivery Email] Order is not in delivered status:', order.status)
      return NextResponse.json({ 
        error: `Order status is ${order.status}, not delivered` 
      }, { status: 400 })
    }

    // Check if tracking number exists
    if (!order.tracking_number) {
      console.error('❌ [Delivery Email] Order has no tracking number')
      return NextResponse.json({ 
        error: 'Order has no tracking number' 
      }, { status: 400 })
    }

    console.log('✅ [Delivery Email] Order found:', order.id)
    console.log('✅ [Delivery Email] Tracking number:', order.tracking_number)

    // Get user details
    const { data: userData } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', order.user_id)
      .single()

    // Get user email
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(order.user_id)
    
    if (!authUser?.user?.email) {
      console.error('❌ [Delivery Email] User email not found')
      return NextResponse.json({ error: 'User email not found' }, { status: 404 })
    }

    const customerEmail = authUser.user.email
    const customerName = userData?.full_name || customerEmail

    console.log('📧 [Delivery Email] Sending to:', customerEmail)

    // Get delivered date
    const deliveredDate = order.delivered_at ? new Date(order.delivered_at) : new Date()

    // Prepare order items for email
    const emailOrderItems = order.order_items.map((item: any) => ({
      name: item.products?.name || 'Product',
      price: item.products?.price || 0,
      quantity: item.quantity,
      image_url: item.products?.image_url,
    }))

    // Send delivery notification
    const result = await sendDeliveryNotificationEmail({
      orderNumber: order.id.substring(0, 8).toUpperCase(),
      customerName,
      customerEmail,
      trackingNumber: order.tracking_number,
      deliveredDate: deliveredDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      orderItems: emailOrderItems,
      total: order.total,
    })

    if (result.success) {
      console.log('✅ [Delivery Email] Email sent successfully! ID:', result.emailId)
      return NextResponse.json({
        success: true,
        message: 'Delivery notification sent',
        emailId: result.emailId,
      })
    } else {
      console.error('❌ [Delivery Email] Failed to send:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error: any) {
    console.error('❌ [Delivery Email] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

