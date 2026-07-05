import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Phone, MessageCircle, ArrowLeft, ChevronRight, Sun, Zap, Battery, Cable } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setSEO } from "@/lib/seo";
import TrustBadges from "@/components/TrustBadges";
import cities from "@/data/inCities.json";

const CATS = [
  { label: "Solar Panels", icon: Sun, q: "Solar Panel" },
  { label: "On-Grid Inverters", icon: Zap, q: "On Grid Inverter" },
  { label: "Hybrid Inverters", icon: Battery, q: "Hybrid Inverter" },
  { label: "Cables & BOS", icon: Cable, q: "Wire & Cable" },
];

export default function CityPage() {
  const { slug } = useParams();
  const city = useMemo(() => cities.find((c) => c.slug === slug), [slug]);

  useEffect(() => {
    if (!city) return;
    const url = `https://solar.glannu.com/stores/${city.slug}`;
    setSEO({
      title: `Solar Panels & Inverters in ${city.name}, ${city.state} - Glannu Solar`,
      description: `Buy genuine Deye inverters, solar panels, batteries & BOS in ${city.name}, ${city.state}. Glannu Solar delivers across ${city.name} with GST invoice and warranty support. Call +91 ${city.phone}.`,
      canonical: url,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Store",
        name: `Glannu Solar - ${city.name}`,
        image: "https://solar.glannu.com/glannu-logo.png",
        url,
        telephone: `+91${city.phone}`,
        priceRange: "₹₹",
        areaServed: { "@type": "City", name: city.name },
        address: { "@type": "PostalAddress", addressLocality: city.name, addressRegion: city.state, addressCountry: "IN" },
        geo: { "@type": "GeoCoordinates", latitude: city.lat, longitude: city.lng },
        parentOrganization: { "@type": "Organization", name: "Glannu", url: "https://solar.glannu.com" },
      },
    });
  }, [city]);

  if (!city) {
    return (
      <main className="max-w-screen-md mx-auto px-4 py-24 text-center">
        <p className="text-neutral-500 mb-4">Sorry, we couldn't find that city.</p>
        <Link to="/stores" className="text-brand-primary font-medium hover:underline">View all cities</Link>
      </main>
    );
  }

  const phoneDisplay = `+91 ${city.phone.slice(0, 5)} ${city.phone.slice(5)}`;
  const waMsg = `Hi Glannu Solar, I'm in ${city.name} (${city.state}) and interested in solar panels / inverters. Please share pricing and delivery details.`;
  const waHref = `https://wa.me/91${city.phone}?text=${encodeURIComponent(waMsg)}`;
  const mapSrc = `https://maps.google.com/maps?q=${city.lat},${city.lng}&z=11&output=embed`;
  const nearby = cities.filter((c) => c.state === city.state && c.slug !== city.slug).slice(0, 12);

  return (
    <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
        <Link to="/" className="hover:text-brand-primary flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/stores" className="hover:text-brand-primary">Store Locator</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-900 font-medium">{city.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 text-brand-primary mb-2">
            <MapPin className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">{city.state}</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-3">
            Solar Panels &amp; Inverters in {city.name}
          </h1>
          <p className="text-neutral-600 leading-relaxed mb-6">
            Glannu Solar supplies genuine <strong>Deye inverters</strong>, solar panels, batteries and
            balance-of-system components across <strong>{city.name}, {city.state}</strong>. Get wholesale pricing,
            proper GST invoice and manufacturer warranty support - shipped to {city.name} and nearby areas from our Pune base.
          </p>

          <div className="rounded-2xl border border-neutral-200 p-5 mb-6">
            <p className="text-sm font-semibold text-neutral-900 mb-1">Serving {city.name} &amp; nearby areas</p>
            <p className="text-xs text-neutral-500 mb-4">Solar products delivered across {city.name}, {city.state}. Enquiries welcome by phone or WhatsApp.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={`tel:+91${city.phone}`} className="flex-1" data-testid="city-call">
                <Button className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-5">
                  <Phone className="h-4 w-4 mr-2" /> {phoneDisplay}
                </Button>
              </a>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex-1" data-testid="city-whatsapp">
                <Button className="w-full bg-brand-whatsapp hover:brightness-110 text-white font-semibold py-5">
                  <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                </Button>
              </a>
            </div>
          </div>

          <p className="text-sm font-medium text-neutral-700 mb-3">Popular in {city.name}</p>
          <div className="grid grid-cols-2 gap-3">
            {CATS.map(({ label, icon: Icon, q }) => (
              <Link key={q} to={`/?category=${encodeURIComponent(q)}`} className="flex items-center gap-2 rounded-lg border border-neutral-200 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors p-3 text-sm text-neutral-700">
                <Icon className="h-4 w-4 text-brand-primary flex-shrink-0" /> {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="rounded-2xl overflow-hidden border border-neutral-200 h-64 lg:h-full min-h-[300px]">
            <iframe
              title={`Map of ${city.name}`}
              src={mapSrc}
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <TrustBadges className="mb-12" />

      <section className="mb-12">
        <h2 className="font-heading font-semibold text-lg text-neutral-900 mb-3">Why buy solar from Glannu in {city.name}?</h2>
        <p className="text-sm text-neutral-600 leading-relaxed max-w-3xl">
          Whether you searched for <em>Glannu</em>, <em>Glannu Solar</em> or <em>Glannu Store</em>, you're in the right place.
          We are a trusted distributor of solar PV components serving customers, installers and contractors in {city.name} and
          across {city.state}. Order online at solar.glannu.com and we'll arrange dispatch with GST invoice and warranty support.
        </p>
      </section>

      {nearby.length > 0 && (
        <section>
          <h2 className="font-heading font-semibold text-lg text-neutral-900 mb-4">Other cities we serve in {city.state}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {nearby.map((c) => (
              <Link key={c.slug} to={`/stores/${c.slug}`} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors text-sm text-neutral-700">
                <MapPin className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                <span className="truncate">{c.name}</span>
              </Link>
            ))}
          </div>
          <Link to="/stores" className="inline-block mt-5 text-sm font-medium text-brand-primary hover:underline">View all 200+ cities →</Link>
        </section>
      )}
    </main>
  );
}
