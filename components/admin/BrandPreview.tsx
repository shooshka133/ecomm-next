'use client'

/**
 * Brand Preview Component
 * 
 * Modal showing live preview of brand configuration.
 * Displays logo, colors, typography, hero section, and SEO preview.
 */

import { X, Palette, Type, Eye, Globe } from 'lucide-react'

interface BrandPreviewProps {
  brand: any
  onClose: () => void
}

export default function BrandPreview({ brand, onClose }: BrandPreviewProps) {
  const config = brand.config || {}
  const colors = config.colors || {}
  const hero = config.hero || {}
  const seo = config.seo || {}

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Brand Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Logo Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Logo
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center">
              {brand.asset_urls?.logo ? (
                <img
                  src={brand.asset_urls.logo}
                  alt={brand.name}
                  className="max-w-xs max-h-32 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/icon.svg'
                  }}
                />
              ) : (
                <div className="text-gray-400">No logo uploaded</div>
              )}
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Palette
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {(['primary', 'accent', 'secondary', 'background', 'text'] as const).map((colorKey) => (
                <div key={colorKey} className="text-center">
                  <div
                    className="w-full h-24 rounded-lg mb-2 shadow-md border border-gray-200"
                    style={{ backgroundColor: colors[colorKey] || '#000000' }}
                  ></div>
                  <div className="text-sm font-medium text-gray-700 capitalize">{colorKey}</div>
                  <div className="text-xs text-gray-500 font-mono">{colors[colorKey] || 'N/A'}</div>
                </div>
              ))}
            </div>

            {/* Color Preview - Sample Components */}
            <div className="mt-6 space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Button Preview</div>
                <button
                  className="px-6 py-3 rounded-lg text-white font-semibold"
                  style={{ backgroundColor: colors.primary || '#4F46E5' }}
                >
                  {hero.ctaText || 'Shop Now'}
                </button>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Navbar Preview</div>
                <div
                  className="px-4 py-3 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: colors.background || '#F9FAFB' }}
                >
                  <span style={{ color: colors.text || '#111827' }}>{brand.name}</span>
                  <div className="flex gap-2">
                    <span
                      className="px-3 py-1 rounded text-sm"
                      style={{ 
                        backgroundColor: colors.primary || '#4F46E5',
                        color: '#FFFFFF'
                      }}
                    >
                      Products
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Type className="w-5 h-5" />
              Typography
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Primary Font</div>
                <div
                  className="text-2xl p-4 bg-gray-50 rounded-lg"
                  style={{ fontFamily: config.fontFamily?.primary || 'Inter, sans-serif' }}
                >
                  The quick brown fox jumps over the lazy dog
                </div>
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  {config.fontFamily?.primary || 'Inter, sans-serif'}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Heading Font</div>
                <div
                  className="text-3xl font-bold p-4 bg-gray-50 rounded-lg"
                  style={{ fontFamily: config.fontFamily?.heading || 'Poppins, sans-serif' }}
                >
                  {hero.title || 'Welcome to Our Store'}
                </div>
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  {config.fontFamily?.heading || 'Poppins, sans-serif'}
                </div>
              </div>
            </div>
          </div>

          {/* Hero Section Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hero Section Preview</h3>
            <div
              className="rounded-lg p-8 text-white"
              style={{
                background: `linear-gradient(135deg, ${colors.primary || '#4F46E5'} 0%, ${colors.accent || '#7C3AED'} 100%)`,
              }}
            >
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 text-sm">
                {hero.badge || 'Premium Quality Products'}
              </div>
              <h1 className="text-4xl font-bold mb-4">{hero.title || 'Welcome to Our Store'}</h1>
              <p className="text-lg mb-6 text-white/90">{hero.subtitle || 'Discover amazing products'}</p>
              <button
                className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                style={{ color: colors.primary || '#4F46E5' }}
              >
                {hero.ctaText || 'Shop Now'}
              </button>
            </div>
          </div>

          {/* SEO Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              SEO Preview
            </h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="text-sm text-gray-600 mb-1">Page Title</div>
              <div className="text-lg font-semibold text-blue-600 mb-4">
                {seo.title || 'Store Name - Description'}
              </div>
              
              <div className="text-sm text-gray-600 mb-1">Meta Description</div>
              <div className="text-sm text-gray-700 mb-4">
                {seo.description || 'Store description...'}
              </div>

              {brand.asset_urls?.ogImage && (
                <>
                  <div className="text-sm text-gray-600 mb-1">OG Image</div>
                  <img
                    src={brand.asset_urls.ogImage}
                    alt="OG Image"
                    className="w-full max-w-md rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

