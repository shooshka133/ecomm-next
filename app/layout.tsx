import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import BrandProvider from '@/components/BrandProvider'
import Navbar from '@/components/Navbar'
import ToastWrapper from '@/components/ToastWrapper'
import Link from 'next/link'
import { getBrandName, getBrandSlogan, getSeoTitle, getSeoDescription, getLogoUrl, getFaviconUrl, getAppleIconUrl, getPrimaryColor, getFooterCopyright, getFooterLinks, getSocialLinks, getBrandColors } from '@/lib/brand'
import { getActiveBrandConfig, getDomainFromRequest } from '@/lib/brand/admin-loader'
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

// Generate metadata based on domain
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const domain = getDomainFromRequest(headersList)
  
  try {
    const brandConfig = await getActiveBrandConfig(domain)
    
    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Layout Metadata]', {
        domain,
        brandName: brandConfig.name,
        seoTitle: brandConfig.seo?.title,
        faviconUrl: brandConfig.faviconUrl,
      })
    }
    
    return {
      title: brandConfig.seo?.title || getSeoTitle(),
      description: brandConfig.seo?.description || getSeoDescription(),
      icons: {
        icon: brandConfig.faviconUrl || getFaviconUrl(),
        shortcut: brandConfig.faviconUrl || getFaviconUrl(),
        apple: brandConfig.appleIconUrl || getAppleIconUrl(),
      },
    }
  } catch (error) {
    console.error('[Layout Metadata] Error loading brand config:', error)
    // Fallback to static config
    return {
      title: getSeoTitle(),
      description: getSeoDescription(),
      icons: {
        icon: getFaviconUrl(),
        shortcut: getFaviconUrl(),
        apple: getAppleIconUrl(),
      },
    }
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: getPrimaryColor(),
}

