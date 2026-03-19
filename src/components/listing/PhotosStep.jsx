import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { X, Image as ImageIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PhotosStep({ photos, onPhotosChange }) {
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    onPhotosChange([...photos, ...urls]);
    setUploading(false);
  };

  const removePhoto = (index) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Étape 4 : Photos</h2>
      <Label className="mb-3 block text-gray-900 font-medium">Ajouter des photos de votre produit *</Label>
      <div className="flex flex-wrap gap-3">
        {photos.map((url, i) => (
          <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button 
              type="button" 
              onClick={() => removePhoto(i)} 
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#1B5E20] transition-colors">
          {uploading ? (
            <div className="w-5 h-5 border-2 border-[#1B5E20] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-gray-400" />
              <span className="text-[10px] text-gray-400 mt-1">Ajouter</span>
            </>
          )}
          <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
        </label>
      </div>
      {photos.length === 0 && <p className="text-xs text-red-500 mt-2">Au moins 1 photo est requise</p>}
    </div>
  );
}