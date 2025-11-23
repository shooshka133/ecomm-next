import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createOrderFromCart } from '@/lib/orders/create'
import { sendOrderConfirmationEmailIdempotent } from '@/lib/orders/email'
import { CartItemWithProduct } from '@/types'

// Use service role key for webhook to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
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
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const sessionId = session.id
    const eventId = event.id

    if (!userId) {
      console.error('[Webhook] No user_id in session metadata', { eventId, sessionId })
      return NextResponse.json({ error: 'No user_id' }, { status: 400 })
    }

    try {
      // Step 1: Check if this webhook event was already processed (idempotency)
      const { data: processedEvent } = await supabaseAdmin
        .from('processed_webhook_events')
        .select('id, order_id')
        .eq('stripe_event_id', eventId)
        .maybeSingle()

      if (processedEvent) {
        console.log('[Webhook] Event already processed', { eventId, orderId: processedEvent.order_id })
        return NextResponse.json({
          received: true,
          orderId: processedEvent.order_id,
          message: 'Event already processed',
        })
      }

      // Step 2: Get cart items with product details
      const { data: cartItems, error: cartError } = await supabaseAdmin
        .from('cart_items')
        .select('*, products(id, name, price, image_url)')
        .eq('user_id', userId)

      if (cartError) {
        console.error('[Webhook] Error fetching cart items:', cartError)
        throw new Error('Failed to fetch cart items')
      }

      if (!cartItems || cartItems.length === 0) {
        console.warn('[Webhook] No cart items found for user', { userId, sessionId })
        // Mark event as processed even if no cart items (to prevent retries)
        await supabaseAdmin.rpc('mark_webhook_event_processed', {
          p_stripe_event_id: eventId,
          p_event_type: event.type,
          p_order_id: null,
          p_metadata: { warning: 'No cart items found' },
        })
        return NextResponse.json({ received: true, warning: 'No cart items found' })
      }

      // Step 3: Create order using shared function (with transaction support)
      const orderResult = await createOrderFromCart({
        userId,
        sessionId,
        cartItems: cartItems as CartItemWithProduct[],
      })

      if (!orderResult.success || !orderResult.order) {
        console.error('[Webhook] Order creation failed:', orderResult.error)
        throw new Error(orderResult.error || 'Failed to create order')
      }

      // Step 4: Mark webhook event as processed
      await supabaseAdmin.rpc('mark_webhook_event_processed', {
        p_stripe_event_id: eventId,
        p_event_type: event.type,
        p_order_id: orderResult.order.id,
        p_metadata: { was_duplicate: orderResult.wasDuplicate },
      })

      // Step 5: Send order confirmation email (idempotent, non-blocking)
      if (!orderResult.wasDuplicate) {
        // Only send email if order was newly created
        sendOrderConfirmationEmailIdempotent({
          orderId: orderResult.order.id,
          userId,
        }).catch((emailError) => {
          console.error('[Webhook] Email sending failed (non-blocking):', emailError)
        })
      }

      return NextResponse.json({
        received: true,
        orderId: orderResult.order.id,
        message: 'Order created successfully',
        wasDuplicate: orderResult.wasDuplicate,
      })
    } catch (error: any) {
      console.error('[Webhook] Error processing checkout.session.completed:', {
        error: error.message,
        eventId,
        sessionId,
        userId,
      })
      return NextResponse.json(
        { error: 'Failed to process checkout session' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true, message: 'Event type not handled' })
}
