import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import AccountInfoSection from "../components/dashboard/AccountInfoSection";
import AddressesSection from "../components/dashboard/AddressesSection";
import SellerProfileSection from "../components/dashboard/SellerProfileSection";
import CustomizeShopSection from "../components/dashboard/CustomizeShopSection";
import ShippingOptionsSection from "../components/dashboard/ShippingOptionsSection";
import VacationModeSection from "../components/dashboard/VacationModeSection";
import SellerStatsSection from "../components/dashboard/SellerStatsSection";
import WalletSection from "../components/dashboard/WalletSection";
import StripeKYCSection from "../components/dashboard/StripeKYCSection";
import BankAccountsSection from "../components/dashboard/BankAccountsSection";
import LegalDocumentsSection from "../components/dashboard/LegalDocumentsSection";
import MyAuctionsSection from "../components/dashboard/MyAuctionsSection";
import EditProductModal from "../components/dashboard/EditProductModal";
import SellerOrderCard from "../components/orders/SellerOrderCard";
import BuyerOrderCard from "../components/orders/BuyerOrderCard";

const NAV = [
  {
    group: "Mon Compte",
    items: [
      { id: "info", label: "Informations", icon: "👤" },
      { id: "addresses", label: "Adresses", icon: "📍" },
      { id: "subscription", label: "Mon abonnement", icon: "⭐" },
    ]
  },
  {
    group: "Espace Vendeur",
    items: [
      { id: "sell", label: "Vendre un produit", icon: "➕" },
      { id: "seller-profile", label: "Mon profil", icon: "🏪" },
      { id: "customize-shop", label: "Personnaliser ma boutique", icon: "🎨" },
      { id: "products", label: "Gérer mes produits", icon: "📦" },
      { id: "auctions", label: "Mes enchères", icon: "🔨" },
      { id: "sales", label: "Mes ventes", icon: "💰" },
      { id: "shipping", label: "Mes options d envoi", icon: "🚚" },
      { id: "vacation", label: "Mode vacances", icon: "🌴" },
      { id: "stats", label: "Statistiques vendeur", icon: "📊" },
    ]
  },
  {
    group: "Mon Porte-monnaie",
    items: [
      { id: "wallet", label: "Mon porte-monnaie", icon: "💵" },
      { id: "stripe-kyc", label: "Connexion Stripe / KYC", icon: "🔐" },
      { id: "bank", label: "Mes comptes bancaires", icon: "🏦" },
      { id: "legal", label: "Mes documents légaux", icon: "📄" },
    ]
  },
  {
    group: "Espace Messagerie",
    items: [
      { id: "messages", label: "Ma messagerie", icon: "💬" },
    ]
  },
];

const PLAN_CONFIG = {
  basique: { label: "Basique", color: "#888", bg: "#f5f5f5", limit: "5 annonces/mois" },
  pro: { label: "Pro", color: "#1565c0", bg: "#e3f2fd", limit: "30 annonces/mois" },
  premium: { label: "Premium", color: "#C5A028", bg: "#fff8e1", limit: "Illimité" },
  business: { label: "Business", color: "#C5A028", bg: "#1a2332", limit: "Illimité" },
};

