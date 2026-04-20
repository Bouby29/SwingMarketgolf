import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import AccountInfoSection from "../components/dashboard/AccountInfoSection";
import AddressesSection from "../components/dashboard/AddressesSection";
import SellerProfileSection from "../components/dashboard/SellerProfileSection";
import ShippingOptionsSection from "../components/dashboard/ShippingOptionsSection";
import VacationModeSection from "../components/dashboard/VacationModeSection";
import WalletSection from "../components/dashboard/WalletSection";
import StripeKYCSection from "../components/dashboard/StripeKYCSection";
import BankAccountsSection from "../components/dashboard/BankAccountsSection";
import LegalDocumentsSection from "../components/dashboard/LegalDocumentsSection";
import MyAuctionsSection from "../components/dashboard/MyAuctionsSection";
import EditProductModal from "../components/dashboard/EditProductModal";
import SellerOrderCard from "../components/orders/SellerOrderCard";
import BuyerOrderCard from "../components/orders/BuyerOrderCard";

const NAV = [
  { group: "Mon Compte", items: [
    { id: "info", label: "Informations", icon: "👤" },
    { id: "addresses", label: "Adresses", icon: "📍" },
    { id: "subscription", label: "Mon abonnement", icon: "⭐", proOnly: true },
  ]},
  { group: "Espace Vendeur", items: [
    { id: "sell", label: "Vendre un produit", icon: "➕" },
    { id: "seller-profile", label: "Mon profil", icon: "🏪" },
    { id: "products", label: "Gérer mes produits", icon: "📦" },
    { id: "auctions", label: "Mes enchères", icon: "🔨" },
    { id: "sales", label: "Mes ventes", icon: "💰" },
    { id: "shipping", label: "Options d envoi", icon: "🚚" },
    { id: "vacation", label: "Mode vacances", icon: "🌴" },
  ]},
  { group: "Porte-monnaie", items: [
    { id: "wallet", label: "Mon porte-monnaie", icon: "💵" },
    { id: "stripe-kyc", label: "Stripe / KYC", icon: "🔐" },
    { id: "bank", label: "Comptes bancaires", icon: "🏦" },
    { id: "legal", label: "Documents légaux", icon: "📄" },
  ]},
  { group: "Messagerie", items: [
    { id: "messages", label: "Ma messagerie", icon: "💬" },
  ]},
  { group: "Mes recherches", items: [
    { id: "my-searches", label: "Mes recherches", icon: "🔍" },
  ]},
];

const PLAN_CONFIG = {
  basique: { label: "Basique", color: "#888", bg: "#f5f5f5", accent: "#888", icon: "🎯", limit: 5 },
  pro: { label: "Pro", color: "#1565c0", bg: "#e3f2fd", accent: "#1565c0", icon: "💎", limit: 30 },
  premium: { label: "Premium", color: "#C5A028", bg: "#fff8e1", accent: "#C5A028", icon: "⭐", limit: 999 },
  business: { label: "Business", color: "#C5A028", bg: "#2a1a00", accent: "#C5A028", icon: "🏆", limit: 999 },
};

