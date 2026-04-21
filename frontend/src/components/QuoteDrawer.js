import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, Package, ArrowRight } from "lucide-react";
import { useQuote } from "@/context/QuoteContext";
import { useNavigate } from "react-router-dom";

const formatPrice = (p) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

export default function QuoteDrawer() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalAmount, isDrawerOpen, setIsDrawerOpen } = useQuote();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-neutral-100">
          <SheetTitle className="font-heading text-xl">Your Quote ({totalItems} items)</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 font-medium">Your quote is empty</p>
              <p className="text-sm text-neutral-400 mt-1">Add products to get started</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.product.id} data-testid={`quote-item-${item.product.id}`} className="flex gap-3 p-3 rounded-lg border border-neutral-100 bg-neutral-50/50">
                  <img src={item.product.image_url} alt={item.product.name} className="w-16 h-16 object-contain rounded-md bg-white border border-neutral-100 p-1" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-neutral-900 line-clamp-1">{item.product.name}</h4>
                    <p className="text-sm font-semibold text-neutral-700 mt-0.5">{formatPrice(item.product.price)}<span className="text-xs font-normal text-neutral-400">/{item.product.uom}</span></p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} data-testid="decrease-qty-btn">
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} data-testid="increase-qty-btn">
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="text-xs text-neutral-400 ml-1">{item.product.uom}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeItem(item.product.id)} className="text-neutral-400 hover:text-red-500 transition-colors" data-testid="remove-item-btn">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <p className="text-sm font-bold text-neutral-900">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 px-6 py-4 space-y-4 bg-neutral-50/50">
              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Estimated Total</span>
                <span className="text-xl font-bold font-heading text-neutral-900">{formatPrice(totalAmount)}</span>
              </div>
              <p className="text-xs text-neutral-400">* Final pricing subject to confirmation</p>

              <Button
                data-testid="proceed-checkout-button"
                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-6 text-base shadow-sm"
                onClick={handleCheckout}
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              <Button variant="outline" className="w-full text-neutral-700 text-sm font-medium" onClick={() => setIsDrawerOpen(false)}>
                Continue Shopping
              </Button>

              <Button variant="ghost" className="w-full text-neutral-400 text-xs" onClick={clearCart} data-testid="clear-cart-btn">
                Clear All Items
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
