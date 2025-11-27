'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase/brand-client'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)

  // Initialize Supabase client only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Read brand config from server-injected JSON
        let brandConfig: any = null
        try {
          const configScript = document.getElementById('__BRAND_CONFIG__')
          if (configScript && configScript.textContent) {
            brandConfig = JSON.parse(configScript.textContent)
          }
        } catch (error) {
          console.warn('Failed to read brand config for AuthProvider:', error)
        }
        
        // Create brand-aware Supabase client
        const client = createSupabaseClient(brandConfig?.slug || null, brandConfig)
        setSupabase(client)
      } catch (error) {
        console.error('Error initializing Supabase client:', error)
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      // Wait for Supabase client to be initialized
      return
    }

    // Get initial session
    const initializeSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('Error initializing auth session:', error)
        setLoading(false)
      }
    }
    
    initializeSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Log auth events in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth state changed:', event, session?.user?.email)
      }
      
      setUser(session?.user ?? null)
      setLoading(false)
      
      // If session was just set (e.g., after OAuth), refresh to ensure consistency
      if (event === 'SIGNED_IN' && session) {
        // Small delay to ensure cookies are fully set
        setTimeout(async () => {
          const { data: { session: refreshedSession } } = await supabase.auth.getSession()
          if (refreshedSession) {
            setUser(refreshedSession.user)
          }
        }, 100)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    if (!supabase) return
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

