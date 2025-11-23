import { NextRequest, NextResponse } from 'next/server'
import { createOrderFromCart } from '@/lib/orders/create'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId, cartItems, total } = await request.json()

    if (!userId || !sessionId || !cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get full product details for cart items
    const productIds = cartItems.map((item: any) => item.product_id)
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, name, price, image_url')
      .in('id', productIds)

    // Map products to cart items with correct type
    const cartItemsWithProducts = cartItems.map((item: any) => {
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
      return NextResponse.json(
        { success: false, error: orderResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order: orderResult.order,
      wasDuplicate: orderResult.wasDuplicate,
    })
  } catch (error: any) {
    console.error('[create-order-fallback] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

