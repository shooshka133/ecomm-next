'use client'

import { useWishlist } from '@/hooks/useWishlist'
import { useAuth } from '@/components/AuthProvider'
import { Heart } from 'lucide-react'

export default function Wishlist() {
  const { user, loading: authLoading } = useAuth()
  const { items, loading, error, removeFromWishlist } = useWishlist(user?.email ?? null)

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center text-gray-500 p-8">
        <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>Please sign in to view your wishlist.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return <p className="text-red-500 text-center py-4">Error: {error}</p>
  }

  if (!items.length) {
    return (
      <div className="text-center text-gray-500 p-8">
        <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>Your wishlist is empty.</p>
      </div>
    )
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => (
        <div key={item.item_id} className="border rounded-lg shadow p-4 flex flex-col gap-3">
          {item.products?.image_url && (
            <img
              src={item.products.image_url}
              alt={item.item_name}
              className="w-full h-48 object-cover rounded"
            />
          )}

          <h3 className="font-semibold text-lg">{item.item_name}</h3>

          <button
            onClick={() => removeFromWishlist(item.item_id)}
            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Remove from wishlist
          </button>
        </div>
      ))}
    </div>
  )
}
