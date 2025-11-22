import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendOrderConfirmationEmail } from '@/lib/email/send'

// Use service role key for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { orderId, userId } = await request.json()

    if (!orderId || !userId) {
      return NextResponse.json(
        { error: 'Missing orderId or userId' },
        { status: 400 }
      )
    }

    console.log('📧 [API] Send email request received for order:', orderId)
    console.log('🔍 [API] Checking environment variables...')
    console.log('🔍 [API] RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('🔍 [API] RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL)

    // Get order details (query by ID only since it's unique)
    console.log('🔍 [API] Querying for order ID:', orderId)
    const { data: order, error: orderFetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle()

    if (orderFetchError) {
      console.error('❌ [API] Error fetching order:', orderFetchError)
      console.error('❌ [API] Full error:', JSON.stringify(orderFetchError))
    }

    if (!order) {
      console.error('❌ [API] Order not found for ID:', orderId)
      
      // Debug: Check what orders exist
      const { data: recentOrders } = await supabaseAdmin
        .from('orders')
        .select('id, user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(3)
      console.log('🔍 [API] Recent orders in DB:', JSON.stringify(recentOrders))
      
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    console.log('✅ [API] Order found:', order.id)
    console.log('✅ [API] Order belongs to user:', order.user_id)
    
    // Verify order belongs to the requesting user
    if (order.user_id !== userId) {
      console.error('❌ [API] Unauthorized: Order belongs to different user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get order items with product details
    console.log('🔍 [API] Fetching order items...')
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', orderId)

    if (itemsError) {
      console.error('❌ [API] Error fetching order items:', itemsError)
    }

    if (!orderItems || orderItems.length === 0) {
      console.error('❌ [API] No order items found for order:', orderId)
      return NextResponse.json(
        { error: 'No order items found' },
        { status: 404 }
      )
    }

    console.log('✅ [API] Found', orderItems.length, 'order items')

    // Get user details
    console.log('🔍 [API] Fetching user details...')
    const { data: userData } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (authError) {
      console.error('❌ [API] Error fetching auth user:', authError)
    }

    const customerEmail = authUser.user?.email || 'customer@example.com'
    const customerName = userData?.full_name || authUser.user?.email?.split('@')[0] || 'Customer'

    console.log('✅ [API] Customer:', customerName)
    console.log('📧 [API] Email will be sent to:', customerEmail)

    // Prepare email data
    console.log('🔍 [API] Preparing email data...')
    const emailOrderItems = orderItems.map((item: any) => ({
      name: item.products?.name || 'Product',
      price: item.price,
      quantity: item.quantity,
      image_url: item.products?.image_url,
    }))

    console.log('📧 [API] Calling sendOrderConfirmationEmail...')
    
    // Send email
    const result = await sendOrderConfirmationEmail({
      orderNumber: order.id.substring(0, 8).toUpperCase(),
      customerName,
      customerEmail,
      orderItems: emailOrderItems,
      total: order.total,
      orderDate: new Date(order.created_at || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      trackingNumber: order.tracking_number,
    })

    console.log('📧 [API] Email function returned:', JSON.stringify(result))

    if (result.success) {
      console.log('✅ [API] Email sent successfully! Email ID:', result.emailId)
      return NextResponse.json({ success: true, emailId: result.emailId })
    } else {
      console.error('❌ [API] Email failed:', result.error)
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('❌ [API] Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

