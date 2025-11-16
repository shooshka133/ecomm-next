import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges were made.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/cart"
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Return to Cart
          </Link>
          <Link
            href="/"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded hover:bg-gray-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

