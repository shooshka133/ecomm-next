import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getStripeClient } from '@/lib/services/router'

// Logging helper
const logError = (message: string, error?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, error || '')
  }
  // In production, send to error tracking service
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items, address_id } = body

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Validate each item
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.price) {
        return NextResponse.json(
          { error: 'Invalid item data' },
          { status: 400 }
        )
      }
      if (item.quantity < 1 || item.price < 0) {
        return NextResponse.json(
          { error: 'Invalid quantity or price' },
          { status: 400 }
        )
      }
    }

    // Get address if provided and validate ownership
    let shippingAddress = null
    if (address_id) {
      const { data: address, error: addressError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('id', address_id)
        .eq('user_id', user.id)
        .single()
      
      if (addressError || !address) {
        return NextResponse.json(
          { error: 'Invalid address' },
          { status: 400 }
        )
      }
      
      shippingAddress = address
    }

    // Calculate total
    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )

    // Validate total
    if (total <= 0) {
      return NextResponse.json(
        { error: 'Invalid total amount' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session (using service router for multi-brand)
    const stripe = await getStripeClient()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Product ${item.product_id}`,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/cancel`,
      metadata: {
        user_id: user.id,
        address_id: address_id || '',
      },
      shipping_address_collection: shippingAddress ? undefined : {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    logError('Checkout error', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
