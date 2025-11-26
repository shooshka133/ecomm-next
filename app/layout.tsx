import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import BrandProvider from '@/components/BrandProvider'
import Navbar from '@/components/Navbar'
import ToastWrapper from '@/components/ToastWrapper'
import Link from 'next/link'
import { getBrandName, getBrandSlogan, getSeoTitle, getSeoDescription, getLogoUrl, getFaviconUrl, getAppleIconUrl, getPrimaryColor, getFooterCopyright, getFooterLinks, getSocialLinks, getBrandColors } from '@/lib/brand'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

// Get brand metadata (with fallbacks)
const brandName = getBrandName()
const seoTitle = getSeoTitle()
const seoDescription = getSeoDescription()
const logoUrl = getLogoUrl()
const faviconUrl = getFaviconUrl()
const appleIconUrl = getAppleIconUrl()
const primaryColor = getPrimaryColor()

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
  icons: {
    icon: faviconUrl,
    shortcut: faviconUrl,
    apple: appleIconUrl,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: primaryColor,
}

// Footer component with brand configuration
function Footer() {
  const brandName = getBrandName()
  const brandSlogan = getBrandSlogan()
  const footerCopyright = getFooterCopyright()
  const footerLinks = getFooterLinks()
  const socialLinks = getSocialLinks()
  const logoUrl = getLogoUrl()
  const brandColors = getBrandColors()

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(to bottom right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'})`
                }}
              >
                {logoUrl && logoUrl !== '/icon.svg' ? (
                  <img src={logoUrl} alt={brandName} className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <span className="text-white font-bold text-xl">E</span>
                )}
              </div>
              <span className="text-xl font-bold">{brandName}</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {brandSlogan}
            </p>
            {(socialLinks.instagram || socialLinks.facebook || socialLinks.twitter || socialLinks.linkedin) && (
              <div className="flex gap-4 mt-4">
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    Instagram
                  </a>
                )}
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    Facebook
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    Twitter
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold mb-6 text-lg">Shop</h4>
            <ul className="space-y-3 text-gray-400">
              {footerLinks.shop && footerLinks.shop.length > 0 ? (
                footerLinks.shop.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="hover:text-white transition-colors">{link.label}</a>
                  </li>
                ))
              ) : (
                <>
                  <li><a href="/" className="hover:text-white transition-colors">All Products</a></li>
                  <li><a href="/" className="hover:text-white transition-colors">New Arrivals</a></li>
                  <li><a href="/" className="hover:text-white transition-colors">Best Sellers</a></li>
                  <li><a href="/" className="hover:text-white transition-colors">Sale</a></li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-lg">Support</h4>
            <ul className="space-y-3 text-gray-400">
              {footerLinks.support && footerLinks.support.length > 0 ? (
                footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="hover:text-white transition-colors">{link.label}</a>
                  </li>
                ))
              ) : (
                <>
                  <li><a href="/" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="/" className="hover:text-white transition-colors">Shipping Info</a></li>
                  <li><a href="/" className="hover:text-white transition-colors">Returns</a></li>
                  <li><a href="/" className="hover:text-white transition-colors">FAQ</a></li>
                </>
              )}
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
          <p>{footerCopyright}</p>
        </div>
      </div>
    </footer>
  )
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
        <BrandProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>
              <ToastWrapper />
              <Footer />
            </div>
          </AuthProvider>
        </BrandProvider>
      </body>
    </html>
  )
}
