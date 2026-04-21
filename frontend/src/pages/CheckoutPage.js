import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useQuote } from "@/context/QuoteContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TRANSIT_MODES = ["Ex-Works", "Door Delivery", "Transport/Freight", "Bluedart Air", "Bluedart Road", "Delhivery Road", "By Hand", "Porter to Pay", "Transport to Pay", "Self courier"];
const formatPrice = (p) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalItems, totalAmount, clearCart } = useQuote();
  const [transitMode, setTransitMode] = useState("Ex-Works");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sanitizedPhone = useMemo(() => customerPhone.replaceAll(/[^\d+]/g, "").trim(), [customerPhone]);

  const submitRFQ = async () => {
    if (items.length === 0 || submitting) return;

    if (!sanitizedPhone) {
      toast.error("Phone number is required to place RFQ.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/rfq`, {
        items: items.map((i) => ({
          product_id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          uom: i.product.uom
        })),
        transit_mode: transitMode,
        customer_name: customerName.trim(),
        customer_phone: sanitizedPhone,
        gst_number: gstNumber.trim() || undefined,
        notes: notes.trim()
      });

      let msg = "Hello Energica Solutions,\n\nI would like to request a quote for:\n\n";
      items.forEach((item, idx) => {
        msg += `${idx + 1}. ${item.product.name} x ${item.quantity} ${item.product.uom} (${formatPrice(item.product.price)}/${item.product.uom})\n`;
      });
      msg += `\nTransit Mode: ${transitMode}\n`;
      msg += `Estimated Total: ${formatPrice(totalAmount)}\n`;
      if (customerName.trim()) msg += `Name: ${customerName.trim()}\n`;
      msg += `Phone: ${sanitizedPhone}\n`;
      if (gstNumber.trim()) msg += `GST No: ${gstNumber.trim()}\n`;
      if (notes.trim()) msg += `Notes: ${notes.trim()}\n`;
      msg += "\nPlease share your best quotation.\nThank you!";

      window.open(`https://wa.me/918007520000?text=${encodeURIComponent(msg)}`, "_blank");
      clearCart();
      toast.success("RFQ sent successfully!");
      navigate("/");
    } catch (err) {
      console.error("RFQ submit error:", err);
      toast.error("Failed to send RFQ. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-6">Checkout Details</h1>

      {items.length === 0 ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Your quote is empty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-600">Add products to quote and continue to checkout.</p>
            <Button asChild className="bg-brand-primary hover:bg-brand-primary-hover text-white">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer-name">Your Name</Label>
                <Input id="customer-name" placeholder="Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="customer-phone">Phone Number *</Label>
                <Input
                  id="customer-phone"
                  placeholder="Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="gst-number">GST Number (Optional)</Label>
                <Input
                  id="gst-number"
                  placeholder="e.g. 27AABCU9603R1ZM"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  maxLength={15}
                />
              </div>
              <div>
                <Label htmlFor="transit-mode">Transit Mode</Label>
                <Select value={transitMode} onValueChange={setTransitMode}>
                  <SelectTrigger id="transit-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSIT_MODES.map((mode) => (
                      <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any delivery or quotation details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-72 overflow-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-start gap-3 border-b border-neutral-100 pb-2">
                    <img src={item.product.image_url} alt={item.product.name} className="w-12 h-12 object-contain rounded bg-white border border-neutral-100 p-1" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-neutral-500">{formatPrice(item.product.price)} x {item.quantity} {item.product.uom}</p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-neutral-200 space-y-2">
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-neutral-900">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>
              <Button
                className="w-full bg-brand-whatsapp hover:bg-brand-whatsapp-hover text-white font-semibold"
                onClick={submitRFQ}
                disabled={submitting}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {submitting ? "Sending..." : "Send RFQ via WhatsApp"}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/">Back to Quote</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