const styles = `
  @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap");
  
  .dash-root { display: flex; min-height: 100vh; background: #f0f2f5; font-family: "DM Sans", sans-serif; }
  
  .dash-sidebar {
    width: 260px; background: #1a2e1c;
    position: fixed; top: 0; left: 0; height: 100vh;
    overflow-y: auto; z-index: 100;
    display: flex; flex-direction: column;
    border-right: 1px solid rgba(197,160,40,0.15);
  }
  
  .dash-sidebar-header {
    padding: 1.5rem 1.25rem 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  
  .dash-logo { font-family: "Playfair Display", serif; font-weight: 800; font-size: 1.1rem; color: #C5A028; letter-spacing: -0.02em; text-decoration: none; }
  
  .dash-user-card {
    margin-top: 1rem; padding: 0.85rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    display: flex; align-items: center; gap: 10px;
  }
  
  .dash-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: linear-gradient(135deg, #1B5E20, #C5A028);
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 800; font-size: 0.95rem;
    flex-shrink: 0;
  }
  
  .dash-user-name { font-weight: 700; font-size: 0.82rem; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
  .dash-user-email { font-size: 0.68rem; color: rgba(255,255,255,0.65); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
  
  .dash-plan-badge {
    display: inline-flex; align-items: center; gap: 4px;
    margin-top: 0.6rem; padding: 3px 10px;
    background: rgba(197,160,40,0.12);
    border: 1px solid rgba(197,160,40,0.3);
    border-radius: 20px; font-size: 0.7rem; font-weight: 700; color: #C5A028;
  }
  
  .dash-nav { flex: 1; padding: 0.5rem 0; }
  
  .dash-nav-group { font-size: 0.62rem; font-weight: 700; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1.5px; padding: 0.75rem 1.25rem 0.3rem; }
  
  .dash-nav-btn {
    width: 100%; display: flex; align-items: center; gap: 9px;
    padding: 0.52rem 1.25rem; border: none; cursor: pointer;
    background: transparent; color: rgba(255,255,255,0.85);
    font-weight: 500; font-size: 0.83rem; text-align: left;
    border-left: 2px solid transparent;
    transition: all 0.15s; font-family: "DM Sans", sans-serif;
  }
  
  .dash-nav-btn:hover { background: rgba(255,255,255,0.08); color: white; }
  
  .dash-nav-btn.active {
    background: rgba(27,94,32,0.25);
    color: #7fcf8a;
    border-left-color: #1B5E20;
    font-weight: 700;
  }
  
  .dash-nav-icon { font-size: 0.9rem; flex-shrink: 0; }
  
  .dash-logout {
    padding: 1rem 1.25rem;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  
  .dash-logout-btn {
    width: 100%; background: rgba(220,38,38,0.1); color: #f87171;
    border: 1px solid rgba(220,38,38,0.2); border-radius: 8px;
    padding: 0.5rem; cursor: pointer; font-weight: 600; font-size: 0.82rem;
    font-family: "DM Sans", sans-serif; transition: all 0.15s;
  }
  .dash-logout-btn:hover { background: rgba(220,38,38,0.2); }
  
  .dash-main { margin-left: 260px; flex: 1; padding: 2rem 2.5rem; min-height: 100vh; }
  
  .dash-page-title { font-family: "Playfair Display", serif; font-size: 1.8rem; font-weight: 800; color: #0d1f0f; margin: 0 0 1.5rem; }
  
  .dash-card {
    background: white; border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    overflow: hidden;
  }
  
  .dash-stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  
  .dash-stat-card {
    background: white; border-radius: 14px; padding: 1.25rem;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    border-bottom: 3px solid;
  }
  
  .dash-product-row {
    display: flex; align-items: center; gap: 12px; padding: 0.9rem 1.25rem;
    border-bottom: 1px solid #f5f5f5; transition: background 0.1s;
  }
  .dash-product-row:last-child { border-bottom: none; }
  .dash-product-row:hover { background: #fafafa; }
  
  .dash-product-img { width: 52px; height: 52px; border-radius: 10px; object-fit: cover; flex-shrink: 0; background: #f0f0f0; }
  
  .dash-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
  
  .dash-btn-icon { border: none; border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 0.82rem; font-weight: 600; font-family: "DM Sans", sans-serif; transition: all 0.15s; }
  
  .dash-subscription-hero {
    background: linear-gradient(135deg, #0d1f0f 0%, #1B5E20 50%, #2d4a1e 100%);
    border-radius: 20px; padding: 2rem; color: white; position: relative; overflow: hidden;
    margin-bottom: 20px;
  }
  .dash-subscription-hero::before {
    content: ""; position: absolute; top: -40px; right: -40px;
    width: 200px; height: 200px; border-radius: 50%;
    background: rgba(197,160,40,0.1); pointer-events: none;
  }
  
  .dash-upgrade-card {
    background: linear-gradient(135deg, #C5A028, #e8b830);
    border-radius: 16px; padding: 1.5rem; color: white; text-align: center;
    margin-top: 16px;
  }
  
  .dash-empty { text-align: center; padding: 3rem 2rem; }
  .dash-empty-icon { font-size: 3rem; margin-bottom: 12px; }
  .dash-empty-title { font-weight: 700; font-size: 1rem; color: #333; margin-bottom: 6px; }
  .dash-empty-sub { color: #888; font-size: 0.85rem; }
  
  input, textarea, select {
    color: #1a2332 !important;
  }
  input::placeholder, textarea::placeholder {
    color: #9ca3af !important;
  }
  @media (max-width: 768px) {
    .dash-root { display: block; overflow-x: hidden; }
    .dash-sidebar { transform: translateX(-100%); transition: transform 0.3s; z-index: 200; width: 280px; }
    .dash-sidebar.open { transform: translateX(0); box-shadow: 4px 0 20px rgba(0,0,0,0.3); }
    .dash-main { margin-left: 0 !important; padding: 1rem; padding-top: 0; overflow-x: hidden; max-width: 100vw; }
    .dash-stat-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .dash-page-title { font-size: 1.3rem !important; }
    .dash-mobile-header { display: flex !important; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 10; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
  }
`;


