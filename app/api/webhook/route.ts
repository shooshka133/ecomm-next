import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { sendOrderConfirmationEmail } from '@/lib/email/send'

// Use service role key for webhook to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Logging helper - ALWAYS log in production for debugging
const log = (message: string, data?: any) => {
  console.log(`[Webhook] ${message}`, data || '')
}

const logError = (message: string, error?: any) => {
  console.error(`[Webhook ERROR] ${message}`, error || '')
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    logError('Webhook: No signature provided')
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    logError('Webhook signature verification failed', err.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const sessionId = session.id

    log('Checkout session completed', { sessionId, userId })

    if (!userId) {
      logError('No user_id in session metadata', { sessionId })
      return NextResponse.json({ error: 'No user_id' }, { status: 400 })
    }
    
    // Check email configuration
    log('Email configuration check:', {
      hasResendKey: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'NOT SET'
    })

    // Check if order already exists for this session to prevent duplicates
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('stripe_payment_intent_id', sessionId)
      .single()

    if (existingOrder) {
      log('Webhook: Order already exists', { sessionId, orderId: existingOrder.id })
      return NextResponse.json({ 
        received: true, 
        message: 'Order already exists',
        orderId: existingOrder.id
      })
    }

    // Get cart items using admin client to bypass RLS
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', userId)

    if (cartError) {
      logError('Webhook: Error fetching cart items', cartError)
      return NextResponse.json(
        { error: 'Failed to fetch cart items' },
        { status: 500 }
      )
    }

    if (!cartItems || cartItems.length === 0) {
      log('Webhook: No cart items found', { userId })
      return NextResponse.json({ received: true, warning: 'No cart items found' })
    }

    // Calculate total from cart items
    const total = cartItems.reduce(
      (sum: number, item: any) => sum + (item.products?.price || 0) * item.quantity,
      0
    )

    // Create order with session_id as payment_intent_id to track it
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        total,
        status: 'processing',
        stripe_payment_intent_id: sessionId,
      })
      .select()
      .single()

    if (orderError) {
      logError('Webhook: Error creating order', orderError)
      // Check if it's a duplicate error
      if (orderError.code === '23505') {
        log('Webhook: Duplicate order prevented by database constraint')
        return NextResponse.json({ 
          received: true, 
          message: 'Order already exists (duplicate prevented)'
        })
      }
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products?.price || 0,
    }))

    const { error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (orderItemsError) {
      logError('Webhook: Error creating order items', orderItemsError)
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      )
    }

    // Clear cart
    const { error: deleteError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      logError('Webhook: Error clearing cart', deleteError)
    }

    // Remove purchased items from wishlist
    const purchasedProductIds = cartItems.map((item: any) => item.product_id)
    if (purchasedProductIds.length > 0) {
      const { error: wishlistError } = await supabaseAdmin
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .in('product_id', purchasedProductIds)
      
      if (wishlistError) {
        logError('Webhook: Error removing from wishlist', wishlistError)
        // Don't fail the request if wishlist clearing fails
      } else {
        log('Webhook: Removed purchased items from wishlist', { count: purchasedProductIds.length })
      }
    }

    // Send order confirmation email
    let customerEmail = 'customer@example.com'
    let customerName = 'Customer'
    
    try {
      log('Preparing to send email...')
      
      // Get user email from Supabase auth (most reliable)
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
      
      if (authError) {
        logError('Failed to fetch user from auth', authError)
      }
      
      // Get user profile details
      const { data: userData } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()

      // Get user email - prioritize Supabase auth, then Stripe session
      customerEmail = authUser?.user?.email || session.customer_details?.email || session.metadata?.email || 'customer@example.com'
      customerName = userData?.full_name || session.customer_details?.name || authUser?.user?.email?.split('@')[0] || 'Customer'

      log('Email will be sent to:', { 
        email: customerEmail, 
        name: customerName,
        source: authUser?.user?.email ? 'Supabase Auth' : 'Stripe Session'
      })
      
      if (!customerEmail || customerEmail === 'customer@example.com') {
        logError('CRITICAL: No valid customer email found!', {
          userId,
          authUserEmail: authUser?.user?.email,
          stripeEmail: session.customer_details?.email,
          metadataEmail: session.metadata?.email
        })
        // Don't send email if we don't have a valid email
        return NextResponse.json({ 
          received: true, 
          orderId: order.id,
          message: 'Order created successfully but email not sent (no email address)'
        })
      }

      // Prepare order items for email
      const emailOrderItems = cartItems.map((item: any) => ({
        name: item.products?.name || 'Product',
        price: item.products?.price || 0,
        quantity: item.quantity,
        image_url: item.products?.image_url,
      }))

      log('Calling sendOrderConfirmationEmail...')
      log('Email data:', {
        orderNumber: order.id.substring(0, 8).toUpperCase(),
        customerEmail,
        customerName,
        itemCount: emailOrderItems.length,
        total
      })
      
      // Send the email (don't fail if email fails)
      const emailResult = await sendOrderConfirmationEmail({
        orderNumber: order.id.substring(0, 8).toUpperCase(),
        customerName,
        customerEmail,
        orderItems: emailOrderItems,
        total,
        orderDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        trackingNumber: undefined, // Will be set when shipped
      })

      log('Email function returned:', JSON.stringify(emailResult, null, 2))
      
      if (emailResult.success) {
        log('✅ Order confirmation email sent successfully!', { 
          email: customerEmail,
          emailId: emailResult.emailId 
        })
      } else {
        logError('❌ Email sending failed', {
          error: emailResult.error,
          customerEmail,
          orderId: order.id
        })
      }
    } catch (emailError: any) {
      logError('Failed to send confirmation email (exception)', {
        error: emailError,
        message: emailError?.message,
        stack: emailError?.stack,
        customerEmail: customerEmail || 'unknown'
      })
      // Don't fail the webhook if email fails - order is still created
    }

    return NextResponse.json({ 
      received: true, 
      orderId: order.id,
      message: 'Order created successfully'
    })
  }

  return NextResponse.json({ received: true })
}
