/**
 * Shared Order Creation Utility
 * 
 * This module provides a centralized, idempotent order creation function
 * that can be used by both the webhook and success page fallback.
 * 
 * Features:
 * - Transaction support (atomic operations)
 * - Idempotency (checks for existing orders)
 * - Cart clearing
 * - Wishlist removal
 * - Error handling
 */

import { createClient } from '@supabase/supabase-js'
import { Order, OrderItem, CartItem } from '@/types'

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface CreateOrderCartItem {
  id?: string
  user_id: string
  product_id: string
  quantity: number
  products?: { price: number; name: string; image_url?: string }
}

export interface CreateOrderParams {
  userId: string
  sessionId: string
  cartItems: Array<CreateOrderCartItem>
}

export interface CreateOrderResult {
  success: boolean
  order?: Order
  error?: string
  wasDuplicate?: boolean
}

/**
 * Creates an order from cart items with full transaction support
 * 
 * This function uses a PostgreSQL transaction function to ensure atomicity.
 * All operations (order, order_items, cart clearing, wishlist removal) 
 * happen in a single transaction - if any step fails, everything rolls back.
 * 
 * This function:
 * 1. Validates cart items
 * 2. Calculates total from cart items
 * 3. Calls PostgreSQL function that handles everything atomically
 * 4. Returns the created order or existing order (idempotent)
 */
export async function createOrderFromCart(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  const { userId, sessionId, cartItems } = params

  try {
    // Step 1: Validate cart items
    if (!cartItems || cartItems.length === 0) {
      return {
        success: false,
        error: 'Cart is empty',
      }
    }

    // Step 2: Calculate total
    const total = cartItems.reduce(
      (sum, item) => sum + (item.products?.price || 0) * item.quantity,
      0
    )

    if (total <= 0) {
      return {
        success: false,
        error: 'Invalid total amount',
      }
    }

    // Step 3: Prepare order items for JSONB
    const orderItemsJson = cartItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products?.price || 0,
    }))

    // Step 4: Call PostgreSQL transaction function
    // This handles order creation, order items, cart clearing, and wishlist removal atomically
    const { data: result, error: rpcError } = await supabaseAdmin.rpc(
      'create_order_from_cart_transaction',
      {
        p_user_id: userId,
        p_session_id: sessionId,
        p_total: total,
        p_order_items: orderItemsJson,
      }
    )

    if (rpcError) {
      return {
        success: false,
        error: `Failed to create order: ${rpcError.message}`,
      }
    }

    // Step 5: Parse result from PostgreSQL function
    if (!result || !result.success) {
      return {
        success: false,
        error: result?.error || 'Order creation failed',
      }
    }

    // Step 6: Fetch the created order with full details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', result.order_id)
      .single()

    if (orderError || !order) {
      return {
        success: false,
        error: 'Order created but failed to fetch details',
      }
    }

    return {
      success: true,
      order: order as Order,
      wasDuplicate: result.was_duplicate || false,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error creating order',
    }
  }
}

/**
 * Gets cart items with product details for a user
 */
export async function getCartItemsWithProducts(
  userId: string
): Promise<Array<CartItem & { products?: { price: number; name: string; image_url?: string } }>> {
  const { data: cartItems, error } = await supabaseAdmin
    .from('cart_items')
    .select('*, products(id, name, price, image_url)')
    .eq('user_id', userId)

  if (error) {
    console.error('[getCartItemsWithProducts] Error:', error)
    return []
  }

  return (cartItems || []) as Array<CartItem & { products?: { price: number; name: string; image_url?: string } }>
}

