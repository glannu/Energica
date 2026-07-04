// Lightweight SEO helper for the SPA: sets title, meta description,
// canonical link and a JSON-LD block per page.
const SITE = "Glannu Solar Store";

export function setSEO({ title, description, canonical, jsonLd } = {}) {
  document.title = title
    ? `${title} | ${SITE}`
    : `${SITE} \u2014 Solar Panels, Deye Inverters & BOS Components | Pune, India`;

  if (description) {
    let m = document.querySelector('meta[name="description"]');
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
    }
    m.setAttribute("content", description);
  }

  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", canonical || window.location.origin + window.location.pathname);

  const prev = document.getElementById("dynamic-jsonld");
  if (prev) prev.remove();
  if (jsonLd) {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = "dynamic-jsonld";
    s.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(s);
  }
}
