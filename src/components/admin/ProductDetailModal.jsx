import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Eye, EyeOff, ChevronLeft, ChevronRight, Tag, Package, User, Calendar, TrendingUp } from "lucide-react";

const STATUS_COLORS = {
  active: "bg-green-100 text-green-700",
  sold: "bg-gray-100 text-gray-600",
  reserved: "bg-yellow-100 text-yellow-700",
  inactive: "bg-red-100 text-red-600",
};

const CONDITION_LABELS = {
  neuf: "Neuf",
  comme_neuf: "Comme neuf",
  bon_etat: "Bon état",
  etat_correct: "État correct",
};

export default function ProductDetailModal({ product, open, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || "",
        description: product.description || "",
        price: product.price || "",
        retail_price: product.retail_price || "",
        brand: product.brand || "",
        category: product.category || "",
        subcategory: product.subcategory || "",
        condition: product.condition || "",
        status: product.status || "active",
        package_size: product.package_size || "",
      });
      setPhotoIndex(0);
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.update(product.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-all-products"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Product.delete(product.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-products"] });
      onClose();
    },
  });

  if (!product) return null;

  const photos = product.photos || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-gray-900 pr-6">
            {product.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">

          {/* PHOTOS */}
          {photos.length > 0 && (
            <div className="relative">
              <img
                src={photos[photoIndex]}
                alt=""
                className="w-full h-52 object-cover rounded-xl"
              />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setPhotoIndex(i => (i - 1 + photos.length) % photos.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPhotoIndex(i => (i + 1) % photos.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                    {photoIndex + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* INFOS LECTURE SEULE */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 text-sm">
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-400">Vendeur</div>
                <div className="font-medium text-gray-800">{product.seller_name || "-"}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-400">Publiée le</div>
                <div className="font-medium text-gray-800">{new Date(product.created_date).toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-400">Vues</div>
                <div className="font-medium text-gray-800">{product.views || 0}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-400">Statut actuel</div>
                <Badge className={`text-xs ${STATUS_COLORS[product.status]}`}>
                  {product.status === "active" ? "Active" : product.status === "sold" ? "Vendue" : product.status === "inactive" ? "Suspendue" : product.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* MODIFICATION */}
          <div className="border-t pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Modifier l'annonce</p>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Titre</label>
              <Input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="text-sm" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="text-sm h-24 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Prix (€)</label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: parseFloat(e.target.value)}))} className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Prix neuf conseillé (€)</label>
                <Input type="number" value={form.retail_price} onChange={e => setForm(f => ({...f, retail_price: parseFloat(e.target.value)}))} className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Marque</label>
                <Input value={form.brand} onChange={e => setForm(f => ({...f, brand: e.target.value}))} className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Catégorie</label>
                <Input value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">État</label>
                <Select value={form.condition} onValueChange={v => setForm(f => ({...f, condition: v}))}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="État" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neuf">Neuf</SelectItem>
                    <SelectItem value="comme_neuf">Comme neuf</SelectItem>
                    <SelectItem value="bon_etat">Bon état</SelectItem>
                    <SelectItem value="etat_correct">État correct</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Statut</label>
                <Select value={form.status} onValueChange={v => setForm(f => ({...f, status: v}))}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Suspendue</SelectItem>
                    <SelectItem value="reserved">Réservée</SelectItem>
                    <SelectItem value="sold">Vendue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={() => updateMutation.mutate(form)}
              disabled={updateMutation.isPending}
              className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white"
            >
              {updateMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>

          {/* ZONE SENSIBLE */}
          <div className="border border-red-200 rounded-xl p-4 space-y-3 bg-red-50/40">
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Zone sensible</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className={`flex-1 gap-2 text-sm font-medium ${form.status === "active"
                  ? "border-orange-400 text-orange-600 hover:bg-orange-50"
                  : "border-green-400 text-green-700 hover:bg-green-50"}`}
                onClick={() => updateMutation.mutate({ status: form.status === "active" ? "inactive" : "active" })}
                disabled={updateMutation.isPending}
              >
                {form.status === "active"
                  ? <><EyeOff className="w-4 h-4" /> Suspendre l'annonce</>
                  : <><Eye className="w-4 h-4" /> Réactiver l'annonce</>}
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 text-sm font-medium border-red-400 text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (confirm("Supprimer définitivement cette annonce ? Action irréversible.")) deleteMutation.mutate();
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4" /> Supprimer l'annonce
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}