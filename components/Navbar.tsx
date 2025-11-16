'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, LogOut } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function Navbar() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [cartCount, setCartCount] = useState(0)
  const supabase = createSupabaseClient()

  const loadCartCount = useCallback(async () => {
    if (!user) {
      setCartCount(0)
      return
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', user.id)

      if (error) throw error

      const totalItems = data?.reduce((sum, item) => sum + item.quantity, 0) || 0
      setCartCount(totalItems)
    } catch (error) {
      console.error('Error loading cart count:', error)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      loadCartCount()
      
      // Subscribe to cart changes with proper cleanup
      const channel = supabase
        .channel(`cart-changes-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart_items',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Cart change detected:', payload)
            loadCartCount()
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status)
        })

      // Also poll every 2 seconds as backup
      const interval = setInterval(() => {
        loadCartCount()
      }, 2000)

      return () => {
        supabase.removeChannel(channel)
        clearInterval(interval)
      }
    } else {
      setCartCount(0)
    }
  }, [user, supabase, loadCartCount])

  // Listen for custom events from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      loadCartCount()
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [loadCartCount])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ecommerce Start
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Products
            </Link>
            
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : user ? (
              <>
                <Link 
                  href="/cart" 
                  className="relative flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
                <Link 
                  href="/orders" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Orders
                </Link>
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{user.email?.split('@')[0]}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/auth"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-md hover:shadow-lg"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
