import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase as base44 } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle, Loader2, Upload, Image, Store } from "lucide-react";

export default function CustomizeShopSection({ user, onUpdate }) {
  const queryClient = useQueryClient();
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [shopData, setShopData] = useState({
    shop_name: "",
    shop_description: "",
    avatar: "",
    banner: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Load fresh user data on mount
  useEffect(() => {
    const load = async () => {
      try {
        const me = await Promise.resolve(null);
        setShopData({
          shop_name: me?.shop_name || me?.full_name || "",
          shop_description: me?.shop_description || "",
          avatar: me?.avatar || "",
          banner: me?.banner || "",
        });
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleImageUpload = async (file, field, setUploading) => {
    if (!file) return;
    setUploading(true);
    setErrorMsg("");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setShopData(prev => ({ ...prev, [field]: file_url }));
    } catch (e) {
      setErrorMsg("Erreur lors de l'upload de l'image.");
    }
    setUploading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await base44.auth.updateMe({
        shop_name: shopData.shop_name,
        shop_description: shopData.shop_description,
        avatar: shopData.avatar,
        banner: shopData.banner,
      });
      queryClient.invalidateQueries({ queryKey: ["profile-user"] });
      setSuccessMsg("Boutique mise à jour avec succès !");
      setTimeout(() => setSuccessMsg(""), 4000);
      onUpdate?.();
    } catch (err) {
      setErrorMsg("Erreur lors de la mise à jour. Veuillez réessayer.");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personnaliser ma boutique</h2>
        <p className="text-gray-600">Personnalisez l'apparence de votre espace vendeur</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Banner */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bannière de la boutique</label>
          <div
            className="relative h-36 rounded-xl overflow-hidden bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] cursor-pointer group border border-gray-200"
            onClick={() => bannerInputRef.current?.click()}
          >
            {shopData.banner ? (
              <img src={shopData.banner} alt="Bannière" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/70">
                <Image className="w-8 h-8 mb-2" />
                <span className="text-sm">Cliquez pour ajouter une bannière</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadingBanner ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleImageUpload(e.target.files[0], "banner", setUploadingBanner)}
          />
        </div>

        {/* Logo / Avatar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la boutique</label>
          <div className="flex items-center gap-4">
            <div
              className="relative w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] cursor-pointer group border border-gray-200 flex-shrink-0"
              onClick={() => logoInputRef.current?.click()}
            >
              {shopData.avatar ? (
                <img src={shopData.avatar} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Store className="w-8 h-8 text-white/70" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploadingLogo ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="text-sm text-[#1B5E20] font-medium hover:underline"
              >
                {uploadingLogo ? "Upload en cours..." : "Modifier le logo"}
              </button>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG — recommandé 200×200px</p>
            </div>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleImageUpload(e.target.files[0], "avatar", setUploadingLogo)}
          />
        </div>

        {/* Shop Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la boutique</label>
          <Input
            value={shopData.shop_name}
            onChange={e => setShopData(prev => ({ ...prev, shop_name: e.target.value }))}
            placeholder="Nom de votre boutique"
            className="rounded-lg"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <Textarea
            value={shopData.shop_description}
            onChange={e => setShopData(prev => ({ ...prev, shop_description: e.target.value }))}
            placeholder="Décrivez votre boutique, vos spécialités, vos engagements..."
            className="rounded-lg min-h-28"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{shopData.shop_description.length}/500 caractères</p>
        </div>

        {/* Feedback */}
        {successMsg && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || uploadingLogo || uploadingBanner}
          className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full w-full"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Enregistrement...</> : "Enregistrer les modifications"}
        </Button>
      </form>
    </div>
  );
}