import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Heart, Shield, Check, Gavel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    Promise.resolve(true).then(setIsLoggedIn);
  }, []);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) { base44.auth.redirectToLogin(); return; }
    const user = await Promise.resolve(null);
    if (isFav) {
      const favs = await base44.entities.Favorite.filter({ user_id: user.id, product_id: product.id });
      if (favs.length > 0) await base44.entities.Favorite.delete(favs[0].id);
      // Decrement favorites_count
      await base44.entities.Product.update(product.id, {
        favorites_count: Math.max(0, (product.favorites_count || 0) - 1)
      });
      setIsFav(false);
    } else {
      await base44.entities.Favorite.create({
        user_id: user.id,
        product_id: product.id,
        product_title: product.title,
        product_price: product.price,
        product_photo: product.photos?.[0] || "",
      });
      // Increment favorites_count
      await base44.entities.Product.update(product.id, {
        favorites_count: (product.favorites_count || 0) + 1
      });
      setIsFav(true);
    }
  };

  const placeholder = "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=300&fit=crop";

  return (
    <Link to={createPageUrl("ProductDetail") + `?id=${product.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.photos?.[0] || placeholder}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {showFavorite && (
            <button
              onClick={toggleFavorite}
              className="absolute top-3 right-3 flex flex-col items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-sm hover:bg-white transition-colors"
            >
              <Heart className={`w-4 h-4 ${isFav ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
              {product.favorites_count > 0 && (
                <span className="text-[9px] font-bold text-gray-700">{product.favorites_count}</span>
              )}
            </button>
          )}
          {product.sale_type === 'auction' ? (
            <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0 text-xs font-bold flex items-center gap-1">
              <Gavel className="w-3 h-3" />
              Enchère
            </Badge>
          ) : product.condition && (
            <Badge className={`absolute top-3 left-3 ${conditionColors[product.condition]} border-0 text-xs font-medium`}>
              {conditionLabels[product.condition]}
            </Badge>
          )}
        </div>

        {/* Body */}
        <div className="p-3 flex flex-col flex-1">
          {/* Seller */}
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

          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-[#1B5E20] transition-colors flex-1">
            {product.title}
          </h3>

          {/* Price */}
          <div className="mt-auto">
            <p className="text-lg font-extrabold text-[#1B5E20]">
              {product.price?.toFixed(2)} €
            </p>

            {/* Buyer protection */}
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