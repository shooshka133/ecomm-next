'use client'

/**
 * Admin Brand Settings Page
 * 
 * Allows admins to manage brands (create, edit, preview, activate, import/export).
 * Admin-only access enforced server-side.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Settings,
  Image as ImageIcon,
  Palette,
  Type,
  Globe,
} from 'lucide-react'
import Link from 'next/link'
import BrandEditor from '@/components/admin/BrandEditor'
import BrandPreview from '@/components/admin/BrandPreview'

interface Brand {
  id?: string
  slug: string
  name: string
  is_active: boolean
  config: any
  asset_urls?: {
    logo?: string
    favicon?: string
    appleIcon?: string
    ogImage?: string
  }
  created_at?: string
  updated_at?: string
}

export default function BrandSettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [previewingBrand, setPreviewingBrand] = useState<Brand | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/auth?next=/admin/brand-settings')
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
            setError('Access Denied: Admin privileges required')
            return
          }
          // Load brands
          await loadBrands()
        } else {
          setIsAdmin(false)
          setError('Failed to verify admin status')
        }
      } catch (error) {
        setIsAdmin(false)
        setError('Error checking admin status')
      }
    }

    checkAdmin()
  }, [user, authLoading, router])

  const loadBrands = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/brands')
      if (response.ok) {
        const data = await response.json()
        setBrands(data.brands || [])
      } else {
        setError('Failed to load brands')
      }
    } catch (error) {
      setError('Error loading brands')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingBrand(null)
    setShowCreateModal(true)
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setShowCreateModal(true)
  }

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Are you sure you want to delete "${brand.name}"? This action cannot be undone.`)) {
      return
    }

    if (brand.is_active) {
      alert('Cannot delete active brand. Please activate another brand first.')
      return
    }

    try {
      const response = await fetch(`/api/admin/brands/${brand.id || brand.slug}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadBrands()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete brand')
      }
    } catch (error) {
      alert('Error deleting brand')
    }
  }

  const handleActivate = async (brand: Brand) => {
    if (!confirm(`Activate "${brand.name}"? This will immediately change the site's appearance.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/brands/${brand.id || brand.slug}/activate`, {
        method: 'POST',
      })

      if (response.ok) {
        await loadBrands()
        alert('Brand activated successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to activate brand')
      }
    } catch (error) {
      alert('Error activating brand')
    }
  }

  const handleExport = (brand: Brand) => {
    const exportData = {
      slug: brand.slug,
      name: brand.name,
      config: brand.config,
      asset_urls: brand.asset_urls,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${brand.slug}-brand.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const importData = JSON.parse(text)

        // Open editor with imported data
        setEditingBrand({
          slug: importData.slug || `imported-${Date.now()}`,
          name: importData.name || 'Imported Brand',
          is_active: false,
          config: importData.config || {},
          asset_urls: importData.asset_urls || {},
        })
        setShowCreateModal(true)
      } catch (error) {
        alert('Invalid JSON file')
      }
    }
    input.click()
  }

  const handleSave = async () => {
    await loadBrands()
    setShowCreateModal(false)
    setEditingBrand(null)
  }

  if (authLoading || isAdmin === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Admin privileges required to access this page.</p>
          <Link href="/admin" className="text-indigo-600 hover:underline">
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Management</h1>
              <p className="text-gray-600">Manage your store brands and customize appearance</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Brand
              </button>
            </div>
          </div>

          {/* Help Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Brand changes affect site appearance only. They do not modify checkout, authentication, webhook, or order processing logic.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Brands List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <div
              key={brand.id || brand.slug}
              className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
                brand.is_active ? 'border-indigo-500' : 'border-gray-200'
              }`}
            >
              {/* Active Badge */}
              {brand.is_active && (
                <div className="flex items-center gap-2 mb-4 text-indigo-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-semibold">Active</span>
                </div>
              )}

              {/* Logo Preview */}
              <div className="mb-4">
                {brand.asset_urls?.logo ? (
                  <img
                    src={brand.asset_urls.logo}
                    alt={brand.name}
                    className="w-20 h-20 object-contain rounded-lg border border-gray-200"
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

              {/* Brand Info */}
              <h3 className="text-xl font-bold text-gray-900 mb-1">{brand.name}</h3>
              <p className="text-sm text-gray-500 mb-4">Slug: {brand.slug}</p>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPreviewingBrand(brand)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => handleEdit(brand)}
                  className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                {!brand.is_active && (
                  <button
                    onClick={() => handleActivate(brand)}
                    className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Activate
                  </button>
                )}
                <button
                  onClick={() => handleExport(brand)}
                  className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                {!brand.is_active && (
                  <button
                    onClick={() => handleDelete(brand)}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {brands.length === 0 && !loading && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No brands yet</h3>
            <p className="text-gray-600 mb-6">Create your first brand to get started</p>
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Create Brand
            </button>
          </div>
        )}

        {/* Back to Admin */}
        <div className="mt-8">
          <Link
            href="/admin"
            className="text-indigo-600 hover:underline flex items-center gap-2"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <BrandEditor
          brand={editingBrand}
          onSave={handleSave}
          onClose={() => {
            setShowCreateModal(false)
            setEditingBrand(null)
          }}
        />
      )}

      {/* Preview Modal */}
      {previewingBrand && (
        <BrandPreview
          brand={previewingBrand}
          onClose={() => setPreviewingBrand(null)}
        />
      )}
    </div>
  )
}

