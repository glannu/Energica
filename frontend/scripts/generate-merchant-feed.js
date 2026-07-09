// Generates public/merchant-feed.xml (Google Merchant Center / free Shopping
// listings) from the product snapshot. Runs at build time, after refresh-data.js.
const fs = require("fs");
const { productSlug } = require("../src/lib/slug");
const path = require("path");

const PUB = path.join(__dirname, "..", "public");
const BASE = "https://solar.glannu.com";

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

let products = [];
try { products = JSON.parse(fs.readFileSync(path.join(PUB, "products.json"), "utf8")); } catch (e) {}
if (products.products) products = products.products;

const items = [];
products.forEach((p) => {
  if (!p || !p.id || p.deleted) return;
  const price = Number(p.price);
  if (!price || price <= 0) return; // Merchant Center requires a valid price
  const brand = (p.specs && p.specs.Brand) || "Glannu";
  const img = p.image_url || "";
  const desc = (p.description || p.name || "").slice(0, 4900);
  items.push(
    "    <item>\n" +
    `      <g:id>${esc(p.item_code || p.id)}</g:id>\n` +
    `      <g:title>${esc(p.name)}</g:title>\n` +
    `      <g:description>${esc(desc)}</g:description>\n` +
    `      <g:link>${esc(BASE + "/product/" + productSlug(p))}</g:link>\n` +
    (img ? `      <g:image_link>${esc(img)}</g:image_link>\n` : "") +
    `      <g:availability>${p.in_stock ? "in_stock" : "out_of_stock"}</g:availability>\n` +
    `      <g:price>${price.toFixed(2)} INR</g:price>\n` +
    `      <g:brand>${esc(brand)}</g:brand>\n` +
    `      <g:condition>new</g:condition>\n` +
    `      <g:mpn>${esc(p.item_code || p.id)}</g:mpn>\n` +
    `      <g:identifier_exists>no</g:identifier_exists>\n` +
    (p.category ? `      <g:product_type>${esc(p.category)}</g:product_type>\n` : "") +
    "    </item>"
  );
});

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n' +
  "  <channel>\n" +
  "    <title>Glannu Solar Store</title>\n" +
  `    <link>${BASE}</link>\n` +
  "    <description>Solar PV components, inverters and BOS materials.</description>\n" +
  items.join("\n") + "\n" +
  "  </channel>\n" +
  "</rss>\n";

fs.writeFileSync(path.join(PUB, "merchant-feed.xml"), xml);
console.log(`merchant-feed.xml written with ${items.length} products`);
