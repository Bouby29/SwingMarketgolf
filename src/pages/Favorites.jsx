import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, entities, auth } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Favorites() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const auth = !!session;
      if (!auth) { window.location.href='/login'; return; }
      setUser(session?.user || null);
    };
    init();
  }, []);

  const { data: favorites = [], refetch } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => entities.Favorite.filter({ user_id: user.id }, "-created_date", 100),
    enabled: !!user?.id,
  });

  const removeFavorite = async (id) => {
    await entities.Favorite.delete(id);
    refetch();
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Mes favoris</h1>
      <p className="text-gray-500 text-sm mb-8">{favorites.length} article{favorites.length !== 1 ? "s" : ""}</p>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Aucun favori</h3>
          <p className="text-gray-500 text-sm mt-1 mb-4">Ajoutez des articles à vos favoris pour les retrouver ici</p>
          <Link to={createPageUrl("Marketplace")}>
            <Button className="bg-[#1B5E20] rounded-full">Explorer la marketplace</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {favorites.map(fav => (
            <div key={fav.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm card-hover">
              <Link to={createPageUrl("ProductDetail") + `?id=${fav.product_id}`}>
                <div className="aspect-square overflow-hidden">
                  <img
                    src={fav.product_photo || "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=400&fit=crop"}
                    alt={fav.product_title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </Link>
              <div className="p-4">
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{fav.product_title}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-[#1B5E20] font-bold">{fav.product_price?.toFixed(2)} €</p>
                  <button onClick={() => removeFavorite(fav.id)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}