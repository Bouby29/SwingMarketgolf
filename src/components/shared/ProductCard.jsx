import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Heart, Shield, Check, Gavel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

const conditionLabels = {
  neuf: "Neuf",
  comme_neuf: "Comme neuf",
  bon_etat: "Bon état",
  etat_correct: "État correct",
};

const conditionColors = {
  neuf: "bg-emerald-100 text-emerald-800",
  comme_neuf: "bg-blue-100 text-blue-800",
  bon_etat: "bg-yellow-100 text-yellow-800",
  etat_correct: "bg-gray-100 text-gray-700",
};

export default function ProductCard({ product, showFavorite = true }) {
  const [isFav, setIsFav] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get user session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUserId(data.session.user.id);
    });
    // Get favorites count
    supabase.from("favorites").select("*", { count: "exact", head: true })
      .eq("product_id", product.id)
      .then(({ count }) => setFavCount(count || 0));
    // Check if user already favorited
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const { data: fav } = await supabase.from("favorites")
        .select("id").eq("product_id", product.id).eq("user_id", data.session.user.id).single();
      if (fav) setIsFav(true);
    });
  }, [product.id]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) { window.location.href = "/Login"; return; }
    if (loading) return;
    setLoading(true);

    if (isFav) {
      await supabase.from("favorites").delete()
        .eq("product_id", product.id).eq("user_id", userId);
      setIsFav(false);
      setFavCount(c => Math.max(0, c - 1));
    } else {
      await supabase.from("favorites").insert({ product_id: product.id, user_id: userId });
      setIsFav(true);
      setFavCount(c => c + 1);
    }
    setLoading(false);
  };

  const placeholder = "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=300&fit=crop";
  const isNew = product.created_at && (new Date() - new Date(product.created_at)) < 10 * 24 * 60 * 60 * 1000;

  return (
    <Link to={createPageUrl("ProductDetail") + `?id=${product.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.images?.[0] || placeholder}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {showFavorite && (
            <button
              onClick={toggleFavorite}
              className={`absolute top-3 right-3 flex flex-col items-center gap-0.5 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-sm transition-all ${isFav ? "bg-red-50/90 hover:bg-red-100" : "bg-white/90 hover:bg-white"}`}
            >
              <Heart className={`w-4 h-4 transition-all ${isFav ? "fill-red-500 text-red-500 scale-110" : "text-gray-400"}`} />
              {favCount > 0 && (
                <span className={`text-[9px] font-bold ${isFav ? "text-red-500" : "text-gray-700"}`}>{favCount}</span>
              )}
            </button>
          )}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 flex-wrap">
            {isNew && (
              <div className="bg-gradient-to-r from-emerald-500 to-green-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                ✨ Fraîchement arrivé
              </div>
            )}
            {product.sale_type === "auction" ? (
              <Badge className="bg-amber-500 text-white border-0 text-[9px] font-bold flex items-center gap-0.5 px-2 py-0.5">
                <Gavel className="w-2.5 h-2.5" />
                Enchère
              </Badge>
            ) : product.condition && (
              <Badge className={`${conditionColors[product.condition]} border-0 text-[9px] font-medium px-2 py-0.5`}>
                {conditionLabels[product.condition]}
              </Badge>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-3 flex flex-col flex-1">
          {product.seller_name && (
            <div className="flex items-center gap-1.5 mb-2">
              <p className="text-[11px] text-gray-400">
                Vendu par <span className="font-medium text-gray-600">{product.seller_name}</span>
              </p>
              <Badge className="bg-green-100 text-green-700 border-0 text-[9px] py-0 px-1.5 flex items-center gap-0.5 shrink-0">
                <Check className="w-2.5 h-2.5" />
                Vérifié
              </Badge>
            </div>
          )}
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-[#1B5E20] transition-colors flex-1">
            {product.title}
          </h3>
          <div className="mt-auto">
            <p className="text-lg font-extrabold text-[#1B5E20]">{product.price?.toFixed(2)} €</p>
            <div className="flex items-center gap-1 mt-1.5">
              <Shield className="w-3 h-3 text-[#1B5E20] shrink-0" />
              <span className="text-[10px] text-gray-500">Protection acheteur incluse</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
