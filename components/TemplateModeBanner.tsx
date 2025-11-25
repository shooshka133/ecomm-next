'use client'

/**
 * Template Mode Banner Component
 * 
 * Displays a banner in the admin dashboard when template mode is enabled.
 * This is a NEW component - does not modify existing code.
 * 
 * Usage: Import and add to admin page if template mode is enabled.
 */

import { AlertCircle } from 'lucide-react'

export default function TemplateModeBanner() {
  const isTemplateMode = process.env.NEXT_PUBLIC_TEMPLATE_MODE === 'true'

  if (!isTemplateMode) {
    return null
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">Template Mode Enabled</h3>
          <p className="text-sm text-blue-700">
            Your store is using template configuration. Branding and settings are loaded from{' '}
            <code className="bg-blue-100 px-1 rounded">template/config/branding.json</code>.
            To customize, edit files in <code className="bg-blue-100 px-1 rounded">template/override/</code>.
          </p>
        </div>
      </div>
    </div>
  )
}

