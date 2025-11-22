'use client'

import { useState } from 'react'
import { Package, Truck, CheckCircle } from 'lucide-react'

export default function AdminEmailPage() {
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [emailType, setEmailType] = useState<'shipping' | 'delivery'>('shipping')

  const sendEmail = async () => {
    if (!orderId.trim()) {
      setResult({ success: false, message: 'Please enter an order ID' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const endpoint = emailType === 'shipping' 
        ? '/api/send-shipping-email'
        : '/api/send-delivery-email'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId.trim() }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: `${emailType === 'shipping' ? 'Shipping' : 'Delivery'} email sent successfully! Email ID: ${data.emailId}`,
        })
        setOrderId('') // Clear input on success
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send email',
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `Error: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Send Order Emails</h1>
        <p className="text-gray-600 mb-8">Send shipping or delivery notification emails to customers</p>

        {/* Email Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Email Type
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setEmailType('shipping')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                emailType === 'shipping'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <Truck className="w-5 h-5" />
              <span className="font-medium">Shipping</span>
            </button>
            <button
              onClick={() => setEmailType('delivery')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                emailType === 'delivery'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Delivery</span>
            </button>
          </div>
        </div>

        {/* Order ID Input */}
        <div className="mb-6">
          <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
            Order ID
          </label>
          <input
            id="orderId"
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g., e74c1873-e199-45eb-9565-a996ef102197"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendEmail()
              }
            }}
          />
          <p className="text-xs text-gray-500 mt-2">
            Find the Order ID in Supabase → Table Editor → orders
          </p>
        </div>

        {/* Send Button */}
        <button
          onClick={sendEmail}
          disabled={loading || !orderId.trim()}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
            loading || !orderId.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : emailType === 'shipping'
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Sending...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {emailType === 'shipping' ? <Truck className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
              Send {emailType === 'shipping' ? 'Shipping' : 'Delivery'} Email
            </span>
          )}
        </button>

        {/* Result Message */}
        {result && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              result.success
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <p className="font-medium">{result.message}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">📋 How to Use:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Go to <strong>Supabase Dashboard</strong> → <strong>Table Editor</strong> → <strong>orders</strong></li>
            <li>Find the order you want to send an email for</li>
            <li>Copy the <strong>Order ID</strong> (the UUID, e.g., <code className="bg-gray-100 px-1 rounded">e74c1873-...</code>)</li>
            <li>Paste it in the <strong>Order ID</strong> field above</li>
            <li>Select <strong>Shipping</strong> or <strong>Delivery</strong> email type</li>
            <li>Click <strong>Send Email</strong></li>
            <li>Customer will receive the email! 📧</li>
          </ol>
        </div>

        {/* Status Requirements */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Important:</strong> Make sure the order status in Supabase matches the email type:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-yellow-800 space-y-1">
            <li><strong>Shipping email:</strong> Order status must be <code className="bg-yellow-100 px-1 rounded">shipped</code></li>
            <li><strong>Delivery email:</strong> Order status must be <code className="bg-yellow-100 px-1 rounded">delivered</code></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

