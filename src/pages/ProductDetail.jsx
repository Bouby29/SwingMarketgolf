import React, { useState, useEffect } from "react";
import SEOHead from "../components/seo/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase, entities, auth } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart, MessageCircle, ShoppingBag, Star, Shield, Truck,
  ChevronLeft, ChevronRight, Share2, MapPin, Package
} from "lucide-react";
import ProductCard from "../components/shared/ProductCard";
import { calculateCommission, getCommissionTier } from "../components/utils/commissionCalculator";
import AuctionBidPanel from "../components/auction/AuctionBidPanel";
import MakeOfferButton from "../components/product/MakeOfferButton";

const conditionLabels = {
  neuf: "Neuf", comme_neuf: "Comme neuf",
  bon_etat: "Bon état", etat_correct: "État correct",
};

const shippingPrices = {
  petit: { mondial_relay: 3.99, colissimo: 5.49, chronopost: 8.99 },
  moyen: { mondial_relay: 5.99, colissimo: 7.49, chronopost: 12.99 },
  grand: { mondial_relay: 8.99, colissimo: 11.49, chronopost: 18.99 },
};

export default function ProductDetail() {
  const location = useLocation();
  const productId = new URLSearchParams(location.search).get("id");
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const auth = !!data.session;
      setIsLoggedIn(auth);
      if (auth) setCurrentUser(data.session?.user || null);
    });
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => entities.Product.filter({ id: productId }),
    select: (data) => data[0],
    enabled: !!productId,
  });

  const { data: seller } = useQuery({
    queryKey: ["seller", product?.seller_id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", product.seller_id).single();
      return data;
    },
    enabled: !!product?.seller_id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", product?.seller_id],
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*").eq("seller_id", product.seller_id);
      return data || [];
    },
    enabled: !!product?.seller_id,
  });

  const { data: similarProducts = [] } = useQuery({
    queryKey: ["similar", product?.category],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("category", product.category).eq("status", "active").neq("id", productId).order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
    enabled: !!product?.category,
  });

  const { data: sellerProducts = [] } = useQuery({
    queryKey: ["seller-products", product?.seller_id],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("seller_id", product.seller_id).eq("status", "active").order("created_at", { ascending: false }).limit(7);
      return data || [];
    },
    enabled: !!product?.seller_id,
  });

  const otherSellerProducts = sellerProducts.filter(p => p.id !== productId).slice(0, 6);

  const commission = product ? calculateCommission(product.price) : 0;
  const commissionTier = product ? getCommissionTier(product.price) : null;
  const shipping = product?.package_size ? shippingPrices[product.package_size] : null;
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const handleContact = () => {
    if (!isLoggedIn) { window.location.href='/login'; return; }
    window.location.href = createPageUrl("Messages") + `?to=${product.seller_id}&product=${product.id}`;
  };
  const handleOffer = () => {
    if (!isLoggedIn) { window.location.href = "/Login"; return; }
    if (!offerAmount || isNaN(offerAmount) || Number(offerAmount) <= 0) return;
    window.location.href = createPageUrl("Messages") + `?to=${product.seller_id}&product=${product.id}&offer=${encodeURIComponent(offerAmount)}&title=${encodeURIComponent(product.title)}`;
  };

  const handleBuy = () => {
    if (!isLoggedIn) { window.location.href="/login"; return; }
    window.location.href = createPageUrl("Checkout") + `?product=${product.id}`;
  };

  const productStructuredData = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description || product.title,
    "image": product.images?.[0] || "",
    "brand": product.brand ? { "@type": "Brand", "name": product.brand } : undefined,
    "condition": product.condition === "neuf" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "Person", "name": product.seller_name }
    },
    ...(avgRating ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": avgRating,
        "reviewCount": reviews.length
      }
    } : {})
  } : null;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square shimmer rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 w-24 shimmer rounded" />
            <div className="h-8 w-3/4 shimmer rounded" />
            <div className="h-10 w-32 shimmer rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Produit introuvable</h2>
        <Link to={createPageUrl("Marketplace")} className="text-[#1B5E20] mt-2 inline-block">Retour à la marketplace</Link>
      </div>
    );
  }

  const photos = product.images?.length > 0 ? product.images : ["https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=600&h=600&fit=crop"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEOHead
        title={`${product.title} - Occasion | SwingMarket`}
        description={`Achetez ${product.title} d'occasion au meilleur prix. Produit vérifié, livraison rapide et sécurisée sur SwingMarket.`}
        image={product.images?.[0]}
        url={`https://swingmarketgolf.com/ProductDetail?id=${product.id}`}
        type="product"
        structuredData={productStructuredData}
      />
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Photos */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
            <img src={photos[currentPhoto]} alt={product.title} className="w-full h-full object-cover" />
            {photos.length > 1 && (
              <>
                <button onClick={() => setCurrentPhoto(p => p > 0 ? p - 1 : photos.length - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setCurrentPhoto(p => p < photos.length - 1 ? p + 1 : 0)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {photos.map((p, i) => (
                <button key={i} onClick={() => setCurrentPhoto(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${i === currentPhoto ? "border-[#1B5E20]" : "border-transparent"}`}>
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-green-50 text-[#1B5E20] border-0">{product.category}</Badge>
            {product.condition && <Badge variant="outline">{conditionLabels[product.condition]}</Badge>}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>

          {product.brand && <p className="text-sm text-gray-500 mb-4">Marque : <span className="font-medium text-gray-700">{product.brand}</span></p>}

          <div className="mb-6">
            {product.sale_type !== 'auction' && (
              <>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-extrabold text-[#1B5E20]">{product.price?.toFixed(2)} €</span>
                  {product.retail_price && product.retail_price > product.price && (
                    <>
                      <span className="text-lg text-gray-400 line-through">{product.retail_price.toFixed(2)} €</span>
                      <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">
                        -{Math.round((1 - product.price / product.retail_price) * 100)}%
                      </span>
                    </>
                  )}
                </div>
                {product.retail_price && product.retail_price > product.price && (
                  <p className="text-xs text-gray-500 mt-1">
                    Prix neuf conseillé : <span className="line-through">{product.retail_price.toFixed(2)} €</span>
                    {" "}· Économie : <span className="text-[#1B5E20] font-semibold">{(product.retail_price - product.price).toFixed(2)} €</span>
                  </p>
                )}
                <span className="text-xs text-gray-400">+ {commission.toFixed(2)} € ({commissionTier})</span>
              </>
            )}
          </div>

          {/* Seller card — always visible */}
          {product.seller_id && (
            <Link to={createPageUrl("Profile") + `?id=${product.seller_id}`} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6 hover:bg-gray-100 transition-colors border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-[#1B5E20] flex items-center justify-center overflow-hidden shrink-0">
                {seller?.avatar_url ? (
                  <img src={seller?.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">{(seller?.shop_name || seller?.full_name || product.seller_name || "V")?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm text-gray-900">{seller?.shop_name || seller?.full_name || product.seller_name || "Vendeur"}</p>
                  {seller?.is_pro && <Badge variant="outline" className="text-[10px] py-0">Pro</Badge>}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Shield className="w-3 h-3 text-[#1B5E20]" />
                  <span className="text-xs text-[#1B5E20] font-medium">Vendeur vérifié par SwingMarket</span>
                </div>
                {avgRating && (
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                    <Star className="w-3 h-3 text-[#C5A028] fill-[#C5A028]" /> {avgRating}/5 · {reviews.length} avis
                  </div>
                )}
              </div>
            </Link>
          )}

          {/* Actions */}
          {product.sale_type === 'auction' ? (
            <>
              <AuctionBidPanel product={product} currentUser={currentUser} isLoggedIn={isLoggedIn} />
              <Button onClick={() => { if (!isLoggedIn) { window.location.href="/Login"; return; } setShowOfferModal(true); }} size="lg" className="w-full mb-3 rounded-full bg-[#C5A028] hover:bg-[#b8902a] text-white font-semibold">
                💰 Faire une offre
              </Button>
              <Button onClick={handleContact} size="lg" variant="outline" className="w-full mb-6 rounded-full border-[#1B5E20] text-[#1B5E20] hover:bg-green-50 font-semibold">
                <MessageCircle className="w-4 h-4 mr-2" /> Contacter le vendeur
              </Button>
            </>
          ) : (
            <>
              <div className="flex gap-3 mb-3">
                <Button onClick={handleBuy} size="lg" className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-full font-semibold">
                  <ShoppingBag className="w-4 h-4 mr-2" /> Acheter
                </Button>
                <Button onClick={handleContact} size="lg" className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-full font-semibold">
                  <MessageCircle className="w-4 h-4 mr-2" /> Contacter
                </Button>
              </div>
              <div className="flex gap-3 mb-6">
                <MakeOfferButton product={product} isLoggedIn={isLoggedIn} currentUser={currentUser} />
              </div>
            </>
          )}

          {/* Shipping */}
          {shipping && (
            <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-[#1B5E20]" />
                <span className="font-semibold text-sm">Options de livraison</span>
                <Badge variant="outline" className="text-[10px] ml-auto">{product.package_size}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Mondial Relay</span><span className="font-medium">{shipping.mondial_relay} €</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Colissimo</span><span className="font-medium">{shipping.colissimo} €</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Chronopost</span><span className="font-medium">{shipping.chronopost} €</span></div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>

          {/* Technical Specs */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Caractéristiques techniques</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <span className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-medium text-gray-900">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust */}
          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl text-sm">
            <Shield className="w-5 h-5 text-[#1B5E20]" />
            <div>
              <p className="font-semibold text-[#1B5E20]">Transaction sécurisée</p>
              <p className="text-xs text-gray-600">Paiement protégé par Stripe · Argent sécurisé jusqu'à réception</p>
            </div>
          </div>
        </div>
      </div>

      {/* Other seller products */}
      {otherSellerProducts.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Autres produits de ce vendeur</h2>
              <p className="text-sm text-gray-500 mt-1">{product.seller_name}</p>
            </div>
            <Link
              to={createPageUrl("Profile") + `?id=${product.seller_id}`}
              className="text-sm font-semibold text-[#1B5E20] hover:underline whitespace-nowrap"
            >
              Voir tous les produits →
            </Link>
          </div>
          {/* Desktop grid / Mobile horizontal scroll */}
          <div className="flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-x-auto pb-2 md:overflow-visible scrollbar-hide">
            {otherSellerProducts.map(p => (
              <div key={p.id} className="w-44 shrink-0 md:w-auto md:shrink">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar products */}
      {similarProducts.filter(p => p.id !== product.id).length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produits similaires</h2>
          <h3 className="text-base text-gray-600 mb-6">Autres {product.category?.toLowerCase()} qui pourraient vous intéresser</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.filter(p => p.id !== product.id).slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
      {/* Modal Offre */}
      {showOfferModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "2rem", maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#1a2332", marginBottom: 8 }}>💰 Faire une offre</h3>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: 20 }}>
              Prix affiché : <strong>{product?.price} €</strong>. Proposez votre prix au vendeur.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <input
                type="number"
                value={offerAmount}
                onChange={e => setOfferAmount(e.target.value)}
                placeholder="Ex: 150"
                min="1"
                style={{ flex: 1, padding: "0.85rem 1rem", borderRadius: 12, border: "2px solid #C5A028", fontSize: "1.1rem", fontWeight: 700, color: "#1a2332", outline: "none", textAlign: "center" }}
                onKeyDown={e => e.key === "Enter" && handleOffer()}
                autoFocus
              />
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a2332" }}>€</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "#9ca3af", marginBottom: 16, textAlign: "center" }}>
              Votre offre sera envoyée via la messagerie. Le vendeur pourra accepter, refuser ou contre-proposer.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleOffer} disabled={!offerAmount || Number(offerAmount) <= 0}
                style={{ flex: 1, padding: "0.85rem", borderRadius: 50, border: "none", background: offerAmount && Number(offerAmount) > 0 ? "#C5A028" : "#e5e7eb", color: "white", fontWeight: 700, fontSize: "1rem", cursor: offerAmount ? "pointer" : "not-allowed" }}>
                Envoyer mon offre →
              </button>
              <button onClick={() => { setShowOfferModal(false); setOfferAmount(""); }}
                style={{ padding: "0.85rem 1.25rem", borderRadius: 50, border: "1.5px solid #e5e7eb", background: "white", color: "#6b7280", fontWeight: 600, cursor: "pointer" }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}