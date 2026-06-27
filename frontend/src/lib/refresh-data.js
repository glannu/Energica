/* refresh-data.js
 * ---------------------------------------------------------------------------
 * Runs at BUILD time (see package.json "build" script). Fetches the current
 * products + categories from the backend and writes them as static JSON into
 * public/, so the deployed site can serve them instantly from Vercel's CDN.
 *
 * It retries to handle Render's free-tier cold start, and NEVER fails the build
 * (if the backend can't be reached, it just keeps whatever snapshot exists and
 * the app falls back to the live API at runtime).
 *
 * To refresh the snapshot, just trigger a redeploy on Vercel.
 * --------------------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");

const API =
  process.env.REACT_APP_BACKEND_URL ||
  "https://energica-backend.onrender.com";
// Write into the build's public/ folder (cwd is the frontend project root at build time).
const OUT_DIR = path.join(process.cwd(), "public");

async function getJSON(url, tries = 8, waitMs = 8000) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
      console.log(`refresh-data: ${url} -> HTTP ${res.status} (attempt ${i}/${tries})`);
    } catch (e) {
      console.log(`refresh-data: ${url} -> ${e.message} (attempt ${i}/${tries})`);
    }
    if (i < tries) await new Promise((r) => setTimeout(r, waitMs));
  }
  throw new Error("could not fetch " + url);
}

(async () => {
  try {
    const products = await getJSON(`${API}/api/products?limit=1000`);
    const categories = await getJSON(`${API}/api/categories`);

    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, "products.json"), JSON.stringify(products));
    fs.writeFileSync(path.join(OUT_DIR, "categories.json"), JSON.stringify(categories));

    const count = (products && products.products && products.products.length) || 0;
    const cats = Array.isArray(categories) ? categories.length : 0;
    console.log(`refresh-data: wrote snapshot (${count} products, ${cats} categories)`);
  } catch (e) {
    // Do NOT fail the build — the app gracefully falls back to the live API.
    console.warn("refresh-data: skipping snapshot refresh -", e.message);
  }
})();
