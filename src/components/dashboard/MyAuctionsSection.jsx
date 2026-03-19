import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Gavel, Clock } from "lucide-react";
import { useEffect, useState } from "react";

function CountdownDisplay({ endDate }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) { setTimeLeft("Terminée"); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 0) setTimeLeft(`${days}j ${hours}h`);
      else setTimeLeft(`${hours}h restantes`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [endDate]);

  return <span>{timeLeft}</span>;
}

export default function MyAuctionsSection({ myProducts }) {
  const activeAuctions = myProducts.filter(
    p => p.sale_type === "auction" && p.status === "active" && new Date(p.auction_end_date) > new Date()
  );
  const closedAuctions = myProducts.filter(
    p => p.sale_type === "auction" && (p.status === "sold" || p.status === "inactive" || (p.auction_end_date && new Date(p.auction_end_date) < new Date()))
  );

  if (activeAuctions.length === 0 && closedAuctions.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes enchères</h2>
          <p className="text-gray-600">Gérez vos produits en mode enchère</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border">
          <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900">Aucune enchère</p>
          <p className="text-sm text-gray-500 mt-1">Lors de la création d'une annonce, choisissez le mode "Enchère".</p>
        </div>
      </div>
    );
  }

  const AuctionRow = ({ p, active }) => (
    <div className={`bg-white rounded-xl p-4 border flex items-center gap-4 ${active ? "border-amber-100" : "border-gray-100"}`}>
      <img
        src={p.photos?.[0] || "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=100&h=100&fit=crop"}
        alt=""
        className="w-16 h-16 rounded-lg object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">{p.title}</h3>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <p className="text-[#1B5E20] font-bold text-sm">
            {(p.auction_current_price || p.auction_start_price)?.toFixed(2)} €
          </p>
          <span className="text-xs text-gray-400">
            · {p.auction_bids_count || 0} enchère{(p.auction_bids_count || 0) > 1 ? "s" : ""}
          </span>
        </div>
        {!active && p.auction_winner_name && (
          <p className="text-xs text-gray-500 mt-0.5">🏆 Remportée par {p.auction_winner_name}</p>
        )}
      </div>
      <div className="text-right shrink-0 space-y-1">
        {active ? (
          <Badge className="bg-amber-100 text-amber-700 border-0 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <CountdownDisplay endDate={p.auction_end_date} />
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">Terminée</Badge>
        )}
        <div>
          <Link to={createPageUrl("ProductDetail") + `?id=${p.id}`}>
            <span className="text-xs text-[#1B5E20] hover:underline">Voir l'annonce →</span>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes enchères</h2>
        <p className="text-gray-600">Gérez vos produits en mode enchère</p>
      </div>

      {activeAuctions.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Enchères actives</h3>
          <div className="space-y-3">
            {activeAuctions.map(p => <AuctionRow key={p.id} p={p} active />)}
          </div>
        </div>
      )}

      {closedAuctions.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Enchères terminées</h3>
          <div className="space-y-3">
            {closedAuctions.map(p => <AuctionRow key={p.id} p={p} active={false} />)}
          </div>
        </div>
      )}
    </div>
  );
}