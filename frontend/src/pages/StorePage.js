import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { SlidersHorizontal, ChevronDown, Loader2, ChevronLeft, ChevronRight, X, Zap, ShieldCheck, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import ProductCard from "@/components/ProductCard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState("name_asc");
  const [stockFilter, setStockFilter] = useState("");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const categoryScrollRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80",
      title: "Best Price Guarantee",
      subtitle: "Unbeatable rates on every component",
      description: "Single items at lowest prices with additional discounts on bulk purchases. Premium quality solar components at prices that power your profits.",
      badge: "Best Prices",
      badgeIcon: <ShieldCheck className="h-3.5 w-3.5" />,
      gradient: "from-emerald-900/90 via-emerald-900/70 to-transparent",
      accentColor: "bg-emerald-500",
      cta: "Explore Products"
    },
    {
      image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=80",
      title: "Bulk & Bundle Deals",
      subtitle: "Wholesale pricing for contractors",
      description: "Complete solar kits and bundle packages at wholesale prices. Perfect for contractors, installers, and large-scale projects.",
      badge: "Bulk Savings",
      badgeIcon: <Package className="h-3.5 w-3.5" />,
      gradient: "from-blue-900/90 via-blue-900/70 to-transparent",
      accentColor: "bg-blue-500",
      cta: "View Deals"
    },
    {
      image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1200&q=80",
      title: "MC4 Connector Special",
      subtitle: "Limited time offer — just ₹10/pair",
      description: "Stock up on MC4 connectors at unbeatable prices. High-quality, weather-resistant connectors for all your solar installations.",
      badge: "Hot Deal",
      badgeIcon: <Zap className="h-3.5 w-3.5" />,
      gradient: "from-orange-900/90 via-orange-900/70 to-transparent",
      accentColor: "bg-orange-500",
      cta: "Shop Now"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const fetchProducts = useCallback(async (p = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const params = { page: p, limit: 20, sort };
      if (selectedCategory) params.category = selectedCategory;
      const searchQuery = searchParams.get("search");
      if (searchQuery) params.search = searchQuery;
      if (stockFilter) params.in_stock = stockFilter;
      const { data } = await axios.get(`${API}/products`, { params });
      setProducts(prev => append ? [...prev, ...data.products] : data.products);
      setTotal(data.total);
      setTotalPages(data.total_pages);
      setPage(p);
      setHasMore(p < data.total_pages);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  }, [selectedCategory, sort, stockFilter, searchParams]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/categories`);
      setCategories(data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(1, false);
  }, [fetchProducts]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchProducts(page + 1, true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const sentinel = document.getElementById('infinite-scroll-sentinel');
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasMore, loadingMore, loading, page, fetchProducts]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat === selectedCategory ? "" : cat);
    setMobileSidebar(false);
  };

  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner Carousel */}
      <div data-testid="store-hero" className="relative rounded-2xl overflow-hidden mb-8 shadow-xl" style={{ height: '320px' }}>
        {/* All slides stacked — crossfade via opacity */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: currentSlide === index ? 1 : 0, zIndex: currentSlide === index ? 1 : 0 }}
          >
            {/* Background image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
            {/* Bottom vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-12 lg:px-16 max-w-2xl">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-semibold mb-4 w-fit ${slide.accentColor}`}>
                {slide.badgeIcon}
                {slide.badge}
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-2 drop-shadow-lg">
                {slide.title}
              </h1>
              <p className="text-white/80 text-sm sm:text-base font-medium mb-1">{slide.subtitle}</p>
              <p className="text-white/60 text-sm sm:text-base max-w-lg leading-relaxed mb-6 hidden sm:block">
                {slide.description}
              </p>
              <div>
                <button className="inline-flex items-center gap-2 bg-white text-neutral-900 font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-neutral-100 transition-colors shadow-lg">
                  {slide.cta}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hidden sm:flex items-center justify-center text-white hover:bg-white/40 transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hidden sm:flex items-center justify-center text-white hover:bg-white/40 transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots + Progress */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
              style={{ width: currentSlide === index ? '2rem' : '0.5rem' }}
            >
              <span className={`absolute inset-0 rounded-full transition-colors ${currentSlide === index ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Categories Horizontal Scroll */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          {selectedCategory && (
            <div className="mb-3">
              <Button variant="ghost" size="sm" onClick={() => handleCategoryClick("")} className="text-brand-primary hover:text-brand-primary-hover">
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
          )}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollCategories('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div ref={categoryScrollRef} className="overflow-x-auto scrollbar-hide px-10">
              <div className="flex gap-3 pb-2">
                <button
                  data-testid="category-filter-all"
                  onClick={() => handleCategoryClick("")}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:shadow-md flex-shrink-0 ${!selectedCategory ? 'border-brand-primary bg-brand-primary/5' : 'border-neutral-200 hover:border-neutral-300'}`}
                >
                  <img src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=100&q=60" alt="All Products" className="w-20 h-20 rounded-lg object-cover mb-2" loading="lazy" />
                  <span className="text-sm font-medium text-center">All Products</span>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.name}
                    data-testid={`category-filter-${cat.name.toLowerCase().replace(/[\s&]+/g, '-')}`}
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:shadow-md flex-shrink-0 ${selectedCategory === cat.name ? 'border-brand-primary bg-brand-primary/5' : 'border-neutral-200 hover:border-neutral-300'}`}
                  >
                    <img src={cat.image_url || "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=100&q=60"} alt={cat.name} className="w-20 h-20 rounded-lg object-cover mb-2" loading="lazy" />
                    <span className="text-sm font-medium text-center line-clamp-2 w-20">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollCategories('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md flex-shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-neutral-200" onClick={() => setSelectedCategory("")}>
                  {selectedCategory} <span className="ml-1 text-neutral-400">&times;</span>
                </Badge>
              )}
              <span className="text-sm text-neutral-500">{total} products</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-32 h-9 text-sm flex-shrink-0" data-testid="stock-filter-select">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="true">In Stock</SelectItem>
                  <SelectItem value="false">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-40 h-9 text-sm flex-shrink-0" data-testid="sort-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price_asc">Price (Low-High)</SelectItem>
                  <SelectItem value="price_desc">Price (High-Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Product Grid */}
          {loading && products.length === 0 ? (
            <div data-testid="product-grid" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
              {[...Array(10)].map((_, i) => (
                <ProductCard key={`skeleton-${i}`} loading />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500 text-lg">No products found</p>
              <p className="text-neutral-400 text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <>
              <div data-testid="product-grid" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                {products.map((product, i) => (
                  <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              {/* Infinite scroll sentinel */}
              <div id="infinite-scroll-sentinel" className="h-4" />
              {loadingMore && (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                  {[...Array(4)].map((_, i) => (
                    <ProductCard key={`skeleton-more-${i}`} loading />
                  ))}
                </div>
              )}
              {!hasMore && products.length > 0 && (
                <div className="text-center py-8 text-neutral-400 text-sm">
                  Showing all {total} products
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-neutral-200 pt-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src="https://www.energicasolutions.com/Energica%20Logo%20-1-.webp" alt="Energica" className="h-10 mb-3" />
            <p className="text-sm text-neutral-500 leading-relaxed">Energica Solutions Pvt. Ltd., Pune. Trusted distributor of solar PV system components and BOS materials.</p>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-neutral-500 mb-3">Contact</h3>
            <p className="text-sm text-neutral-600">Toll Free: 1800 267 8283</p>
            <p className="text-sm text-neutral-600 mt-1">Email: salesenergicasolutions@gmail.com</p>
            <p className="text-sm text-neutral-600 mt-1">WhatsApp: +91 8007520000</p>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-neutral-500 mb-3">Quick Links</h3>
            <p className="text-sm text-neutral-600 hover:text-brand-primary cursor-pointer">All Products</p>
            <p className="text-sm text-neutral-600 mt-1 hover:text-brand-primary cursor-pointer">About Us</p>
            <p className="text-sm text-neutral-600 mt-1 hover:text-brand-primary cursor-pointer">Terms & Conditions</p>
          </div>
        </div>
        <Separator className="my-6" />
        <p className="text-xs text-neutral-400 text-center">&copy; {new Date().getFullYear()} Energica Solutions Private Limited. All rights reserved.</p>
      </footer>
    </main>
  );
}
