import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { setSEO } from "@/lib/seo";
import TrustBadges from "@/components/TrustBadges";
import cities from "@/data/inCities.json";

export default function StoreLocatorPage() {
  const [q, setQ] = useState("");

  useEffect(() => {
    setSEO({
      title: "Store Locator - Solar Products Across 200+ Indian Cities | Glannu Solar",
      description: "Glannu Solar delivers Deye inverters, solar panels and BOS components across 200+ cities in India. Find your city for local enquiries, pricing and support.",
      canonical: "https://solar.glannu.com/stores",
    });
  }, []);

  const groups = useMemo(() => {
    const s = q.trim().toLowerCase();
    const filtered = cities.filter(
      (c) => !s || c.name.toLowerCase().includes(s) || (c.state || "").toLowerCase().includes(s)
    );
    const g = {};
    filtered.forEach((c) => { (g[c.state] = g[c.state] || []).push(c); });
    return Object.entries(g).sort((a, b) => a[0].localeCompare(b[0]));
  }, [q]);

  const count = groups.reduce((n, [, arr]) => n + arr.length, 0);

  return (
    <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-brand-primary mb-2">
        <MapPin className="h-5 w-5" />
        <span className="text-xs font-bold uppercase tracking-wider">Store Locator</span>
      </div>
      <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-2">
        Glannu Solar near you - across India
      </h1>
      <p className="text-neutral-600 text-sm sm:text-base mb-6 max-w-2xl">
        We supply Deye inverters, solar panels, batteries and balance-of-system components to
        <strong> 200+ cities</strong> across India. Pick your city for local pricing, enquiries and delivery support.
      </p>

      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          data-testid="locator-search"
          placeholder="Search your city or state…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      <p className="text-sm text-neutral-500 mb-6">{count} cities served</p>

      {groups.length === 0 ? (
        <p className="text-neutral-500 py-10 text-center">No matching city. Try another name, or call +91 70838 98947.</p>
      ) : (
        <div className="space-y-8">
          {groups.map(([state, list]) => (
            <section key={state} data-testid={`state-group-${state}`}>
              <h2 className="font-heading font-semibold text-base text-neutral-900 mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" /> {state}
                <span className="text-xs font-normal text-neutral-400">({list.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {list.sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                  <Link
                    key={c.slug}
                    to={`/stores/${c.slug}`}
                    data-testid={`city-link-${c.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors text-sm text-neutral-700"
                  >
                    <MapPin className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">Solar in {c.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-2xl bg-neutral-50 border border-neutral-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <p className="font-heading font-semibold text-neutral-900">Don't see your city?</p>
          <p className="text-sm text-neutral-600">We ship across India from Pune. Call or WhatsApp us for a quote.</p>
        </div>
        <a href="tel:+917083898947" className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-sm px-5 py-3 rounded-lg whitespace-nowrap">
          <Phone className="h-4 w-4" /> +91 70838 98947
        </a>
      </div>

      <TrustBadges className="mt-8" />
    </main>
  );
}
