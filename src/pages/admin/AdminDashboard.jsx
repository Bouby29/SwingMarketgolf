import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  "https://pnhiuifejnnklbfpjmdr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuaGl1aWZlam5ua2xiZnBqbWRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY5MDc4NSwiZXhwIjoyMDg5MjY2Nzg1fQ.pdIrv8cLFbTEJATtDVAqgAODYEJKHS7n_g6BE4ft0qU"
);

const ADMIN_LOGIN = "admin@swingmarketgolf.com";
const ADMIN_PASSWORD = "swingadmin2024";

const NAV = [
  { id: "overview", label: "Tableau de bord", icon: "📊" },
  { id: "orders", label: "Commandes", icon: "🛒" },
  { id: "products", label: "Annonces", icon: "🏌️" },
  { id: "users", label: "Utilisateurs", icon: "👥" },
  { id: "finance", label: "Finance", icon: "💰" },
  { id: "commissions", label: "Commissions", icon: "%" },
  { id: "carriers", label: "Transporteurs", icon: "🚚" },
  { id: "blog", label: "Blog", icon: "✏️" },
  { id: "admins", label: "Administrateurs", icon: "🔐" },
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
  const [login, setLogin] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwd, setPwd] = useState("");
  const [section, setSection] = useState("overview");
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0, commissions: 0, avgCart: 0 });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [blogPosts, setBlogPosts] = useState([]);
  const [editBlog, setEditBlog] = useState(null);
  const [newCarrier, setNewCarrier] = useState({ name: "", price: "", delay: "" });
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", role: "Admin" });
  const [userHistory, setUserHistory] = useState(null);
  const [newBlog, setNewBlog] = useState({ title: "", content: "", excerpt: "", slug: "", published: false });
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
    // Admins
    const { data: adminList } = await supabaseAdmin.from("admin_users").select("*").order("created_at", { ascending: true });
    setAdmins(adminList || []);
    // Blog
    const { data: bp } = await supabaseAdmin.from("blog_posts").select("*").order("created_at", { ascending: false });
    setBlogPosts(bp || []);
    setLoading(false);
  };

  const doLogin = async () => {
    const isMainAdmin = pwd === ADMIN_PASSWORD && login === ADMIN_LOGIN;
    const { data: dbAdmin } = await supabaseAdmin.from("admin_users").select("*").eq("email", login).eq("password", pwd).single();
    if (isMainAdmin || dbAdmin) {
      sessionStorage.setItem("admin_authed", "1");
      setAuthed(true);
    }
  };

  const saveMsg = (msg) => { setSaved(msg); setTimeout(() => setSaved(""), 3000); };

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
    saveMsg("Annonce mise a jour !");
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
    }).eq("id", editUser.id);
    setEditUser(null);
    saveMsg("Utilisateur mis a jour !");
    loadData();
  };

  const saveOrder = async () => {
    await supabaseAdmin.from("orders").update({
      status: editOrder.status,
      tracking_number: editOrder.tracking_number,
    }).eq("id", editOrder.id);
    setEditOrder(null);
    saveMsg("Commande mise a jour !");
    loadData();
  };

  const saveBlog = async () => {
    if (editBlog.id) {
      await supabaseAdmin.from("blog_posts").update({
        title: editBlog.title,
        content: editBlog.content,
        excerpt: editBlog.excerpt,
        slug: editBlog.slug,
        published: editBlog.published,
      }).eq("id", editBlog.id);
    } else {
      await supabaseAdmin.from("blog_posts").insert({
        title: editBlog.title,
        content: editBlog.content,
        excerpt: editBlog.excerpt,
        slug: editBlog.slug || editBlog.title.toLowerCase().replace(/\s+/g, "-"),
        published: editBlog.published,
      });
    }
    setEditBlog(null);
    saveMsg("Article sauvegarde !");
    loadData();
  };

  const deleteBlog = async (id) => {
    if (!confirm("Supprimer cet article ?")) return;
    await supabaseAdmin.from("blog_posts").delete().eq("id", id);
    saveMsg("Article supprime !");
    loadData();
  };

  const loadUserHistory = async (user) => {
    const [{ data: listings }, { data: purchases }] = await Promise.all([
      supabaseAdmin.from("products").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("orders").select("*").eq("buyer_id", user.id).order("created_at", { ascending: false }),
    ]);
    setUserHistory({ user, listings: listings || [], purchases: purchases || [] });
  };

  const deleteProduct = async (id) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    await supabaseAdmin.from("products").delete().eq("id", id);
    saveMsg("Annonce supprimee !");
    loadData();
  };

  const modalStyle = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.5)", zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  const modalBoxStyle = {
    background: "white", borderRadius: 16, padding: "2rem",
    width: "90%", maxWidth: 600, maxHeight: "80vh", overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  };

  const inputStyle = {
    width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8,
    border: "1.5px solid #e0e0e0", fontSize: "0.9rem",
    marginBottom: "0.75rem", boxSizing: "border-box",
  };

  const labelStyle = { fontSize: "0.8rem", fontWeight: 600, color: "#555", marginBottom: 4, display: "block" };



  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "#1B5E20", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: 16, padding: "2.5rem", width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: 56, height: 56, background: "#1B5E20", borderRadius: 14, margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>⛳</div>
          <h1 style={{ fontWeight: 800, fontSize: "1.4rem", color: "#1B5E20", margin: 0 }}>SwingMarketGolf</h1>
          <p style={{ color: "#888", fontSize: "0.85rem", margin: "4px 0 0" }}>Administration</p>
        </div>
        <input type="email" placeholder="Identifiant (email)" value={login}
          onChange={e => setLogin(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()}
          style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 10, border: "1.5px solid #ddd", fontSize: "0.95rem", marginBottom: "1rem", boxSizing: "border-box" }} />
        <div style={{ position: "relative", marginBottom: "1rem" }}>
          <input type={showPwd ? "text" : "password"} placeholder="Mot de passe" value={pwd}
            onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()}
            style={{ width: "100%", padding: "0.75rem 2.5rem 0.75rem 1rem", borderRadius: 10, border: "1.5px solid #ddd", fontSize: "0.95rem", boxSizing: "border-box" }} />
          <button type="button" onClick={() => setShowPwd(!showPwd)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "#888" }}>
            {showPwd ? "🙈" : "👁️"}
          </button>
        </div>
        <button onClick={doLogin} style={{ width: "100%", background: "#1B5E20", color: "white", border: "none", borderRadius: 10, padding: "0.75rem", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
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
                    {["ID", "Acheteur", "Vendeur", "Montant", "Commission", "Statut", "Date", "Actions"].map(h => (
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
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <button onClick={() => setEditOrder({...o})} style={{ background: "#1B5E20", color: "white", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem" }}>Modifier</button>
                      </td>
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
                    {["Titre", "Prix", "Catégorie", "Marque", "Condition", "Statut", "Date", "Actions"].map(h => (
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
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <button onClick={() => setEditProduct({...p})} style={{ background: "#1B5E20", color: "white", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem", marginRight: 4 }}>Modifier</button>
                        <button onClick={() => deleteProduct(p.id)} style={{ background: "#ffebee", color: "#c62828", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem" }}>Supprimer</button>
                      </td>
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
                    {["Nom", "Email", "Téléphone", "Ville", "Onboarding", "Inscrit le", "Actions"].map(h => (
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
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <button onClick={() => setEditUser({...u})} style={{ background: "#1B5E20", color: "white", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem", marginRight: 4 }}>Modifier</button>
                        <button onClick={() => loadUserHistory(u)} style={{ background: "#e3f2fd", color: "#1565c0", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem" }}>Historique</button>
                      </td>
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
              <div style={{ marginTop: 24, borderTop: "1px solid #f0f0f0", paddingTop: 20 }}>
                <h4 style={{ margin: "0 0 12px", fontSize: "0.9rem", fontWeight: 700 }}>Ajouter un transporteur</h4>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 8, alignItems: "end" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#888", display: "block", marginBottom: 4 }}>Nom</label>
                    <input value={newCarrier.name} onChange={e => setNewCarrier({...newCarrier, name: e.target.value})} placeholder="Ex: DHL"
                      style={{ width: "100%", padding: "0.5rem 0.7rem", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: "0.85rem", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#888", display: "block", marginBottom: 4 }}>Prix (EUR)</label>
                    <input type="number" step="0.01" value={newCarrier.price} onChange={e => setNewCarrier({...newCarrier, price: e.target.value})} placeholder="7.90"
                      style={{ width: "100%", padding: "0.5rem 0.7rem", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: "0.85rem", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#888", display: "block", marginBottom: 4 }}>Délai</label>
                    <input value={newCarrier.delay} onChange={e => setNewCarrier({...newCarrier, delay: e.target.value})} placeholder="2-3 jours"
                      style={{ width: "100%", padding: "0.5rem 0.7rem", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: "0.85rem", boxSizing: "border-box" }} />
                  </div>
                  <button onClick={() => {
                    if (!newCarrier.name || !newCarrier.price) return;
                    setCarriers([...carriers, { name: newCarrier.name, price: parseFloat(newCarrier.price), delay: newCarrier.delay }]);
                    setNewCarrier({ name: "", price: "", delay: "" });
                    saveMsg("Transporteur ajouté !");
                  }} style={{ background: "#1B5E20", color: "white", border: "none", borderRadius: 8, padding: "0.5rem 1rem", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    + Ajouter
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                {carriers.map((c, i) => (
                  <button key={i} onClick={() => { setCarriers(carriers.filter((_, j) => j !== i)); saveMsg("Transporteur supprimé"); }}
                    style={{ background: "#ffebee", color: "#c62828", border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: "0.75rem", marginRight: 6, marginBottom: 4 }}>
                    ✕ {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}


          {/* ADMINISTRATEURS */}
          {section === "admins" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontWeight: 700 }}>Gestion des administrateurs</h3>
              </div>

              {/* Liste admins */}
              <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      {["Email", "Rôle", "Créé le", "Actions"].map(h => (
                        <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "#888", fontWeight: 600, fontSize: "0.8rem", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((a, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #fafafa" }}>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 600, fontSize: "0.85rem" }}>{a.email}</td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span style={{ background: a.role === "Super Admin" ? "#e8f5e9" : "#e3f2fd", color: a.role === "Super Admin" ? "#2e7d32" : "#1565c0", padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600 }}>
                            {a.role}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#888" }}>{a.created_at ? new Date(a.created_at).toLocaleDateString("fr-FR") : "—"}</td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          {a.role !== "Super Admin" && (
                            <button onClick={async () => {
                              if (!confirm("Supprimer cet administrateur ?")) return;
                              await supabaseAdmin.from("admin_users").delete().eq("id", a.id);
                              saveMsg("Administrateur supprimé");
                              loadData();
                            }} style={{ background: "#ffebee", color: "#c62828", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem" }}>
                              Supprimer
                            </button>
                          )}
                          {a.role === "Super Admin" && <span style={{ color: "#aaa", fontSize: "0.75rem" }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Ajouter admin */}
              <div style={{ background: "white", borderRadius: 12, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <h4 style={{ margin: "0 0 1rem", fontWeight: 700, fontSize: "0.95rem" }}>Ajouter un administrateur</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#888", display: "block", marginBottom: 4 }}>Email</label>
                    <input type="email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                      placeholder="email@exemple.com"
                      style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: "0.85rem", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#888", display: "block", marginBottom: 4 }}>Mot de passe</label>
                    <input type="password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                      placeholder="Mot de passe"
                      style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: "0.85rem", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#888", display: "block", marginBottom: 4 }}>Rôle</label>
                    <select value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}
                      style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: "0.85rem" }}>
                      <option>Admin</option>
                      <option>Modérateur</option>
                      <option>Support</option>
                    </select>
                  </div>
                  <button onClick={async () => {
                    if (!newAdmin.email || !newAdmin.password) { alert("Email et mot de passe requis"); return; }
                    if (admins.find(a => a.email === newAdmin.email)) { alert("Cet email existe déjà"); return; }
                    const { error } = await supabaseAdmin.from("admin_users").insert({ email: newAdmin.email, password: newAdmin.password, role: newAdmin.role });
                    if (error) { alert("Erreur: " + error.message); return; }
                    setNewAdmin({ email: "", password: "", role: "Admin" });
                    saveMsg("Administrateur ajouté !");
                    loadData();
                  }} style={{ background: "#1B5E20", color: "white", border: "none", borderRadius: 8, padding: "0.6rem 1.2rem", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    + Ajouter
                  </button>
                </div>
                <p style={{ margin: "1rem 0 0", fontSize: "0.75rem", color: "#aaa" }}>
                  ⚠️ Les administrateurs ajoutés peuvent se connecter avec leurs identifiants sur admin.swingmarketgolf.com
                </p>
              </div>
            </div>
          )}

          {/* BLOG */}
          {section === "blog" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontWeight: 700 }}>Articles de blog</h3>
                <button onClick={() => setEditBlog({ title: "", content: "", excerpt: "", slug: "", published: false })}
                  style={{ background: "#1B5E20", color: "white", border: "none", borderRadius: 8, padding: "0.5rem 1rem", cursor: "pointer", fontWeight: 600 }}>
                  + Nouvel article
                </button>
              </div>
              <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      {["Titre", "Slug", "Statut", "Date", "Actions"].map(h => (
                        <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "#888", fontWeight: 600, fontSize: "0.8rem", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {blogPosts.map(bp => (
                      <tr key={bp.id} style={{ borderBottom: "1px solid #fafafa" }}>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 600, fontSize: "0.85rem" }}>{bp.title}</td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#888" }}>{bp.slug}</td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span style={{ background: bp.published ? "#e8f5e9" : "#fff8e1", color: bp.published ? "#2e7d32" : "#f57f17", padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600 }}>
                            {bp.published ? "Publié" : "Brouillon"}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.78rem", color: "#888" }}>{new Date(bp.created_at).toLocaleDateString("fr-FR")}</td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <button onClick={() => setEditBlog({...bp})} style={{ background: "#1B5E20", color: "white", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem", marginRight: 4 }}>Modifier</button>
                          <button onClick={() => deleteBlog(bp.id)} style={{ background: "#ffebee", color: "#c62828", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem" }}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                    {blogPosts.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#aaa" }}>Aucun article pour l instant</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL MODIFIER ANNONCE */}
      {editProduct && (
        <div style={modalStyle} onClick={() => setEditProduct(null)}>
          <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 1.5rem", fontWeight: 800 }}>Modifier l annonce</h3>
            <label style={labelStyle}>Titre</label>
            <input style={inputStyle} value={editProduct.title || ""} onChange={e => setEditProduct({...editProduct, title: e.target.value})} />
            <label style={labelStyle}>Prix (EUR)</label>
            <input style={inputStyle} type="number" value={editProduct.price || ""} onChange={e => setEditProduct({...editProduct, price: e.target.value})} />
            <label style={labelStyle}>Description</label>
            <textarea style={{...inputStyle, minHeight: 100, resize: "vertical"}} value={editProduct.description || ""} onChange={e => setEditProduct({...editProduct, description: e.target.value})} />
            <label style={labelStyle}>Marque</label>
            <input style={inputStyle} value={editProduct.brand || ""} onChange={e => setEditProduct({...editProduct, brand: e.target.value})} />
            <label style={labelStyle}>Catégorie</label>
            <input style={inputStyle} value={editProduct.category || ""} onChange={e => setEditProduct({...editProduct, category: e.target.value})} />
            <label style={labelStyle}>Condition</label>
            <select style={inputStyle} value={editProduct.condition || ""} onChange={e => setEditProduct({...editProduct, condition: e.target.value})}>
              {["Neuf", "Comme neuf", "Très bon état", "Bon état", "État correct"].map(c => <option key={c}>{c}</option>)}
            </select>
            <label style={labelStyle}>Statut</label>
            <select style={inputStyle} value={editProduct.status || "active"} onChange={e => setEditProduct({...editProduct, status: e.target.value})}>
              {["active", "sold", "reserved", "pending"].map(s => <option key={s}>{s}</option>)}
            </select>
            <label style={labelStyle}>Photos actuelles</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              {(editProduct.images || []).map((img, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={img} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #e0e0e0" }} />
                  <button onClick={() => setEditProduct({...editProduct, images: editProduct.images.filter((_, j) => j !== i)})}
                    style={{ position: "absolute", top: -6, right: -6, background: "#c62828", color: "white", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
              ))}
            </div>
            <label style={labelStyle}>Ajouter une photo</label>
            <input type="file" accept="image/*" multiple onChange={async (e) => {
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
              setEditProduct({...editProduct, images: [...(editProduct.images || []), ...urls]});
            }} style={{ ...inputStyle, padding: "0.4rem" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={saveProduct} style={{ flex: 1, background: "#1B5E20", color: "white", border: "none", borderRadius: 10, padding: "0.65rem", cursor: "pointer", fontWeight: 700 }}>Sauvegarder</button>
              <button onClick={() => setEditProduct(null)} style={{ flex: 1, background: "#f5f5f5", color: "#333", border: "none", borderRadius: 10, padding: "0.65rem", cursor: "pointer", fontWeight: 600 }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER UTILISATEUR */}
      {editUser && (
        <div style={modalStyle} onClick={() => setEditUser(null)}>
          <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 1.5rem", fontWeight: 800 }}>Modifier l utilisateur</h3>
            <label style={labelStyle}>Nom complet</label>
            <input style={inputStyle} value={editUser.full_name || ""} onChange={e => setEditUser({...editUser, full_name: e.target.value})} />
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} value={editUser.email || ""} onChange={e => setEditUser({...editUser, email: e.target.value})} />
            <label style={labelStyle}>Téléphone</label>
            <input style={inputStyle} value={editUser.phone || ""} onChange={e => setEditUser({...editUser, phone: e.target.value})} />
            <label style={labelStyle}>Adresse</label>
            <input style={inputStyle} value={editUser.address || ""} onChange={e => setEditUser({...editUser, address: e.target.value})} />
            <label style={labelStyle}>Code postal</label>
            <input style={inputStyle} value={editUser.postal_code || ""} onChange={e => setEditUser({...editUser, postal_code: e.target.value})} />
            <label style={labelStyle}>Ville</label>
            <input style={inputStyle} value={editUser.city || ""} onChange={e => setEditUser({...editUser, city: e.target.value})} />
            <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={editUser.seller_onboarding_completed || false} onChange={e => setEditUser({...editUser, seller_onboarding_completed: e.target.checked})} />
              Onboarding vendeur complété
            </label>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={saveUser} style={{ flex: 1, background: "#1B5E20", color: "white", border: "none", borderRadius: 10, padding: "0.65rem", cursor: "pointer", fontWeight: 700 }}>Sauvegarder</button>
              <button onClick={() => setEditUser(null)} style={{ flex: 1, background: "#f5f5f5", color: "#333", border: "none", borderRadius: 10, padding: "0.65rem", cursor: "pointer", fontWeight: 600 }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER COMMANDE */}
      {editOrder && (
        <div style={modalStyle} onClick={() => setEditOrder(null)}>
          <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 1.5rem", fontWeight: 800 }}>Modifier la commande</h3>
            <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: 16 }}>ID: {editOrder.id}</p>
            <label style={labelStyle}>Statut</label>
            <select style={inputStyle} value={editOrder.status || "pending"} onChange={e => setEditOrder({...editOrder, status: e.target.value})}>
              {["pending", "preparing", "shipped", "delivered", "cancelled"].map(s => <option key={s}>{s}</option>)}
            </select>
            <label style={labelStyle}>Numéro de suivi</label>
            <input style={inputStyle} value={editOrder.tracking_number || ""} onChange={e => setEditOrder({...editOrder, tracking_number: e.target.value})} placeholder="Ex: 1Z999AA10123456784" />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={saveOrder} style={{ flex: 1, background: "#1B5E20", color: "white", border: "none", borderRadius: 10, padding: "0.65rem", cursor: "pointer", fontWeight: 700 }}>Sauvegarder</button>
              <button onClick={() => setEditOrder(null)} style={{ flex: 1, background: "#f5f5f5", color: "#333", border: "none", borderRadius: 10, padding: "0.65rem", cursor: "pointer", fontWeight: 600 }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HISTORIQUE UTILISATEUR */}
      {userHistory && (
        <div style={modalStyle} onClick={() => setUserHistory(null)}>
          <div style={{...modalBoxStyle, maxWidth: 700}} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 4px", fontWeight: 800 }}>Historique — {userHistory.user.full_name || userHistory.user.email}</h3>
            <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: 20 }}>{userHistory.user.email}</p>

            <h4 style={{ margin: "0 0 10px", fontWeight: 700, color: "#1B5E20" }}>📦 Annonces postées ({userHistory.listings.length})</h4>
            {userHistory.listings.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: 16 }}>Aucune annonce</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
                <thead>
                  <tr style={{ background: "#f9f9f9" }}>
                    {["Titre", "Prix", "Statut", "Date"].map(h => (
                      <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontSize: "0.75rem", color: "#888", fontWeight: 600, borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {userHistory.listings.map(l => (
                    <tr key={l.id} style={{ borderBottom: "1px solid #fafafa" }}>
                      <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.82rem", fontWeight: 600 }}>{l.title}</td>
                      <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.82rem" }}>{l.price} EUR</td>
                      <td style={{ padding: "0.5rem 0.75rem" }}><Badge status={l.status} /></td>
                      <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.78rem", color: "#888" }}>{new Date(l.created_at).toLocaleDateString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <h4 style={{ margin: "0 0 10px", fontWeight: 700, color: "#0097a7" }}>🛒 Achats ({userHistory.purchases.length})</h4>
            {userHistory.purchases.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: 16 }}>Aucun achat</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
                <thead>
                  <tr style={{ background: "#f9f9f9" }}>
                    {["ID commande", "Montant", "Statut", "Date"].map(h => (
                      <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontSize: "0.75rem", color: "#888", fontWeight: 600, borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {userHistory.purchases.map(p => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #fafafa" }}>
                      <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.78rem", color: "#888", fontFamily: "monospace" }}>#{p.id?.slice(0,8)}</td>
                      <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.82rem", fontWeight: 700 }}>{p.price} EUR</td>
                      <td style={{ padding: "0.5rem 0.75rem" }}><Badge status={p.status} /></td>
                      <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.78rem", color: "#888" }}>{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button onClick={() => setUserHistory(null)} style={{ width: "100%", background: "#f5f5f5", color: "#333", border: "none", borderRadius: 10, padding: "0.65rem", cursor: "pointer", fontWeight: 600 }}>Fermer</button>
          </div>
        </div>
      )}

      {/* MODAL BLOG */}
      {editBlog && (
        <div style={modalStyle} onClick={() => setEditBlog(null)}>
          <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 1.5rem", fontWeight: 800 }}>{editBlog.id ? "Modifier l article" : "Nouvel article"}</h3>
            <label style={labelStyle}>Titre</label>
            <input style={inputStyle} value={editBlog.title || ""} onChange={e => setEditBlog({...editBlog, title: e.target.value})} placeholder="Titre de l article" />
            <label style={labelStyle}>Slug (URL)</label>
            <input style={inputStyle} value={editBlog.slug || ""} onChange={e => setEditBlog({...editBlog, slug: e.target.value})} placeholder="mon-article-de-blog" />
            <label style={labelStyle}>Extrait</label>
            <textarea style={{...inputStyle, minHeight: 60}} value={editBlog.excerpt || ""} onChange={e => setEditBlog({...editBlog, excerpt: e.target.value})} placeholder="Courte description visible en apercu..." />
            <label style={labelStyle}>Contenu</label>
            <textarea style={{...inputStyle, minHeight: 200, resize: "vertical"}} value={editBlog.content || ""} onChange={e => setEditBlog({...editBlog, content: e.target.value})} placeholder="Contenu complet de l article..." />
            <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <input type="checkbox" checked={editBlog.published || false} onChange={e => setEditBlog({...editBlog, published: e.target.checked})} />
              Publier immédiatement
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveBlog} style={{ flex: 1, background: "#1B5E20", color: "white", border: "none", borderRadius: 10, padding: "0.65rem", cursor: "pointer", fontWeight: 700 }}>Sauvegarder</button>
              <button onClick={() => setEditBlog(null)} style={{ flex: 1, background: "#f5f5f5", color: "#333", border: "none", borderRadius: 10, padding: "0.65rem", cursor: "pointer", fontWeight: 600 }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
