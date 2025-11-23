'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { createSupabaseClient } from '@/lib/supabase/client'

interface ProcessingState {
  status: 'idle' | 'checking' | 'waiting' | 'creating' | 'sending_email' | 'complete' | 'error'
  message: string
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [processing, setProcessing] = useState<ProcessingState>({
    status: 'idle',
    message: 'Initializing...',
  })
  const sessionId = searchParams.get('session_id')
  const processedRef = useRef(false) // Prevent multiple executions
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Wait for auth to load before processing
    if (authLoading) {
      setProcessing({ status: 'idle', message: 'Loading...' })
      return
    }

    // Prevent multiple executions
    if (processedRef.current) {
      return
    }

    // Only show error if auth is loaded and user/sessionId are actually missing
    if (!user || !sessionId) {
      // Small delay to prevent flash during normal transitions
      const timeoutId = setTimeout(() => {
        // Double-check after delay - if still missing, redirect or show error
        if (!user) {
          // User signed out - redirect to home
          router.push('/')
          return
        }
        if (!sessionId) {
          // No session ID - might be a direct visit, redirect to orders
          router.push('/orders')
          return
        }
      }, 300) // Reduced delay to 300ms for faster response
      
      return () => clearTimeout(timeoutId)
    }

    // Mark as processed immediately
    processedRef.current = true

    const processOrder = async () => {
      try {
        // Step 1: Check if order already exists (idempotency)
        setProcessing({ status: 'checking', message: 'Checking for existing order...' })
        
        const { data: existingOrder, error: existingOrderError } = await supabase
          .from('orders')
          .select('id, user_id, total, status, created_at, confirmation_email_sent')
          .eq('stripe_payment_intent_id', sessionId)
          .maybeSingle()

        if (existingOrderError && existingOrderError.code !== 'PGRST116') {
          // PGRST116 = no rows found (expected)
          console.error('[Success Page] Error checking for order:', existingOrderError)
        }

        if (existingOrder) {
          console.log('[Success Page] Order already exists:', existingOrder.id)
          
          // Order exists, ensure cart is cleared
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

          setProcessing({ status: 'complete', message: 'Order confirmed!' })
          router.refresh()
          return
        }

        // Step 2: Wait for webhook with exponential backoff
        // Instead of fixed 3 seconds, use retry logic
        const maxRetries = 5
        const baseDelay = 1000 // 1 second
        let orderFound = false

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          const delay = baseDelay * Math.pow(2, attempt) // Exponential backoff: 1s, 2s, 4s, 8s, 16s
          
          if (attempt > 0) {
            setProcessing({
              status: 'waiting',
              message: `Waiting for webhook... (attempt ${attempt + 1}/${maxRetries})`,
            })
            await new Promise(resolve => setTimeout(resolve, delay))
          }

          // Check if order was created by webhook
          const { data: orderAfterWait } = await supabase
            .from('orders')
            .select('id, user_id, total, status, created_at')
            .eq('stripe_payment_intent_id', sessionId)
            .maybeSingle()

          if (orderAfterWait) {
            console.log('[Success Page] Order created by webhook:', orderAfterWait.id)
            orderFound = true

            // Ensure cart is cleared
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

            setProcessing({ status: 'complete', message: 'Order confirmed!' })
            router.refresh()
            return
          }
        }

        // Step 3: Webhook didn't create order, create it manually (fallback)
        if (!orderFound) {
          setProcessing({ status: 'creating', message: 'Creating order...' })

          // Get cart items with product details (client-side)
          // Even if cart is empty, the API route can fetch from Stripe session
          const { data: cartItems } = await supabase
            .from('cart_items')
            .select('*, products(id, name, price, image_url)')
            .eq('user_id', user.id)

          // Calculate total (if cart items exist)
          const total = cartItems?.reduce(
            (sum: number, item: any) => sum + (item.products?.price || 0) * item.quantity,
            0
          ) || 0

          // Create order via API route (server-side, can use service role key)
          // API route will handle empty cart by fetching from Stripe session
          const response = await fetch('/api/create-order-fallback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              sessionId,
              cartItems: cartItems?.map((item: any) => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.products?.price || 0,
              })) || [], // Send empty array if cart is empty - API will fetch from Stripe
              total,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
            console.error('[Success Page] Failed to create order:', errorData.error)
            setProcessing({
              status: 'error',
              message: 'Failed to create order. Please contact support.',
            })
            return
          }

          const orderResult = await response.json()

          if (!orderResult.success || !orderResult.order) {
            console.error('[Success Page] Failed to create order:', orderResult.error)
            setProcessing({
              status: 'error',
              message: 'Failed to create order. Please contact support.',
            })
            return
          }

          console.log('[Success Page] Order created manually:', orderResult.order.id)

          // Step 4: Send order confirmation email (idempotent)
          if (!orderResult.wasDuplicate) {
            setProcessing({ status: 'sending_email', message: 'Sending confirmation email...' })

            try {
              const emailResponse = await fetch('/api/send-order-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: orderResult.order.id,
                  userId: user.id,
                }),
              })

              if (emailResponse.ok) {
                const emailResult = await emailResponse.json()
                if (emailResult.success) {
                  console.log('[Success Page] Email sent:', emailResult.emailId)
                } else {
                  console.error('[Success Page] Email failed:', emailResult.error)
                }
              } else {
                console.error('[Success Page] Email API error:', emailResponse.status)
              }
            } catch (emailError) {
              console.error('[Success Page] Email exception:', emailError)
              // Don't fail - order is created, email can be retried
            }
          }

          // Dispatch event to update cart count
          window.dispatchEvent(new Event('cartUpdated'))

          setProcessing({ status: 'complete', message: 'Order confirmed!' })
          router.refresh()
        }
      } catch (error: any) {
        console.error('[Success Page] Error processing order:', error)
        setProcessing({
          status: 'error',
          message: 'An error occurred. Please contact support.',
        })
      }
    }

    processOrder()
  }, [user, sessionId, router, supabase, authLoading])

  // Show loading while auth is loading (prevents flash of error)
  if (authLoading || (processing.status === 'idle' && !user)) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Loading/Processing UI
  if (processing.status !== 'complete' && processing.status !== 'error') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">{processing.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Error UI
  if (processing.status === 'error') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-16 h-16 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Processing Error</h1>
          <p className="text-xl text-gray-600 mb-6">{processing.message}</p>
          <p className="text-sm text-gray-500 mb-8">
            Session ID: {sessionId?.slice(0, 20)}...
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/orders"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all"
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

  // Success UI
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
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
