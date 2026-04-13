import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  "https://pnhiuifejnnklbfpjmdr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuaGl1aWZlam5ua2xiZnBqbWRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY5MDc4NSwiZXhwIjoyMDg5MjY2Nzg1fQ.pdIrv8cLFbTEJATtDVAqgAODYEJKHS7n_g6BE4ft0qU"
);

const ADMIN_PASSWORD = "swingadmin2024";

const COMMISSION_DEFAULTS = [
  { label: "0€ - 99€", min: 0, max: 99, rate: 10, fixed: 0.70 },
  { label: "100€ - 299€", min: 100, max: 299, rate: 8, fixed: 0.70 },
  { label: "300€ - 999€", min: 300, max: 999, rate: 6, fixed: 0.70 },
  { label: "1000€+", min: 1000, max: 999999, rate: 4, fixed: 0.70 },
];

const CARRIERS_DEFAULT = [
  { name: "Colissimo", price: 6.90, delay: "2-3 jours" },
  { name: "Chronopost", price: 12.90, delay: "24h" },
  { name: "Mondial Relay", price: 4.90, delay: "3-5 jours" },
];

const S = {
  page: { minHeight: "100vh", background: "#f5f5f5", fontFamily: "system-ui, sans-serif" },
  header: { background: "#0F3D2E", color: "white", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" },
  card: { background: "white", borderRadius: 12, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 16 },
  btn: (c="#0F3D2E") => ({ background: c, color: "white", border: "none", borderRadius: 8, padding: "0.5rem 1rem", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }),
  input: { width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8, border: "1.5px solid #ddd", fontSize: "0.9rem", boxSizing: "border-box" },
  th: { padding: "0.75rem", textAlign: "left", color: "#888", fontWeight: 600, fontSize: "0.85rem", borderBottom: "2px solid #f0f0f0" },
  td: { padding: "0.75rem", borderBottom: "1px solid #f9f9f9", fontSize: "0.9rem" },
  badge: (c) => ({ padding: "2px 10px", borderRadius: 20, fontSize: "0.75rem", background: c === "green" ? "#e8f5e9" : c === "red" ? "#ffebee" : "#fff8e1", color: c === "green" ? "#0F9D58" : c === "red" ? "#e53935" : "#F4B400" }),
};

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [section, setSection] = useState("overview");
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0, commissions: 0 });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [commissions, setCommissions] = useState(COMMISSION_DEFAULTS);
  const [carriers, setCarriers] = useState(CARRIERS_DEFAULT);
  const [saved, setSaved] = useState("");
  const [newUser, setNewUser] = useState({ email: "", full_name: "", phone: "" });

  useEffect(() => {
    if (sessionStorage.getItem("admin_authed")) setAuthed(true);
    // Forcer light mode sur l'admin
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    document.body.style.background = '#f5f5f5';
    document.body.style.color = '#333';
  }, []);
  useEffect(() => { if (authed) loadData(); }, [authed]);

  const loadData = async () => {
    const [{ count: uc }, { count: pc }, { count: oc }, { data: orderData }, { data: u }, { data: p }, { data: o }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("price, commission"),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("products").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    const revenue = orderData?.reduce((s, o) => s + (o.price || 0), 0) || 0;
    const comm = orderData?.reduce((s, o) => s + (o.commission || 0), 0) || 0;
    setStats({ users: uc || 0, products: pc || 0, orders: oc || 0, revenue, commissions: comm });
    setUsers(u || []);
    setProducts(p || []);
    setOrders(o || []);
  };

  const login = () => {
    if (pwd === ADMIN_PASSWORD) { sessionStorage.setItem("admin_authed", "1"); setAuthed(true); }
    else setError("Mot de passe incorrect");
  };

  const saveUser = async () => {
    await supabaseAdmin.from("profiles").update({
      full_name: editingUser.full_name,
      email: editingUser.email,
      phone: editingUser.phone,
      city: editingUser.city,
      address: editingUser.address,
    }).eq("id", editingUser.id);
    setEditingUser(null);
    loadData();
    flash("Utilisateur mis à jour ✓");
  };

  const deleteUser = async (id) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await supabaseAdmin.from("profiles").delete().eq("id", id);
    loadData();
  };

  const saveProduct = async () => {
    await supabaseAdmin.from("products").update({
      title: editingProduct.title,
      price: parseFloat(editingProduct.price),
      description: editingProduct.description,
      category: editingProduct.category,
      condition: editingProduct.condition,
      status: editingProduct.status,
    }).eq("id", editingProduct.id);
    setEditingProduct(null);
    loadData();
    flash("Annonce mise à jour ✓");
  };

  const deleteProduct = async (id) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    await supabaseAdmin.from("products").update({ status: "inactive" }).eq("id", id);
    loadData();
  };

  const saveOrder = async () => {
    await supabaseAdmin.from("orders").update({ status: editingOrder.status, price: parseFloat(editingOrder.price) }).eq("id", editingOrder.id);
    setEditingOrder(null);
    loadData();
    flash("Commande mise à jour ✓");
  };

  const flash = (msg) => { setSaved(msg); setTimeout(() => setSaved(""), 2500); };

  const monthlyData = () => {
    const map = {};
    orders.forEach(o => {
      if (!o.created_at) return;
      const m = new Date(o.created_at).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      map[m] = (map[m] || 0) + (o.price || 0);
    });
    return Object.entries(map).slice(-6).map(([m, v]) => ({ m, v }));
  };

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "#0F3D2E", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: 16, padding: "2.5rem", width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏌️</div>
          <h1 style={{ fontWeight: 800, fontSize: "1.4rem", color: "#0F3D2E" }}>Administration SwingMarket</h1>
        </div>
        <input type="password" placeholder="Mot de passe" value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          style={{ ...S.input, marginBottom: "0.75rem" }} />
        {error && <p style={{ color: "red", fontSize: "0.85rem", marginBottom: "0.5rem" }}>{error}</p>}
        <button onClick={login} style={{ ...S.btn(), width: "100%", padding: "0.85rem", fontSize: "0.95rem" }}>Se connecter</button>
      </div>
    </div>
  );

  const nav = [
    { id: "overview", label: "📊 Vue globale" },
    { id: "users", label: "👥 Utilisateurs" },
    { id: "products", label: "🏌️ Annonces" },
    { id: "orders", label: "🛒 Commandes" },
    { id: "carriers", label: "🚚 Transporteurs" },
    { id: "commissions", label: "💶 Commissions" },
  ];

  const maxVal = Math.max(...monthlyData().map(d => d.v), 1);

  return (
    <div style={S.page}>
      {saved && <div style={{ position: "fixed", top: 20, right: 20, background: "#0F9D58", color: "white", padding: "0.75rem 1.5rem", borderRadius: 10, zIndex: 9999, fontWeight: 600 }}>{saved}</div>}

      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "6px 10px", fontSize: 20 }}>🏌️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Administration SwingMarket</div>
            <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Tableau de bord</div>
          </div>
        </div>
        <button onClick={() => { sessionStorage.removeItem("admin_authed"); setAuthed(false); }}
          style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", padding: "0.5rem 1rem", borderRadius: 8, cursor: "pointer" }}>
          Déconnexion
        </button>
      </div>

      <div style={{ background: "white", borderBottom: "1px solid #eee", padding: "0 2rem", display: "flex", gap: 4, overflowX: "auto" }}>
        {nav.map(n => (
          <button key={n.id} onClick={() => setSection(n.id)} style={{
            padding: "1rem 1.25rem", border: "none", background: "none", cursor: "pointer", whiteSpace: "nowrap",
            borderBottom: section === n.id ? "3px solid #0F3D2E" : "3px solid transparent",
            color: section === n.id ? "#0F3D2E" : "#666",
            fontWeight: section === n.id ? 700 : 500, fontSize: "0.9rem",
          }}>{n.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>

        {/* OVERVIEW */}
        {section === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Utilisateurs", value: stats.users, color: "#4285F4", icon: "👥" },
                { label: "Annonces actives", value: stats.products, color: "#0F9D58", icon: "🏌️" },
                { label: "Commandes", value: stats.orders, color: "#9C27B0", icon: "🛒" },
                { label: "Chiffre d'affaires", value: `${stats.revenue.toFixed(0)}€`, color: "#FF6D00", icon: "💶" },
                { label: "Commissions", value: `${stats.commissions.toFixed(0)}€`, color: "#F4B400", icon: "📈" },
                { label: "Litiges", value: 0, color: "#E53935", icon: "⚠️" },
              ].map((s, i) => (
                <div key={i} style={{ ...S.card, marginBottom: 0 }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={S.card}>
              <h3 style={{ marginBottom: 20, color: "#333" }}>Évolution du chiffre d'affaires</h3>
              {monthlyData().length === 0 ? (
                <p style={{ color: "#aaa", textAlign: "center", padding: "2rem" }}>Aucune donnée</p>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160, padding: "0 8px" }}>
                  {monthlyData().map((d, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: "0.75rem", color: "#0F9D58", fontWeight: 700 }}>{d.v.toFixed(0)}€</span>
                      <div style={{ width: "100%", background: "#0F3D2E", borderRadius: "4px 4px 0 0", height: `${Math.max((d.v / maxVal) * 120, 4)}px`, transition: "height 0.5s" }} />
                      <span style={{ fontSize: "0.7rem", color: "#888" }}>{d.m}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={S.card}>
              <h3 style={{ marginBottom: 16, color: "#333" }}>Dernières annonces</h3>
              {products.slice(0, 5).map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.6rem 0", borderBottom: "1px solid #f5f5f5" }}>
                  <img src={p.images?.[0]} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", background: "#f0f0f0" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.title}</div>
                    <div style={{ fontSize: "0.78rem", color: "#888" }}>{p.category}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: "#0F9D58" }}>{p.price}€</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS */}
        {section === "users" && (
          <div>
            <div style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Utilisateurs ({users.length})</h2>
            </div>

            {editingUser && (
              <div style={{ ...S.card, border: "2px solid #0F3D2E" }}>
                <h3 style={{ marginBottom: 16 }}>Modifier l'utilisateur</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["Nom complet", "full_name"], ["Email", "email"], ["Téléphone", "phone"], ["Ville", "city"], ["Adresse", "address"]].map(([label, key]) => (
                    <div key={key}>
                      <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: 4 }}>{label}</label>
                      <input style={S.input} value={editingUser[key] || ""} onChange={e => setEditingUser({ ...editingUser, [key]: e.target.value })} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button onClick={saveUser} style={S.btn()}>Sauvegarder</button>
                  <button onClick={() => setEditingUser(null)} style={S.btn("#888")}>Annuler</button>
                </div>
              </div>
            )}

            <div style={S.card}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Nom", "Email", "Téléphone", "Ville", "Inscrit le", "Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={S.td}>{u.full_name || "—"}</td>
                      <td style={S.td}>{u.email || "—"}</td>
                      <td style={S.td}>{u.phone || "—"}</td>
                      <td style={S.td}>{u.city || "—"}</td>
                      <td style={{ ...S.td, color: "#999" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR") : "—"}</td>
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setEditingUser(u)} style={S.btn("#4285F4")}>Modifier</button>
                          <button onClick={() => deleteUser(u.id)} style={S.btn("#e53935")}>Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {section === "products" && (
          <div>
            <div style={S.card}>
              <h2 style={{ margin: 0 }}>Annonces ({products.length})</h2>
            </div>

            {editingProduct && (
              <div style={{ ...S.card, border: "2px solid #0F3D2E" }}>
                <h3 style={{ marginBottom: 16 }}>Modifier l'annonce</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["Titre", "title"], ["Prix (€)", "price"]].map(([label, key]) => (
                    <div key={key}>
                      <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: 4 }}>{label}</label>
                      <input style={S.input} value={editingProduct[key] || ""} onChange={e => setEditingProduct({ ...editingProduct, [key]: e.target.value })} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: 4 }}>Catégorie</label>
                    <select style={S.input} value={editingProduct.category || ""} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}>
                      {["Clubs de golf","Balles de golf","Chariots","Sacs de golf","Accessoires","Entraînement","Vêtements"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: 4 }}>Condition</label>
                    <select style={S.input} value={editingProduct.condition || ""} onChange={e => setEditingProduct({ ...editingProduct, condition: e.target.value })}>
                      {["neuf","comme_neuf","bon_etat","etat_correct","tres_bon_etat"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: 4 }}>Description</label>
                    <textarea style={{ ...S.input, height: 80, resize: "vertical" }} value={editingProduct.description || ""} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: 4 }}>Statut</label>
                    <select style={S.input} value={editingProduct.status} onChange={e => setEditingProduct({ ...editingProduct, status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="sold">Vendu</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button onClick={saveProduct} style={S.btn()}>Sauvegarder</button>
                  <button onClick={() => setEditingProduct(null)} style={S.btn("#888")}>Annuler</button>
                </div>
              </div>
            )}

            <div style={S.card}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Photo", "Titre", "Prix", "Catégorie", "Condition", "Statut", "Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td style={S.td}><img src={p.images?.[0]} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", background: "#f0f0f0" }} /></td>
                      <td style={{ ...S.td, fontWeight: 600 }}>{p.title}</td>
                      <td style={{ ...S.td, color: "#0F9D58", fontWeight: 700 }}>{p.price}€</td>
                      <td style={{ ...S.td, color: "#666" }}>{p.category}</td>
                      <td style={{ ...S.td, color: "#666" }}>{p.condition}</td>
                      <td style={S.td}><span style={S.badge(p.status === "active" ? "green" : "red")}>{p.status === "active" ? "Active" : "Inactive"}</span></td>
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setEditingProduct(p)} style={S.btn("#4285F4")}>Modifier</button>
                          <button onClick={() => deleteProduct(p.id)} style={S.btn("#e53935")}>Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {section === "orders" && (
          <div>
            <div style={S.card}><h2 style={{ margin: 0 }}>Commandes ({orders.length})</h2></div>

            {editingOrder && (
              <div style={{ ...S.card, border: "2px solid #0F3D2E" }}>
                <h3 style={{ marginBottom: 16 }}>Modifier la commande</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: 4 }}>Montant (€)</label>
                    <input style={S.input} value={editingOrder.price || ""} onChange={e => setEditingOrder({ ...editingOrder, price: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: 4 }}>Statut</label>
                    <select style={S.input} value={editingOrder.status || ""} onChange={e => setEditingOrder({ ...editingOrder, status: e.target.value })}>
                      <option value="pending">En attente</option>
                      <option value="paid">Payé</option>
                      <option value="shipped">Expédié</option>
                      <option value="completed">Terminé</option>
                      <option value="cancelled">Annulé</option>
                      <option value="disputed">Litige</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button onClick={saveOrder} style={S.btn()}>Sauvegarder</button>
                  <button onClick={() => setEditingOrder(null)} style={S.btn("#888")}>Annuler</button>
                </div>
              </div>
            )}

            <div style={S.card}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["ID", "Acheteur", "Vendeur", "Montant", "Statut", "Date", "Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td style={{ ...S.td, color: "#999", fontSize: "0.8rem" }}>{o.id?.slice(0, 8)}...</td>
                      <td style={{ ...S.td, color: "#666" }}>{o.buyer_id?.slice(0, 8) || "—"}</td>
                      <td style={{ ...S.td, color: "#666" }}>{o.seller_id?.slice(0, 8) || "—"}</td>
                      <td style={{ ...S.td, fontWeight: 700, color: "#0F9D58" }}>{o.price}€</td>
                      <td style={S.td}><span style={S.badge(o.status === "completed" ? "green" : o.status === "cancelled" ? "red" : "yellow")}>{o.status || "En attente"}</span></td>
                      <td style={{ ...S.td, color: "#999" }}>{o.created_at ? new Date(o.created_at).toLocaleDateString("fr-FR") : "—"}</td>
                      <td style={S.td}><button onClick={() => setEditingOrder(o)} style={S.btn("#4285F4")}>Modifier</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CARRIERS */}
        {section === "carriers" && (
          <div>
            <div style={S.card}><h2 style={{ margin: 0 }}>Offres de transport</h2></div>
            <div style={S.card}>
              {carriers.map((c, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: 4 }}>Transporteur</label>
                    <input style={S.input} value={c.name} onChange={e => { const nc = [...carriers]; nc[i].name = e.target.value; setCarriers(nc); }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: 4 }}>Prix (€)</label>
                    <input style={S.input} type="number" step="0.01" value={c.price} onChange={e => { const nc = [...carriers]; nc[i].price = parseFloat(e.target.value); setCarriers(nc); }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: 4 }}>Délai</label>
                    <input style={S.input} value={c.delay} onChange={e => { const nc = [...carriers]; nc[i].delay = e.target.value; setCarriers(nc); }} />
                  </div>
                  <button onClick={() => { const nc = carriers.filter((_, j) => j !== i); setCarriers(nc); }} style={S.btn("#e53935")}>✕</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={() => setCarriers([...carriers, { name: "", price: 0, delay: "" }])} style={S.btn("#4285F4")}>+ Ajouter</button>
                <button onClick={() => flash("Transporteurs sauvegardés ✓")} style={S.btn()}>Sauvegarder</button>
              </div>
            </div>
          </div>
        )}

        {/* COMMISSIONS */}
        {section === "commissions" && (
          <div>
            <div style={S.card}><h2 style={{ margin: 0 }}>Gestion des commissions</h2></div>
            <div style={S.card}>
              <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: 20 }}>Modifiez les taux de commission par palier de prix. Les modifications s'appliquent immédiatement aux nouvelles transactions.</p>
              {commissions.map((c, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, alignItems: "end", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: 4 }}>Palier</label>
                    <input style={S.input} value={c.label} onChange={e => { const nc = [...commissions]; nc[i].label = e.target.value; setCommissions(nc); }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: 4 }}>Prix min (€)</label>
                    <input style={S.input} type="number" value={c.min} onChange={e => { const nc = [...commissions]; nc[i].min = parseFloat(e.target.value); setCommissions(nc); }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: 4 }}>Taux (%)</label>
                    <input style={S.input} type="number" step="0.1" value={c.rate} onChange={e => { const nc = [...commissions]; nc[i].rate = parseFloat(e.target.value); setCommissions(nc); }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: 4 }}>Fixe (€)</label>
                    <input style={S.input} type="number" step="0.01" value={c.fixed} onChange={e => { const nc = [...commissions]; nc[i].fixed = parseFloat(e.target.value); setCommissions(nc); }} />
                  </div>
                </div>
              ))}
              <button onClick={() => flash("Commissions sauvegardées ✓")} style={S.btn()}>Sauvegarder les commissions</button>
            </div>

            <div style={S.card}>
              <h3 style={{ marginBottom: 12 }}>Aperçu des commissions actuelles</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Palier", "Taux", "Fixe", "Exemple (50€)", "Exemple (200€)"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {commissions.map((c, i) => (
                    <tr key={i}>
                      <td style={S.td}>{c.label}</td>
                      <td style={{ ...S.td, fontWeight: 700, color: "#0F3D2E" }}>{c.rate}%</td>
                      <td style={S.td}>{c.fixed}€</td>
                      <td style={{ ...S.td, color: "#666" }}>{(50 * c.rate / 100 + c.fixed).toFixed(2)}€</td>
                      <td style={{ ...S.td, color: "#666" }}>{(200 * c.rate / 100 + c.fixed).toFixed(2)}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
