'use client'

// Navbar component with admin access control
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { getBrandName, getLogoUrl, getBrandColors } from '@/lib/brand'

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return hex
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function Navbar() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [cartCount, setCartCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const supabase = createSupabaseClient()
  
  // Get brand configuration
  const brandName = getBrandName()
  const logoUrl = getLogoUrl()
  const brandColors = getBrandColors()
  
  // Split brand name for display (first word + rest)
  const brandNameParts = brandName.split(' ')
  const brandFirstWord = brandNameParts[0] || 'Ecommerce'
  const brandRest = brandNameParts.slice(1).join(' ') || 'Start'

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
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all shadow-md overflow-hidden"
              style={{
                background: `linear-gradient(to bottom right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'})`
              }}
            >
              {logoUrl && logoUrl !== '/icon.svg' ? (
                <img src={logoUrl} alt={brandName} className="w-full h-full object-contain" />
              ) : (
                <span className="text-white font-bold text-lg font-poppins">{brandFirstWord.charAt(0)}</span>
              )}
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-poppins font-bold gradient-text tracking-tight">
                {brandFirstWord}
              </span>
              {brandRest && (
                <span className="text-xl font-poppins font-light text-gray-600 ml-1">
                  {brandRest}
                </span>
              )}
            </div>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6 min-w-0 flex-1 justify-end">
            {/* Core Navigation - Always visible */}
            <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-white font-poppins font-semibold text-sm transition-all relative group whitespace-nowrap px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 hover:-rotate-1 transform shadow-sm"
                style={{
                  background: `linear-gradient(to right, ${hexToRgba(brandColors.primary || '#10B981', 0.2)}, ${hexToRgba(brandColors.accent || '#059669', 0.2)})`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'})`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(to right, ${hexToRgba(brandColors.primary || '#10B981', 0.2)}, ${hexToRgba(brandColors.accent || '#059669', 0.2)})`
                }}
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
                  className="text-gray-700 hover:text-white font-poppins font-semibold text-sm transition-all relative group whitespace-nowrap px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 hover:rotate-1 transform shadow-sm"
                  style={{
                    background: `linear-gradient(to right, ${hexToRgba(brandColors.secondary || '#3B82F6', 0.2)}, ${hexToRgba(brandColors.accent || '#059669', 0.2)})`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.secondary || '#3B82F6'}, ${brandColors.accent || '#059669'})`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(to right, ${hexToRgba(brandColors.secondary || '#3B82F6', 0.2)}, ${hexToRgba(brandColors.accent || '#059669', 0.2)})`
                  }}
                >
                  Wishlist
                </Link>

                <Link 
                  href="/cart" 
                  className="relative flex items-center gap-2 text-gray-700 hover:text-white font-poppins font-semibold text-sm transition-all group whitespace-nowrap px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 hover:-rotate-1 transform shadow-sm"
                  style={{
                    background: `linear-gradient(to right, ${brandColors.primary}20, ${brandColors.accent}20)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.primary}, ${brandColors.accent})`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.primary}20, ${brandColors.accent}20)`
                  }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 text-white text-xs font-poppins font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md ring-2 ring-white"
                      style={{
                        background: `linear-gradient(to right, ${brandColors.secondary || '#3B82F6'}, ${brandColors.accent || '#059669'})`
                      }}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
                <Link 
                  href="/orders" 
                  className="text-gray-700 hover:text-white font-poppins font-semibold text-sm transition-all relative group whitespace-nowrap px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 hover:rotate-1 transform shadow-sm"
                  style={{
                    background: `linear-gradient(to right, ${brandColors.primary}20, ${brandColors.accent}20)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.primary}, ${brandColors.accent})`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.primary}20, ${brandColors.accent}20)`
                  }}
                >
                  Orders
                </Link>
                <Link 
                  href="/profile" 
                  className="text-gray-700 hover:text-white font-poppins font-semibold text-sm transition-all relative group whitespace-nowrap px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 hover:-rotate-1 transform shadow-sm"
                  style={{
                    background: `linear-gradient(to right, ${hexToRgba(brandColors.primary || '#10B981', 0.2)}, ${hexToRgba(brandColors.secondary || '#3B82F6', 0.2)})`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.primary || '#10B981'}, ${brandColors.secondary || '#3B82F6'})`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(to right, ${hexToRgba(brandColors.primary || '#10B981', 0.2)}, ${hexToRgba(brandColors.secondary || '#3B82F6', 0.2)})`
                  }}
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
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ring-2 ring-white"
                      style={{
                        background: `linear-gradient(to bottom right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'}, ${brandColors.secondary || '#3B82F6'})`
                      }}
                    >
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-poppins font-semibold hidden xl:block whitespace-nowrap text-sm">{user.email?.split('@')[0]}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-lg transition-all font-poppins font-medium shadow-sm hover:shadow-md flex-shrink-0 whitespace-nowrap text-sm"
                    style={{
                      background: `linear-gradient(to right, ${brandColors.accent || '#059669'}, ${brandColors.primary || '#10B981'})`
                    }}
                    onMouseEnter={(e) => {
                      const hex = brandColors.accent || '#059669'
                      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
                      if (result) {
                        const r = Math.max(0, parseInt(result[1], 16) - 20)
                        const g = Math.max(0, parseInt(result[2], 16) - 20)
                        const b = Math.max(0, parseInt(result[3], 16) - 20)
                        e.currentTarget.style.background = `linear-gradient(to right, rgb(${r}, ${g}, ${b}), ${brandColors.primary || '#10B981'})`
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.accent || '#059669'}, ${brandColors.primary || '#10B981'})`
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth"
                className="text-gray-700 px-6 py-2 rounded-lg font-poppins font-bold text-sm hover:text-white transition-all shadow-sm hover:shadow-lg transform hover:scale-105 hover:-rotate-1 flex-shrink-0"
                style={{
                  background: `linear-gradient(to right, ${hexToRgba(brandColors.primary || '#10B981', 0.3)}, ${hexToRgba(brandColors.accent || '#059669', 0.3)})`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.primary}, ${brandColors.accent})`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(to right, ${hexToRgba(brandColors.primary || '#10B981', 0.3)}, ${hexToRgba(brandColors.accent || '#059669', 0.3)})`
                }}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile/Tablet Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 transition-colors"
            style={{ '--hover-color': brandColors.primary } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = brandColors.primary || '#10B981'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#374151'
            }}
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
                    className="text-gray-700 active:text-white font-poppins font-semibold text-sm py-3 px-4 rounded-lg active:scale-95 transition-all transform shadow-sm"
                    style={{
                      background: `linear-gradient(to right, ${hexToRgba(brandColors.primary || '#10B981', 0.2)}, ${hexToRgba(brandColors.accent || '#059669', 0.2)})`,
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'})`
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, ${hexToRgba(brandColors.primary || '#10B981', 0.2)}, ${hexToRgba(brandColors.accent || '#059669', 0.2)})`
                    }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              {user && (
                <>
                  <Link 
                    href="/wishlist" 
                    className="text-gray-700 active:text-white font-poppins font-semibold text-sm py-3 px-4 rounded-lg active:scale-95 transition-all transform shadow-sm"
                    style={{
                      background: `linear-gradient(to right, ${hexToRgba(brandColors.secondary || '#3B82F6', 0.2)}, ${hexToRgba(brandColors.accent || '#059669', 0.2)})`,
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.secondary || '#3B82F6'}, ${brandColors.accent || '#059669'})`
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, ${hexToRgba(brandColors.secondary || '#3B82F6', 0.2)}, ${hexToRgba(brandColors.accent || '#059669', 0.2)})`
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                  <Link 
                    href="/cart" 
                    className="flex items-center justify-between text-gray-700 active:text-white font-poppins font-semibold text-sm py-3 px-4 rounded-lg active:scale-95 transition-all transform shadow-sm"
                    style={{
                      background: `linear-gradient(to right, ${hexToRgba(brandColors.primary || '#10B981', 0.2)}, ${hexToRgba(brandColors.accent || '#059669', 0.2)})`,
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'})`
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, ${hexToRgba(brandColors.primary || '#10B981', 0.2)}, ${hexToRgba(brandColors.accent || '#059669', 0.2)})`
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Cart
                    </span>
                    {cartCount > 0 && (
                      <span 
                        className="text-white text-xs font-poppins font-bold rounded-full px-2 py-1 shadow-sm"
                        style={{
                          background: `linear-gradient(to right, ${brandColors.secondary || '#3B82F6'}, ${brandColors.accent || '#059669'})`
                        }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link 
                    href="/orders" 
                    className="text-gray-700 active:text-white font-poppins font-semibold text-sm py-3 px-4 rounded-lg active:scale-95 transition-all transform shadow-sm"
                    style={{
                      background: `linear-gradient(to right, ${hexToRgba(brandColors.primary || '#10B981', 0.2)}, ${hexToRgba(brandColors.accent || '#059669', 0.2)})`,
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'})`
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, ${hexToRgba(brandColors.primary || '#10B981', 0.2)}, ${hexToRgba(brandColors.accent || '#059669', 0.2)})`
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link 
                    href="/profile" 
                    className="text-gray-700 active:text-white font-poppins font-semibold text-sm py-3 px-4 rounded-lg active:scale-95 transition-all transform shadow-sm"
                    style={{
                      background: `linear-gradient(to right, ${hexToRgba(brandColors.primary || '#10B981', 0.2)}, ${hexToRgba(brandColors.secondary || '#3B82F6', 0.2)})`,
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.primary || '#10B981'}, ${brandColors.secondary || '#3B82F6'})`
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, ${hexToRgba(brandColors.primary || '#10B981', 0.2)}, ${hexToRgba(brandColors.secondary || '#3B82F6', 0.2)})`
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {isAdmin === true && (
                    <Link 
                      href="/admin" 
                      className="text-gray-700 active:text-white font-poppins font-semibold text-sm py-3 px-4 rounded-lg active:scale-95 transition-all transform shadow-sm"
                      style={{
                        background: `linear-gradient(to right, ${hexToRgba(brandColors.accent || '#059669', 0.2)}, ${hexToRgba(brandColors.primary || '#10B981', 0.2)})`,
                      }}
                      onTouchStart={(e) => {
                        e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.accent || '#059669'}, ${brandColors.primary || '#10B981'})`
                      }}
                      onTouchEnd={(e) => {
                        e.currentTarget.style.background = `linear-gradient(to right, ${hexToRgba(brandColors.accent || '#059669', 0.2)}, ${hexToRgba(brandColors.primary || '#10B981', 0.2)})`
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 text-white font-poppins font-semibold text-sm py-2.5 px-4 rounded-lg transition-all shadow-md"
                      style={{
                        background: `linear-gradient(to right, ${brandColors.accent || '#059669'}, ${brandColors.primary || '#10B981'})`
                      }}
                      onMouseEnter={(e) => {
                        const hex = brandColors.accent || '#059669'
                        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
                        if (result) {
                          const r = Math.max(0, parseInt(result[1], 16) - 20)
                          const g = Math.max(0, parseInt(result[2], 16) - 20)
                          const b = Math.max(0, parseInt(result[3], 16) - 20)
                          e.currentTarget.style.background = `linear-gradient(to right, rgb(${r}, ${g}, ${b}), ${brandColors.primary || '#10B981'})`
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.accent || '#059669'}, ${brandColors.primary || '#10B981'})`
                      }}
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
                  className="text-gray-700 font-poppins font-bold text-sm py-3 px-4 rounded-lg active:text-white active:scale-95 transition-all transform shadow-sm text-center"
                  style={{
                    background: `linear-gradient(to right, ${hexToRgba(brandColors.primary || '#10B981', 0.3)}, ${hexToRgba(brandColors.accent || '#059669', 0.3)})`,
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.background = `linear-gradient(to right, ${brandColors.primary}, ${brandColors.accent})`
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.background = `linear-gradient(to right, ${hexToRgba(brandColors.primary || '#10B981', 0.3)}, ${hexToRgba(brandColors.accent || '#059669', 0.3)})`
                  }}
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
