import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

// Use service role key for webhook to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Logging helper (replace with proper logging service in production)
const log = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data || '')
  }
  // In production, send to logging service (e.g., Sentry, LogRocket)
}

const logError = (message: string, error?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, error || '')
  }
  // In production, send to error tracking service
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

    if (!userId) {
      logError('Webhook: No user_id in session metadata', { sessionId })
      return NextResponse.json({ error: 'No user_id' }, { status: 400 })
    }

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

    return NextResponse.json({ 
      received: true, 
      orderId: order.id,
      message: 'Order created successfully'
    })
  }

  return NextResponse.json({ received: true })
}
