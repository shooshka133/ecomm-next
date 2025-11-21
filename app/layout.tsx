import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import ToastWrapper from '@/components/ToastWrapper'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Ecommerce Start - Modern Shopping Experience',
  description: 'Discover amazing products at great prices',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/apple-icon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4F46E5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.variable}>
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
      <body className={`${inter.className} ${poppins.variable}`}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <ToastWrapper />
            <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-20">
              <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">E</span>
                      </div>
                      <span className="text-xl font-bold">Ecommerce Start</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      Your trusted destination for quality products and exceptional service.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-6 text-lg">Shop</h4>
                    <ul className="space-y-3 text-gray-400">
                      <li><a href="/" className="hover:text-white transition-colors">All Products</a></li>
                      <li><a href="/" className="hover:text-white transition-colors">New Arrivals</a></li>
                      <li><a href="/" className="hover:text-white transition-colors">Best Sellers</a></li>
                      <li><a href="/" className="hover:text-white transition-colors">Sale</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-6 text-lg">Support</h4>
                    <ul className="space-y-3 text-gray-400">
                      <li><a href="/" className="hover:text-white transition-colors">Contact Us</a></li>
                      <li><a href="/" className="hover:text-white transition-colors">Shipping Info</a></li>
                      <li><a href="/" className="hover:text-white transition-colors">Returns</a></li>
                      <li><a href="/" className="hover:text-white transition-colors">FAQ</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-6 text-lg">Account</h4>
                    <ul className="space-y-3 text-gray-400">
                      <li><Link href="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
                      <li><Link href="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
                      <li><Link href="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
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
