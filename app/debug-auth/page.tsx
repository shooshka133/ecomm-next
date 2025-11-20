'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'

export default function DebugAuthPage() {
  const { user, loading: authLoading } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createSupabaseClient()
        
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        // Get user
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        
        setSessionInfo({
          session: session ? {
            user_id: session.user.id,
            email: session.user.email,
            expires_at: new Date(session.expires_at! * 1000).toLocaleString(),
            access_token: session.access_token.substring(0, 20) + '...',
          } : null,
          user: currentUser ? {
            id: currentUser.id,
            email: currentUser.email,
            providers: currentUser.app_metadata?.providers || [],
          } : null,
          sessionError: sessionError?.message,
          userError: userError?.message,
          cookies: document.cookie,
        })
      } catch (err: any) {
        setSessionInfo({ error: err.message })
      } finally {
        setLoading(false)
      }
    }
    
    checkSession()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Information</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">AuthProvider State</h2>
          <pre className="text-sm">{JSON.stringify({ 
            user: user ? { id: user.id, email: user.email } : null, 
            loading: authLoading 
          }, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Supabase Session</h2>
          <pre className="text-sm">{JSON.stringify(sessionInfo, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Cookies</h2>
          <pre className="text-sm text-xs break-all">{document.cookie || 'No cookies'}</pre>
        </div>
      </div>
    </div>
  )
}

