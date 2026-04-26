import React, { useState, useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateCommission } from "@/components/utils/commissionCalculator";
import { calculateShipping } from "@/lib/shippingCalculator";
import {
  Shield, CheckCircle, Truck, ArrowLeft, MapPin, Users,
  ChevronRight, Lock, Star, Package, Check, AlertCircle,
} from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const STEPS = ["Livraison", "Paiement"];

function PaymentForm({ totalLabel, orderId, onBack, placing, setPlacing }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError("");
    setPlacing(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Vérifiez les informations de paiement.");
      setPlacing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/OrderSuccess?orderId=${orderId}`,
      },
    });

    if (confirmError) {
      setError(confirmError.message || "Le paiement a échoué. Réessayez ou utilisez une autre carte.");
      setPlacing(false);
    }
  };

  return (
    <form onSubmit={handlePay}>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-gray-400 mb-3 flex items-center gap-1 hover:text-gray-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Retour à la livraison
      </button>

      <button
        type="submit"
        disabled={!stripe || !elements || placing}
        className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-40 text-white rounded-full font-semibold py-3 flex items-center justify-center gap-2 transition-colors"
      >
        {placing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Traitement…
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" /> Payer {totalLabel}
          </>
        )}
      </button>
    </form>
  );
}

export default function Checkout() {
  const location = useLocation();
  const productId = new URLSearchParams(location.search).get("product");

  const [user, setUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(0);

  const [deliveryMode, setDeliveryMode] = useState(null);
  const [address, setAddress] = useState({ street: "", city: "", postal_code: "", phone: "" });
  const [relayPoint, setRelayPoint] = useState(null);
  const [meetupDetails, setMeetupDetails] = useState("");

  const [creatingIntent, setCreatingIntent] = useState(false);
  const [intentError, setIntentError] = useState("");
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [placing, setPlacing] = useState(false);

  // Tarifs de livraison : chargés dynamiquement depuis shipping_rates.
  // - defaultRates : prix de base par mode, affichés dans les 3 cartes
  //   de sélection (au chargement initial du Checkout).
  // - shippingAmount / shippingCarrier : tarif effectif pour le mode
  //   actuellement sélectionné, recalculé à chaque changement.
  // - shippingLoading : true pendant que la requête est en vol.
  const [defaultRates, setDefaultRates] = useState({});
  const [shippingAmount, setShippingAmount] = useState(0);
  const [shippingCarrier, setShippingCarrier] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/Login";
        return;
      }
      setUser(session.user);
      const { data } = await supabase.from("products").select("*").eq("id", productId).single();
      setProduct(data);
      setLoading(false);
    };
    init();
  }, [productId]);

  // Charger les tarifs par défaut (1 par mode) au montage,
  // pour afficher les prix dans les cartes de sélection.
  useEffect(() => {
    const loadDefaultRates = async () => {
      const { data, error } = await supabase
        .from("shipping_rates")
        .select("delivery_mode, shipping_price, carrier_name")
        .eq("is_active", true)
        .is("price_min", null)
        .is("price_max", null);

      if (error) {
        console.error("Erreur chargement defaultRates:", error);
        return;
      }

      const rates = {};
      (data || []).forEach((row) => {
        rates[row.delivery_mode] = {
          shipping_price: Number(row.shipping_price) || 0,
          carrier_name: row.carrier_name ?? null,
        };
      });
      setDefaultRates(rates);
    };
    loadDefaultRates();
  }, []);

  const articlePrice = Number(product?.price || 0);

  const commissionAmount = useMemo(
    () => (articlePrice > 0 ? Number(calculateCommission(articlePrice).toFixed(2)) : 0),
    [articlePrice]
  );

  // Recalcul du tarif de livraison à chaque changement de mode
  // ou de prix. On ignore les réponses obsolètes via un flag local
  // (anti-race quand l'utilisateur change vite de mode).
  useEffect(() => {
    if (!deliveryMode) {
      setShippingAmount(0);
      setShippingCarrier(null);
      setShippingLoading(false);
      return;
    }

    let cancelled = false;
    setShippingLoading(true);

    calculateShipping(deliveryMode, articlePrice)
      .then(({ shipping_price, carrier_name }) => {
        if (cancelled) return;
        setShippingAmount(Number(shipping_price) || 0);
        setShippingCarrier(carrier_name ?? null);
      })
      .finally(() => {
        if (!cancelled) setShippingLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [deliveryMode, articlePrice]);

  const totalPaid = Number((articlePrice + commissionAmount + shippingAmount).toFixed(2));
  const totalLabel = `${totalPaid.toFixed(2)} €`;

  const deliveryValid =
    deliveryMode === "domicile" ? !!(address.street && address.city && address.postal_code) :
    deliveryMode === "relay" ? !!relayPoint :
    deliveryMode === "main_propre" ? true : false;

  const handleProceedToPayment = async () => {
    if (!product || !user || !deliveryValid || creatingIntent) return;

    setCreatingIntent(true);
    setIntentError("");

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          product_id: product.id,
          product_title: product.title,
          buyer_id: user.id,
          seller_id: product.seller_id,
          seller_name: product.seller_name,
          price: articlePrice,
          commission_amount: commissionAmount,
          shipping_amount: shippingAmount,
          total_paid: totalPaid,
          payment_intent_id: null,
          status: "pending_payment",
          payment_status: "pending",
          delivery_mode: deliveryMode,
          buyer_address: deliveryMode === "domicile"
            ? address.street
            : deliveryMode === "relay"
              ? (relayPoint?.address || "")
              : meetupDetails,
          buyer_city: deliveryMode === "domicile"
            ? address.city
            : (relayPoint?.city || ""),
          buyer_postal_code: deliveryMode === "domicile"
            ? address.postal_code
            : (relayPoint?.postal_code || ""),
          buyer_phone: address.phone,
          relay_point: deliveryMode === "relay" ? relayPoint : null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError || !orderData) {
        throw new Error(orderError?.message || "Impossible de créer la commande.");
      }

      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.id,
          amount: Math.round(totalPaid * 100),
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload.error || !payload.clientSecret) {
        throw new Error(payload.error || "Impossible d'initialiser le paiement.");
      }

      const { error: updateError } = await supabase
        .from("orders")
        .update({ payment_intent_id: payload.paymentIntentId })
        .eq("id", orderData.id);

      if (updateError) {
        console.error("Erreur update payment_intent_id:", updateError);
      }

      setOrderId(orderData.id);
      setClientSecret(payload.clientSecret);
      setStep(1);
    } catch (e) {
      console.error("Checkout error:", e);
      setIntentError(e.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setCreatingIntent(false);
    }
  };

  const handleBackToDelivery = () => {
    setStep(0);
    setClientSecret(null);
    setOrderId(null);
  };

  const photo = product?.images?.[0] || "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=400&fit=crop";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#1B5E20] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-gray-500">Produit introuvable.</p>
      <Link to={createPageUrl("Marketplace")} className="text-[#1B5E20] mt-2 inline-block">Retour</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to={createPageUrl("ProductDetail") + "?id=" + product.id}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#1B5E20]" />
            <span className="text-xs text-gray-500 font-medium">Paiement sécurisé</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step ? "bg-[#1B5E20] text-white" :
                  i === step ? "bg-[#1B5E20] text-white ring-4 ring-green-100" :
                  "bg-gray-200 text-gray-400"
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${
                  i === step ? "text-[#1B5E20]" : i < step ? "text-gray-500" : "text-gray-300"
                }`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-12 mx-3 transition-all ${i < step ? "bg-[#1B5E20]" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-4">

            {step === 0 && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Mode de livraison</h2>

                <div
                  onClick={() => setDeliveryMode("domicile")}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    deliveryMode === "domicile" ? "border-[#1B5E20] bg-green-50" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      deliveryMode === "domicile" ? "bg-[#1B5E20]" : "bg-gray-100"
                    }`}>
                      <Truck className={`w-5 h-5 ${deliveryMode === "domicile" ? "text-white" : "text-gray-400"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">Livraison à domicile</p>
                        <span className="text-sm text-gray-400">
                          {defaultRates.domicile
                            ? `${defaultRates.domicile.shipping_price.toFixed(2)} €`
                            : "—"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {defaultRates.domicile?.carrier_name
                          ? `Livré par ${defaultRates.domicile.carrier_name} en 2-3 jours ouvrés`
                          : "Livré directement chez vous en 2-3 jours ouvrés"}
                      </p>
                    </div>
                  </div>
                  {deliveryMode === "domicile" && (
                    <div className="mt-4 pt-4 border-t border-green-200 grid grid-cols-1 gap-3" onClick={e => e.stopPropagation()}>
                      <Input placeholder="Adresse (numéro et rue)" value={address.street} onChange={e => setAddress(a => ({ ...a, street: e.target.value }))} className="text-sm rounded-xl border-gray-200" />
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Code postal" value={address.postal_code} onChange={e => setAddress(a => ({ ...a, postal_code: e.target.value }))} className="text-sm rounded-xl border-gray-200" />
                        <Input placeholder="Ville" value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} className="text-sm rounded-xl border-gray-200" />
                      </div>
                      <Input placeholder="Téléphone" value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} className="text-sm rounded-xl border-gray-200" />
                    </div>
                  )}
                </div>

                <div
                  onClick={() => setDeliveryMode("relay")}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    deliveryMode === "relay" ? "border-[#1B5E20] bg-green-50" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      deliveryMode === "relay" ? "bg-[#1B5E20]" : "bg-gray-100"
                    }`}>
                      <MapPin className={`w-5 h-5 ${deliveryMode === "relay" ? "text-white" : "text-gray-400"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">Point relais</p>
                        <span className="text-sm text-gray-400">
                          {defaultRates.relay
                            ? `${defaultRates.relay.shipping_price.toFixed(2)} €`
                            : "—"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {defaultRates.relay?.carrier_name
                          ? `Retirez votre colis via ${defaultRates.relay.carrier_name}`
                          : "Retirez votre colis près de chez vous"}
                      </p>
                    </div>
                  </div>
                  {deliveryMode === "relay" && (
                    <div className="mt-4 pt-4 border-t border-green-200" onClick={e => e.stopPropagation()}>
                      {!relayPoint ? (
                        <div className="bg-white border-2 border-dashed border-[#1B5E20] rounded-xl p-4 text-center">
                          <MapPin className="w-6 h-6 text-[#1B5E20] mx-auto mb-2" />
                          <p className="text-sm font-medium text-[#1B5E20]">Choisir un point relais</p>
                          <p className="text-xs text-gray-400 mt-1">La carte interactive sera disponible prochainement</p>
                          <button
                            onClick={() => setRelayPoint({ name: "Tabac du Centre", city: "Paris", postal_code: "75001", address: "12 rue de Rivoli" })}
                            className="mt-3 text-xs text-[#1B5E20] underline"
                          >
                            Simuler un point relais (test)
                          </button>
                        </div>
                      ) : (
                        <div className="bg-white border border-green-200 rounded-xl p-4 flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                              <MapPin className="w-4 h-4 text-[#1B5E20]" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{relayPoint.name}</p>
                              <p className="text-xs text-gray-500">{relayPoint.address}</p>
                              <p className="text-xs text-gray-500">{relayPoint.postal_code} {relayPoint.city}</p>
                            </div>
                          </div>
                          <button onClick={() => setRelayPoint(null)} className="text-xs text-[#1B5E20] underline shrink-0 ml-2">Modifier</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div
                  onClick={() => setDeliveryMode("main_propre")}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    deliveryMode === "main_propre" ? "border-[#1B5E20] bg-green-50" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      deliveryMode === "main_propre" ? "bg-[#1B5E20]" : "bg-gray-100"
                    }`}>
                      <Users className={`w-5 h-5 ${deliveryMode === "main_propre" ? "text-white" : "text-gray-400"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">Remise en main propre</p>
                        <span className="text-sm text-[#1B5E20] font-medium">
                          {defaultRates.main_propre && defaultRates.main_propre.shipping_price > 0
                            ? `${defaultRates.main_propre.shipping_price.toFixed(2)} €`
                            : "Gratuit"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Rencontrez le vendeur pour récupérer l article</p>
                    </div>
                  </div>
                  {deliveryMode === "main_propre" && (
                    <div className="mt-4 pt-4 border-t border-green-200" onClick={e => e.stopPropagation()}>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">
                          Utilisez la messagerie SwingMarket pour organiser le rendez-vous. Ne partagez jamais vos coordonnées en dehors de la plateforme.
                        </p>
                      </div>
                      <Input
                        placeholder="Ville ou lieu souhaité (optionnel)"
                        value={meetupDetails}
                        onChange={e => setMeetupDetails(e.target.value)}
                        className="text-sm rounded-xl border-gray-200"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>

                {intentError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{intentError}</p>
                  </div>
                )}

                <button
                  onClick={handleProceedToPayment}
                  disabled={!deliveryValid || creatingIntent || shippingLoading}
                  className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-40 text-white rounded-full font-semibold py-3 flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  {creatingIntent ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Initialisation du paiement…
                    </>
                  ) : shippingLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Calcul des frais de livraison…
                    </>
                  ) : (
                    <>
                      Continuer vers le paiement <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            )}

            {step === 1 && clientSecret && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={handleBackToDelivery} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <h2 className="text-xl font-bold text-gray-900">Paiement sécurisé</h2>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 mb-4">
                  <Lock className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Paiement sécurisé par Stripe</p>
                    <p className="text-xs text-blue-600">Vos données bancaires ne sont jamais stockées sur nos serveurs</p>
                  </div>
                </div>

                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret, appearance: { theme: "stripe" } }}
                >
                  <PaymentForm
                    totalLabel={totalLabel}
                    orderId={orderId}
                    onBack={handleBackToDelivery}
                    placing={placing}
                    setPlacing={setPlacing}
                  />
                </Elements>

                <div className="flex items-center justify-center gap-4 mt-4">
                  {[
                    { icon: Shield, text: "Achat protégé" },
                    { icon: Lock, text: "SSL 256-bit" },
                    { icon: Star, text: "Stripe Secure" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Icon className="w-3.5 h-3.5" /> {text}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Votre commande</h3>

              <div className="flex gap-3 mb-4 pb-4 border-b border-gray-100">
                <img src={photo} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 line-clamp-2">{product.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Vendu par {product.seller_name}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Article</span>
                  <span className="font-medium text-gray-900">{articlePrice.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frais de service</span>
                  <span className="font-medium text-gray-900">{commissionAmount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {shippingCarrier && !shippingLoading
                      ? `Livraison via ${shippingCarrier}`
                      : "Livraison"}
                  </span>
                  <span className="font-medium text-gray-900">
                    {!deliveryMode
                      ? "—"
                      : shippingLoading
                        ? "Calcul en cours..."
                        : shippingAmount === 0
                          ? (deliveryMode === "main_propre" ? "Gratuit" : "À calculer")
                          : `${shippingAmount.toFixed(2)} €`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Protection acheteur</span>
                  <span className="text-gray-400">Incluse</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center mb-4">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-xl font-extrabold text-[#1B5E20]">{totalLabel}</span>
              </div>

              {deliveryMode && (
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-2">
                    {deliveryMode === "domicile" && <Truck className="w-4 h-4 text-[#1B5E20]" />}
                    {deliveryMode === "relay" && <MapPin className="w-4 h-4 text-[#1B5E20]" />}
                    {deliveryMode === "main_propre" && <Users className="w-4 h-4 text-[#1B5E20]" />}
                    <span className="text-xs font-medium text-gray-700">
                      {deliveryMode === "domicile"
                        ? "Livraison à domicile"
                        : deliveryMode === "relay"
                          ? "Point relais"
                          : "Remise en main propre"}
                    </span>
                  </div>
                  {deliveryMode === "domicile" && address.city && (
                    <p className="text-xs text-gray-400 mt-1 ml-6">{address.postal_code} {address.city}</p>
                  )}
                  {deliveryMode === "relay" && relayPoint && (
                    <p className="text-xs text-gray-400 mt-1 ml-6">{relayPoint.name}, {relayPoint.city}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {[
                  { icon: Shield, text: "Protection acheteur incluse" },
                  { icon: Lock, text: "Paiement 100% sécurisé" },
                  { icon: Package, text: "Livraison suivie" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-[#1B5E20] shrink-0" />
                    <span className="text-xs text-gray-500">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
