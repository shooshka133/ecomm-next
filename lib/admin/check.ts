import { createClient } from '@supabase/supabase-js'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Check if a user is an admin (server-side)
 * Uses the user_profiles table to check is_admin flag
 */
export async function isAdmin(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false

  try {
    // Use service role key to bypass RLS and check admin status
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      // If profile doesn't exist, check if user email is in admin list (fallback)
      return checkAdminEmailFallback(userId)
    }

    return profile.is_admin === true
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Fallback: Check if user email is in admin emails list from environment variable
 * Format: ADMIN_EMAILS=admin1@example.com,admin2@example.com
 */
async function checkAdminEmailFallback(userId: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []
  
  if (adminEmails.length === 0) {
    return false
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
    const userEmail = authUser?.user?.email?.toLowerCase()

    return userEmail ? adminEmails.includes(userEmail) : false
  } catch (error) {
    console.error('Error checking admin email fallback:', error)
    return false
  }
}

/**
 * Get current user's admin status (server-side with cookies)
 */
export async function getCurrentUserAdminStatus(): Promise<boolean> {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    return await isAdmin(user.id)
  } catch (error) {
    console.error('Error getting current user admin status:', error)
    return false
  }
}

