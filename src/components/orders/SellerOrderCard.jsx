import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, entities, auth } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderProgress from "./OrderProgress";
import { CheckCircle, Printer, Truck, AlertCircle, Download, Loader2, ExternalLink, MapPin } from "lucide-react";

export default function SellerOrderCard({ order }) {
  const queryClient = useQueryClient();
  const [trackingInput, setTrackingInput] = useState(order.tracking_number || "");
  const [generatingLabel, setGeneratingLabel] = useState(false);
  const [labelError, setLabelError] = useState("");

  const update = useMutation({
    mutationFn: (data) => entities.Order.update(order.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-sales"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-orders"] });
    },
  });

  const handleValidate = () => {
    update.mutate({ status: "preparing" });
  };

  const handleShipped = () => {
    if (!trackingInput.trim()) return;
    update.mutate({ status: "shipped", tracking_number: trackingInput });
  };

  const handleGenerateLabel = async () => {
    setGeneratingLabel(true);
    setLabelError("");
    const res = await base44.functions.invoke("createShippingLabel", { orderId: order.id });
    if (res.data?.success) {
      queryClient.invalidateQueries({ queryKey: ["my-sales"] });
      if (res.data.tracking_number) setTrackingInput(res.data.tracking_number);
    } else {
      setLabelError(res.data?.error || "Erreur lors de la génération de l'étiquette");
    }
    setGeneratingLabel(false);
  };

  // Suivi Sendcloud
  const trackingUrl = order.tracking_number
    ? `https://tracking.sendcloud.sc/forward?carrier=${order.carrier_slug || "colissimo"}&code=${order.tracking_number}&lang=fr-fr`
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-semibold text-gray-900">{order.product_title}</p>
          <p className="text-xs text-gray-500 mt-0.5">Acheteur : {order.buyer_name}</p>
          <p className="text-xs text-gray-400">{new Date(order.created_date).toLocaleDateString("fr-FR")}</p>
          {order.carrier_name && (
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Truck className="w-3 h-3" /> {order.carrier_name}
              {order.relay_point_name && (
                <span className="flex items-center gap-0.5 ml-1">
                  <MapPin className="w-3 h-3" /> {order.relay_point_name}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-[#1B5E20] text-lg">{order.price?.toFixed(2)} €</p>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <OrderProgress status={order.status} />

      {/* Validation commande */}
      {order.status === "pending_validation" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">Nouvelle commande !</p>
            <p className="text-xs text-yellow-700 mt-1">Confirmez que l'article est disponible pour valider la commande.</p>
            <Button
              className="mt-3 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs h-8 rounded-full gap-2"
              onClick={handleValidate}
              disabled={update.isPending}
            >
              <CheckCircle className="w-4 h-4" /> Valider la disponibilité
            </Button>
          </div>
        </div>
      )}

      {/* En préparation */}
      {order.status === "preparing" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-medium text-blue-800">Préparez votre colis</p>
          </div>

          {/* Adresse de livraison */}
          {order.buyer_address && (
            <div className="text-xs text-blue-700 bg-blue-100 rounded-lg p-2">
              <p className="font-semibold mb-0.5">📍 Livraison :</p>
              {order.relay_point_name ? (
                <p>{order.relay_point_name} — {order.relay_point_address}</p>
              ) : (
                <p>{order.buyer_address}, {order.buyer_postal_code} {order.buyer_city}</p>
              )}
            </div>
          )}

          {/* Étiquette */}
          {order.shipping_label_url ? (
            <div className="space-y-2">
              <a href={order.shipping_label_url} target="_blank" rel="noreferrer">
                <Button variant="outline" className="text-xs h-8 rounded-full gap-1 border-blue-300 text-blue-700 w-full">
                  <Download className="w-3 h-3" /> Télécharger l'étiquette PDF
                </Button>
              </a>
              {order.tracking_number && (
                <p className="text-xs text-blue-600 font-medium">
                  N° suivi : <strong>{order.tracking_number}</strong>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <Button
                onClick={handleGenerateLabel}
                disabled={generatingLabel}
                className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs h-8 rounded-full gap-1 w-full"
              >
                {generatingLabel ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Génération en cours...</>
                ) : (
                  <><Printer className="w-3 h-3" /> Générer l'étiquette Sendcloud</>
                )}
              </Button>
              {labelError && <p className="text-xs text-red-600">{labelError}</p>}
            </div>
          )}

          {/* Saisie manuelle + colis posté */}
          <div className="flex gap-2 pt-1">
            <Input
              placeholder="N° de suivi"
              value={trackingInput}
              onChange={e => setTrackingInput(e.target.value)}
              className="h-8 text-xs"
            />
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 rounded-full gap-1 shrink-0"
              onClick={handleShipped}
              disabled={update.isPending || !trackingInput.trim()}
            >
              <Truck className="w-3 h-3" /> Colis posté
            </Button>
          </div>
        </div>
      )}

      {/* Expédié */}
      {order.status === "shipped" && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2 text-xs text-purple-700">
          <div className="flex items-center gap-1">
            <Truck className="w-4 h-4 inline" />
            <span>Colis en transit — N° suivi : <strong>{order.tracking_number || "—"}</strong></span>
          </div>
          {trackingUrl && (
            <a href={trackingUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-purple-700 underline font-medium"
            >
              <ExternalLink className="w-3 h-3" /> Suivre le colis →
            </a>
          )}
          {order.shipping_label_url && (
            <a href={order.shipping_label_url} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 underline font-medium ml-3"
            >
              <Download className="w-3 h-3" /> Étiquette PDF
            </a>
          )}
        </div>
      )}

      {order.status === "delivered" && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-700">
          Colis livré. En attente de confirmation de l'acheteur (48h max).
        </div>
      )}

      {order.status === "disputed" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 inline mr-1" />
          Litige ouvert : <strong>{order.dispute_reason || "Non précisé"}</strong>
        </div>
      )}

      {order.status === "completed" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
          ✅ Commande finalisée. Paiement libéré.
        </div>
      )}
    </div>
  );
}