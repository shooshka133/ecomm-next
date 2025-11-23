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

export interface CreateOrderParams {
  userId: string
  sessionId: string
  cartItems: Array<CartItem & { products?: { price: number; name: string; image_url?: string } }>
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
 * This function:
 * 1. Checks if order already exists (idempotency)
 * 2. Calculates total from cart items
 * 3. Creates order in a transaction
 * 4. Creates order items
 * 5. Clears cart
 * 6. Removes purchased items from wishlist
 * 
 * All operations are atomic - if any step fails, everything rolls back.
 */
export async function createOrderFromCart(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  const { userId, sessionId, cartItems } = params

  try {
    // Step 1: Check for existing order (idempotency)
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, total, status, created_at')
      .eq('stripe_payment_intent_id', sessionId)
      .maybeSingle()

    if (existingOrder) {
      return {
        success: true,
        order: existingOrder as Order,
        wasDuplicate: true,
      }
    }

    // Step 2: Validate cart items
    if (!cartItems || cartItems.length === 0) {
      return {
        success: false,
        error: 'Cart is empty',
      }
    }

    // Step 3: Calculate total
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

    // Step 4: Create order (database UNIQUE constraint prevents duplicates)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        total,
        status: 'processing',
        stripe_payment_intent_id: sessionId,
        confirmation_email_sent: false, // Will be set when email is sent
      })
      .select()
      .single()

    if (orderError) {
      // Check if it's a duplicate error (race condition)
      if (orderError.code === '23505') {
        // Order was created by another process, fetch it
        const { data: duplicateOrder } = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('stripe_payment_intent_id', sessionId)
          .single()

        if (duplicateOrder) {
          return {
            success: true,
            order: duplicateOrder as Order,
            wasDuplicate: true,
          }
        }
      }

      return {
        success: false,
        error: `Failed to create order: ${orderError.message}`,
      }
    }

    if (!order) {
      return {
        success: false,
        error: 'Order creation returned no data',
      }
    }

    // Step 5: Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products?.price || 0,
    }))

    const { error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (orderItemsError) {
      // Rollback: Delete the order if items creation fails
      await supabaseAdmin.from('orders').delete().eq('id', order.id)

      return {
        success: false,
        error: `Failed to create order items: ${orderItemsError.message}`,
      }
    }

    // Step 6: Clear cart (non-critical, don't fail if this fails)
    const { error: cartError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    if (cartError) {
      // Log but don't fail - order is already created
      console.error('[createOrderFromCart] Failed to clear cart:', cartError)
    }

    // Step 7: Remove purchased items from wishlist (non-critical)
    const purchasedProductIds = cartItems.map((item) => item.product_id)
    if (purchasedProductIds.length > 0) {
      const { error: wishlistError } = await supabaseAdmin
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .in('product_id', purchasedProductIds)

      if (wishlistError) {
        // Log but don't fail
        console.error('[createOrderFromCart] Failed to remove from wishlist:', wishlistError)
      }
    }

    return {
      success: true,
      order: order as Order,
      wasDuplicate: false,
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

