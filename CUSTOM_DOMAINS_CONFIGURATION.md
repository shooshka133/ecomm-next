# Custom Domains Configuration Guide

Complete guide to configure custom domains for each brand in your multi-brand store.

---

## 🎯 Overview

You can configure:
- **Subdomains:** `branda.yourplatform.com`, `brandb.yourplatform.com`
- **Separate Domains:** `greentheme.com`, `ecommercestart.com`
- **Path-based:** `yourplatform.com/branda`, `yourplatform.com/brandb` (requires code changes)

---

## 🌐 Option 1: Subdomains (Recommended)

### Setup on Vercel

1. **Go to Vercel Dashboard:**
   - Project → Settings → Domains

2. **Add Subdomains:**
   - `branda.yourplatform.com`
   - `brandb.yourplatform.com`

3. **Configure DNS:**
   - Type: `CNAME`
   - Name: `branda` (or `brandb`)
   - Value: `cname.vercel-dns.com`

4. **Wait for SSL:**
   - Vercel automatically issues SSL certificates
   - Takes ~5 minutes

### Detect Brand from Domain

Update `lib/brand/admin-loader.ts` or create middleware:

```typescript
// middleware.ts (create in root)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  
  // Store brand in header for use in app
  if (hostname.includes('branda') || hostname.includes('greentheme')) {
    request.headers.set('x-brand-slug', 'green-theme-store')
  } else if (hostname.includes('brandb') || hostname.includes('ecommercestart')) {
    request.headers.set('x-brand-slug', 'ecommerce-start')
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### Update Service Router

Update `lib/services/router.ts` to read from header:

```typescript
import { headers } from 'next/headers'

export async function getActiveBrandSlug() {
  // Try to get from header (domain-based)
  const headersList = headers()
  const brandSlug = headersList.get('x-brand-slug')
  
  if (brandSlug) {
    return brandSlug
  }
  
  // Fallback to database active brand
  const activeBrand = await getActiveBrand()
  return activeBrand?.slug || 'default'
}
```

---

## 🌍 Option 2: Separate Domains

### Setup on Vercel

1. **Add Both Domains:**
   - `greentheme.com`
   - `ecommercestart.com`

2. **Configure DNS for Each:**
   - Type: `A` (root) or `CNAME` (www)
   - Value: Vercel's IP or `cname.vercel-dns.com`

3. **Wait for SSL:**
   - Automatic, ~5 minutes

### Detect Brand from Domain

Same middleware as Option 1, but check full domain:

```typescript
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  
  if (hostname.includes('greentheme.com')) {
    request.headers.set('x-brand-slug', 'green-theme-store')
  } else if (hostname.includes('ecommercestart.com')) {
    request.headers.set('x-brand-slug', 'ecommerce-start')
  }
  
  return NextResponse.next()
}
```

---

## 🔀 Option 3: Path-Based (Requires Code Changes)

### Update Routes

Create brand-specific routes:

```
/app/branda/...
/app/brandb/...
```

Or use dynamic routing:

```
/app/[brand]/...
```

### Update Service Router

Read brand from URL path:

```typescript
export async function getActiveBrandSlug() {
  // Get from URL path
  const pathname = headers().get('x-pathname') || ''
  const match = pathname.match(/^\/(branda|brandb|green-theme-store|ecommerce-start)/)
  
  if (match) {
    return match[1]
  }
  
  // Fallback to database
  const activeBrand = await getActiveBrand()
  return activeBrand?.slug || 'default'
}
```

---

## 🔧 Implementation: Domain-Based Brand Detection

### Step 1: Create Middleware

Create `middleware.ts` in project root:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Map domains/subdomains to brand slugs
const DOMAIN_TO_BRAND: Record<string, string> = {
  'branda.yourplatform.com': 'green-theme-store',
  'greentheme.com': 'green-theme-store',
  'www.greentheme.com': 'green-theme-store',
  'brandb.yourplatform.com': 'ecommerce-start',
  'ecommercestart.com': 'ecommerce-start',
  'www.ecommercestart.com': 'ecommerce-start',
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  
  // Find matching brand
  const brandSlug = DOMAIN_TO_BRAND[hostname] || 
                    Object.keys(DOMAIN_TO_BRAND).find(domain => 
                      hostname.includes(domain.split('.')[0])
                    ) ? DOMAIN_TO_BRAND[Object.keys(DOMAIN_TO_BRAND).find(domain => 
                      hostname.includes(domain.split('.')[0])
                    )!] : null
  
  if (brandSlug) {
    // Store in header for use in app
    const response = NextResponse.next()
    response.headers.set('x-brand-slug', brandSlug)
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### Step 2: Update Service Router

Update `lib/services/router.ts`:

```typescript
import { headers } from 'next/headers'

async function getBrandSlugFromRequest(): Promise<string | null> {
  try {
    const headersList = headers()
    return headersList.get('x-brand-slug')
  } catch {
    return null
  }
}

