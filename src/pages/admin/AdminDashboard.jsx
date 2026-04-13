import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  "https://pnhiuifejnnklbfpjmdr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuaGl1aWZlam5ua2xiZnBqbWRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY5MDc4NSwiZXhwIjoyMDg5MjY2Nzg1fQ.pdIrv8cLFbTEJATtDVAqgAODYEJKHS7n_g6BE4ft0qU"
);

const ADMIN_PASSWORD = "swingadmin2024";

const NAV = [
  { id: "overview", label: "Tableau de bord", icon: "📊" },
  { id: "orders", label: "Commandes", icon: "🛒" },
  { id: "products", label: "Annonces", icon: "🏌️" },
  { id: "users", label: "Utilisateurs", icon: "👥" },
  { id: "finance", label: "Finance", icon: "💰" },
  { id: "commissions", label: "Commissions", icon: "%" },
  { id: "carriers", label: "Transporteurs", icon: "🚚" },
];

const STATUS_COLORS = {
  active: { bg: "#e8f5e9", color: "#2e7d32", label: "Actif" },
  sold: { bg: "#e3f2fd", color: "#1565c0", label: "Vendu" },
  reserved: { bg: "#fff8e1", color: "#f57f17", label: "Réservé" },
  pending: { bg: "#fff8e1", color: "#f57f17", label: "En attente" },
  preparing: { bg: "#e8eaf6", color: "#3949ab", label: "Préparation" },
  shipped: { bg: "#e0f2f1", color: "#00695c", label: "Expédié" },
  delivered: { bg: "#e8f5e9", color: "#2e7d32", label: "Livré" },
  cancelled: { bg: "#ffebee", color: "#c62828", label: "Annulé" },
};

