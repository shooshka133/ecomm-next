'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function TestProductsPage() {
  const [status, setStatus] = useState<any>({ loading: true })
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const test = async () => {
      try {
        // Get Supabase config
        const configRes = await fetch('/api/supabase-config')
        const config = await configRes.json()
        
        setStatus(prev => ({ ...prev, config }))

        if (config.success && config.supabaseUrl && config.supabaseKey) {
          // Create client
          const supabase = createClient(config.supabaseUrl, config.supabaseKey)
          
          // Test connection
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .limit(5)

          setStatus(prev => ({
            ...prev,
            productsQuery: {
              success: !error,
              error: error?.message,
              count: data?.length || 0,
            },
            supabaseUrl: config.supabaseUrl.substring(0, 40) + '...',
            brandSlug: config.brandSlug,
          }))

          if (data) {
            setProducts(data)
          }
        }
      } catch (error: any) {
        setStatus(prev => ({ ...prev, error: error.message }))
      } finally {
        setStatus(prev => ({ ...prev, loading: false }))
      }
    }

    test()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Products Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Status:</h2>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(status, null, 2)}
        </pre>
      </div>

      {products.length > 0 && (
        <div className="bg-green-50 p-4 rounded mb-4">
          <h2 className="font-bold mb-2">Sample Products ({products.length}):</h2>
          <ul className="space-y-2">
            {products.map((p: any) => (
              <li key={p.id} className="text-sm">
                <strong>{p.name}</strong> - {p.category} - ${p.price}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Expected:</strong></p>
        <ul className="list-disc list-inside ml-4">
          <li>If on grocery.shooshka.online: brandSlug should be &quot;grocery-store&quot;</li>
          <li>supabaseUrl should be your grocery Supabase project URL</li>
          <li>Should see grocery products (Fresh Produce, Dairy, etc.)</li>
        </ul>
      </div>
    </div>
  )
}

