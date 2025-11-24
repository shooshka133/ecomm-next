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
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
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
      checkAdminStatus()
      
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
      setIsAdmin(null)
    }
  }, [user, supabase, loadCartCount, checkAdminStatus])

  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(null)
      return
    }

    try {
      const response = await fetch('/api/admin/check')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin)
      } else {
        setIsAdmin(false)
      }
    } catch (error) {
      setIsAdmin(false)
    }
  }, [user])

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
    <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3 gap-4">
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all shadow-md">
              <span className="text-white font-bold text-lg font-poppins">E</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-poppins font-bold gradient-text tracking-tight">
                Ecommerce
              </span>
              <span className="text-xl font-poppins font-light text-gray-600 ml-1">
                Start
              </span>
            </div>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6 min-w-0 flex-1 justify-end">
            {/* Core Navigation - Always visible */}
            <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-white font-poppins font-semibold text-sm transition-all relative group whitespace-nowrap px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg hover:scale-105 hover:-rotate-1 transform shadow-sm"
              >
                Products
              </Link>
            </div>
            
            {/* User-specific items */}
            {loading ? (
              <div className="text-gray-500 whitespace-nowrap ml-3 font-poppins text-sm">Loading...</div>
            ) : user ? (
              <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
                {/* Wishlist Button */}
                <Link 
                  href="/wishlist" 
                  className="text-gray-700 hover:text-white font-poppins font-semibold text-sm transition-all relative group whitespace-nowrap px-4 py-2 rounded-lg bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-500 hover:to-rose-500 hover:shadow-lg hover:scale-105 hover:rotate-1 transform shadow-sm"
                >
                  Wishlist
                </Link>

                <Link 
                  href="/cart" 
                  className="relative flex items-center gap-2 text-gray-700 hover:text-white font-poppins font-semibold text-sm transition-all group whitespace-nowrap px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg hover:scale-105 hover:-rotate-1 transform shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-poppins font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md ring-2 ring-white">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
                <Link 
                  href="/orders" 
                  className="text-gray-700 hover:text-white font-poppins font-semibold text-sm transition-all relative group whitespace-nowrap px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg hover:scale-105 hover:rotate-1 transform shadow-sm"
                >
                  Orders
                </Link>
                <Link 
                  href="/profile" 
                  className="text-gray-700 hover:text-white font-poppins font-semibold text-sm transition-all relative group whitespace-nowrap px-4 py-2 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:scale-105 hover:-rotate-1 transform shadow-sm"
                >
                  Profile
                </Link>
                {isAdmin === true && (
                  <Link 
                    href="/admin" 
                    className="text-gray-700 hover:text-white font-poppins font-semibold text-sm transition-all relative group whitespace-nowrap px-4 py-2 rounded-lg bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:scale-105 hover:rotate-1 transform shadow-sm"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 flex-shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ring-2 ring-white">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-poppins font-semibold hidden xl:block whitespace-nowrap text-sm">{user.email?.split('@')[0]}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-1.5 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all font-poppins font-medium shadow-sm hover:shadow-md flex-shrink-0 whitespace-nowrap text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth"
                className="bg-gradient-to-r from-indigo-200 to-purple-200 text-gray-700 px-6 py-2 rounded-lg font-poppins font-bold text-sm hover:from-indigo-600 hover:to-purple-600 hover:text-white transition-all shadow-sm hover:shadow-lg transform hover:scale-105 hover:-rotate-1 flex-shrink-0"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile/Tablet Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-indigo-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile/Tablet Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 animate-slide-in bg-gradient-to-b from-white to-gray-50/50">
            <div className="flex flex-col gap-3">
              <Link 
                href="/" 
                className="text-gray-700 active:text-white font-poppins font-semibold text-sm py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 active:from-indigo-600 active:to-purple-600 active:scale-95 transition-all transform shadow-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              {user && (
                <>
                  <Link 
                    href="/wishlist" 
                    className="text-gray-700 active:text-white font-poppins font-semibold text-sm py-3 px-4 rounded-lg bg-gradient-to-r from-pink-100 to-rose-100 active:from-pink-500 active:to-rose-500 active:scale-95 transition-all transform shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                  <Link 
                    href="/cart" 
                    className="flex items-center justify-between text-gray-700 active:text-white font-poppins font-semibold text-sm py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 active:from-indigo-600 active:to-purple-600 active:scale-95 transition-all transform shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Cart
                    </span>
                    {cartCount > 0 && (
                      <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-poppins font-bold rounded-full px-2 py-1 shadow-sm">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link 
                    href="/orders" 
                    className="text-gray-700 active:text-white font-poppins font-semibold text-sm py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 active:from-indigo-600 active:to-purple-600 active:scale-95 transition-all transform shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link 
                    href="/profile" 
                    className="text-gray-700 active:text-white font-poppins font-semibold text-sm py-3 px-4 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 active:from-purple-600 active:to-pink-600 active:scale-95 transition-all transform shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {isAdmin === true && (
                    <Link 
                      href="/admin" 
                      className="text-gray-700 active:text-white font-poppins font-semibold text-sm py-3 px-4 rounded-lg bg-gradient-to-r from-orange-100 to-amber-100 active:from-orange-600 active:to-amber-600 active:scale-95 transition-all transform shadow-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-poppins font-semibold text-sm py-2.5 px-4 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all shadow-md"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
              {!user && (
                <Link
                  href="/auth"
                  className="bg-gradient-to-r from-indigo-200 to-purple-200 text-gray-700 font-poppins font-bold text-sm py-3 px-4 rounded-lg active:from-indigo-600 active:to-purple-600 active:text-white active:scale-95 transition-all transform shadow-sm text-center"
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
