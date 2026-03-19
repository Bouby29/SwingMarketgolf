import React from "react";
import { Badge } from "@/components/ui/badge";
import { Gavel, Tag } from "lucide-react";

export default function ReviewStep({ form, category }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Résumé de votre annonce</h2>

      {form.photos && form.photos.length > 0 ? (
        <div className="mb-6">
          <img 
            src={form.photos[0]} 
            alt="Aperçu du produit" 
            className="w-full h-80 object-cover rounded-xl"
          />
        </div>
      ) : (
        <div className="mb-6 bg-gray-100 h-80 rounded-xl flex items-center justify-center">
          <p className="text-gray-400">Aucune photo</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Titre</p>
          <p className="text-2xl font-bold text-gray-900">{form.title || "Non renseigné"}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 py-6 border-y">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Marque</p>
            <p className="text-lg font-semibold text-gray-900">{form.brand || "Non renseigné"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Catégorie</p>
            <p className="text-lg font-semibold text-gray-900">{category || "Non renseigné"}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Description</p>
          <p className="text-gray-700 leading-relaxed">{form.description || "Non renseigné"}</p>
        </div>

        {form.sale_type === 'auction' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <Gavel className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-amber-800">Vente aux enchères</p>
              <p className="text-xs text-amber-700">
                Prix de départ : {form.price}€ · Durée : {form.auction_duration || 7} jour{(parseInt(form.auction_duration) || 7) > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-4 pt-6 border-t">
          <div className={`${form.sale_type === 'auction' ? 'bg-amber-50' : 'bg-green-50'} p-4 rounded-lg`}>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{form.sale_type === 'auction' ? 'Prix de départ' : 'Prix'}</p>
            <p className={`text-2xl font-bold ${form.sale_type === 'auction' ? 'text-amber-600' : 'text-[#1B5E20]'}`}>{form.price ? `${form.price}€` : "Non renseigné"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">État</p>
            <Badge variant="secondary" className="capitalize">{form.condition || "Non renseigné"}</Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Taille colis</p>
            <p className="text-gray-900 font-semibold capitalize">{form.package_size || "Non renseigné"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Livraison</p>
            <p className="text-gray-900 font-semibold capitalize">{form.shipping_carrier || "Non renseigné"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}