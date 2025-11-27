'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useBrandSupabaseClient } from '@/lib/supabase/brand-client'

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
  const supabase = useBrandSupabaseClient()

  useEffect(() => {
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

