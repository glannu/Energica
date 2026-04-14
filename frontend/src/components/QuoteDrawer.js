import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Minus, MessageCircle, Truck, Package, Building, CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";
import { useQuote } from "@/context/QuoteContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

const TRANSIT_ICONS = { "Ex-Works": Package, "Door Delivery": Truck, "Transport/Freight": Building };

export default function QuoteDrawer() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalAmount, isDrawerOpen, setIsDrawerOpen } = useQuote();
  const [transitMode, setTransitMode] = useState("Ex-Works");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [submittedRFQDetails, setSubmittedRFQDetails] = useState(null);

  // Reset success screen when drawer opens with items
  useEffect(() => {
    if (isDrawerOpen && items.length > 0) {
      setShowSuccessScreen(false);
    }
  }, [isDrawerOpen, items.length]);

  const handleWhatsAppSubmit = async () => {
    if (items.length === 0) return;

    try {
      await axios.post(`${API}/rfq`, {
        items: items.map(i => ({ product_id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity, uom: i.product.uom })),
        transit_mode: transitMode,
        customer_name: customerName,
        customer_phone: customerPhone,
      });
    } catch (err) {
      console.error("RFQ save error:", err);
    }

    let msg = `Hello Energica Solutions,\n\nI would like to request a quote for:\n\n`;
    items.forEach((item, i) => {
      msg += `${i + 1}. ${item.product.name} x ${item.quantity} ${item.product.uom} (${formatPrice(item.product.price)}/${item.product.uom})\n`;
    });
    msg += `\nTransit Mode: ${transitMode}\n`;
    msg += `Estimated Total: ${formatPrice(totalAmount)}\n`;
    if (customerName) msg += `Name: ${customerName}\n`;
    if (customerPhone) msg += `Phone: ${customerPhone}\n`;
    msg += `\nPlease share your best quotation.\nThank you!`;

    // Store RFQ details for success screen
    setSubmittedRFQDetails({
      itemCount: items.length,
      totalAmount,
      customerName,
      customerPhone,
      transitMode
    });

    // Clear cart
    clearCart();

    // Open WhatsApp
    window.open(`https://wa.me/918007520000?text=${encodeURIComponent(msg)}`, '_blank');

    // Show success screen
    setShowSuccessScreen(true);
    toast.success("RFQ sent successfully!");
  };

  const handleStartFresh = () => {
    setShowSuccessScreen(false);
    setCustomerName("");
    setCustomerPhone("");
    setTransitMode("Ex-Works");
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-neutral-100">
          <SheetTitle className="font-heading text-xl">Your Quote ({totalItems} items)</SheetTitle>
        </SheetHeader>

        {showSuccessScreen ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">RFQ Sent Successfully!</h3>
              <p className="text-neutral-600 mb-6">Your request has been submitted via WhatsApp. Our team will get back to you with the best quotation.</p>

              <div className="bg-neutral-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">RFQ Summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Items</span>
                    <span className="font-medium text-neutral-900">{submittedRFQDetails?.itemCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Estimated Total</span>
                    <span className="font-medium text-neutral-900">{formatPrice(submittedRFQDetails?.totalAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Transit Mode</span>
                    <span className="font-medium text-neutral-900">{submittedRFQDetails?.transitMode || 'Ex-Works'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleStartFresh}
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-medium"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Start New RFQ
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full"
                >
                  Continue Browsing
                </Button>
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
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
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 block">Transit Mode</Label>
                <Select value={transitMode} onValueChange={setTransitMode} data-testid="transit-mode-select">
                  <SelectTrigger className="w-full" data-testid="transit-mode-trigger">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Ex-Works", "Door Delivery", "Transport/Freight"].map(mode => {
                      const Icon = TRANSIT_ICONS[mode];
                      return (
                        <SelectItem key={mode} value={mode} data-testid={`transit-${mode.toLowerCase().replace(/[\s/]+/g, '-')}`}>
                          <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{mode}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-neutral-500 mb-1 block">Your Name</Label>
                  <Input data-testid="customer-name-input" placeholder="Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-neutral-500 mb-1 block">Phone</Label>
                  <Input data-testid="customer-phone-input" placeholder="Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="h-9 text-sm" />
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Estimated Total</span>
                <span className="text-xl font-bold font-heading text-neutral-900">{formatPrice(totalAmount)}</span>
              </div>
              <p className="text-xs text-neutral-400">* Final pricing subject to confirmation</p>

              <Button
                data-testid="submit-whatsapp-rfq-button"
                className="w-full bg-brand-whatsapp hover:bg-brand-whatsapp-hover text-white font-bold py-6 text-base shadow-sm"
                onClick={handleWhatsAppSubmit}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Send RFQ via WhatsApp
              </Button>

              <Button variant="ghost" className="w-full text-neutral-500 text-sm" onClick={clearCart} data-testid="clear-cart-btn">
                Clear All Items
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
