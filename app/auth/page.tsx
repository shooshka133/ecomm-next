'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { signInWithGoogle } from '@/lib/auth/google'
import { Mail, Lock, ArrowRight, KeyRound } from 'lucide-react'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('error')
  const [errors, setErrors] = useState<{email?: string; password?: string; confirmPassword?: string}>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseClient()

  // Auto-retry OAuth if PKCE error occurred (incognito mode fix)
  // Completely silent - no error message shown, just automatically retry
  useEffect(() => {
    const oauthRetry = searchParams.get('oauth_retry')
    const provider = searchParams.get('provider')
    const next = searchParams.get('next') || '/'
    
    if (oauthRetry === 'true' && provider === 'google') {
      console.log('🔄 [Auth] Auto-retrying Google OAuth due to PKCE error (incognito mode) - silent retry')
      setGoogleLoading(true)
      // Don't show any error message - make it completely seamless
      
      // Small delay to ensure component is fully mounted and state is ready
      const retryTimer = setTimeout(() => {
        // Automatically trigger Google OAuth with fresh state
        signInWithGoogle({
          redirectTo: next,
          onError: (error) => {
            // Only show error if retry also fails
            console.error('❌ [Auth] Auto-retry OAuth failed:', error)
            setMessageType('error')
            setMessage('Sign-in failed. Please try again.')
            setGoogleLoading(false)
          },
          onSuccess: () => {
            console.log('✅ [Auth] Auto-retry OAuth initiated successfully - redirecting...')
            // Loading state will be maintained until redirect happens
            // User will see loading spinner, then redirect to Google
          },
        }).catch((err) => {
          console.error('❌ [Auth] Auto-retry OAuth exception:', err)
          setMessageType('error')
          setMessage('Sign-in failed. Please try again.')
          setGoogleLoading(false)
        })
      }, 300) // Small delay to ensure state is set
      
      return () => clearTimeout(retryTimer)
    }
  }, [searchParams])

  // Check for error from callback
  // Don't show errors during auto-retry (incognito mode fix)
  useEffect(() => {
    const error = searchParams.get('error')
    const oauthRetry = searchParams.get('oauth_retry')
    
    // Don't show error if we're auto-retrying (silent retry)
    if (error && oauthRetry !== 'true') {
      setMessageType('error')
      setMessage(decodeURIComponent(error))
    } else if (error && oauthRetry === 'true') {
      // Silently ignore error during auto-retry - we'll retry automatically
      console.log('🔄 [Auth] PKCE error detected, auto-retrying silently...')
    }
  }, [searchParams])

  // Check if user is already signed in (in case callback redirected but page didn't refresh)
  useEffect(() => {
    const checkSession = async () => {
      // Small delay to ensure cookies are set after OAuth callback
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/')
        router.refresh()
      }
    }
    
    // Only check if we're not in the middle of an OAuth flow
    const code = searchParams.get('code')
    const oauthRetry = searchParams.get('oauth_retry')
    
    if (!code && !oauthRetry) {
      checkSession()
    }
  }, [supabase, router, searchParams])

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate password strength
  const validatePassword = (password: string): boolean => {
    return password.length >= 6
  }

  // Validate form
  const validateForm = async (): Promise<boolean> => {
    const newErrors: {email?: string; password?: string; confirmPassword?: string} = {}

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    // Validate confirm password (only for sign up)
    if (isSignUp) {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setErrors({})

    // Validate form
    const isValid = await validateForm()
    if (!isValid) {
      return
    }

    setLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) {
          setMessageType('error')
          // Check if email already exists
          if (error.message.includes('already registered') || 
              error.message.includes('User already registered') ||
              error.message.includes('already exists')) {
            setErrors({ email: 'An account with this email already exists. Please sign in instead.' })
            throw new Error('An account with this email already exists. Please sign in instead.')
          }
          throw error
        }
        
        // Check if email confirmation is required
        if (data.user && !data.session) {
          setMessageType('success')
          setMessage('Check your email to confirm your account! After confirmation, you can sign in.')
        } else if (data.session) {
          // Auto-confirmed, redirect immediately
          router.push('/')
          router.refresh()
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          setMessageType('error')
          // More helpful error messages
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials. If you just signed up, make sure you confirmed your email first.')
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('Please check your email and confirm your account before signing in.')
          }
          throw error
        }
        if (data.session) {
          router.push('/')
          router.refresh()
        }
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Get the correct redirect URL - use production URL if available, otherwise use current origin
      const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectUrl}/auth/reset-password`,
      })

      if (error) {
        setMessageType('error')
        throw error
      }

      setMessageType('success')
      setMessage('Check your email for a password reset link!')
      setShowForgotPassword(false)
    } catch (error: any) {
      setMessage(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setGoogleLoading(true)
    setMessage('')
    setMessageType('error')
    
    try {
      // You can change '/' to any page you want to redirect to after sign-in
      // Examples: '/profile', '/dashboard', '/account', etc.
      const result = await signInWithGoogle({
        redirectTo: '/', // Change this to your desired redirect page
        onError: (error) => {
          setMessageType('error')
          setMessage(error)
          setGoogleLoading(false)
        },
        onSuccess: () => {
          // Redirect happens automatically
          console.log('✅ Google OAuth initiated successfully')
        },
      })

      if (!result.success) {
        setMessageType('error')
        setMessage(result.error || 'An error occurred with Google sign-in')
        setGoogleLoading(false)
      }
    } catch (error: any) {
      setMessageType('error')
      setMessage(error.message || 'An error occurred with Google sign-in')
      setGoogleLoading(false)
    }
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Reset Password
              </h2>
              <p className="text-gray-600">
                Enter your email and we&apos;ll send you a password reset link.
              </p>
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg ${
                  messageType === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}
              >
                <p className="text-sm">{message}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleForgotPassword}>
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false)
                  setMessage('')
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Sign up to start shopping' 
                : 'Sign in to continue shopping'}
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                messageType === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}
            >
              <p className="text-sm">{message}</p>
            </div>
          )}

          {/* Email/Password Form */}
          <form className="space-y-4" onSubmit={handleEmailAuth}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors({...errors, email: undefined})
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors({...errors, password: undefined})
                    if (errors.confirmPassword && confirmPassword) {
                      setErrors({...errors, confirmPassword: password === e.target.value ? undefined : 'Passwords do not match'})
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password - Only for Sign Up */}
            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (errors.confirmPassword) {
                        setErrors({...errors, confirmPassword: password === e.target.value ? undefined : 'Passwords do not match'})
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In with Email'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Auth Button */}
          <div>
            <button
              onClick={handleGoogleAuth}
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {googleLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Toggle Sign Up/Sign In */}
          <div className="text-center pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage('')
                setErrors({})
                setPassword('')
                setConfirmPassword('')
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}








// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { createSupabaseClient } from '@/lib/supabase/client'
// import { signInWithGoogle } from '@/lib/auth/google'
// import { Mail, Lock, ArrowRight, KeyRound } from 'lucide-react'

// export default function AuthPage() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [confirmPassword, setConfirmPassword] = useState('')
//   const [isSignUp, setIsSignUp] = useState(false)
//   const [showForgotPassword, setShowForgotPassword] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [googleLoading, setGoogleLoading] = useState(false)
//   const [message, setMessage] = useState('')
//   const [messageType, setMessageType] = useState<'success' | 'error'>('error')
//   const [errors, setErrors] = useState<{email?: string; password?: string; confirmPassword?: string}>({})
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const supabase = createSupabaseClient()

//   // Check for error from callback
//   useEffect(() => {
//     const error = searchParams.get('error')
//     if (error) {
//       setMessageType('error')
//       setMessage(decodeURIComponent(error))
//     }
//   }, [searchParams])

//   // Check if user is already signed in (in case callback redirected but page didn't refresh)
//   useEffect(() => {
//     const checkSession = async () => {
//       // Small delay to ensure cookies are set after OAuth callback
//       await new Promise(resolve => setTimeout(resolve, 100))
      
//       const { data: { session } } = await supabase.auth.getSession()
//       if (session) {
//         router.replace('/')
//         router.refresh()
//       }
//     }
    
//     // Only check if we're not in the middle of an OAuth flow
//     const code = searchParams.get('code')
//     if (!code) {
//       checkSession()
//     }
//   }, [supabase, router, searchParams])

//   // Validate email format
//   const validateEmail = (email: string): boolean => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     return emailRegex.test(email)
//   }

//   // Validate password strength
//   const validatePassword = (password: string): boolean => {
//     return password.length >= 6
//   }

//   // Validate form
//   const validateForm = async (): Promise<boolean> => {
//     const newErrors: {email?: string; password?: string; confirmPassword?: string} = {}

//     // Validate email
//     if (!email.trim()) {
//       newErrors.email = 'Email is required'
//     } else if (!validateEmail(email)) {
//       newErrors.email = 'Please enter a valid email address'
//     }

//     // Validate password
//     if (!password) {
//       newErrors.password = 'Password is required'
//     } else if (!validatePassword(password)) {
//       newErrors.password = 'Password must be at least 6 characters long'
//     }

//     // Validate confirm password (only for sign up)
//     if (isSignUp) {
//       if (!confirmPassword) {
//         newErrors.confirmPassword = 'Please confirm your password'
//       } else if (password !== confirmPassword) {
//         newErrors.confirmPassword = 'Passwords do not match'
//       }
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleEmailAuth = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setMessage('')
//     setErrors({})

//     // Validate form
//     const isValid = await validateForm()
//     if (!isValid) {
//       return
//     }

//     setLoading(true)

//     try {
//       if (isSignUp) {
//         const { data, error } = await supabase.auth.signUp({
//           email,
//           password,
//           options: {
//             emailRedirectTo: `${window.location.origin}/auth/callback`,
//           },
//         })
//         if (error) {
//           setMessageType('error')
//           // Check if email already exists
//           if (error.message.includes('already registered') || 
//               error.message.includes('User already registered') ||
//               error.message.includes('already exists')) {
//             setErrors({ email: 'An account with this email already exists. Please sign in instead.' })
//             throw new Error('An account with this email already exists. Please sign in instead.')
//           }
//           throw error
//         }
        
//         // Check if email confirmation is required
//         if (data.user && !data.session) {
//           setMessageType('success')
//           setMessage('Check your email to confirm your account! After confirmation, you can sign in.')
//         } else if (data.session) {
//           // Auto-confirmed, redirect immediately
//           router.push('/')
//           router.refresh()
//         }
//       } else {
//         const { data, error } = await supabase.auth.signInWithPassword({
//           email,
//           password,
//         })
//         if (error) {
//           setMessageType('error')
//           // More helpful error messages
//           if (error.message.includes('Invalid login credentials')) {
//             throw new Error('Invalid email or password. Please check your credentials. If you just signed up, make sure you confirmed your email first.')
//           } else if (error.message.includes('Email not confirmed')) {
//             throw new Error('Please check your email and confirm your account before signing in.')
//           }
//           throw error
//         }
//         if (data.session) {
//           router.push('/')
//           router.refresh()
//         }
//       }
//     } catch (error: any) {
//       setMessage(error.message || 'An error occurred')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleForgotPassword = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     setMessage('')

//     try {
//       // Get the correct redirect URL - use production URL if available, otherwise use current origin
//       const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
//       const { error } = await supabase.auth.resetPasswordForEmail(email, {
//         redirectTo: `${redirectUrl}/auth/reset-password`,
//       })

//       if (error) {
//         setMessageType('error')
//         throw error
//       }

//       setMessageType('success')
//       setMessage('Check your email for a password reset link!')
//       setShowForgotPassword(false)
//     } catch (error: any) {
//       setMessage(error.message || 'An error occurred')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleGoogleAuth = async () => {
//     setGoogleLoading(true)
//     setMessage('')
//     setMessageType('error')
    
//     try {
//       const result = await signInWithGoogle({
//         redirectTo: '/',
//         onError: (error) => {
//           setMessageType('error')
//           setMessage(error)
//           setGoogleLoading(false)
//         },
//         onSuccess: () => {
//           // Loading state will be maintained until redirect happens
//           // The redirect happens automatically in signInWithGoogle
//         },
//       })

//       if (!result.success) {
//         setMessageType('error')
//         setMessage(result.error || 'An error occurred with Google sign-in')
//         setGoogleLoading(false)
//       }
//       // If successful, the redirect happens automatically in signInWithGoogle
//       // so we don't need to do anything else here
//     } catch (error: any) {
//       setMessageType('error')
//       setMessage(error.message || 'An error occurred with Google sign-in')
//       setGoogleLoading(false)
//     }
//   }

//   if (showForgotPassword) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full">
//           <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
//             <div className="text-center">
//               <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <KeyRound className="w-8 h-8 text-white" />
//               </div>
//               <h2 className="text-3xl font-bold text-gray-900 mb-2">
//                 Reset Password
//               </h2>
//               <p className="text-gray-600">
//                 Enter your email and we&apos;ll send you a password reset link.
//               </p>
//             </div>

//             {message && (
//               <div
//                 className={`p-4 rounded-lg ${
//                   messageType === 'error'
//                     ? 'bg-red-50 text-red-700 border border-red-200'
//                     : 'bg-green-50 text-green-700 border border-green-200'
//                 }`}
//               >
//                 <p className="text-sm">{message}</p>
//               </div>
//             )}

//             <form className="space-y-4" onSubmit={handleForgotPassword}>
//               <div>
//                 <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     id="reset-email"
//                     name="email"
//                     type="email"
//                     autoComplete="email"
//                     required
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
//                     placeholder="you@example.com"
//                   />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
//               >
//                 {loading ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     <span>Sending...</span>
//                   </>
//                 ) : (
//                   <>
//                     <span>Send Reset Link</span>
//                     <ArrowRight className="w-5 h-5" />
//                   </>
//                 )}
//               </button>
//             </form>

//             <div className="text-center pt-4 border-t border-gray-200">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowForgotPassword(false)
//                   setMessage('')
//                 }}
//                 className="text-sm text-blue-600 hover:text-blue-700 font-medium"
//               >
//                 Back to Sign In
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full">
//         <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
//           {/* Header */}
//           <div className="text-center">
//             <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
//               <span className="text-white font-bold text-2xl">E</span>
//             </div>
//             <h2 className="text-3xl font-bold text-gray-900 mb-2">
//               {isSignUp ? 'Create Account' : 'Welcome Back'}
//             </h2>
//             <p className="text-gray-600">
//               {isSignUp 
//                 ? 'Sign up to start shopping' 
//                 : 'Sign in to continue shopping'}
//             </p>
//           </div>

//           {/* Message */}
//           {message && (
//             <div
//               className={`p-4 rounded-lg ${
//                 messageType === 'error'
//                   ? 'bg-red-50 text-red-700 border border-red-200'
//                   : 'bg-green-50 text-green-700 border border-green-200'
//               }`}
//             >
//               <p className="text-sm">{message}</p>
//             </div>
//           )}

//           {/* Email/Password Form - Moved to top */}
//           <form className="space-y-4" onSubmit={handleEmailAuth}>
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   value={email}
//                   onChange={(e) => {
//                     setEmail(e.target.value)
//                     if (errors.email) setErrors({...errors, email: undefined})
//                   }}
//                   className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
//                     errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
//                   }`}
//                   placeholder="you@example.com"
//                 />
//               </div>
//               {errors.email && (
//                 <p className="mt-1 text-sm text-red-600">{errors.email}</p>
//               )}
//             </div>

//             <div>
//               <div className="flex items-center justify-between mb-2">
//                 <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                   Password
//                 </label>
//                 <button
//                   type="button"
//                   onClick={() => setShowForgotPassword(true)}
//                   className="text-sm text-blue-600 hover:text-blue-700 font-medium"
//                 >
//                   Forgot password?
//                 </button>
//               </div>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   autoComplete={isSignUp ? 'new-password' : 'current-password'}
//                   required
//                   value={password}
//                   onChange={(e) => {
//                     setPassword(e.target.value)
//                     if (errors.password) setErrors({...errors, password: undefined})
//                     if (errors.confirmPassword && confirmPassword) {
//                       setErrors({...errors, confirmPassword: password === e.target.value ? undefined : 'Passwords do not match'})
//                     }
//                   }}
//                   className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
//                     errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
//                   }`}
//                   placeholder="••••••••"
//                 />
//               </div>
//               {errors.password && (
//                 <p className="mt-1 text-sm text-red-600">{errors.password}</p>
//               )}
//             </div>

//             {/* Confirm Password - Only for Sign Up */}
//             {isSignUp && (
//               <div>
//                 <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
//                   Confirm Password
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     id="confirmPassword"
//                     name="confirmPassword"
//                     type="password"
//                     autoComplete="new-password"
//                     required
//                     value={confirmPassword}
//                     onChange={(e) => {
//                       setConfirmPassword(e.target.value)
//                       if (errors.confirmPassword) {
//                         setErrors({...errors, confirmPassword: password === e.target.value ? undefined : 'Passwords do not match'})
//                       }
//                     }}
//                     className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
//                       errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="••••••••"
//                   />
//                 </div>
//                 {errors.confirmPassword && (
//                   <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
//                 )}
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading || googleLoading}
//               className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   <span>Processing...</span>
//                 </>
//               ) : (
//                 <>
//                   <span>{isSignUp ? 'Create Account' : 'Sign In with Email'}</span>
//                   <ArrowRight className="w-5 h-5" />
//                 </>
//               )}
//             </button>
//           </form>

