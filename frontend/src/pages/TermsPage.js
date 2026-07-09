import { useEffect } from "react";
import { setSEO } from "@/lib/seo";

const SECTIONS = [
  {
    h: "1. About These Terms",
    p: ["These Terms and Conditions govern the use of solar.glannu.com (the \"Store\"), operated by Glannu Industries, Pune, Maharashtra (\"Glannu\", \"we\", \"us\"). By browsing the Store or submitting a quote request, you agree to these terms."],
  },
  {
    h: "2. Quotes, Not Orders",
    p: ["The Store works on a Request-for-Quotation (RFQ) model. Adding items to a quote and sending it to us on WhatsApp does not create a binding order. A contract is formed only when we confirm availability, final pricing and payment terms in writing, and payment is received as agreed."],
  },
  {
    h: "3. Pricing & Taxes",
    p: ["Prices shown on the Store are indicative wholesale prices in Indian Rupees (INR) and are exclusive of GST and freight unless stated otherwise. Prices may change without notice due to exchange rates, manufacturer revisions or stock position. Quoted prices are valid for the period stated in the quotation, or 3 days if no period is stated."],
  },
  {
    h: "4. Availability & MOQ",
    p: ["All products are subject to availability. Some products carry a minimum order quantity (MOQ) shown on the product page. We may cancel or partially fulfil confirmed orders if stock becomes unavailable, in which case any amount paid for unfulfilled items will be refunded."],
  },
  {
    h: "5. Shipping & Delivery",
    p: ["Goods are dispatched from Pune, Maharashtra via third-party transporters. Delivery timelines are estimates and not guaranteed. Risk in the goods passes to the buyer on handover to the transporter unless agreed otherwise. Please inspect shipments on receipt and note any transit damage on the delivery receipt, informing us within 48 hours with photos."],
  },
  {
    h: "6. Warranty",
    p: ["Products are covered by the respective manufacturer's warranty (for example, Deye inverter warranties are serviced through the manufacturer's authorized service network in India). Glannu will assist in registering and coordinating warranty claims but is not the warranty provider. Warranty does not cover damage from incorrect installation, over-voltage, lightning, water ingress or unauthorized repair."],
  },
  {
    h: "7. Returns",
    p: ["Being wholesale/B2B supply, goods once sold are not returnable except for (a) transit damage reported within 48 hours, or (b) manufacturing defects covered by warranty. Approved returns must be in original packaging with all accessories and documentation."],
  },
  {
    h: "8. Product Information",
    p: ["We make reasonable efforts to keep specifications, images and datasheets accurate, but manufacturers may revise products without notice. The manufacturer's official datasheet prevails over any summary on the Store. Solar generation figures (including our calculator) are estimates only and do not constitute a performance guarantee."],
  },
  {
    h: "9. Limitation of Liability",
    p: ["To the maximum extent permitted by law, Glannu's total liability for any claim arising from a sale is limited to the amount paid for the goods concerned. We are not liable for indirect or consequential losses, including loss of generation, profit or business."],
  },
  {
    h: "10. Governing Law & Jurisdiction",
    p: ["These terms are governed by the laws of India. Courts at Pune, Maharashtra shall have exclusive jurisdiction over any dispute."],
  },
  {
    h: "11. Contact",
    p: ["Glannu Industries, Pune, Maharashtra, India. Phone: +91 70838 98947 · WhatsApp: +91 86056 57016 · Email: info.glannu@gmail.com"],
  },
];

export default function TermsPage() {
  useEffect(() => {
    setSEO({
      title: "Terms & Conditions",
      description: "Terms and conditions for quotations, pricing, shipping, warranty and returns at Glannu Solar Store, Pune.",
      canonical: "https://solar.glannu.com/terms",
    });
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-2">Terms &amp; Conditions</h1>
      <p className="text-sm text-neutral-500 mb-8">Last updated: July 2026</p>
      <div className="space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="font-heading text-lg font-semibold text-neutral-900 mb-2">{s.h}</h2>
            {s.p.map((t, i) => (
              <p key={i} className="text-sm text-neutral-700 leading-relaxed">{t}</p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
