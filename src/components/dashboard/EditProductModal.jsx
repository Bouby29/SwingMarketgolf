import React, { useState } from "react";
import { base44 } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";

export default function EditProductModal({ product, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: product.title,
    description: product.description,
    price: product.price,
    photos: product.photos || []
  });
  const [newPhoto, setNewPhoto] = useState(null);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewPhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const updateData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price)
    };

    if (newPhoto) {
      updateData.photos = [newPhoto, ...formData.photos.slice(1)];
    }

    await base44.entities.Product.update(product.id, updateData);
    setLoading(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Modifier le produit</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Photo */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Photo</label>
            <div className="relative">
              <img
                src={newPhoto || formData.photos?.[0]}
                alt="Produit"
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <label className="flex items-center justify-center gap-2 w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                <Upload className="w-4 h-4" />
                Changer la photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Titre</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
            />
          </div>

          {/* Prix */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Prix (€)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Sauvegarde..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}