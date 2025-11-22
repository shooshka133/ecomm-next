import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
        console.log(`📧 [Bulk Shipping Email] Sending for order: ${order.id}`)
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-shipping-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id }),
        })

        const result = await response.json()

        if (response.ok) {
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

