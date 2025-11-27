'use client'

/**
 * BrandProvider Component
 * 
 * Injects brand CSS variables into the document root.
 * This allows Tailwind and CSS to use brand colors dynamically.
 * 
 * Fetches brand config from API based on current domain.
 * Falls back to static config if API fails.
 */

import { useEffect, useState } from 'react'
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
  const [brandConfig, setBrandConfig] = useState<any>(null)

  useEffect(() => {
    // Get brand config from server-injected JSON (no fetch needed - already in HTML!)
    // This is set in layout.tsx before React hydration, so it's available immediately
    // NO CLIENT-SIDE FETCHING - prevents flashing and ensures correct brand from start
    try {
      const configScript = document.getElementById('__BRAND_CONFIG__')
      if (configScript && configScript.textContent) {
        const config = JSON.parse(configScript.textContent)
        setBrandConfig(config)
        return // Use server-injected config, no need to fetch
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to parse server-injected brand config:', error)
      }
    }
    
    // If server-injected config is not available, we still don't fetch
    // This ensures no flashing - the server should always inject the config
    // If we reach here, it's a configuration error that should be fixed
    if (process.env.NODE_ENV === 'development') {
      console.warn('[BrandProvider] Server-injected brand config not found. This should not happen.')
    }
  }, [])

  useEffect(() => {
    try {
      // Use domain-based brand if available, otherwise fall back to static
      const colors = brandConfig?.colors || getBrandColors()
      const primaryFont = brandConfig?.fontFamily?.primary || getPrimaryFont()
      const headingFont = brandConfig?.fontFamily?.heading || getHeadingFont()
      
      // Update document title immediately to prevent flash
      if (brandConfig?.seo?.title) {
        document.title = brandConfig.seo.title
      }
      
      // Update favicon if available
      if (brandConfig?.faviconUrl) {
        const link = document.querySelector("link[rel='icon']") as HTMLLinkElement
        if (link) {
          link.href = brandConfig.faviconUrl
        }
      }
      
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
  }, [brandConfig])

  return <>{children}</>
}

