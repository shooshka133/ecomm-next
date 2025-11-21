'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const sessionId = searchParams.get('session_id')
  const processedRef = useRef(false) // Prevent multiple executions
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Prevent multiple executions
    if (processedRef.current || !user || !sessionId) {
      if (!user || !sessionId) {
        setLoading(false)
      }
      return
    }

    // Mark as processed immediately
    processedRef.current = true

    // Wait a bit for webhook, then check and create order manually if needed
    const processOrder = async () => {
      setProcessing(true)
      
      try {
        // First, check if order already exists for this session
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('*')
          .eq('stripe_payment_intent_id', sessionId)
          .single()
        
        if (existingOrder) {
          console.log('Order already exists for this session:', existingOrder.id)
          // Order exists, just clear cart if needed and update count
          const { data: cartItems } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id)
          
          if (cartItems && cartItems.length > 0) {
            // Clear cart if it still has items
            await supabase
              .from('cart_items')
              .delete()
              .eq('user_id', user.id)
            window.dispatchEvent(new Event('cartUpdated'))
          }
          
          setProcessing(false)
          setLoading(false)
          router.refresh()
          return
        }
        
        // Wait 3 seconds for webhook to process
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Check again if order was created by webhook
        const { data: orderAfterWait } = await supabase
          .from('orders')
          .select('*')
          .eq('stripe_payment_intent_id', sessionId)
          .single()
        
        if (orderAfterWait) {
          console.log('Order created by webhook:', orderAfterWait.id)
          // Order exists now, just clear cart if needed
          const { data: cartItems } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id)
          
          if (cartItems && cartItems.length > 0) {
            await supabase
              .from('cart_items')
              .delete()
              .eq('user_id', user.id)
            window.dispatchEvent(new Event('cartUpdated'))
          }
          
          setProcessing(false)
          setLoading(false)
          router.refresh()
          return
        }
        
        // Check if cart is empty (webhook cleared it but didn't create order)
        const { data: cartItems } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
        
        // Only create order if cart still has items (webhook didn't work)
        if (cartItems && cartItems.length > 0) {
          console.log('Webhook may have failed, creating order manually...')
          
          // Double-check no order exists
          const { data: finalCheck } = await supabase
            .from('orders')
            .select('*')
            .eq('stripe_payment_intent_id', sessionId)
            .single()
          
          if (finalCheck) {
            console.log('Order found on final check, skipping creation')
            setProcessing(false)
            setLoading(false)
            router.refresh()
            return
          }
          
          // Get cart items with product details
          const { data: fullCartItems } = await supabase
            .from('cart_items')
            .select('*, products(*)')
            .eq('user_id', user.id)
          
          if (fullCartItems && fullCartItems.length > 0) {
            // Calculate total
            const total = fullCartItems.reduce(
              (sum: number, item: any) => sum + (item.products?.price || 0) * item.quantity,
              0
            )
            
            // Create order with session_id as payment_intent_id to track it
            const { data: order, error: orderError } = await supabase
              .from('orders')
              .insert({
                user_id: user.id,
                total,
                status: 'processing',
                stripe_payment_intent_id: sessionId,
              })
              .select()
              .single()
            
            if (!orderError && order) {
              // Create order items
              const orderItems = fullCartItems.map((item: any) => ({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.products?.price || 0,
              }))
              
              await supabase
                .from('order_items')
                .insert(orderItems)
              
              // Clear cart
              await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id)
              
              // Remove purchased items from wishlist
              const purchasedProductIds = fullCartItems.map((item: any) => item.product_id)
              if (purchasedProductIds.length > 0) {
                await supabase
                  .from('wishlist')
                  .delete()
                  .eq('user_id', user.id)
                  .in('product_id', purchasedProductIds)
                
                console.log('Removed purchased items from wishlist:', purchasedProductIds.length)
              }
              
              console.log('Order created manually:', order.id)
              
              // Dispatch event to update cart count
              window.dispatchEvent(new Event('cartUpdated'))
            }
          }
        }
      } catch (error) {
        console.error('Error processing order:', error)
      } finally {
        setProcessing(false)
        setLoading(false)
        router.refresh()
      }
    }
    
    processOrder()
  }, [user, sessionId, router, supabase])

  if (loading || processing) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">
              {processing ? 'Processing your order...' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
        {sessionId && (
          <p className="text-sm text-gray-500 mb-8 bg-gray-50 p-3 rounded-lg inline-block">
            Session ID: {sessionId.slice(0, 20)}...
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            onClick={() => router.refresh()}
          >
            <Package className="w-5 h-5" />
            View Orders
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-8 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
