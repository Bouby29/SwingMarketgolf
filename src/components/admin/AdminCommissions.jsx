import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase as base44 } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const calcCommission = (price) => (price || 0) * 0.05 + 0.70;

export default function AdminCommissions() {
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-all-orders"],
    queryFn: () => base44.entities.Order.list("-created_date", 500),
  });

  const totalCommissions = orders.reduce((s, o) => s + (o.commission || calcCommission(o.price)), 0);

  const today = new Date();
  const todayStr = today.toDateString();
  const todayCommissions = orders
    .filter(o => new Date(o.created_date).toDateString() === todayStr)
    .reduce((s, o) => s + (o.commission || calcCommission(o.price)), 0);

  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();
  const monthCommissions = orders
    .filter(o => { const d = new Date(o.created_date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; })
    .reduce((s, o) => s + (o.commission || calcCommission(o.price)), 0);

  // Monthly chart
  const monthlyMap = {};
  orders.forEach(o => {
    const d = new Date(o.created_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    if (!monthlyMap[key]) monthlyMap[key] = { key, label, commissions: 0, count: 0 };
    monthlyMap[key].commissions += o.commission || calcCommission(o.price);
    monthlyMap[key].count += 1;
  });
  const monthlyData = Object.values(monthlyMap).sort((a, b) => a.key.localeCompare(b.key));

  return (
    <div className="space-y-6 bg-white rounded-xl p-6 border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-[#C5A028] bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-[#C5A028]">{totalCommissions.toFixed(2)}€</div>
            <div className="text-sm text-gray-700 mt-1 font-medium">Total commissions</div>
            <div className="text-xs text-gray-500 mt-1">depuis le lancement</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#1B5E20] bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-[#1B5E20]">{monthCommissions.toFixed(2)}€</div>
            <div className="text-sm text-gray-700 mt-1 font-medium">Ce mois-ci</div>
            <div className="text-xs text-gray-500 mt-1">
              {orders.filter(o => { const d = new Date(o.created_date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; }).length} transactions
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-300 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-gray-900">{todayCommissions.toFixed(2)}€</div>
            <div className="text-sm text-gray-700 mt-1 font-medium">Aujourd'hui</div>
            <div className="text-xs text-gray-500 mt-1">5% + 0,70€ / transaction</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">Évolution des commissions mensuelles</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v.toFixed(2)}€`, "Commissions"]} />
                <Bar dataKey="commissions" fill="#C5A028" name="Commissions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Pas encore de données</div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">Détail par transaction</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm overflow-x-auto">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Produit</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Vendeur</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Prix vente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">5% variable</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">0,70€ fixe</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 font-semibold">Total commission</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => {
                const variable = (order.price || 0) * 0.05;
                const total = order.commission || calcCommission(order.price || 0);
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-40">{order.product_title || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{order.seller_name || "-"}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{order.price}€</td>
                    <td className="px-4 py-3 text-gray-500">{variable.toFixed(2)}€</td>
                    <td className="px-4 py-3 text-gray-500">0,70€</td>
                    <td className="px-4 py-3 font-bold text-[#C5A028]">{total.toFixed(2)}€</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(order.created_date).toLocaleDateString('fr-FR')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">Aucune transaction enregistrée</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}