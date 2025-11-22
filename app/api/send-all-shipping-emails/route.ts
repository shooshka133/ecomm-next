import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendShippingNotificationEmail } from '@/lib/email/send'

// Use service role key for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Send shipping emails for all recently shipped orders
 * GET /api/send-all-shipping-emails
 * 
 * This finds all orders with status 'shipped' and sends shipping notification emails
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📦 [Bulk Shipping Email] Finding shipped orders...')

    // Get all shipped orders
    const { data: shippedOrders, error } = await supabaseAdmin
      .from('orders')
      .select('id, tracking_number, shipped_at, user_id')
      .eq('status', 'shipped')
      .order('shipped_at', { ascending: false })
      .limit(10) // Only process last 10 shipped orders

    if (error) {
      console.error('❌ [Bulk Shipping Email] Error fetching orders:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!shippedOrders || shippedOrders.length === 0) {
      console.log('ℹ️ [Bulk Shipping Email] No shipped orders found')
      return NextResponse.json({ 
        message: 'No shipped orders found',
        sent: 0 
      })
    }

    console.log(`📦 [Bulk Shipping Email] Found ${shippedOrders.length} shipped orders`)

    const results = []

    // Send email for each shipped order
    for (const order of shippedOrders) {
      try {
        console.log(`📧 [Bulk Shipping Email] Processing order: ${order.id}`)
        
        // Get full order details with items
        const { data: fullOrder, error: orderError } = await supabaseAdmin
          .from('orders')
          .select('*, order_items(*, products(*))')
          .eq('id', order.id)
          .single()

        if (orderError || !fullOrder) {
          console.error(`❌ [Bulk Shipping Email] Could not fetch order ${order.id}:`, orderError)
          results.push({
            orderId: order.id,
            success: false,
            error: 'Order not found',
          })
          continue
        }

        // Check if tracking number exists
        if (!fullOrder.tracking_number) {
          console.error(`❌ [Bulk Shipping Email] Order ${order.id} has no tracking number`)
          results.push({
            orderId: order.id,
            success: false,
            error: 'No tracking number',
          })
          continue
        }

        // Get user details
        const { data: userData } = await supabaseAdmin
          .from('profiles')
          .select('full_name')
          .eq('id', fullOrder.user_id)
          .single()

        // Get user email
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(fullOrder.user_id)
        
        if (!authUser?.user?.email) {
          console.error(`❌ [Bulk Shipping Email] User email not found for order ${order.id}`)
          results.push({
            orderId: order.id,
            success: false,
            error: 'User email not found',
          })
          continue
        }

        const customerEmail = authUser.user.email
        const customerName = userData?.full_name || customerEmail

        // Calculate dates
        const shippedDate = fullOrder.shipped_at ? new Date(fullOrder.shipped_at) : new Date()
        const estimatedDeliveryDate = fullOrder.estimated_delivery_date 
          ? new Date(fullOrder.estimated_delivery_date)
          : new Date(shippedDate.getTime() + 5 * 24 * 60 * 60 * 1000)

        console.log(`📧 [Bulk Shipping Email] Sending to ${customerEmail}`)

        // Send shipping notification
        const result = await sendShippingNotificationEmail({
          orderNumber: fullOrder.id.substring(0, 8).toUpperCase(),
          customerName,
          customerEmail,
          trackingNumber: fullOrder.tracking_number,
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
        })

        if (result.success) {
          console.log(`✅ [Bulk Shipping Email] Email sent for order: ${order.id}`)
          results.push({
            orderId: order.id,
            success: true,
            emailId: result.emailId,
          })
        } else {
          console.error(`❌ [Bulk Shipping Email] Failed for order ${order.id}:`, result.error)
          results.push({
            orderId: order.id,
            success: false,
            error: result.error,
          })
        }
      } catch (err: any) {
        console.error(`❌ [Bulk Shipping Email] Error for order ${order.id}:`, err)
        results.push({
          orderId: order.id,
          success: false,
          error: err.message,
        })
      }
    }

    const successCount = results.filter(r => r.success).length

    console.log(`✅ [Bulk Shipping Email] Completed. Sent ${successCount}/${results.length} emails`)

    return NextResponse.json({
      message: `Sent ${successCount} shipping notification emails`,
      total: results.length,
      sent: successCount,
      results,
    })
  } catch (error: any) {
    console.error('❌ [Bulk Shipping Email] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

