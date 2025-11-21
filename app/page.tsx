'use client'

import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase/client";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import Pagination from "@/components/Pagination";
import { Sparkles, Truck, Shield, Star, TrendingUp } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Product } from "@/types";
import { useSearchParams, useRouter } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 24; // Increased from 12 to show more products
  const supabase = createSupabaseClient();

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
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading products:', error);
      }
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
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[600px] md:min-h-[700px]">
            
            {/* Left: Text Content */}
            <div className="py-16 md:py-24 relative z-10">
              <div className="animate-fade-in">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Premium Quality Products
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
                  Welcome to Ecommerce Start
                </h1>
                <p className="text-lg md:text-xl mb-8 text-blue-100 leading-relaxed drop-shadow-lg">
                  Discover amazing products at unbeatable prices. Shop the latest
                  trends and technology with confidence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="#products"
                    className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2 shadow-2xl hover:shadow-indigo-500/50 transition-all"
                  >
                    <span>Shop Now</span>
                    <TrendingUp className="w-5 h-5" />
                  </Link>
                  <Link
                    href="#features"
                    className="btn-secondary text-lg px-8 py-4 text-center shadow-xl"
                  >
                    Learn More
                  </Link>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/20">
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">500+</div>
                    <div className="text-sm text-blue-100">Products</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">10K+</div>
                    <div className="text-sm text-blue-100">Customers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">24/7</div>
                    <div className="text-sm text-blue-100">Support</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: STUNNING Product Images Grid */}
            <div className="relative py-8 lg:py-16 hidden lg:block">
              {/* Animated glow effects */}
              <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-pink-400/30 rounded-full filter blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-400/30 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

              <div className="relative z-10 grid grid-cols-2 gap-4">
                {/* Large Featured Product */}
                {products[0] && (
                  <div className="col-span-2 group relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-pink-500/50 transition-all duration-500 animate-fade-in">
                    <div className="aspect-[16/10] bg-white/10 backdrop-blur-sm">
                      {products[0].image_url ? (
                        <img
                          src={products[0].image_url}
                          alt={products[0].name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : null}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="inline-block bg-pink-500 text-white text-xs px-3 py-1 rounded-full mb-2">
                        Trending
                      </div>
                      <h3 className="text-xl font-bold mb-1">{products[0].name}</h3>
                      <p className="text-lg font-semibold text-pink-200">${products[0].price}</p>
                    </div>
                  </div>
                )}

                {/* Two smaller products */}
                {products.slice(1, 3).map((product, index) => (
                  <div
                    key={product.id}
                    className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-indigo-500/50 transition-all duration-500 animate-fade-in"
                    style={{ animationDelay: `${(index + 1) * 0.2}s` }}
                  >
                    <div className="aspect-square bg-white/10 backdrop-blur-sm">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : null}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-sm font-bold mb-1 truncate">{product.name}</h3>
                      <p className="text-base font-semibold text-indigo-200">${product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Product Preview */}
        <div className="lg:hidden pb-8">
          <div className="container mx-auto px-4">
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {products.slice(0, 5).map((product, index) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-32 group relative rounded-xl overflow-hidden shadow-lg"
                  style={{
                    animation: 'fadeInScale 0.6s ease-out forwards',
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0
                  }}
                >
                  <div className="aspect-square bg-white/10">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                    <p className="text-xs font-semibold text-pink-200">${product.price}</p>
                  </div>
                </div>
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
        <section className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-3">
                ✨ Trending Now
              </h2>
              <p className="text-gray-600">Hot products everyone is talking about</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Featured Product 1 - Large */}
              {products[0] && (
                <div className="md:col-span-2 md:row-span-2 group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
                  <Link href={`/products/${products[0].id}`} className="block">
                    <div className="aspect-[16/10] md:aspect-[16/9] overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
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
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="inline-block bg-indigo-600 text-white text-xs px-3 py-1 rounded-full mb-3">
                        Featured
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">
                        {products[0].name}
                      </h3>
                      <p className="text-lg md:text-xl font-semibold text-indigo-200">
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
                  className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500"
                >
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100">
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
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-lg md:text-xl font-bold mb-1">
                        {product.name}
                      </h3>
                      <p className="text-base md:text-lg font-semibold text-indigo-200">
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

      {/* Promotional Banner - Image Grid */}
      {products.length >= 6 && (
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {products.slice(3, 6).map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group relative aspect-[4/5] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      {product.name}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-bold mb-1 text-sm md:text-base">{product.name}</h3>
                  <p className="font-semibold text-indigo-200">${product.price}</p>
                </div>
                <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  View
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products Section - Enhanced */}
      <section id="products" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12 animate-slide-in">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            All Products
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
        className="bg-gradient-to-br from-gray-50 to-indigo-50 py-20"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We are committed to providing the best shopping experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Quality Guaranteed
              </h3>
              <p className="text-gray-600 leading-relaxed">
                All products are carefully selected and tested for quality
                assurance
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Truck className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Fast Shipping
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Quick and reliable delivery to your doorstep worldwide
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Premium Support
              </h3>
              <p className="text-gray-600 leading-relaxed">
                24/7 customer support to help you with any questions
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Secure Payment
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your payment information is safe and encrypted with Stripe
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-indigo-200">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-indigo-200">Products</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-indigo-200">Countries</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-indigo-200">Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
