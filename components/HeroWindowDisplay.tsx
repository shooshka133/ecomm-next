'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Product } from '@/types'

interface HeroWindowDisplayProps {
  products: Product[]
}

export default function HeroWindowDisplay({ products }: HeroWindowDisplayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (products.length === 0) return null

  // Select 6 products for the window display
  const displayProducts = products.slice(0, 6)

  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-[600px]">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Product Display Grid - Window Shelf Style */}
      <div className="relative h-full flex items-center justify-center p-4 lg:p-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 w-full max-w-2xl">
          {displayProducts.map((product, index) => {
            // Varied sizing and positioning for organic look
            const sizes = [
              'col-span-1 row-span-1', // Small
              'col-span-1 row-span-2', // Tall
              'col-span-2 row-span-1', // Wide
              'col-span-1 row-span-1', // Small
              'col-span-1 row-span-1', // Small
              'col-span-1 row-span-1', // Small
            ]
            
            const animations = [
              'animate-float',
              'animate-float-delayed',
              'animate-float',
              'animate-float-delayed',
              'animate-float',
              'animate-float-delayed',
            ]

            const size = sizes[index] || 'col-span-1 row-span-1'
            const animation = animations[index] || 'animate-float'

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className={`${size} ${animation} group relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl hover:shadow-pink-500/50 transition-all duration-500 bg-white/10 backdrop-blur-md border border-white/20 hover:scale-105 hover:z-10`}
                style={{
                  animationDelay: `${index * 200}ms`,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.5s ease ${index * 100}ms, transform 0.5s ease ${index * 100}ms`
                }}
              >
                {/* Product Image */}
                <div className="w-full h-full min-h-[120px] lg:min-h-[180px] relative overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/20 to-white/5 text-white text-xs">
                      {product.name}
                    </div>
                  )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-bold text-sm lg:text-base mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-base lg:text-lg font-bold text-green-300">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Trending Badge */}
                {index < 3 && (
                  <div className="absolute top-2 lg:top-3 left-2 lg:left-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse-subtle">
                    🔥 Trending
                  </div>
                )}

                {/* Price Badge - Always Visible */}
                <div className="absolute top-2 lg:top-3 right-2 lg:right-3 bg-white/90 backdrop-blur-sm text-gray-900 px-2 lg:px-3 py-1 rounded-full shadow-lg font-bold text-xs lg:text-sm">
                  ${product.price.toFixed(2)}
                </div>

                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-white/30 rounded-tl-2xl"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-white/30 rounded-tr-2xl"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-white/30 rounded-bl-2xl"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-white/30 rounded-br-2xl"></div>
    </div>
  )
}

