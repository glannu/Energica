import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Phone, Menu, X, Package, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuote } from "@/context/QuoteContext";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Header() {
  const { totalItems, setIsDrawerOpen } = useQuote();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState({ products: [], categories: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
      setShowDropdown(false);
    }
  };

  const fetchSearchResults = useCallback(async (query) => {
    if (query.trim().length < 2) {
      setSearchResults({ products: [], categories: [] });
      setShowDropdown(false);
      return;
    }

    setSearchLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/products`, { params: { search: query, limit: 5 } }),
        axios.get(`${API}/categories`)
      ]);

      const filteredCategories = categoriesRes.data.filter(cat =>
        cat.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3);

      setSearchResults({
        products: productsRes.data.products || [],
        categories: filteredCategories
      });
      setShowDropdown(true);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults({ products: [], categories: [] });
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        fetchSearchResults(searchQuery);
      } else {
        setShowDropdown(false);
        setSearchResults({ products: [], categories: [] });
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, fetchSearchResults]);

  return (
    <header data-testid="site-header" className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          <button data-testid="mobile-menu-btn" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <img src="https://www.energicasolutions.com/Energica%20Logo%20-1-.webp" alt="Energica Solutions" className="h-9 w-auto" />
          </Link>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                data-testid="search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowDropdown(searchQuery.length >= 2 && (searchResults.products.length > 0 || searchResults.categories.length > 0))}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="pl-10 bg-neutral-50 border-neutral-200 focus:bg-white h-10"
              />
            </div>
          </form>

          {/* Search Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-neutral-200 z-50 max-h-96 overflow-y-auto">
              {searchLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
                </div>
              ) : (
                <>
                  {searchResults.categories.length > 0 && (
                    <div className="p-3 border-b border-neutral-100">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Categories</p>
                      {searchResults.categories.map(cat => (
                        <Link
                          key={cat.name}
                          to={`/?category=${encodeURIComponent(cat.name)}`}
                          onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-neutral-50 text-sm text-neutral-700"
                        >
                          <Tag className="h-4 w-4 text-neutral-400" />
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.products.length > 0 && (
                    <div className="p-3">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Products</p>
                      {searchResults.products.map(product => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-neutral-50 text-sm text-neutral-700"
                        >
                          <Package className="h-4 w-4 text-neutral-400" />
                          <span className="flex-1 truncate">{product.name}</span>
                          <span className="text-xs text-neutral-400">₹{product.price}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.products.length === 0 && searchResults.categories.length === 0 && searchQuery.length >= 2 && (
                    <div className="p-4 text-center text-sm text-neutral-500">
                      No results found
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <a href="tel:18002678283" className="hidden lg:flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors" data-testid="phone-link">
            <Phone className="h-4 w-4" />
            <span className="font-medium">1800 267 8283</span>
          </a>
          <Link to="/admin/login" className="hidden md:flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors px-3 py-2 rounded-md hover:bg-neutral-50">
            Admin
          </Link>
          <button data-testid="mobile-search-btn" className="md:hidden p-2" onClick={() => setSearchOpen(!searchOpen)}>
            <Search className="h-5 w-5 text-neutral-600" />
          </button>
          <Button
            data-testid="quote-cart-button"
            variant="outline"
            className="relative border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
            onClick={() => setIsDrawerOpen(true)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Quote</span>
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-brand-primary text-white text-xs rounded-full" data-testid="cart-count-badge">
                {totalItems}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="md:hidden border-t border-neutral-100 px-4 py-3 bg-white">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input data-testid="mobile-search-input" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" autoFocus />
            <Button type="submit" size="sm" className="bg-brand-primary hover:bg-brand-primary-hover text-white">Search</Button>
          </form>
        </div>
      )}

      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-neutral-100 bg-white px-4 py-3 shadow-lg">
          <div className="flex flex-col gap-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md">All Products</Link>
            <a href="tel:18002678283" className="py-2 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md flex items-center gap-2"><Phone className="h-4 w-4" /> 1800 267 8283</a>
            <a href="mailto:salesenergicasolutions@gmail.com" className="py-2 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md">salesenergicasolutions@gmail.com</a>
            <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 text-sm font-medium text-neutral-500 hover:bg-neutral-50 rounded-md">Admin</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