// Footer component with brand configuration (server component - can use async)
async function Footer() {
  // Get domain-based brand config
  const headersList = await headers()
  const domain = getDomainFromRequest(headersList)
  const brandConfig = await getActiveBrandConfig(domain)
  
  // Use domain-based brand if available, otherwise fall back to static
  const brandName = brandConfig?.name || getBrandName()
  const brandSlogan = brandConfig?.slogan || getBrandSlogan()
  const footerCopyright = brandConfig?.footer?.copyright || getFooterCopyright()
  const footerLinks = brandConfig?.footer?.links || getFooterLinks()
  const socialLinks = brandConfig?.social || getSocialLinks()
  const logoUrl: string = (brandConfig?.logoUrl || getLogoUrl()) as string
  const brandColors = brandConfig?.colors || getBrandColors()

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
                {logoUrl && logoUrl !== '/icon.svg' && logoUrl.trim() !== '' ? (
                  <img 
                    src={logoUrl} 
                    alt={brandName} 
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <span className="text-white font-bold text-xl">{brandName.charAt(0).toUpperCase()}</span>
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get brand config ONCE on server - this ensures initial HTML is correct
  const headersList = await headers()
  const domain = getDomainFromRequest(headersList)
  let initScript = ''
  let inlineStyles = ''
  let brandConfigJson = 'null'
  
  try {
    const brandConfig = await getActiveBrandConfig(domain)
    const title = brandConfig?.seo?.title || getSeoTitle()
    const colors = brandConfig?.colors || getBrandColors()
    
    // Serialize brand config for client-side use (prevents client-side fetching)
    brandConfigJson = JSON.stringify(brandConfig).replace(/</g, '\\u003c')
    
    // Escape title for JS
    const escapedTitle = title.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'")
    
    // Generate inline CSS with brand colors to prevent flash
    // This is injected in <head> BEFORE any rendering, so colors are correct from start
    inlineStyles = `
      :root {
        --brand-primary: ${colors.primary || '#4F46E5'};
        --brand-accent: ${colors.accent || '#7C3AED'};
        --brand-secondary: ${colors.secondary || '#6366F1'};
        --brand-background: ${colors.background || '#FFFFFF'};
        --brand-text: ${colors.text || '#1F2937'};
    `
    
    // Convert primary to RGB
    if (colors.primary) {
      const hex = colors.primary.replace('#', '')
      if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        inlineStyles += `        --brand-primary-rgb: ${r}, ${g}, ${b};`
      }
    }
    
    inlineStyles += `\n      }`
    
    // Use blocking script that runs synchronously - no async, no delays
    initScript = `
      (function() {
        var targetTitle = "${escapedTitle}";
        
        // CRITICAL: Override document.title IMMEDIATELY before Next.js can set it
        try {
          var desc = Object.getOwnPropertyDescriptor(Document.prototype, 'title');
          if (desc && desc.set) {
            var origSet = desc.set;
            Object.defineProperty(document, 'title', {
              get: function() { return targetTitle; },
              set: function() { origSet.call(this, targetTitle); },
              configurable: true
            });
          }
        } catch(e) {}
        
        // Set title immediately (synchronous, blocking)
        try {
          if (document.title !== targetTitle) {
            document.title = targetTitle;
          }
        } catch(e) {}
        
        // Watch for any title changes and force it back
        if (document.head) {
          var titleEl = document.querySelector('title');
          if (titleEl) {
            var obs = new MutationObserver(function() {
              if (document.title !== targetTitle) {
                document.title = targetTitle;
              }
            });
            obs.observe(titleEl, { childList: true, characterData: true, subtree: true });
          }
        }
        
        // Also set on document ready events
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() {
            document.title = targetTitle;
          }, true);
        } else {
          document.title = targetTitle;
        }
      })();
    `
  } catch (error) {
    // Fallback to default
    const defaultTitle = getSeoTitle()
    const defaultColors = getBrandColors()
    const defaultBrand = {
      name: getBrandName(),
      colors: defaultColors,
      seo: { title: defaultTitle },
    }
    brandConfigJson = JSON.stringify(defaultBrand).replace(/</g, '\\u003c')
    
    initScript = `
      (function() {
        document.title = "${defaultTitle.replace(/"/g, '\\"')}";
        const root = document.documentElement;
        root.style.setProperty('--brand-primary', '${defaultColors.primary}');
        root.style.setProperty('--brand-accent', '${defaultColors.accent}');
        root.style.setProperty('--brand-secondary', '${defaultColors.secondary}');
        root.style.setProperty('--brand-background', '${defaultColors.background}');
        root.style.setProperty('--brand-text', '${defaultColors.text}');
      })();
    `
    inlineStyles = `
      :root {
        --brand-primary: ${defaultColors.primary};
        --brand-accent: ${defaultColors.accent};
        --brand-secondary: ${defaultColors.secondary};
        --brand-background: ${defaultColors.background};
        --brand-text: ${defaultColors.text};
      }
    `
  }
  
  // Get title for direct injection
  let directTitle = getSeoTitle()
  try {
    const headersList = await headers()
    const domain = getDomainFromRequest(headersList)
    const brandConfig = await getActiveBrandConfig(domain)
    directTitle = brandConfig?.seo?.title || getSeoTitle()
  } catch (error) {
    // Fallback already set
  }

  return (
    <html lang="en" className={poppins.variable}>
      <head>
        {/* CRITICAL: Direct title tag to prevent any flash */}
        <title>{directTitle}</title>
        {/* CRITICAL: Order matters - CSS first, then blocking script, then JSON */}
        {/* 1. Set colors via inline CSS - runs before any rendering */}
        <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
        {/* 2. Set title IMMEDIATELY with blocking script - must run before Next.js metadata */}
        <script
          dangerouslySetInnerHTML={{
            __html: initScript,
          }}
          suppressHydrationWarning
        />
        {/* 3. Inject brand config as JSON for client-side access */}
        <script
          type="application/json"
          id="__BRAND_CONFIG__"
          dangerouslySetInnerHTML={{
            __html: brandConfigJson,
          }}
          suppressHydrationWarning
        />
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
