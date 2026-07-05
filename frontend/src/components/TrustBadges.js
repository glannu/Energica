import { ShieldCheck, Truck, ReceiptText, BadgeCheck, Lock } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, title: "Genuine Deye Distributor", sub: "Authentic products, sourced direct" },
  { icon: ReceiptText, title: "GST Invoice", sub: "Proper tax invoice on every order" },
  { icon: Truck, title: "Ships Across India", sub: "Dispatch from Pune, Maharashtra" },
  { icon: BadgeCheck, title: "Warranty Support", sub: "Manufacturer warranty assistance" },
  { icon: Lock, title: "Secure Payment", sub: "Verified bank transfer & UPI" },
];

// Reusable trust strip. Additive — drop into any page.
export default function TrustBadges({ className = "" }) {
  return (
    <section className={`bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 ${className}`} data-testid="trust-badges">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {ITEMS.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-start gap-2.5">
            <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-brand-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-brand-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-neutral-900 leading-tight">{title}</p>
              <p className="text-[11px] text-neutral-500 leading-tight mt-0.5 hidden sm:block">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
