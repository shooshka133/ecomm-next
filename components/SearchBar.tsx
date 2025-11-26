'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Product } from '@/types'
import { useRouter } from 'next/navigation'
import { getBrandColors } from '@/lib/brand'

interface SearchBarProps {
  products: Product[]
}

export default function SearchBar({ products }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const brandColors = getBrandColors()

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return []
    const term = searchTerm.toLowerCase()
    return products
      .filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term)
      )
      .slice(0, 5)
  }, [searchTerm, products])

  const handleProductClick = (productId: string) => {
    setSearchTerm('')
    setIsFocused(false)
    router.push(`/products/${productId}`)
  }

  return (
    <div ref={searchRef} className="relative max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search for products..."
          className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 outline-none transition-all text-lg"
          style={{
            '--focus-border': brandColors.primary || '#10B981',
            '--focus-ring': `${brandColors.primary || '#10B981'}20`
          } as React.CSSProperties}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = brandColors.primary || '#10B981'
            e.currentTarget.style.boxShadow = `0 0 0 2px ${brandColors.primary || '#10B981'}20`
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isFocused && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="w-full p-4 transition-colors text-left flex items-center gap-4 border-b border-gray-100 last:border-0 cursor-pointer"
              onMouseEnter={(e) => {
                const hex = brandColors.primary || '#10B981'
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
                if (result) {
                  const r = parseInt(result[1], 16)
                  const g = parseInt(result[2], 16)
                  const b = parseInt(result[3], 16)
                  e.currentTarget.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.1)`
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white'
              }}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-600 line-clamp-1">{product.description}</div>
                <div 
                  className="font-bold mt-1"
                  style={{ color: brandColors.primary || '#10B981' }}
                >
                  ${product.price.toFixed(2)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isFocused && searchTerm && filteredProducts.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-8 text-center z-50">
          <p className="text-gray-500">No products found matching &ldquo;{searchTerm}&rdquo;</p>
        </div>
      )}
    </div>
  )
}

