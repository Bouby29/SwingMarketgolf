import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package, ShoppingBag, Plus, Eye, Trash2, DollarSign, LogOut,
  MapPin, Tag, BarChart3, Store, Edit, Settings, CreditCard,
  MessageCircle, FileText, Heart, HelpCircle, Mail, Lock, Cookie,
  Home, TrendingUp
} from "lucide-react";
import SellerOrderCard from "../components/orders/SellerOrderCard";
import BuyerOrderCard from "../components/orders/BuyerOrderCard";
import AccountInfoSection from "../components/dashboard/AccountInfoSection";
import AddressesSection from "../components/dashboard/AddressesSection";
import DiscountsSection from "../components/dashboard/DiscountsSection";
import LegalDocumentsSection from "../components/dashboard/LegalDocumentsSection";
import BankAccountsSection from "../components/dashboard/BankAccountsSection";
import SellerProfileSection from "../components/dashboard/SellerProfileSection";
import CustomizeShopSection from "../components/dashboard/CustomizeShopSection";
import ShippingOptionsSection from "../components/dashboard/ShippingOptionsSection";
import VacationModeSection from "../components/dashboard/VacationModeSection";
import SellerStatsSection from "../components/dashboard/SellerStatsSection";
import WalletSection from "../components/dashboard/WalletSection";
import StripeKYCSection from "../components/dashboard/StripeKYCSection";
import EditProductModal from "../components/dashboard/EditProductModal";
import MyAuctionsSection from "../components/dashboard/MyAuctionsSection";

function OrdersHistorySection({ myOrders }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Historique de mes achats</h2>
        <p className="text-gray-600">Retrouvez toutes vos commandes passées</p>
      </div>
      {myOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900">Aucun achat</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map(o => <BuyerOrderCard key={o.id} order={o} />)}
        </div>
      )}
    </div>
  );
}

function MyProductsSection({ myProducts, deleteProduct, onProductUpdate }) {
  const [editingProduct, setEditingProduct] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gérer mes produits</h2>
        <p className="text-gray-600">Modifiez, activez ou supprimez vos annonces</p>
      </div>
      {myProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900">Aucune annonce</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myProducts.map(p => (
            <div key={p.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4">
              <img
                src={p.photos?.[0] || "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=100&h=100&fit=crop"}
                alt="" className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{p.title}</h3>
                <p className="text-[#1B5E20] font-bold text-sm">{p.price?.toFixed(2)} €</p>
              </div>
              <Badge className={p.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                {p.status === "active" ? "Active" : p.status === "sold" ? "Vendu" : "Inactive"}
              </Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setEditingProduct(p)}>
                  <Edit className="w-4 h-4 text-blue-500" />
                </Button>
                <Link to={createPageUrl("ProductDetail") + `?id=${p.id}`}>
                  <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={() => {
            setEditingProduct(null);
            onProductUpdate?.();
          }}
        />
      )}
    </div>
  );
}

function MySalesSection({ mySales }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes ventes</h2>
        <p className="text-gray-600">Suivez l'état de vos ventes et expéditions</p>
      </div>
      {mySales.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900">Aucune vente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mySales.map(o => <SellerOrderCard key={o.id} order={o} />)}
        </div>
      )}
    </div>
  );
}

