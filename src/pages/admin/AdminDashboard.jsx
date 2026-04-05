import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Package, ShoppingBag, Euro, AlertTriangle, TrendingUp, Eye, Trash2, CheckCircle, XCircle } from "lucide-react";

const ADMIN_PASSWORD = "swingadmin2024";

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [section, setSection] = useState("overview");
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0, commissions: 0 });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (sessionStorage.getItem("admin_authed")) setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadData();
  }, [authed]);

  const loadData = async () => {
    const [{ count: uc }, { count: pc }, { count: oc }, { data: orderData }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("price, commission"),
    ]);
    const revenue = orderData?.reduce((s, o) => s + (o.price || 0), 0) || 0;
    const commissions = orderData?.reduce((s, o) => s + (o.commission || 0), 0) || 0;
    setStats({ users: uc || 0, products: pc || 0, orders: oc || 0, revenue, commissions });

    const [{ data: u }, { data: p }, { data: o }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("products").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    setUsers(u || []);
    setProducts(p || []);
    setOrders(o || []);
  };

  const deleteProduct = async (id) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    await supabase.from("products").update({ status: "inactive" }).eq("id", id);
    loadData();
  };

  const login = () => {
    if (pwd === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_authed", "1");
      setAuthed(true);
    } else {
      setError("Mot de passe incorrect");
    }
  };

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "#0F3D2E", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: 16, padding: "2.5rem", width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏌️</div>
          <h1 style={{ fontWeight: 800, fontSize: "1.4rem", color: "#0F3D2E" }}>Administration SwingMarket</h1>
          <p style={{ color: "#888", fontSize: "0.9rem", marginTop: 4 }}>Accès réservé</p>
        </div>
        <input
          type="password"
          placeholder="Mot de passe"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          style={{ width: "100%", padding: "0.8rem", borderRadius: 8, border: "1.5px solid #ddd", fontSize: "0.95rem", marginBottom: "0.75rem", boxSizing: "border-box" }}
        />
        {error && <p style={{ color: "red", fontSize: "0.85rem", marginBottom: "0.5rem" }}>{error}</p>}
        <button onClick={login} style={{ width: "100%", padding: "0.85rem", background: "#0F3D2E", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}>
          Se connecter
        </button>
      </div>
    </div>
  );

  const nav = [
    { id: "overview", label: "Vue globale", icon: "📊" },
    { id: "users", label: "Utilisateurs", icon: "👥" },
    { id: "products", label: "Annonces", icon: "🏌️" },
    { id: "orders", label: "Commandes", icon: "🛒" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0F3D2E", color: "white", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "6px 10px", fontSize: 20 }}>🏌️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Administration SwingMarket</div>
            <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Tableau de bord administrateur</div>
          </div>
        </div>
        <button onClick={() => { sessionStorage.removeItem("admin_authed"); setAuthed(false); }}
          style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", padding: "0.5rem 1rem", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem" }}>
          Déconnexion
        </button>
      </div>

      {/* Nav */}
      <div style={{ background: "white", borderBottom: "1px solid #eee", padding: "0 2rem", display: "flex", gap: 4 }}>
        {nav.map(n => (
          <button key={n.id} onClick={() => setSection(n.id)} style={{
            padding: "1rem 1.25rem", border: "none", background: "none", cursor: "pointer",
            borderBottom: section === n.id ? "3px solid #0F3D2E" : "3px solid transparent",
            color: section === n.id ? "#0F3D2E" : "#666",
            fontWeight: section === n.id ? 700 : 500, fontSize: "0.9rem",
          }}>
            {n.icon} {n.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
        {/* Overview */}
        {section === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Utilisateurs", value: stats.users, color: "#4285F4", icon: "👥" },
                { label: "Annonces actives", value: stats.products, color: "#0F9D58", icon: "🏌️" },
                { label: "Commandes", value: stats.orders, color: "#9C27B0", icon: "🛒" },
                { label: "Chiffre d'affaires", value: `${stats.revenue.toFixed(0)}€`, color: "#FF6D00", icon: "💶" },
                { label: "Commissions", value: `${stats.commissions.toFixed(0)}€`, color: "#F4B400", icon: "📈" },
                { label: "Litiges ouverts", value: 0, color: "#E53935", icon: "⚠️" },
              ].map((s, i) => (
                <div key={i} style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "white", borderRadius: 12, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h3 style={{ marginBottom: 16, color: "#333" }}>Dernières annonces</h3>
              {products.slice(0, 5).map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.75rem 0", borderBottom: "1px solid #f0f0f0" }}>
                  <img src={p.images?.[0]} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", background: "#f0f0f0" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.title}</div>
                    <div style={{ fontSize: "0.8rem", color: "#888" }}>{p.category}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: "#0F9D58" }}>{p.price}€</div>
                  <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: "0.75rem", background: p.status === "active" ? "#e8f5e9" : "#fafafa", color: p.status === "active" ? "#0F9D58" : "#999" }}>
                    {p.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {section === "users" && (
          <div style={{ background: "white", borderRadius: 12, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h2 style={{ marginBottom: 16 }}>Utilisateurs ({users.length})</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                  {["Nom", "Email", "Inscrit le", "Statut"].map(h => (
                    <th key={h} style={{ padding: "0.75rem", textAlign: "left", color: "#888", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                    <td style={{ padding: "0.75rem" }}>{u.full_name || "—"}</td>
                    <td style={{ padding: "0.75rem", color: "#666" }}>{u.email || "—"}</td>
                    <td style={{ padding: "0.75rem", color: "#999" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR") : "—"}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: "0.75rem", background: "#e8f5e9", color: "#0F9D58" }}>Actif</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Products */}
        {section === "products" && (
          <div style={{ background: "white", borderRadius: 12, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h2 style={{ marginBottom: 16 }}>Annonces ({products.length})</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                  {["Photo", "Titre", "Prix", "Catégorie", "Statut", "Actions"].map(h => (
                    <th key={h} style={{ padding: "0.75rem", textAlign: "left", color: "#888", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                    <td style={{ padding: "0.75rem" }}>
                      <img src={p.images?.[0]} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", background: "#f0f0f0" }} />
                    </td>
                    <td style={{ padding: "0.75rem", fontWeight: 600 }}>{p.title}</td>
                    <td style={{ padding: "0.75rem", color: "#0F9D58", fontWeight: 700 }}>{p.price}€</td>
                    <td style={{ padding: "0.75rem", color: "#666" }}>{p.category}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: "0.75rem", background: p.status === "active" ? "#e8f5e9" : "#fafafa", color: p.status === "active" ? "#0F9D58" : "#999" }}>
                        {p.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <button onClick={() => deleteProduct(p.id)} style={{ background: "#ffebee", border: "none", color: "#e53935", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem" }}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders */}
        {section === "orders" && (
          <div style={{ background: "white", borderRadius: 12, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h2 style={{ marginBottom: 16 }}>Commandes ({orders.length})</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                  {["ID", "Montant", "Statut", "Date"].map(h => (
                    <th key={h} style={{ padding: "0.75rem", textAlign: "left", color: "#888", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                    <td style={{ padding: "0.75rem", color: "#999", fontSize: "0.8rem" }}>{o.id?.slice(0, 8)}...</td>
                    <td style={{ padding: "0.75rem", fontWeight: 700, color: "#0F9D58" }}>{o.price}€</td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: "0.75rem", background: o.status === "completed" ? "#e8f5e9" : "#fff8e1", color: o.status === "completed" ? "#0F9D58" : "#F4B400" }}>
                        {o.status || "En attente"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", color: "#999" }}>{o.created_at ? new Date(o.created_at).toLocaleDateString("fr-FR") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
