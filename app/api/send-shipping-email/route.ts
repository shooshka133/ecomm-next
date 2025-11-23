import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendShippingNotificationEmail } from '@/lib/email/send'

// Use service role key for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Send shipping notification email for an order
 * POST /api/send-shipping-email
 * Body: { orderId: "order-uuid" }
 * 
 * This can be called:
 * 1. Manually via API
 * 2. From a Supabase webhook/trigger (future enhancement)
 * 3. From an admin dashboard (future enhancement)
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 })
    }

    console.log('📦 [Shipping Email] Request received for order:', orderId)

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('❌ [Shipping Email] Order not found:', orderError)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if order is in shipped status
    if (order.status !== 'shipped') {
      console.error('❌ [Shipping Email] Order is not in shipped status:', order.status)
      return NextResponse.json({ 
        error: `Order status is ${order.status}, not shipped` 
      }, { status: 400 })
    }

    // Check if tracking number exists
    if (!order.tracking_number) {
      console.error('❌ [Shipping Email] Order has no tracking number')
      return NextResponse.json({ 
        error: 'Order has no tracking number' 
      }, { status: 400 })
    }

    console.log('✅ [Shipping Email] Order found:', order.id)
    console.log('✅ [Shipping Email] Tracking number:', order.tracking_number)

    // Get user details
    const { data: userData } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', order.user_id)
      .single()

    // Get user email
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(order.user_id)
    
    if (!authUser?.user?.email) {
      console.error('❌ [Shipping Email] User email not found')
      return NextResponse.json({ error: 'User email not found' }, { status: 404 })
    }

    const customerEmail = authUser.user.email
    const customerName = userData?.full_name || customerEmail

    console.log('📧 [Shipping Email] Sending to:', customerEmail)

    // Calculate estimated delivery (5 days from shipped date, or 5 days from now)
    const shippedDate = order.shipped_at ? new Date(order.shipped_at) : new Date()
    const estimatedDeliveryDate = order.estimated_delivery_date 
      ? new Date(order.estimated_delivery_date)
      : new Date(shippedDate.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days

    // Get order URL (fallback to production URL)
    // In production, always use production URL (even if localhost is detected)
    // In development, keep localhost for local testing
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://store.shooshka.online'
    const isProduction = process.env.NODE_ENV === 'production'
    const orderUrl = (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) && isProduction
      ? 'https://store.shooshka.online'
      : baseUrl

    // Send shipping notification
    const result = await sendShippingNotificationEmail({
      orderNumber: order.id.substring(0, 8).toUpperCase(),
      customerName,
      customerEmail,
      trackingNumber: order.tracking_number,
      estimatedDelivery: estimatedDeliveryDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      shippedDate: shippedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      orderUrl,
      orderId: order.id, // Pass orderId to link directly to this order
    })

    if (result.success) {
      console.log('✅ [Shipping Email] Email sent successfully! ID:', result.emailId)
      return NextResponse.json({
        success: true,
        message: 'Shipping notification sent',
        emailId: result.emailId,
      })
    } else {
      console.error('❌ [Shipping Email] Failed to send:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error: any) {
    console.error('❌ [Shipping Email] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

