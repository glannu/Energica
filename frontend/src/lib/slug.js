// Shared product-slug helpers. Written as CommonJS so both the React app
// (via webpack interop) and the Node build scripts (generate-sitemap.js,
// generate-merchant-feed.js) can use the exact same logic.

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Keyword-rich, stable URL slug for a product. Product names are unique
// today (166/166); if a duplicate name ever appears, admin should keep
// names unique or the later product will need a rename.
function productSlug(p) {
  return slugify(p && p.name) || String((p && p.id) || "");
}

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s || ""));
}

module.exports = { slugify, productSlug, isUuid };
