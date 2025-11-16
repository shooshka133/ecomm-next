import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ecommerce Start - Modern Shopping Experience',
  description: 'Discover amazing products at great prices',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Suppress extension-related errors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.filename && (
                  e.filename.includes('chrome-extension://') ||
                  e.filename.includes('moz-extension://') ||
                  e.filename.includes('safari-extension://') ||
                  e.filename.includes('extension://') ||
                  e.filename.includes('__nextjs_original-stack-frame')
                )) {
                  e.preventDefault();
                  return false;
                }
              }, true);
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <footer className="bg-gray-900 text-white mt-16">
              <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Ecommerce Start</h3>
                    <p className="text-gray-400">
                      Your trusted destination for quality products and exceptional service.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Shop</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li><a href="/" className="hover:text-white">All Products</a></li>
                      <li><a href="/" className="hover:text-white">New Arrivals</a></li>
                      <li><a href="/" className="hover:text-white">Best Sellers</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Support</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li><a href="/" className="hover:text-white">Contact Us</a></li>
                      <li><a href="/" className="hover:text-white">Shipping Info</a></li>
                      <li><a href="/" className="hover:text-white">Returns</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Account</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li><a href="/orders" className="hover:text-white">My Orders</a></li>
                      <li><a href="/cart" className="hover:text-white">Shopping Cart</a></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                  <p>&copy; 2024 Ecommerce Start. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
