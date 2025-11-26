'use client'

import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase/client";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import Pagination from "@/components/Pagination";
import AutoScrollProducts from "@/components/AutoScrollProducts";
import HeroWindowDisplay from "@/components/HeroWindowDisplay";
import { Sparkles, Truck, Shield, Star, TrendingUp } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Product } from "@/types";
import { useSearchParams, useRouter } from "next/navigation";
import { getHeroTitle, getHeroSubtitle, getHeroCtaText, getHeroBadge, getFeatureStats, getBrandColors } from "@/lib/brand";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 24; // Increased from 12 to show more products
  const [supabase, setSupabase] = useState(createSupabaseClient());
  
  // Get brand hero configuration
  const heroTitle = getHeroTitle();
  const heroSubtitle = getHeroSubtitle();
  const heroCtaText = getHeroCtaText();
  const heroBadge = getHeroBadge();
  const featureStats = getFeatureStats();
  const brandColors = getBrandColors();

  // CRITICAL: Handle OAuth code that wrongly lands on homepage
  // This happens when Supabase redirect URL is misconfigured
  useEffect(() => {
    console.log('🏠 [Homepage] Checking for OAuth code...', {
      hasCode: !!searchParams.get('code'),
      code: searchParams.get('code')?.substring(0, 20),
      allParams: Array.from(searchParams.entries()),
      currentUrl: window.location.href
    });
    
    const code = searchParams.get('code');
    if (code) {
      // OAuth code detected on homepage - redirect to proper callback route
      console.log('🔄 [Homepage] OAuth code detected! Redirecting to /auth/callback...');
      const nextParam = searchParams.get('next') || '/';
      const redirectUrl = `/auth/callback?code=${code}&next=${encodeURIComponent(nextParam)}`;
      console.log('🔄 [Homepage] Redirect URL:', redirectUrl);
      window.location.href = redirectUrl;
      return; // Stop further execution
    }

    const authSuccess = searchParams.get('auth');
    if (authSuccess === 'success') {
      // Force refresh the session after OAuth callback
      const refreshSession = async () => {
        try {
          // Wait a bit for cookies to be set
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Get the session to trigger AuthProvider update
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            // Session is valid, remove the query param
            router.replace('/');
            // Trigger a page refresh to ensure AuthProvider picks up the session
            router.refresh();
          } else {
            // No session yet, try once more after a delay
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession) {
                router.replace('/');
                router.refresh();
              }
            }, 1000);
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error refreshing session after OAuth:', error);
          }
        }
      };
      
      refreshSession();
    }
  }, [searchParams, router, supabase]);

  // Initialize category from URL parameter
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Get domain-based Supabase client
    const initSupabase = async () => {
      try {
        const response = await fetch('/api/supabase-config')
        const data = await response.json()
        
        console.log('[Homepage] Supabase config response:', {
          success: data.success,
          domain: data.domain,
          brandSlug: data.brandSlug,
          hasUrl: !!data.supabaseUrl,
          hasKey: !!data.supabaseKey,
          url: data.supabaseUrl?.substring(0, 30) + '...'
        })
        
        if (data.success && data.supabaseUrl && data.supabaseKey) {
          // Import createClient dynamically
          const { createClient } = await import('@supabase/supabase-js')
          const domainClient = createClient(data.supabaseUrl, data.supabaseKey)
          console.log('[Homepage] Created domain-based Supabase client for:', data.brandSlug)
          setSupabase(domainClient)
        } else {
          console.warn('[Homepage] Failed to get Supabase config, using default client')
        }
      } catch (error: any) {
        console.error('[Homepage] Error initializing domain-based Supabase client:', error)
        console.warn('[Homepage] Using default Supabase client (main project). This is OK if /api/supabase-config is not deployed yet.')
        // Keep default client - this will use main Supabase project
      }
    }
    
    initSupabase()
  }, []);

  useEffect(() => {
    if (supabase) {
      console.log('[Homepage] Supabase client ready, loading products...')
      loadProducts();
    } else {
      console.log('[Homepage] Waiting for Supabase client...')
    }
  }, [supabase]);

  const loadProducts = async () => {
    try {
      setLoading(true)
      
      // Get brand config to determine if we should filter by brand_id
      let brandId: string | null = null
      let brandSlug: string | null = null
      try {
        const brandResponse = await fetch('/api/brand-config')
        const brandData = await brandResponse.json()
        if (brandData.success) {
          brandId = brandData.brandId
          brandSlug = brandData.brandSlug
        }
      } catch (error) {
        console.warn('[Homepage] Could not fetch brand config:', error)
      }

      console.log('[Homepage] Loading products:', {
        brandSlug,
        brandId,
        supabaseUrl: (supabase as any)?.supabaseUrl?.substring(0, 30) + '...' || 'unknown'
      })

      // Build query
      // If using a separate Supabase project (grocery), load ALL products from that project
      // If using main Supabase project, filter by brand_id
      let query = supabase
        .from("products")
        .select("*")
      
      // Only filter by brand_id if we're using the main Supabase project
      // Grocery Supabase project should have all grocery products (no filtering needed)
      const isGroceryBrand = brandSlug && (
        brandSlug.toLowerCase() === 'grocery-store' ||
        brandSlug.toLowerCase() === 'grocerystore' ||
        brandSlug.toLowerCase().includes('grocery')
      )
      
      if (brandId && !isGroceryBrand) {
        query = query.or(`brand_id.eq.${brandId},brand_id.is.null`)
        console.log('[Homepage] Filtering by brand_id:', brandId)
      } else {
        console.log('[Homepage] Loading all products (no brand filter)')
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error('[Homepage] Supabase query error:', error)
        throw error
      }
      
      console.log('[Homepage] Loaded products:', data?.length || 0, 'items')
      if (data && data.length > 0) {
        console.log('[Homepage] First product:', data[0].name, 'Category:', data[0].category)
      }
      
      setProducts(data || []);
    } catch (error) {
      console.error('[Homepage] Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, productsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - ASTONISHING with BOLD Product Images */}
      <section 
        className="relative text-white overflow-hidden"
        style={{
          background: `linear-gradient(to bottom right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'}, ${brandColors.secondary || '#3B82F6'})`
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center min-h-[500px] sm:min-h-[600px] md:min-h-[700px]">
            
            {/* Left: Text Content */}
            <div className="py-12 sm:py-16 md:py-24 relative z-10">
              <div className="animate-fade-in">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium">
                    {heroBadge}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
                  {heroTitle}
                </h1>
                <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 leading-relaxed drop-shadow-lg" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  {heroSubtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link
                    href="#products"
                    className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 inline-flex items-center justify-center gap-2 shadow-2xl transition-all"
                  >
                    <span>{heroCtaText}</span>
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                  <Link
                    href="#features"
                    className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 text-center shadow-xl"
                  >
                    Learn More
                  </Link>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/20">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{featureStats.products}</div>
                    <div className="text-xs sm:text-sm text-blue-100">Products</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{featureStats.customers}</div>
                    <div className="text-xs sm:text-sm text-blue-100">Customers</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{featureStats.support}</div>
                    <div className="text-xs sm:text-sm text-blue-100">Support</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: WINDOW DISPLAY SHOWCASE - Like a Store Window */}
            <div className="relative py-8 lg:py-16 hidden lg:block">
              <HeroWindowDisplay products={products} />
            </div>
          </div>
        </div>

        {/* Mobile Window Display */}
        <div className="lg:hidden pb-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {products.slice(0, 4).map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 hover:scale-105 transition-all duration-300"
                  style={{
                    animation: 'fadeInScale 0.6s ease-out forwards',
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0
                  }}
                >
                  <div className="aspect-square relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/20 to-white/5 text-white text-xs p-2 text-center">
                        {product.name}
                      </div>
                    )}
                  </div>
                  
                  {/* Trending Badge */}
                  {index < 2 && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-2 py-0.5 rounded-full shadow-lg">
                      🔥
                    </div>
                  )}

                  {/* Price Badge */}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-0.5 rounded-full shadow-lg font-bold text-xs">
                    ${product.price.toFixed(2)}
                  </div>

                  {/* Product Name on Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-xs font-bold line-clamp-1">{product.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 md:h-20 fill-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="bg-white border-b border-gray-200 py-6 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <SearchBar products={products || []} />
        </div>
      </section>

      {/* Featured Products Showcase - Large Images */}
      {products.length > 0 && (
        <section className="bg-gradient-to-b from-white to-gray-50 py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-2 sm:mb-3">
                ✨ Trending Now
              </h2>
              <p className="text-sm sm:text-base text-gray-600">Hot products everyone is talking about</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {/* Featured Product 1 - Large */}
              {products[0] && (
                <div className="sm:col-span-2 md:col-span-2 md:row-span-2 group relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500">
                  <Link href={`/products/${products[0].id}`} className="block">
                    <div 
                      className="aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] overflow-hidden"
                      style={{
                        background: `linear-gradient(to bottom right, ${brandColors.primary}20, ${brandColors.accent}20)`
                      }}
                    >
                      {products[0].image_url ? (
                        <img
                          src={products[0].image_url}
                          alt={products[0].name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <div 
                        className="text-white text-xs px-2 sm:px-3 py-1 rounded-full mb-2 sm:mb-3"
                        style={{ backgroundColor: brandColors.primary || '#10B981' }}
                      >
                        Featured
                      </div>
                      <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 line-clamp-2">
                        {products[0].name}
                      </h3>
                      <p className="text-base sm:text-lg md:text-xl font-semibold" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        ${products[0].price}
                      </p>
                    </div>
                  </Link>
                </div>
              )}

              {/* Featured Products 2 & 3 - Medium */}
              {products.slice(1, 3).map((product, index) => (
                <div
                  key={product.id}
                  className="group relative rounded-xl sm:rounded-2xl overflow-hidden shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-500"
                >
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="aspect-square sm:aspect-[4/3] overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-sm sm:text-lg md:text-xl font-bold mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm sm:text-base md:text-lg font-semibold" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        ${product.price}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Auto-Scrolling Product Showcase */}
      <AutoScrollProducts products={products.slice(0, 20)} />

      {/* Promotional Banner - Image Grid */}
      {products.length >= 6 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {products.slice(3, 6).map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group relative aspect-[4/5] rounded-lg sm:rounded-xl overflow-hidden shadow-md sm:shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs sm:text-sm p-2">
                      {product.name}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-bold mb-1 text-xs sm:text-sm md:text-base line-clamp-2">{product.name}</h3>
                  <p className="font-semibold text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>${product.price}</p>
                </div>
                <div 
                  className="text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: brandColors.primary || '#10B981' }}
                >
                  View
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products Section - Enhanced */}
      <section id="products" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <div className="text-center mb-8 sm:mb-12 animate-slide-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-3 sm:mb-4">
            All Products
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Explore our curated collection of premium products designed to
            enhance your lifestyle
          </p>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          products={products}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Products Count */}
        <div className="text-center mb-6 text-gray-600">
          Showing {paginatedProducts.length} of {filteredProducts.length} products
          {selectedCategory && ` in ${selectedCategory}`}
        </div>

        {/* Product Grid */}
        <ProductGrid products={paginatedProducts} />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </section>

      {/* Features Section - Enhanced */}
      <section
        id="features"
        className="bg-gradient-to-br from-gray-50 to-indigo-50 py-12 sm:py-16 md:py-20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-3 sm:mb-4">
              Why Choose Us
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              We are committed to providing the best shopping experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md sm:shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div 
                className="rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg w-16 h-16 sm:w-20 sm:h-20"
                style={{
                  background: `linear-gradient(to bottom right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'})`
                }}
              >
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                Quality Guaranteed
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                All products are carefully selected and tested for quality
                assurance
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md sm:shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <Truck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                Fast Shipping
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Quick and reliable delivery to your doorstep worldwide
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md sm:shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <Star className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                Premium Support
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                24/7 customer support to help you with any questions
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md sm:shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                Secure Payment
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Your payment information is safe and encrypted with Stripe
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        className="text-white py-12 sm:py-16"
        style={{
          background: `linear-gradient(to right, ${brandColors.primary || '#10B981'}, ${brandColors.accent || '#059669'})`
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">{featureStats.customers}</div>
              <div className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">{featureStats.products}</div>
              <div className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Products</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">{featureStats.countries}</div>
              <div className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Countries</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">{featureStats.support}</div>
              <div className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
