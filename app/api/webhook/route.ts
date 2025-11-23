import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createOrderFromCart, getCartItemsWithProducts } from '@/lib/orders/create'
import { sendOrderConfirmationEmailIdempotent } from '@/lib/orders/email'

// Use service role key for webhook to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Structured logging helper
interface LogContext {
  sessionId?: string
  userId?: string
  orderId?: string
  eventId?: string
  [key: string]: any
}

const log = (level: 'info' | 'warn' | 'error', message: string, context?: LogContext) => {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    message,
    ...context,
  }
  
  if (level === 'error') {
    console.error(`[Webhook] ${JSON.stringify(logEntry)}`)
  } else if (level === 'warn') {
    console.warn(`[Webhook] ${JSON.stringify(logEntry)}`)
  } else {
    console.log(`[Webhook] ${JSON.stringify(logEntry)}`)
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  const correlationId = crypto.randomUUID() // For request tracking

  log('info', 'Webhook received', { correlationId })

  if (!signature) {
    log('error', 'No signature provided', { correlationId })
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
    log('info', 'Webhook signature verified', { correlationId, eventId: event.id, eventType: event.type })
  } catch (err: any) {
    log('error', 'Signature verification failed', { correlationId, error: err.message })
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Check if event was already processed (idempotency)
  const { data: processedEvent } = await supabaseAdmin
    .from('processed_webhook_events')
    .select('id, order_id, processed_at')
    .eq('stripe_event_id', event.id)
    .maybeSingle()

  if (processedEvent) {
    log('info', 'Event already processed', {
      correlationId,
      eventId: event.id,
      orderId: processedEvent.order_id,
      processedAt: processedEvent.processed_at,
    })
    return NextResponse.json({
      received: true,
      message: 'Event already processed',
      orderId: processedEvent.order_id,
    })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const sessionId = session.id

    log('info', 'Processing checkout.session.completed', {
      correlationId,
      sessionId,
      userId,
      eventId: event.id,
    })

    if (!userId) {
      log('error', 'No user_id in session metadata', { correlationId, sessionId, eventId: event.id })
      return NextResponse.json({ error: 'No user_id' }, { status: 400 })
    }

    // Check email configuration
    if (!process.env.RESEND_API_KEY) {
      log('warn', 'RESEND_API_KEY not configured', { correlationId })
    }

    // Step 1: Get cart items with product details
    log('info', 'Fetching cart items', { correlationId, userId })
    const cartItems = await getCartItemsWithProducts(userId)

    if (!cartItems || cartItems.length === 0) {
      log('warn', 'No cart items found', { correlationId, userId })
      
      // Mark event as processed even if no cart items (prevents retries)
      await supabaseAdmin.rpc('mark_webhook_event_processed', {
        p_stripe_event_id: event.id,
        p_event_type: event.type,
        p_order_id: null,
        p_metadata: { reason: 'no_cart_items' },
      })

      return NextResponse.json({
        received: true,
        warning: 'No cart items found',
      })
    }

    log('info', 'Cart items fetched', {
      correlationId,
      userId,
      itemCount: cartItems.length,
    })

    // Step 2: Create order (idempotent - checks for existing order)
    log('info', 'Creating order', { correlationId, userId, sessionId })
    const orderResult = await createOrderFromCart({
      userId,
      sessionId,
      cartItems,
    })

    if (!orderResult.success) {
      log('error', 'Failed to create order', {
        correlationId,
        userId,
        sessionId,
        error: orderResult.error,
      })
      return NextResponse.json(
        { error: orderResult.error || 'Failed to create order' },
        { status: 500 }
      )
    }

    if (!orderResult.order) {
      log('error', 'Order creation returned no order', { correlationId, userId, sessionId })
      return NextResponse.json(
        { error: 'Order creation failed' },
        { status: 500 }
      )
    }

    const order = orderResult.order

    log('info', 'Order created', {
      correlationId,
      orderId: order.id,
      userId,
      sessionId,
      wasDuplicate: orderResult.wasDuplicate,
    })

    // Mark webhook event as processed
    await supabaseAdmin.rpc('mark_webhook_event_processed', {
      p_stripe_event_id: event.id,
      p_event_type: event.type,
      p_order_id: order.id,
      p_metadata: {
        sessionId,
        userId,
        wasDuplicate: orderResult.wasDuplicate,
      },
    })

    // Step 3: Send order confirmation email (idempotent)
    if (!orderResult.wasDuplicate) {
      // Only send email if order was just created (not a duplicate)
      log('info', 'Sending order confirmation email', {
        correlationId,
        orderId: order.id,
        userId,
      })

      const emailResult = await sendOrderConfirmationEmailIdempotent({
        orderId: order.id,
        userId,
      })

      if (emailResult.success) {
        log('info', 'Order confirmation email sent', {
          correlationId,
          orderId: order.id,
          emailId: emailResult.emailId,
          wasAlreadySent: emailResult.wasAlreadySent,
        })
      } else {
        log('error', 'Failed to send order confirmation email', {
          correlationId,
          orderId: order.id,
          error: emailResult.error,
        })
        // Don't fail webhook if email fails - order is created
      }
    } else {
      log('info', 'Skipping email - order was duplicate', {
        correlationId,
        orderId: order.id,
      })
    }

    return NextResponse.json({
      received: true,
      orderId: order.id,
      message: 'Order created successfully',
      wasDuplicate: orderResult.wasDuplicate,
    })
  }

  // Event type not handled
  log('info', 'Event type not handled', {
    correlationId,
    eventType: event.type,
    eventId: event.id,
  })

  return NextResponse.json({
    received: true,
    message: 'Event type not handled',
  })
}
