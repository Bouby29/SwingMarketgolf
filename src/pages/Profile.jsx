import React, { useState } from "react";
import SEOHead from "../components/seo/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Shield, Package, MessageCircle, Award, TrendingUp, CheckCircle, Clock } from "lucide-react";
import ProductCard from "../components/shared/ProductCard";

export default function Profile() {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("id");
  const [activeTab, setActiveTab] = useState("articles");

  const { data: profileUser } = useQuery({
    queryKey: ["profile-user", userId],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      return data;
    },
    enabled: !!userId,
  });

  const { data: products = [], isSuccess: productsLoaded } = useQuery({
    queryKey: ["profile-products", userId],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("seller_id", userId).eq("status", "active").order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: !!userId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["profile-reviews", userId],
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*").eq("seller_id", userId).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!userId,
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
  const shopName = profileUser?.shop_name || profileUser?.full_name || "Vendeur";
  const memberSince = profileUser?.created_at ? new Date(profileUser.created_at).getFullYear() : null;

  if (!profileUser && !productsLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1B5E20] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <SEOHead
        title={`${shopName} | SwingMarket`}
        description={`Découvrez les produits de ${shopName} sur SwingMarket.`}
        url={`https://swingmarketgolf.com/Profile?id=${userId}`}
      />

      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#145218] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {/* Profile Card */}
        <div className="relative -mt-16 mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] flex items-center justify-center overflow-hidden shrink-0 shadow-md border-4 border-white -mt-14 md:-mt-16">
                {profileUser?.avatar_url ? (
                  <img src={profileUser.avatar_url} alt={shopName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-4xl">{shopName?.[0]?.toUpperCase()}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{shopName}</h1>
                    {profileUser?.city && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3" />{profileUser.city}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs flex items-center gap-1">
                        <Shield className="w-3 h-3" />Compte vérifié
                      </Badge>
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs flex items-center gap-1">
                        <Award className="w-3 h-3" />Qualité garantie
                      </Badge>
                    </div>
                    {/* BIO */}
                    {profileUser?.bio && (
                      <p className="text-gray-600 text-sm leading-relaxed max-w-lg">{profileUser.bio}</p>
                    )}
                  </div>

                  <Link to={createPageUrl("Messages") + `?vendeur=${userId}`} className="shrink-0">
                    <Button className="bg-[#1B5E20] hover:bg-[#145218] text-white rounded-full px-5 h-10 flex items-center gap-2 text-sm">
                      <MessageCircle className="w-4 h-4" />
                      Contacter
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Star className="w-4 h-4 text-[#C5A028] fill-[#C5A028]" />
                  <span className="font-bold text-gray-900 text-lg">{avgRating.toFixed(1)}</span>
                </div>
                <p className="text-xs text-gray-500">{reviews.length} avis</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <TrendingUp className="w-4 h-4 text-[#1B5E20]" />
                  <span className="font-bold text-gray-900 text-lg">{profileUser?.total_sales || 0}</span>
                </div>
                <p className="text-xs text-gray-500">Ventes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Package className="w-4 h-4 text-orange-500" />
                  <span className="font-bold text-gray-900 text-lg">{products.length}</span>
                </div>
                <p className="text-xs text-gray-500">Articles</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="font-bold text-gray-900 text-lg">{memberSince || "—"}</span>
                </div>
                <p className="text-xs text-gray-500">Depuis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 mb-6 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("articles")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "articles" ? "bg-[#1B5E20] text-white shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
          >
            Articles ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("avis")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "avis" ? "bg-[#1B5E20] text-white shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
          >
            Avis ({reviews.length})
          </button>
        </div>

        {/* Tab content */}
        <div className="pb-16">
          {activeTab === "articles" && (
            products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <Package className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">Aucun article en vente pour le moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )
          )}

          {activeTab === "avis" && (
            reviews.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <Star className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">Aucun avis pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                          {r.buyer_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{r.buyer_name}</p>
                          <div className="flex">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "text-[#C5A028] fill-[#C5A028]" : "text-gray-200 fill-gray-200"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />Acheté
                      </Badge>
                    </div>
                    {r.comment && <p className="text-gray-600 text-sm mt-2">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
