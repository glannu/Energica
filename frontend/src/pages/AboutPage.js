import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, BadgeIndianRupee, MessageCircle, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrustBadges from "@/components/TrustBadges";
import { setSEO } from "@/lib/seo";

export default function AboutPage() {
  useEffect(() => {
    setSEO({
      title: "About Us - Trusted Solar Components Distributor in Pune",
      description:
        "Glannu Solar Store is a Pune-based distributor of solar panels, Deye & Polycab inverters, LiFePO4 batteries and BOS components, shipping across India at wholesale prices.",
      canonical: "https://solar.glannu.com/about",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "About Glannu Solar Store",
        url: "https://solar.glannu.com/about",
        mainEntity: { "@id": "https://solar.glannu.com/#business" },
      },
    });
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-2">About Glannu Solar Store</h1>
      <p className="text-sm text-neutral-500 mb-8">Greener, Brighter, Smarter.</p>

      <div className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed space-y-4">
        <p>
          Glannu Solar Store is the solar distribution arm of <strong>Glannu Industries</strong>, based in Pune,
          Maharashtra. We supply genuine solar PV system components at wholesale prices to installers, contractors,
          EPC companies and end customers across India.
        </p>
        <p>
          Our catalogue covers the full balance of system: <strong>Deye on-grid, hybrid and micro inverters</strong>,
          Polycab inverters, solar panels, LiFePO4 batteries and energy storage systems, DC cables, MC4 connectors,
          mounting structures, and protection equipment. Every Deye product page carries the official datasheet so you
          can verify specifications before you buy.
        </p>
        <p>
          We work on a simple, transparent model: browse products at listed prices, add what you need to a quote, and
          send it to us on WhatsApp. Our team responds with availability, freight and any applicable bulk discounts -
          usually within business hours the same day.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-10">
        <div className="border border-neutral-200 rounded-lg p-5">
          <BadgeIndianRupee className="h-6 w-6 text-brand-primary mb-2" />
          <h3 className="font-heading font-semibold text-neutral-900 mb-1">Wholesale Pricing</h3>
          <p className="text-sm text-neutral-600">Distributor rates on single units, with additional discounts on bulk orders.</p>
        </div>
        <div className="border border-neutral-200 rounded-lg p-5">
          <ShieldCheck className="h-6 w-6 text-brand-primary mb-2" />
          <h3 className="font-heading font-semibold text-neutral-900 mb-1">Genuine Products</h3>
          <p className="text-sm text-neutral-600">Authorized-channel stock with manufacturer warranty and official datasheets.</p>
        </div>
        <div className="border border-neutral-200 rounded-lg p-5">
          <Truck className="h-6 w-6 text-brand-primary mb-2" />
          <h3 className="font-heading font-semibold text-neutral-900 mb-1">Pan-India Shipping</h3>
          <p className="text-sm text-neutral-600">Dispatched from Pune, Maharashtra to every state via trusted transporters.</p>
        </div>
      </div>

      <div className="border border-neutral-200 rounded-lg p-6 mb-10">
        <h2 className="font-heading text-xl font-semibold text-neutral-900 mb-4">Contact Us</h2>
        <div className="space-y-2 text-sm text-neutral-700">
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-neutral-400" /> Pune, Maharashtra, India</p>
          <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-neutral-400" /> +91 70838 98947</p>
          <p className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-neutral-400" /> WhatsApp: +91 86056 57016</p>
          <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-neutral-400" /> info.glannu@gmail.com</p>
        </div>
        <div className="flex gap-3 mt-5">
          <a href="https://wa.me/918605657016" target="_blank" rel="noopener noreferrer">
            <Button className="bg-green-600 hover:bg-green-700 text-white"><MessageCircle className="h-4 w-4 mr-2" />Chat on WhatsApp</Button>
          </a>
          <Link to="/"><Button variant="outline">Browse Products</Button></Link>
        </div>
      </div>

      <TrustBadges />
    </main>
  );
}
