import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderProgress from "./OrderProgress";
import { CheckCircle, AlertTriangle, Clock, Star, Truck, MapPin } from "lucide-react";
import LeaveReviewModal from "./LeaveReviewModal";

function useCountdown(deliveredAt) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!deliveredAt) return;
    const deadline = new Date(deliveredAt).getTime() + 48 * 60 * 60 * 1000;
    const tick = () => {
      const diff = deadline - Date.now();
      setRemaining(diff > 0 ? diff : 0);
    };
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, [deliveredAt]);

  if (remaining === null) return null;
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  return remaining > 0 ? `${hours}h ${minutes}min` : "Expiré";
}

export default function BuyerOrderCard({ order }) {
  const queryClient = useQueryClient();
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const countdown = useCountdown(order.status === "delivered" ? order.delivered_at : null);

  const update = useMutation({
    mutationFn: (data) => base44.entities.Order.update(order.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-orders"] }),
  });

  // Auto-finalisation après 48h si l'acheteur ne fait rien
  useEffect(() => {
    if (order.status !== "delivered" || !order.delivered_at) return;
    const deadline = new Date(order.delivered_at).getTime() + 48 * 60 * 60 * 1000;
    if (Date.now() >= deadline) {
      update.mutate({ status: "completed" });
    }
  }, [order.status, order.delivered_at]);

  const handleMarkReceived = () => {
    update.mutate({ status: "delivered", delivered_at: new Date().toISOString() });
  };

  const handleConfirm = async () => {
    await base44.functions.invoke("releaseFundsToSeller", { orderId: order.id });
    queryClient.invalidateQueries({ queryKey: ["my-orders"] });
  };

  const handleDispute = () => {
    if (!disputeReason.trim()) return;
    update.mutate({ status: "disputed", dispute_reason: disputeReason });
    setShowDisputeForm(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-semibold text-gray-900">{order.product_title}</p>
          <p className="text-xs text-gray-500 mt-0.5">Vendeur : {order.seller_name}</p>
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
          <p className="font-bold text-gray-900 text-lg">{order.total_paid?.toFixed(2)} €</p>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <OrderProgress status={order.status} />

      {order.status === "shipped" && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
          <div className="text-xs text-purple-700 space-y-1">
            {order.tracking_number && (
              <div>📦 N° de suivi : <strong>{order.tracking_number}</strong></div>
            )}
            {order.tracking_number && (
              <a
                href={`https://tracking.sendcloud.sc/forward?carrier=${order.carrier_slug || order.shipping_method || 'colissimo'}&code=${order.tracking_number}&lang=fr-fr`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-purple-700 underline font-medium text-xs"
              >
                🔍 Suivre mon colis en direct →
              </a>
            )}
          </div>
          <p className="text-xs text-purple-800 font-medium">Votre colis est en route. Vous avez reçu votre commande ?</p>
          <Button
            className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs h-8 rounded-full gap-1"
            onClick={handleMarkReceived}
            disabled={update.isPending}
          >
            <CheckCircle className="w-3 h-3" /> J'ai reçu mon colis
          </Button>
        </div>
      )}

      {order.status === "delivered" && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-700" />
            <p className="text-sm font-medium text-teal-800">
              Votre colis est arrivé !
              {countdown && <span className="ml-2 text-xs text-teal-600">Temps restant : {countdown}</span>}
            </p>
          </div>
          <p className="text-xs text-teal-700">
            Tout est conforme ? Validez pour libérer le paiement au vendeur. Sinon, signalez un problème dans les 48h.
          </p>
          {!showDisputeForm ? (
            <div className="flex gap-2 flex-wrap">
              <Button
                className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs h-8 rounded-full gap-1"
                onClick={handleConfirm}
                disabled={update.isPending}
              >
                <CheckCircle className="w-3 h-3" /> Tout est parfait, valider
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-8 rounded-full gap-1"
                onClick={() => setShowDisputeForm(true)}
              >
                <AlertTriangle className="w-3 h-3" /> Signaler un problème
              </Button>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <Textarea
                placeholder="Décrivez le problème (article endommagé, non conforme...)"
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
                className="text-xs h-20"
              />
              <div className="flex gap-2">
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 rounded-full"
                  onClick={handleDispute}
                  disabled={update.isPending || !disputeReason.trim()}
                >
                  Envoyer le signalement
                </Button>
                <Button
                  variant="ghost"
                  className="text-xs h-8 rounded-full"
                  onClick={() => setShowDisputeForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {order.status === "completed" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <p className="text-xs text-green-700">✅ Commande finalisée. Merci pour votre achat !</p>
          {!order.reviewed ? (
            <button
              onClick={() => setShowReviewModal(true)}
              className="flex items-center gap-2 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2 hover:bg-yellow-100 transition-colors"
            >
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              Laisser un avis sur le vendeur
            </button>
          ) : (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Vous avez déjà laissé un avis
            </p>
          )}
        </div>
      )}

      {showReviewModal && (
        <LeaveReviewModal order={order} onClose={() => setShowReviewModal(false)} />
      )}

      {order.status === "disputed" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
          ⚠️ Litige en cours de traitement. Notre équipe vous contactera sous 24h.
        </div>
      )}
    </div>
  );
}