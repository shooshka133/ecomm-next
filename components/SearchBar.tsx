'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { Product } from '@/types'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  products: Product[]
}

export default function SearchBar({ products }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()

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
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search for products..."
          className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-lg"
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
              className="w-full p-4 hover:bg-indigo-50 transition-colors text-left flex items-center gap-4 border-b border-gray-100 last:border-0"
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
                <div className="text-indigo-600 font-bold mt-1">${product.price.toFixed(2)}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isFocused && searchTerm && filteredProducts.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-8 text-center z-50">
          <p className="text-gray-500">No products found matching &quot;{searchTerm}&quot;</p>
        </div>
      )}
    </div>
  )
}

