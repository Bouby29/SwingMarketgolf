import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, ExternalLink } from "lucide-react";

export default function SellerProfileSection({ user }) {
  const [form, setForm] = useState({
    full_name: "",
    shop_name: "",
    bio: "",
    phone: "",
    city: "",
    avatar_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    supabase.from("profiles").select("*").eq("id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setForm({
            full_name: data.full_name || "",
            shop_name: data.shop_name || "",
            bio: data.bio || "",
            phone: data.phone || "",
            city: data.city || "",
            avatar_url: data.avatar_url || "",
          });
        }
        setLoading(false);
      });
  }, [user?.id]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      const path = `logos/${user.id}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("products").upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(path);
      setForm(prev => ({ ...prev, avatar_url: publicUrl }));
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
      if (updateError) throw updateError;
    } catch (err) {
      console.error("Erreur upload logo:", err);
      alert("Erreur upload : " + err.message);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    const { error } = await supabase.from("profiles")
      .update({
        full_name: form.full_name,
        shop_name: form.shop_name,
        bio: form.bio,
        phone: form.phone,
        city: form.city,
        avatar_url: form.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      console.error("Erreur save profil:", error);
      alert("Erreur lors de la sauvegarde : " + error.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 rounded-xl" />;

  const displayName = form.shop_name || form.full_name || user?.email;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mon profil vendeur</h2>
        <p className="text-gray-600">Votre identité publique sur la marketplace</p>
      </div>

      {/* Logo boutique */}
      <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Logo de la boutique</label>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0f7f0", border: "2px dashed #1B5E20", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            {form.avatar_url
              ? <img src={form.avatar_url} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: "1.8rem" }}>🏪</span>
            }
          </div>
          <div>
            <label style={{ display: "inline-block", background: "#1B5E20", color: "white", padding: "0.5rem 1rem", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
              {uploading ? "Upload..." : "Choisir un logo"}
              <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
            </label>
            <p style={{ color: "#888", fontSize: "0.75rem", marginTop: 6 }}>JPG, PNG ou WebP — affiché sur vos annonces</p>
            {form.avatar_url && (
              <button onClick={() => setForm(prev => ({ ...prev, avatar_url: "" }))} style={{ color: "#c62828", fontSize: "0.75rem", background: "none", border: "none", cursor: "pointer", marginTop: 4 }}>
                Supprimer le logo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Aperçu */}
      <div className="flex items-center gap-4 p-4 bg-[#F0F7F0] rounded-xl mb-6 border border-[#C8E6C9]">
        <div className="w-14 h-14 rounded-full bg-[#1B5E20] flex items-center justify-center text-white font-bold text-xl shrink-0 overflow-hidden">
          {form.avatar_url
            ? <img src={form.avatar_url} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : displayName?.[0]?.toUpperCase() || "V"
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900">{displayName || "Nom non défini"}</p>
          {form.shop_name && <p className="text-sm text-gray-500">Nom réel : {form.full_name || "non renseigné"}</p>}
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        <Link
          to={createPageUrl("Profile") + `?id=${user?.id}`}
          className="flex items-center gap-1 text-xs text-[#1B5E20] font-medium hover:underline shrink-0"
        >
          <ExternalLink className="w-3 h-3" />
          Voir mon profil
        </Link>
      </div>

      {/* Formulaire */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prénom & Nom <span className="text-gray-400 font-normal">(privé)</span>
            </label>
            <Input
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Alexandre Daniel"
            />
            <p className="text-xs text-gray-400 mt-1">Non affiché publiquement si vous avez un nom de boutique</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de boutique <span className="text-[#1B5E20] font-normal">(affiché aux acheteurs)</span>
            </label>
            <Input
              value={form.shop_name}
              onChange={e => setForm(f => ({ ...f, shop_name: e.target.value }))}
              placeholder="Ex: GolfPro29, SwingShop..."
            />
            <p className="text-xs text-gray-400 mt-1">Si renseigné, remplace votre nom sur vos annonces</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description / Bio</label>
          <textarea
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Parlez de vous, de votre passion pour le golf, du matériel que vous vendez..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20] resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <Input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="06 12 34 56 78"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <Input
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              placeholder="Paris, Lyon, Bordeaux..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1B5E20] hover:bg-[#145218] text-white rounded-full px-6"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
              <CheckCircle className="w-4 h-4" /> Profil mis à jour !
            </span>
          )}
          {saveError && (
            <span className="text-sm text-red-500">{saveError}</span>
          )}
        </div>
      </div>
    </div>
  );
}