export default function Dashboard() {
  const [section, setSection] = useState("info");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const deleteProduct = async (id) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    await supabase.from("products").delete().eq("id", id);
    loadProducts(user.id);
  };

  const plan = profile?.plan || "basique";
  const planCfg = PLAN_CONFIG[plan] || PLAN_CONFIG.basique;

  const renderSection = () => {
    switch (section) {
      case "info": return <AccountInfoSection user={user} profile={profile} onUpdate={() => loadProfile(user?.id)} />;
      case "addresses": return <AddressesSection user={user} />;
      case "subscription": return (
        <div>
          <h2 style={{ fontWeight: 800, fontSize: "1.4rem", marginBottom: "1.5rem" }}>Mon abonnement</h2>
          <div style={{ background: "white", borderRadius: 16, padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: planCfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                {plan === "business" ? "🏆" : plan === "premium" ? "⭐" : plan === "pro" ? "💎" : "🎯"}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.2rem", color: planCfg.color }}>Plan {planCfg.label}</div>
                <div style={{ color: "#888", fontSize: "0.9rem" }}>{planCfg.limit}</div>
              </div>
              <span style={{ marginLeft: "auto", background: planCfg.bg, color: planCfg.color, padding: "4px 14px", borderRadius: 20, fontWeight: 700, fontSize: "0.85rem" }}>
                Actif
              </span>
            </div>
            <div style={{ background: "#f9f9f9", borderRadius: 10, padding: "1rem", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#666", fontSize: "0.9rem" }}>Annonces ce mois</span>
                <span style={{ fontWeight: 700 }}>{profile?.plan_annonces_count || 0} / {plan === "basique" ? 5 : plan === "pro" ? 30 : "∞"}</span>
              </div>
              {(plan === "basique" || plan === "pro") && (
                <div style={{ background: "#e0e0e0", borderRadius: 20, height: 8, overflow: "hidden" }}>
                  <div style={{ background: "#1B5E20", height: "100%", borderRadius: 20, width: `${Math.min(100, ((profile?.plan_annonces_count || 0) / (plan === "basique" ? 5 : 30)) * 100)}%`, transition: "width 0.3s" }} />
                </div>
              )}
            </div>
          </div>
          {plan === "basique" && (
            <div style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32)", borderRadius: 16, padding: "2rem", color: "white", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>🚀</div>
              <h3 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 8 }}>Passez à la vitesse supérieure</h3>
              <p style={{ opacity: 0.85, fontSize: "0.9rem", marginBottom: 20 }}>Débloquez plus d annonces et des fonctionnalités exclusives</p>
              <Link to="/Abonnements" style={{ background: "#C5A028", color: "white", padding: "0.7rem 2rem", borderRadius: 50, fontWeight: 700, textDecoration: "none", fontSize: "0.95rem" }}>
                Voir les offres →
              </Link>
            </div>
          )}
        </div>
      );
      case "sell": navigate("/CreateListing"); return null;
      case "seller-profile": return <SellerProfileSection user={user} profile={profile} onUpdate={() => loadProfile(user?.id)} />;
      case "customize-shop": return <CustomizeShopSection user={user} profile={profile} />;
      case "products": return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontWeight: 800, fontSize: "1.4rem", margin: 0 }}>Mes annonces ({products.length})</h2>
            <Link to="/CreateListing" style={{ background: "#1B5E20", color: "white", padding: "0.6rem 1.2rem", borderRadius: 10, fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>+ Nouvelle</Link>
          </div>
          {products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: 16, color: "#888" }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>📦</div>
              <p style={{ fontWeight: 600 }}>Aucune annonce pour l instant</p>
              <Link to="/CreateListing" style={{ color: "#1B5E20", fontWeight: 700 }}>Créer ma première annonce →</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {products.map(p => (
                <div key={p.id} style={{ background: "white", borderRadius: 12, padding: "1rem", display: "flex", gap: 12, alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  {p.images?.[0] && <img src={p.images[0]} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{p.title}</div>
                    <div style={{ color: "#1B5E20", fontWeight: 700 }}>{p.price} €</div>
                  </div>
                  <span style={{ background: p.status === "active" ? "#e8f5e9" : "#fff8e1", color: p.status === "active" ? "#2e7d32" : "#f57f17", padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600 }}>
                    {p.status === "active" ? "Actif" : p.status === "sold" ? "Vendu" : p.status}
                  </span>
                  <button onClick={() => setEditingProduct(p)} style={{ background: "#f0f7ff", color: "#1565c0", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>✏️</button>
                  <button onClick={() => deleteProduct(p.id)} style={{ background: "#ffebee", color: "#c62828", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: "0.8rem" }}>🗑️</button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
      case "auctions": return <MyAuctionsSection user={user} />;
      case "sales": return (
        <div>
          <h2 style={{ fontWeight: 800, fontSize: "1.4rem", marginBottom: 20 }}>Mes ventes ({sales.length})</h2>
          {sales.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: 16, color: "#888" }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>💰</div>
              <p style={{ fontWeight: 600 }}>Aucune vente pour l instant</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {sales.map(o => <SellerOrderCard key={o.id} order={o} />)}
            </div>
          )}
        </div>
      );
      case "shipping": return <ShippingOptionsSection user={user} />;
      case "vacation": return <VacationModeSection user={user} profile={profile} onUpdate={() => loadProfile(user?.id)} />;
      case "stats": return <SellerStatsSection user={user} />;
      case "wallet": return <WalletSection user={user} profile={profile} />;
      case "stripe-kyc": return <StripeKYCSection user={user} />;
      case "bank": return <BankAccountsSection user={user} />;
      case "legal": return <LegalDocumentsSection user={user} />;
      case "messages": return (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: 16, color: "#888" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>💬</div>
          <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>Messagerie</p>
          <p style={{ fontSize: "0.9rem", marginTop: 8 }}>Bientôt disponible</p>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa", fontFamily: "system-ui, sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{ width: 260, background: "white", borderRight: "1px solid #f0f0f0", position: "fixed", top: 0, left: 0, height: "100vh", overflowY: "auto", zIndex: 100, display: "flex", flexDirection: "column" }}>
        {/* Header sidebar */}
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #f0f0f0" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1B5E20" }}>SwingMarketGolf</div>
          </Link>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1B5E20", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1rem" }}>
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "?"}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1a2332" }}>{profile?.full_name || "Mon compte"}</div>
              <div style={{ fontSize: "0.72rem", color: "#888" }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <span style={{ background: planCfg.bg, color: planCfg.color, padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>
              {plan === "business" ? "🏆" : plan === "premium" ? "⭐" : plan === "pro" ? "💎" : "🎯"} Plan {planCfg.label}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "0.75rem 0" }}>
          {NAV.map(group => (
            <div key={group.group}>
              <div style={{ padding: "0.5rem 1.2rem 0.25rem", fontSize: "0.68rem", fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: 1 }}>
                {group.group}
              </div>
              {group.items.map(item => (
                <button key={item.id}
                  onClick={() => { setSection(item.id); if (item.id === "sell") navigate("/CreateListing"); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "0.55rem 1.2rem", border: "none", cursor: "pointer",
                    background: section === item.id ? "#f0f7f0" : "transparent",
                    color: section === item.id ? "#1B5E20" : "#555",
                    fontWeight: section === item.id ? 700 : 500,
                    fontSize: "0.85rem", textAlign: "left",
                    borderLeft: section === item.id ? "3px solid #1B5E20" : "3px solid transparent",
                    transition: "all 0.15s",
                  }}>
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "1rem 1.2rem", borderTop: "1px solid #f0f0f0" }}>
          <button onClick={handleLogout} style={{ width: "100%", background: "#ffebee", color: "#c62828", border: "none", borderRadius: 8, padding: "0.5rem", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 260, flex: 1, padding: "2rem", maxWidth: "calc(100vw - 260px)" }}>
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
  );
}
