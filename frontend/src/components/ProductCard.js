import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuote } from "@/context/QuoteContext";

const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export default function ProductCard({ product }) {
  const { addItem } = useQuote();

  return (
    <div data-testid="product-card" className="group relative flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-neutral-300 transition-all duration-300 hover:-translate-y-1">
      <Link to={`/product/${product.id}`} data-testid={`product-link-${product.item_code}`}>
        <div className="aspect-square bg-neutral-50 p-4 flex items-center justify-center relative overflow-hidden">
          <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          {!product.in_stock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <Badge variant="secondary" className="w-fit mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">{product.category}</Badge>
        <Link to={`/product/${product.id}`} className="hover:text-brand-primary transition-colors">
          <h3 className="font-heading font-semibold text-neutral-900 mb-1 line-clamp-2 leading-tight text-sm">{product.name}</h3>
        </Link>
        <div className="mt-auto pt-3">
          <p className="text-lg font-bold text-neutral-900 font-heading">{formatPrice(product.price)}<span className="text-xs font-normal text-neutral-500 ml-1">/ {product.uom}</span></p>
          {product.moq > 1 && <p className="text-xs text-neutral-400 mt-0.5">Min: {product.moq} {product.uom}</p>}
        </div>
        <Button
          data-testid="add-to-quote-button"
          variant="outline"
          className="w-full mt-3 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-medium text-sm transition-colors"
          onClick={(e) => { e.preventDefault(); addItem(product, product.moq || 1); }}
          disabled={!product.in_stock}
        >
          <Plus className="h-4 w-4 mr-1" /> Add to Quote
        </Button>
      </div>
    </div>
  );
}
