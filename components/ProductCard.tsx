'use client'

import { Product } from '@/types'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { ShoppingCart, Check, Heart, Eye } from 'lucide-react'
import Link from 'next/link'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const supabase = createSupabaseClient()

  // Load wishlist status when component mounts or user changes
  useEffect(() => {
    if (user && product) {
      checkWishlistStatus()
    } else {
      setIsWishlisted(false)
    }
  }, [user, product?.id])

  const checkWishlistStatus = async () => {
    if (!user) return

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

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      router.push('/auth')
      return
    }

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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      router.push('/auth')
      return
    }

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
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id)
      } else {
        // Add new item
        await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
          })
      }
      
      // Dispatch custom event to update cart count
      window.dispatchEvent(new Event('cartUpdated'))
      
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (error) {
      // Error adding to cart - log in development only
      if (process.env.NODE_ENV === 'development') {
        console.error('Error adding to cart:', error)
      }
      alert('Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative">
        {/* Wishlist Button */}
        {user && (
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`} 
            />
          </button>
        )}

        {/* Product Image */}
        <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
          
          {/* Price Badge */}
          <div className="absolute top-4 left-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
            ${product.price.toFixed(2)}
          </div>

          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white text-center">
              <Eye className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm font-semibold">Quick View</span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
            {product.description}
          </p>
          
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={adding || added}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg'
            }`}
          >
            {adding ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding...</span>
              </>
            ) : added ? (
              <>
                <Check className="w-5 h-5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  )
}