const CATEGORIES = ["Clubs de golf", "Balles de golf", "Chariots", "Sacs de golf", "Accessoires", "Entrainement", "Vetements"];
const BUDGETS = ["Moins de 100 EUR", "100 - 300 EUR", "300 - 500 EUR", "500 - 1000 EUR", "Plus de 1000 EUR"];

function MySearchesSection({ user }) {
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(null);
  const [editForm, setEditForm] = React.useState({});
  const [saving, setSaving] = React.useState(false);

  const load = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("search_requests")
        .select("*")
        .eq("email", user.email)
        .order("created_at", { ascending: false });
      if (!error) setRequests(data || []);
    } catch(e) { console.error("search_requests load error:", e); }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette recherche ?")) return;
    try {
      const { error } = await supabase.from("search_requests").delete().eq("id", id);
      if (!error) setRequests(prev => prev.filter(r => r.id !== id));
      else alert("Erreur lors de la suppression. Reessaie.");
    } catch(e) { console.error("delete error:", e); }
  };

  const handleEdit = (req) => {
    setEditing(req.id);
    setEditForm({ title: req.title, category: req.category, description: req.description || "", budget: req.budget || "" });
  };

  const handleSave = async (id) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("search_requests").update(editForm).eq("id", id);
      if (!error) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, ...editForm } : r));
        setEditing(null);
      } else alert("Erreur lors de la sauvegarde. Reessaie.");
    } catch(e) { console.error("update error:", e); }
    setSaving(false);
  };

  const timeAgo = (d) => {
    const days = Math.floor((Date.now() - new Date(d)) / 86400000);
    if (days === 0) return "Aujourd hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} j`;
    return `Il y a ${Math.floor(days/7)} sem`;
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#1a2332", margin: 0 }}>Mes recherches</h2>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: "4px 0 0" }}>{requests.length} recherche(s) active(s)</p>
        </div>
        <a href="/SearchRequest" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1B5E20", color: "white", padding: "0.65rem 1.25rem", borderRadius: 50, fontWeight: 700, fontSize: "0.85rem", textDecoration: "none" }}>
          + Nouvelle recherche
        </a>
      </div>

      {loading && <div style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>Chargement...</div>}

      {!loading && requests.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔍</div>
          <p style={{ color: "#6b7280", fontWeight: 600, marginBottom: 16 }}>Aucune recherche pour l instant.</p>
          <a href="/SearchRequest" style={{ background: "#1B5E20", color: "white", padding: "0.75rem 1.5rem", borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>
            Poster ma premiere recherche →
          </a>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {requests.map(req => (
          <div key={req.id} style={{ background: "white", borderRadius: 14, padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
            {editing === req.id ? (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Categorie</label>
                    <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}
                      style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: "0.85rem", color: "#1a2332", background: "white" }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Budget</label>
                    <select value={editForm.budget} onChange={e => setEditForm({...editForm, budget: e.target.value})}
                      style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: "0.85rem", color: "#1a2332", background: "white" }}>
                      <option value="">Aucun</option>
                      {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Ce que tu recherches</label>
                  <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: "0.85rem", color: "#1a2332", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Description</label>
                  <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}
                    rows={2} style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: "0.85rem", color: "#1a2332", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleSave(req.id)} disabled={saving} style={{ flex: 1, padding: "0.65rem", borderRadius: 50, border: "none", background: "#1B5E20", color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                    {saving ? "Sauvegarde..." : "✓ Sauvegarder"}
                  </button>
                  <button onClick={() => setEditing(null)} style={{ padding: "0.65rem 1.1rem", borderRadius: 50, border: "1.5px solid #e5e7eb", background: "white", color: "#6b7280", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a2332", marginBottom: 4 }}>{req.title}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: req.description ? 6 : 0 }}>
                    <span style={{ fontSize: "0.75rem", background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 20, padding: "0.15rem 0.6rem", fontWeight: 600 }}>{req.category}</span>
                    {req.budget && <span style={{ fontSize: "0.75rem", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", borderRadius: 20, padding: "0.15rem 0.6rem", fontWeight: 600 }}>💶 {req.budget}</span>}
                    <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{timeAgo(req.created_at)}</span>
                  </div>
                  {req.description && <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: 0, lineHeight: 1.5 }}>{req.description}</p>}
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => handleEdit(req)} style={{ padding: "0.5rem 1rem", borderRadius: 50, border: "1.5px solid #1B5E20", background: "white", color: "#1B5E20", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
                    ✏️ Modifier
                  </button>
                  <button onClick={() => handleDelete(req.id)} style={{ padding: "0.5rem 1rem", borderRadius: 50, border: "1.5px solid #ef4444", background: "white", color: "#ef4444", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [section, setSection] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate("/Login"); return; }
      setUser(user);
      loadProfile(user.id);
      loadProducts(user.id);
      loadOrders(user.id);
    });
  }, []);

  const loadProfile = async (uid) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    setProfile(data);
  };
  const loadProducts = async (uid) => {
    const { data } = await supabase.from("products").select("*").eq("seller_id", uid).order("created_at", { ascending: false });
    setProducts(data || []);
  };
  const loadOrders = async (uid) => {
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from("orders").select("*").eq("seller_id", uid).order("created_at", { ascending: false }),
      supabase.from("orders").select("*").eq("buyer_id", uid).order("created_at", { ascending: false }),
    ]);
    setSales(s || []);
    setPurchases(p || []);
  };
  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };
  const deleteProduct = async (id) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    await supabase.from("products").delete().eq("id", id);
    loadProducts(user.id);
  };

  const plan = profile?.plan || "basique";
  const planCfg = PLAN_CONFIG[plan] || PLAN_CONFIG.basique;
  const annCount = profile?.plan_annonces_count || 0;

  const sectionTitle = NAV.flatMap(g => g.items).find(i => i.id === section)?.label || "";

  const renderSection = () => {
    switch (section) {
      case "info": return <AccountInfoSection user={user} profile={profile} onUpdate={() => loadProfile(user?.id)} />;
      case "addresses": return <AddressesSection user={user} />;
      case "subscription": return (
        <div>
          {!profile?.is_pro && (
            <div style={{padding:"2rem",background:"white",borderRadius:16,border:"1px solid #e5e7eb",marginBottom:20}}>
              <div style={{textAlign:"center",marginBottom:24}}>
                <div style={{fontSize:"3rem",marginBottom:12}}>🎯</div>
                <div style={{fontFamily:"Playfair Display, serif",fontSize:"1.4rem",fontWeight:800,color:"#1a2332",marginBottom:8}}>Vous êtes vendeur particulier</div>
                <p style={{color:"#6b7280",fontSize:"0.9rem",maxWidth:400,margin:"0 auto"}}>
                  Les abonnements Pro sont pour les vendeurs professionnels. En tant que particulier, vous publiez gratuitement jusqu&#39;à 5 annonces par mois.
                </p>
              </div>
              <div style={{background:"#f0f7f0",borderRadius:12,padding:"1.25rem",marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:"0.85rem",color:"#374151",fontWeight:600}}>
                  <span>Annonces ce mois</span>
                  <span style={{color:"#1B5E20"}}>{annCount} / 5</span>
                </div>
                <div style={{background:"#d1fae5",borderRadius:20,height:8,overflow:"hidden"}}>
                  <div style={{background:"#1B5E20",height:"100%",borderRadius:20,width:`${Math.min(100,(annCount/5)*100)}%`,transition:"width 0.4s"}} />
                </div>
              </div>
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:"0.85rem",color:"#6b7280",marginBottom:12}}>Vendez régulièrement ? Passez Pro pour plus de visibilité.</p>
                <Link to="/Abonnements" style={{background:"#C5A028",color:"white",padding:"0.75rem 2rem",borderRadius:50,fontWeight:800,textDecoration:"none",fontSize:"0.9rem",display:"inline-block"}}>
                  Voir les offres Pro &#8594;
                </Link>
              </div>
            </div>
          )}
          {profile?.is_pro && (
            <div>
              <div className="dash-subscription-hero">
                <div style={{position:"relative",zIndex:1}}>
                  <div style={{fontSize:"2.5rem",marginBottom:8}}>{planCfg.icon}</div>
                  <div style={{fontFamily:"Playfair Display, serif",fontSize:"1.6rem",fontWeight:800,marginBottom:4}}>Plan {planCfg.label}</div>
                  <div style={{opacity:0.75,fontSize:"0.9rem"}}>{plan==="pro"?"30 annonces / mois":"Annonces illimitées"}</div>
                  {plan==="pro" && (
                    <div style={{marginTop:16}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:"0.8rem",opacity:0.8}}>
                        <span>Annonces utilisées</span>
                        <span style={{fontWeight:700}}>{annCount} / {planCfg.limit}</span>
                      </div>
                      <div style={{background:"rgba(255,255,255,0.15)",borderRadius:20,height:8,overflow:"hidden"}}>
                        <div style={{background:"white",height:"100%",borderRadius:20,width:`${Math.min(100,(annCount/planCfg.limit)*100)}%`,transition:"width 0.4s"}} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="dash-upgrade-card">
                <div style={{fontFamily:"Playfair Display, serif",fontSize:"1.1rem",fontWeight:800,marginBottom:8}}>Gérer mon abonnement</div>
                <p style={{opacity:0.9,fontSize:"0.88rem",marginBottom:16}}>Modifier ou upgrader votre abonnement Pro.</p>
                <Link to="/Abonnements" style={{background:"white",color:"#C5A028",padding:"0.65rem 2rem",borderRadius:50,fontWeight:800,textDecoration:"none",fontSize:"0.9rem",display:"inline-block"}}>
                  Gérer &#8594;
                </Link>
              </div>
            </div>
          )}
        </div>
      );
      case "sell": navigate("/CreateListing"); return null;
      case "seller-profile": return <SellerProfileSection user={user} profile={profile} onUpdate={() => loadProfile(user?.id)} />;

      case "products": return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div className="dash-page-title" style={{ margin: 0 }}>Mes annonces</div>
              <div style={{ color: "#888", fontSize: "0.85rem" }}>{products.length} produit(s) publié(s)</div>
            </div>
            <Link to="/CreateListing" style={{ background: "#1B5E20", color: "white", padding: "0.6rem 1.25rem", borderRadius: 10, fontWeight: 700, textDecoration: "none", fontSize: "0.85rem" }}>+ Nouvelle annonce</Link>
          </div>
          {products.length === 0 ? (
            <div className="dash-card"><div className="dash-empty">
              <div className="dash-empty-icon">📦</div>
              <div className="dash-empty-title">Aucune annonce</div>
              <div className="dash-empty-sub">Publiez votre premier article dès maintenant</div>
              <Link to="/CreateListing" style={{ color: "#1B5E20", fontWeight: 700, fontSize: "0.85rem", marginTop: 12, display: "inline-block" }}>Créer une annonce →</Link>
            </div></div>
          ) : (
            <div className="dash-card">
              {products.map(p => (
                <div key={p.id} className="dash-product-row">
                  {p.images?.[0]
                    ? <img src={p.images[0]} className="dash-product-img" />
                    : <div className="dash-product-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: "1.5rem" }}>⛳</div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1a2332", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                    <div style={{ color: "#1B5E20", fontWeight: 800, fontSize: "0.95rem" }}>{p.price} €</div>
                  </div>
                  <span className="dash-badge" style={{ background: p.status === "active" ? "#e8f5e9" : "#fff8e1", color: p.status === "active" ? "#2e7d32" : "#f57f17" }}>
                    {p.status === "active" ? "Actif" : p.status === "sold" ? "Vendu" : p.status}
                  </span>
                  <button className="dash-btn-icon" onClick={() => setEditingProduct(p)} style={{ background: "#f0f7ff", color: "#1565c0" }}>✏️ Modifier</button>
                  <button className="dash-btn-icon" onClick={() => deleteProduct(p.id)} style={{ background: "#ffebee", color: "#c62828" }}>🗑️</button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
      case "auctions": return <MyAuctionsSection myProducts={products} />;
      case "sales": return (
        <div>
          <div className="dash-stat-grid">
            {[
              { label: "Total ventes", value: sales.length, icon: "💰", color: "#1B5E20", sub: "commandes" },
              { label: "CA total", value: sales.reduce((s, o) => s + (o.price || 0), 0).toFixed(2) + " €", icon: "📈", color: "#1565c0", sub: "chiffre d affaires" },
              { label: "En attente", value: sales.filter(o => o.status === "pending").length, icon: "⏳", color: "#f57c00", sub: "à traiter" },
            ].map((s, i) => (
              <div key={i} className="dash-stat-card" style={{ borderBottomColor: s.color }}>
                <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#333", marginBottom: 2 }}>{s.label}</div>
                <div style={{ color: "#aaa", fontSize: "0.75rem" }}>{s.sub}</div>
              </div>
            ))}
          </div>
          {sales.length === 0 ? (
            <div className="dash-card"><div className="dash-empty">
              <div className="dash-empty-icon">💰</div>
              <div className="dash-empty-title">Aucune vente pour l instant</div>
              <div className="dash-empty-sub">Vos ventes apparaîtront ici</div>
            </div></div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {sales.map(o => <SellerOrderCard key={o.id} order={o} />)}
            </div>
          )}
        </div>
      );
      case "shipping": return <ShippingOptionsSection user={user} />;
      case "vacation": return <VacationModeSection user={user} profile={profile} onUpdate={() => loadProfile(user?.id)} />;
      
      case "wallet": return <WalletSection user={user} profile={profile} />;
      case "stripe-kyc": return <StripeKYCSection user={user} />;
      case "bank": return <BankAccountsSection user={user} />;
      case "legal": return <LegalDocumentsSection user={user} />;
case "messages": navigate("/Messages"); return null;
      case "my-searches": return <MySearchesSection user={user} />;
      default: return null;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="md:hidden" style={{minHeight:"100vh",background:"#F2F2F7"}}>
        <div style={{padding:"16px 20px 12px",fontSize:32,fontWeight:700,color:"#000"}}>Profil</div>
        <div style={{margin:"0 16px 12px",background:"#fff",borderRadius:16,padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:56,height:56,borderRadius:14,background:"#1B5E20",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" style={{width:56,height:56,borderRadius:14,objectFit:"cover"}} />
                : <span style={{fontSize:24,fontWeight:700,color:"#fff"}}>{(profile?.shop_name||profile?.full_name||user?.email||"U")[0].toUpperCase()}</span>
              }
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:17,fontWeight:600,color:"#000",marginBottom:2}}>{profile?.shop_name||profile?.full_name||user?.email}</div>
              <div style={{fontSize:13,color:"#888"}}>{user?.email}</div>
            </div>
            <button onClick={()=>setSection("info")} style={{background:"#F2F2F7",border:"none",borderRadius:8,padding:"6px 14px",fontSize:14,fontWeight:500,cursor:"pointer"}}>Modifier</button>
          </div>
        </div>
        <div style={{margin:"0 16px 16px",background:"#fff",borderRadius:16,padding:"14px 8px"}}>
          <div style={{display:"flex",justifyContent:"space-around"}}>
            <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:700}}>{profile?.sales_count||0}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>Ventes</div></div>
            <div style={{width:"0.5px",background:"#e0e0e0"}}></div>
            <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:700}}>{profile?.purchases_count||0}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>Achats</div></div>
            <div style={{width:"0.5px",background:"#e0e0e0"}}></div>
            <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:700}}>{profile?.favorites_count||0}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>Favoris</div></div>
          </div>
        </div>
        <div style={{padding:"0 0 32px"}}>
          {NAV.map(group => (
            <div key={group.group}>
              <div style={{padding:"0 32px 6px",fontSize:12,fontWeight:500,color:"#888",textTransform:"uppercase",letterSpacing:0.5,marginTop:8}}>{group.group}</div>
              <div style={{margin:"0 16px 12px",background:"#fff",borderRadius:16,overflow:"hidden"}}>
                {group.items.map((item, i) => (
                  <div key={item.id} onClick={()=>{ if(item.id==="sell"){navigate("/CreateListing");}else if(item.id==="messages"){navigate("/Messages");}else{setSection(item.id);} }}
                    style={{display:"flex",alignItems:"center",padding:"0 16px",minHeight:50,position:"relative",cursor:"pointer",background:section===item.id?"#f0f4f0":"#fff"}}>
                    <span style={{fontSize:18,marginRight:14,width:24,textAlign:"center"}}>{item.icon}</span>
                    <span style={{flex:1,fontSize:16,color:section===item.id?"#1B5E20":"#000",fontWeight:section===item.id?600:400}}>{item.label}</span>
                    <svg width="8" height="13" viewBox="0 0 8 13"><path d="M1 1l6 5.5-6 5.5" stroke="#ccc" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {i < group.items.length-1 && <div style={{position:"absolute",bottom:0,left:54,right:0,height:"0.5px",background:"#f0f0f0"}}></div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{margin:"8px 16px 0",background:"#fff",borderRadius:16,overflow:"hidden"}}>
            <div onClick={handleLogout} style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px",minHeight:50,cursor:"pointer",gap:10}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:"#FF3B30"}}></div>
              <span style={{fontSize:16,color:"#FF3B30",fontWeight:500}}>Deconnexion</span>
            </div>
          </div>
        </div>
        {section && (
          <div style={{position:"fixed",inset:0,background:"#F2F2F7",zIndex:200,overflowY:"auto"}}>
            <div style={{background:"#F2F2F7",padding:"56px 16px 12px",display:"flex",alignItems:"center",gap:12,borderBottom:"0.5px solid #e0e0e0"}}>
              <button onClick={()=>setSection(null)} style={{background:"rgba(116,116,128,0.12)",border:"none",borderRadius:9999,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                <svg width="10" height="16" viewBox="0 0 10 16" fill="none"><path d="M8 2L2 8l6 6" stroke="#1B5E20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <span style={{fontSize:17,fontWeight:600,color:"#000"}}>{NAV.flatMap(g=>g.items).find(i=>i.id===section)?.label}</span>
            </div>
            <div style={{padding:16}}>{renderSection()}</div>
          </div>
        )}
      </div>
      <div className="hidden md:block">
<div className="dash-root">
        {/* Overlay mobile */}
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:99}} />}

        {/* Header mobile */}
        <div style={{display:"none"}} className="dash-mobile-header">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{background:"none",border:"none",cursor:"pointer",padding:"8px",color:"#1a2e1c"}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span style={{fontWeight:700,color:"#1a2e1c",fontSize:"1rem"}}>Mon compte</span>
          <div style={{width:38}} />
        </div>

        <aside className={`dash-sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="dash-sidebar-header">
            <Link to="/" className="dash-logo">SwingMarketGolf</Link>
            <div className="dash-user-card">
              <div className="dash-avatar">{profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?"}</div>
              <div style={{ minWidth: 0 }}>
                <div className="dash-user-name">{profile?.full_name || "Mon compte"}</div>
                <div className="dash-user-email">{user?.email}</div>
              </div>
            </div>
            <div>
              <span className="dash-plan-badge">{planCfg.icon} {planCfg.label}</span>
            </div>
          </div>

          <nav className="dash-nav">
            {NAV.map(group => (
              <div key={group.group}>
                <div className="dash-nav-group">{group.group}</div>
                {group.items.filter(item => !item.proOnly || profile?.is_pro).map(item => (
                  <button key={item.id}
                    className={`dash-nav-btn${section === item.id ? " active" : ""}`}
                    onClick={() => { if (item.id === "sell") { navigate("/CreateListing"); } else if (item.id === "messages") { navigate("/Messages"); } else { setSection(item.id); setSidebarOpen(false); } }}>
                    <span className="dash-nav-icon">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="dash-logout">
            <button className="dash-logout-btn" onClick={handleLogout}>🚪 Déconnexion</button>
          </div>
        </aside>

        <main className="dash-main" style={{ color: "#1a2332" }}>
          <h1 className="dash-page-title">{sectionTitle}</h1>
          {renderSection()}
          {editingProduct && (
            <EditProductModal
              product={editingProduct}
              onClose={() => setEditingProduct(null)}
              onSave={() => { setEditingProduct(null); loadProducts(user?.id); }}
            />
          )}
        </main>
      </div>
      </div>
    </>
  );
}
