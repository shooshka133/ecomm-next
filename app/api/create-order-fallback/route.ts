import { NextRequest, NextResponse } from 'next/server'
import { createOrderFromCart } from '@/lib/orders/create'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId, cartItems, total } = await request.json()

    if (!userId || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or sessionId' },
        { status: 400 }
      )
    }

    // First, check if order already exists (double-check idempotency)
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, total, status, created_at')
      .eq('stripe_payment_intent_id', sessionId)
      .maybeSingle()

    if (existingOrder) {
      console.log('[create-order-fallback] Order already exists:', existingOrder.id)
      return NextResponse.json({
        success: true,
        order: existingOrder,
        wasDuplicate: true,
      })
    }

    // If cart is empty, try to get order data from Stripe session
    let itemsToProcess = cartItems || []
    
    if (!itemsToProcess || itemsToProcess.length === 0) {
      console.log('[create-order-fallback] Cart is empty, fetching from Stripe session...')
      
      try {
        // Fetch Stripe checkout session to get line items
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['line_items', 'line_items.data.price.product'],
        })

        if (session.payment_status === 'paid' && session.line_items?.data) {
          // Map Stripe line items to our format
          const lineItems = session.line_items.data
          
          // First, try to get product IDs from session metadata
          const productIdsFromMetadata = session.metadata?.product_ids?.split(',') || []
          
          // Extract product IDs from line items (from product metadata or session metadata)
          const productIds: string[] = []
          lineItems.forEach((lineItem: any, index: number) => {
            const productId = 
              lineItem.price?.product?.metadata?.product_id || 
              productIdsFromMetadata[index] ||
              null
            if (productId) productIds.push(productId)
          })
          
          // Fetch products from database
          let products: any[] = []
          if (productIds.length > 0) {
            const { data: productsData } = await supabaseAdmin
              .from('products')
              .select('id, name, price, image_url')
              .in('id', productIds)
            products = productsData || []
          }
          
          // Map line items to our format
          itemsToProcess = lineItems.map((lineItem: any, index: number) => {
            const productId = 
              lineItem.price?.product?.metadata?.product_id || 
              productIdsFromMetadata[index]
            const product = products?.find((p) => p.id === productId)
            
            return {
              product_id: productId || product?.id || `stripe-${lineItem.id}`,
              quantity: lineItem.quantity || 1,
              price: product?.price || (lineItem.price?.unit_amount || 0) / 100, // Use DB price or Stripe price
            }
          })
          
          console.log('[create-order-fallback] Reconstructed items from Stripe:', {
            itemCount: itemsToProcess.length,
            productIdsFound: productIds.length,
            sessionId: sessionId,
          })
        }
      } catch (stripeError: any) {
        console.error('[create-order-fallback] Error fetching Stripe session:', stripeError.message)
        // Continue with empty items - will fail gracefully below
      }
    }

    if (!itemsToProcess || itemsToProcess.length === 0) {
      console.error('[create-order-fallback] No items available to create order')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cart is empty and unable to retrieve order data from Stripe. Please contact support with your session ID.',
          sessionId,
        },
        { status: 400 }
      )
    }

    // Get full product details for cart items
    const productIds = itemsToProcess
      .map((item: any) => item.product_id)
      .filter((id: string) => id && !id.startsWith('stripe-')) // Filter out Stripe-only IDs
    
    let products: any[] = []
    if (productIds.length > 0) {
      const { data: productsData } = await supabaseAdmin
        .from('products')
        .select('id, name, price, image_url')
        .in('id', productIds)
      products = productsData || []
    }

    // Map products to cart items with correct type
    const cartItemsWithProducts = itemsToProcess.map((item: any) => {
      const product = products?.find((p) => p.id === item.product_id)
      return {
        id: `temp-${item.product_id}`,
        user_id: userId,
        product_id: item.product_id,
        quantity: item.quantity,
        products: product ? {
          price: Number(product.price) || Number(item.price) || 0,
          name: product.name || 'Product',
          image_url: product.image_url || undefined,
        } : {
          price: Number(item.price) || 0,
          name: 'Product',
          image_url: undefined,
        },
      }
    })

    // Create order using shared utility
    const orderResult = await createOrderFromCart({
      userId,
      sessionId,
      cartItems: cartItemsWithProducts,
    })

    if (!orderResult.success) {
      console.error('[create-order-fallback] Order creation failed:', orderResult.error)
      return NextResponse.json(
        { success: false, error: orderResult.error || 'Failed to create order' },
        { status: 500 }
      )
    }

    console.log('[create-order-fallback] Order created successfully:', orderResult.order?.id)
    return NextResponse.json({
      success: true,
      order: orderResult.order,
      wasDuplicate: orderResult.wasDuplicate,
    })
  } catch (error: any) {
    console.error('[create-order-fallback] Exception:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

