'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import { useAuth } from '@/components/AuthProvider'
import { ShoppingCart, Check, Heart, ArrowLeft, Minus, Plus, Tag, Grid, Home } from 'lucide-react'
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
  const [showFullDescription, setShowFullDescription] = useState(false)
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

  // Truncate description to 150 characters
  const descriptionPreview = product.description?.substring(0, 150) || ''
  const isDescriptionLong = (product.description?.length || 0) > 150

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Navigation Links */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
        <Link href="/" className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium">
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <span className="text-gray-400">/</span>
        {product.category && (
          <>
            <Link 
              href={`/?category=${encodeURIComponent(product.category)}`}
              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Tag className="w-4 h-4" />
              <span>{product.category}</span>
            </Link>
            <span className="text-gray-400">/</span>
          </>
        )}
        <span className="text-gray-600">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Product Image */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold gradient-text">
                ${product.price.toFixed(2)}
              </span>
              {product.category && (
                <Link
                  href={`/?category=${encodeURIComponent(product.category)}`}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-200 transition-colors"
                >
                  {product.category}
                </Link>
              )}
              {user && (
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className="p-2 border-2 border-gray-300 rounded-lg hover:border-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isWishlisted ? 'fill-pink-500 text-pink-500' : 'text-gray-400'
                    }`}
                  />
                </button>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              {showFullDescription ? product.description : descriptionPreview}
              {isDescriptionLong && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="ml-2 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {showFullDescription ? 'Show less' : '...Read more'}
                </button>
              )}
            </p>
          </div>

          {/* Quantity Selector & Add to Cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding || added}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
                added
                  ? 'bg-green-500 text-white'
                  : 'btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {adding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Grid className="w-4 h-4" />
              <span>All Products</span>
            </Link>
            {product.category && (
              <Link
                href={`/?category=${encodeURIComponent(product.category)}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Tag className="w-4 h-4" />
                <span>More {product.category}</span>
              </Link>
            )}
            <Link
              href="/cart"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>View Cart</span>
            </Link>
          </div>

          {/* Compact Features */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-900">Quality</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-900">Fast Ship</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-900">Secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

