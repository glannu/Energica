// installCache.js
// ---------------------------------------------------------------------------
// Makes the Energica store load instantly without waiting on the Render backend.
//
// How it works:
//   * Product + category READS (GET /api/products, /api/products/:id,
//     /api/categories) are served from a STATIC snapshot shipped with the
//     site (public/products.json + public/categories.json) — instant, from
//     Vercel's CDN, no backend needed.
//   * The snapshot is cached in localStorage (browser cache) so repeat visits
//     are instant even before the static files load.
//   * In the background we still try the LIVE backend; if it's awake we quietly
//     refresh the cache so data is up to date. If it's asleep, nobody waits.
//   * All searching / filtering / sorting / pagination is done in the browser
//     (trivial for ~168 products) and mirrors the backend's response shape, so
//     StorePage / ProductPage need NO changes.
//
// Writes (admin add/edit/delete), quotes (RFQ) and auth are NOT touched — they
// go straight to the backend as before.
// ---------------------------------------------------------------------------
import axios from "axios";

const SNAP_PRODUCTS = "/products.json";
const SNAP_CATEGORIES = "/categories.json";
const LS_KEY = "energica_data_cache_v1";
const BROWSER_TTL = 30 * 60 * 1000; // treat localStorage copy as fresh for 30 min

let mem = null; // { products: [...], categories: [...], ts: <number> }
let loadPromise = null;

function readLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function writeLS(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch (e) {}
}

async function fetchJSON(url, opts) {
  const res = await fetch(url, Object.assign({ cache: "no-store" }, opts || {}));
  if (!res.ok) throw new Error(url + " -> " + res.status);
  return res.json();
}

// Pull the freshest data from the live backend in the background.
// On failure (backend asleep / blocked) we simply keep the snapshot.
async function revalidate(apiBase) {
  try {
    const [p, c] = await Promise.all([
      fetchJSON(`${apiBase}/products?limit=1000`),
      fetchJSON(`${apiBase}/categories`),
    ]);
    const products = (p && p.products) || [];
    if (products.length) {
      mem = { products, categories: c || [], ts: Date.now() };
      writeLS(mem);
    }
  } catch (e) {
    /* backend unavailable — keep using the snapshot, no problem */
  }
}

// Load the dataset once: browser cache -> static snapshot -> (last resort) live.
function ensureLoaded(apiBase) {
  if (mem) return Promise.resolve(mem);
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    // 1) Browser cache (instant for repeat visitors)
    const ls = readLS();
    if (ls && ls.products && ls.products.length) {
      mem = ls;
      if (Date.now() - (ls.ts || 0) > BROWSER_TTL) revalidate(apiBase);
      else revalidate(apiBase); // always refresh quietly in the background
      return mem;
    }

    // 2) Static snapshot from the CDN (instant for first-time visitors)
    try {
      const [p, c] = await Promise.all([
        fetchJSON(SNAP_PRODUCTS),
        fetchJSON(SNAP_CATEGORIES),
      ]);
      const products = (p && p.products) || (Array.isArray(p) ? p : []);
      mem = { products, categories: c || [], ts: Date.now() };
      writeLS(mem);
      revalidate(apiBase);
      return mem;
    } catch (e) {
      // 3) No snapshot yet (e.g. first deploy mid-build) — try live once.
      await revalidate(apiBase);
      return mem; // may be null -> caller will fall back to the real backend
    }
  })();

  return loadPromise;
}

// Replicate the backend's GET /api/products query semantics in the browser.
function applyQuery(all, params) {
  params = params || {};
  let list = (all || []).filter((p) => !p.deleted);

  if (params.category) list = list.filter((p) => p.category === params.category);
  if (params.search) {
    const s = String(params.search).toLowerCase();
    list = list.filter((p) => (p.name || "").toLowerCase().includes(s));
  }
  if (params.in_stock === "true") list = list.filter((p) => p.in_stock === true);
  else if (params.in_stock === "false") list = list.filter((p) => p.in_stock === false);

  const sort = params.sort;
  if (sort === "price_asc") list.sort((a, b) => (a.price || 0) - (b.price || 0));
  else if (sort === "price_desc") list.sort((a, b) => (b.price || 0) - (a.price || 0));
  else if (sort === "name_asc") list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  else if (sort === "name_desc") list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
  else list.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));

  const total = list.length;
  const page = parseInt(params.page || 1, 10) || 1;
  const limit = parseInt(params.limit || 20, 10) || 20;
  const start = (page - 1) * limit;
  const products = list.slice(start, start + limit);
  return {
    products,
    total,
    page,
    limit,
    total_pages: Math.max(1, Math.ceil(total / limit)),
  };
}

function jsonResponse(payload, config) {
  return {
    data: payload,
    status: 200,
    statusText: "OK",
    headers: {},
    config,
    request: {},
  };
}

const UUID_RE = /\/api\/products\/[0-9a-fA-F-]{36}$/;
const LIST_RE = /\/api\/products(\?|$)/;
const CATS_RE = /\/api\/categories(\?|$)/;

axios.interceptors.request.use(async (config) => {
  try {
    const method = (config.method || "get").toLowerCase();
    const url = config.url || "";
    if (method !== "get") return config;

    const isList = LIST_RE.test(url);
    const isSingle = UUID_RE.test(url);
    const isCats = CATS_RE.test(url);
    if (!isList && !isSingle && !isCats) return config;

    const apiBase = url.replace(/\/api\/.*$/, "/api");
    const data = await ensureLoaded(apiBase);
    if (!data || !data.products || !data.products.length) {
      return config; // nothing cached yet -> let it hit the real backend
    }

    if (isCats) {
      config.adapter = async () => jsonResponse(data.categories || [], config);
    } else if (isSingle) {
      const id = url.split("?")[0].split("/").pop();
      const found = data.products.find((p) => p.id === id);
      if (!found) return config; // unknown id -> let backend handle it
      config.adapter = async () => jsonResponse(found, config);
    } else {
      config.adapter = async () => jsonResponse(applyQuery(data.products, config.params), config);
    }
  } catch (e) {
    /* never break a request because of the cache layer */
  }
  return config;
});

export default true;
