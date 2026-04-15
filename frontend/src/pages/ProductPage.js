import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ChevronRight, Plus, Minus, Download, CheckCircle, XCircle, ArrowLeft, MessageCircle, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuote } from "@/context/QuoteContext";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/Skeleton";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

export default function ProductPage() {
  const { id } = useParams();
  const { addItem } = useQuote();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [allMedia, setAllMedia] = useState([]);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/products/${id}`).then(({ data }) => {
      setProduct(data);
      setQuantity(data.moq || 1);

      // Add to recently viewed
      addToRecentlyViewed(data);

      // Build media gallery - always include image_url first if it exists
      const media = [];
      if (data.image_url && data.image_url.trim()) {
        media.push({ type: 'image', url: data.image_url });
      }
      if (data.images && data.images.length > 0) {
        data.images.forEach(img => {
          if (img && img.trim() && img !== data.image_url) {
            media.push({ type: 'image', url: img });
          }
        });
      }
      if (data.videos && data.videos.length > 0) {
        data.videos.forEach(vid => {
          if (vid && vid.trim()) {
            media.push({ type: 'video', url: vid });
          }
        });
      }
      setAllMedia(media);
      setCurrentMediaIndex(0);

      // If similar products not provided by backend, fetch by category
      if (!data.similar_products || data.similar_products.length === 0) {
        fetchSimilarProducts(data.category, data.id);
      } else {
        setSimilarProducts(data.similar_products);
      }
    }).catch(() => toast.error("Product not found")).finally(() => setLoading(false));
  }, [id]);

  const addToRecentlyViewed = (product) => {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const filtered = viewed.filter(p => p.id !== product.id);
    const updated = [product, ...filtered].slice(0, 8); // Keep max 8 items
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    setRecentlyViewed(updated);
  };

  const fetchSimilarProducts = async (category, currentProductId) => {
    try {
      const { data } = await axios.get(`${API}/products`, {
        params: { category, limit: 4 }
      });
      const filtered = data.products.filter(p => p.id !== currentProductId);
      setSimilarProducts(filtered.slice(0, 4));
    } catch (err) {
      console.error("Error fetching similar products:", err);
    }
  };

  if (loading) {
    return (
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <Skeleton className="aspect-square lg:aspect-auto lg:min-h-[400px] rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="w-24 h-6" />
            <Skeleton className="w-3/4 h-10" />
            <Skeleton className="w-1/4 h-6" />
            <Skeleton className="w-full h-24" />
            <div className="space-y-2">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-32 h-10" />
            </div>
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-1/2 h-12" />
          </div>
        </div>
      </main>
    );
  }
  if (!product) return <div className="text-center py-32 text-neutral-500">Product not found</div>;

  const handleAddToQuote = () => {
    addItem(product, quantity);
    toast.success(`${product.name} added to quote`);
  };

  const handleDatasheetRequest = () => {
    const msg = `Hello Energica Solutions, I would like to request the datasheet for: ${product.name} (${product.item_code}). Please share it on my email/WhatsApp. Thank you!`;
    window.open(`https://wa.me/918007520000?text=${encodeURIComponent(msg)}`, '_blank');
    toast.info("Datasheet request sent via WhatsApp");
  };

  const handlePreviousMedia = () => {
    setCurrentMediaIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };

  const handleNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
  };

  const handleMediaClick = (index) => {
    setCurrentMediaIndex(index);
  };

  return (
    <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6" data-testid="breadcrumb">
        <Link to="/" className="hover:text-brand-primary transition-colors flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Products</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-brand-primary transition-colors">{product.category}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-16">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="bg-neutral-50 rounded-2xl p-4 sm:p-8 flex items-center justify-center border border-neutral-100 aspect-square lg:aspect-auto lg:min-h-[400px] relative" data-testid="product-image-container">
            {allMedia[currentMediaIndex]?.type === 'video' ? (
              <video
                src={allMedia[currentMediaIndex].url}
                controls
                className="max-h-60 sm:max-h-80 max-w-full object-contain"
              />
            ) : (
              <img
                src={allMedia[currentMediaIndex]?.url || product.image_url}
                alt={product.name}
                className="max-h-60 sm:max-h-80 max-w-full object-contain"
              />
            )}
          </div>
          {allMedia.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allMedia.map((media, index) => (
                <button
                  key={index}
                  onClick={() => handleMediaClick(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    currentMediaIndex === index ? 'border-brand-primary' : 'border-neutral-200'
                  }`}
                >
                  {media.type === 'video' ? (
                    <video src={media.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={media.url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div data-testid="product-details">
          <Badge variant="secondary" className="mb-3 text-xs font-bold uppercase tracking-wider">{product.category}</Badge>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-2" data-testid="product-title">{product.name}</h1>
          {product.item_code && <p className="text-sm text-neutral-400 mb-4">SKU: {product.item_code}</p>}

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl sm:text-3xl font-bold font-heading text-neutral-900" data-testid="product-price">{formatPrice(product.price)}</span>
            <span className="text-sm sm:text-base text-neutral-500">/ {product.uom}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-6" data-testid="stock-status">
            {product.in_stock ? (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" /> In Stock ({product.stock} available)</Badge>
            ) : (
              <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Out of Stock</Badge>
            )}
            {product.gst_rate && <Badge variant="outline" className="text-xs">GST: {product.gst_rate}%</Badge>}
          </div>

          <p className="text-neutral-600 leading-relaxed mb-6 text-sm sm:text-base" data-testid="product-description">{product.description}</p>

          <Separator className="my-6" />

          {/* Quantity & Add to Quote */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <Label className="text-sm font-medium text-neutral-700">Quantity:</Label>
            <div className="flex items-center border border-neutral-200 rounded-lg">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-r-none" onClick={() => setQuantity(Math.max(product.moq || 1, quantity - 1))} data-testid="detail-decrease-qty">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-16 text-center font-medium text-sm">{quantity} {product.uom}</span>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-l-none" onClick={() => setQuantity(quantity + 1)} data-testid="detail-increase-qty">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {product.moq > 1 && <span className="text-xs text-neutral-400">Min: {product.moq}</span>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button
              data-testid="detail-add-to-quote-button"
              className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-4 sm:py-6"
              onClick={handleAddToQuote}
              disabled={!product.in_stock}
            >
              <Plus className="h-4 w-4 mr-2" /> Add to Quote
            </Button>
            <Button variant="outline" className="py-4 sm:py-6" onClick={handleDatasheetRequest} data-testid="download-datasheet-btn">
              <Download className="h-4 w-4 mr-2" /> Datasheet
            </Button>
          </div>

          <Button variant="outline" className="w-full border-brand-whatsapp text-brand-whatsapp hover:bg-brand-whatsapp hover:text-white py-4 sm:py-5" onClick={handleDatasheetRequest} data-testid="whatsapp-enquiry-btn">
            <MessageCircle className="h-4 w-4 mr-2" /> Enquire on WhatsApp
          </Button>
        </div>
      </div>

      {/* Features & Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16">
        {product.features?.length > 0 && (
          <div className="bg-neutral-50 rounded-xl p-4 sm:p-6 border border-neutral-100" data-testid="product-features">
            <h2 className="font-heading font-semibold text-base sm:text-lg text-neutral-900 mb-4">Key Features</h2>
            <ul className="space-y-3">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-neutral-700">
                  <CheckCircle className="h-4 w-4 text-brand-primary mt-0.5 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {product.applications?.length > 0 && (
          <div className="bg-neutral-50 rounded-xl p-4 sm:p-6 border border-neutral-100" data-testid="product-applications">
            <h2 className="font-heading font-semibold text-base sm:text-lg text-neutral-900 mb-4">Applications</h2>
            <ul className="space-y-3">
              {product.applications.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-neutral-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-primary mt-1.5 flex-shrink-0" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section data-testid="similar-products" className="mb-16">
          <h2 className="font-heading font-semibold text-xl sm:text-2xl text-neutral-900 mb-6">Similar Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {similarProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 1 && (
        <section data-testid="recently-viewed">
          <h2 className="font-heading font-semibold text-xl sm:text-2xl text-neutral-900 mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {recentlyViewed.filter(p => p.id !== product.id).slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Label({ children, className = "" }) {
  return <label className={className}>{children}</label>;
}
