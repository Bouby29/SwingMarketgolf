import React from "react";
import { Badge } from "@/components/ui/badge";

export const STATUS_CONFIG = {
  pending_validation: { label: "En attente de validation", class: "bg-yellow-100 text-yellow-800", step: 1 },
  preparing:          { label: "Commande en préparation", class: "bg-blue-100 text-blue-800", step: 2 },
  shipped:            { label: "Colis en cours de livraison", class: "bg-purple-100 text-purple-800", step: 3 },
  delivered:          { label: "Colis livré", class: "bg-teal-100 text-teal-800", step: 4 },
  completed:          { label: "Commande finalisée", class: "bg-green-100 text-green-800", step: 5 },
  disputed:           { label: "⚠️ Litige en cours", class: "bg-red-100 text-red-800", step: 5 },
  refunded:           { label: "Remboursée", class: "bg-gray-100 text-gray-600", step: 5 },
};

export default function OrderStatusBadge({ status }) {
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG.pending_validation;
  return <Badge className={`text-xs font-medium ${conf.class}`}>{conf.label}</Badge>;
}