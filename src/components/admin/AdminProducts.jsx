import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, entities, auth } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Trash2, EyeOff, Eye, ChevronRight } from "lucide-react";
import ProductDetailModal from "./ProductDetailModal";

const STATUS_COLORS = {
  active: "bg-green-100 text-green-700",
  sold: "bg-gray-100 text-gray-600",
  reserved: "bg-yellow-100 text-yellow-700",
  inactive: "bg-red-100 text-red-600",
};

const STATUS_LABELS = {
  active: "Active",
  sold: "Vendue",
  reserved: "Réservée",
  inactive: "Suspendue",
};

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-all-products"],
    queryFn: () => entities.Product.list("-created_date", 500),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => entities.Product.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-all-products"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-all-products"] }),
  });

  const filtered = products.filter(p => {
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.seller_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const today = new Date().toDateString();
  const todayCount = products.filter(p => new Date(p.created_date).toDateString() === today).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <div className="text-2xl font-bold text-gray-900">{products.length}</div>
          <div className="text-xs text-gray-500">Total annonces</div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="text-2xl font-bold text-green-600">{products.filter(p => p.status === "active").length}</div>
          <div className="text-xs text-gray-500">Actives</div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="text-2xl font-bold text-orange-500">+{todayCount}</div>
          <div className="text-xs text-gray-500">Aujourd'hui</div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="text-2xl font-bold text-red-500">{products.filter(p => p.status === "inactive").length}</div>
          <div className="text-xs text-gray-500">Suspendues</div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher par titre, vendeur, marque..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tous statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Tous</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="sold">Vendue</SelectItem>
            <SelectItem value="inactive">Suspendue</SelectItem>
            <SelectItem value="reserved">Réservée</SelectItem>
          </SelectContent>
        </Select>
        <Badge className="self-center bg-green-50 text-green-700">{filtered.length} résultats</Badge>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Annonce</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Vendeur</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Prix</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Catégorie</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Statut</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(product => (
             <tr key={product.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {product.photos?.[0] ? (
                      <img src={product.photos[0]} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                    )}
                    <span className="font-medium text-gray-900 truncate max-w-36">{product.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{product.seller_name || "-"}</td>
                <td className="px-4 py-3 font-semibold text-[#1B5E20]">{product.price}€</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{product.category || "-"}</td>
                <td className="px-4 py-3">
                  <Badge className={`text-xs ${STATUS_COLORS[product.status] || ""}`}>
                    {STATUS_LABELS[product.status] || product.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(product.created_date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="ghost" size="sm"
                      className={product.status === "active" ? "text-orange-500 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}
                      onClick={() => updateMutation.mutate({ id: product.id, data: { status: product.status === "active" ? "inactive" : "active" } })}
                      title={product.status === "active" ? "Suspendre" : "Activer"}
                    >
                      {product.status === "active" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => { if (confirm("Supprimer définitivement cette annonce ?")) deleteMutation.mutate(product.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-gray-300 self-center" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">Aucune annonce trouvée</div>
        )}
      </div>

      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}