export async function getSupabaseClient() {
  // Try domain-based detection first
  const domainBrandSlug = await getBrandSlugFromRequest()
  const brandSlug = domainBrandSlug || (await getActiveBrand())?.slug || 'default'
  
  // ... rest of function
}
```

### Step 3: Update Brand Loader

Update `lib/brand/admin-loader.ts`:

```typescript
import { headers } from 'next/headers'

export async function getActiveBrandConfig() {
  // Try domain-based detection
  try {
    const headersList = headers()
    const domainBrandSlug = headersList.get('x-brand-slug')
    
    if (domainBrandSlug) {
      const brand = await getBrandBySlug(domainBrandSlug)
      if (brand) {
        return brand.config
      }
    }
  } catch {
    // Fallback to default
  }
  
  // Fallback to database active brand
  try {
    const activeBrand = await getActiveBrand()
    if (activeBrand && activeBrand.config) {
      return activeBrand.config
    }
  } catch (error) {
    console.error('Error loading active brand:', error)
  }

  // Final fallback to brand.config.ts
  return brand
}
```

---

## 📋 DNS Configuration Examples

### Cloudflare

1. **Add DNS Records:**
   - Type: `CNAME`
   - Name: `branda` (or `brandb`)
   - Target: `cname.vercel-dns.com`
   - Proxy: Off (gray cloud)

2. **SSL/TLS:**
   - Mode: Full (strict)
   - Vercel handles SSL

### Namecheap

1. **Advanced DNS:**
   - Type: `CNAME Record`
   - Host: `branda`
   - Value: `cname.vercel-dns.com`
   - TTL: Automatic

### GoDaddy

1. **DNS Management:**
   - Type: `CNAME`
   - Name: `branda`
   - Value: `cname.vercel-dns.com`
   - TTL: 1 hour

---

## ✅ Testing

### Test Domain Resolution

```bash
# Check DNS
nslookup branda.yourplatform.com

# Check SSL
curl -I https://branda.yourplatform.com
```

### Test Brand Detection

1. Visit `https://branda.yourplatform.com`
2. Check browser console for brand slug
3. Verify UI shows correct brand (colors, logo, name)
4. Test services route correctly

### Test Both Brands

1. Visit Brand A domain
2. Verify Brand A services
3. Visit Brand B domain
4. Verify Brand B services
5. Confirm isolation

---

## 🚨 Troubleshooting

### Issue: Domain Not Resolving

**Solution:**
1. Wait 5-10 minutes for DNS propagation
2. Check DNS records match Vercel instructions
3. Verify no typos in domain name
4. Use `nslookup` or `dig` to check DNS

### Issue: SSL Certificate Not Issued

**Solution:**
1. Wait 5-10 minutes
2. Check Vercel dashboard → Domains → Status
3. Verify DNS is correct
4. Try removing and re-adding domain

### Issue: Wrong Brand Showing

**Solution:**
1. Check middleware is running
2. Verify domain mapping in `DOMAIN_TO_BRAND`
3. Check browser console for `x-brand-slug` header
4. Verify service router reads header correctly

### Issue: Services Not Routing

**Solution:**
1. Verify environment variables are set
2. Check service router logs
3. Test with default brand first
4. Verify brand slug matches environment variable names

---

## 📝 Domain Mapping Template

Copy this template and customize:

```typescript
const DOMAIN_TO_BRAND: Record<string, string> = {
  // Brand A (Green Theme Store)
  'branda.yourplatform.com': 'green-theme-store',
  'greentheme.com': 'green-theme-store',
  'www.greentheme.com': 'green-theme-store',
  
  // Brand B (Ecommerce Start)
  'brandb.yourplatform.com': 'ecommerce-start',
  'ecommercestart.com': 'ecommerce-start',
  'www.ecommercestart.com': 'ecommerce-start',
  
  // Add more brands as needed
  'brandc.yourplatform.com': 'brand-c-slug',
  'brandc.com': 'brand-c-slug',
}
```

---

## 🎯 Best Practices

1. **Use Subdomains:**
   - Easier to manage
   - One SSL certificate
   - Simpler DNS

2. **Consistent Naming:**
   - `branda.yourplatform.com` → Brand A
   - `brandb.yourplatform.com` → Brand B
   - Easy to remember

3. **Fallback:**
   - Always fallback to database active brand
   - Don't break if domain detection fails

4. **Testing:**
   - Test locally with `/etc/hosts`
   - Test on staging before production
   - Verify SSL works

---

## 📚 Resources

- **Vercel Domains:** https://vercel.com/docs/concepts/projects/domains
- **DNS Basics:** https://www.cloudflare.com/learning/dns/
- **SSL/TLS:** https://letsencrypt.org/

---

**Your brands now have custom domains! 🌐**

