'use client'

/**
 * BrandProvider Component
 * 
 * Injects brand CSS variables into the document root.
 * This allows Tailwind and CSS to use brand colors dynamically.
 * 
 * Safe: If brand.config.ts is missing, uses defaults.
 */

import { useEffect } from 'react'
import { getBrandColors, getPrimaryFont, getHeadingFont } from '@/lib/brand'

export default function BrandProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      // Get brand configuration
      const colors = getBrandColors()
      const primaryFont = getPrimaryFont()
      const headingFont = getHeadingFont()
      
      // Set CSS variables on document root
      const root = document.documentElement
      
      if (colors.primary) {
        root.style.setProperty('--brand-primary', colors.primary)
      }
      if (colors.accent) {
        root.style.setProperty('--brand-accent', colors.accent)
      }
      if (colors.secondary) {
        root.style.setProperty('--brand-secondary', colors.secondary)
      }
      if (colors.background) {
        root.style.setProperty('--brand-background', colors.background)
      }
      if (colors.text) {
        root.style.setProperty('--brand-text', colors.text)
      }
      if (primaryFont) {
        root.style.setProperty('--brand-font-primary', primaryFont)
      }
      if (headingFont) {
        root.style.setProperty('--brand-font-heading', headingFont)
      }
    } catch (error) {
      // Silently fail - defaults will be used
      if (process.env.NODE_ENV === 'development') {
        console.warn('Brand configuration not available, using defaults:', error)
      }
    }
  }, [])

  return <>{children}</>
}

