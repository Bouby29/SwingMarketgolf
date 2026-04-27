import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Line,
} from "recharts";
import {
  LayoutGrid, ShoppingBag, Tag, Users, CreditCard, Percent,
  AlertTriangle, FileText, Truck, Layers, MessageSquare,
  PenSquare, Search, Bell, HelpCircle, Download, Plus,
  ChevronsUpDown, MoreVertical, ArrowUpRight, ArrowDownRight,
  Minus, Filter, Star, Trash2, Pencil, Eye, KeyRound, X,
  RefreshCw, Upload, FileSpreadsheet, Check, Play, Settings2,
  ArrowRight, ArrowLeft, AlertCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────
// Auth Supabase admin (inchangé — service_role pour panel admin)
// ─────────────────────────────────────────────────────────
const supabaseAdmin = createClient(
  "https://pnhiuifejnnklbfpjmdr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuaGl1aWZlam5ua2xiZnBqbWRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY5MDc4NSwiZXhwIjoyMDg5MjY2Nzg1fQ.pdIrv8cLFbTEJATtDVAqgAODYEJKHS7n_g6BE4ft0qU"
);

const ADMIN_LOGIN = "admin@swingmarketgolf.com";
const ADMIN_PASSWORD = "swingadmin2024";

// ─────────────────────────────────────────────────────────
// Sidebar : sections du design (PILOTAGE / FINANCE / OPÉRATIONS)
// ─────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Pilotage",
    items: [
      { id: "overview",  label: "Tableau de bord", Icon: LayoutGrid },
      { id: "orders",    label: "Commandes",       Icon: ShoppingBag, badgeKey: "pendingOrders", badgeAlert: true },
      { id: "products",  label: "Annonces",        Icon: Tag,         badgeKey: "activeProducts" },
      { id: "users",     label: "Utilisateurs",    Icon: Users },
    ],
  },
  {
    label: "Finance",
    items: [
      { id: "payments",     label: "Paiements",   Icon: CreditCard },
      { id: "commissions",  label: "Commissions", Icon: Percent },
      { id: "disputes",     label: "Litiges",     Icon: AlertTriangle, badgeKey: "disputes", badgeAlert: true },
      { id: "reports",      label: "Rapports",    Icon: FileText },
    ],
  },
  {
    label: "Opérations",
    items: [
      { id: "carriers",   label: "Transporteurs", Icon: Truck },
      { id: "feeds",      label: "Flux d'import", Icon: Upload },
      { id: "categories", label: "Catégories",    Icon: Layers },
      { id: "reviews",    label: "Avis",          Icon: MessageSquare, badgeKey: "reviewsCount" },
      { id: "blog",       label: "Blog",          Icon: PenSquare },
      { id: "admins",     label: "Administrateurs", Icon: KeyRound },
    ],
  },
];

// ─────────────────────────────────────────────────────────
// Périodes (24h / 7j / 30j / 90j / An)
// ─────────────────────────────────────────────────────────
const PERIODS = [
  { id: "24h", label: "24h",  days: 1,   bucket: "hour" },
  { id: "7j",  label: "7j",   days: 7,   bucket: "day"  },
  { id: "30j", label: "30j",  days: 30,  bucket: "day"  },
  { id: "90j", label: "90j",  days: 90,  bucket: "week" },
  { id: "an",  label: "An",   days: 365, bucket: "month" },
];

// Palette du design (tokens HTML)
const COLORS = {
  ink900: "#0F172A", ink800: "#1E293B", ink700: "#334155", ink600: "#475569",
  ink500: "#64748B", ink400: "#94A3B8", ink300: "#CBD5E1", ink200: "#E2E8F0",
  ink150: "#EEF2F7", ink100: "#F1F5F9", ink50:  "#F8FAFC",
  paper:  "#FFFFFF", canvas: "#F6F7F9",
  green800: "#1B5E20", green700: "#2E7D32", green500: "#4CAF50", green50: "#F7FEF7",
  gold600: "#C5A028", gold400: "#E8C84A", gold100: "#FEF9E7",
  navy: "#1A1A2E",
  success: "#10B981", warning: "#F59E0B", danger: "#EF4444", info: "#3B82F6", violet: "#8B5CF6",
};

// Couleurs de secteurs pour le donut Catégories
const CATEGORY_PALETTE = [
  COLORS.green800, COLORS.gold600, COLORS.green500,
  COLORS.ink700,   COLORS.gold400, COLORS.info, COLORS.violet,
];

// Statuts commandes (mapping libellés + couleurs)
const ORDER_STATUS = {
  pending_payment: { label: "En attente paiement", cls: "pay" },
  pending:         { label: "En attente paiement", cls: "pay" },
  preparing:       { label: "Préparation",         cls: "prep" },
  paid:            { label: "Préparation",         cls: "prep" },
  shipped:         { label: "Expédié",             cls: "ship" },
  delivered:       { label: "Livré",               cls: "deliv" },
  cancelled:       { label: "Annulé",              cls: "refund" },
  refunded:        { label: "Remboursé",           cls: "refund" },
  disputed:        { label: "Litige",              cls: "refund" },
  active:          { label: "Active",              cls: "deliv" },
  reserved:        { label: "Réservé",             cls: "pay" },
  sold:            { label: "Vendu",               cls: "ship" },
};

// Statuts d'édition d'une commande (admin)
const ORDER_EDIT_STATUSES = ["pending_payment", "paid", "preparing", "shipped", "delivered", "cancelled", "disputed"];
const PRODUCT_STATUSES = ["active", "sold", "reserved", "pending"];
const PRODUCT_CONDITIONS = ["Neuf", "Comme neuf", "Très bon état", "Bon état", "État correct"];
const USER_PLANS = [
  { value: "basique", label: "Basique (gratuit) — 5 annonces/mois" },
  { value: "pro",     label: "Pro (19€/mois) — 30 annonces/mois" },
  { value: "premium", label: "Premium (39€/mois) — Illimité" },
  { value: "business",label: "Business (99€/mois) — Illimité" },
];

// ─────────────────────────────────────────────────────────
// Utilitaires
// ─────────────────────────────────────────────────────────
const fmtEUR = (n) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0));
const fmtEUR2 = (n) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0);
const fmtInt = (n) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(Number(n) || 0));
const initialsOf = (name = "") =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join("") || "?";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function colorPairFromString(str = "") {
  const hash = [...str].reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 5381);
  const palettes = [
    ["#1B5E20", "#4CAF50"], ["#C5A028", "#E8C84A"], ["#3B82F6", "#8B5CF6"],
    ["#0F172A", "#475569"], ["#10B981", "#1B5E20"], ["#EF4444", "#F59E0B"],
    ["#8B5CF6", "#3B82F6"],
  ];
  return palettes[hash % palettes.length];
}

function periodBounds(periodId) {
  const p = PERIODS.find(x => x.id === periodId) || PERIODS[1];
  const now = new Date();
  const start = new Date(now.getTime() - p.days * 24 * 60 * 60 * 1000);
  const prevStart = new Date(start.getTime() - p.days * 24 * 60 * 60 * 1000);
  return { p, start, now, prevStart };
}

function groupSeries(orders, periodId) {
  const { p, start, now } = periodBounds(periodId);
  const buckets = new Map();
  const fmt = (d) => {
    if (p.bucket === "hour") return d.toISOString().slice(0, 13);
    if (p.bucket === "month") return d.toISOString().slice(0, 7);
    if (p.bucket === "week") {
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      return monday.toISOString().slice(0, 10);
    }
    return d.toISOString().slice(0, 10);
  };
  const cursor = new Date(start);
  while (cursor <= now) {
    buckets.set(fmt(cursor), { key: fmt(cursor), date: new Date(cursor), sales: 0, commissions: 0, count: 0 });
    if (p.bucket === "hour") cursor.setHours(cursor.getHours() + 1);
    else if (p.bucket === "month") cursor.setMonth(cursor.getMonth() + 1);
    else if (p.bucket === "week") cursor.setDate(cursor.getDate() + 7);
    else cursor.setDate(cursor.getDate() + 1);
  }
  for (const o of orders) {
    if (!o.created_at) continue;
    const d = new Date(o.created_at);
    if (d < start || d > now) continue;
    const k = fmt(d);
    const b = buckets.get(k);
    if (!b) continue;
    b.sales += Number(o.total_paid || o.price || 0);
    b.commissions += Number(o.commission_amount || 0);
    b.count += 1;
  }
  return [...buckets.values()].map(b => ({
    key: b.key,
    label: labelForBucket(b.date, p.bucket),
    sales: Math.round(b.sales),
    commissions: Math.round(b.commissions),
    count: b.count,
  }));
}

