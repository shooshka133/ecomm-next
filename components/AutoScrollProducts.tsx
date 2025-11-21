'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Product } from '@/types'

interface AutoScrollProductsProps {
  products: Product[]
}

export default function AutoScrollProducts({ products }: AutoScrollProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer || products.length === 0) return

    let animationFrameId: number
    let scrollPosition = 0
    const scrollSpeed = 0.8 // pixels per frame
    let isPaused = false

    const scroll = () => {
      if (!scrollContainer || isPaused) {
        animationFrameId = requestAnimationFrame(scroll)
        return
      }
      
      scrollPosition += scrollSpeed
      
      // Smooth infinite loop without blinking
      const maxScroll = scrollContainer.scrollWidth / 2
      if (scrollPosition >= maxScroll) {
        scrollPosition = 0
        scrollContainer.scrollLeft = 0
      } else {
        scrollContainer.scrollLeft = scrollPosition
      }
      
      animationFrameId = requestAnimationFrame(scroll)
    }

    animationFrameId = requestAnimationFrame(scroll)

    // Pause on hover
    const handleMouseEnter = () => { isPaused = true }
    const handleMouseLeave = () => { isPaused = false }

    scrollContainer.addEventListener('mouseenter', handleMouseEnter)
    scrollContainer.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      cancelAnimationFrame(animationFrameId)
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter)
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [products])

  if (products.length === 0) return null

  // Duplicate products for seamless infinite scroll
  const displayProducts = [...products, ...products]

  return (
    <section className="bg-white py-8 md:py-12 overflow-hidden border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold gradient-text">
            🔥 Featured Products
          </h2>
          <div className="text-sm text-gray-500 hidden sm:block">
            <span className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Auto-scrolling
            </span>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 md:gap-6 overflow-x-hidden scrollbar-hide"
        style={{ 
          scrollBehavior: 'auto',
          cursor: 'grab'
        }}
      >
        {/* Add padding on the left */}
        <div className="flex-shrink-0 w-4 md:w-8"></div>
        
        {displayProducts.map((product, index) => (
          <Link
            key={`${product.id}-${index}`}
            href={`/products/${product.id}`}
            className="flex-shrink-0 group relative w-48 md:w-64"
          >
            <div className="relative rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 bg-white">
              {/* Product Image */}
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}
              </div>

              {/* Product Info Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-lg md:text-xl font-bold text-green-300">
                      ${product.price.toFixed(2)}
                    </p>
                    <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                      View →
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Badge (Always Visible) */}
              <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-sm md:text-base font-bold">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              {/* Category Badge */}
              {product.category && (
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-md">
                  <span className="text-xs font-semibold text-gray-700">
                    {product.category}
                  </span>
                </div>
              )}
            </div>

            {/* Product Name Below */}
            <div className="mt-3 px-2">
              <h3 className="font-semibold text-sm md:text-base text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {product.name}
              </h3>
            </div>
          </Link>
        ))}

        {/* Add padding on the right */}
        <div className="flex-shrink-0 w-4 md:w-8"></div>
      </div>

      {/* Instruction Text */}
      <div className="text-center mt-6 text-sm text-gray-500">
        <p className="hidden md:block">Hover to pause • Click to view details</p>
        <p className="md:hidden">Tap to view details</p>
      </div>
    </section>
  )
}

