import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Search, SlidersHorizontal, ChevronDown, Loader2 } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState("name_asc");
  const [stockFilter, setStockFilter] = useState("");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (p = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const params = { page: p, limit: 20, sort };
      if (selectedCategory) params.category = selectedCategory;
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
  }, [selectedCategory, searchQuery, sort, stockFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/categories`);
      setCategories(data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    const s = searchParams.get("search");
    if (s) setSearchQuery(s);
  }, [searchParams]);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { search: searchQuery } : {});
  };

  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner */}
      <div data-testid="store-hero" className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-neutral-900 to-neutral-800" style={{ minHeight: '200px' }}>
        <img src="https://images.unsplash.com/photo-1726795867801-63c0a37b80c6?w=1200&q=80" alt="Solar" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative z-10 p-8 sm:p-12 flex flex-col justify-center" style={{ minHeight: '200px' }}>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">Energica Solutions Store</h1>
          <p className="text-neutral-300 text-base sm:text-lg max-w-xl">Your trusted partner for premium solar PV system components & BOS materials. Powering solar projects, end-to-end.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <Button variant="outline" onClick={() => setMobileSidebar(!mobileSidebar)} className="w-full justify-between" data-testid="mobile-filter-toggle">
            <span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filter by Category</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileSidebar ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Sidebar */}
        <aside className={`lg:col-span-3 xl:col-span-2 ${mobileSidebar ? 'block' : 'hidden'} lg:block lg:sticky lg:top-24`}>
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-neutral-500 mb-3">Categories</h2>
            <div className="space-y-1">
              <button
                data-testid="category-filter-all"
                onClick={() => handleCategoryClick("")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedCategory ? 'bg-brand-primary text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}
              >
                All Products <span className="text-xs opacity-70 ml-1">({total})</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat.name}
                  data-testid={`category-filter-${cat.name.toLowerCase().replace(/[\s&]+/g, '-')}`}
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat.name ? 'bg-brand-primary text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}
                >
                  {cat.name} <span className="text-xs opacity-70 ml-1">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-9 xl:col-span-10">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input data-testid="store-search-input" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-full sm:w-56 h-9" />
              </form>
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
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
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
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
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
