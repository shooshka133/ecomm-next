'use client'

/**
 * Brand Preview Page
 * 
 * Admin-only page to preview brand configuration.
 * Shows logo, colors, typography, hero section, and SEO metadata.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { getBrandConfig } from '@/lib/brand'
import { Palette, Type, Image, Mail, Globe, Eye } from 'lucide-react'
import Link from 'next/link'

export default function BrandPreviewPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [brandConfig, setBrandConfig] = useState<any>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/auth?next=/admin/brand-preview')
      return
    }

    // Check admin status
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin/check')
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin)
          if (!data.isAdmin) {
            router.push('/admin')
            return
          }
          // Load brand config
          const config = getBrandConfig()
          setBrandConfig(config)
        } else {
          setIsAdmin(false)
          router.push('/admin')
        }
      } catch (error) {
        setIsAdmin(false)
        router.push('/admin')
      }
    }

    checkAdmin()
  }, [user, authLoading, router])

  if (authLoading || isAdmin === null || !brandConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading brand preview...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Preview</h1>
              <p className="text-gray-600">Preview your brand configuration and assets</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Back to Admin
            </Link>
          </div>
        </div>

        {/* Brand Identity */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Image className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Brand Identity</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
              <div className="text-lg font-semibold text-gray-900">{brandConfig.name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slogan</label>
              <div className="text-gray-600">{brandConfig.slogan}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <div className="mt-2">
                {brandConfig.logoUrl && brandConfig.logoUrl !== '/icon.svg' ? (
                  <img 
                    src={brandConfig.logoUrl} 
                    alt={brandConfig.name}
                    className="h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/icon.svg'
                    }}
                  />
                ) : (
                  <div className="text-sm text-gray-500">Using default logo</div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <div className="text-gray-600">{brandConfig.contactEmail}</div>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Palette className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Color Palette</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div 
                className="h-24 rounded-lg mb-2 shadow-md"
                style={{ backgroundColor: brandConfig.colors.primary }}
              ></div>
              <div className="text-sm font-medium text-gray-700">Primary</div>
              <div className="text-xs text-gray-500 font-mono">{brandConfig.colors.primary}</div>
            </div>
            <div>
              <div 
                className="h-24 rounded-lg mb-2 shadow-md"
                style={{ backgroundColor: brandConfig.colors.accent }}
              ></div>
              <div className="text-sm font-medium text-gray-700">Accent</div>
              <div className="text-xs text-gray-500 font-mono">{brandConfig.colors.accent}</div>
            </div>
            <div>
              <div 
                className="h-24 rounded-lg mb-2 shadow-md"
                style={{ backgroundColor: brandConfig.colors.secondary }}
              ></div>
              <div className="text-sm font-medium text-gray-700">Secondary</div>
              <div className="text-xs text-gray-500 font-mono">{brandConfig.colors.secondary}</div>
            </div>
            <div>
              <div 
                className="h-24 rounded-lg mb-2 shadow-md border border-gray-200"
                style={{ backgroundColor: brandConfig.colors.background }}
              ></div>
              <div className="text-sm font-medium text-gray-700">Background</div>
              <div className="text-xs text-gray-500 font-mono">{brandConfig.colors.background}</div>
            </div>
            <div>
              <div 
                className="h-24 rounded-lg mb-2 shadow-md"
                style={{ backgroundColor: brandConfig.colors.text }}
              ></div>
              <div className="text-sm font-medium text-gray-700">Text</div>
              <div className="text-xs text-gray-500 font-mono">{brandConfig.colors.text}</div>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Type className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Typography</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Font</label>
              <div 
                className="text-2xl font-semibold mb-2"
                style={{ fontFamily: brandConfig.fonts.primary }}
              >
                {brandConfig.fonts.primary}
              </div>
              <div className="text-sm text-gray-500 font-mono">{brandConfig.fonts.primary}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heading Font</label>
              <div 
                className="text-2xl font-semibold mb-2"
                style={{ fontFamily: brandConfig.fonts.heading }}
              >
                {brandConfig.fonts.heading}
              </div>
              <div className="text-sm text-gray-500 font-mono">{brandConfig.fonts.heading}</div>
            </div>
          </div>
        </div>

        {/* Hero Section Preview */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Eye className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Hero Section Preview</h2>
          </div>
          
          <div 
            className="rounded-lg p-8 text-white"
            style={{ 
              background: `linear-gradient(135deg, ${brandConfig.colors.primary} 0%, ${brandConfig.colors.accent} 100%)` 
            }}
          >
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 text-sm">
              {brandConfig.hero.badge}
            </div>
            <h1 className="text-4xl font-bold mb-4">{brandConfig.hero.title}</h1>
            <p className="text-lg mb-6 text-white/90">{brandConfig.hero.subtitle}</p>
            <button 
              className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              style={{ color: brandConfig.colors.primary }}
            >
              {brandConfig.hero.ctaText}
            </button>
          </div>
        </div>

        {/* SEO Metadata */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Globe className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">SEO Metadata</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
              <div className="text-gray-900 font-semibold">{brandConfig.seo.title}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
              <div className="text-gray-600">{brandConfig.seo.description}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">OG Image</label>
              <div className="mt-2">
                {brandConfig.ogImage && brandConfig.ogImage !== '/icon.svg' ? (
                  <img 
                    src={brandConfig.ogImage} 
                    alt="OG Image"
                    className="h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/icon.svg'
                    }}
                  />
                ) : (
                  <div className="text-sm text-gray-500">Using default OG image</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        {(brandConfig.social.instagram || brandConfig.social.facebook || brandConfig.social.twitter || brandConfig.social.linkedin) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <Mail className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Social Links</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {brandConfig.social.instagram && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Instagram</div>
                  <a href={brandConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                    {brandConfig.social.instagram}
                  </a>
                </div>
              )}
              {brandConfig.social.facebook && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Facebook</div>
                  <a href={brandConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                    {brandConfig.social.facebook}
                  </a>
                </div>
              )}
              {brandConfig.social.twitter && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Twitter</div>
                  <a href={brandConfig.social.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                    {brandConfig.social.twitter}
                  </a>
                </div>
              )}
              {brandConfig.social.linkedin && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">LinkedIn</div>
                  <a href={brandConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                    {brandConfig.social.linkedin}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Configuration File Location */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Configuration File</h3>
          <p className="text-sm text-blue-700 mb-4">
            To customize your brand, edit the <code className="bg-blue-100 px-2 py-1 rounded">brand.config.ts</code> file in the root of your project.
          </p>
          <p className="text-sm text-blue-700">
            Place brand assets (logo, favicon, etc.) in the <code className="bg-blue-100 px-2 py-1 rounded">/public/brand/</code> folder.
          </p>
        </div>
      </div>
    </div>
  )
}

