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

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

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
        // Convert hex to RGB for rgba usage
        const rgb = hexToRgb(colors.primary)
        if (rgb) {
          root.style.setProperty('--brand-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
        }
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