//           {/* Divider */}
//           <div className="relative">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-300" />
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-4 bg-white text-gray-500">Or continue with</span>
//             </div>
//           </div>

//           {/* Google Auth Button - Moved below email form */}
//           <div>
//             <button
//               onClick={handleGoogleAuth}
//               disabled={loading || googleLoading}
//               className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
//             >
//               {googleLoading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
//                   <span>Connecting...</span>
//                 </>
//               ) : (
//                 <>
//                   <svg className="w-5 h-5" viewBox="0 0 24 24">
//                     <path
//                       fill="currentColor"
//                       d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                     />
//                     <path
//                       fill="currentColor"
//                       d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//                     />
//                     <path
//                       fill="currentColor"
//                       d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//                     />
//                     <path
//                       fill="currentColor"
//                       d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//                     />
//                   </svg>
//                   <span>Continue with Google</span>
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Toggle Sign Up/Sign In */}
//           <div className="text-center pt-4 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={() => {
//                 setIsSignUp(!isSignUp)
//                 setMessage('')
//                 setErrors({})
//                 setPassword('')
//                 setConfirmPassword('')
//               }}
//               className="text-sm text-blue-600 hover:text-blue-700 font-medium"
//             >
//               {isSignUp
//                 ? 'Already have an account? Sign in'
//                 : "Don&apos;t have an account? Sign up"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
