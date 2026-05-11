import React, { useState, useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { calculateCommission } from "@/components/utils/commissionCalculator";
import SendcloudRelayPicker from "@/components/checkout/SendcloudRelayPicker";
import ShippingAddressForm from "@/components/checkout/ShippingAddressForm";
import {
  Shield, Truck, ArrowLeft, MapPin,
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

  const [address, setAddress] = useState({ street: "", city: "", postal_code: "", phone: "" });
  const [relayPoint, setRelayPoint] = useState(null);
  const [relayPickerOpen, setRelayPickerOpen] = useState(false);

  const [creatingIntent, setCreatingIntent] = useState(false);
  const [intentError, setIntentError] = useState("");
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [placing, setPlacing] = useState(false);

  // Options de transport disponibles pour la taille du colis du produit
  // (chargées depuis shipping_rates en fonction de product.package_size).
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingOptionsLoading, setShippingOptionsLoading] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [commission, setCommission] = useState(0);

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

  // Charger les options de transport pour la taille du colis du produit.
  // 5 lignes attendues côté DB par taille (mondial_relay, chronopost_relay,
  // colissimo, chronopost_dom, fedex), ordonnées via display_order.
  useEffect(() => {
    if (!product?.package_size) {
      setShippingOptions([]);
      setSelectedShipping(null);
      return;
    }
    setShippingOptionsLoading(true);
    supabase
      .from("shipping_rates")
      .select("*")
      .eq("size_code", product.package_size)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .then(({ data, error }) => {
        setShippingOptionsLoading(false);
        if (error) {
          console.error("Erreur chargement shipping_rates:", error);
          return;
        }
        const list = data || [];
        setShippingOptions(list);
        if (list[0]) setSelectedShipping(list[0]);
      });
  }, [product?.package_size]);

  // Reset du point relais / adresse quand on change d'option (évite
  // d'envoyer un point relais Mondial Relay avec un transporteur Chronopost).
  useEffect(() => {
    setRelayPoint(null);
  }, [selectedShipping?.id]);

  const articlePrice = Number(product?.price || 0);

  // Commission calculée via la RPC Supabase (calculate_commission). On garde
  // un fallback sur le helper JS si la RPC ne répond pas (offline).
  useEffect(() => {
    if (!articlePrice) {
      setCommission(0);
      return;
    }
    let cancelled = false;
    supabase
      .rpc("calculate_commission", { article_price: articlePrice })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || data == null) {
          setCommission(Number(calculateCommission(articlePrice).toFixed(2)));
          return;
        }
        setCommission(Number(Number(data).toFixed(2)));
      });
    return () => {
      cancelled = true;
    };
  }, [articlePrice]);

  const commissionAmount = commission;
  const shippingAmount = selectedShipping
    ? Number(parseFloat(selectedShipping.shipping_price).toFixed(2))
    : 0;
  const shippingCarrier = selectedShipping?.carrier_name || null;
  const deliveryMode = selectedShipping?.delivery_mode || null;

  const totalPaid = Number((articlePrice + commissionAmount + shippingAmount).toFixed(2));
  const totalLabel = `${totalPaid.toFixed(2)} €`;

  const isAddressValid = (a) =>
    !!(a && a.street && a.city && a.postal_code);

  const canPay = useMemo(() => {
    if (!selectedShipping || !product?.package_size) return false;
    const mode = selectedShipping.delivery_mode;
    if (mode === "relay") return !!relayPoint;
    if (mode === "domicile") return isAddressValid(address);
    if (mode === "main_propre") return true;
    return false;
  }, [selectedShipping, relayPoint, address, product?.package_size]);

  const handleProceedToPayment = async () => {
    if (!product || !user || !canPay || creatingIntent) return;

    setCreatingIntent(true);
    setIntentError("");

    try {
      // Récupère le JWT pour authentifier l'appel serveur. Le serveur
      // recalcule tout (article + commission + livraison) — le client
      // n'envoie que des IDs, jamais des montants.
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        throw new Error("Session expirée, reconnectez-vous.");
      }

      const deliveryAddressPayload =
        deliveryMode === "domicile"
          ? {
              address1: address.street,
              address2: "",
              postalCode: address.postal_code,
              city: address.city,
              phone: address.phone || "",
            }
          : null;

      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          shipping_rate_id: selectedShipping.id,
          delivery_mode: selectedShipping.delivery_mode,
          relay_point_id:
            deliveryMode === "relay" ? String(relayPoint?.id || "") : null,
          relay_point_name:
            deliveryMode === "relay" ? relayPoint?.name || null : null,
          delivery_address: deliveryAddressPayload,
          buyer_email: user.email,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload.error || !payload.clientSecret) {
        throw new Error(payload.error || "Impossible d'initialiser le paiement.");
      }

      setOrderId(payload.orderId);
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
            to={product.slug ? `/product/${product.slug}` : createPageUrl("ProductDetail") + "?id=" + product.id}
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
                <h2 className="text-xl font-bold text-[#042C53] mb-1">Choisissez votre livraison</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Tarifs adaptés à la taille du colis du vendeur.
                </p>

                {!product.package_size && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      Livraison non configurée pour ce produit. Contactez le vendeur.
                    </p>
                  </div>
                )}

                {shippingOptionsLoading && (
                  <div className="bg-white border border-gray-100 rounded-xl p-4 text-center text-sm text-gray-500">
                    <div className="inline-block w-4 h-4 border-2 border-[#173404] border-t-transparent rounded-full animate-spin mr-2 align-[-2px]" />
                    Chargement des options de livraison…
                  </div>
                )}

                {!shippingOptionsLoading && product.package_size && shippingOptions.length === 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    Aucune option de livraison disponible pour ce produit pour le moment.
                  </div>
                )}

                <div className="space-y-3">
                  {shippingOptions.map((option) => {
                    const isSelected = selectedShipping?.id === option.id;
                    return (
                      <div key={option.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedShipping(option)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? "border-[#173404] bg-[#FAF8F3]"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-lg ${
                                  isSelected ? "bg-[#173404] text-white" : "bg-gray-100"
                                }`}
                              >
                                {option.delivery_mode === "relay" ? (
                                  <MapPin className={`w-5 h-5 ${isSelected ? "text-white" : "text-gray-500"}`} />
                                ) : (
                                  <Truck className={`w-5 h-5 ${isSelected ? "text-white" : "text-gray-500"}`} />
                                )}
                              </span>
                              <div>
                                <p className="font-semibold text-sm text-[#042C53]">
                                  {option.carrier_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {option.delivery_estimate || (option.delivery_mode === "relay" ? "Retrait en point relais" : "Livraison à domicile")}
                                </p>
                              </div>
                            </div>
                            <p className="font-bold text-[#173404]">
                              {parseFloat(option.shipping_price).toFixed(2)} €
                            </p>
                          </div>
                        </button>

                        {isSelected && option.delivery_mode === "relay" && (
                          <div className="mt-3 pl-4 border-l-2 border-[#173404]">
                            {relayPoint ? (
                              <div className="bg-white border border-[#173404]/20 rounded-xl p-3 flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2 min-w-0">
                                  <MapPin className="w-4 h-4 text-[#173404] shrink-0 mt-0.5" />
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 truncate">
                                      {relayPoint.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {relayPoint.street}{" "}
                                      {relayPoint.house_number}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {relayPoint.postal_code} {relayPoint.city}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setRelayPickerOpen(true)}
                                  className="text-xs text-[#173404] underline shrink-0 whitespace-nowrap"
                                >
                                  Modifier
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setRelayPickerOpen(true)}
                                className="w-full bg-white border-2 border-dashed border-[#173404] rounded-xl p-4 text-center hover:bg-[#FAF8F3] transition-colors"
                              >
                                <MapPin className="w-6 h-6 text-[#173404] mx-auto mb-1" />
                                <p className="text-sm font-medium text-[#173404]">
                                  Choisir un point relais sur la carte
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Carte interactive Sendcloud
                                </p>
                              </button>
                            )}
                          </div>
                        )}
                        {isSelected && option.delivery_mode === "domicile" && (
                          <div className="mt-3 pl-4 border-l-2 border-[#173404]">
                            <ShippingAddressForm address={address} onChange={setAddress} />
                          </div>
                        )}
                        {isSelected && option.delivery_mode === "main_propre" && (
                          <div className="mt-3 pl-4 border-l-2 border-amber-500 bg-amber-50/50 rounded-r-lg p-3">
                            <p className="text-sm font-semibold text-amber-900 mb-1 flex items-center gap-1.5">
                              <span aria-hidden="true">🤝</span>
                              Aucune garantie SwingMarketGolf
                            </p>
                            <ul className="text-xs text-amber-800 space-y-0.5">
                              <li>• Vous payez sur la plateforme (commission incluse)</li>
                              <li>• Pas de frais de port</li>
                              <li>• Vous convenez du rendez-vous avec le vendeur via la messagerie</li>
                              <li>• En cas de litige, SwingMarketGolf ne pourra pas intervenir</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {relayPickerOpen && selectedShipping?.delivery_mode === "relay" && (
                  <SendcloudRelayPicker
                    carrierId={selectedShipping.carrier_code}
                    onSelect={(p) => {
                      setRelayPoint(p);
                      setRelayPickerOpen(false);
                    }}
                    onClose={() => setRelayPickerOpen(false)}
                  />
                )}

                {intentError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 mt-3">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{intentError}</p>
                  </div>
                )}

                <button
                  onClick={handleProceedToPayment}
                  disabled={!canPay || creatingIntent}
                  className="w-full bg-[#173404] hover:bg-[#1f4a06] disabled:opacity-40 text-white rounded-full font-semibold py-3 flex items-center justify-center gap-2 transition-colors mt-4"
                >
                  {creatingIntent ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Initialisation du paiement…
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
                  <span className="text-gray-500">Commission SwingMarket</span>
                  <span className="font-medium text-gray-900">{commissionAmount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {shippingCarrier ? `Livraison via ${shippingCarrier}` : "Livraison"}
                  </span>
                  <span className="font-medium text-gray-900">
                    {selectedShipping ? `${shippingAmount.toFixed(2)} €` : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Protection acheteur</span>
                  <span className="text-gray-400">Incluse</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center mb-4">
                <span className="font-bold text-[#042C53]">Total</span>
                <span className="text-2xl font-extrabold text-[#173404]">{totalLabel}</span>
              </div>

              {selectedShipping && (
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-2">
                    {deliveryMode === "relay" ? (
                      <MapPin className="w-4 h-4 text-[#173404]" />
                    ) : (
                      <Truck className="w-4 h-4 text-[#173404]" />
                    )}
                    <span className="text-xs font-medium text-gray-700">
                      {selectedShipping.carrier_name}
                      {selectedShipping.delivery_estimate ? ` · ${selectedShipping.delivery_estimate}` : ""}
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
