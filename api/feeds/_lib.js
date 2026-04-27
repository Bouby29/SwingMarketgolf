/**
 * api/feeds/_lib.js
 * ─────────────────────────────────────────────────────────────────
 * Module partagé pour les flux d'import vendeurs pros.
 * Utilisé par api/feeds/test-url.js, api/feeds/sync.js et
 * api/cron/all.js (cron Vercel).
 *
 * Responsabilités :
 *  - Fetch sécurisé d'une URL distante (anti-SSRF basique)
 *  - Détection du format (csv / xml / json)
 *  - Parsing avec papaparse / fast-xml-parser
 *  - Détection de la plateforme (PrestaShop / Shopify / WooCommerce)
 *  - Exécution complète d'une sync (mise à jour des produits)
 */

const Papa = require("papaparse");
const { XMLParser } = require("fast-xml-parser");
const { createClient } = require("@supabase/supabase-js");

// ─────────────────────────────────────────────────────────
// Client Supabase admin (service_role bypass RLS)
// ─────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

// ─────────────────────────────────────────────────────────
// Sécurité SSRF : refuse les URLs locales / privées
// ─────────────────────────────────────────────────────────
const PRIVATE_HOSTS = new Set([
  "localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]",
]);

const PRIVATE_IP_RE = [
  /^10\./,                               // 10.0.0.0/8
  /^192\.168\./,                         // 192.168.0.0/16
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,     // 172.16.0.0/12
  /^169\.254\./,                         // link-local
  /^fe80:/i,                             // IPv6 link-local
  /^fc00:/i,                             // IPv6 ULA
];

function isUrlSafe(url) {
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return { ok: false, reason: "Seuls http(s) sont acceptés." };
    const host = u.hostname.toLowerCase();
    if (PRIVATE_HOSTS.has(host)) return { ok: false, reason: "Hôte local interdit." };
    if (PRIVATE_IP_RE.some((re) => re.test(host))) return { ok: false, reason: "Plage IP privée interdite." };
    return { ok: true, url: u };
  } catch {
    return { ok: false, reason: "URL invalide." };
  }
}

// ─────────────────────────────────────────────────────────
// Fetch avec timeout + User-Agent SwingMarket
// ─────────────────────────────────────────────────────────
async function fetchWithTimeout(url, ms = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SwingMarketGolf-Bot/1.0 (+https://swingmarketgolf.com)",
        "Accept": "text/csv, application/xml, text/xml, application/json, */*",
      },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();
    return { text, contentType };
  } finally {
    clearTimeout(t);
  }
}

// ─────────────────────────────────────────────────────────
// Détection format
// ─────────────────────────────────────────────────────────
function detectFormat(url, contentType) {
  const ct = (contentType || "").toLowerCase();
  const u = String(url).toLowerCase();
  if (ct.includes("csv") || u.endsWith(".csv")) return "csv";
  if (ct.includes("xml") || u.endsWith(".xml")) return "xml";
  if (ct.includes("json") || u.endsWith(".json")) return "json";
  return null;
}

// ─────────────────────────────────────────────────────────
// Parsing CSV / XML / JSON → renvoie { rows, columns }
// ─────────────────────────────────────────────────────────
function parseCsv(text) {
  const result = Papa.parse(text, { header: true, skipEmptyLines: true });
  const rows = result.data || [];
  const columns = result.meta?.fields || [];
  return { rows, columns };
}