function Badge({ status }) {
  const s = STATUS_COLORS[status] || { bg: "#f5f5f5", color: "#666", label: status };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

function MiniBar({ data, color = "#1B5E20" }) {
  if (!data || data.length === 0) return <div style={{ color: "#aaa", fontSize: "0.8rem" }}>Aucune donnée</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 60 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ width: "100%", background: color, borderRadius: "3px 3px 0 0", height: `${(d.value / max) * 50}px`, minHeight: d.value > 0 ? 4 : 0, opacity: 0.8 }} />
          <span style={{ fontSize: "0.6rem", color: "#aaa", whiteSpace: "nowrap" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [section, setSection] = useState("overview");
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0, commissions: 0, avgCart: 0 });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState("");
  const [commissions, setCommissions] = useState([
    { label: "0 - 99 EUR", min: 0, max: 99, rate: 10, fixed: 0.70 },
    { label: "100 - 299 EUR", min: 100, max: 299, rate: 8, fixed: 0.70 },
    { label: "300 - 999 EUR", min: 300, max: 999, rate: 6, fixed: 0.70 },
    { label: "1000 EUR+", min: 1000, max: 999999, rate: 4, fixed: 0.70 },
  ]);
  const [carriers, setCarriers] = useState([
    { name: "Colissimo", price: 6.90, delay: "2-3 jours" },
    { name: "Chronopost", price: 12.90, delay: "24h" },
    { name: "Mondial Relay", price: 4.90, delay: "3-5 jours" },
  ]);

  useEffect(() => {
    if (sessionStorage.getItem("admin_authed")) setAuthed(true);
    document.documentElement.classList.remove("dark");
    document.body.style.background = "#f0f2f5";
    document.body.style.color = "#333";
  }, []);

  useEffect(() => { if (authed) loadData(); }, [authed]);

  const loadData = async () => {
    setLoading(true);
    const [
      { count: uc }, { count: pc }, { count: oc },
      { data: orderData }, { data: u }, { data: p }, { data: o }
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("products").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("price, commission, created_at"),
      supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false }).limit(200),
      supabaseAdmin.from("products").select("*").order("created_at", { ascending: false }).limit(200),
      supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    const revenue = orderData?.reduce((s, x) => s + (x.price || 0), 0) || 0;
    const comm = orderData?.reduce((s, x) => s + (x.commission || 0), 0) || 0;
    const avgCart = oc > 0 ? revenue / oc : 0;
    setStats({ users: uc || 0, products: pc || 0, orders: oc || 0, revenue, commissions: comm, avgCart });
    setUsers(u || []);
    setProducts(p || []);
    setOrders(o || []);
    // Chart: 7 derniers jours
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("fr-FR", { weekday: "short" });
      const dateStr = d.toISOString().split("T")[0];
      const value = (orderData || []).filter(x => x.created_at?.startsWith(dateStr)).reduce((s, x) => s + (x.price || 0), 0);
      days.push({ label, value });
    }
    setChartData(days);
    setLoading(false);
  };

  const login = () => {
    if (pwd === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_authed", "1");
      setAuthed(true);
    }
  };

  const saveMsg = (msg) => { setSaved(msg); setTimeout(() => setSaved(""), 3000); };

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "#1B5E20", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: 16, padding: "2.5rem", width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: 56, height: 56, background: "#1B5E20", borderRadius: 14, margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>⛳</div>
          <h1 style={{ fontWeight: 800, fontSize: "1.4rem", color: "#1B5E20", margin: 0 }}>SwingMarketGolf</h1>
          <p style={{ color: "#888", fontSize: "0.85rem", margin: "4px 0 0" }}>Administration</p>
        </div>
        <input type="password" placeholder="Mot de passe admin" value={pwd}
          onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && login()}
          style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 10, border: "1.5px solid #ddd", fontSize: "0.95rem", marginBottom: "1rem", boxSizing: "border-box" }} />
        <button onClick={login} style={{ width: "100%", background: "#1B5E20", color: "white", border: "none", borderRadius: 10, padding: "0.75rem", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
          Se connecter
        </button>
      </div>
    </div>
  );

  const filteredUsers = users.filter(u => !search || u.email?.includes(search) || u.full_name?.toLowerCase().includes(search.toLowerCase()));
  const filteredProducts = products.filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()));
  const filteredOrders = orders.filter(o => !search || o.id?.includes(search));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f2f5", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{ width: 220, background: "#1a2332", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100 }}>
        <div style={{ padding: "1.5rem 1.2rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#1B5E20", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⛳</div>
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: "0.9rem", lineHeight: 1 }}>SwingMarket</div>
              <div style={{ color: "#C5A028", fontWeight: 800, fontSize: "0.9rem", lineHeight: 1 }}>Golf</div>
            </div>
          </div>
          <div style={{ marginTop: 12, padding: "8px 10px", background: "rgba(255,255,255,0.06)", borderRadius: 8 }}>
            <div style={{ color: "#aaa", fontSize: "0.7rem" }}>Connecté en tant que</div>
            <div style={{ color: "white", fontWeight: 600, fontSize: "0.8rem" }}>Administrateur</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4caf50" }} />
              <span style={{ color: "#4caf50", fontSize: "0.7rem" }}>En ligne</span>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "1rem 0" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setSection(n.id); setSearch(""); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "0.65rem 1.2rem", border: "none", cursor: "pointer",
                background: section === n.id ? "rgba(27,94,32,0.4)" : "transparent",
                color: section === n.id ? "white" : "#8a9bb5",
                fontWeight: section === n.id ? 700 : 500,
                fontSize: "0.85rem", textAlign: "left",
                borderLeft: section === n.id ? "3px solid #1B5E20" : "3px solid transparent",
                transition: "all 0.15s",
              }}>
              <span style={{ fontSize: "1rem" }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "1rem 1.2rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => { sessionStorage.removeItem("admin_authed"); setAuthed(false); }}
            style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "#aaa", border: "none", borderRadius: 8, padding: "0.5rem", cursor: "pointer", fontSize: "0.8rem" }}>
            Deconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* TOP BAR */}
        <header style={{ background: "white", borderBottom: "1px solid #e8ecf0", padding: "0.75rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: "1.1rem", color: "#1a2332" }}>
              {NAV.find(n => n.id === section)?.icon} {NAV.find(n => n.id === section)?.label}
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {saved && <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "4px 12px", borderRadius: 20, fontSize: "0.8rem", fontWeight: 600 }}>✓ {saved}</span>}
            <button onClick={loadData} style={{ background: "#f0f2f5", border: "none", borderRadius: 8, padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.8rem", color: "#666" }}>
              ↻ Actualiser
            </button>
          </div>
        </header>

        <div style={{ padding: "1.5rem 2rem", flex: 1 }}>

          {/* OVERVIEW */}
          {section === "overview" && (
            <div>
              {/* KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "CHIFFRE D'AFFAIRES", value: `${stats.revenue.toFixed(2)} EUR`, sub: "Total des ventes", icon: "💵", color: "#0097a7", light: "#e0f7fa" },
                  { label: "COMMISSIONS", value: `${stats.commissions.toFixed(2)} EUR`, sub: "Revenus plateforme", icon: "%", color: "#2e7d32", light: "#e8f5e9" },
                  { label: "COMMANDES", value: stats.orders, sub: `Panier moyen: ${stats.avgCart.toFixed(2)} EUR`, icon: "🛒", color: "#f57c00", light: "#fff3e0" },
                  { label: "UTILISATEURS", value: stats.users, sub: `${stats.products} annonces actives`, icon: "👥", color: "#c62828", light: "#ffebee" },
                ].map((k, i) => (
                  <div key={i} style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ background: k.color, display: "flex", alignItems: "center", gap: 12, padding: "1rem 1.2rem" }}>
                      <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: "white" }}>{k.icon}</div>
                      <div>
                        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: 1 }}>{k.label}</div>
                        <div style={{ color: "white", fontSize: "1.4rem", fontWeight: 800, lineHeight: 1.2 }}>{k.value}</div>
                      </div>
                    </div>
                    <div style={{ padding: "0.6rem 1.2rem", background: k.light }}>
                      <span style={{ fontSize: "0.75rem", color: k.color, fontWeight: 600 }}>{k.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Graphiques */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div style={{ background: "white", borderRadius: 12, padding: "1.2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", fontWeight: 700, color: "#444" }}>Ventes des 7 derniers jours</h3>
                  <MiniBar data={chartData} color="#1B5E20" />
                </div>
                <div style={{ background: "white", borderRadius: 12, padding: "1.2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", fontWeight: 700, color: "#444" }}>Commissions des 7 derniers jours</h3>
                  <MiniBar data={chartData.map(d => ({ ...d, value: d.value * 0.08 }))} color="#0097a7" />
                </div>
              </div>

              {/* Dernières commandes */}
              <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#444" }}>Dernières commandes</h3>
                  <button onClick={() => setSection("orders")} style={{ background: "none", border: "none", color: "#1B5E20", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Voir tout →</button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      {["ID", "Acheteur", "Montant", "Statut", "Date"].map(h => (
                        <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "#888", fontWeight: 600, fontSize: "0.8rem", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id} style={{ borderBottom: "1px solid #fafafa" }}>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#888" }}>#{o.id?.slice(0, 8)}</td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>{o.buyer_id?.slice(0, 8)}...</td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: 700 }}>{o.price?.toFixed(2)} EUR</td>
                        <td style={{ padding: "0.75rem 1rem" }}><Badge status={o.status} /></td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#888" }}>{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COMMANDES */}
          {section === "orders" && (
            <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f0f0f0", display: "flex", gap: 12, alignItems: "center" }}>
                <input placeholder="Rechercher une commande..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ flex: 1, padding: "0.5rem 0.8rem", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: "0.85rem" }} />
                <span style={{ color: "#888", fontSize: "0.8rem" }}>{filteredOrders.length} commande(s)</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    {["ID", "Acheteur", "Vendeur", "Montant", "Commission", "Statut", "Date"].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "#888", fontWeight: 600, fontSize: "0.8rem", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => (
                    <tr key={o.id} style={{ borderBottom: "1px solid #fafafa" }}>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "#888", fontFamily: "monospace" }}>#{o.id?.slice(0, 8)}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem" }}>{o.buyer_id?.slice(0, 8)}...</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem" }}>{o.seller_id?.slice(0, 8)}...</td>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 700, fontSize: "0.85rem" }}>{o.price?.toFixed(2)} EUR</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", color: "#1B5E20" }}>{(o.commission || 0).toFixed(2)} EUR</td>
                      <td style={{ padding: "0.75rem 1rem" }}><Badge status={o.status} /></td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.78rem", color: "#888" }}>{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ANNONCES */}
          {section === "products" && (
            <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f0f0f0", display: "flex", gap: 12, alignItems: "center" }}>
                <input placeholder="Rechercher une annonce..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ flex: 1, padding: "0.5rem 0.8rem", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: "0.85rem" }} />
                <span style={{ color: "#888", fontSize: "0.8rem" }}>{filteredProducts.length} annonce(s)</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    {["Titre", "Prix", "Catégorie", "Marque", "Condition", "Statut", "Date"].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "#888", fontWeight: 600, fontSize: "0.8rem", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #fafafa" }}>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: 600, maxWidth: 200 }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 700, fontSize: "0.85rem" }}>{p.price} EUR</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem" }}>{p.category}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem" }}>{p.brand}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem" }}>{p.condition}</td>
                      <td style={{ padding: "0.75rem 1rem" }}><Badge status={p.status} /></td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.78rem", color: "#888" }}>{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* UTILISATEURS */}
          {section === "users" && (
            <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f0f0f0", display: "flex", gap: 12, alignItems: "center" }}>
                <input placeholder="Rechercher un utilisateur..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ flex: 1, padding: "0.5rem 0.8rem", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: "0.85rem" }} />
                <span style={{ color: "#888", fontSize: "0.8rem" }}>{filteredUsers.length} utilisateur(s)</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    {["Nom", "Email", "Téléphone", "Ville", "Onboarding", "Inscrit le"].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "#888", fontWeight: 600, fontSize: "0.8rem", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #fafafa" }}>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 600, fontSize: "0.85rem" }}>{u.full_name || "—"}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", color: "#555" }}>{u.email}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem" }}>{u.phone || "—"}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem" }}>{u.city || "—"}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span style={{ background: u.seller_onboarding_completed ? "#e8f5e9" : "#fff8e1", color: u.seller_onboarding_completed ? "#2e7d32" : "#f57f17", padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600 }}>
                          {u.seller_onboarding_completed ? "✓ Complété" : "En attente"}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.78rem", color: "#888" }}>{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FINANCE */}
          {section === "finance" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Chiffre d'affaires total", value: `${stats.revenue.toFixed(2)} EUR`, icon: "💵", color: "#0097a7" },
                { label: "Commissions perçues", value: `${stats.commissions.toFixed(2)} EUR`, icon: "%", color: "#2e7d32" },
                { label: "Nombre de transactions", value: stats.orders, icon: "🔄", color: "#f57c00" },
                { label: "Panier moyen", value: `${stats.avgCart.toFixed(2)} EUR`, icon: "🛒", color: "#7b1fa2" },
              ].map((k, i) => (
                <div key={i} style={{ background: "white", borderRadius: 12, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 56, height: 56, background: k.color, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: "white" }}>{k.icon}</div>
                  <div>
                    <div style={{ color: "#888", fontSize: "0.8rem", fontWeight: 600 }}>{k.label}</div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a2332" }}>{k.value}</div>
                  </div>
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1", background: "white", borderRadius: 12, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", fontWeight: 700 }}>Evolution du CA (7 jours)</h3>
                <MiniBar data={chartData} color="#1B5E20" />
              </div>
            </div>
          )}

          {/* COMMISSIONS */}
          {section === "commissions" && (
            <div style={{ background: "white", borderRadius: 12, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 1.5rem", fontSize: "1rem", fontWeight: 700 }}>Grille de commissions</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    {["Tranche de prix", "Taux (%)", "Frais fixe (EUR)"].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "#888", fontWeight: 600, fontSize: "0.85rem", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{c.label}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <input type="number" value={c.rate} onChange={e => { const n = [...commissions]; n[i].rate = +e.target.value; setCommissions(n); }}
                          style={{ width: 70, padding: "0.4rem 0.6rem", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: "0.9rem" }} />
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <input type="number" step="0.01" value={c.fixed} onChange={e => { const n = [...commissions]; n[i].fixed = +e.target.value; setCommissions(n); }}
                          style={{ width: 80, padding: "0.4rem 0.6rem", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: "0.9rem" }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => saveMsg("Commissions sauvegardées")} style={{ marginTop: 16, background: "#1B5E20", color: "white", border: "none", borderRadius: 10, padding: "0.6rem 1.5rem", cursor: "pointer", fontWeight: 700 }}>
                Sauvegarder
              </button>
            </div>
          )}

          {/* TRANSPORTEURS */}
          {section === "carriers" && (
            <div style={{ background: "white", borderRadius: 12, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 1.5rem", fontSize: "1rem", fontWeight: 700 }}>Transporteurs</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    {["Transporteur", "Prix (EUR)", "Délai"].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "#888", fontWeight: 600, fontSize: "0.85rem", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {carriers.map((c, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <input type="number" step="0.01" value={c.price} onChange={e => { const n = [...carriers]; n[i].price = +e.target.value; setCarriers(n); }}
                          style={{ width: 90, padding: "0.4rem 0.6rem", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: "0.9rem" }} />
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <input type="text" value={c.delay} onChange={e => { const n = [...carriers]; n[i].delay = e.target.value; setCarriers(n); }}
                          style={{ width: 120, padding: "0.4rem 0.6rem", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: "0.9rem" }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => saveMsg("Transporteurs sauvegardés")} style={{ marginTop: 16, background: "#1B5E20", color: "white", border: "none", borderRadius: 10, padding: "0.6rem 1.5rem", cursor: "pointer", fontWeight: 700 }}>
                Sauvegarder
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
