/**
 * Order Email Utilities
 * 
 * Provides idempotent email sending functions that check
 * database flags before sending to prevent duplicates.
 */

import { createClient } from '@supabase/supabase-js'
import { sendOrderConfirmationEmail } from '@/lib/email/send'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface SendOrderConfirmationParams {
  orderId: string
  userId: string
}

export interface SendOrderConfirmationResult {
  success: boolean
  emailId?: string
  error?: string
  wasAlreadySent?: boolean
}

/**
 * Sends order confirmation email with idempotency check
 * 
 * Uses database flag to prevent duplicate emails.
 * Returns early if email was already sent.
 */
export async function sendOrderConfirmationEmailIdempotent(
  params: SendOrderConfirmationParams
): Promise<SendOrderConfirmationResult> {
  const { orderId, userId } = params

  try {
    // Step 1: Get order and check if email was already sent
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, total, created_at, confirmation_email_sent')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return {
        success: false,
        error: 'Order not found',
      }
    }

    // Verify order belongs to user
    if (order.user_id !== userId) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Step 2: Check if email was already sent (idempotency)
    if (order.confirmation_email_sent) {
      return {
        success: true,
        wasAlreadySent: true,
      }
    }

    // Step 3: Get order items with product details
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*, products(id, name, price, image_url)')
      .eq('order_id', orderId)

    if (itemsError || !orderItems || orderItems.length === 0) {
      return {
        success: false,
        error: 'Order items not found',
      }
    }

    // Step 4: Get user details
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()

    const customerEmail = authUser?.user?.email
    const customerName = userProfile?.full_name || authUser?.user?.email?.split('@')[0] || 'Customer'

    if (!customerEmail) {
      return {
        success: false,
        error: 'Customer email not found',
      }
    }

    // Step 5: Prepare email data
    const emailOrderItems = orderItems.map((item: any) => ({
      name: item.products?.name || 'Product',
      price: item.price,
      quantity: item.quantity,
      image_url: item.products?.image_url,
    }))

    // Step 6: Send email
    const emailResult = await sendOrderConfirmationEmail({
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
      trackingNumber: undefined,
    })

    // Step 7: Update email flag only if email was sent successfully
    if (emailResult.success) {
      // Use database function for atomic update
      const { error: updateError } = await supabaseAdmin.rpc('mark_email_sent', {
        p_order_id: orderId,
        p_email_type: 'confirmation',
      })

      if (updateError) {
        console.error('[sendOrderConfirmationEmailIdempotent] Failed to update email flag:', updateError)
        // Don't fail - email was sent, flag update is secondary
      }
    }

    return {
      success: emailResult.success,
      emailId: emailResult.emailId,
      error: emailResult.error,
      wasAlreadySent: false,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error sending email',
    }
  }
}

