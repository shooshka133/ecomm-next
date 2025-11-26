'use client'

import { Product } from '@/types'
import { useState, useEffect } from 'react'
import { getBrandColors } from '@/lib/brand'

interface CategoryFilterProps {
  products: Product[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}

export default function CategoryFilter({ products, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const [brandConfig, setBrandConfig] = useState<any>(null)
  
  // Fetch brand config from API (domain-based)
  useEffect(() => {
    fetch('/api/brand-config')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.brand) {
          setBrandConfig(data.brand)
        }
      })
      .catch(error => {
        console.warn('Failed to load brand config, using static:', error)
      })
  }, [])
  
  // Get unique categories from products
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[]
  const brandColors = brandConfig?.colors || getBrandColors()

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-6 py-2 rounded-full font-semibold transition-all ${
          selectedCategory === null
            ? 'text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        style={selectedCategory === null ? {
          background: `linear-gradient(to right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'})`
        } : {}}
      >
        All Products
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${
            selectedCategory === category
              ? 'text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          style={selectedCategory === category ? {
            background: `linear-gradient(to right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'})`
          } : {}}
        >
          {category}
        </button>
      ))}
    </div>
  )
}

