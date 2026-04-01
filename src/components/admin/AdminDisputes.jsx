import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, entities, auth } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, RefreshCw, Mail } from "lucide-react";

export default function AdminDisputes() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [resolution, setResolution] = useState("");

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ["admin-disputes"],
    queryFn: () => entities.Order.filter({ status: "disputed" }, "-created_date", 100),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, newStatus }) =>
      entities.Order.update(id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-disputes"] });
      setSelectedOrder(null);
      setAdminNote("");
      setResolution("");
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async ({ order, recipient, message }) => {
      const email = recipient === "buyer" ? order.buyer_email : order.seller_email;
      const name = recipient === "buyer" ? order.buyer_name : order.seller_name;
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `⚠️ Litige commande "${order.product_title}" — SwingMarket`,
        body: `<p>Bonjour ${name},</p><p>${message}</p><p>— L'équipe SwingMarket</p>`,
      });
    },
  });

  if (isLoading) return <div className="text-center py-12 text-gray-400">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${disputes.length > 0 ? "bg-red-100" : "bg-green-100"}`}>
          <AlertTriangle className={`w-5 h-5 ${disputes.length > 0 ? "text-red-600" : "text-green-600"}`} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestion des litiges</h2>
          <p className="text-sm text-gray-500">{disputes.length} litige(s) en cours</p>
        </div>
      </div>

      {disputes.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-green-700 font-medium">Aucun litige en cours 🎉</p>
        </div>
      )}

      <div className="space-y-4">
        {disputes.map(order => (
          <div key={order.id} className={`bg-white border-2 rounded-xl p-5 ${selectedOrder?.id === order.id ? "border-red-300" : "border-red-100"}`}>
            <div className="flex justify-between items-start flex-wrap gap-3">
              <div>
                <p className="font-bold text-gray-900">{order.product_title}</p>
                <p className="text-sm text-gray-600">Acheteur : <strong>{order.buyer_name}</strong></p>
                <p className="text-sm text-gray-600">Vendeur : <strong>{order.seller_name}</strong></p>
                <p className="text-sm font-semibold text-[#1B5E20] mt-1">{order.price?.toFixed(2)} €</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(order.created_date).toLocaleDateString("fr-FR")}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
              >
                {selectedOrder?.id === order.id ? "Fermer" : "Gérer ce litige"}
              </Button>
            </div>

            {order.dispute_reason && (
              <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-700 mb-1">Motif signalé par l'acheteur :</p>
                <p className="text-sm text-red-800">{order.dispute_reason}</p>
              </div>
            )}

            {order.tracking_number && (
              <div className="mt-2 text-xs text-gray-500">
                📦 Tracking : <strong>{order.tracking_number}</strong>
                {order.shipping_label_url && (
                  <a href={order.shipping_label_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">
                    Voir étiquette
                  </a>
                )}
              </div>
            )}

            {selectedOrder?.id === order.id && (
              <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Résoudre le litige :</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white text-xs rounded-full"
                      onClick={() => resolveMutation.mutate({ id: order.id, newStatus: "completed" })}
                      disabled={resolveMutation.isPending}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Valider — libérer les fonds au vendeur
                    </Button>
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-full"
                      onClick={() => resolveMutation.mutate({ id: order.id, newStatus: "refunded" })}
                      disabled={resolveMutation.isPending}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" /> Rembourser l'acheteur
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs rounded-full"
                      onClick={() => resolveMutation.mutate({ id: order.id, newStatus: "delivered" })}
                      disabled={resolveMutation.isPending}
                    >
                      Remettre en attente de validation
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Contacter les parties :</p>
                  <Textarea
                    placeholder="Message à envoyer (acheteur ou vendeur)..."
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    className="text-sm h-20 mb-2"
                  />
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs rounded-full gap-1"
                      disabled={!adminNote.trim()}
                      onClick={() => sendEmailMutation.mutate({ order, recipient: "buyer", message: adminNote })}
                    >
                      <Mail className="w-3 h-3" /> Email à l'acheteur
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs rounded-full gap-1"
                      disabled={!adminNote.trim()}
                      onClick={() => sendEmailMutation.mutate({ order, recipient: "seller", message: adminNote })}
                    >
                      <Mail className="w-3 h-3" /> Email au vendeur
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}