import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuote } from "@/context/QuoteContext";
import { Skeleton } from "@/components/Skeleton";

const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export default function ProductCard({ product, loading }) {
  const { addItem } = useQuote();

  if (loading) {
    return (
      <div className="flex h-full flex-col bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <Skeleton className="aspect-[4/3] w-full" />
        <div className="p-3 flex flex-col flex-grow">
          <Skeleton className="w-16 h-5 mb-1.5" />
          <Skeleton className="w-full h-10 mb-2" />
          <div className="mt-auto">
            <Skeleton className="w-24 h-6 mb-0.5" />
            <Skeleton className="w-16 h-4" />
          </div>
          <Skeleton className="w-full h-8 mt-2.5" />
        </div>
      </div>
    );
  }

  return (
    <div data-testid="product-card" className="group relative flex h-full flex-col bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-[0_6px_20px_rgb(0,0,0,0.05)] hover:border-neutral-300 transition-all duration-300 hover:-translate-y-0.5">
      <Link to={`/product/${product.id}`} data-testid={`product-link-${product.item_code}`}>
        <div className="aspect-[4/3] bg-neutral-50 p-2 sm:p-3 flex items-center justify-center relative overflow-hidden">
          <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          {!product.in_stock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>
      <div className="p-3 flex flex-col flex-grow">
        <Badge variant="secondary" className="w-fit mb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">{product.category}</Badge>
        <Link to={`/product/${product.id}`} className="hover:text-brand-primary transition-colors">
          <h3 className="font-heading font-semibold text-neutral-900 mb-1 line-clamp-2 leading-tight text-[13px]">{product.name}</h3>
        </Link>
        <div className="mt-auto pt-2">
          <p className="text-base font-bold text-neutral-900 font-heading">{formatPrice(product.price)}<span className="text-[11px] font-normal text-neutral-500 ml-1">/ {product.uom}</span></p>
          {product.moq > 1 && <p className="text-xs text-neutral-400 mt-0.5">Min: {product.moq} {product.uom}</p>}
        </div>
        <Button
          data-testid="add-to-quote-button"
          variant="outline"
          className="w-full mt-2.5 h-8 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-medium text-xs transition-colors"
          onClick={(e) => { e.preventDefault(); addItem(product, product.moq || 1); }}
          disabled={!product.in_stock}
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add to Quote
        </Button>
      </div>
    </div>
  );
}
