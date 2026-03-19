import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gavel, Clock, TrendingUp, Users } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { calculateCommission } from "../utils/commissionCalculator";

function CountdownTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) { setTimeLeft("Terminée"); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      if (days > 0) setTimeLeft(`${days}j ${hours}h ${minutes}m`);
      else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      else setTimeLeft(`${minutes}m ${seconds}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return <span>{timeLeft}</span>;
}

export default function AuctionBidPanel({ product, currentUser, isLoggedIn }) {
  const [bidAmount, setBidAmount] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const queryClient = useQueryClient();

  const isAuctionEnded = new Date(product.auction_end_date) < new Date();
  const currentPrice = product.auction_current_price || product.auction_start_price || 0;
  const bidsCount = product.auction_bids_count || 0;
  const minBid = bidsCount === 0 ? product.auction_start_price : currentPrice + 1;
  const bidAmountNum = parseFloat(bidAmount);
  const commission = !isNaN(bidAmountNum) && bidAmountNum > 0 ? calculateCommission(bidAmountNum) : 0;

  const { data: bids = [] } = useQuery({
    queryKey: ["bids", product.id],
    queryFn: () => base44.entities.Bid.filter({ product_id: product.id }, "-created_date", 20),
    refetchInterval: isAuctionEnded ? false : 10000,
  });

  const handleBid = async () => {
    if (!isLoggedIn) { base44.auth.redirectToLogin(); return; }
    setError("");
    setSuccess("");
    setPlacing(true);

    try {
      const res = await base44.functions.invoke("placeBid", { product_id: product.id, amount: bidAmountNum });

      if (res.data?.success) {
        queryClient.invalidateQueries(["bids", product.id]);
        queryClient.invalidateQueries(["product", product.id]);
        setSuccess(`Enchère de ${bidAmountNum.toFixed(2)} € placée avec succès !`);
        setBidAmount("");
      } else {
        setError(res.data?.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Une erreur est survenue.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Status banner */}
      <div className={`rounded-xl p-4 ${isAuctionEnded ? "bg-gray-100 border border-gray-200" : "bg-amber-50 border border-amber-200"}`}>
        <div className="flex items-center gap-2 mb-3">
          <Gavel className={`w-5 h-5 ${isAuctionEnded ? "text-gray-500" : "text-amber-600"}`} />
          <span className={`font-bold text-sm ${isAuctionEnded ? "text-gray-600" : "text-amber-700"}`}>
            {isAuctionEnded ? "Enchère terminée" : "Enchère en cours"}
          </span>
          {!isAuctionEnded && (
            <Badge className="ml-auto bg-amber-100 text-amber-700 border-0 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <CountdownTimer endDate={product.auction_end_date} />
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500">Prix de départ</p>
            <p className="font-bold text-gray-900">{product.auction_start_price?.toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{bidsCount > 0 ? "Meilleure offre" : "Aucune enchère"}</p>
            <p className="text-2xl font-extrabold text-[#1B5E20]">{currentPrice.toFixed(2)} €</p>
          </div>
        </div>

        {bidsCount > 0 && (
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {bidsCount} enchère{bidsCount > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Bid input */}
      {!isAuctionEnded && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">
            Votre enchère (min. {minBid?.toFixed(2)} €)
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="1"
              min={minBid}
              value={bidAmount}
              onChange={e => { setBidAmount(e.target.value); setError(""); setSuccess(""); }}
              placeholder={`${minBid?.toFixed(2)} € minimum`}
            />
            <Button
              onClick={handleBid}
              disabled={placing || !bidAmount || isNaN(bidAmountNum)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 rounded-full shrink-0"
            >
              <Gavel className="w-4 h-4 mr-1" />
              {placing ? "..." : "Enchérir"}
            </Button>
          </div>
          {bidAmount && !isNaN(bidAmountNum) && bidAmountNum > 0 && (
            <p className="text-xs text-gray-500">
              Commission : +{commission.toFixed(2)} € · Total estimé : {(bidAmountNum + commission).toFixed(2)} €
            </p>
          )}
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</p>}
          {success && <p className="text-sm text-green-700 bg-green-50 rounded-lg p-2">{success}</p>}
        </div>
      )}

      {/* Winner */}
      {isAuctionEnded && product.auction_winner_name && (
        <div className="bg-[#1B5E20] text-white rounded-xl p-4 text-center">
          <p className="font-bold">🏆 Remportée par {product.auction_winner_name}</p>
          <p className="text-green-200 text-sm mt-1">Prix final : {currentPrice.toFixed(2)} €</p>
        </div>
      )}

      {/* Bid history */}
      {bids.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> Historique des enchères
          </h4>
          <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 max-h-44 overflow-y-auto">
            {bids.map((bid, i) => (
              <div key={bid.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  {i === 0 && <span className="text-amber-500 text-xs font-bold">🥇</span>}
                  <span className="text-sm text-gray-700">{bid.bidder_name}</span>
                </div>
                <span className="font-bold text-sm text-[#1B5E20]">{bid.amount?.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}