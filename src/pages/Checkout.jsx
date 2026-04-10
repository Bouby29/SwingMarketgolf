import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, Package, Truck, CreditCard, ArrowLeft } from "lucide-react";

export default function Checkout() {
  const location = useLocation();
  const productId = new URLSearchParams(location.search).get("product");

  const [user, setUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/Login"; return; }
      setUser(session.user);
      const { data } = await supabase.from("products").select("*").eq("id", productId).single();
      setProduct(data);
      setLoading(false);
    };
    init();
  }, [productId]);

  const handleConfirm = async () => {
    if (!product || !user) return;
    setPlacing(true);
    try {
      // Créer la commande
      await supabase.from("orders").insert({
        product_id: product.id,
        product_title: product.title,
        buyer_id: user.id,
        seller_id: product.seller_id,
        seller_name: product.seller_name,
        price: product.price,
        status: "pending_payment",
        created_at: new Date().toISOString(),
      });
      // Marquer le produit comme réservé
      await supabase.from("products").update({ status: "reserved" }).eq("id", product.id);
      setCompleted(true);
    } catch (e) {
      alert("Une erreur est survenue. Veuillez réessayer.");
    }
    setPlacing(false);
  };

  if (loading) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-8 h-8 border-2 border-[#1B5E20] border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  if (!product) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-gray-500">Produit introuvable.</p>
      <Link to={createPageUrl("Marketplace")} className="text-[#1B5E20] mt-2 inline-block">Retour à la marketplace</Link>
    </div>
  );

  if (completed) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-[#1B5E20]" />
      </div>
      <h1 className="text-2xl font-bold mb-2 text-gray-900">Commande confirmée !</h1>
      <p className="text-gray-500 mb-2">Votre commande a été enregistrée.</p>
      <p className="text-sm text-gray-400 mb-8">Le paiement sécurisé sera disponible prochainement. Le vendeur a été notifié.</p>
      <div className="flex flex-col gap-3">
        <Button onClick={() => window.location.href = createPageUrl("Dashboard")} className="bg-[#1B5E20] rounded-full w-full">
          Voir mes commandes
        </Button>
        <Link to={createPageUrl("Marketplace")}>
          <Button variant="outline" className="rounded-full w-full">Continuer mes achats</Button>
        </Link>
      </div>
    </div>
  );

  const photo = product.images?.[0] || "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=400&fit=crop";

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link to={createPageUrl("ProductDetail") + "?id=" + product.id} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Retour à l'annonce
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Récapitulatif de commande</h1>

      {/* Article */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4 mb-4">
        <img src={photo} alt={product.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{product.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">Vendu par {product.seller_name}</p>
          <p className="text-lg font-extrabold text-[#1B5E20] mt-1">{product.price?.toFixed(2)} €</p>
        </div>
      </div>

      {/* Infos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 space-y-3">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Livraison</p>
            <p className="text-xs text-gray-500">Colissimo ou Point relais — disponible bientôt</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Paiement sécurisé</p>
            <p className="text-xs text-gray-500">Stripe — disponible bientôt</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-[#1B5E20]" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Protection acheteur incluse</p>
            <p className="text-xs text-gray-500">Votre achat est protégé par SwingMarket</p>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Article</span>
          <span className="font-medium">{product.price?.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-500 text-sm">Livraison</span>
          <span className="text-gray-400 text-sm">À définir</span>
        </div>
        <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
          <span className="font-bold text-gray-900">Total estimé</span>
          <span className="font-extrabold text-[#1B5E20] text-lg">{product.price?.toFixed(2)} €</span>
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={handleConfirm}
        disabled={placing}
        size="lg"
        className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-full font-semibold text-base"
      >
        {placing ? "Enregistrement..." : "Confirmer la commande"}
      </Button>
      <p className="text-xs text-center text-gray-400 mt-3">
        En confirmant, vous réservez cet article. Le paiement sera demandé prochainement.
      </p>
    </div>
  );
}
