import React, { useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, entities, auth } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Gavel, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function CountdownBadge({ endDate }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) { setTimeLeft("Terminée"); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (days > 0) setTimeLeft(`${days}j ${hours}h`);
      else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m`);
      else setTimeLeft(`${minutes}m`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [endDate]);

  return <span>{timeLeft}</span>;
}

export default function AuctionCarousel() {
  const scrollRef = useRef(null);

  const { data: auctionProducts = [] } = useQuery({
    queryKey: ["auction-products-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .eq("type_de_vente", "enchères")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const activeAuctions = auctionProducts.filter(
    p => p.auction_end_date && new Date(p.auction_end_date) > new Date()
  );

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <section className="w-full px-4 py-12 bg-gradient-to-br from-amber-50 via-orange-50 to-white relative z-0">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-sm">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">Ventes aux enchères</h2>
              <p className="text-amber-600 text-sm font-medium">Remportez la mise avant la fin du chrono !</p>
            </div>
          </div>
          {activeAuctions.length > 0 && (
            <div className="flex gap-2">
              <button onClick={() => scroll("left")} className="p-2 hover:bg-amber-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button onClick={() => scroll("right")} className="p-2 hover:bg-amber-100 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Empty state */}
        {activeAuctions.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-amber-100">
            <Gavel className="w-10 h-10 text-amber-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucune enchère en cours pour le moment</p>
            <p className="text-gray-400 text-sm mt-1">Revenez bientôt ou publiez votre première enchère !</p>
          </div>
        )}

        {/* Carousel */}
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide">
          {activeAuctions.map(product => (
            <Link
              key={product.id}
              to={createPageUrl("ProductDetail") + `?id=${product.id}`}
              className="flex-shrink-0 w-64 bg-white rounded-2xl border border-amber-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={product.images?.[0] || "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=300&h=200&fit=crop"}
                  alt={product.title}
                  className="w-full h-44 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-amber-500 text-white border-0 text-xs flex items-center gap-1">
                    <Gavel className="w-3 h-3" /> Enchère
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <CountdownBadge endDate={product.auction_end_date} />
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm text-gray-900 truncate mb-1">{product.title}</p>
                {product.brand && <p className="text-xs text-gray-400 mb-2">{product.brand}</p>}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-gray-400">{(product.auction_bids_count || 0) > 0 ? "Meilleure offre" : "Prix de départ"}</p>
                    <p className="text-lg font-bold text-[#1B5E20]">
                      {(product.auction_current_price || product.auction_start_price)?.toFixed(2)} €
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {product.auction_bids_count || 0} offre{(product.auction_bids_count || 0) > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}