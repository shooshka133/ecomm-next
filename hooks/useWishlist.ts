'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { WishlistItem } from '@/types'

interface UseWishlistReturn {
  items: WishlistItem[]
  loading: boolean
  error: string | null
  addToWishlist: (itemId: string, itemName: string) => Promise<boolean>
  removeFromWishlist: (itemId: string) => Promise<boolean>
  isInWishlist: (itemId: string) => boolean
  refresh: () => Promise<void>
}

export function useWishlist(userEmail: string | null): UseWishlistReturn {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseClient()

  const fetchWishlistItems = useCallback(async () => {
    if (!userEmail) {
      setItems([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setItems(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load wishlist')
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching wishlist:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [userEmail, supabase])

  useEffect(() => {
    fetchWishlistItems()
  }, [fetchWishlistItems])

  const addToWishlist = useCallback(
    async (itemId: string, itemName: string): Promise<boolean> => {
      if (!userEmail) {
        setError('You must be logged in to add items to wishlist')
        return false
      }

      try {
        setError(null)

        const { error: insertError } = await supabase
          .from('wishlists')
          .insert({
            user_email: userEmail,
            item_id: itemId,
            item_name: itemName,
          })

        if (insertError) {
          if (insertError.code === '23505') return true // already exists
          throw insertError
        }

        await fetchWishlistItems()
        return true
      } catch (err: any) {
        setError(err.message || 'Failed to add to wishlist')
        if (process.env.NODE_ENV === 'development') {
          console.error('Error adding to wishlist:', err)
        }
        return false
      }
    },
    [userEmail, supabase, fetchWishlistItems]
  )

  const removeFromWishlist = useCallback(
    async (itemId: string): Promise<boolean> => {
      if (!userEmail) {
        setError('You must be logged in to remove items from wishlist')
        return false
      }

      try {
        setError(null)

        const { error: deleteError } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_email', userEmail)
          .eq('item_id', itemId)

        if (deleteError) throw deleteError

        await fetchWishlistItems()
        return true
      } catch (err: any) {
        setError(err.message || 'Failed to remove from wishlist')
        if (process.env.NODE_ENV === 'development') {
          console.error('Error removing from wishlist:', err)
        }
        return false
      }
    },
    [userEmail, supabase, fetchWishlistItems]
  )

  const isInWishlist = useCallback(
    (itemId: string): boolean => items.some(item => item.item_id === itemId),
    [items]
  )

  return {
    items,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refresh: fetchWishlistItems,
  }
}
