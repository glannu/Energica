// Generates public/sitemap.xml from the product/category snapshots.
// Runs at build time, after refresh-data.js.
const fs = require("fs");
const path = require("path");

const PUB = path.join(__dirname, "..", "public");
const BASE = "https://solar.glannu.com";

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

let products = [], categories = [];
try { products = JSON.parse(fs.readFileSync(path.join(PUB, "products.json"), "utf8")); } catch (e) {}
try { categories = JSON.parse(fs.readFileSync(path.join(PUB, "categories.json"), "utf8")); } catch (e) {}
if (products.products) products = products.products;

const today = new Date().toISOString().slice(0, 10);
const urls = [{ loc: BASE + "/", priority: "1.0" }];

categories.forEach(c => {
  if (c && c.name) urls.push({ loc: BASE + "/?category=" + encodeURIComponent(c.name), priority: "0.8" });
});
products.forEach(p => {
  if (p && p.id && !p.deleted) urls.push({ loc: BASE + "/product/" + p.id, priority: "0.7" });
});

// Static feature pages + per-city store-locator landing pages
urls.push({ loc: BASE + "/calculator", priority: "0.6" });
urls.push({ loc: BASE + "/stores", priority: "0.7" });
let cities = [];
try { cities = require(path.join(__dirname, "..", "src", "data", "inCities.json")); } catch (e) {}
cities.forEach(c => { if (c && c.slug) urls.push({ loc: BASE + "/stores/" + c.slug, priority: "0.6" }); });

const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => `  <url><loc>${esc(u.loc)}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join("\n") +
  "\n</urlset>\n";

fs.writeFileSync(path.join(PUB, "sitemap.xml"), xml);
console.log(`sitemap.xml written with ${urls.length} URLs`);
