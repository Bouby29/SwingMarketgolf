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
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

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
          });
        }
        setLoading(false);
      });
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      ...form,
    });
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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

      {/* Aperçu */}
      <div className="flex items-center gap-4 p-4 bg-[#F0F7F0] rounded-xl mb-6 border border-[#C8E6C9]">
        <div className="w-14 h-14 rounded-full bg-[#1B5E20] flex items-center justify-center text-white font-bold text-xl shrink-0">
          {displayName?.[0]?.toUpperCase() || "V"}
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
        </div>
      </div>
    </div>
  );
}
