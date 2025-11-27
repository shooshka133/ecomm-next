# Files Related to Title Flashing & Brand Configuration Issue

## 🔴 Core Files (Most Critical)

### 1. **`app/layout.tsx`** ⭐ PRIMARY
   - **Purpose**: Root layout with metadata generation, title tag, and inline scripts
   - **Key Changes**:
     - `generateMetadata()` - Server-side metadata based on domain
     - Direct `<title>` tag in HTML head (prevents flash)
     - Inline CSS for brand colors (prevents color flash)
     - Aggressive title override script (prevents Next.js from overwriting)
     - Server-injected brand config JSON (`__BRAND_CONFIG__`)
   - **Why Critical**: This is where the title is set in the initial HTML

### 2. **`lib/brand/admin-loader.ts`**
   - **Purpose**: Loads brand configuration based on domain
   - **Key Functions**:
     - `getDomainFromRequest()` - Extracts domain from headers
     - `getActiveBrandConfig()` - Returns brand config for domain
   - **Why Critical**: Determines which brand config to use

### 3. **`lib/brand/storage.ts`**
   - **Purpose**: Brand storage and retrieval from database
   - **Key Functions**:
     - `getBrandByDomain()` - Finds brand by domain
     - `getActiveBrand()` - Gets active brand (domain-prioritized)
   - **Why Critical**: Database queries for brand data

### 4. **`middleware.ts`**
   - **Purpose**: Extracts domain and sets header for server components
   - **Key Changes**: Sets `x-brand-domain` header
   - **Why Critical**: Makes domain available to server components

---

## 🟡 Client Components (UI Elements)

### 5. **`components/BrandProvider.tsx`**
   - **Purpose**: Client-side brand provider that sets CSS variables
   - **Key Changes**: Reads from server-injected JSON (`__BRAND_CONFIG__`)
   - **Why Important**: Applies brand colors to client components

### 6. **`components/Navbar.tsx`**
   - **Purpose**: Navigation bar with brand logo and name
   - **Key Changes**: Reads from server-injected JSON for logo/name
   - **Why Important**: Displays brand identity in header

### 7. **`components/ProductCard.tsx`**
   - **Purpose**: Product card component
   - **Key Changes**: Uses CSS variables directly (no client-side fetching)
   - **Why Important**: Prevents product color flashing

### 8. **`components/CategoryFilter.tsx`**
   - **Purpose**: Category filter buttons
   - **Key Changes**: Uses CSS variables directly
   - **Why Important**: Prevents category button color flashing

### 9. **`components/AutoScrollProducts.tsx`**
   - **Purpose**: Auto-scrolling product carousel
   - **Key Changes**: Uses CSS variables directly
   - **Why Important**: Prevents price badge color flashing

### 10. **`app/page.tsx`** (Homepage)
   - **Purpose**: Homepage with products and hero section
   - **Key Changes**: 
     - Reads from server-injected JSON for hero text
     - Filters products by brand_id
     - Uses domain-based Supabase client
   - **Why Important**: Main page that shows products

---

## 🟢 Supporting Files

### 11. **`lib/brand/get-current-brand.ts`**
   - **Purpose**: Helper to get current brand ID based on domain
   - **Why Important**: Used for product filtering

### 12. **`lib/brand/index.ts`**
   - **Purpose**: Brand utility functions (fallback to `brand.config.ts`)
   - **Why Important**: Provides default values if database fails

### 13. **`brand.config.ts`**
   - **Purpose**: Default/fallback brand configuration
   - **Why Important**: Fallback when no brand found in database

### 14. **`app/api/brand-config/route.ts`**
   - **Purpose**: API endpoint for brand configuration (now mostly replaced by server injection)
   - **Why Important**: Fallback for client components if JSON injection fails

---

## 🔵 Database & Migration Files

### 15. **`migrations/002_add_domain_to_brands.sql`**
   - **Purpose**: Adds `domain` column to `brands` table
   - **Why Important**: Enables domain-based brand routing

### 16. **`migrations/003_add_brand_id_to_products.sql`**
   - **Purpose**: Adds `brand_id` column to `products` table
   - **Why Important**: Enables product filtering by brand

### 17. **`VERIFY_BRAND_CONFIG_FINAL.sql`**
   - **Purpose**: SQL script to verify and fix brand configuration
   - **Why Important**: Ensures database has correct brand data

---

## 📊 File Impact Summary

| File | Impact Level | What It Does |
|------|-------------|--------------|
| `app/layout.tsx` | 🔴 CRITICAL | Sets title in HTML, prevents flash |
| `lib/brand/admin-loader.ts` | 🔴 CRITICAL | Determines which brand to use |
| `lib/brand/storage.ts` | 🔴 CRITICAL | Fetches brand from database |
| `middleware.ts` | 🔴 CRITICAL | Extracts domain from request |
| `components/BrandProvider.tsx` | 🟡 HIGH | Applies brand colors |
| `components/Navbar.tsx` | 🟡 HIGH | Shows brand logo/name |
| `components/ProductCard.tsx` | 🟡 HIGH | Uses brand colors |
| `app/page.tsx` | 🟡 HIGH | Shows brand-specific products |
| `lib/brand/get-current-brand.ts` | 🟢 MEDIUM | Helper for brand ID |
| `app/api/brand-config/route.ts` | 🟢 MEDIUM | API fallback |

---

## 🔍 How They Work Together

1. **Request comes in** → `middleware.ts` extracts domain
2. **Server renders** → `app/layout.tsx` calls `getActiveBrandConfig(domain)`
3. **Brand lookup** → `lib/brand/admin-loader.ts` → `lib/brand/storage.ts` → Database
4. **Title set** → `generateMetadata()` returns correct title → Direct `<title>` tag in HTML
5. **Colors set** → Inline CSS in `<head>` sets CSS variables
6. **Client hydrates** → `BrandProvider` reads from `__BRAND_CONFIG__` JSON
7. **Components render** → Use CSS variables (no client-side fetching)

---

## 🐛 Common Issues & Files to Check

| Issue | Files to Check |
|-------|----------------|
| Title still flashing | `app/layout.tsx` (title tag, script) |
| Wrong brand shown | `lib/brand/storage.ts`, `middleware.ts` |
| Colors flashing | `app/layout.tsx` (inline CSS), `components/*.tsx` (CSS variables) |
| Wrong products | `app/page.tsx` (filtering), `lib/brand/get-current-brand.ts` |
| Database not found | `lib/brand/storage.ts` (USE_DB flag) |

---

## 📝 Recent Changes (Git History)

Based on recent commits:
- `b1823f4` - Fix title flashing (direct title tag + script)
- `d44129b` - Override document.title setter
- `fee1f3b` - Inject brand config server-side as JSON
- `fabaa16` - Use CSS variables directly (no client fetching)
- `5dbff7f` - Add inline CSS for brand colors
- `ab84e8b` - Add MutationObserver for title
- `2ac7640` - Set title/colors in inline script
- `852182c` - Fix title flashing and footer logo
- `8ed689b` - Update Navbar/Homepage for dynamic config

