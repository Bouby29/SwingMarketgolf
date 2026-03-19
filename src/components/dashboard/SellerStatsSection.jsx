import React from "react";
import { Star, ShoppingBag, TrendingUp } from "lucide-react";

export default function SellerStatsSection({ mySales, myProducts, myReviews = [] }) {
  const avgRating = myReviews.length > 0 
    ? (myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length).toFixed(1)
    : 0;

  const revenue = mySales
    .filter(o => o.status === "completed")
    .reduce((s, o) => s + (o.price || 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Statistiques vendeur</h2>
        <p className="text-gray-600">Analysez vos performances de vente</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-xl">{avgRating}</span>
          </div>
          <p className="text-xs text-gray-600">Ma note</p>
        </div>

        <div className="border rounded-lg p-4 text-center">
          <p className="font-bold text-2xl">{mySales.length}</p>
          <p className="text-xs text-gray-600 mt-1">Commandes</p>
        </div>

        <div className="border rounded-lg p-4 text-center">
          <p className="font-bold text-xl">{revenue.toFixed(0)}€</p>
          <p className="text-xs text-gray-600 mt-1">Chiffre d'affaires</p>
        </div>
      </div>
    </div>
  );
}