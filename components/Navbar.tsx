'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function Navbar() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [cartCount, setCartCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

      const totalItems = (data as { quantity: number }[] | null)?.reduce((sum, item) => sum + item.quantity, 0) || 0
      setCartCount(totalItems)
    } catch (error) {
      // Error loading cart count - silently fail in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading cart count:', error)
      }
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
            // Cart change detected - reload cart count
            if (process.env.NODE_ENV === 'development') {
              console.log('Cart change detected:', payload)
            }
            loadCartCount()
          }
        )
        .subscribe((status) => {
          // Subscription status monitoring (removed for production)
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
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4 gap-4">
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-2xl font-bold gradient-text hidden sm:block">
              Ecommerce Start
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 min-w-0 flex-1 justify-end">
            {/* Core Navigation - Always visible */}
            <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors relative group whitespace-nowrap"
              >
                Products
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
            
            {/* User-specific items */}
            {loading ? (
              <div className="text-gray-500 whitespace-nowrap ml-3">Loading...</div>
            ) : user ? (
              <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0 ml-3">
                <Link 
                  href="/cart" 
                  className="relative flex items-center gap-1 text-gray-700 hover:text-indigo-600 font-medium transition-colors group whitespace-nowrap"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse-glow">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
                <Link 
                  href="/orders" 
                  className="text-gray-700 hover:text-indigo-600 font-medium transition-colors relative group whitespace-nowrap"
                >
                  Orders
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link 
                  href="/profile" 
                  className="text-gray-700 hover:text-indigo-600 font-medium transition-colors relative group whitespace-nowrap"
                >
                  Profile
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-3 border-l border-gray-200 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium hidden xl:block whitespace-nowrap text-sm">{user.email?.split('@')[0]}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1 lg:gap-2 bg-red-500 text-white px-2 lg:px-3 py-2 rounded-lg hover:bg-red-600 transition-all font-medium shadow-md hover:shadow-lg flex-shrink-0 whitespace-nowrap text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth"
                className="btn-primary ml-3 flex-shrink-0"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-indigo-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-slide-in">
            <div className="flex flex-col gap-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-indigo-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              {user && (
                <>
                  <Link 
                    href="/cart" 
                    className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </Link>
                  <Link 
                    href="/orders" 
                    className="text-gray-700 hover:text-indigo-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link 
                    href="/profile" 
                    className="text-gray-700 hover:text-indigo-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-red-600 font-medium text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              )}
              {!user && (
                <Link
                  href="/auth"
                  className="btn-primary text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