function FavoritesSection({ myFavorites }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Produits favoris</h2>
        <p className="text-gray-600">Vos coups de cœur sauvegardés</p>
      </div>
      {myFavorites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900">Aucun favori</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {myFavorites.map(fav => (
            <Link key={fav.id} to={createPageUrl("ProductDetail") + `?id=${fav.product_id}`}>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                <img src={fav.product_photo} alt="" className="w-full h-40 object-cover" />
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{fav.product_title}</p>
                  <p className="text-[#1B5E20] font-bold text-sm">{fav.product_price?.toFixed(2)} €</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [mobileShowContent, setMobileShowContent] = useState(false);

  const refreshUser = async () => {
    const me = await Promise.resolve(null);
    setUser(me);
  };

  useEffect(() => {
    const init = async () => {
      const auth = await Promise.resolve(true);
      if (!auth) { base44.auth.redirectToLogin(); return; }
      setUser(await base44.auth.me());
    };
    init();
  }, []);

  const { data: myProducts = [] } = useQuery({
    queryKey: ["my-products", user?.id],
    queryFn: () => base44.entities.Product.filter({ seller_id: user.id }, "-created_date", 100),
    enabled: !!user?.id,
  });

  const { data: mySales = [] } = useQuery({
    queryKey: ["my-sales", user?.id],
    queryFn: () => base44.entities.Order.filter({ seller_id: user.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const { data: myOrders = [] } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: () => base44.entities.Order.filter({ buyer_id: user.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const { data: myFavorites = [] } = useQuery({
    queryKey: ["my-favorites", user?.id],
    queryFn: () => base44.entities.Favorite.filter({ user_id: user.id }, "-created_date", 100),
    enabled: !!user?.id,
  });

  const { data: myReviews = [] } = useQuery({
    queryKey: ["my-reviews", user?.id],
    queryFn: () => base44.entities.Review.filter({ seller_id: user.id }, "-created_date", 100),
    enabled: !!user?.id,
  });

  const totalRevenue = mySales.filter(o => o.status === "completed").reduce((s, o) => s + (o.price || 0), 0);
  const activeProducts = myProducts.filter(p => p.status === "active");

  const deleteProduct = async (id) => {
    await base44.entities.Product.update(id, { status: "inactive" });
    window.location.reload();
  };

  if (!user) return null;

  const menuSections = [
    {
      title: "Votre compte",
      items: [
        { id: "account-info", label: "Informations", icon: Home },
        { id: "addresses", label: "Adresses", icon: MapPin },
      ]
    },
    {
      title: "Espace commande",
      items: [
        { id: "orders-history", label: "Historique et détails", icon: ShoppingBag },
        { id: "discounts", label: "Bons de réduction", icon: Tag },
      ]
    },
    {
      title: "Espace vendeur",
      items: [
        { id: "create-listing", label: "Vendre un produit", icon: Plus },
        { id: "seller-profile", label: "Mon profil", icon: Store },
        { id: "customize-shop", label: "Personnaliser ma boutique", icon: Edit },
        { id: "my-products", label: "Gérer mes produits", icon: Package },
        { id: "my-auctions", label: "Mes enchères", icon: TrendingUp },
        { id: "my-sales", label: "Mes ventes", icon: ShoppingBag },
        { id: "shipping-options", label: "Mes options d'envoi", icon: TrendingUp },
        { id: "vacation-mode", label: "Mode vacances", icon: Home },
        { id: "annual-statement", label: "Déclaration annuelles", icon: FileText },
        { id: "seller-stats", label: "Statistiques vendeur", icon: BarChart3 },
      ]
    },
    {
      title: "Mon porte-monnaie",
      items: [
        { id: "wallet", label: "Mon porte-monnaie", icon: DollarSign },
        { id: "stripe-kyc", label: "Connexion Stripe / KYC", icon: CreditCard },
        { id: "bank-accounts", label: "Mes comptes bancaires", icon: CreditCard },
        { id: "legal-docs", label: "Mes documents légaux", icon: FileText },
      ]
    },
    {
      title: "Espace messagerie",
      items: [
        { id: "messages", label: "Ma messagerie", icon: MessageCircle },
      ]
    },
    {
      title: "Espace RGPD",
      items: [
        { id: "personal-data", label: "Mes données personnelles", icon: Lock },
      ]
    },
    {
      title: "Autres",
      items: [
        { id: "favorites", label: "Produits favoris", icon: Heart },
        { id: "faq", label: "FAQ", icon: HelpCircle },
        { id: "contact", label: "Contact", icon: Mail },
        { id: "cookies", label: "Paramètres de cookies", icon: Cookie },
      ]
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "account-info":
        return <AccountInfoSection user={user} onUserUpdate={refreshUser} />;
      case "addresses":
        return <AddressesSection />;
      case "discounts":
        return <DiscountsSection />;
      case "orders-history":
        return <OrdersHistorySection myOrders={myOrders} />;
      case "my-products":
        return <MyProductsSection myProducts={myProducts} deleteProduct={deleteProduct} onProductUpdate={() => window.location.reload()} />;
      case "my-auctions":
        return <MyAuctionsSection myProducts={myProducts} />;
      case "my-sales":
        return <MySalesSection mySales={mySales} />;
      case "create-listing":
        return (
          <div className="text-center py-12">
            <Plus className="w-16 h-16 text-[#1B5E20] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendre un produit</h2>
            <p className="text-gray-600 mb-6">Créez une nouvelle annonce en quelques clics</p>
            <Link to={createPageUrl("CreateListing")}>
              <Button className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full">Créer une annonce</Button>
            </Link>
          </div>
        );
      case "seller-profile":
        return <SellerProfileSection user={user} />;
      case "customize-shop":
        return <CustomizeShopSection user={user} />;
      case "shipping-options":
        return <ShippingOptionsSection />;
      case "vacation-mode":
        return <VacationModeSection />;
      case "seller-stats":
        return <SellerStatsSection mySales={mySales} myProducts={myProducts} myReviews={myReviews} />;
      case "stripe-kyc":
        return <StripeKYCSection user={user} />;
      case "wallet":
        return <WalletSection mySales={mySales} />;
      case "bank-accounts":
        return <BankAccountsSection />;
      case "legal-docs":
        return <LegalDocumentsSection user={user} />;
      case "messages":
        return (
          <div className="text-center py-8">
            <MessageCircle className="w-16 h-16 text-[#1B5E20] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ma messagerie</h2>
            <p className="text-gray-600 mb-6">Accédez à vos conversations avec les acheteurs et vendeurs</p>
            <Link to={createPageUrl("Messages")}>
              <Button className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full">Aller à ma messagerie</Button>
            </Link>
          </div>
        );
      case "favorites":
        return <FavoritesSection myFavorites={myFavorites} />;
      case "faq":
        return (
          <div className="text-center py-8">
            <HelpCircle className="w-16 h-16 text-[#1B5E20] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Questions fréquentes</h2>
            <p className="text-gray-600 mb-6">Trouvez rapidement des réponses à vos questions</p>
            <Link to={createPageUrl("FAQ")}>
              <Button className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full">Voir la FAQ</Button>
            </Link>
          </div>
        );
      case "contact":
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nous contacter</h2>
            <p className="text-gray-600 mb-6">Pour toute question ou assistance, notre équipe est à votre disposition</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-gray-900 font-medium mb-2">Email de support :</p>
              <a href="mailto:support@swingmarket.com" className="text-[#1B5E20] text-lg font-bold hover:underline">support@swingmarket.com</a>
            </div>
          </div>
        );
      case "cookies":
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paramètres de cookies</h2>
            <p className="text-gray-600 mb-6">Gérez vos préférences en matière de cookies</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <Cookie className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Gestion des cookies en construction</p>
            </div>
          </div>
        );
      case "personal-data":
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Télécharger mes données</h2>
            <p className="text-gray-600 mb-6">Exportez toutes vos données personnelles au format PDF</p>
            <Button className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full">
              <Lock className="w-4 h-4 mr-2" />
              Télécharger en PDF
            </Button>
          </div>
        );
      case "annual-statement":
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Déclaration annuelle des revenus</h2>
            <p className="text-gray-600 mb-6">Téléchargez votre récapitulatif annuel pour vos déclarations fiscales</p>
            <Button className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full">
              <FileText className="w-4 h-4 mr-2" />
              Télécharger en PDF
            </Button>
          </div>
        );
      default:
        return (
          <div className="text-center py-16">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Section en construction</h3>
            <p className="text-gray-600">Cette fonctionnalité sera bientôt disponible</p>
          </div>
        );
    }
  };

  const handleMenuClick = (id) => {
    setActiveSection(id);
    setMobileShowContent(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const Sidebar = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 md:sticky md:top-24 md:max-h-[calc(100vh-100px)] md:overflow-y-auto shadow-sm">
      {menuSections.map((section, idx) => (
        <div key={idx} className="mb-8 last:mb-0">
          <h3 className="text-xs font-bold text-gray-900 uppercase mb-3 px-2 tracking-wider">{section.title}</h3>
          <div className="space-y-1">
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#1B5E20] text-white shadow-md"
                      : "text-gray-900 hover:bg-green-50 hover:text-[#1B5E20] hover:shadow-sm"
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-gray-600"}`} />
                  <span className="text-left font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <button
          onClick={() => base44.auth.logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Gérez votre compte et vos activités</p>
      </div>

      {/* Mobile: show content back button */}
      {mobileShowContent && activeSection && (
        <div className="md:hidden mb-4">
          <button
            onClick={() => { setMobileShowContent(false); setActiveSection(null); }}
            className="flex items-center gap-2 text-sm text-[#1B5E20] font-medium"
          >
            ← Retour au menu
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar — always shown on desktop, hidden on mobile if content is open */}
        <div className={`md:col-span-1 ${mobileShowContent && activeSection ? "hidden md:block" : "block"}`}>
          <Sidebar />
        </div>

        {/* Content — always shown on desktop, shown on mobile only after click */}
        <div className={`md:col-span-3 ${!mobileShowContent && !activeSection ? "hidden md:block" : "block"}`}>
          {activeSection ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              {renderContent()}
            </div>
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-gray-200 text-center p-8">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-[#1B5E20]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bienvenue sur votre tableau de bord</h3>
              <p className="text-gray-600">Sélectionnez une section dans le menu pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}