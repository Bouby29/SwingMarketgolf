import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, LayoutDashboard, Users, Package, ShoppingCart, TrendingUp, Truck, HelpCircle, AlertTriangle } from "lucide-react";
import AdminOverview from "../components/admin/AdminOverview";
import AdminUsers from "../components/admin/AdminUsers";
import AdminProducts from "../components/admin/AdminProducts";
import AdminOrders from "../components/admin/AdminOrders";
import AdminCommissions from "../components/admin/AdminCommissions";
import AdminShipping from "../components/admin/AdminShipping";
import AdminFAQ from "../components/admin/AdminFAQ";
import AdminDisputes from "../components/admin/AdminDisputes";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(null).then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Shield className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Accès refusé</h1>
        <p className="text-gray-500 mt-2">Vous n'avez pas les droits d'accès à cette page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white px-6 py-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Administration SwingMarket</h1>
            <p className="text-green-100 text-sm">Tableau de bord administrateur</p>
          </div>
          <span className="ml-auto text-green-100 text-sm hidden md:block bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">{user.email}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview">
          <TabsList className="mb-8 bg-gray-100 border-gray-200 h-auto flex-wrap gap-2 p-2 shadow-sm">
            <TabsTrigger value="overview" className="gap-2 text-sm data-[state=active]:bg-white data-[state=active]:text-[#1B5E20] data-[state=active]:shadow-md">
              <LayoutDashboard className="w-4 h-4" /> Vue globale
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 text-sm data-[state=active]:bg-white data-[state=active]:text-[#1B5E20] data-[state=active]:shadow-md">
              <Users className="w-4 h-4" /> Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2 text-sm data-[state=active]:bg-white data-[state=active]:text-[#1B5E20] data-[state=active]:shadow-md">
              <Package className="w-4 h-4" /> Annonces
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 text-sm data-[state=active]:bg-white data-[state=active]:text-[#1B5E20] data-[state=active]:shadow-md">
              <ShoppingCart className="w-4 h-4" /> Commandes
            </TabsTrigger>
            <TabsTrigger value="commissions" className="gap-2 text-sm data-[state=active]:bg-white data-[state=active]:text-[#1B5E20] data-[state=active]:shadow-md">
              <TrendingUp className="w-4 h-4" /> Commissions
            </TabsTrigger>
            <TabsTrigger value="shipping" className="gap-2 text-sm data-[state=active]:bg-white data-[state=active]:text-[#1B5E20] data-[state=active]:shadow-md">
              <Truck className="w-4 h-4" /> Offres de transport
            </TabsTrigger>
            <TabsTrigger value="disputes" className="gap-2 text-sm data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-md">
              <AlertTriangle className="w-4 h-4" /> Litiges
            </TabsTrigger>
            <TabsTrigger value="faq" className="gap-2 text-sm data-[state=active]:bg-white data-[state=active]:text-[#1B5E20] data-[state=active]:shadow-md">
              <HelpCircle className="w-4 h-4" /> FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><AdminOverview /></TabsContent>
          <TabsContent value="users"><AdminUsers /></TabsContent>
          <TabsContent value="products"><AdminProducts /></TabsContent>
          <TabsContent value="orders"><AdminOrders /></TabsContent>
          <TabsContent value="commissions"><AdminCommissions /></TabsContent>
          <TabsContent value="shipping"><AdminShipping /></TabsContent>
          <TabsContent value="disputes"><AdminDisputes /></TabsContent>
          <TabsContent value="faq"><AdminFAQ /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}