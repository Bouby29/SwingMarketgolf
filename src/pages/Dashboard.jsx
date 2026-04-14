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
    { id: "subscription", label: "Mon abonnement", icon: "⭐" },
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
    .dash-sidebar { transform: translateX(-100%); transition: transform 0.3s; }
    .dash-sidebar.open { transform: translateX(0); }
    .dash-main { margin-left: 0; padding: 1rem; }
    .dash-stat-grid { grid-template-columns: 1fr; }
  }
`;

export default function Dashboard() {
  const [section, setSection] = useState("info");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
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
          <div className="dash-subscription-hero">
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>{planCfg.icon}</div>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", fontWeight: 800, marginBottom: 4 }}>Plan {planCfg.label}</div>
              <div style={{ opacity: 0.75, fontSize: "0.9rem" }}>{plan === "basique" ? "5 annonces / mois" : plan === "pro" ? "30 annonces / mois" : "Annonces illimitées"}</div>
              {(plan === "basique" || plan === "pro") && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.8rem", opacity: 0.8 }}>
                    <span>Annonces utilisées ce mois</span>
                    <span style={{ fontWeight: 700 }}>{annCount} / {planCfg.limit}</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, height: 8, overflow: "hidden" }}>
                    <div style={{ background: "white", height: "100%", borderRadius: 20, width: `${Math.min(100, (annCount / planCfg.limit) * 100)}%`, transition: "width 0.4s" }} />
                  </div>
                </div>
              )}
            </div>
          </div>
          {plan === "basique" && (
            <div className="dash-upgrade-card">
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.2rem", fontWeight: 800, marginBottom: 8 }}>Passez à la vitesse supérieure 🚀</div>
              <p style={{ opacity: 0.9, fontSize: "0.88rem", marginBottom: 16 }}>Plus d annonces, plus de visibilité, plus de ventes.</p>
              <Link to="/Abonnements" style={{ background: "white", color: "#C5A028", padding: "0.65rem 2rem", borderRadius: 50, fontWeight: 800, textDecoration: "none", fontSize: "0.9rem", display: "inline-block" }}>
                Voir les offres →
              </Link>
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
      default: return null;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="dash-root">
        <aside className="dash-sidebar">
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
                {group.items.map(item => (
                  <button key={item.id}
                    className={`dash-nav-btn${section === item.id ? " active" : ""}`}
                    onClick={() => { if (item.id === "sell") { navigate("/CreateListing"); } else if (item.id === "messages") { navigate("/Messages"); } else { setSection(item.id); } }}>
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
    </>
  );
}