function parseXml(text) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    trimValues: true,
    parseTagValue: false,
  });
  const json = parser.parse(text);

  // Heuristiques pour trouver les items :
  // 1) Google Merchant / RSS : rss > channel > item[]
  // 2) PrestaShop generic : products > product[] | <item> | <produit>
  // 3) Custom : trouve le 1er array d'objets en profondeur
  let items = null;

  if (json?.rss?.channel?.item) items = toArray(json.rss.channel.item);
  else if (json?.feed?.entry) items = toArray(json.feed.entry); // Atom
  else if (json?.products?.product) items = toArray(json.products.product);
  else if (json?.products?.item) items = toArray(json.products.item);
  else if (json?.catalog?.product) items = toArray(json.catalog.product);
  else if (Array.isArray(json?.items)) items = json.items;
  else {
    // dernier recours : 1er array d'objets trouvé
    items = findFirstArrayOfObjects(json);
  }

  if (!items || !items.length) return { rows: [], columns: [] };
  // Aplatit chaque item en clé/valeur de surface (pas de nesting profond)
  const rows = items.map((it) => flattenItem(it));
  const colSet = new Set();
  rows.forEach((r) => Object.keys(r).forEach((k) => colSet.add(k)));
  return { rows, columns: Array.from(colSet) };
}

function parseJson(text) {
  const json = JSON.parse(text);
  let items = null;
  if (Array.isArray(json)) items = json;
  else if (Array.isArray(json?.products)) items = json.products;
  else if (Array.isArray(json?.items)) items = json.items;
  else if (Array.isArray(json?.data)) items = json.data;
  else items = findFirstArrayOfObjects(json) || [];

  const rows = items.map((it) => flattenItem(it));
  const colSet = new Set();
  rows.forEach((r) => Object.keys(r).forEach((k) => colSet.add(k)));
  return { rows, columns: Array.from(colSet) };
}

function toArray(x) { return Array.isArray(x) ? x : [x]; }

