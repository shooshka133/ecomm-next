'use client'

import { createSupabaseClient } from '@/lib/supabase/client'
import { WishlistItem } from '@/types'

/**
 * Add an item to the wishlist
 * Gets user_id from current session - does not modify OAuth/auth code
 */
export async function addToWishlist(
  itemId: string,
  itemName: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseClient()

  try {
    // Get current session to retrieve user_id - no OAuth code modification
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return { success: false, error: 'You must be logged in to add items to wishlist' }
    }

    const userId = session.user.id

    const { error: insertError } = await supabase
      .from('wishlists')
      .insert({
        user_id: userId,
        item_id: itemId,
        item_name: itemName,
      })

    if (insertError) {
      // If it's a duplicate, that's okay - item is already in wishlist
      if (insertError.code === '23505') {
        return { success: true }
      }
      throw insertError
    }

    return { success: true }
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to add item to wishlist'
    if (process.env.NODE_ENV === 'development') {
      console.error('Error adding to wishlist:', error)
    }
    return { success: false, error: errorMessage }
  }
}

/**
 * Remove an item from the wishlist
 * Gets user_id from current session - does not modify OAuth/auth code
 */
export async function removeFromWishlist(
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseClient()

  try {
    // Get current session to retrieve user_id - no OAuth code modification
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return { success: false, error: 'You must be logged in to remove items from wishlist' }
    }

    const userId = session.user.id

    const { error: deleteError } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)

    if (deleteError) {
      throw deleteError
    }

    return { success: true }
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to remove item from wishlist'
    if (process.env.NODE_ENV === 'development') {
      console.error('Error removing from wishlist:', error)
    }
    return { success: false, error: errorMessage }
  }
}

/**
 * Get all wishlist items for the current user
 * Gets user_id from current session - does not modify OAuth/auth code
 */
export async function getWishlistItems(): Promise<{
  success: boolean
  items?: WishlistItem[]
  error?: string
}> {
  const supabase = createSupabaseClient()

  try {
    // Get current session to retrieve user_id - no OAuth code modification
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return { success: false, error: 'You must be logged in to view wishlist' }
    }

    const userId = session.user.id

    const { data, error: fetchError } = await supabase
      .from('wishlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      throw fetchError
    }

    return { success: true, items: data || [] }
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to load wishlist'
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching wishlist:', error)
    }
    return { success: false, error: errorMessage }
  }
}

