import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import {
  CheckCircle, Clock, AlertCircle, ArrowLeft,
} from "lucide-react";

// Polling : on re-fetch la commande toutes les 2s en attendant que
// le webhook Stripe mette à jour payment_status. On arrête dès que
// le statut devient final (succeeded/failed) ou au bout de 30s.
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

export default function OrderSuccess() {
  const location = useLocation();
  const orderId = new URLSearchParams(location.search).get("orderId");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Refs pour gérer proprement le polling sans dépendances cycliques.
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;

    const fetchOrder = async () => {
      // Auth : un utilisateur non connecté est redirigé vers /Login.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/Login";
        return null;
      }

      if (!orderId) {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
        return null;
      }

      // Sécurité : on ne récupère QUE les commandes de l'acheteur courant.
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("buyer_id", session.user.id)
        .single();

      if (cancelled) return null;

      if (error || !data) {
        setNotFound(true);
        setOrder(null);
      } else {
        setOrder(data);
      }
      setLoading(false);
      return data;
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    // 1er fetch immédiat, puis polling tant que le statut n'est pas final.
    fetchOrder().then((initial) => {
      if (cancelled || !initial) return;

      const finalStatuses = ["succeeded", "failed"];
      if (finalStatuses.includes(initial.payment_status)) {
        return; // déjà finalisé, pas besoin de poller
      }

      startedAtRef.current = Date.now();
      intervalRef.current = setInterval(async () => {
        const fresh = await fetchOrder();
        if (cancelled) return;
        if (fresh && finalStatuses.includes(fresh.payment_status)) {
          stopPolling();
        }
      }, POLL_INTERVAL_MS);

      // Timeout global : on arrête de poller après 30s même si
      // le statut est encore 'pending' (le webhook arrivera, mais
      // on ne va pas tenir l'onglet ouvert indéfiniment).
      timeoutRef.current = setTimeout(() => {
        stopPolling();
      }, POLL_TIMEOUT_MS);
    });

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [orderId]);

  // ---------- États de rendu ----------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1B5E20] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande introuvable</h1>
          <p className="text-gray-500 mb-8">
            Cette commande n'existe pas ou ne vous appartient pas.
          </p>
          <Link to={createPageUrl("Marketplace")}>
            <Button className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full w-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ---------- Variantes selon payment_status ----------

  const status = order.payment_status || "pending";
  const isSucceeded = status === "succeeded";
  const isFailed = status === "failed";
  const isPending = !isSucceeded && !isFailed;

  const iconBg = isSucceeded
    ? "bg-green-100"
    : isFailed
      ? "bg-red-100"
      : "bg-amber-100";
  const iconColor = isSucceeded
    ? "text-[#1B5E20]"
    : isFailed
      ? "text-red-600"
      : "text-amber-600";
  const Icon = isSucceeded ? CheckCircle : isFailed ? AlertCircle : Clock;

  const title = isSucceeded
    ? "Commande confirmée !"
    : isFailed
      ? "Le paiement a échoué"
      : "Paiement en cours de validation";

  const message = isSucceeded
    ? "Le vendeur a été notifié. Vous recevrez l'article sous quelques jours."
    : isFailed
      ? "Aucun montant n'a été débité. Vous pouvez réessayer avec une autre carte."
      : "Nous validons votre paiement. Cela ne devrait prendre que quelques secondes…";

  const photo = order.product_image
    || (Array.isArray(order.product_images) ? order.product_images[0] : null)
    || "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=400&fit=crop";

  const articlePrice = Number(order.price || 0);
  const totalPaid = Number(order.total_paid || 0);

  const deliveryLabel =
    order.delivery_mode === "domicile" ? "Livraison à domicile" :
    order.delivery_mode === "relay" ? "Point relais" :
    order.delivery_mode === "main_propre" ? "Remise en main propre" :
    "Livraison";

  // Réessayer = repasser sur Checkout avec le même produit.
  const retryUrl = order.product_id
    ? `${createPageUrl("Checkout")}?product=${order.product_id}`
    : createPageUrl("Marketplace");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center">
        <div className={`w-20 h-20 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <Icon className={`w-10 h-10 ${iconColor} ${isPending ? "animate-pulse" : ""}`} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 mb-8">{message}</p>

        {/* Récap commande */}
        <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 mb-6 text-left">
          <img src={photo} className="w-14 h-14 rounded-xl object-cover shrink-0" alt="" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 line-clamp-1">
              {order.product_title || "Article"}
            </p>
            {order.seller_name && (
              <p className="text-xs text-gray-500 mt-0.5">Vendu par {order.seller_name}</p>
            )}
            <p className="text-[#1B5E20] font-bold mt-1">{articlePrice.toFixed(2)} €</p>
          </div>
        </div>

        {/* Détail des montants */}
        <div className="border-t border-gray-100 pt-4 mb-6 text-left space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Mode de livraison</span>
            <span className="text-gray-700 font-medium">{deliveryLabel}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-gray-100 mt-2">
            <span className="font-bold text-gray-900">Total payé</span>
            <span className="font-extrabold text-[#1B5E20]">{totalPaid.toFixed(2)} €</span>
          </div>
        </div>

        {/* Boutons d'action selon statut */}
        <div className="flex flex-col gap-3">
          {isFailed ? (
            <>
              <Link to={retryUrl}>
                <Button className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full w-full">
                  Réessayer le paiement
                </Button>
              </Link>
              <Link to={createPageUrl("Marketplace")}>
                <Button variant="outline" className="rounded-full w-full border-gray-200">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la marketplace
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to={createPageUrl("Dashboard")}>
                <Button className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full w-full">
                  Voir mes commandes
                </Button>
              </Link>
              <Link to={createPageUrl("Marketplace")}>
                <Button variant="outline" className="rounded-full w-full border-gray-200">
                  Continuer mes achats
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