function findFirstArrayOfObjects(obj, depth = 0) {
  if (!obj || depth > 4) return null;
  if (Array.isArray(obj)) {
    return obj.length > 0 && typeof obj[0] === "object" ? obj : null;
  }
  if (typeof obj === "object") {
    for (const v of Object.values(obj)) {
      const found = findFirstArrayOfObjects(v, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function flattenItem(item) {
  if (typeof item !== "object" || item === null) return {};
  const flat = {};
  for (const [k, v] of Object.entries(item)) {
    if (v == null) flat[k] = "";
    else if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") flat[k] = String(v);
    else if (Array.isArray(v)) flat[k] = v.map((x) => (typeof x === "object" ? JSON.stringify(x) : String(x))).join(", ");
    else if (typeof v === "object") flat[k] = v["#text"] ? String(v["#text"]) : JSON.stringify(v);
    else flat[k] = String(v);
  }
  return flat;
}

// ─────────────────────────────────────────────────────────
// Détection plateforme à partir des colonnes
// ─────────────────────────────────────────────────────────
function detectPlatform(columns) {
  const set = new Set(columns);
  if (set.has("name") && set.has("price_tax_incl")) return "prestashop";
  if (set.has("Title") && set.has("Variant Price")) return "shopify";
  if (set.has("post_title") && set.has("regular_price")) return "woocommerce";
  // Google Merchant XML
  if (set.has("g:id") || set.has("g:price")) return "google_merchant";
  return "custom";
}

// ─────────────────────────────────────────────────────────
// Pipeline complet : URL → rows + columns + plateforme
// ─────────────────────────────────────────────────────────
async function fetchAndParseFeed(url) {
  const safe = isUrlSafe(url);
  if (!safe.ok) throw new Error(safe.reason);

  const { text, contentType } = await fetchWithTimeout(url);
  let format = detectFormat(url, contentType);

  // Auto-fallback : on essaie de deviner si le content-type ne dit rien
  if (!format) {
    const trimmed = text.trim();
    if (trimmed.startsWith("<")) format = "xml";
    else if (trimmed.startsWith("{") || trimmed.startsWith("[")) format = "json";
    else format = "csv";
  }

  let parsed;
  if (format === "csv") parsed = parseCsv(text);
  else if (format === "xml") parsed = parseXml(text);
  else if (format === "json") parsed = parseJson(text);
  else throw new Error("Format non reconnu (CSV / XML / JSON attendus).");

  const platform = detectPlatform(parsed.columns);
  return { format, platform, ...parsed };
}

// ─────────────────────────────────────────────────────────
// Helper : split une string d'URLs (images) séparées par , ou |
// ─────────────────────────────────────────────────────────
function splitImages(val) {
  if (!val) return [];
  return String(val).split(/[,|]/).map((s) => s.trim()).filter(Boolean);
}

// ─────────────────────────────────────────────────────────
// Construit un payload produit à partir d'une ligne et du mapping
// ─────────────────────────────────────────────────────────
function buildProductPayload(row, mapping, sellerId, sellerName) {
  const stockVal = parseInt(row[mapping.stock] || "1");
  return {
    title: (row[mapping.title] || "Sans titre").toString().slice(0, 200),
    description: row[mapping.description] || "",
    price: parseFloat(row[mapping.price]) || 0,
    brand: row[mapping.brand] || null,
    category: row[mapping.category] || "Autres",
    condition: row[mapping.condition] || "Très bon",
    images: splitImages(row[mapping.images]),
    seller_id: sellerId,
    seller_name: sellerName,
    status: stockVal >= 1 ? "active" : "archived",
    sale_type: "fixed",
    views_count: 0,
    favorites_count: 0,
  };
}

// ─────────────────────────────────────────────────────────
// Exécution complète d'une sync sur UN flux
// ─────────────────────────────────────────────────────────
/**
 * @param feed Le flux récupéré depuis seller_feeds (objet complet)
 * @returns { run_id, status, stats: { added, updated, removed, failed } }
 */
async function runFeedSync(feed) {
  const supabase = getSupabase();
  const mapping = feed.mapping || {};

  // 1) Récupère le profil vendeur pour le seller_name
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, shop_name, email")
    .eq("id", feed.seller_id)
    .maybeSingle();
  const sellerName = profile?.shop_name || profile?.full_name || profile?.email || "Vendeur";

  // 2) Crée la run
  const { data: runRow, error: runErr } = await supabase
    .from("seller_feed_runs")
    .insert({ feed_id: feed.id, status: "running" })
    .select()
    .single();
  if (runErr) throw new Error("Création run impossible : " + runErr.message);
  const runId = runRow.id;

  let added = 0, updated = 0, removed = 0, failed = 0;
  const errorsLog = [];

  try {
    // 3) Fetch + parse
    const { rows } = await fetchAndParseFeed(feed.source_url);

    // 4) Récupère les produits existants pour ce vendeur (pour dédup + diff)
    const { data: existing } = await supabase
      .from("products")
      .select("id, title, price, description, images, status")
      .eq("seller_id", feed.seller_id);
    const existingByTitle = new Map();
    (existing || []).forEach((p) => existingByTitle.set(normTitle(p.title), p));

    // 5) Boucle d'import par batches
    const BATCH = 50;
    const seenTitles = new Set();

    for (let i = 0; i < rows.length; i += BATCH) {
      const chunk = rows.slice(i, i + BATCH);

      // On gère ligne par ligne pour pouvoir UPDATE vs INSERT distinctement
      for (const row of chunk) {
        try {
          const payload = buildProductPayload(row, mapping, feed.seller_id, sellerName);
          const key = normTitle(payload.title);
          seenTitles.add(key);
          const found = existingByTitle.get(key);

          if (found) {
            // UPDATE seulement si diff
            const diff = (
              Number(found.price) !== Number(payload.price)
              || (found.description || "") !== (payload.description || "")
              || JSON.stringify(found.images || []) !== JSON.stringify(payload.images || [])
              || found.status !== payload.status
            );
            if (diff) {
              const { error: upErr } = await supabase
                .from("products")
                .update({
                  price: payload.price,
                  description: payload.description,
                  images: payload.images,
                  status: payload.status,
                  category: payload.category,
                  brand: payload.brand,
                  condition: payload.condition,
                })
                .eq("id", found.id);
              if (upErr) throw upErr;
              updated += 1;
            }
          } else {
            // INSERT
            const { error: insErr } = await supabase
              .from("products")
              .insert({ ...payload, created_at: new Date().toISOString() });
            if (insErr) throw insErr;
            added += 1;
          }
        } catch (rowErr) {
          failed += 1;
          if (errorsLog.length < 200) {
            errorsLog.push({ title: row[mapping.title] || "?", error: rowErr.message || String(rowErr) });
          }
        }
      }
    }

    // 6) Application de on_missing_action sur les produits manquants
    const action = feed.on_missing_action || "deactivate";
    if (action !== "ignore") {
      const missing = (existing || []).filter((p) => !seenTitles.has(normTitle(p.title)));
      for (const m of missing) {
        try {
          if (action === "delete") {
            await supabase.from("products").delete().eq("id", m.id);
          } else {
            // deactivate
            if (m.status !== "archived") {
              await supabase.from("products").update({ status: "archived" }).eq("id", m.id);
            }
          }
          removed += 1;
        } catch (e) {
          // silencieux : on ne fait pas planter la run pour 1 archivage raté
        }
      }
    }

    // 7) Comptage final
    const { count: totalActive } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", feed.seller_id)
      .eq("status", "active");

    const finalStatus = failed === 0 ? "success" : (added + updated > 0 ? "partial" : "error");

    await supabase.from("seller_feed_runs").update({
      ended_at: new Date().toISOString(),
      products_added: added,
      products_updated: updated,
      products_removed: removed,
      products_failed: failed,
      errors_log: errorsLog.length > 0 ? errorsLog : null,
      status: finalStatus,
    }).eq("id", runId);

    await supabase.from("seller_feeds").update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: finalStatus,
      last_sync_message: `+${added} ajoutés · ${updated} MAJ · ${removed} retirés${failed ? ` · ${failed} échecs` : ""}`,
      total_products: totalActive || 0,
    }).eq("id", feed.id);

    return { run_id: runId, status: finalStatus, stats: { added, updated, removed, failed } };

  } catch (err) {
    // Erreur globale (fetch URL, parsing, etc.) → on marque la run en error
    await supabase.from("seller_feed_runs").update({
      ended_at: new Date().toISOString(),
      products_added: added,
      products_updated: updated,
      products_removed: removed,
      products_failed: failed,
      errors_log: [{ global: err.message || String(err) }],
      status: "error",
    }).eq("id", runId);

    await supabase.from("seller_feeds").update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: "error",
      last_sync_message: (err.message || String(err)).slice(0, 500),
      status: "error",
    }).eq("id", feed.id);

    throw err;
  }
}

