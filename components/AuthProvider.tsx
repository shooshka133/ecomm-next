'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase/client'

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

  useEffect(() => {
    // Get Supabase client inside useEffect to ensure it's only created once
    const supabase = createSupabaseClient()
    
    // Get initial session
    const initializeSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
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
  }, [])

  const signOut = async () => {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

