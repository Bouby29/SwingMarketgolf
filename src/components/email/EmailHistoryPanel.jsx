import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase as base44 } from "@/lib/supabase";
import { Mail, CheckCircle, AlertCircle, Calendar } from "lucide-react";

export default function EmailHistoryPanel() {
  const { data: emailHistory = [], isLoading } = useQuery({
    queryKey: ["email-history"],
    queryFn: async () => {
      const user = await Promise.resolve(null);
      return base44.entities.EmailHistory.filter({
        user_email: user.email
      }, "-created_date", 50);
    },
    staleTime: 5 * 60 * 1000
  });

  const emailTypeLabels = {
    signup_confirmation: "Inscription confirmée",
    listing_published: "Annonce publiée",
    new_order_seller: "Nouvelle commande (vendeur)",
    order_confirmation_buyer: "Confirmation de commande",
    order_preparing: "Commande en préparation",
    order_shipped: "Colis expédié",
    order_delivered: "Colis livré",
    refund_processed: "Remboursement effectué",
    support_reply: "Réponse support",
    new_message: "Nouveau message"
  };

  const getStatusIcon = (status) => {
    return status === "sent" ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getTypeColor = (type) => {
    const colors = {
      signup_confirmation: "bg-blue-50 border-blue-200",
      listing_published: "bg-green-50 border-green-200",
      new_order_seller: "bg-yellow-50 border-yellow-200",
      order_confirmation_buyer: "bg-indigo-50 border-indigo-200",
      order_preparing: "bg-orange-50 border-orange-200",
      order_shipped: "bg-cyan-50 border-cyan-200",
      order_delivered: "bg-emerald-50 border-emerald-200",
      refund_processed: "bg-violet-50 border-violet-200",
      support_reply: "bg-rose-50 border-rose-200",
      new_message: "bg-pink-50 border-pink-200"
    };
    return colors[type] || "bg-gray-50 border-gray-200";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Mail className="w-5 h-5 text-[#1B5E20]" />
        <h3 className="text-lg font-semibold text-gray-900">Historique des emails</h3>
        <span className="ml-auto text-sm text-gray-500">{emailHistory.length} emails</span>
      </div>

      {emailHistory.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun email envoyé pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {emailHistory.map((email) => (
            <div
              key={email.id}
              className={`border rounded-lg p-4 ${getTypeColor(email.email_type)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(email.status)}
                    <h4 className="font-semibold text-gray-900">
                      {emailTypeLabels[email.email_type] || email.email_type}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{email.subject}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(email.created_date).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    email.status === "sent"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {email.status === "sent" ? "Envoyé" : "Erreur"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}