// Normalise un titre pour la déduplication (lowercase, trim, espaces collapsés)
function normTitle(t) {
  return String(t || "").toLowerCase().replace(/\s+/g, " ").trim();
}

// ─────────────────────────────────────────────────────────
// Sélectionne les flux dûs pour le cron
// ─────────────────────────────────────────────────────────
async function pickFeedsToRun() {
  const supabase = getSupabase();
  const { data: feeds, error } = await supabase
    .from("seller_feeds")
    .select("*")
    .eq("status", "active")
    .eq("source_type", "remote_url");
  if (error) throw error;

  const now = Date.now();
  const HOUR = 60 * 60 * 1000;

  return (feeds || []).filter((f) => {
    if (f.sync_frequency === "manual") return false;
    if (!f.last_sync_at) return true;
    const since = now - new Date(f.last_sync_at).getTime();
    if (f.sync_frequency === "hourly")   return since >= HOUR - 60_000;     // -60s tolérance
    if (f.sync_frequency === "every_6h") return since >= 6 * HOUR - 60_000;
    if (f.sync_frequency === "daily")    return since >= 23 * HOUR;          // 23h pour rattraper un cron raté
    return false;
  });
}

module.exports = {
  getSupabase,
  isUrlSafe,
  fetchAndParseFeed,
  detectPlatform,
  buildProductPayload,
  runFeedSync,
  pickFeedsToRun,
  splitImages,
};
