import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, entities, auth } from "@/lib/supabase";
import { Users, Package, ShoppingCart, TrendingUp, Euro, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const calcCommission = (price) => (price || 0) * 0.05 + 0.70;

export default function AdminOverview() {
  const { data: users = [] } = useQuery({ queryKey: ["admin-users"], queryFn: () => entities.User.list() });
  const { data: products = [] } = useQuery({ queryKey: ["admin-all-products"], queryFn: () => entities.Product.list("-created_date", 500) });
  const { data: orders = [] } = useQuery({ queryKey: ["admin-all-orders"], queryFn: () => entities.Order.list("-created_date", 500) });

  const totalRevenue = orders.reduce((s, o) => s + (o.price || 0), 0);
  const totalCommissions = orders.reduce((s, o) => s + (o.commission || calcCommission(o.price)), 0);
  const activeProducts = products.filter(p => p.status === "active").length;

  const today = new Date().toDateString();
  const todayProducts = products.filter(p => new Date(p.created_date).toDateString() === today).length;
  const newUsersThisWeek = users.filter(u => {
    const d = new Date(u.created_date);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;

  // Monthly chart data from orders
  const monthlyMap = {};
  orders.forEach(o => {
    const d = new Date(o.created_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('fr-FR', { month: 'short' });
    if (!monthlyMap[key]) monthlyMap[key] = { key, label, revenue: 0, commissions: 0, count: 0 };
    monthlyMap[key].revenue += o.price || 0;
    monthlyMap[key].commissions += o.commission || calcCommission(o.price);
    monthlyMap[key].count += 1;
  });
  const chartData = Object.values(monthlyMap).sort((a, b) => a.key.localeCompare(b.key)).slice(-6);

  const stats = [
    { label: "Utilisateurs", value: users.length, icon: Users, color: "bg-blue-500", sub: `+${newUsersThisWeek} cette semaine` },
    { label: "Annonces actives", value: activeProducts, icon: Package, color: "bg-green-600", sub: `+${todayProducts} aujourd'hui` },
    { label: "Commandes", value: orders.length, icon: ShoppingCart, color: "bg-purple-500", sub: `${orders.filter(o => o.status === 'pending').length} en attente` },
    { label: "Chiffre d'affaires", value: `${totalRevenue.toFixed(0)}€`, icon: Euro, color: "bg-orange-500", sub: "Total plateforme" },
    { label: "Commissions", value: `${totalCommissions.toFixed(0)}€`, icon: TrendingUp, color: "bg-yellow-500", sub: "5% + 0,70€ / vente" },
    { label: "Litiges ouverts", value: orders.filter(o => o.status === "disputed").length, icon: Activity, color: "bg-red-500", sub: "À traiter" },
  ];

  return (
    <div className="space-y-6 bg-white rounded-xl p-6 border">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="overflow-hidden bg-white shadow-sm">
            <CardContent className="p-4">
              <div className={`w-9 h-9 ${s.color} rounded-lg flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs font-medium text-gray-700 mt-0.5">{s.label}</div>
              <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">Chiffre d'affaires mensuel</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v.toFixed(0)}€`, "CA"]} />
                  <Bar dataKey="revenue" fill="#1B5E20" name="CA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                Pas encore de données
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">Commissions mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v.toFixed(2)}€`, "Commissions"]} />
                  <Line type="monotone" dataKey="commissions" stroke="#C5A028" strokeWidth={2.5} dot={{ r: 4, fill: "#C5A028" }} name="Commissions" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                Pas encore de données
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">Dernières commandes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Produit</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Acheteur</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Montant</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.slice(0, 5).map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-48">{order.product_title || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{order.buyer_name || "-"}</td>
                  <td className="px-4 py-3 font-semibold text-[#1B5E20]">{order.price}€</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(order.created_date).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">Aucune commande</div>}
        </CardContent>
      </Card>
    </div>
  );
}