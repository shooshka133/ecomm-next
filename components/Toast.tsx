'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

let toastId = 0
const listeners: Array<(toasts: Toast[]) => void> = []
let toasts: Toast[] = []

const notify = (message: string, type: ToastType = 'info') => {
  if (typeof window === 'undefined') return

  const id = `toast-${toastId++}`
  const newToast: Toast = { id, message, type }
  
  toasts = [...toasts, newToast]
  listeners.forEach(listener => listener(toasts))

  // Auto remove after 5 seconds
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    listeners.forEach(listener => listener(toasts))
  }, 5000)
}

export const toast = {
  success: (message: string) => notify(message, 'success'),
  error: (message: string) => notify(message, 'error'),
  warning: (message: string) => notify(message, 'warning'),
  info: (message: string) => notify(message, 'info'),
}

function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setCurrentToasts(newToasts)
    }
    listeners.push(listener)
    setCurrentToasts(toasts)

    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  const removeToast = (id: string) => {
    toasts = toasts.filter(t => t.id !== id)
    listeners.forEach(listener => listener(toasts))
  }

  if (currentToasts.length === 0) return null

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const bgColors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {currentToasts.map((toast) => {
        const Icon = icons[toast.type]
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in-right ${bgColors[toast.type]}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default ToastContainer

