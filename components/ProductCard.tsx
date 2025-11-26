'use client'

import { Product } from '@/types'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, Check, Heart, Eye } from 'lucide-react'
import Link from 'next/link'
// Removed getBrandColors import - using CSS variables directly

// Helper to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

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
  const [showFullDescription, setShowFullDescription] = useState(false)
  const supabase = createSupabaseClient()
  
  // Use CSS variables directly (set by inline styles in layout.tsx) - no flash!
  // These are available immediately from :root CSS variables
  const brandColors = {
    primary: typeof window !== 'undefined' 
      ? getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim() || '#10B981'
      : '#10B981',
    accent: typeof window !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue('--brand-accent').trim() || '#059669'
      : '#059669',
  }
  
  // Check if description is long enough to need truncation (approximately 3-4 lines)
  // Lower threshold to ensure more products show the read more button
  const descriptionLength = product.description?.length || 0
  // Show read more for descriptions longer than 60 characters (approximately 2-3 lines)
  const needsTruncation = descriptionLength > 60 && product.description

  const checkWishlistStatus = useCallback(async () => {
    if (!user || !product) {
      setIsWishlisted(false)
      return
    }

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
        setIsWishlisted(false)
        return
      }

      setIsWishlisted(!!data)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error checking wishlist:', error)
      }
      setIsWishlisted(false)
    }
  }, [user, product, supabase])

  // Load wishlist status when component mounts or user/product changes
  useEffect(() => {
    checkWishlistStatus()
  }, [checkWishlistStatus])

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
        // Refresh status to ensure consistency
        await checkWishlistStatus()
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
        // Refresh status to ensure consistency
        await checkWishlistStatus()
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
      <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative">
        {/* Wishlist Button */}
        {user && (
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`} 
            />
          </button>
        )}

        {/* Product Image */}
        <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
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
          <div 
            className="absolute top-2 left-2 text-white px-2 py-1 rounded-lg font-bold text-xs sm:text-sm shadow-lg"
            style={{
              background: `linear-gradient(to right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'})`
            }}
          >
            ${product.price.toFixed(2)}
          </div>

          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white text-center">
              <Eye className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs font-semibold">Quick View</span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-4">
          <h3 
            className="text-sm sm:text-base font-bold text-gray-900 mb-1 line-clamp-1 transition-colors"
            style={{
              '--hover-color': brandColors.primary
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = brandColors.primary || '#10B981'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#111827'
            }}
          >
            {product.name}
          </h3>
          {product.description && (
            <div className="mb-3 hidden sm:block">
              <p className={`text-gray-600 text-xs sm:text-sm ${!showFullDescription && needsTruncation ? 'line-clamp-1' : ''}`}>
                {product.description}
              </p>
              {needsTruncation && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowFullDescription(!showFullDescription)
                  }}
                  className="mt-1 text-xs font-medium transition-colors"
                  style={{
                    color: brandColors.primary || '#10B981'
                  }}
                  onMouseEnter={(e) => {
                    const rgb = hexToRgb(brandColors.primary || '#10B981')
                    if (rgb) {
                      e.currentTarget.style.color = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = brandColors.primary || '#10B981'
                  }}
                >
                  {showFullDescription ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}
          
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={adding || added}
            className={`w-full flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg ${
              added ? 'bg-green-500' : ''
            }`}
            style={!added ? {
              background: `linear-gradient(to right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'})`
            } : {}}
            onMouseEnter={(e) => {
              if (!added && !adding) {
                const rgb = hexToRgb(brandColors.primary || '#10B981')
                const accentRgb = hexToRgb(brandColors.accent || '#059669')
                if (rgb && accentRgb) {
                  e.currentTarget.style.background = `linear-gradient(to right, rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)}), rgb(${Math.max(0, accentRgb.r - 20)}, ${Math.max(0, accentRgb.g - 20)}, ${Math.max(0, accentRgb.b - 20)}))`
                }
              }
            }}
            onMouseLeave={(e) => {
              if (!added && !adding) {
                e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'})`
              }
            }}
          >
            {adding ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">Adding...</span>
              </>
            ) : added ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Add to Cart</span>
                <span className="sm:hidden">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  )
}
