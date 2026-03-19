import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase as base44 } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Shield, Truck, Home, CheckCircle, Info, MapPin, ChevronRight, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEmailService } from "../components/email/useEmailService";
import { calculateCommission, getCommissionTier } from "../components/utils/commissionCalculator";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "../components/checkout/StripePaymentForm";
import SendcloudRelayPicker from "../components/checkout/SendcloudRelayPicker";
import ShippingAddressForm from "../components/checkout/ShippingAddressForm";

// Modes de livraison fixes
const DELIVERY_MODES = [
  {
    key: "domicile",
    label: "Livraison à domicile",
    icon: "home",
    description: "Colissimo — Livré chez vous",
    carrier_filter: (m) => m.carrier === "colissimo" && m.service_point_input === "none",
  },
  {
    key: "relay",
    label: "Point relais",
    icon: "relay",
    description: "Chronopost Shop2Shop — Retrait en point relais",
    carrier_filter: (m) =>
      (m.carrier === "chronopost" || m.carrier === "mondial_relay") &&
      (m.service_point_input === "required" || m.service_point_input === "optional"),
  },
];

export default function Checkout() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("product");

  const [user, setUser] = useState(null);
  const [deliveryMode, setDeliveryMode] = useState("domicile"); // "domicile" | "relay"
  const [selectedCarrierId, setSelectedCarrierId] = useState(null);
  const [selectedRelayPoint, setSelectedRelayPoint] = useState(null);
  const [showRelayPicker, setShowRelayPicker] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({ street: "", postal_code: "", city: "", phone: "" });

  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [loadingIntent, setLoadingIntent] = useState(false);

  const { sendNewOrderSeller, sendOrderConfirmationBuyer } = useEmailService();

  useEffect(() => {
    const init = async () => {
      const auth = await Promise.resolve(true);
      if (!auth) { base44.auth.redirectToLogin(); return; }
      const me = await Promise.resolve(null);
      setUser(me);
      // Pré-remplir adresse depuis le profil
      if (me) {
        setShippingAddress({
          street: me.address || "",
          postal_code: me.postal_code || "",
          city: me.city || "",
          phone: me.phone || "",
        });
      }
    };
    init();
  }, []);

  const { data: product } = useQuery({
    queryKey: ["checkout-product", productId],
    queryFn: () => base44.entities.Product.filter({ id: productId }),
    select: d => d[0],
    enabled: !!productId,
  });

  const parcelWeightMap = { small: 2, medium: 4, large: 15 };
  const parcelWeight = product ? (parcelWeightMap[product.package_size] ?? product.weight_kg ?? 2) : 2;

  // Récupérer les méthodes Sendcloud
  const { data: allMethods = [] } = useQuery({
    queryKey: ["sendcloud-methods", parcelWeight],
    queryFn: async () => {
      const res = await base44.functions.invoke("getSendcloudShippingMethods", {});
      const methods = res.data?.shipping_methods || [];
      return methods.filter(m => {
        const hasFR = m.countries?.some(c => c.iso_2 === "FR");
        const inWeight = parseFloat(m.min_weight) <= parcelWeight && parseFloat(m.max_weight) >= parcelWeight;
        return hasFR && inWeight && m.carrier !== "sendcloud";
      }).map(m => {
        const fr = m.countries?.find(c => c.iso_2 === "FR");
        return { ...m, price_fr: fr?.price ?? 0 };
      });
    },
    enabled: !!product,
  });

  // Séparer les méthodes par mode
  const domicileCarriers = allMethods.filter(m =>
    m.carrier === "colissimo" && m.service_point_input === "none"
  ).sort((a, b) => a.price_fr - b.price_fr);

  const relayCarriers = allMethods.filter(m =>
    (m.carrier === "chronopost" || m.carrier === "mondial_relay") &&
    (m.service_point_input === "required" || m.service_point_input === "optional")
  ).sort((a, b) => a.price_fr - b.price_fr);

  // Sélectionner automatiquement le premier de chaque mode
  const activeCarriers = deliveryMode === "domicile" ? domicileCarriers : relayCarriers;

  useEffect(() => {
    if (activeCarriers.length > 0) {
      setSelectedCarrierId(String(activeCarriers[0].id));
    } else {
      setSelectedCarrierId(null);
    }
  }, [deliveryMode, allMethods.length]);

  // Réinitialiser point relais si changement de mode
  useEffect(() => {
    setSelectedRelayPoint(null);
  }, [deliveryMode]);

  const selectedCarrier = activeCarriers.find(c => String(c.id) === selectedCarrierId);
  const shippingCost = selectedCarrier?.price_fr ?? 0;
  const commission = product ? calculateCommission(product.price) : 0;
  const commissionTier = product ? getCommissionTier(product.price) : null;
  const total = product ? product.price + commission + shippingCost : 0;

  const isRelayMode = deliveryMode === "relay";

  // Validation adresse
  const addressValid = isRelayMode
    ? !!selectedRelayPoint
    : !!(shippingAddress.street?.trim() && shippingAddress.postal_code?.trim() && shippingAddress.city?.trim());

  const handleProceedToPayment = async () => {
    if (!addressValid) {
      alert(isRelayMode ? "Veuillez sélectionner un point relais." : "Veuillez remplir votre adresse de livraison.");
      return;
    }
    if (!selectedCarrierId) {
      alert("Aucun transporteur disponible pour ce colis.");
      return;
    }
    setLoadingIntent(true);
    const response = await base44.functions.invoke("createPaymentIntent", {
      amount: total,
      productId: product.id,
      shipping: selectedCarrierId,
    });
    const { clientSecret: cs, publishableKey } = response.data;
    setStripePromise(loadStripe(publishableKey));
    setClientSecret(cs);
    setLoadingIntent(false);
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    const orderData = {
      product_id: product.id,
      product_title: product.title,
      buyer_id: user.id,
      buyer_name: user.full_name,
      seller_id: product.seller_id,
      seller_name: product.seller_name,
      price: product.price,
      commission,
      total_paid: total,
      shipping_method: selectedCarrierId, // ID Sendcloud
      carrier_slug: selectedCarrier?.carrier || "",
      carrier_name: selectedCarrier?.name || "",
      shipping_cost: shippingCost,
      status: "pending_validation",
      payment_intent_id: paymentIntent.id,
      buyer_address: isRelayMode ? "" : shippingAddress.street,
      buyer_city: isRelayMode ? (selectedRelayPoint?.city || "") : shippingAddress.city,
      buyer_postal_code: isRelayMode ? (selectedRelayPoint?.postal_code || "") : shippingAddress.postal_code,
      buyer_phone: shippingAddress.phone,
      ...(selectedRelayPoint && {
        relay_point_id: String(selectedRelayPoint.id),
        relay_point_name: selectedRelayPoint.name,
        relay_point_address: `${selectedRelayPoint.street} ${selectedRelayPoint.house_number}, ${selectedRelayPoint.postal_code} ${selectedRelayPoint.city}`,
        buyer_address: `${selectedRelayPoint.street} ${selectedRelayPoint.house_number}`,
      }),
    };

    const order = await base44.entities.Order.create(orderData);
    await base44.entities.Product.update(product.id, { status: "sold" });

    const seller = await base44.entities.User.filter({ id: product.seller_id });
    if (seller?.length > 0) {
      await sendNewOrderSeller(seller[0], order, product);
      await sendOrderConfirmationBuyer(user, order, product, seller[0]);
    }

    setProcessing(false);
    setCompleted(true);
  };

  if (!product || !user) return null;

  if (completed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[#1B5E20]" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Commande confirmée !</h1>
        <p className="text-gray-500 mb-6">Votre paiement a été sécurisé. Le vendeur sera notifié.</p>
        <Button onClick={() => window.location.href = createPageUrl("Dashboard")} className="bg-[#1B5E20] rounded-full">
          Voir mes commandes
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-8 text-gray-900">
        <h1 className="text-2xl font-bold mb-8">Récapitulatif</h1>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-6">
            {/* Article */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 flex gap-4">
              <img
                src={product.photos?.[0] || "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=100&h=100&fit=crop"}
                alt="" className="w-20 h-20 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-medium text-gray-900">{product.title}</h3>
                <p className="text-sm text-gray-500">{product.brand}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  Colis {product.package_size || "medium"} — {parcelWeight} kg
                </p>
                <p className="text-lg font-bold text-[#1B5E20] mt-1">{product.price?.toFixed(2)} €</p>
              </div>
            </div>

            {/* Sélection du mode de livraison */}
            {!clientSecret && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-[#1B5E20]" />
                  <h2 className="font-semibold text-gray-900">Mode de livraison</h2>
                </div>

                {/* Choix domicile / relais */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeliveryMode("domicile")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      deliveryMode === "domicile" ? "border-[#1B5E20] bg-green-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Home className={`w-6 h-6 ${deliveryMode === "domicile" ? "text-[#1B5E20]" : "text-gray-400"}`} />
                    <div className="text-center">
                      <p className="font-semibold text-sm">À domicile</p>
                      <p className="text-xs text-gray-500">Colissimo</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setDeliveryMode("relay")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      deliveryMode === "relay" ? "border-[#1B5E20] bg-green-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <MapPin className={`w-6 h-6 ${deliveryMode === "relay" ? "text-[#1B5E20]" : "text-gray-400"}`} />
                    <div className="text-center">
                      <p className="font-semibold text-sm">Point relais</p>
                      <p className="text-xs text-gray-500">Chronopost / Mondial Relay</p>
                    </div>
                  </button>
                </div>

                {/* Transporteurs disponibles pour ce mode */}
                {activeCarriers.length > 0 ? (
                  <div className="space-y-2">
                    {activeCarriers.map((carrier) => (
                      <label
                        key={carrier.id}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedCarrierId === String(carrier.id) ? "border-[#1B5E20] bg-green-50" : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="carrier"
                            value={String(carrier.id)}
                            checked={selectedCarrierId === String(carrier.id)}
                            onChange={() => setSelectedCarrierId(String(carrier.id))}
                            className="accent-[#1B5E20]"
                          />
                          <div>
                            <p className="font-medium text-sm text-gray-900">{carrier.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{carrier.carrier}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-sm">{carrier.price_fr?.toFixed(2)} €</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">
                    Aucun transporteur disponible pour ce type de colis.
                  </p>
                )}

                {/* Adresse domicile */}
                {deliveryMode === "domicile" && (
                  <div className="pt-2 border-t border-gray-100">
                    <ShippingAddressForm address={shippingAddress} onChange={setShippingAddress} />
                  </div>
                )}

                {/* Point relais */}
                {deliveryMode === "relay" && (
                  <div className="pt-2 border-t border-gray-100">
                    {!selectedRelayPoint && (
                      <p className="text-xs text-amber-600 font-medium mb-2 flex items-center gap-1">
                        ⚠️ Vous devez sélectionner un point relais pour continuer
                      </p>
                    )}
                    {selectedRelayPoint ? (
                      <div className="flex items-start justify-between bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-[#1B5E20] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{selectedRelayPoint.name}</p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {selectedRelayPoint.street} {selectedRelayPoint.house_number}, {selectedRelayPoint.postal_code} {selectedRelayPoint.city}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowRelayPicker(true)}
                          className="text-xs text-[#1B5E20] underline hover:no-underline ml-2 flex-shrink-0"
                        >
                          Modifier
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowRelayPicker(true)}
                        className="w-full flex items-center justify-between p-4 border-2 border-dashed border-[#1B5E20] rounded-xl text-[#1B5E20] hover:bg-green-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-medium">Choisir un point relais</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                    <Input
                      placeholder="Téléphone (recommandé)"
                      value={shippingAddress.phone || ""}
                      onChange={e => setShippingAddress(a => ({ ...a, phone: e.target.value }))}
                      className="text-sm mt-3"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Stripe */}
            {clientSecret && stripePromise && (
              <div className="bg-white rounded-xl p-6 border">
                <h2 className="font-semibold mb-4">Paiement sécurisé</h2>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePaymentForm
                    onSuccess={handlePaymentSuccess}
                    processing={processing}
                    setProcessing={setProcessing}
                  />
                </Elements>
              </div>
            )}
          </div>

          {/* Récap total */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
              <h2 className="font-semibold mb-4 text-gray-900">Total</h2>
              <div className="space-y-2 text-sm text-gray-900">
                <div className="flex justify-between">
                  <span className="text-gray-500">Article</span>
                  <span>{product.price?.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Livraison</span>
                  <span>{shippingCost.toFixed(2)} €</span>
                </div>
                {selectedCarrier && (
                  <div className="text-xs text-gray-400 text-right">{selectedCarrier.name}</div>
                )}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-blue-900">Protection acheteur</p>
                      <p className="text-xs text-blue-700 mt-1">{commissionTier}</p>
                    </div>
                  </div>
                  <div className="flex justify-between font-semibold text-blue-900">
                    <span className="text-xs">Montant</span>
                    <span>{commission.toFixed(2)} €</span>
                  </div>
                </div>
                {isRelayMode && selectedRelayPoint && (
                  <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-2">
                    <MapPin className="w-3 h-3 text-[#1B5E20] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{selectedRelayPoint.name}</p>
                      <p className="text-xs text-gray-500">{selectedRelayPoint.postal_code} {selectedRelayPoint.city}</p>
                    </div>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-[#1B5E20]">{total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              {!clientSecret && (
                <>
                  {!addressValid && (
                    <p className="text-xs text-red-500 mt-3 text-center">
                      {isRelayMode ? "⚠️ Sélectionnez un point relais" : "⚠️ Remplissez votre adresse de livraison"}
                    </p>
                  )}
                  <Button
                    onClick={handleProceedToPayment}
                    disabled={loadingIntent || !addressValid || !selectedCarrierId}
                    size="lg"
                    className="w-full mt-3 bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full font-semibold disabled:opacity-50"
                  >
                    {loadingIntent ? "Préparation..." : "Procéder au paiement →"}
                  </Button>
                </>
              )}

              <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-[#1B5E20]" />
                <span>Paiement sécurisé par Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRelayPicker && (
        <SendcloudRelayPicker
          carrierId={selectedCarrier?.carrier || "chronopost"}
          onSelect={(point) => {
            setSelectedRelayPoint(point);
            setShowRelayPicker(false);
          }}
          onClose={() => setShowRelayPicker(false)}
        />
      )}
    </>
  );
}