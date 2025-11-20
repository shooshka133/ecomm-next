/**
 * React Hook for Google OAuth Authentication
 * Provides a convenient hook interface for Google sign-in
 */

import { useState, useCallback } from 'react'
import { signInWithGoogle, GoogleOAuthOptions } from '@/lib/auth/googleOAuth'

export interface UseGoogleAuthReturn {
  signIn: (options?: GoogleOAuthOptions) => Promise<void>
  loading: boolean
  error: string | null
}

/**
 * Hook for Google OAuth authentication
 * @returns Object with signIn function, loading state, and error state
 */
export function useGoogleAuth(): UseGoogleAuthReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = useCallback(async (options: GoogleOAuthOptions = {}) => {
    setLoading(true)
    setError(null)

    try {
      const result = await signInWithGoogle({
        ...options,
        onError: (errorMessage) => {
          setError(errorMessage)
          if (options.onError) {
            options.onError(errorMessage)
          }
        },
        onSuccess: () => {
          setError(null)
          if (options.onSuccess) {
            options.onSuccess()
          }
        },
      })

      if (!result.success && result.error) {
        setError(result.error)
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      if (options.onError) {
        options.onError(errorMessage)
      }
    } finally {
      // Don't set loading to false immediately since redirect will happen
      // The component will unmount when redirect occurs
    }
  }, [])

  return {
    signIn,
    loading,
    error,
  }
}


