'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import { useAuth } from '@/components/AuthProvider'
import { ShoppingCart, Check, Heart, ArrowLeft, Minus, Plus } from 'lucide-react'
import Link from 'next/link'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadProduct()
  }, [params.id])

  useEffect(() => {
    if (user && product) {
      checkWishlistStatus()
    } else {
      setIsWishlisted(false)
    }
  }, [user, product?.id])

  const checkWishlistStatus = async () => {
    if (!user || !product) return

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        if (process.env.NODE_ENV === 'development') {
          console.error('Error checking wishlist:', error)
        }
        return
      }

      setIsWishlisted(!!data)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error checking wishlist:', error)
      }
    }
  }

  const handleToggleWishlist = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (!product) return

    setWishlistLoading(true)
    try {
      if (isWishlisted) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id)

        if (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error removing from wishlist:', error)
          }
          // Check if table doesn't exist
          if (error.message?.includes('does not exist') || error.code === '42P01') {
            alert('Wishlist table not found! Please run the SQL script in Supabase. See WISHLIST_SETUP.md for instructions.')
          } else {
            alert('Failed to remove from wishlist. Please try again.')
          }
          return
        }
        setIsWishlisted(false)
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            product_id: product.id,
          })

        if (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error adding to wishlist:', error)
          }
          // Check if table doesn't exist
          if (error.message?.includes('does not exist') || error.code === '42P01') {
            alert('Wishlist table not found! Please run the SQL script in Supabase. See WISHLIST_SETUP.md for instructions.')
          } else {
            alert('Failed to add to wishlist. Please try again.')
          }
          return
        }
        setIsWishlisted(true)
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error toggling wishlist:', error)
      }
      // Check if table doesn't exist
      if (error?.message?.includes('does not exist') || error?.code === '42P01') {
        alert('Wishlist table not found! Please run the SQL script in Supabase. See WISHLIST_SETUP.md for instructions.')
      } else {
        alert('An error occurred. Please try again.')
      }
      // Revert state on error
      setIsWishlisted(!isWishlisted)
    } finally {
      setWishlistLoading(false)
    }
  }

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setProduct(data)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading product:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (!product) return

    setAdding(true)
    try {
      // Check if item already in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single()

      if (existingItem) {
        // Update quantity
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)
      } else {
        // Add new item
        await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: quantity,
          })
      }
      
      window.dispatchEvent(new Event('cartUpdated'))
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error adding to cart:', error)
      }
      alert('Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold gradient-text">
                ${product.price.toFixed(2)}
              </span>
              {user && (
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className="p-3 border-2 border-gray-300 rounded-lg hover:border-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${
                      isWishlisted ? 'fill-pink-500 text-pink-500' : 'text-gray-400'
                    }`}
                  />
                </button>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {product.description}
            </p>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={adding || added}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition-all ${
              added
                ? 'bg-green-500 text-white'
                : 'btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {adding ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding to Cart...</span>
              </>
            ) : added ? (
              <>
                <Check className="w-6 h-6" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-6 h-6" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          {/* Features */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Quality Guaranteed</p>
                <p className="text-sm text-gray-600">Premium quality products</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Fast Shipping</p>
                <p className="text-sm text-gray-600">Free shipping on all orders</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Secure Payment</p>
                <p className="text-sm text-gray-600">Protected by Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

