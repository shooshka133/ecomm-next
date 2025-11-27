'use client'

/**
 * Brand Editor Component
 * 
 * Modal for creating/editing brand configurations.
 * Includes form fields for all brand properties and asset uploads.
 */

import { useState, useEffect } from 'react'
import { X, Upload, Image as ImageIcon, Save, Eye } from 'lucide-react'
import { brand as defaultBrandConfig } from '@/brand.config'

interface BrandEditorProps {
  brand?: any | null
  onSave: () => void
  onClose: () => void
}

export default function BrandEditor({ brand: initialBrand, onSave, onClose }: BrandEditorProps) {
  const [brand, setBrand] = useState<any>(initialBrand || {
    slug: '',
    name: '',
    is_active: false,
    config: { ...defaultBrandConfig },
    asset_urls: {},
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialBrand) {
      setBrand(initialBrand)
    }
  }, [initialBrand])

  const handleConfigChange = (path: string, value: any) => {
    const keys = path.split('.')
    setBrand((prev: any) => {
      const newBrand = { ...prev }
      let current = newBrand.config
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newBrand
    })
  }

  const handleAssetUpload = async (type: string, file: File) => {
    // Check if brand has required fields for upload
    if (!brand.slug) {
      alert('Please enter a slug first before uploading assets. The slug is required to identify the brand.')
      return
    }

    // For new brands, they need to be saved first
    if (!brand.id) {
      const shouldSave = confirm('Brand must be saved before uploading assets. Would you like to save the brand now?')
      if (!shouldSave) {
        return
      }
      
      // Save the brand first - we'll handle this by calling handleSave
      // But we need to wait for it to complete and get the brand ID
      // For now, show a message to save first
      alert('Please click "Save" button first to create the brand, then you can upload assets.')
      return
    }

    setUploading(type)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const brandId = brand.id || brand.slug
      const response = await fetch(`/api/admin/brands/${brandId}/upload-asset`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setBrand((prev: any) => ({
          ...prev,
          asset_urls: {
            ...prev.asset_urls,
            [type]: data.assetUrl,
          },
        }))
        alert('Asset uploaded successfully!')
      } else {
        const error = await response.json()
        const errorMessage = error.error || 'Failed to upload asset'
        alert(`Error: ${errorMessage}\n\nMake sure the brand is saved first.`)
      }
    } catch (error) {
      alert('Error uploading asset. Please make sure the brand is saved first.')
    } finally {
      setUploading(null)
    }
  }

  const handleSave = async () => {
    // Validate
    const newErrors: Record<string, string> = {}
    if (!brand.slug) newErrors.slug = 'Slug is required'
    if (!brand.name) newErrors.name = 'Name is required'
    if (!brand.config) newErrors.config = 'Config is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      const url = brand.id
        ? `/api/admin/brands/${brand.id}`
        : '/api/admin/brands'
      
      const method = brand.id ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: brand.slug,
          name: brand.name,
          config: brand.config,
          is_active: brand.is_active,
          asset_urls: brand.asset_urls,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update brand with the saved data (including ID if it's a new brand)
        if (data.brand) {
          setBrand(data.brand)
        }
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save brand')
      }
    } catch (error) {
      alert('Error saving brand')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {brand.id ? 'Edit Brand' : 'Create Brand'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={brand.slug}
                onChange={(e) => setBrand({ ...brand, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="my-brand"
              />
              {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={brand.name}
                onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="My Brand Name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* Assets */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Brand Assets</h3>
            
            {(['logo', 'favicon', 'appleIcon', 'ogImage'] as const).map((type) => (
              <div key={type} className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {type === 'appleIcon' ? 'Apple Icon' : type === 'ogImage' ? 'OG Image' : type}
                  </label>
                  {brand.asset_urls?.[type] ? (
                    <img
                      src={brand.asset_urls[type]}
                      alt={type}
                      className="w-20 h-20 object-contain border border-gray-200 rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/icon.svg'
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {uploading === type ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleAssetUpload(type, file)
                      }}
                      disabled={uploading === type}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Colors */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Colors</h3>
            
            {(['primary', 'accent', 'secondary', 'background', 'text'] as const).map((colorKey) => (
              <div key={colorKey}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {colorKey} Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brand.config?.colors?.[colorKey] || '#000000'}
                    onChange={(e) => handleConfigChange(`colors.${colorKey}`, e.target.value)}
                    className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brand.config?.colors?.[colorKey] || ''}
                    onChange={(e) => handleConfigChange(`colors.${colorKey}`, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Typography */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Typography</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Font
              </label>
              <input
                type="text"
                value={brand.config?.fontFamily?.primary || ''}
                onChange={(e) => handleConfigChange('fontFamily.primary', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Inter, sans-serif"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heading Font
              </label>
              <input
                type="text"
                value={brand.config?.fontFamily?.heading || ''}
                onChange={(e) => handleConfigChange('fontFamily.heading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Poppins, sans-serif"
              />
            </div>
          </div>

          {/* Hero Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Hero Section</h3>
            
            {(['title', 'subtitle', 'ctaText', 'badge'] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field === 'ctaText' ? 'CTA Text' : field}
                </label>
                {field === 'subtitle' ? (
                  <textarea
                    value={brand.config?.hero?.[field] || ''}
                    onChange={(e) => handleConfigChange(`hero.${field}`, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    placeholder={`Enter ${field}...`}
                  />
                ) : (
                  <input
                    type="text"
                    value={brand.config?.hero?.[field] || ''}
                    onChange={(e) => handleConfigChange(`hero.${field}`, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={`Enter ${field}...`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* SEO */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">SEO</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={brand.config?.seo?.title || ''}
                onChange={(e) => handleConfigChange('seo.title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Store Name - Description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={brand.config?.seo?.description || ''}
                onChange={(e) => handleConfigChange('seo.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="Meta description..."
              />
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={brand.config?.contactEmail || ''}
                onChange={(e) => handleConfigChange('contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="support@example.com"
              />
            </div>
          </div>

          {/* Supabase Configuration */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Supabase Configuration</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Optional</span>
            </div>
            <p className="text-sm text-gray-600">
              Configure a separate Supabase project for this brand. If not set, the brand will use the main Supabase project.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supabase URL
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="url"
                value={brand.config?.supabase?.url || ''}
                onChange={(e) => handleConfigChange('supabase.url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://xxxxx.supabase.co"
                pattern="https://.*\.supabase\.co"
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be a valid Supabase project URL (https://xxxxx.supabase.co)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supabase Anon Key
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={brand.config?.supabase?.anonKey || ''}
                onChange={(e) => handleConfigChange('supabase.anonKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                pattern="^eyJ.*"
              />
              <p className="mt-1 text-xs text-gray-500">
                Public anon key from your Supabase project settings (starts with &quot;eyJ&quot;)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Environment Prefix (Optional)
              </label>
              <input
                type="text"
                value={brand.config?.supabase?.envPrefix || ''}
                onChange={(e) => {
                  // Only allow uppercase letters and underscores
                  const value = e.target.value.toUpperCase().replace(/[^A-Z_]/g, '')
                  handleConfigChange('supabase.envPrefix', value)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                placeholder="GROCERY"
                pattern="^[A-Z_]+$"
              />
              <p className="mt-1 text-xs text-gray-500">
                Used for environment variable fallback (e.g., NEXT_PUBLIC_SUPABASE_URL_GROCERY). Only letters A-Z and underscores.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Only use <strong>anon/public keys</strong> here. Never store service role keys in brand configuration.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

