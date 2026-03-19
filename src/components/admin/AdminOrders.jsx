import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_CONFIG = {
  pending_validation: { label: "En attente de validation", class: "bg-yellow-100 text-yellow-700" },
  preparing:          { label: "En préparation",           class: "bg-blue-100 text-blue-700" },
  shipped:            { label: "En livraison",             class: "bg-purple-100 text-purple-700" },
  delivered:          { label: "Colis livré",              class: "bg-teal-100 text-teal-700" },
  completed:          { label: "Finalisée",                class: "bg-green-100 text-green-700" },
  disputed:           { label: "⚠️ Litige",                class: "bg-red-100 text-red-700" },
  refunded:           { label: "Remboursée",               class: "bg-orange-100 text-orange-700" },
};

const calcCommission = (price) => ((price || 0) * 0.05 + 0.70).toFixed(2);

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState("");
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-all-orders"],
    queryFn: () => base44.entities.Order.list("-created_date", 500),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-all-orders"] }),
  });

  const filtered = !statusFilter ? orders : orders.filter(o => o.status === statusFilter);

  const totalRevenue = orders.reduce((s, o) => s + (o.price || 0), 0);
  const totalCommissions = orders.reduce((s, o) => s + (o.commission || parseFloat(calcCommission(o.price))), 0);
  const disputes = orders.filter(o => o.status === "disputed").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
          <div className="text-xs text-gray-500">Total commandes</div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="text-2xl font-bold text-[#1B5E20]">{totalRevenue.toFixed(0)}€</div>
          <div className="text-xs text-gray-500">Chiffre d'affaires</div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="text-2xl font-bold text-[#C5A028]">{totalCommissions.toFixed(0)}€</div>
          <div className="text-xs text-gray-500">Commissions perçues</div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className={`text-2xl font-bold ${disputes > 0 ? "text-red-600" : "text-gray-400"}`}>{disputes}</div>
          <div className="text-xs text-gray-500">Litiges ouverts</div>
        </div>
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Tous ({orders.length})</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v.label} ({orders.filter(o => o.status === k).length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Produit</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Acheteur</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Vendeur</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Prix</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Commission</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Statut</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Modifier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(order => {
              const conf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_validation;
              return (
                <tr key={order.id} className={`hover:bg-gray-50 ${order.status === "disputed" ? "bg-red-50" : ""}`}>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-36 truncate">{order.product_title || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{order.buyer_name || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{order.seller_name || "-"}</td>
                  <td className="px-4 py-3 font-semibold text-[#1B5E20]">{order.price}€</td>
                  <td className="px-4 py-3 text-[#C5A028] font-medium">
                    {order.commission || calcCommission(order.price || 0)}€
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${conf.class}`}>{conf.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(order.created_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Select
                      value={order.status}
                      onValueChange={(val) => updateMutation.mutate({ id: order.id, data: { status: val } })}
                    >
                      <SelectTrigger className="w-36 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">Aucune commande</div>
        )}
      </div>
    </div>
  );
}