function labelForBucket(d, bucket) {
  if (bucket === "hour") return d.toLocaleTimeString("fr-FR", { hour: "2-digit" });
  if (bucket === "month") return d.toLocaleDateString("fr-FR", { month: "short" });
  if (bucket === "week")
    return `S${Math.ceil(((d - new Date(d.getFullYear(), 0, 1)) / 86400000 + 1) / 7)}`;
  return d.toLocaleDateString("fr-FR", { weekday: "short" });
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0F172A", color: "#fff", padding: "8px 12px",
      borderRadius: 8, fontSize: 12, lineHeight: 1.4, minWidth: 130,
      boxShadow: "0 12px 28px -8px rgba(15,23,42,.35)",
    }}>
      <div style={{ color: COLORS.ink400, fontSize: 10.5, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
            {p.name === "sales" ? "Ventes" : "Commissions"}
          </span>
          <strong>{fmtEUR(p.value)} €</strong>
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═════════════════════════════════════════════════════════
export default function AdminDashboard() {
  // Auth
  const [authed, setAuthed] = useState(false);
  const [login, setLogin] = useState("");
  const [pwd, setPwd] = useState("");
  const [authError, setAuthError] = useState("");

  // Navigation & période
  const [section, setSection] = useState("overview");
  const [period, setPeriod] = useState("7j");
  const [orderTab, setOrderTab] = useState("all");
  const [search, setSearch] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  // Popovers du header
  const [helpOpen, setHelpOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Données
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // pour finance globale et listes
  const [prevOrders, setPrevOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [profilesById, setProfilesById] = useState({});
  const [admins, setAdmins] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [counters, setCounters] = useState({
    activeProducts: 0, pendingOrders: 0, activeUsers: 0,
    disputes: 0, reviewsCount: 0,
  });

  // ─── Wizard "Flux d'import" — état dédié ───
  const [editFeed, setEditFeed] = useState(null);          // null = wizard fermé
  const [feedWizardStep, setFeedWizardStep] = useState(0); // 0..3
  const [importedRows, setImportedRows] = useState([]);    // lignes du CSV parsé
  const [importedColumns, setImportedColumns] = useState([]); // noms des colonnes
  const [importedFilename, setImportedFilename] = useState("");
  const [detectedPlatform, setDetectedPlatform] = useState(null);
  const [feedMapping, setFeedMapping] = useState({});      // { swingMarketKey: csvColumnName }
  const [feedImporting, setFeedImporting] = useState(false);
  const [feedImportProgress, setFeedImportProgress] = useState({ done: 0, total: 0 });
  // Modal historique des syncs d'un flux
  const [historyFeed, setHistoryFeed] = useState(null);  // null = fermé
  const [historyRuns, setHistoryRuns] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  // Sync en cours : map { feedId: true } pour disabled UI
  const [syncing, setSyncing] = useState({});

  // Édition (modals)
  const [editProduct, setEditProduct] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [editBlog, setEditBlog] = useState(null);
  const [editAdmin, setEditAdmin] = useState(null);
  const [editReview, setEditReview] = useState(null);
  const [userHistory, setUserHistory] = useState(null);
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", role: "Admin" });
  const [newCarrier, setNewCarrier] = useState({ name: "", price: "", delay: "" });

  // Réglages (persistés en local pour cette première itération — comme l'ancien admin)
  const [commissions, setCommissions] = useState([
    { label: "0 - 99 €",     min: 0,    max: 99,     rate: 10, fixed: 0.70 },
    { label: "100 - 299 €",  min: 100,  max: 299,    rate: 8,  fixed: 0.70 },
    { label: "300 - 999 €",  min: 300,  max: 999,    rate: 6,  fixed: 0.70 },
    { label: "1000 €+",      min: 1000, max: 999999, rate: 4,  fixed: 0.70 },
  ]);
  const [carriers, setCarriers] = useState([
    { name: "Colissimo",     price: 6.90,  delay: "2-3 jours" },
    { name: "Chronopost",    price: 12.90, delay: "24h" },
    { name: "Mondial Relay", price: 4.90,  delay: "3-5 jours" },
  ]);

  // ─────────────────────────────────────────────
  // Bootstrap auth
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (sessionStorage.getItem("admin_authed")) setAuthed(true);
    document.documentElement.classList.remove("dark");
    document.body.style.background = COLORS.canvas;
    document.body.style.color = COLORS.ink900;
  }, []);

  useEffect(() => {
    if (authed) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, period]);

  // Reset search au changement de section
  useEffect(() => { setSearch(""); }, [section]);

  // Ferme les popovers quand on clique à l'extérieur
  useEffect(() => {
    if (!helpOpen && !notifOpen) return;
    const onClick = (e) => {
      if (!e.target.closest?.(".admin-popover-anchor")) {
        setHelpOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [helpOpen, notifOpen]);

  const flash = (msg) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2500); };

  // ─────────────────────────────────────────────
  // Export CSV : KPIs + commandes de la période
  // ─────────────────────────────────────────────
  const downloadReport = () => {
    const periodLabel = PERIODS.find(p => p.id === period)?.label || period;
    const today = new Date().toISOString().slice(0, 10);
    const rows = [];
    rows.push(["Rapport SwingMarketGolf — Console admin"]);
    rows.push(["Période", periodLabel]);
    rows.push(["Généré le", new Date().toLocaleString("fr-FR")]);
    rows.push([]);
    rows.push(["Indicateurs clés"]);
    rows.push(["Chiffre d'affaires (€)",   kpis.revenue.toFixed(2)]);
    rows.push(["Commissions (€)",          kpis.commissions.toFixed(2)]);
    rows.push(["Take rate (%)",            kpis.takeRate.toFixed(2)]);
    rows.push(["Commandes payées",         kpis.count]);
    rows.push(["Panier moyen (€)",         kpis.avgCart.toFixed(2)]);
    rows.push(["Utilisateurs actifs",      kpis.activeUsers]);
    rows.push(["Annonces actives",         kpis.activeProducts]);
    rows.push([]);
    rows.push(["Détail des commandes (période)"]);
    rows.push(["ID", "Date", "Acheteur", "Vendeur", "Produit", "Prix", "Commission", "Total payé", "Statut", "Paiement"]);
    orders.forEach(o => {
      const buyer = profilesById[o.buyer_id];
      rows.push([
        o.id || "",
        o.created_at ? new Date(o.created_at).toLocaleDateString("fr-FR") : "",
        buyer?.full_name || buyer?.email || o.buyer_id || "",
        o.seller_name || o.seller_id || "",
        (o.product_title || "").replace(/[\r\n]+/g, " "),
        Number(o.price || 0).toFixed(2),
        Number(o.commission_amount || 0).toFixed(2),
        Number(o.total_paid || 0).toFixed(2),
        o.status || "",
        o.payment_status || "",
      ]);
    });
    const csv = rows.map(r => r.map(cell => {
      const s = String(cell ?? "");
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swingmarket-rapport-${periodLabel}-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    flash("Rapport CSV téléchargé");
  };

  const doLogin = async () => {
    setAuthError("");
    const isMainAdmin = pwd === ADMIN_PASSWORD && login === ADMIN_LOGIN;
    const { data: dbAdmin } = await supabaseAdmin
      .from("admin_users")
      .select("*").eq("email", login).eq("password", pwd).maybeSingle();
    if (isMainAdmin || dbAdmin) {
      sessionStorage.setItem("admin_authed", "1");
      setAuthed(true);
    } else {
      setAuthError("Identifiants incorrects.");
    }
  };

  const doLogout = () => {
    sessionStorage.removeItem("admin_authed");
    setAuthed(false); setLogin(""); setPwd("");
  };

  // ─────────────────────────────────────────────
  // Chargement Supabase
  // ─────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    const { start, prevStart } = periodBounds(period);

    const [
      ordersRes, prevRes, allOrdersRes, productsRes, profilesRes,
      disputesRes, reviewsCountRes, pendingRes,
      adminsRes, blogRes, reviewsRes,
    ] = await Promise.all([
      supabaseAdmin.from("orders").select("*")
        .gte("created_at", start.toISOString())
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("orders").select("*")
        .gte("created_at", prevStart.toISOString())
        .lt("created_at", start.toISOString()),
      supabaseAdmin.from("orders").select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabaseAdmin.from("products").select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabaseAdmin.from("profiles").select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabaseAdmin.from("orders").select("id", { count: "exact", head: true }).eq("status", "disputed"),
      supabaseAdmin.from("reviews").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending_payment", "paid", "preparing"]),
      supabaseAdmin.from("admin_users").select("*").order("created_at", { ascending: true }),
      supabaseAdmin.from("blog_posts").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("reviews").select("*").order("created_at", { ascending: false }),
    ]);

    // Logs explicites : si une requête échoue, on le voit dans la console
    [
      ["orders period", ordersRes],
      ["orders prev",   prevRes],
      ["orders all",    allOrdersRes],
      ["products",      productsRes],
      ["profiles",      profilesRes],
      ["disputes",      disputesRes],
      ["reviewsCount",  reviewsCountRes],
      ["pending",       pendingRes],
      ["admins",        adminsRes],
      ["blog",          blogRes],
      ["reviews",       reviewsRes],
    ].forEach(([name, res]) => {
      if (res?.error) console.error(`[AdminDashboard] ${name} →`, res.error);
    });

    const ordersData = ordersRes.data || [];
    const productsData = productsRes.data || [];
    const profilesData = profilesRes.data || [];
    const profilesMap = {};
    profilesData.forEach(p => { profilesMap[p.id] = p; });
    console.info(`[AdminDashboard] loaded ${profilesData.length} profiles, ${ordersData.length} orders, ${productsData.length} products`);

    setOrders(ordersData);
    setAllOrders(allOrdersRes.data || []);
    setPrevOrders(prevRes.data || []);
    setProducts(productsData);
    setProfiles(profilesData);
    setProfilesById(profilesMap);
    setAdmins(adminsRes.data || []);
    setBlogPosts(blogRes.data || []);
    setReviews(reviewsRes.data || []);

    // Flux d'import — fetch séparé (pas d'embedded select)
    const { data: feedsData, error: feedsErr } = await supabaseAdmin
      .from("seller_feeds")
      .select("*")
      .order("created_at", { ascending: false });
    if (feedsErr) console.error("[AdminDashboard] seller_feeds →", feedsErr);
    setFeeds(feedsData || []);
    setCounters({
      activeProducts: productsData.filter(p => p.status === "active").length,
      pendingOrders: pendingRes.count || 0,
      activeUsers: profilesData.filter(p => {
        const ref = p.last_seen_at || p.created_at;
        return ref && new Date(ref) >= start;
      }).length,
      disputes: disputesRes.count || 0,
      reviewsCount: reviewsCountRes.count || 0,
    });
    setLoading(false);
  };

  // ─────────────────────────────────────────────
  // CRUD : produits, utilisateurs, commandes, blog, admins, avis
  // ─────────────────────────────────────────────
  const saveProduct = async () => {
    await supabaseAdmin.from("products").update({
      title: editProduct.title,
      description: editProduct.description,
      price: parseFloat(editProduct.price),
      condition: editProduct.condition,
      brand: editProduct.brand,
      category: editProduct.category,
      status: editProduct.status,
      images: editProduct.images,
    }).eq("id", editProduct.id);
    setEditProduct(null);
    flash("Annonce mise à jour");
    loadData();
  };

  const deleteProduct = async (id) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    await supabaseAdmin.from("products").delete().eq("id", id);
    flash("Annonce supprimée");
    loadData();
  };

  const saveUser = async () => {
    await supabaseAdmin.from("profiles").update({
      full_name: editUser.full_name,
      email: editUser.email,
      phone: editUser.phone,
      city: editUser.city,
      address: editUser.address,
      postal_code: editUser.postal_code,
      seller_onboarding_completed: editUser.seller_onboarding_completed,
      plan: editUser.plan || "basique",
    }).eq("id", editUser.id);
    setEditUser(null);
    flash("Utilisateur mis à jour");
    loadData();
  };

  const saveOrder = async () => {
    await supabaseAdmin.from("orders").update({
      status: editOrder.status,
      tracking_number: editOrder.tracking_number,
    }).eq("id", editOrder.id);
    setEditOrder(null);
    flash("Commande mise à jour");
    loadData();
  };

  const saveBlog = async () => {
    if (editBlog.id) {
      await supabaseAdmin.from("blog_posts").update({
        title: editBlog.title, content: editBlog.content,
        excerpt: editBlog.excerpt, slug: editBlog.slug,
        published: editBlog.published,
      }).eq("id", editBlog.id);
    } else {
      await supabaseAdmin.from("blog_posts").insert({
        title: editBlog.title, content: editBlog.content,
        excerpt: editBlog.excerpt,
        slug: editBlog.slug || editBlog.title.toLowerCase().replace(/\s+/g, "-"),
        published: editBlog.published,
      });
    }
    setEditBlog(null);
    flash("Article sauvegardé");
    loadData();
  };

  const deleteBlog = async (id) => {
    if (!confirm("Supprimer cet article ?")) return;
    await supabaseAdmin.from("blog_posts").delete().eq("id", id);
    flash("Article supprimé");
    loadData();
  };

  const addAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password) { alert("Email et mot de passe requis"); return; }
    if (admins.find(a => a.email === newAdmin.email)) { alert("Cet email existe déjà"); return; }
    const { error } = await supabaseAdmin.from("admin_users")
      .insert({ email: newAdmin.email, password: newAdmin.password, role: newAdmin.role });
    if (error) { alert("Erreur: " + error.message); return; }
    setNewAdmin({ email: "", password: "", role: "Admin" });
    flash("Administrateur ajouté");
    loadData();
  };

  const deleteAdmin = async (id) => {
    if (!confirm("Supprimer cet administrateur ?")) return;
    await supabaseAdmin.from("admin_users").delete().eq("id", id);
    flash("Administrateur supprimé");
    loadData();
  };

  const saveAdmin = async () => {
    const updates = { email: editAdmin.email, role: editAdmin.role };
    if (editAdmin.newPassword) updates.password = editAdmin.newPassword;
    await supabaseAdmin.from("admin_users").update(updates).eq("id", editAdmin.id);
    setEditAdmin(null);
    flash("Administrateur mis à jour");
    loadData();
  };

  const saveReview = async () => {
    if (!editReview.seller_id || !editReview.buyer_name) {
      alert("Sélectionnez un vendeur et saisissez un nom d'acheteur"); return;
    }
    if (editReview.id) {
      await supabaseAdmin.from("reviews").update({
        seller_id: editReview.seller_id,
        buyer_name: editReview.buyer_name,
        rating: parseInt(editReview.rating),
        comment: editReview.comment,
      }).eq("id", editReview.id);
    } else {
      await supabaseAdmin.from("reviews").insert({
        seller_id: editReview.seller_id,
        buyer_name: editReview.buyer_name,
        rating: parseInt(editReview.rating),
        comment: editReview.comment,
      });
    }
    setEditReview(null);
    flash("Avis sauvegardé");
    loadData();
  };

  const deleteReview = async (id) => {
    if (!confirm("Supprimer cet avis ?")) return;
    await supabaseAdmin.from("reviews").delete().eq("id", id);
    flash("Avis supprimé");
    loadData();
  };

  const loadUserHistory = async (user) => {
    const [{ data: listings }, { data: purchases }] = await Promise.all([
      supabaseAdmin.from("products").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("orders").select("*").eq("buyer_id", user.id).order("created_at", { ascending: false }),
    ]);
    setUserHistory({ user, listings: listings || [], purchases: purchases || [] });
  };

  // ═════════════════════════════════════════════
  // FLUX D'IMPORT (catalogue vendeurs pros)
  // ═════════════════════════════════════════════

  // Ouvre le wizard en création
  const openFeedWizardCreate = () => {
    setEditFeed({
      id: null,
      name: "",
      seller_id: "",
      source_type: "manual_csv",
      mapping: null,
      on_missing_action: "deactivate",
      notification_email: "",
    });
    resetWizardCsvState();
    setFeedWizardStep(0);
  };

  // Ouvre le wizard en édition (pour réimporter un CSV sur un flux existant)
  const openFeedWizardEdit = (feed) => {
    setEditFeed({ ...feed });
    resetWizardCsvState();
    // Pré-remplit le mapping s'il existe déjà
    if (feed.mapping) setFeedMapping(feed.mapping);
    setFeedWizardStep(0);
  };

  const resetWizardCsvState = () => {
    setImportedRows([]);
    setImportedColumns([]);
    setImportedFilename("");
    setDetectedPlatform(null);
    setFeedMapping({});
    setFeedImporting(false);
    setFeedImportProgress({ done: 0, total: 0 });
  };

  const closeFeedWizard = () => {
    setEditFeed(null);
    resetWizardCsvState();
    setFeedWizardStep(0);
  };

  // Lance la sync : ouvre direct le wizard à STEP 1 pour réimporter un CSV
  const launchSync = (feed) => {
    setEditFeed({ ...feed });
    resetWizardCsvState();
    if (feed.mapping) setFeedMapping(feed.mapping);
    setFeedWizardStep(1);
  };

  const deleteFeed = async (id) => {
    if (!confirm("Supprimer ce flux ? Les produits déjà importés ne seront pas supprimés.")) return;
    const { error } = await supabaseAdmin.from("seller_feeds").delete().eq("id", id);
    if (error) { alert("Erreur : " + error.message); return; }
    flash("Flux supprimé");
    loadData();
  };

  // ─── Sync manuelle d'un flux (URL distante uniquement) ───
  const syncNow = async (feed) => {
    if (feed.source_type !== "remote_url") {
      // Pour un flux CSV, on rouvre le wizard à la step 1 pour réimporter un fichier
      launchSync(feed);
      return;
    }
    setSyncing((s) => ({ ...s, [feed.id]: true }));
    try {
      const r = await fetch("/api/feeds/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feed_id: feed.id }),
      });
      const json = await r.json();
      if (!json.ok) {
        alert("Sync échouée : " + (json.error || "erreur"));
      } else {
        const s = json.stats || {};
        flash(`✓ Sync OK · +${s.added || 0} / ${s.updated || 0} MAJ / ${s.removed || 0} retirés${s.failed ? ` · ${s.failed} échecs` : ""}`);
      }
    } catch (e) {
      alert("Erreur réseau : " + (e.message || e));
    }
    setSyncing((s) => { const n = { ...s }; delete n[feed.id]; return n; });
    loadData();
  };

  // ─── Toggle pause / actif ───
  const togglePauseFeed = async (feed) => {
    const next = feed.status === "active" ? "paused" : "active";
    const { error } = await supabaseAdmin
      .from("seller_feeds")
      .update({ status: next })
      .eq("id", feed.id);
    if (error) { alert("Erreur : " + error.message); return; }
    flash(next === "active" ? "Flux réactivé" : "Flux mis en pause");
    loadData();
  };

  // ─── Ouvrir l'historique des runs ───
  const openHistory = async (feed) => {
    setHistoryFeed(feed);
    setHistoryRuns([]);
    setHistoryLoading(true);
    const { data, error } = await supabaseAdmin
      .from("seller_feed_runs")
      .select("*")
      .eq("feed_id", feed.id)
      .order("started_at", { ascending: false })
      .limit(20);
    setHistoryRuns(data || []);
    setHistoryLoading(false);
    if (error) console.error("[history]", error);
  };

  // ─────────────────────────────────────────────
  // Détection auto plateforme à partir des colonnes CSV
  // ─────────────────────────────────────────────
  const detectPlatformFromColumns = (cols) => {
    const set = new Set(cols);
    if (set.has("name") && set.has("price_tax_incl")) return "prestashop";
    if (set.has("Title") && set.has("Variant Price")) return "shopify";
    if (set.has("post_title") && set.has("regular_price")) return "woocommerce";
    return "custom";
  };

  // Mapping pré-rempli selon plateforme détectée
  const getDefaultMapping = (platform) => {
    if (platform === "prestashop") return {
      title: "name", price: "price_tax_incl", category: "category_name",
      description: "description_short", brand: "manufacturer_name",
      condition: "", images: "image_url", stock: "quantity",
    };
    if (platform === "shopify") return {
      title: "Title", price: "Variant Price", category: "Type",
      description: "Body (HTML)", brand: "Vendor",
      condition: "", images: "Image Src", stock: "Variant Inventory Qty",
    };
    if (platform === "woocommerce") return {
      title: "post_title", price: "regular_price", category: "",
      description: "post_content", brand: "pa_brand",
      condition: "", images: "images", stock: "stock",
    };
    return {
      title: "", price: "", category: "", description: "",
      brand: "", condition: "", images: "", stock: "",
    };
  };

  // Parse un fichier CSV avec papaparse + détection plateforme
  const parseCsvFile = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data || [];
          const cols = results.meta?.fields || [];
          const platform = detectPlatformFromColumns(cols);
          resolve({ rows, cols, platform });
        },
        error: (err) => reject(err),
      });
    });
  };

  // Helper : split une string d'URLs séparées par , ou |
  const splitImages = (val) => {
    if (!val) return [];
    return String(val).split(/[,|]/).map((s) => s.trim()).filter(Boolean);
  };

  // ─────────────────────────────────────────────
  // Lance l'import final (étape 3)
  // ─────────────────────────────────────────────
  const runFeedImport = async () => {
    if (!editFeed?.seller_id || !editFeed?.name) {
      alert("Nom et vendeur requis"); return;
    }
    if (importedRows.length === 0) {
      alert("Aucune ligne à importer"); return;
    }
    const seller = profilesById[editFeed.seller_id];
    const sellerName = seller?.shop_name || seller?.full_name || "Vendeur";

    setFeedImporting(true);

    const isRemoteUrl = editFeed.source_type === "remote_url";

    // 1) Upsert du flux : on crée ou on met à jour selon le cas
    let feedId = editFeed.id;
    const feedPayload = {
      name: editFeed.name,
      seller_id: editFeed.seller_id,
      source_type: editFeed.source_type || "manual_csv",
      source_url: isRemoteUrl ? (editFeed.source_url || null) : null,
      source_format: isRemoteUrl ? null : "csv",
      detected_platform: detectedPlatform,
      mapping: feedMapping,
      sync_frequency: isRemoteUrl ? (editFeed.sync_frequency || "daily") : "manual",
      on_missing_action: editFeed.on_missing_action || "deactivate",
      notification_email: editFeed.notification_email || null,
      status: "active",
    };

    try {
      if (feedId) {
        const { error: upErr } = await supabaseAdmin
          .from("seller_feeds")
          .update(feedPayload)
          .eq("id", feedId);
        if (upErr) throw upErr;
      } else {
        const { data: created, error: insErr } = await supabaseAdmin
          .from("seller_feeds")
          .insert(feedPayload)
          .select()
          .single();
        if (insErr) throw insErr;
        feedId = created.id;
      }
    } catch (e) {
      console.error("Création/MAJ flux:", e);
      alert("Erreur création flux : " + (e.message || e));
      setFeedImporting(false);
      return;
    }

    // ─── Mode URL distante : on délègue la sync à l'endpoint serverless
    // ─── /api/feeds/sync (qui exécute la logique côté serveur en utilisant
    // ─── la service_key Supabase). On évite d'importer 50+ produits côté
    // ─── client et on bénéficie automatiquement du diff (UPDATE vs INSERT).
    if (isRemoteUrl) {
      try {
        const r = await fetch("/api/feeds/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feed_id: feedId }),
        });
        const json = await r.json();
        setFeedImporting(false);
        if (!json.ok) {
          alert("Sync échouée : " + (json.error || "erreur inconnue"));
          return;
        }
        const s = json.stats || {};
        flash(`✓ Flux activé · ${s.added || 0} ajoutés, ${s.updated || 0} MAJ${s.failed ? `, ${s.failed} échecs` : ""}`);
        closeFeedWizard();
        loadData();
        return;
      } catch (e) {
        console.error("sync remote:", e);
        alert("Erreur réseau lors de la première sync : " + (e.message || e));
        setFeedImporting(false);
        return;
      }
    }

    // 2) Crée la run (status=running)
    let runId;
    try {
      const { data: runData, error: runErr } = await supabaseAdmin
        .from("seller_feed_runs")
        .insert({ feed_id: feedId, status: "running" })
        .select()
        .single();
      if (runErr) throw runErr;
      runId = runData.id;
    } catch (e) {
      console.error("Création run:", e);
    }

    // 3) Import par batches de 50
    const BATCH = 50;
    let added = 0;
    let failed = 0;
    const errorsLog = [];
    setFeedImportProgress({ done: 0, total: importedRows.length });

    for (let i = 0; i < importedRows.length; i += BATCH) {
      const chunk = importedRows.slice(i, i + BATCH);
      // Construit les payloads produit pour ce batch
      const payloads = chunk.map((row) => {
        const stockVal = parseInt(row[feedMapping.stock] || "1");
        return {
          title: (row[feedMapping.title] || "Sans titre").toString().slice(0, 200),
          description: row[feedMapping.description] || "",
          price: parseFloat(row[feedMapping.price]) || 0,
          brand: row[feedMapping.brand] || null,
          category: row[feedMapping.category] || "Autres",
          condition: row[feedMapping.condition] || "Très bon",
          images: splitImages(row[feedMapping.images]),
          seller_id: editFeed.seller_id,
          seller_name: sellerName,
          status: stockVal >= 1 ? "active" : "archived",
          sale_type: "fixed",
          views_count: 0,
          favorites_count: 0,
          created_at: new Date().toISOString(),
        };
      });

      // INSERT en batch — si une ligne échoue on retombe sur insert unitaire
      try {
        const { error: batchErr } = await supabaseAdmin.from("products").insert(payloads);
        if (batchErr) throw batchErr;
        added += payloads.length;
      } catch (batchErr) {
        // Fallback unitaire : chaque ligne individuellement
        for (const p of payloads) {
          try {
            const { error: oneErr } = await supabaseAdmin.from("products").insert(p);
            if (oneErr) throw oneErr;
            added += 1;
          } catch (oneErr) {
            failed += 1;
            errorsLog.push({ title: p.title, error: oneErr.message || String(oneErr) });
          }
        }
      }

      setFeedImportProgress({ done: Math.min(i + BATCH, importedRows.length), total: importedRows.length });
    }

    // 4) Update de la run
    const finalStatus = failed === 0 ? "success" : (added > 0 ? "partial" : "error");
    if (runId) {
      try {
        await supabaseAdmin.from("seller_feed_runs").update({
          ended_at: new Date().toISOString(),
          products_added: added,
          products_failed: failed,
          errors_log: errorsLog.length > 0 ? errorsLog.slice(0, 200) : null,
          status: finalStatus,
        }).eq("id", runId);
      } catch (e) { console.error("update run:", e); }
    }

    // 5) Update du flux : last_sync_*, total_products
    try {
      const { count: totalActive } = await supabaseAdmin
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", editFeed.seller_id)
        .eq("status", "active");
      await supabaseAdmin.from("seller_feeds").update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: finalStatus,
        last_sync_message: `${added} ajoutés, ${failed} échecs`,
        total_products: totalActive || 0,
      }).eq("id", feedId);
    } catch (e) { console.error("update feed sync:", e); }

    setFeedImporting(false);
    flash(`✓ ${added} produits importés${failed > 0 ? ` (${failed} erreurs)` : ""}`);
    closeFeedWizard();
    loadData();
  };

  // ─────────────────────────────────────────────
  // Dérivés
  // ─────────────────────────────────────────────
  const kpis = useMemo(() => {
    const succeeded = orders.filter(o => o.payment_status === "succeeded");
    const revenue   = succeeded.reduce((s, o) => s + Number(o.total_paid || o.price || 0), 0);
    const commissionsSum = succeeded.reduce((s, o) => s + Number(o.commission_amount || 0), 0);
    const count = succeeded.length;
    const avgCart = count > 0 ? revenue / count : 0;
    const takeRate = revenue > 0 ? (commissionsSum / revenue) * 100 : 0;

    const prevSucceeded = prevOrders.filter(o => o.payment_status === "succeeded");
    const prevRevenue = prevSucceeded.reduce((s, o) => s + Number(o.total_paid || o.price || 0), 0);
    const prevCommissions = prevSucceeded.reduce((s, o) => s + Number(o.commission_amount || 0), 0);
    const prevCount = prevSucceeded.length;

    const delta = (cur, prev) => {
      if (prev === 0 && cur === 0) return 0;
      if (prev === 0) return 100;
      return ((cur - prev) / prev) * 100;
    };

    return {
      revenue, commissions: commissionsSum, count, avgCart, takeRate,
      revenueDelta: delta(revenue, prevRevenue),
      commissionsDelta: delta(commissionsSum, prevCommissions),
      countDelta: delta(count, prevCount),
      activeUsers: counters.activeUsers,
      activeProducts: counters.activeProducts,
    };
  }, [orders, prevOrders, counters]);

  const series = useMemo(() => groupSeries(orders, period), [orders, period]);

  const categoriesAgg = useMemo(() => {
    const productById = {};
    products.forEach(p => { productById[p.id] = p; });
    const m = new Map();
    orders
      .filter(o => o.payment_status === "succeeded")
      .forEach(o => {
        const cat = productById[o.product_id]?.category || "Autres";
        m.set(cat, (m.get(cat) || 0) + Number(o.total_paid || o.price || 0));
      });
    return [...m.entries()]
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [orders, products]);

  const topSellers = useMemo(() => {
    const m = new Map();
    orders
      .filter(o => o.payment_status === "succeeded")
      .forEach(o => {
        if (!o.seller_id) return;
        const cur = m.get(o.seller_id) || { id: o.seller_id, name: o.seller_name || "—", revenue: 0, count: 0 };
        cur.revenue += Number(o.total_paid || o.price || 0);
        cur.count += 1;
        m.set(o.seller_id, cur);
      });
    return [...m.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5)
      .map(s => ({ ...s, profile: profilesById[s.id] }));
  }, [orders, profilesById]);

  const ordersFilteredByTab = useMemo(() => {
    let arr = allOrders;
    if (orderTab === "todo") arr = arr.filter(o => ["pending_payment", "paid", "preparing"].includes(o.status));
    else if (orderTab === "shipped") arr = arr.filter(o => ["shipped", "delivered"].includes(o.status));
    else if (orderTab === "disputes") arr = arr.filter(o => o.status === "disputed");
    if (search) {
      const s = search.toLowerCase();
      arr = arr.filter(o =>
        o.id?.toLowerCase().includes(s) ||
        o.product_title?.toLowerCase().includes(s) ||
        o.seller_name?.toLowerCase().includes(s)
      );
    }
    return arr;
  }, [allOrders, orderTab, search]);

  const productsFiltered = useMemo(() => {
    if (!search) return products;
    const s = search.toLowerCase();
    return products.filter(p =>
      p.title?.toLowerCase().includes(s) ||
      p.brand?.toLowerCase().includes(s) ||
      p.category?.toLowerCase().includes(s)
    );
  }, [products, search]);

  const profilesFiltered = useMemo(() => {
    if (!search) return profiles;
    const s = search.toLowerCase();
    return profiles.filter(u =>
      u.email?.toLowerCase().includes(s) ||
      u.full_name?.toLowerCase().includes(s) ||
      u.shop_name?.toLowerCase().includes(s)
    );
  }, [profiles, search]);

  const activity = useMemo(() => {
    const events = [];
    orders.slice(0, 5).forEach(o => events.push({
      kind: "sale",
      text: <><strong>{o.seller_name || "Vendeur"}</strong> a finalisé une commande de <strong>{fmtEUR2(o.total_paid || o.price)} €</strong>{o.commission_amount ? <> · commission {fmtEUR2(o.commission_amount)} €</> : null}</>,
      when: o.created_at, seed: o.seller_name || o.seller_id || "?",
    }));
    products.slice(0, 5).forEach(p => events.push({
      kind: "list",
      text: <>Nouvelle annonce <strong>« {p.title} »</strong> à {fmtEUR2(p.price)} €</>,
      when: p.created_at, seed: p.title || "?",
    }));
    events.sort((a, b) => new Date(b.when) - new Date(a.when));
    return events.slice(0, 6);
  }, [orders, products]);

  // ─────────────────────────────────────────────
  // Login screen
  // ─────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center",
        background: COLORS.canvas, fontFamily: "Inter, sans-serif" }}>
        <div style={{ width: 380, background: COLORS.paper, borderRadius: 14,
          border: `1px solid ${COLORS.ink200}`, padding: 28,
          boxShadow: "0 12px 28px -8px rgba(15,23,42,.10)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, color: "#fff",
              background: `linear-gradient(160deg, ${COLORS.green800}, ${COLORS.green700})`,
              display: "grid", placeItems: "center", fontWeight: 800, fontSize: 15 }}>S</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.1 }}>
                SwingMarket<span style={{ color: COLORS.gold600 }}>Golf</span>
              </div>
              <div style={{ fontSize: 11, color: COLORS.ink500 }}>Console d'administration</div>
            </div>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: "8px 0 4px" }}>Connexion admin</h1>
          <p style={{ fontSize: 13, color: COLORS.ink500, margin: "0 0 18px" }}>
            Accès réservé aux administrateurs autorisés.
          </p>
          <label style={loginLabelStyle}>Email</label>
          <input type="email" value={login} onChange={e => setLogin(e.target.value)}
            placeholder="admin@swingmarketgolf.com" style={loginInputStyle}
            onKeyDown={e => e.key === "Enter" && doLogin()} />
          <label style={{ ...loginLabelStyle, marginTop: 12 }}>Mot de passe</label>
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)}
            placeholder="••••••••" style={loginInputStyle}
            onKeyDown={e => e.key === "Enter" && doLogin()} />
          {authError && <div style={{ marginTop: 12, padding: "8px 10px", fontSize: 12,
            background: "#FEF2F2", border: `1px solid #FECACA`, color: "#B91C1C", borderRadius: 8 }}>{authError}</div>}
          <button onClick={doLogin} style={{ marginTop: 18, width: "100%", height: 40,
            background: COLORS.ink900, color: "#fff", fontWeight: 600, fontSize: 13,
            borderRadius: 9, border: 0, cursor: "pointer" }}>Se connecter</button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // App layout
  // ─────────────────────────────────────────────
  const sectionLabel =
    NAV_GROUPS.flatMap(g => g.items).find(i => i.id === section)?.label || "Tableau de bord";

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandMark}>S</div>
          <div>
            <div style={styles.brandName}>
              SwingMarket<span style={{ color: COLORS.gold600 }}>Golf</span>
            </div>
            <div style={styles.brandSub}>
              <span style={styles.brandDot} /> Admin · v2.4
            </div>
          </div>
        </div>

        <button style={styles.workspace} onClick={doLogout} title="Cliquer pour se déconnecter">
          <div style={styles.wsAvatar}>AD</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.wsName}>Administrateur</div>
            <div style={styles.wsRole}>Production · session active</div>
          </div>
          <ChevronsUpDown size={14} color={COLORS.ink400} />
        </button>

        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <div style={styles.navLabel}>{group.label}</div>
            <nav style={styles.nav}>
              {group.items.map(item => {
                const isActive = section === item.id;
                const badgeValue = item.badgeKey ? counters[item.badgeKey] : null;
                return (
                  <a key={item.id}
                    onClick={(e) => { e.preventDefault(); setSection(item.id); }}
                    style={{ ...styles.navItem, ...(isActive ? styles.navItemActive : null) }}>
                    <item.Icon size={18} color={isActive ? "#fff" : COLORS.ink500} />
                    <span>{item.label}</span>
                    {badgeValue !== null && badgeValue > 0 && (
                      <span style={{
                        ...styles.navBadge,
                        ...(isActive ? styles.navBadgeOnActive : null),
                        ...(item.badgeAlert && !isActive ? styles.navBadgeAlert : null),
                      }}>{fmtInt(badgeValue)}</span>
                    )}
                  </a>
                );
              })}
            </nav>
          </div>
        ))}

        <div style={styles.sidebarFooter}>
          <div style={styles.upgrade}>
            <h4 style={styles.upgradeTitle}>Audit mensuel disponible</h4>
            <p style={styles.upgradeText}>
              KPIs et liste des commandes prêts à être exportés en CSV.
            </p>
            <button style={styles.upgradeBtn} onClick={downloadReport}>
              Télécharger le rapport
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={styles.main}>
        <header style={styles.header}>
          <div style={styles.crumbs}>
            <span>Admin</span>
            <span style={{ color: COLORS.ink300 }}>/</span>
            <span style={styles.crumbsHere}>{sectionLabel}</span>
          </div>
          <div style={styles.search}>
            <Search size={16} color={COLORS.ink400} style={{ position: "absolute", left: 12, top: 11 }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher commande, annonce, utilisateur…"
              style={styles.searchInput}
            />
          </div>
          <div style={styles.headerActions}>
            {savedMsg && (
              <span style={{ background: "#ECFDF5", color: "#047857", padding: "5px 11px",
                borderRadius: 999, fontSize: 12, fontWeight: 600 }}>✓ {savedMsg}</span>
            )}
            <div className="admin-popover-anchor" style={{ position: "relative" }}>
              <button style={styles.iconBtn} aria-label="Aide"
                onClick={() => { setHelpOpen(o => !o); setNotifOpen(false); }}>
                <HelpCircle size={16} />
              </button>
              {helpOpen && <HelpPopover onClose={() => setHelpOpen(false)} />}
            </div>
            <div className="admin-popover-anchor" style={{ position: "relative" }}>
              <button style={styles.iconBtn} aria-label="Notifications"
                onClick={() => { setNotifOpen(o => !o); setHelpOpen(false); }}>
                <Bell size={16} />
                {(counters.pendingOrders + counters.disputes) > 0 && <span style={styles.ping} />}
              </button>
              {notifOpen && (
                <NotifPopover
                  counters={counters}
                  recentOrders={allOrders.slice(0, 4)}
                  recentReviews={reviews.slice(0, 2)}
                  onGoTo={(s) => { setSection(s); setNotifOpen(false); }}
                  onClose={() => setNotifOpen(false)}
                />
              )}
            </div>
            <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={loadData}>
              <RefreshCw size={14} /> Actualiser
            </button>
            <div style={styles.avatar}>AD</div>
          </div>
        </header>

        <main style={styles.page}>
          {section === "overview" && (
            <Overview
              loading={loading} period={period} setPeriod={setPeriod}
              kpis={kpis} series={series} categoriesAgg={categoriesAgg}
              orders={ordersFilteredByTab} orderTab={orderTab} setOrderTab={setOrderTab}
              counters={counters} activity={activity} topSellers={topSellers}
              profilesById={profilesById}
            />
          )}
          {section === "orders" && (
            <OrdersSection orders={ordersFilteredByTab} profilesById={profilesById}
              onEdit={(o) => setEditOrder({ ...o })} onTabChange={setOrderTab} orderTab={orderTab}
              counters={counters} />
          )}
          {section === "products" && (
            <ProductsSection products={productsFiltered}
              onEdit={(p) => setEditProduct({ ...p })} onDelete={deleteProduct} />
          )}
          {section === "users" && (
            <UsersSection profiles={profilesFiltered}
              onEdit={(u) => setEditUser({ ...u })} onHistory={loadUserHistory} />
          )}
          {section === "payments" && (
            <PaymentsSection orders={allOrders} profilesById={profilesById} kpis={kpis} />
          )}
          {section === "commissions" && (
            <CommissionsSection commissions={commissions} setCommissions={setCommissions}
              onSave={() => flash("Grille de commissions sauvegardée")} />
          )}
          {section === "disputes" && (
            <DisputesSection orders={allOrders.filter(o => o.status === "disputed")}
              profilesById={profilesById} onEdit={(o) => setEditOrder({ ...o })} />
          )}
          {section === "reports" && (
            <ReportsSection kpis={kpis} period={period} />
          )}
          {section === "carriers" && (
            <CarriersSection carriers={carriers} setCarriers={setCarriers}
              newCarrier={newCarrier} setNewCarrier={setNewCarrier}
              onSave={() => flash("Transporteurs sauvegardés")}
              onAdd={() => {
                if (!newCarrier.name || !newCarrier.price) return;
                setCarriers([...carriers, { name: newCarrier.name, price: parseFloat(newCarrier.price), delay: newCarrier.delay }]);
                setNewCarrier({ name: "", price: "", delay: "" });
                flash("Transporteur ajouté");
              }} />
          )}
          {section === "feeds" && (
            <FeedsSection
              feeds={feeds}
              profilesById={profilesById}
              syncing={syncing}
              onCreate={openFeedWizardCreate}
              onEdit={openFeedWizardEdit}
              onDelete={deleteFeed}
              onSyncNow={syncNow}
              onTogglePause={togglePauseFeed}
              onOpenHistory={openHistory}
            />
          )}
          {section === "categories" && (
            <CategoriesSection categoriesAgg={categoriesAgg} products={products} />
          )}
          {section === "reviews" && (
            <ReviewsSection reviews={reviews} profilesById={profilesById}
              onAdd={() => setEditReview({ seller_id: "", buyer_name: "", rating: 5, comment: "" })}
              onEdit={(r) => setEditReview({ ...r })} onDelete={deleteReview} />
          )}
          {section === "blog" && (
            <BlogSection posts={blogPosts}
              onAdd={() => setEditBlog({ title: "", content: "", excerpt: "", slug: "", published: false })}
              onEdit={(b) => setEditBlog({ ...b })} onDelete={deleteBlog} />
          )}
          {section === "admins" && (
            <AdminsSection admins={admins} newAdmin={newAdmin} setNewAdmin={setNewAdmin}
              onAdd={addAdmin} onEdit={(a) => setEditAdmin({ ...a, newPassword: "" })}
              onDelete={deleteAdmin} />
          )}
        </main>
      </div>

      {/* MODALS */}
      {editProduct && (
        <ProductModal product={editProduct} setProduct={setEditProduct} onSave={saveProduct} />
      )}
      {editUser && (
        <UserModal user={editUser} setUser={setEditUser} onSave={saveUser} />
      )}
      {editOrder && (
        <OrderModal order={editOrder} setOrder={setEditOrder} onSave={saveOrder} />
      )}
      {editBlog && (
        <BlogModal post={editBlog} setPost={setEditBlog} onSave={saveBlog} />
      )}
      {editAdmin && (
        <AdminModal admin={editAdmin} setAdmin={setEditAdmin} onSave={saveAdmin} />
      )}
      {editReview && (
        <ReviewModal review={editReview} setReview={setEditReview} profiles={profiles} onSave={saveReview} />
      )}
      {userHistory && (
        <UserHistoryModal data={userHistory} onClose={() => setUserHistory(null)} />
      )}
      {historyFeed && (
        <FeedHistoryModal
          feed={historyFeed}
          runs={historyRuns}
          loading={historyLoading}
          onClose={() => { setHistoryFeed(null); setHistoryRuns([]); }}
        />
      )}
      {editFeed && (
        <FeedWizardModal
          feed={editFeed}
          setFeed={setEditFeed}
          step={feedWizardStep}
          setStep={setFeedWizardStep}
          profiles={profiles}
          profilesById={profilesById}
          importedRows={importedRows}
          setImportedRows={setImportedRows}
          importedColumns={importedColumns}
          setImportedColumns={setImportedColumns}
          importedFilename={importedFilename}
          setImportedFilename={setImportedFilename}
          detectedPlatform={detectedPlatform}
          setDetectedPlatform={setDetectedPlatform}
          feedMapping={feedMapping}
          setFeedMapping={setFeedMapping}
          parseCsvFile={parseCsvFile}
          getDefaultMapping={getDefaultMapping}
          importing={feedImporting}
          progress={feedImportProgress}
          onClose={closeFeedWizard}
          onSubmit={runFeedImport}
        />
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// FLUX D'IMPORT — Liste des flux (FeedsSection)
// ═════════════════════════════════════════════════════════
function FeedsSection({ feeds, profilesById, syncing, onCreate, onEdit, onDelete, onSyncNow, onTogglePause, onOpenHistory }) {
  const STATUS_VARIANTS = {
    active:   "deliv",
    draft:    "prep",
    paused:   "pay",
    error:    "refund",
  };
  const STATUS_LABELS = {
    active: "Actif",
    draft:  "Brouillon",
    paused: "En pause",
    error:  "Erreur",
  };
  return (
    <>
      <PageHeader
        title="Flux d'import"
        sub={`${feeds.length} flux configuré${feeds.length > 1 ? "s" : ""} · import du catalogue de vos vendeurs pros`}
        right={
          <button onClick={onCreate} style={{ ...styles.btn, ...styles.btnPrimary }}>
            <Plus size={14} /> Nouveau flux
          </button>
        }
      />

      {feeds.length === 0 ? (
        <section style={{ ...styles.card, padding: 56, textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: COLORS.ink50,
            display: "grid", placeItems: "center", margin: "0 auto 16px",
          }}>
            <Upload size={26} color={COLORS.ink400} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>Aucun flux pour l'instant</h3>
          <p style={{ fontSize: 13, color: COLORS.ink500, margin: "0 auto 18px", maxWidth: 420 }}>
            Créez votre premier flux pour importer le catalogue d'un vendeur pro
            depuis un export CSV PrestaShop, Shopify ou WooCommerce.
          </p>
          <button onClick={onCreate} style={{ ...styles.btn, ...styles.btnPrimary, margin: "0 auto" }}>
            <Plus size={14} /> Créer un flux
          </button>
        </section>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {feeds.map((f) => {
            const seller = profilesById[f.seller_id];
            const sellerName = seller?.shop_name || seller?.full_name || seller?.email || "Vendeur supprimé";
            return (
              <article key={f.id} style={{ ...styles.card, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1, minWidth: 280 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: f.detected_platform === "prestashop" ? "#EEF2F7" :
                                  f.detected_platform === "shopify"    ? "#F0FDF4" :
                                  f.detected_platform === "woocommerce" ? "#F5F3FF" : COLORS.ink50,
                      color: COLORS.ink700, display: "grid", placeItems: "center",
                    }}>
                      <FileSpreadsheet size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink900, margin: 0 }}>{f.name}</h3>
                        <StatusBadge variant={STATUS_VARIANTS[f.status] || "prep"} label={STATUS_LABELS[f.status] || f.status} />
                        {f.detected_platform && (
                          <span style={{
                            fontSize: 10.5, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase",
                            color: COLORS.ink600, background: COLORS.ink100,
                            padding: "2px 7px", borderRadius: 5,
                          }}>{f.detected_platform}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12.5, color: COLORS.ink600, marginBottom: 4 }}>
                        Vendeur · <strong style={{ color: COLORS.ink900 }}>{sellerName}</strong>
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.ink500 }}>
                        Source · {f.source_type === "remote_url" ? "🔗 URL distante" : "Upload manuel CSV"}
                        {f.source_type === "remote_url" && f.sync_frequency && (
                          <> · Fréquence · <strong style={{ color: COLORS.ink700 }}>{({
                            manual: "Manuelle", daily: "Quotidienne",
                            every_6h: "Toutes les 6 h", hourly: "Toutes les heures",
                          })[f.sync_frequency] || f.sync_frequency}</strong></>
                        )}
                        {" · "}
                        Dernière sync · {f.last_sync_at ? relativeTime(f.last_sync_at) : "jamais"}
                        {" · "}
                        <strong style={{ color: COLORS.green800 }}>{fmtInt(f.total_products || 0)}</strong> produits
                      </div>
                      {f.source_type === "remote_url" && f.source_url && (
                        <div style={{ fontSize: 11, color: COLORS.ink400, marginTop: 4, fontFamily: "'JetBrains Mono', monospace", wordBreak: "break-all" }}>
                          {f.source_url}
                        </div>
                      )}
                      {f.last_sync_message && (
                        <div style={{ fontSize: 11.5, color: COLORS.ink500, marginTop: 4, fontStyle: "italic" }}>
                          {f.last_sync_message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      onClick={() => onSyncNow(f)}
                      disabled={!!syncing[f.id]}
                      style={{
                        ...styles.btn, ...styles.btnPrimary,
                        height: 32, padding: "0 12px", fontSize: 12.5,
                        opacity: syncing[f.id] ? 0.6 : 1,
                        cursor: syncing[f.id] ? "wait" : "pointer",
                      }}
                    >
                      {syncing[f.id] ? <RefreshCw size={12} /> : <Play size={12} />}
                      {syncing[f.id]
                        ? "Sync en cours…"
                        : (f.source_type === "remote_url" ? "Sync maintenant" : "Lancer un import")}
                    </button>
                    {f.source_type === "remote_url" && (
                      <button onClick={() => onTogglePause(f)} style={{ ...styles.btn, ...styles.btnGhost, height: 32, padding: "0 12px", fontSize: 12.5 }}>
                        {f.status === "active" ? "⏸ Pause" : "▶ Reprendre"}
                      </button>
                    )}
                    <button onClick={() => onOpenHistory(f)} style={{ ...styles.btn, ...styles.btnGhost, height: 32, padding: "0 12px", fontSize: 12.5 }}>
                      <FileText size={12} /> Historique
                    </button>
                    <button onClick={() => onEdit(f)} style={{ ...styles.btn, ...styles.btnGhost, height: 32, padding: "0 12px", fontSize: 12.5 }}>
                      <Settings2 size={12} /> Configurer
                    </button>
                    <button
                      onClick={() => onDelete(f.id)}
                      style={{ ...styles.btn, ...styles.btnGhost, height: 32, padding: "0 12px", fontSize: 12.5, color: COLORS.danger, borderColor: "rgba(239,68,68,.2)" }}
                    >
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════
// FLUX D'IMPORT — Wizard 4 étapes (FeedWizardModal)
// ═════════════════════════════════════════════════════════
const SWING_FIELDS = [
  { key: "title",       label: "Titre",         required: true,  hint: "Nom du produit affiché sur la marketplace" },
  { key: "price",       label: "Prix (€)",      required: true,  hint: "Prix TTC en nombre décimal (séparateur ., pas de symbole)" },
  { key: "category",    label: "Catégorie",     required: true,  hint: "Ex: Clubs de golf, Balles de golf, Sacs de golf…" },
  { key: "description", label: "Description",   required: false, hint: "HTML accepté" },
  { key: "brand",       label: "Marque",        required: false, hint: "Ex: TaylorMade, Callaway, Titleist…" },
  { key: "condition",   label: "État",          required: false, hint: "Si vide : « Très bon » par défaut" },
  { key: "images",      label: "Photos (URLs)", required: true,  hint: "URLs séparées par , ou |", multi: true },
  { key: "stock",       label: "Stock",         required: false, hint: "0 = produit archivé · ≥1 = produit actif" },
];

function FeedWizardModal({
  feed, setFeed, step, setStep,
  profiles, profilesById,
  importedRows, setImportedRows,
  importedColumns, setImportedColumns,
  importedFilename, setImportedFilename,
  detectedPlatform, setDetectedPlatform,
  feedMapping, setFeedMapping,
  parseCsvFile, getDefaultMapping,
  importing, progress,
  onClose, onSubmit,
}) {
  const fileInputRef = useRef(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  // ─── Test d'URL distante (sync auto) ───
  const [urlTestState, setUrlTestState] = useState("idle"); // idle | testing | success | error
  const [urlTestResult, setUrlTestResult] = useState(null); // { format, platform, totalRows, error }

  // Lance un test d'URL : appelle /api/feeds/test-url avec preview=true
  // et hydrate aussi importedRows/columns/platform pour la suite du wizard.
  const handleTestUrl = async () => {
    if (!feed.source_url) return;
    setUrlTestState("testing");
    setUrlTestResult(null);
    try {
      const res = await fetch("/api/feeds/test-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: feed.source_url, preview: true }),
      });
      const json = await res.json();
      if (!json.ok) {
        setUrlTestState("error");
        setUrlTestResult({ error: json.error || "Erreur inconnue" });
        return;
      }
      setUrlTestState("success");
      setUrlTestResult({
        format: json.format,
        platform: json.platform,
        totalRows: json.totalRows,
      });
      // Hydrate l'état du wizard pour les steps suivantes
      setImportedRows(json.preview || []);
      setImportedColumns(json.columns || []);
      setDetectedPlatform(json.platform);
      setImportedFilename(feed.source_url);
      if (Object.keys(feedMapping).length === 0) {
        setFeedMapping(getDefaultMapping(json.platform));
      }
    } catch (err) {
      setUrlTestState("error");
      setUrlTestResult({ error: err.message || "Erreur réseau" });
    }
  };

  // Vendeurs onboardés uniquement
  const eligibleSellers = useMemo(
    () => profiles.filter((p) => p.seller_onboarding_completed),
    [profiles]
  );

  const seller = profilesById[feed.seller_id];
  const sellerLabel = seller?.shop_name || seller?.full_name || seller?.email;

  // Validation par étape
  const canGoNext = (() => {
    if (step === 0) {
      if (!feed.name || !feed.seller_id || !feed.source_type) return false;
      // En mode URL distante, on exige que le test ait réussi
      if (feed.source_type === "remote_url") {
        return !!feed.source_url && urlTestState === "success";
      }
      return true;
    }
    if (step === 1) return importedRows.length > 0;
    if (step === 2) {
      // title, price, category, images doivent être mappés
      return ["title", "price", "category", "images"].every((k) => !!feedMapping[k]);
    }
    return true;
  })();

  // ─── STEP 1 : parsing CSV ───
  const handleFile = async (file) => {
    if (!file) return;
    setParseError("");
    setParsing(true);
    try {
      const { rows, cols, platform } = await parseCsvFile(file);
      if (!rows.length) throw new Error("Le fichier est vide ou n'a pas de header.");
      setImportedRows(rows);
      setImportedColumns(cols);
      setDetectedPlatform(platform);
      setImportedFilename(file.name);
      // Pré-remplit le mapping seulement s'il est encore vide
      if (Object.keys(feedMapping).length === 0) {
        setFeedMapping(getDefaultMapping(platform));
      }
    } catch (e) {
      setParseError(e.message || "Erreur de parsing CSV");
    }
    setParsing(false);
  };

  const onDropFile = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFile(f);
  };

  const STEPS = ["Création", "Import", "Mapping", "Sync"];

  return (
    <div style={modalOverlayStyle} onClick={importing ? undefined : onClose}>
      <div style={{ ...modalBoxStyle, maxWidth: 880 }} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeadStyle}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
            {feed.id ? "Modifier le flux" : "Nouveau flux d'import"}
          </h3>
          <button onClick={onClose} style={styles.rowAction} disabled={importing}><X size={16} /></button>
        </div>

        {/* Stepper visuel */}
        <div style={{ padding: "16px 24px 8px", borderBottom: `1px solid ${COLORS.ink150}`, background: COLORS.ink50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {STEPS.map((label, i) => {
              const active = i === step;
              const done = i < step;
              return (
                <Fragment key={label}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "5px 11px", borderRadius: 999,
                    background: active ? COLORS.ink900 : (done ? COLORS.green50 : "transparent"),
                    color: active ? "#fff" : (done ? COLORS.green800 : COLORS.ink500),
                    fontSize: 12, fontWeight: 600,
                  }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: active ? "#fff" : (done ? COLORS.green800 : COLORS.ink200),
                      color: active ? COLORS.ink900 : (done ? "#fff" : COLORS.ink500),
                      display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700,
                    }}>{done ? <Check size={11} /> : i + 1}</span>
                    {label}
                  </div>
                  {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: COLORS.ink200 }} />}
                </Fragment>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", maxHeight: "65vh", overflowY: "auto" }}>
          {step === 0 && (
            <div>
              <FormField label="Nom du flux">
                <input
                  style={modalInputStyle}
                  value={feed.name || ""}
                  onChange={(e) => setFeed({ ...feed, name: e.target.value })}
                  placeholder="Ex : ProGolf Marseille — Catalogue 2026"
                />
              </FormField>

              <div style={{ marginTop: 12 }}>
                <FormField label="Vendeur associé">
                  <select
                    style={modalInputStyle}
                    value={feed.seller_id || ""}
                    onChange={(e) => setFeed({ ...feed, seller_id: e.target.value })}
                  >
                    <option value="">— Choisir un vendeur —</option>
                    {eligibleSellers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shop_name || s.full_name || s.email} {s.email ? `· ${s.email}` : ""}
                      </option>
                    ))}
                  </select>
                </FormField>
                <p style={{ fontSize: 11.5, color: COLORS.ink500, marginTop: 4 }}>
                  Seuls les vendeurs ayant terminé leur onboarding apparaissent.
                </p>
              </div>

              <div style={{ marginTop: 18 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.ink600, display: "block", marginBottom: 8 }}>
                  Type de flux
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={radioOptionStyle(feed.source_type === "manual_csv")}>
                    <input
                      type="radio"
                      checked={feed.source_type === "manual_csv"}
                      onChange={() => setFeed({ ...feed, source_type: "manual_csv" })}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.ink900 }}>Upload manuel CSV</div>
                      <div style={{ fontSize: 11.5, color: COLORS.ink500 }}>
                        Le vendeur exporte son catalogue, vous l'importez à la main.
                      </div>
                    </div>
                  </label>
                  <label style={radioOptionStyle(feed.source_type === "remote_url")}>
                    <input
                      type="radio"
                      checked={feed.source_type === "remote_url"}
                      onChange={() => {
                        setFeed({ ...feed, source_type: "remote_url" });
                        setUrlTestState("idle");
                        setUrlTestResult(null);
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.ink900 }}>URL distante (sync auto)</div>
                      <div style={{ fontSize: 11.5, color: COLORS.ink500 }}>
                        Synchronisation périodique depuis un export PrestaShop / Shopify / WooCommerce / Google Merchant.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Champ URL + bouton "Tester la connexion" — visible uniquement en mode remote_url */}
              {feed.source_type === "remote_url" && (
                <div style={{ marginTop: 18 }}>
                  <FormField label="URL du flux distant">
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="url"
                        style={{ ...modalInputStyle, flex: 1 }}
                        value={feed.source_url || ""}
                        onChange={(e) => {
                          setFeed({ ...feed, source_url: e.target.value });
                          if (urlTestState !== "idle") {
                            setUrlTestState("idle");
                            setUrlTestResult(null);
                          }
                        }}
                        placeholder="https://exemple.com/products.xml"
                      />
                      <button
                        type="button"
                        onClick={handleTestUrl}
                        disabled={!feed.source_url || urlTestState === "testing"}
                        style={{
                          ...styles.btn, ...styles.btnGhost,
                          opacity: !feed.source_url || urlTestState === "testing" ? 0.5 : 1,
                          cursor: !feed.source_url || urlTestState === "testing" ? "not-allowed" : "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {urlTestState === "testing" ? <RefreshCw size={14} /> : <Play size={14} />}
                        {urlTestState === "testing" ? "Test en cours…" : "Tester la connexion"}
                      </button>
                    </div>
                  </FormField>

                  {/* Résultat du test */}
                  {urlTestState === "success" && urlTestResult && (
                    <div style={{
                      marginTop: 10, padding: "10px 12px", borderRadius: 10,
                      background: COLORS.green50, border: "1px solid rgba(27,94,32,.20)",
                      fontSize: 12.5, color: COLORS.ink800, display: "flex", alignItems: "flex-start", gap: 8,
                    }}>
                      <Check size={14} color={COLORS.green800} style={{ marginTop: 2 }} />
                      <div>
                        <strong>Connexion OK</strong> · Format <strong>{urlTestResult.format?.toUpperCase()}</strong> détecté
                        · <strong>{fmtInt(urlTestResult.totalRows)}</strong> items trouvés
                        · Plateforme : <strong>{urlTestResult.platform}</strong>
                      </div>
                    </div>
                  )}
                  {urlTestState === "error" && urlTestResult && (
                    <div style={{
                      marginTop: 10, padding: "10px 12px", borderRadius: 10,
                      background: "#FEF2F2", border: "1px solid #FECACA",
                      fontSize: 12.5, color: "#B91C1C", display: "flex", alignItems: "flex-start", gap: 8,
                    }}>
                      <AlertCircle size={14} style={{ marginTop: 2 }} />
                      <div><strong>Erreur :</strong> {urlTestResult.error}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div>
              {/* Mode URL distante : la preview a déjà été chargée en step 0,
                  on affiche juste un récap (pas de drop zone). */}
              {feed.source_type === "remote_url" && importedRows.length > 0 && (
                <div style={{
                  background: COLORS.green50, border: "1px solid rgba(27,94,32,.18)",
                  borderRadius: 12, padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Check size={16} color={COLORS.green800} />
                    <strong style={{ fontSize: 13, color: COLORS.ink900 }}>Aperçu du flux récupéré</strong>
                  </div>
                  <div style={{ fontSize: 12.5, color: COLORS.ink700, lineHeight: 1.6 }}>
                    <div><strong>URL :</strong> <span style={{ wordBreak: "break-all" }}>{feed.source_url}</span></div>
                    <div>
                      <strong>Format :</strong> {urlTestResult?.format?.toUpperCase() || detectedPlatform}
                      {" · "}
                      <strong>Plateforme :</strong> {detectedPlatform}
                    </div>
                    <div><strong>Items chargés (preview) :</strong> {fmtInt(importedRows.length)} / {fmtInt(urlTestResult?.totalRows || importedRows.length)}</div>
                    <div><strong>Colonnes ({importedColumns.length}) :</strong> {importedColumns.slice(0, 12).join(", ")}{importedColumns.length > 12 ? "…" : ""}</div>
                  </div>
                  <p style={{ fontSize: 11.5, color: COLORS.ink500, marginTop: 10, marginBottom: 0 }}>
                    La synchronisation complète (toutes les lignes) sera lancée à la dernière étape.
                  </p>
                </div>
              )}

              {/* Mode CSV manuel : drop zone classique */}
              {feed.source_type !== "remote_url" && (importedRows.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDropFile}
                  style={{
                    border: `2px dashed ${COLORS.ink200}`,
                    borderRadius: 14, padding: "44px 24px",
                    textAlign: "center", cursor: "pointer",
                    background: COLORS.ink50, transition: "all .2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.green800; e.currentTarget.style.background = COLORS.green50; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.ink200; e.currentTarget.style.background = COLORS.ink50; }}
                >
                  <input
                    ref={fileInputRef} type="file" accept=".csv,.xlsx" hidden
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                  <Upload size={32} color={COLORS.ink400} style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink900, marginBottom: 4 }}>
                    {parsing ? "Parsing en cours…" : "Glissez votre fichier CSV ici"}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.ink500 }}>
                    ou cliquez pour sélectionner · accepte .csv (.xlsx aussi parsé en CSV)
                  </div>
                  {parseError && (
                    <div style={{
                      marginTop: 12, padding: "8px 10px", fontSize: 12,
                      background: "#FEF2F2", border: "1px solid #FECACA",
                      color: "#B91C1C", borderRadius: 8, display: "inline-flex", gap: 6, alignItems: "center",
                    }}>
                      <AlertCircle size={13} /> {parseError}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{
                    background: COLORS.green50, border: "1px solid rgba(27,94,32,.18)",
                    borderRadius: 12, padding: "14px 16px", marginBottom: 16,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <Check size={16} color={COLORS.green800} />
                      <strong style={{ fontSize: 13, color: COLORS.ink900 }}>Fichier importé avec succès</strong>
                    </div>
                    <div style={{ fontSize: 12.5, color: COLORS.ink700, lineHeight: 1.6 }}>
                      <div><strong>Fichier :</strong> {importedFilename} · {fmtInt(importedRows.length)} lignes</div>
                      <div>
                        <strong>Source détectée :</strong>{" "}
                        {detectedPlatform === "prestashop"  ? "PrestaShop"
                         : detectedPlatform === "shopify"     ? "Shopify"
                         : detectedPlatform === "woocommerce" ? "WooCommerce"
                         : "Format custom"}
                      </div>
                      <div><strong>Colonnes ({importedColumns.length}) :</strong> {importedColumns.slice(0, 12).join(", ")}{importedColumns.length > 12 ? "…" : ""}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setImportedRows([]); setImportedColumns([]); setImportedFilename(""); setDetectedPlatform(null); }}
                    style={{ ...styles.btn, ...styles.btnGhost, height: 32, padding: "0 12px", fontSize: 12 }}
                  >
                    <RefreshCw size={12} /> Re-uploader un autre fichier
                  </button>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{
                background: "#FEF9E7", border: "1px solid rgba(197,160,40,.25)",
                borderRadius: 10, padding: "10px 14px", marginBottom: 14,
                fontSize: 12, color: "#8B6914", lineHeight: 1.5,
              }}>
                <strong>Pré-mapping {detectedPlatform || "automatique"} appliqué.</strong> Vérifiez et ajustez si nécessaire.
                {" "}Les champs marqués <span style={{ color: COLORS.danger, fontWeight: 700 }}>*</span> sont obligatoires.
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: "35%" }}>Champ SwingMarket</th>
                    <th style={styles.th}>Colonne CSV</th>
                  </tr>
                </thead>
                <tbody>
                  {SWING_FIELDS.map((f) => (
                    <tr key={f.key} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 600, color: COLORS.ink900, fontSize: 13 }}>
                          {f.label}
                          {f.required && <span style={{ color: COLORS.danger, marginLeft: 3 }}>*</span>}
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.ink500, marginTop: 2 }}>{f.hint}</div>
                      </td>
                      <td style={styles.td}>
                        <select
                          value={feedMapping[f.key] || ""}
                          onChange={(e) => setFeedMapping({ ...feedMapping, [f.key]: e.target.value })}
                          style={{ ...modalInputStyle, fontSize: 12.5 }}
                        >
                          <option value="">— Non mappé —</option>
                          {importedColumns.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Aperçu 3 lignes */}
              {importedRows.length > 0 && feedMapping.title && feedMapping.price && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.ink600, marginBottom: 8, letterSpacing: ".06em", textTransform: "uppercase" }}>
                    Aperçu (3 premières lignes)
                  </div>
                  <div style={{ background: COLORS.ink50, border: `1px solid ${COLORS.ink150}`, borderRadius: 10, padding: 12 }}>
                    {importedRows.slice(0, 3).map((row, i) => {
                      const title = row[feedMapping.title] || "—";
                      const price = parseFloat(row[feedMapping.price]) || 0;
                      const cat = row[feedMapping.category] || "—";
                      return (
                        <div key={i} style={{ fontSize: 12.5, color: COLORS.ink700, padding: "4px 0", borderBottom: i < 2 ? `1px dashed ${COLORS.ink200}` : "none" }}>
                          <strong style={{ color: COLORS.ink900 }}>{title}</strong> — {price.toFixed(2)} € — <span style={{ color: COLORS.green800 }}>{cat}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              {/* Fréquence de synchronisation — uniquement pour les flux URL distantes */}
              {feed.source_type === "remote_url" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.ink600 }}>Fréquence de synchronisation automatique</label>
                  {[
                    { value: "manual",   label: "Manuelle",          desc: "Sync uniquement à la demande (bouton Sync)" },
                    { value: "daily",    label: "Quotidienne",       desc: "Recommandé · une sync par jour" },
                    { value: "every_6h", label: "Toutes les 6 h",    desc: "Pour les catalogues qui bougent souvent" },
                    { value: "hourly",   label: "Toutes les heures", desc: "À utiliser avec parcimonie · charge serveur élevée" },
                  ].map((opt) => (
                    <label key={opt.value} style={radioOptionStyle((feed.sync_frequency || "daily") === opt.value)}>
                      <input
                        type="radio"
                        checked={(feed.sync_frequency || "daily") === opt.value}
                        onChange={() => setFeed({ ...feed, sync_frequency: opt.value })}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.ink900 }}>{opt.label}</div>
                        <div style={{ fontSize: 11.5, color: COLORS.ink500 }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.ink600 }}>Que faire pour les produits manquants à la prochaine sync ?</label>
                {[
                  { value: "deactivate", label: "Désactiver", desc: "Recommandé · les produits absents passent en archived" },
                  { value: "delete",     label: "Supprimer", desc: "Suppression définitive en base" },
                  { value: "ignore",     label: "Ne rien faire", desc: "Les produits manquants restent en l'état" },
                ].map((opt) => (
                  <label key={opt.value} style={radioOptionStyle(feed.on_missing_action === opt.value)}>
                    <input
                      type="radio"
                      checked={feed.on_missing_action === opt.value}
                      onChange={() => setFeed({ ...feed, on_missing_action: opt.value })}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.ink900 }}>{opt.label}</div>
                      <div style={{ fontSize: 11.5, color: COLORS.ink500 }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <FormField label="Email de notification (optionnel)">
                <input
                  type="email"
                  style={modalInputStyle}
                  value={feed.notification_email || ""}
                  onChange={(e) => setFeed({ ...feed, notification_email: e.target.value })}
                  placeholder="vendeur@exemple.com"
                />
              </FormField>

              {/* Récap final */}
              <div style={{
                marginTop: 22, padding: 18,
                background: COLORS.green50, border: "1px solid rgba(27,94,32,.18)",
                borderRadius: 12,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.green800, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10 }}>
                  Récap final
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {(() => {
                    const lines = [
                      `Flux : ${feed.name}`,
                      `Vendeur : ${sellerLabel || "—"}`,
                    ];
                    if (feed.source_type === "remote_url") {
                      lines.push(`Source : URL distante · ${feed.source_url}`);
                      const freqLabel = {
                        manual: "Manuelle (à la demande)",
                        daily: "Quotidienne",
                        every_6h: "Toutes les 6 h",
                        hourly: "Toutes les heures",
                      }[feed.sync_frequency || "daily"];
                      lines.push(`Fréquence : ${freqLabel}`);
                    } else {
                      lines.push(`${fmtInt(importedRows.length)} produits prêts à être importés`);
                    }
                    lines.push(`Plateforme détectée : ${detectedPlatform || "custom"}`);
                    lines.push(`Mapping configuré : ${Object.values(feedMapping).filter(Boolean).length} champs`);
                    return lines.map((line, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.ink800 }}>
                        <Check size={14} color={COLORS.green800} /> {line}
                      </li>
                    ));
                  })()}
                </ul>
              </div>

              {/* Barre de progression à l'import */}
              {importing && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: COLORS.ink600, marginBottom: 6 }}>
                    Import en cours · <strong style={{ color: COLORS.ink900 }}>{progress.done}</strong> / {progress.total} produits
                  </div>
                  <div style={{ height: 6, background: COLORS.ink100, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: progress.total > 0 ? `${(progress.done / progress.total) * 100}%` : "0%",
                      background: `linear-gradient(90deg, ${COLORS.green800}, ${COLORS.gold600})`,
                      transition: "width .3s",
                    }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — boutons navigation */}
        <div style={modalFootStyle}>
          {step > 0 && !importing && (
            <button onClick={() => setStep(step - 1)} style={{ ...styles.btn, ...styles.btnGhost }}>
              <ArrowLeft size={14} /> Retour
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext}
              style={{
                ...styles.btn, ...styles.btnPrimary,
                opacity: canGoNext ? 1 : 0.4,
                cursor: canGoNext ? "pointer" : "not-allowed",
              }}
            >
              Suivant <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={importing}
              style={{
                ...styles.btn, ...styles.btnPrimary,
                background: `linear-gradient(135deg, ${COLORS.green800}, ${COLORS.green700})`,
                opacity: importing ? 0.5 : 1,
              }}
            >
              {importing ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              {importing
                ? "Import en cours…"
                : (feed.source_type === "remote_url" ? "Activer le flux" : "Lancer l'import")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const radioOptionStyle = (active) => ({
  display: "flex", gap: 10, alignItems: "flex-start",
  padding: "10px 12px", border: `1px solid ${active ? COLORS.green800 : COLORS.ink200}`,
  background: active ? COLORS.green50 : COLORS.paper,
  borderRadius: 10, cursor: "pointer", transition: "all .15s",
});

// ═════════════════════════════════════════════════════════
// FLUX D'IMPORT — Historique des syncs (FeedHistoryModal)
// ═════════════════════════════════════════════════════════
function FeedHistoryModal({ feed, runs, loading, onClose }) {
  const [expandedRun, setExpandedRun] = useState(null);

  const STATUS_COLORS = {
    success: { bg: "#ECFDF5", fg: "#047857", label: "Succès" },
    partial: { bg: "#FFFBEB", fg: "#92400E", label: "Partiel" },
    error:   { bg: "#FEF2F2", fg: "#B91C1C", label: "Erreur" },
    running: { bg: "#EFF6FF", fg: "#1D4ED8", label: "En cours" },
  };

  const formatDuration = (run) => {
    if (!run.started_at || !run.ended_at) return "—";
    const ms = new Date(run.ended_at) - new Date(run.started_at);
    if (ms < 1000) return `${ms} ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
    return `${(ms / 60000).toFixed(1)} min`;
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={{ ...modalBoxStyle, maxWidth: 880 }} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeadStyle}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Historique des synchronisations</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.ink500 }}>{feed.name}</p>
          </div>
          <button onClick={onClose} style={styles.rowAction}><X size={16} /></button>
        </div>

        <div style={{ padding: "16px 24px", maxHeight: "65vh", overflowY: "auto" }}>
          {loading && <div style={{ padding: 30, textAlign: "center", color: COLORS.ink500, fontSize: 13 }}>Chargement…</div>}
          {!loading && runs.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: COLORS.ink500, fontSize: 13 }}>
              Aucune synchronisation enregistrée pour ce flux.
            </div>
          )}
          {!loading && runs.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Statut</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Ajoutés</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>MAJ</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Retirés</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Échoués</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Durée</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => {
                  const stat = STATUS_COLORS[r.status] || { bg: COLORS.ink100, fg: COLORS.ink600, label: r.status };
                  const isExpanded = expandedRun === r.id;
                  const hasErrors = !!(r.errors_log && Array.isArray(r.errors_log) && r.errors_log.length > 0);
                  return (
                    <Fragment key={r.id}>
                      <tr
                        style={{ ...styles.tr, cursor: hasErrors ? "pointer" : "default" }}
                        onClick={() => hasErrors && setExpandedRun(isExpanded ? null : r.id)}
                      >
                        <td style={{ ...styles.td, color: COLORS.ink700 }}>
                          {new Date(r.started_at).toLocaleString("fr-FR", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            display: "inline-block", padding: "2px 8px", borderRadius: 999,
                            background: stat.bg, color: stat.fg, fontSize: 11, fontWeight: 600,
                          }}>{stat.label}</span>
                          {hasErrors && (
                            <span style={{ marginLeft: 6, fontSize: 11, color: COLORS.ink500 }}>
                              ({r.errors_log.length} {isExpanded ? "▴" : "▾"})
                            </span>
                          )}
                        </td>
                        <td style={{ ...styles.td, textAlign: "right", color: COLORS.green800, fontWeight: 600 }}>{fmtInt(r.products_added || 0)}</td>
                        <td style={{ ...styles.td, textAlign: "right", color: COLORS.info, fontWeight: 600 }}>{fmtInt(r.products_updated || 0)}</td>
                        <td style={{ ...styles.td, textAlign: "right", color: COLORS.ink600 }}>{fmtInt(r.products_removed || 0)}</td>
                        <td style={{ ...styles.td, textAlign: "right", color: r.products_failed > 0 ? COLORS.danger : COLORS.ink500, fontWeight: r.products_failed > 0 ? 600 : 400 }}>{fmtInt(r.products_failed || 0)}</td>
                        <td style={{ ...styles.td, textAlign: "right", color: COLORS.ink600, fontFamily: "'JetBrains Mono', monospace" }}>{formatDuration(r)}</td>
                      </tr>
                      {isExpanded && hasErrors && (
                        <tr>
                          <td colSpan={7} style={{ background: "#FEF2F2", padding: 14, borderBottom: `1px solid ${COLORS.ink150}` }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#B91C1C", marginBottom: 6, letterSpacing: ".06em", textTransform: "uppercase" }}>
                              Erreurs détaillées ({r.errors_log.length})
                            </div>
                            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4, maxHeight: 200, overflowY: "auto" }}>
                              {r.errors_log.map((e, i) => (
                                <li key={i} style={{ fontSize: 11.5, color: COLORS.ink800, fontFamily: "'JetBrains Mono', monospace" }}>
                                  <strong>{e.title || e.global || "—"} :</strong> {e.error || ""}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div style={modalFootStyle}>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ ...styles.btn, ...styles.btnGhost }}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// VUE OVERVIEW
// ═════════════════════════════════════════════════════════
function Overview({
  loading, period, setPeriod, kpis, series, categoriesAgg,
  orders, orderTab, setOrderTab, counters, activity, topSellers, profilesById,
}) {
  return (
    <>
      <div style={styles.pageHead}>
        <div>
          <h1 style={styles.pageTitle}>Bonjour, voici l'activité du jour ⛳</h1>
          <p style={styles.pageSub}>
            Vue consolidée de la marketplace · Données live Supabase
            {loading ? " · synchronisation…" : ""}
          </p>
        </div>
        <div style={styles.pageActions}>
          <PeriodPicker period={period} setPeriod={setPeriod} />
        </div>
      </div>

      <section style={styles.kpis}>
        <KpiCard label="Chiffre d'affaires" value={fmtEUR(kpis.revenue)} unit="€"
          delta={kpis.revenueDelta} subtext="vs. période précédente" color="green" />
        <KpiCard label="Commissions" value={fmtEUR2(kpis.commissions)} unit="€"
          delta={kpis.commissionsDelta} subtext={`Take rate · ${kpis.takeRate.toFixed(1)} %`} color="gold" />
        <KpiCard label="Commandes" value={fmtInt(kpis.count)} delta={kpis.countDelta}
          subtext={`Panier moyen · ${fmtEUR2(kpis.avgCart)} €`} color="blue" />
        <KpiCard label="Utilisateurs actifs" value={fmtInt(kpis.activeUsers)}
          subtext={`${fmtInt(kpis.activeProducts)} annonces actives`} color="violet" hideDelta />
      </section>

      <section style={styles.row}>
        <article style={styles.card}>
          <div style={styles.cardHead}>
            <div>
              <h3 style={styles.cardTitle}>Volume & commissions</h3>
              <p style={styles.cardSub}>Activité sur la période sélectionnée</p>
            </div>
            <div style={styles.legend}>
              <span><i style={{ ...styles.legendSw, background: COLORS.green800 }} /> Ventes</span>
              <span><i style={{ ...styles.legendSw, background: COLORS.gold600 }} /> Commissions</span>
            </div>
          </div>
          <div style={{ ...styles.cardBody, paddingTop: 8 }}>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.green800} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={COLORS.green800} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={COLORS.ink150} vertical={false} />
                  <XAxis dataKey="label" stroke={COLORS.ink400} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={COLORS.ink400} fontSize={11} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(v >= 1000 ? 0 : 1)}k€`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="sales" stroke={COLORS.green800} strokeWidth={2.4}
                    fill="url(#salesGrad)" />
                  <Line type="monotone" dataKey="commissions" stroke={COLORS.gold600} strokeWidth={2.2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </article>

        <article style={styles.card}>
          <div style={styles.cardHead}>
            <div>
              <h3 style={styles.cardTitle}>Catégories</h3>
              <p style={styles.cardSub}>Répartition des ventes</p>
            </div>
          </div>
          <div style={styles.cardBody}>
            <CategoriesDonut data={categoriesAgg} />
          </div>
        </article>
      </section>

      {/* TABLE COMMANDES (overview) */}
      <section style={{ ...styles.card, marginBottom: 24 }}>
        <div style={styles.tableHead}>
          <div>
            <h3 style={styles.cardTitle}>Dernières commandes</h3>
            <p style={styles.cardSub}>
              {fmtInt(orders.length)} commandes · {fmtInt(counters.pendingOrders)} nécessitent une action
            </p>
          </div>
          <div style={styles.toolbar}>
            <div style={styles.tabs}>
              {[
                { id: "all", label: "Toutes" },
                { id: "todo", label: "À traiter", count: counters.pendingOrders },
                { id: "shipped", label: "Expédiées" },
                { id: "disputes", label: "Litiges", count: counters.disputes },
              ].map(t => (
                <button key={t.id} onClick={() => setOrderTab(t.id)}
                  style={{ ...styles.tabBtn, ...(orderTab === t.id ? styles.tabBtnActive : null) }}>
                  {t.label}
                  {t.count != null && <span style={styles.tabCount}>{fmtInt(t.count)}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        <OrdersTable orders={orders.slice(0, 8)} profilesById={profilesById} compact />
      </section>

      <section style={{ ...styles.row, gridTemplateColumns: "1fr 1fr" }}>
        <article style={styles.card}>
          <div style={{ ...styles.cardHead, paddingBottom: 12 }}>
            <div>
              <h3 style={styles.cardTitle}>Activité en direct</h3>
              <p style={styles.cardSub}>Événements récents de la marketplace</p>
            </div>
          </div>
          <div style={{ ...styles.cardBody, paddingTop: 0 }}>
            <div style={styles.activity}>
              {activity.length === 0 && (
                <div style={{ padding: 16, fontSize: 13, color: COLORS.ink500 }}>Aucun événement récent.</div>
              )}
              {activity.map((ev, i) => {
                const [c1, c2] = colorPairFromString(ev.seed);
                const dotColor = ev.kind === "sale" ? COLORS.success : ev.kind === "list" ? COLORS.info : COLORS.gold600;
                return (
                  <div key={i} style={styles.act}>
                    <div style={{ ...styles.actAvatar, background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                      {initialsOf(ev.seed)}
                      <span style={{ ...styles.actAvatarDot, background: dotColor }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.actText}>{ev.text}</div>
                      <div style={styles.actTime}>{relativeTime(ev.when)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </article>

        <article style={styles.card}>
          <div style={{ ...styles.cardHead, paddingBottom: 12 }}>
            <div>
              <h3 style={styles.cardTitle}>Top vendeurs</h3>
              <p style={styles.cardSub}>Période sélectionnée — par chiffre d'affaires</p>
            </div>
          </div>
          <div style={{ ...styles.cardBody, paddingTop: 8 }}>
            {topSellers.length === 0 && (
              <div style={{ padding: 16, fontSize: 13, color: COLORS.ink500 }}>
                Pas encore de vendeur classé.
              </div>
            )}
            {topSellers.map((s, i) => {
              const [c1, c2] = colorPairFromString(s.name);
              const isPro = s.profile?.role === "pro" || s.profile?.shop_name;
              return (
                <div key={s.id}>
                  <div style={styles.sellerRow}>
                    <div style={styles.sellerRank}>{String(i + 1).padStart(2, "0")}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                      <div style={{
                        ...styles.buyerAvatar, width: 34, height: 34, fontSize: 12,
                        background: `linear-gradient(135deg, ${c1}, ${c2})`,
                      }}>{initialsOf(s.name)}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: COLORS.ink900, fontSize: 13.5 }}>
                          {s.profile?.shop_name || s.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: COLORS.ink500, display: "flex", gap: 6, alignItems: "center" }}>
                          {isPro && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: COLORS.gold600, fontWeight: 600 }}>
                              <Star size={10} fill={COLORS.gold600} stroke="none" /> Pro
                            </span>
                          )}
                          <span>{isPro && "· "}{s.count} vente{s.count > 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontWeight: 700, color: COLORS.ink900, fontSize: 14 }}>
                      {fmtEUR2(s.revenue)} €
                    </div>
                  </div>
                  {i < topSellers.length - 1 && <div style={{ height: 1, background: COLORS.ink150, margin: "0 4px" }} />}
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </>
  );
}

// ═════════════════════════════════════════════════════════
// SECTIONS — CRUD
// ═════════════════════════════════════════════════════════
function PageHeader({ title, sub, right }) {
  return (
    <div style={styles.pageHead}>
      <div>
        <h1 style={styles.pageTitle}>{title}</h1>
        {sub && <p style={styles.pageSub}>{sub}</p>}
      </div>
      {right && <div style={styles.pageActions}>{right}</div>}
    </div>
  );
}

function OrdersSection({ orders, profilesById, onEdit, orderTab, setOrderTab, counters }) {
  return (
    <>
      <PageHeader title="Commandes" sub={`${fmtInt(orders.length)} commandes · gestion complète des statuts et numéros de suivi`} />
      <section style={styles.card}>
        <div style={styles.tableHead}>
          <div style={styles.tabs}>
            {[
              { id: "all",      label: "Toutes" },
              { id: "todo",     label: "À traiter",  count: counters.pendingOrders },
              { id: "shipped",  label: "Expédiées" },
              { id: "disputes", label: "Litiges",    count: counters.disputes },
            ].map(t => (
              <button key={t.id} onClick={() => setOrderTab(t.id)}
                style={{ ...styles.tabBtn, ...(orderTab === t.id ? styles.tabBtnActive : null) }}>
                {t.label}
                {t.count != null && <span style={styles.tabCount}>{fmtInt(t.count)}</span>}
              </button>
            ))}
          </div>
        </div>
        <OrdersTable orders={orders} profilesById={profilesById} onEdit={onEdit} />
      </section>
    </>
  );
}

function OrdersTable({ orders, profilesById, onEdit, compact }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Commande</th>
            <th style={styles.th}>Acheteur</th>
            <th style={styles.th}>Produit</th>
            <th style={{ ...styles.th, textAlign: "right" }}>Montant</th>
            {!compact && <th style={{ ...styles.th, textAlign: "right" }}>Commission</th>}
            <th style={styles.th}>Statut</th>
            <th style={styles.th}>Date</th>
            {onEdit && <th style={styles.th}></th>}
          </tr>
        </thead>
        <tbody>
          {orders.map(o => {
            const buyer = profilesById[o.buyer_id];
            const buyerName = buyer?.full_name || buyer?.shop_name || buyer?.email || "Acheteur";
            const stat = ORDER_STATUS[o.status] || { label: o.status || "—", cls: "prep" };
            const [c1, c2] = colorPairFromString(buyerName);
            return (
              <tr key={o.id} style={styles.tr}>
                <td style={styles.td}><span style={styles.idCell}>#{(o.id || "").slice(0, 8).toUpperCase()}</span></td>
                <td style={styles.td}>
                  <div style={styles.buyer}>
                    <div style={{ ...styles.buyerAvatar, background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                      {initialsOf(buyerName)}
                    </div>
                    <div>
                      <div style={styles.buyerName}>{buyerName}</div>
                      <div style={styles.buyerMail}>{buyer?.email || "—"}</div>
                    </div>
                  </div>
                </td>
                <td style={{ ...styles.td, color: COLORS.ink700 }}>{o.product_title || "—"}</td>
                <td style={{ ...styles.td, textAlign: "right", ...styles.amount }}>{fmtEUR2(o.total_paid || o.price)} €</td>
                {!compact && <td style={{ ...styles.td, textAlign: "right", color: COLORS.green800, fontWeight: 600 }}>
                  {fmtEUR2(o.commission_amount || 0)} €
                </td>}
                <td style={styles.td}><StatusBadge variant={stat.cls} label={stat.label} /></td>
                <td style={{ ...styles.td, color: COLORS.ink600 }}>{fmtDate(o.created_at)}</td>
                {onEdit && <td style={styles.td}>
                  <button onClick={() => onEdit(o)} style={styles.rowAction}><Pencil size={14} /></button>
                </td>}
              </tr>
            );
          })}
          {orders.length === 0 && (
            <tr><td colSpan={onEdit ? 8 : 6} style={{ ...styles.td, textAlign: "center", color: COLORS.ink500, padding: 32 }}>
              Aucune commande.
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ProductsSection({ products, onEdit, onDelete }) {
  return (
    <>
      <PageHeader title="Annonces" sub={`${fmtInt(products.length)} annonces dans la marketplace`} />
      <section style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Titre</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Prix</th>
                <th style={styles.th}>Catégorie</th>
                <th style={styles.th}>Marque</th>
                <th style={styles.th}>État</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const stat = ORDER_STATUS[p.status] || { label: p.status || "—", cls: "prep" };
                return (
                  <tr key={p.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: 600, maxWidth: 280 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover", border: `1px solid ${COLORS.ink150}` }} />
                        )}
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right", ...styles.amount }}>{fmtEUR2(p.price)} €</td>
                    <td style={{ ...styles.td, color: COLORS.ink700 }}>{p.category || "—"}</td>
                    <td style={{ ...styles.td, color: COLORS.ink700 }}>{p.brand || "—"}</td>
                    <td style={{ ...styles.td, color: COLORS.ink700 }}>{p.condition || "—"}</td>
                    <td style={styles.td}><StatusBadge variant={stat.cls} label={stat.label} /></td>
                    <td style={{ ...styles.td, color: COLORS.ink600 }}>{fmtDate(p.created_at)}</td>
                    <td style={styles.td}>
                      <button onClick={() => onEdit(p)} style={styles.rowAction}><Pencil size={14} /></button>
                      <button onClick={() => onDelete(p.id)} style={{ ...styles.rowAction, color: COLORS.danger }}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr><td colSpan={8} style={{ ...styles.td, textAlign: "center", color: COLORS.ink500, padding: 32 }}>
                  Aucune annonce.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function UsersSection({ profiles, onEdit, onHistory }) {
  return (
    <>
      <PageHeader title="Utilisateurs" sub={`${fmtInt(profiles.length)} comptes dans la base`} />
      <section style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Téléphone</th>
                <th style={styles.th}>Ville</th>
                <th style={styles.th}>Plan</th>
                <th style={styles.th}>Onboarding</th>
                <th style={styles.th}>Inscrit le</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {profiles.map(u => {
                const [c1, c2] = colorPairFromString(u.full_name || u.email || u.id);
                return (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.buyer}>
                        <div style={{ ...styles.buyerAvatar, background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                          {initialsOf(u.full_name || u.email || "?")}
                        </div>
                        <div style={styles.buyerName}>{u.full_name || u.shop_name || "—"}</div>
                      </div>
                    </td>
                    <td style={{ ...styles.td, color: COLORS.ink700 }}>{u.email}</td>
                    <td style={{ ...styles.td, color: COLORS.ink700 }}>{u.phone || "—"}</td>
                    <td style={{ ...styles.td, color: COLORS.ink700 }}>{u.city || "—"}</td>
                    <td style={styles.td}><PlanBadge plan={u.plan} /></td>
                    <td style={styles.td}>
                      <StatusBadge variant={u.seller_onboarding_completed ? "deliv" : "pay"}
                        label={u.seller_onboarding_completed ? "Complété" : "En attente"} />
                    </td>
                    <td style={{ ...styles.td, color: COLORS.ink600 }}>{fmtDate(u.created_at)}</td>
                    <td style={styles.td}>
                      <button onClick={() => onEdit(u)} style={styles.rowAction}><Pencil size={14} /></button>
                      <button onClick={() => onHistory(u)} style={styles.rowAction}><Eye size={14} /></button>
                    </td>
                  </tr>
                );
              })}
              {profiles.length === 0 && (
                <tr><td colSpan={8} style={{ ...styles.td, textAlign: "center", color: COLORS.ink500, padding: 32 }}>
                  Aucun utilisateur.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function PaymentsSection({ orders, profilesById, kpis }) {
  const succeeded = orders.filter(o => o.payment_status === "succeeded");
  const pending = orders.filter(o => o.payment_status === "pending" || o.payment_status === "pending_payment");
  return (
    <>
      <PageHeader title="Paiements" sub="Vue financière des transactions Stripe" />
      <section style={styles.kpis}>
        <KpiCard label="CA encaissé" value={fmtEUR(kpis.revenue)} unit="€" subtext={`${fmtInt(succeeded.length)} paiements réussis`} color="green" hideDelta />
        <KpiCard label="Commissions" value={fmtEUR2(kpis.commissions)} unit="€" subtext={`Take rate ${kpis.takeRate.toFixed(1)} %`} color="gold" hideDelta />
        <KpiCard label="En attente" value={fmtInt(pending.length)} subtext="Paiements en cours" color="blue" hideDelta />
        <KpiCard label="Panier moyen" value={fmtEUR2(kpis.avgCart)} unit="€" subtext="Sur la période" color="violet" hideDelta />
      </section>
      <section style={styles.card}>
        <div style={styles.tableHead}>
          <div>
            <h3 style={styles.cardTitle}>Toutes les transactions</h3>
            <p style={styles.cardSub}>{fmtInt(orders.length)} mouvements (toutes périodes)</p>
          </div>
        </div>
        <OrdersTable orders={orders.slice(0, 100)} profilesById={profilesById} />
      </section>
    </>
  );
}

function CommissionsSection({ commissions, setCommissions, onSave }) {
  return (
    <>
      <PageHeader title="Commissions" sub="Grille de tarification appliquée aux ventes (paliers de prix)" />
      <section style={{ ...styles.card, padding: 24 }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tranche de prix</th>
              <th style={styles.th}>Taux (%)</th>
              <th style={styles.th}>Frais fixe (€)</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c, i) => (
              <tr key={i} style={styles.tr}>
                <td style={{ ...styles.td, fontWeight: 600 }}>{c.label}</td>
                <td style={styles.td}>
                  <input type="number" value={c.rate}
                    onChange={e => { const n = [...commissions]; n[i].rate = +e.target.value; setCommissions(n); }}
                    style={inlineInputStyle} />
                </td>
                <td style={styles.td}>
                  <input type="number" step="0.01" value={c.fixed}
                    onChange={e => { const n = [...commissions]; n[i].fixed = +e.target.value; setCommissions(n); }}
                    style={inlineInputStyle} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={onSave} style={{ ...styles.btn, ...styles.btnPrimary, marginTop: 16 }}>
          Sauvegarder
        </button>
      </section>
    </>
  );
}

function DisputesSection({ orders, profilesById, onEdit }) {
  return (
    <>
      <PageHeader title="Litiges" sub={`${fmtInt(orders.length)} commande(s) en litige`} />
      <section style={styles.card}>
        <OrdersTable orders={orders} profilesById={profilesById} onEdit={onEdit} />
      </section>
    </>
  );
}

function ReportsSection({ kpis, period }) {
  const periodLabel = PERIODS.find(p => p.id === period)?.label || period;
  return (
    <>
      <PageHeader title="Rapports" sub="Synthèse exportable des indicateurs clés" />
      <section style={styles.kpis}>
        <KpiCard label="CA" value={fmtEUR(kpis.revenue)} unit="€" subtext={`Période ${periodLabel}`} color="green" hideDelta />
        <KpiCard label="Commissions" value={fmtEUR2(kpis.commissions)} unit="€" subtext={`Take rate ${kpis.takeRate.toFixed(1)} %`} color="gold" hideDelta />
        <KpiCard label="Commandes" value={fmtInt(kpis.count)} subtext="Commandes payées" color="blue" hideDelta />
        <KpiCard label="Annonces" value={fmtInt(kpis.activeProducts)} subtext="Annonces actives" color="violet" hideDelta />
      </section>
      <section style={{ ...styles.card, padding: 24, textAlign: "center" }}>
        <FileText size={36} color={COLORS.ink400} style={{ marginBottom: 8 }} />
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "8px 0 6px" }}>Export PDF / CSV</h3>
        <p style={{ fontSize: 13, color: COLORS.ink500, margin: "0 0 16px" }}>
          La génération des rapports investisseurs sera ajoutée dans une itération ultérieure.
        </p>
        <button style={{ ...styles.btn, ...styles.btnGhost, margin: "0 auto" }}>
          <Download size={14} /> Télécharger un export brut (CSV)
        </button>
      </section>
    </>
  );
}

function CarriersSection({ carriers, setCarriers, newCarrier, setNewCarrier, onSave, onAdd }) {
  return (
    <>
      <PageHeader title="Transporteurs" sub="Liste des transporteurs proposés au checkout (paramètres locaux pour le moment)" />
      <section style={{ ...styles.card, padding: 24 }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Transporteur</th>
              <th style={styles.th}>Prix (€)</th>
              <th style={styles.th}>Délai</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {carriers.map((c, i) => (
              <tr key={i} style={styles.tr}>
                <td style={{ ...styles.td, fontWeight: 600 }}>{c.name}</td>
                <td style={styles.td}>
                  <input type="number" step="0.01" value={c.price}
                    onChange={e => { const n = [...carriers]; n[i].price = +e.target.value; setCarriers(n); }}
                    style={inlineInputStyle} />
                </td>
                <td style={styles.td}>
                  <input type="text" value={c.delay}
                    onChange={e => { const n = [...carriers]; n[i].delay = e.target.value; setCarriers(n); }}
                    style={{ ...inlineInputStyle, width: 140 }} />
                </td>
                <td style={styles.td}>
                  <button onClick={() => setCarriers(carriers.filter((_, j) => j !== i))}
                    style={{ ...styles.rowAction, color: COLORS.danger }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={onSave} style={{ ...styles.btn, ...styles.btnPrimary, marginTop: 16 }}>
          Sauvegarder
        </button>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${COLORS.ink150}` }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>Ajouter un transporteur</h4>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 8, alignItems: "end" }}>
            <FormField label="Nom">
              <input value={newCarrier.name} onChange={e => setNewCarrier({ ...newCarrier, name: e.target.value })}
                placeholder="Ex: DHL" style={modalInputStyle} />
            </FormField>
            <FormField label="Prix (€)">
              <input type="number" step="0.01" value={newCarrier.price}
                onChange={e => setNewCarrier({ ...newCarrier, price: e.target.value })}
                placeholder="7.90" style={modalInputStyle} />
            </FormField>
            <FormField label="Délai">
              <input value={newCarrier.delay} onChange={e => setNewCarrier({ ...newCarrier, delay: e.target.value })}
                placeholder="2-3 jours" style={modalInputStyle} />
            </FormField>
            <button onClick={onAdd} style={{ ...styles.btn, ...styles.btnPrimary }}>
              <Plus size={14} /> Ajouter
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function CategoriesSection({ categoriesAgg, products }) {
  const productsByCategory = useMemo(() => {
    const m = new Map();
    products.forEach(p => {
      const cat = p.category || "Autres";
      m.set(cat, (m.get(cat) || 0) + 1);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [products]);
  return (
    <>
      <PageHeader title="Catégories" sub="Vue d'ensemble des catégories de la marketplace" />
      <section style={styles.row}>
        <article style={styles.card}>
          <div style={styles.cardHead}>
            <div>
              <h3 style={styles.cardTitle}>Ventes par catégorie</h3>
              <p style={styles.cardSub}>Période sélectionnée</p>
            </div>
          </div>
          <div style={styles.cardBody}>
            <CategoriesDonut data={categoriesAgg} />
          </div>
        </article>
        <article style={styles.card}>
          <div style={styles.cardHead}>
            <div>
              <h3 style={styles.cardTitle}>Annonces par catégorie</h3>
              <p style={styles.cardSub}>Sur l'ensemble des annonces ({fmtInt(products.length)} au total)</p>
            </div>
          </div>
          <div style={styles.cardBody}>
            {productsByCategory.length === 0 && (
              <div style={{ padding: 16, fontSize: 13, color: COLORS.ink500 }}>Aucune annonce.</div>
            )}
            {productsByCategory.map(([name, n], i) => (
              <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 4px", borderBottom: i < productsByCategory.length - 1 ? `1px solid ${COLORS.ink150}` : "none" }}>
                <span style={{ fontSize: 13, color: COLORS.ink700 }}>{name}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink900 }}>{fmtInt(n)} annonce{n > 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function ReviewsSection({ reviews, profilesById, onAdd, onEdit, onDelete }) {
  return (
    <>
      <PageHeader title="Avis" sub={`${fmtInt(reviews.length)} avis publiés sur la plateforme`}
        right={<button onClick={onAdd} style={{ ...styles.btn, ...styles.btnPrimary }}><Plus size={14} /> Nouvel avis</button>} />
      <section style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Vendeur</th>
                <th style={styles.th}>Acheteur</th>
                <th style={styles.th}>Note</th>
                <th style={styles.th}>Commentaire</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => {
                const seller = profilesById[r.seller_id];
                const sellerLabel = seller?.shop_name || seller?.full_name || seller?.email || (r.seller_id || "—").slice(0, 8);
                return (
                  <tr key={r.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{sellerLabel}</td>
                    <td style={{ ...styles.td, color: COLORS.ink700 }}>{r.buyer_name || "—"}</td>
                    <td style={styles.td}>
                      <span style={{ display: "inline-flex", gap: 1, color: COLORS.gold600 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={13} fill={i < (r.rating || 0) ? COLORS.gold600 : "transparent"} stroke={COLORS.gold600} />
                        ))}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: COLORS.ink700, maxWidth: 360 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.comment || "—"}
                      </div>
                    </td>
                    <td style={{ ...styles.td, color: COLORS.ink600 }}>{fmtDate(r.created_at)}</td>
                    <td style={styles.td}>
                      <button onClick={() => onEdit(r)} style={styles.rowAction}><Pencil size={14} /></button>
                      <button onClick={() => onDelete(r.id)} style={{ ...styles.rowAction, color: COLORS.danger }}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                );
              })}
              {reviews.length === 0 && (
                <tr><td colSpan={6} style={{ ...styles.td, textAlign: "center", color: COLORS.ink500, padding: 32 }}>
                  Aucun avis.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function BlogSection({ posts, onAdd, onEdit, onDelete }) {
  return (
    <>
      <PageHeader title="Blog" sub={`${fmtInt(posts.length)} article(s)`}
        right={<button onClick={onAdd} style={{ ...styles.btn, ...styles.btnPrimary }}><Plus size={14} /> Nouvel article</button>} />
      <section style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Titre</th>
                <th style={styles.th}>Slug</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {posts.map(bp => (
                <tr key={bp.id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{bp.title}</td>
                  <td style={{ ...styles.td, color: COLORS.ink600, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{bp.slug}</td>
                  <td style={styles.td}>
                    <StatusBadge variant={bp.published ? "deliv" : "pay"} label={bp.published ? "Publié" : "Brouillon"} />
                  </td>
                  <td style={{ ...styles.td, color: COLORS.ink600 }}>{fmtDate(bp.created_at)}</td>
                  <td style={styles.td}>
                    <button onClick={() => onEdit(bp)} style={styles.rowAction}><Pencil size={14} /></button>
                    <button onClick={() => onDelete(bp.id)} style={{ ...styles.rowAction, color: COLORS.danger }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr><td colSpan={5} style={{ ...styles.td, textAlign: "center", color: COLORS.ink500, padding: 32 }}>
                  Aucun article pour l'instant.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function AdminsSection({ admins, newAdmin, setNewAdmin, onAdd, onEdit, onDelete }) {
  return (
    <>
      <PageHeader title="Administrateurs" sub={`${fmtInt(admins.length)} comptes ayant accès à la console admin`} />
      <section style={{ ...styles.card, marginBottom: 16 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Rôle</th>
                <th style={styles.th}>Créé le</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{a.email}</td>
                  <td style={styles.td}>
                    <StatusBadge variant={a.role === "Super Admin" ? "deliv" : "prep"} label={a.role || "Admin"} />
                  </td>
                  <td style={{ ...styles.td, color: COLORS.ink600 }}>{fmtDate(a.created_at)}</td>
                  <td style={styles.td}>
                    {a.role !== "Super Admin" ? (
                      <>
                        <button onClick={() => onEdit(a)} style={styles.rowAction}><Pencil size={14} /></button>
                        <button onClick={() => onDelete(a.id)} style={{ ...styles.rowAction, color: COLORS.danger }}><Trash2 size={14} /></button>
                      </>
                    ) : <span style={{ color: COLORS.ink400, fontSize: 12 }}>—</span>}
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr><td colSpan={4} style={{ ...styles.td, textAlign: "center", color: COLORS.ink500, padding: 32 }}>
                  Aucun administrateur additionnel.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section style={{ ...styles.card, padding: 24 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>Ajouter un administrateur</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
          <FormField label="Email">
            <input type="email" value={newAdmin.email}
              onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
              placeholder="email@exemple.com" style={modalInputStyle} />
          </FormField>
          <FormField label="Mot de passe">
            <input type="password" value={newAdmin.password}
              onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
              placeholder="••••••••" style={modalInputStyle} />
          </FormField>
          <FormField label="Rôle">
            <select value={newAdmin.role} onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })}
              style={modalInputStyle}>
              <option>Admin</option><option>Modérateur</option><option>Support</option>
            </select>
          </FormField>
          <button onClick={onAdd} style={{ ...styles.btn, ...styles.btnPrimary }}>
            <Plus size={14} /> Ajouter
          </button>
        </div>
        <p style={{ marginTop: 12, fontSize: 11.5, color: COLORS.ink500 }}>
          Les administrateurs ajoutés peuvent se connecter avec leurs identifiants sur admin.swingmarketgolf.com.
        </p>
      </section>
    </>
  );
}

// ═════════════════════════════════════════════════════════
// COMPOSANTS ATOMIQUES
// ═════════════════════════════════════════════════════════
function PeriodPicker({ period, setPeriod }) {
  return (
    <div style={styles.range}>
      {PERIODS.map(p => (
        <button key={p.id} onClick={() => setPeriod(p.id)}
          style={{ ...styles.rangeBtn, ...(period === p.id ? styles.rangeBtnActive : null) }}>
          {p.label}
        </button>
      ))}
    </div>
  );
}

function KpiCard({ label, value, unit, delta, subtext, color = "green", hideDelta }) {
  const iconBg = {
    green:  { bg: COLORS.green50, fg: COLORS.green800 },
    gold:   { bg: COLORS.gold100, fg: "#8B6914" },
    blue:   { bg: "#EFF6FF", fg: COLORS.info },
    violet: { bg: "#F5F3FF", fg: COLORS.violet },
  }[color] || { bg: COLORS.ink100, fg: COLORS.ink700 };
  const deltaCls = delta == null ? "flat" : delta > 0.5 ? "up" : delta < -0.5 ? "down" : "flat";
  const DeltaIcon = deltaCls === "up" ? ArrowUpRight : deltaCls === "down" ? ArrowDownRight : Minus;
  const deltaColors = {
    up:   { bg: "#ECFDF5", fg: "#047857" },
    down: { bg: "#FEF2F2", fg: "#B91C1C" },
    flat: { bg: COLORS.ink100, fg: COLORS.ink600 },
  }[deltaCls];
  return (
    <article style={styles.kpi}>
      <div style={styles.kpiHead}>
        <span style={styles.kpiLabel}>{label}</span>
        <span style={{ ...styles.kpiIcon, background: iconBg.bg, color: iconBg.fg }}>
          <Layers size={16} />
        </span>
      </div>
      <div style={styles.kpiValue}>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>
        {unit && <span style={styles.kpiUnit}>{unit}</span>}
      </div>
      <div style={styles.kpiFoot}>
        {!hideDelta && delta != null && (
          <span style={{ ...styles.delta, background: deltaColors.bg, color: deltaColors.fg }}>
            <DeltaIcon size={11} strokeWidth={2.5} />
            {Math.abs(delta).toFixed(1)} %
          </span>
        )}
        <span style={{ color: COLORS.ink500 }}>{subtext}</span>
      </div>
    </article>
  );
}

function StatusBadge({ variant, label }) {
  const map = {
    pay:    { bg: "#FFFBEB", fg: "#92400E", border: "rgba(245,158,11,.2)", dot: COLORS.warning },
    prep:   { bg: "#EFF6FF", fg: "#1D4ED8", border: "rgba(59,130,246,.2)", dot: COLORS.info },
    ship:   { bg: "#F5F3FF", fg: "#6D28D9", border: "rgba(139,92,246,.2)", dot: COLORS.violet },
    deliv:  { bg: "#ECFDF5", fg: "#047857", border: "rgba(16,185,129,.22)", dot: COLORS.success },
    refund: { bg: "#FEF2F2", fg: "#B91C1C", border: "rgba(239,68,68,.2)", dot: COLORS.danger },
  };
  const s = map[variant] || map.prep;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 600,
      padding: "3px 9px 3px 8px", borderRadius: 999,
      border: `1px solid ${s.border}`, background: s.bg, color: s.fg, lineHeight: 1.4,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.dot }} />
      {label}
    </span>
  );
}

function PlanBadge({ plan }) {
  const map = {
    business: { bg: COLORS.navy, fg: COLORS.gold600, label: "🏆 Business" },
    premium:  { bg: COLORS.gold100, fg: COLORS.gold600, label: "⭐ Premium" },
    pro:      { bg: "#EFF6FF", fg: COLORS.info, label: "💎 Pro" },
    basique:  { bg: COLORS.ink100, fg: COLORS.ink600, label: "Basique" },
  };
  const s = map[plan] || map.basique;
  return (
    <span style={{
      background: s.bg, color: s.fg, padding: "3px 10px", borderRadius: 999,
      fontSize: 11.5, fontWeight: 700, textTransform: "capitalize",
    }}>{s.label}</span>
  );
}

function CategoriesDonut({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: 16, fontSize: 13, color: COLORS.ink500 }}>Aucune vente.</div>;
  }
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, paddingTop: 8, flexWrap: "wrap" }}>
      <div style={{ width: 170, height: 170, position: "relative" }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name"
              innerRadius={56} outerRadius={80} stroke="none"
              startAngle={90} endAngle={-270}>
              {data.map((_, i) => <Cell key={i} fill={CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.ink900 }}>{fmtEUR(total)} €</div>
            <div style={{ fontSize: 11, color: COLORS.ink500 }}>Total période</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 200 }}>
        {data.map((d, i) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, flexShrink: 0,
                background: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] }} />
              <span style={{ color: COLORS.ink700, flex: 1 }}>{d.name}</span>
              <span style={{ color: COLORS.ink900, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {fmtEUR(d.value)}&nbsp;€
              </span>
              <span style={{ color: COLORS.ink500, fontSize: 11.5, width: 42, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: COLORS.ink600, marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// MODALS
// ═════════════════════════════════════════════════════════
function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={{ ...modalBoxStyle, maxWidth: wide ? 760 : 560 }} onClick={e => e.stopPropagation()}>
        <div style={modalHeadStyle}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={styles.rowAction}><X size={16} /></button>
        </div>
        <div style={{ padding: "20px 24px", maxHeight: "70vh", overflowY: "auto" }}>{children}</div>
        {footer && <div style={modalFootStyle}>{footer}</div>}
      </div>
    </div>
  );
}

function ProductModal({ product, setProduct, onSave }) {
  return (
    <Modal title="Modifier l'annonce" onClose={() => setProduct(null)}
      footer={
        <>
          <button onClick={() => setProduct(null)} style={{ ...styles.btn, ...styles.btnGhost }}>Annuler</button>
          <button onClick={onSave} style={{ ...styles.btn, ...styles.btnPrimary }}>Sauvegarder</button>
        </>
      }>
      <FormField label="Titre">
        <input style={modalInputStyle} value={product.title || ""}
          onChange={e => setProduct({ ...product, title: e.target.value })} />
      </FormField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <FormField label="Prix (€)">
          <input type="number" style={modalInputStyle} value={product.price || ""}
            onChange={e => setProduct({ ...product, price: e.target.value })} />
        </FormField>
        <FormField label="Marque">
          <input style={modalInputStyle} value={product.brand || ""}
            onChange={e => setProduct({ ...product, brand: e.target.value })} />
        </FormField>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <FormField label="Catégorie">
          <input style={modalInputStyle} value={product.category || ""}
            onChange={e => setProduct({ ...product, category: e.target.value })} />
        </FormField>
        <FormField label="Condition">
          <select style={modalInputStyle} value={product.condition || ""}
            onChange={e => setProduct({ ...product, condition: e.target.value })}>
            <option value="">—</option>
            {PRODUCT_CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </FormField>
      </div>
      <div style={{ marginTop: 12 }}>
        <FormField label="Statut">
          <select style={modalInputStyle} value={product.status || "active"}
            onChange={e => setProduct({ ...product, status: e.target.value })}>
            {PRODUCT_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
      </div>
      <div style={{ marginTop: 12 }}>
        <FormField label="Description">
          <textarea style={{ ...modalInputStyle, minHeight: 100, resize: "vertical" }}
            value={product.description || ""}
            onChange={e => setProduct({ ...product, description: e.target.value })} />
        </FormField>
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: COLORS.ink600, marginBottom: 6 }}>Photos</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {(product.images || []).map((img, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img src={img} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: `1px solid ${COLORS.ink200}` }} />
              <button onClick={() => setProduct({ ...product, images: product.images.filter((_, j) => j !== i) })}
                style={{ position: "absolute", top: -6, right: -6, background: COLORS.danger, color: "#fff",
                  border: 0, borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 11 }}>✕</button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" multiple
          onChange={async (e) => {
            const files = Array.from(e.target.files);
            const urls = [];
            for (const file of files) {
              const ext = file.name.split(".").pop();
              const path = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
              const { error } = await supabaseAdmin.storage.from("products").upload(path, file);
              if (!error) {
                const { data: { publicUrl } } = supabaseAdmin.storage.from("products").getPublicUrl(path);
                urls.push(publicUrl);
              }
            }
            setProduct({ ...product, images: [...(product.images || []), ...urls] });
          }}
          style={{ ...modalInputStyle, padding: 6 }} />
      </div>
    </Modal>
  );
}

function UserModal({ user, setUser, onSave }) {
  return (
    <Modal title="Modifier l'utilisateur" onClose={() => setUser(null)}
      footer={
        <>
          <button onClick={() => setUser(null)} style={{ ...styles.btn, ...styles.btnGhost }}>Annuler</button>
          <button onClick={onSave} style={{ ...styles.btn, ...styles.btnPrimary }}>Sauvegarder</button>
        </>
      }>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Nom complet">
          <input style={modalInputStyle} value={user.full_name || ""}
            onChange={e => setUser({ ...user, full_name: e.target.value })} />
        </FormField>
        <FormField label="Email">
          <input style={modalInputStyle} value={user.email || ""}
            onChange={e => setUser({ ...user, email: e.target.value })} />
        </FormField>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <FormField label="Téléphone">
          <input style={modalInputStyle} value={user.phone || ""}
            onChange={e => setUser({ ...user, phone: e.target.value })} />
        </FormField>
        <FormField label="Code postal">
          <input style={modalInputStyle} value={user.postal_code || ""}
            onChange={e => setUser({ ...user, postal_code: e.target.value })} />
        </FormField>
      </div>
      <div style={{ marginTop: 12 }}>
        <FormField label="Adresse">
          <input style={modalInputStyle} value={user.address || ""}
            onChange={e => setUser({ ...user, address: e.target.value })} />
        </FormField>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <FormField label="Ville">
          <input style={modalInputStyle} value={user.city || ""}
            onChange={e => setUser({ ...user, city: e.target.value })} />
        </FormField>
        <FormField label="Plan abonnement">
          <select style={modalInputStyle} value={user.plan || "basique"}
            onChange={e => setUser({ ...user, plan: e.target.value })}>
            {USER_PLANS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </FormField>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13 }}>
        <input type="checkbox" checked={!!user.seller_onboarding_completed}
          onChange={e => setUser({ ...user, seller_onboarding_completed: e.target.checked })} />
        Onboarding vendeur complété
      </label>
    </Modal>
  );
}

function OrderModal({ order, setOrder, onSave }) {
  return (
    <Modal title="Modifier la commande" onClose={() => setOrder(null)}
      footer={
        <>
          <button onClick={() => setOrder(null)} style={{ ...styles.btn, ...styles.btnGhost }}>Annuler</button>
          <button onClick={onSave} style={{ ...styles.btn, ...styles.btnPrimary }}>Sauvegarder</button>
        </>
      }>
      <p style={{ fontSize: 12, color: COLORS.ink500, margin: "0 0 14px" }}>
        ID : <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{order.id}</span>
      </p>
      <FormField label="Statut">
        <select style={modalInputStyle} value={order.status || "pending_payment"}
          onChange={e => setOrder({ ...order, status: e.target.value })}>
          {ORDER_EDIT_STATUSES.map(s => <option key={s} value={s}>{ORDER_STATUS[s]?.label || s}</option>)}
        </select>
      </FormField>
      <div style={{ marginTop: 12 }}>
        <FormField label="Numéro de suivi">
          <input style={modalInputStyle} value={order.tracking_number || ""}
            onChange={e => setOrder({ ...order, tracking_number: e.target.value })}
            placeholder="Ex: 1Z999AA10123456784" />
        </FormField>
      </div>
    </Modal>
  );
}

function BlogModal({ post, setPost, onSave }) {
  return (
    <Modal wide title={post.id ? "Modifier l'article" : "Nouvel article"} onClose={() => setPost(null)}
      footer={
        <>
          <button onClick={() => setPost(null)} style={{ ...styles.btn, ...styles.btnGhost }}>Annuler</button>
          <button onClick={onSave} style={{ ...styles.btn, ...styles.btnPrimary }}>Sauvegarder</button>
        </>
      }>
      <FormField label="Titre">
        <input style={modalInputStyle} value={post.title || ""}
          onChange={e => setPost({ ...post, title: e.target.value })} />
      </FormField>
      <div style={{ marginTop: 12 }}>
        <FormField label="Slug (URL)">
          <input style={modalInputStyle} value={post.slug || ""}
            onChange={e => setPost({ ...post, slug: e.target.value })}
            placeholder="mon-article-de-blog" />
        </FormField>
      </div>
      <div style={{ marginTop: 12 }}>
        <FormField label="Extrait">
          <textarea style={{ ...modalInputStyle, minHeight: 60, resize: "vertical" }}
            value={post.excerpt || ""} onChange={e => setPost({ ...post, excerpt: e.target.value })} />
        </FormField>
      </div>
      <div style={{ marginTop: 12 }}>
        <FormField label="Contenu">
          <textarea style={{ ...modalInputStyle, minHeight: 200, resize: "vertical" }}
            value={post.content || ""} onChange={e => setPost({ ...post, content: e.target.value })} />
        </FormField>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13 }}>
        <input type="checkbox" checked={!!post.published}
          onChange={e => setPost({ ...post, published: e.target.checked })} />
        Publier immédiatement
      </label>
    </Modal>
  );
}

function AdminModal({ admin, setAdmin, onSave }) {
  return (
    <Modal title="Modifier l'administrateur" onClose={() => setAdmin(null)}
      footer={
        <>
          <button onClick={() => setAdmin(null)} style={{ ...styles.btn, ...styles.btnGhost }}>Annuler</button>
          <button onClick={onSave} style={{ ...styles.btn, ...styles.btnPrimary }}>Sauvegarder</button>
        </>
      }>
      <FormField label="Email">
        <input type="email" style={modalInputStyle} value={admin.email || ""}
          onChange={e => setAdmin({ ...admin, email: e.target.value })} />
      </FormField>
      <div style={{ marginTop: 12 }}>
        <FormField label="Nouveau mot de passe (laisser vide pour ne pas changer)">
          <input type="password" style={modalInputStyle} value={admin.newPassword || ""}
            onChange={e => setAdmin({ ...admin, newPassword: e.target.value })} />
        </FormField>
      </div>
      <div style={{ marginTop: 12 }}>
        <FormField label="Rôle">
          <select style={modalInputStyle} value={admin.role || "Admin"}
            onChange={e => setAdmin({ ...admin, role: e.target.value })}>
            <option>Admin</option><option>Modérateur</option><option>Support</option>
          </select>
        </FormField>
      </div>
    </Modal>
  );
}

function ReviewModal({ review, setReview, profiles, onSave }) {
  return (
    <Modal title={review.id ? "Modifier l'avis" : "Nouvel avis"} onClose={() => setReview(null)}
      footer={
        <>
          <button onClick={() => setReview(null)} style={{ ...styles.btn, ...styles.btnGhost }}>Annuler</button>
          <button onClick={onSave} style={{ ...styles.btn, ...styles.btnPrimary }}>Sauvegarder</button>
        </>
      }>
      <FormField label="Vendeur">
        <select style={modalInputStyle} value={review.seller_id || ""}
          onChange={e => setReview({ ...review, seller_id: e.target.value })}>
          <option value="">— Choisir un vendeur —</option>
          {profiles.map(p => (
            <option key={p.id} value={p.id}>{p.shop_name || p.full_name || p.email || p.id}</option>
          ))}
        </select>
      </FormField>
      <div style={{ marginTop: 12 }}>
        <FormField label="Nom de l'acheteur">
          <input style={modalInputStyle} value={review.buyer_name || ""}
            onChange={e => setReview({ ...review, buyer_name: e.target.value })} />
        </FormField>
      </div>
      <div style={{ marginTop: 12 }}>
        <FormField label="Note (1-5)">
          <select style={modalInputStyle} value={review.rating || 5}
            onChange={e => setReview({ ...review, rating: e.target.value })}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} ★</option>)}
          </select>
        </FormField>
      </div>
      <div style={{ marginTop: 12 }}>
        <FormField label="Commentaire">
          <textarea style={{ ...modalInputStyle, minHeight: 100, resize: "vertical" }}
            value={review.comment || ""} onChange={e => setReview({ ...review, comment: e.target.value })} />
        </FormField>
      </div>
    </Modal>
  );
}

function UserHistoryModal({ data, onClose }) {
  return (
    <Modal wide title={`Historique — ${data.user.full_name || data.user.email}`} onClose={onClose}
      footer={<button onClick={onClose} style={{ ...styles.btn, ...styles.btnGhost }}>Fermer</button>}>
      <p style={{ fontSize: 12, color: COLORS.ink500, margin: "0 0 18px" }}>{data.user.email}</p>
      <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px", color: COLORS.green800 }}>
        📦 Annonces postées ({data.listings.length})
      </h4>
      {data.listings.length === 0 ? (
        <p style={{ color: COLORS.ink500, fontSize: 12, marginBottom: 16 }}>Aucune annonce.</p>
      ) : (
        <table style={{ ...styles.table, marginBottom: 20 }}>
          <thead>
            <tr>
              <th style={styles.th}>Titre</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Prix</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.listings.map(l => {
              const stat = ORDER_STATUS[l.status] || { label: l.status || "—", cls: "prep" };
              return (
                <tr key={l.id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{l.title}</td>
                  <td style={{ ...styles.td, textAlign: "right", ...styles.amount }}>{fmtEUR2(l.price)} €</td>
                  <td style={styles.td}><StatusBadge variant={stat.cls} label={stat.label} /></td>
                  <td style={{ ...styles.td, color: COLORS.ink600 }}>{fmtDate(l.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px", color: COLORS.info }}>
        🛒 Achats ({data.purchases.length})
      </h4>
      {data.purchases.length === 0 ? (
        <p style={{ color: COLORS.ink500, fontSize: 12 }}>Aucun achat.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Montant</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.purchases.map(p => {
              const stat = ORDER_STATUS[p.status] || { label: p.status || "—", cls: "prep" };
              return (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}><span style={styles.idCell}>#{(p.id || "").slice(0, 8).toUpperCase()}</span></td>
                  <td style={{ ...styles.td, textAlign: "right", ...styles.amount }}>{fmtEUR2(p.total_paid || p.price)} €</td>
                  <td style={styles.td}><StatusBadge variant={stat.cls} label={stat.label} /></td>
                  <td style={{ ...styles.td, color: COLORS.ink600 }}>{fmtDate(p.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────
// Popovers du header
// ─────────────────────────────────────────────────────────
function HelpPopover() {
  return (
    <div style={popoverStyle}>
      <div style={popoverHeadStyle}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>Aide & support</div>
        <div style={{ fontSize: 11.5, color: COLORS.ink500, marginTop: 2 }}>
          Console admin SwingMarketGolf · v2.4
        </div>
      </div>
      <div style={{ padding: "8px 0" }}>
        <a href="mailto:contact@swingmarketgolf.com" style={popoverItemStyle}>
          <span style={{ fontWeight: 500, color: COLORS.ink900 }}>📧 Contacter le support</span>
          <span style={{ fontSize: 11.5, color: COLORS.ink500 }}>contact@swingmarketgolf.com</span>
        </a>
        <a href="https://github.com/Bouby29/SwingMarketgolf" target="_blank" rel="noreferrer" style={popoverItemStyle}>
          <span style={{ fontWeight: 500, color: COLORS.ink900 }}>📚 Documentation projet</span>
          <span style={{ fontSize: 11.5, color: COLORS.ink500 }}>GitHub · branche main</span>
        </a>
        <div style={popoverItemStyle}>
          <span style={{ fontWeight: 500, color: COLORS.ink900 }}>⌨️ Raccourcis</span>
          <span style={{ fontSize: 11.5, color: COLORS.ink500 }}>Recherche : champ en haut · Actualiser : bouton ↻</span>
        </div>
      </div>
      <div style={{ padding: "10px 14px", borderTop: `1px solid ${COLORS.ink150}`, fontSize: 11, color: COLORS.ink500 }}>
        Une question urgente ? Réponse sous 2h ouvrées.
      </div>
    </div>
  );
}

function NotifPopover({ counters, recentOrders, recentReviews, onGoTo }) {
  const items = [];
  if (counters.disputes > 0) items.push({
    color: COLORS.danger, icon: AlertTriangle,
    title: `${counters.disputes} litige${counters.disputes > 1 ? "s" : ""} ouvert${counters.disputes > 1 ? "s" : ""}`,
    sub: "Cliquez pour traiter", target: "disputes",
  });
  if (counters.pendingOrders > 0) items.push({
    color: COLORS.warning, icon: ShoppingBag,
    title: `${counters.pendingOrders} commande${counters.pendingOrders > 1 ? "s" : ""} à traiter`,
    sub: "En attente de paiement, préparation ou expédition", target: "orders",
  });
  recentOrders.forEach(o => {
    items.push({
      color: COLORS.success, icon: ShoppingBag,
      title: `Commande ${(o.id || "").slice(0, 8).toUpperCase()} · ${fmtEUR2(o.total_paid || o.price)} €`,
      sub: `${o.product_title || "—"} · ${relativeTime(o.created_at)}`, target: "orders",
    });
  });
  recentReviews.forEach(r => {
    items.push({
      color: COLORS.gold600, icon: Star,
      title: `Nouvel avis ${"★".repeat(r.rating || 0)}${"☆".repeat(Math.max(0, 5 - (r.rating || 0)))}`,
      sub: r.comment ? r.comment.slice(0, 60) : "Cliquez pour voir", target: "reviews",
    });
  });

  return (
    <div style={{ ...popoverStyle, width: 360 }}>
      <div style={popoverHeadStyle}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>Notifications</div>
        <div style={{ fontSize: 11.5, color: COLORS.ink500, marginTop: 2 }}>
          {items.length} événement{items.length > 1 ? "s" : ""}
        </div>
      </div>
      <div style={{ maxHeight: 360, overflowY: "auto", padding: "4px 0" }}>
        {items.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: COLORS.ink500 }}>
            Tout est à jour · aucune action requise.
          </div>
        )}
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <button key={i} onClick={() => onGoTo(it.target)} style={notifRowStyle}>
              <span style={{ ...notifIconStyle, color: it.color, background: it.color + "1A" }}>
                <Icon size={15} />
              </span>
              <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.ink900, lineHeight: 1.25 }}>{it.title}</div>
                <div style={{ fontSize: 11.5, color: COLORS.ink500, marginTop: 2,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.sub}</div>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const popoverStyle = {
  position: "absolute", top: 44, right: 0, width: 320, zIndex: 50,
  background: COLORS.paper, borderRadius: 12, border: `1px solid ${COLORS.ink200}`,
  boxShadow: "0 25px 50px rgba(15,23,42,.18)", overflow: "hidden",
  fontFamily: "Inter, sans-serif",
};
const popoverHeadStyle = {
  padding: "12px 14px", borderBottom: `1px solid ${COLORS.ink150}`, background: COLORS.ink50,
};
const popoverItemStyle = {
  display: "flex", flexDirection: "column", gap: 2,
  padding: "10px 14px", textDecoration: "none", color: "inherit",
  borderBottom: `1px solid ${COLORS.ink150}`,
};
const notifRowStyle = {
  width: "100%", display: "flex", alignItems: "flex-start", gap: 10,
  padding: "10px 14px", border: 0, background: "transparent", cursor: "pointer",
  borderBottom: `1px solid ${COLORS.ink150}`,
};
const notifIconStyle = {
  width: 28, height: 28, borderRadius: 8,
  display: "grid", placeItems: "center", flexShrink: 0,
};

// Helpers
function relativeTime(date) {
  if (!date) return "";
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.round(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.round(diff / 3600)} h`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

// ─────────────────────────────────────────────────────────
// STYLES (tokens du design)
// ─────────────────────────────────────────────────────────
const loginInputStyle = {
  width: "100%", height: 38, padding: "0 14px",
  background: COLORS.paper, border: `1px solid ${COLORS.ink200}`,
  borderRadius: 9, fontFamily: "Inter, sans-serif", fontSize: 13,
  color: COLORS.ink900, outline: "none",
};
const loginLabelStyle = {
  display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: COLORS.ink700,
};

const modalOverlayStyle = {
  position: "fixed", inset: 0, background: "rgba(15,23,42,.45)", zIndex: 1000,
  display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
  backdropFilter: "blur(3px)",
};
const modalBoxStyle = {
  background: COLORS.paper, borderRadius: 14, width: "100%",
  maxHeight: "90vh", display: "flex", flexDirection: "column",
  boxShadow: "0 25px 50px rgba(15,23,42,.25)",
  border: `1px solid ${COLORS.ink200}`,
  fontFamily: "Inter, sans-serif",
};
const modalHeadStyle = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "18px 24px", borderBottom: `1px solid ${COLORS.ink150}`,
};
const modalFootStyle = {
  display: "flex", justifyContent: "flex-end", gap: 8,
  padding: "14px 24px", borderTop: `1px solid ${COLORS.ink150}`,
  background: COLORS.ink50,
};
const modalInputStyle = {
  width: "100%", padding: "8px 12px", borderRadius: 8,
  border: `1px solid ${COLORS.ink200}`, fontSize: 13, fontFamily: "Inter, sans-serif",
  color: COLORS.ink900, background: COLORS.paper, outline: "none",
  boxSizing: "border-box",
};
const inlineInputStyle = {
  ...modalInputStyle, width: 100, padding: "6px 10px",
};

const styles = {
  app: {
    display: "grid", gridTemplateColumns: "248px 1fr", minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14, color: COLORS.ink900, background: COLORS.canvas,
    letterSpacing: "-0.005em",
  },
  sidebar: {
    position: "sticky", top: 0, height: "100vh",
    background: COLORS.paper, borderRight: `1px solid ${COLORS.ink200}`,
    display: "flex", flexDirection: "column", padding: "14px 12px",
    overflowY: "auto",
  },
  brand: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "8px 10px 14px",
    borderBottom: `1px solid ${COLORS.ink150}`, marginBottom: 10,
  },
  brandMark: {
    width: 36, height: 36, borderRadius: 10, color: "#fff",
    background: `linear-gradient(160deg, ${COLORS.green800}, ${COLORS.green700})`,
    display: "grid", placeItems: "center", fontWeight: 800, fontSize: 15,
    boxShadow: "0 6px 16px -6px rgba(27,94,32,.55), inset 0 1px 0 rgba(255,255,255,.18)",
  },
  brandName: { fontWeight: 700, fontSize: 14.5, lineHeight: 1.1 },
  brandSub: { fontSize: 11, color: COLORS.ink500, marginTop: 2, display: "flex", alignItems: "center", gap: 5 },
  brandDot: { width: 6, height: 6, borderRadius: "50%", background: COLORS.success, boxShadow: "0 0 0 3px rgba(16,185,129,.18)" },
  workspace: {
    display: "flex", alignItems: "center", gap: 10,
    padding: 10, border: `1px solid ${COLORS.ink200}`, borderRadius: 10,
    background: COLORS.ink50, marginBottom: 14, cursor: "pointer",
    width: "100%", textAlign: "left",
  },
  wsAvatar: {
    width: 28, height: 28, borderRadius: 7,
    background: "linear-gradient(135deg, #0F172A, #334155)", color: "#fff",
    fontWeight: 700, fontSize: 11, display: "grid", placeItems: "center",
  },
  wsName: { fontWeight: 600, fontSize: 12.5, color: COLORS.ink900, lineHeight: 1.2,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  wsRole: { fontSize: 10.5, color: COLORS.ink500, lineHeight: 1.2 },
  navLabel: {
    fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em",
    textTransform: "uppercase", color: COLORS.ink400, padding: "14px 12px 6px",
  },
  nav: { display: "flex", flexDirection: "column", gap: 2 },
  navItem: {
    display: "flex", alignItems: "center", gap: 11, padding: "8px 10px",
    borderRadius: 8, color: COLORS.ink600, fontSize: 13.5, fontWeight: 500,
    cursor: "pointer", textDecoration: "none",
  },
  navItemActive: {
    background: COLORS.ink900, color: "#fff",
    boxShadow: "0 4px 10px -4px rgba(15,23,42,.35)",
  },
  navBadge: {
    marginLeft: "auto", fontSize: 10.5, fontWeight: 600,
    background: COLORS.ink100, color: COLORS.ink700,
    padding: "1px 7px", borderRadius: 6, border: `1px solid ${COLORS.ink200}`,
  },
  navBadgeAlert: { background: COLORS.gold100, color: "#8B6914", borderColor: "transparent" },
  navBadgeOnActive: { background: "rgba(255,255,255,.14)", color: "#fff", borderColor: "transparent" },
  sidebarFooter: { marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${COLORS.ink150}` },
  upgrade: {
    position: "relative", overflow: "hidden", borderRadius: 12, padding: 14, color: "#fff",
    background: `radial-gradient(120% 80% at 100% 0%, rgba(197,160,40,.55), transparent 55%), linear-gradient(160deg, #0A1F0C 0%, #143818 100%)`,
    border: "1px solid rgba(197,160,40,.25)",
  },
  upgradeTitle: { margin: "0 0 4px", fontSize: 13, fontWeight: 700 },
  upgradeText: { margin: "0 0 10px", fontSize: 11.5, color: "rgba(255,255,255,.7)", lineHeight: 1.45 },
  upgradeBtn: {
    width: "100%", padding: "7px 10px", fontSize: 11.5, fontWeight: 600,
    background: COLORS.gold600, color: "#1a1305", borderRadius: 8, border: 0, cursor: "pointer",
  },

  main: { display: "flex", flexDirection: "column", minWidth: 0 },
  header: {
    position: "sticky", top: 0, zIndex: 10, height: 64,
    background: "rgba(246,247,249,.85)", backdropFilter: "saturate(140%) blur(8px)",
    WebkitBackdropFilter: "saturate(140%) blur(8px)",
    borderBottom: `1px solid ${COLORS.ink200}`,
    display: "flex", alignItems: "center", padding: "0 28px", gap: 16,
  },
  crumbs: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.ink500 },
  crumbsHere: { color: COLORS.ink900, fontWeight: 600 },
  search: { flex: 1, maxWidth: 520, marginLeft: 24, position: "relative" },
  searchInput: {
    width: "100%", height: 38, padding: "0 14px 0 38px",
    background: COLORS.paper, border: `1px solid ${COLORS.ink200}`,
    borderRadius: 10, fontSize: 13, color: COLORS.ink900,
    outline: "none", fontFamily: "inherit",
  },
  headerActions: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 9,
    display: "grid", placeItems: "center",
    border: `1px solid ${COLORS.ink200}`, background: COLORS.paper,
    color: COLORS.ink600, position: "relative", cursor: "pointer",
  },
  ping: {
    position: "absolute", top: 7, right: 8, width: 7, height: 7,
    borderRadius: "50%", background: COLORS.gold600, boxShadow: `0 0 0 2px ${COLORS.paper}`,
  },
  btn: {
    height: 36, padding: "0 14px", borderRadius: 9, fontSize: 13, fontWeight: 600,
    display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer", border: 0,
  },
  btnPrimary: { background: COLORS.ink900, color: "#fff" },
  btnGhost: { border: `1px solid ${COLORS.ink200}`, background: COLORS.paper, color: COLORS.ink700 },
  avatar: {
    width: 36, height: 36, borderRadius: "50%",
    background: `linear-gradient(135deg, ${COLORS.green800}, #0A1F0C)`,
    color: "#fff", fontWeight: 700, fontSize: 13,
    display: "grid", placeItems: "center", border: `2px solid ${COLORS.paper}`,
    cursor: "pointer",
  },

  page: { padding: "28px 28px 56px", maxWidth: 1440, width: "100%", margin: "0 auto" },
  pageHead: {
    display: "flex", alignItems: "flex-end", justifyContent: "space-between",
    gap: 24, marginBottom: 24, flexWrap: "wrap",
  },
  pageTitle: { fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: "0 0 6px" },
  pageSub: { fontSize: 13.5, color: COLORS.ink500, margin: 0 },
  pageActions: { display: "flex", alignItems: "center", gap: 8 },
  range: {
    display: "inline-flex", background: COLORS.paper,
    border: `1px solid ${COLORS.ink200}`, borderRadius: 9, padding: 3,
  },
  rangeBtn: {
    padding: "5px 11px", fontSize: 12.5, fontWeight: 500,
    color: COLORS.ink600, borderRadius: 6, border: 0, background: "transparent", cursor: "pointer",
  },
  rangeBtnActive: { background: COLORS.ink900, color: "#fff" },

  kpis: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  kpi: {
    background: COLORS.paper, border: `1px solid ${COLORS.ink200}`,
    borderRadius: 14, padding: "18px 18px 16px", position: "relative", overflow: "hidden",
  },
  kpiHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  kpiLabel: {
    fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em",
    textTransform: "uppercase", color: COLORS.ink500,
  },
  kpiIcon: {
    width: 32, height: 32, borderRadius: 9, display: "grid", placeItems: "center",
  },
  kpiValue: {
    fontSize: 30, fontWeight: 700, letterSpacing: "-0.025em",
    color: "#0B1220", lineHeight: 1, display: "flex", alignItems: "baseline", gap: 6,
    marginBottom: 10,
  },
  kpiUnit: { fontSize: 14, fontWeight: 600, color: COLORS.ink500, letterSpacing: 0 },
  kpiFoot: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, gap: 8 },
  delta: {
    display: "inline-flex", alignItems: "center", gap: 3,
    fontWeight: 600, fontSize: 11.5, padding: "2px 7px", borderRadius: 6,
  },

  row: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 24 },
  card: { background: COLORS.paper, border: `1px solid ${COLORS.ink200}`, borderRadius: 14 },
  cardHead: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "18px 20px 0", gap: 12, flexWrap: "wrap",
  },
  cardTitle: { fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", margin: 0 },
  cardSub: { fontSize: 12.5, color: COLORS.ink500, margin: "3px 0 0" },
  cardBody: { padding: "18px 20px 20px" },
  legend: { display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: COLORS.ink600 },
  legendSw: { width: 8, height: 8, borderRadius: 2, display: "inline-block", marginRight: 6, verticalAlign: "middle" },

  tableHead: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "18px 20px", borderBottom: `1px solid ${COLORS.ink150}`,
    gap: 16, flexWrap: "wrap",
  },
  toolbar: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  tabs: {
    display: "flex", alignItems: "center", gap: 4,
    background: COLORS.ink100, borderRadius: 9, padding: 3,
  },
  tabBtn: {
    padding: "6px 12px", fontSize: 12.5, fontWeight: 500, color: COLORS.ink600,
    borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 7,
    background: "transparent", border: 0, cursor: "pointer",
  },
  tabBtnActive: { background: COLORS.paper, color: COLORS.ink900, boxShadow: "0 1px 2px rgba(15,23,42,.04)" },
  tabCount: {
    fontSize: 10.5, fontWeight: 600, background: COLORS.paper,
    padding: "1px 6px", borderRadius: 5, color: COLORS.ink600,
    border: `1px solid ${COLORS.ink200}`,
  },
  chip: {
    height: 32, padding: "0 11px", border: `1px solid ${COLORS.ink200}`,
    background: COLORS.paper, borderRadius: 8, fontSize: 12.5, color: COLORS.ink700,
    fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
  },

  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left", padding: "11px 20px",
    fontSize: 11.5, fontWeight: 600, color: COLORS.ink500,
    letterSpacing: "0.04em", textTransform: "uppercase",
    background: COLORS.ink50, borderBottom: `1px solid ${COLORS.ink200}`,
  },
  tr: { transition: "background .12s" },
  td: { padding: "12px 20px", borderBottom: `1px solid ${COLORS.ink150}`, verticalAlign: "middle", color: COLORS.ink700 },
  idCell: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.ink700, fontWeight: 500 },
  amount: { fontWeight: 600, color: COLORS.ink900, fontVariantNumeric: "tabular-nums" },
  buyer: { display: "flex", alignItems: "center", gap: 10 },
  buyerAvatar: {
    width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center",
    color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
  },
  buyerName: { fontWeight: 600, color: COLORS.ink900, fontSize: 13, lineHeight: 1.15 },
  buyerMail: { fontSize: 11.5, color: COLORS.ink500, lineHeight: 1.2 },
  rowAction: {
    width: 28, height: 28, borderRadius: 7,
    display: "inline-grid", placeItems: "center", color: COLORS.ink500,
    background: "transparent", border: 0, cursor: "pointer", marginRight: 2,
  },

  activity: { display: "flex", flexDirection: "column", padding: "6px 4px" },
  act: { display: "flex", gap: 12, padding: "12px 16px", borderRadius: 10, position: "relative" },
  actAvatar: {
    width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center",
    color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0, position: "relative",
  },
  actAvatarDot: {
    content: "''", position: "absolute", width: 12, height: 12, borderRadius: "50%",
    bottom: -2, right: -2, border: `2px solid ${COLORS.paper}`,
  },
  actText: { fontSize: 13, color: COLORS.ink700, lineHeight: 1.4 },
  actTime: { fontSize: 11.5, color: COLORS.ink500, marginTop: 2 },

  sellerRow: {
    display: "grid", gridTemplateColumns: "28px 1fr auto",
    gap: 14, alignItems: "center", padding: "10px 4px",
  },
  sellerRank: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12, color: COLORS.ink400, fontWeight: 600,
  },
};
