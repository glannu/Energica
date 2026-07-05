import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Sun, Zap, IndianRupee, ArrowRight, MessageCircle, Home, Battery, Calculator as CalcIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setSEO } from "@/lib/seo";
import TrustBadges from "@/components/TrustBadges";

const WHATSAPP = "918605657016";
const fmt = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));

// Rough India-average assumptions (clearly labelled as estimates on-page).
const TARIFF = 8;            // ₹ per unit (kWh)
const UNITS_PER_KW_DAY = 4;  // 1 kW generates ~4 units/day
const PANEL_W = 550;         // panel wattage
const ANNUAL_PER_KW = 1400;  // kWh/kW/year
const COST = { ongrid: [45000, 55000], hybrid: [85000, 110000] };

export default function CalculatorPage() {
  const [bill, setBill] = useState(3000);
  const [type, setType] = useState("ongrid");

  useMemo(() => {
    setSEO({
      title: "Solar System Calculator — Size & Cost Estimate | Glannu",
      description: "Free solar calculator: enter your monthly electricity bill to estimate the solar system size (kW), number of panels, approximate cost and monthly savings. Get a quote from Glannu, Pune.",
      canonical: "https://solar.glannu.com/calculator",
    });
    return null;
  }, []);

  const r = useMemo(() => {
    const b = Math.max(0, Number(bill) || 0);
    const monthlyUnits = b / TARIFF;
    const dailyUnits = monthlyUnits / 30;
    let kw = dailyUnits / UNITS_PER_KW_DAY;
    kw = Math.max(1, Math.round(kw * 2) / 2); // round to nearest 0.5, min 1
    const panels = Math.ceil((kw * 1000) / PANEL_W);
    const roof = Math.round(kw * 100);
    const [lo, hi] = COST[type];
    const annual = Math.round(kw * ANNUAL_PER_KW);
    return {
      kw, panels, roof,
      costLo: kw * lo, costHi: kw * hi,
      monthlySavings: Math.round(monthlyUnits * TARIFF),
      annual,
    };
  }, [bill, type]);

  const waMsg = `Hi Glannu, using your solar calculator I'm looking at a ~${r.kw} kW ${type === "hybrid" ? "hybrid" : "on-grid"} system (current bill ~₹${fmt(bill)}/month). Please share a detailed quote.`;
  const waHref = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waMsg)}`;
  const browseHref = type === "hybrid" ? "/?category=Hybrid%20Inverter" : "/?category=On%20Grid%20Inverter";

  return (
    <main className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-brand-primary mb-2">
        <CalcIcon className="h-5 w-5" />
        <span className="text-xs font-bold uppercase tracking-wider">Solar Calculator</span>
      </div>
      <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-2">
        Estimate your solar system size &amp; cost
      </h1>
      <p className="text-neutral-600 text-sm sm:text-base mb-8 max-w-2xl">
        Enter your average monthly electricity bill to get a quick estimate of the system size, panels, approximate price and savings. Then get an exact quote on WhatsApp.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-2 mb-2">
              <IndianRupee className="h-4 w-4 text-brand-primary" /> Average monthly electricity bill
            </label>
            <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
              <span className="px-3 text-neutral-500 bg-neutral-50 py-2.5 text-sm">₹</span>
              <Input
                type="number"
                min="0"
                value={bill}
                onChange={(e) => setBill(e.target.value)}
                className="border-0 focus-visible:ring-0 text-lg font-semibold"
                data-testid="calc-bill-input"
              />
              <span className="px-3 text-neutral-400 text-sm whitespace-nowrap">/ month</span>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {[1500, 3000, 5000, 10000].map((v) => (
                <button
                  key={v}
                  onClick={() => setBill(v)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${Number(bill) === v ? "border-brand-primary bg-brand-primary/5 text-brand-primary" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}
                >
                  ₹{fmt(v)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">System type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setType("ongrid")}
                data-testid="calc-type-ongrid"
                className={`flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all ${type === "ongrid" ? "border-brand-primary bg-brand-primary/5" : "border-neutral-200 hover:border-neutral-300"}`}
              >
                <Zap className={`h-5 w-5 ${type === "ongrid" ? "text-brand-primary" : "text-neutral-400"}`} />
                <div>
                  <p className="text-sm font-semibold text-neutral-900">On-Grid</p>
                  <p className="text-[11px] text-neutral-500">Lowest cost, no battery</p>
                </div>
              </button>
              <button
                onClick={() => setType("hybrid")}
                data-testid="calc-type-hybrid"
                className={`flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all ${type === "hybrid" ? "border-brand-primary bg-brand-primary/5" : "border-neutral-200 hover:border-neutral-300"}`}
              >
                <Battery className={`h-5 w-5 ${type === "hybrid" ? "text-brand-primary" : "text-neutral-400"}`} />
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Hybrid</p>
                  <p className="text-[11px] text-neutral-500">Battery backup ready</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sun className="h-5 w-5 text-amber-500" />
            <h2 className="font-heading font-semibold text-lg text-neutral-900">Your estimate</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Recommended size" value={`${r.kw} kW`} big />
            <Stat label="Solar panels (≈550W)" value={`${r.panels} nos`} />
            <Stat label="Approx. cost" value={`₹${fmt(r.costLo)}–${fmt(r.costHi)}`} />
            <Stat label="Est. monthly savings" value={`₹${fmt(r.monthlySavings)}`} />
            <Stat label="Roof space needed" value={`~${fmt(r.roof)} sq.ft`} />
            <Stat label="Yearly generation" value={`~${fmt(r.annual)} units`} />
          </div>

          <a href={waHref} target="_blank" rel="noopener noreferrer" data-testid="calc-whatsapp-cta">
            <Button className="w-full mt-6 bg-brand-whatsapp hover:brightness-110 text-white font-semibold py-5">
              <MessageCircle className="h-4 w-4 mr-2" /> Get an exact quote on WhatsApp
            </Button>
          </a>
          <Link to={browseHref}>
            <Button variant="outline" className="w-full mt-3 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white">
              Browse {type === "hybrid" ? "hybrid" : "on-grid"} inverters <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <p className="text-xs text-neutral-400 mt-4 flex items-start gap-2">
        <Home className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
        Estimates use India-average assumptions (tariff ₹{TARIFF}/unit, ~{UNITS_PER_KW_DAY} units per kW per day). Actual sizing depends on your location, roof, load pattern and DISCOM policy. Contact us for a site-specific design.
      </p>

      <TrustBadges className="mt-8" />
    </main>
  );
}

function Stat({ label, value, big }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">{label}</p>
      <p className={`font-heading font-bold text-neutral-900 ${big ? "text-2xl sm:text-3xl text-brand-primary" : "text-lg"}`}>{value}</p>
    </div>
  );
}
