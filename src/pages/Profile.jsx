import React, { useState, useEffect } from "react";
import SEOHead from "../components/seo/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { supabase, entities, auth } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Building2, Shield, Package, MessageCircle, Award, TrendingUp, CheckCircle, Zap, Clock } from "lucide-react";
import ProductCard from "../components/shared/ProductCard";

export default function Profile() {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("id");

  const { data: profileUser } = useQuery({
    queryKey: ["profile-user", userId],
    queryFn: () => entities.User.filter({ id: userId }),
    select: d => d[0],
    enabled: !!userId,
  });

  const { data: products = [], isSuccess: productsLoaded } = useQuery({
    queryKey: ["profile-products", userId],
    queryFn: () => entities.Product.filter({ seller_id: userId, status: "active" }, "-created_date", 50),
    enabled: !!userId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["profile-reviews", userId],
    queryFn: () => entities.Review.filter({ seller_id: userId }, "-created_date", 20),
    enabled: !!userId,
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
  const sellerNameFallback = products[0]?.seller_name || null;

  if (!profileUser && !productsLoaded) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><div className="shimmer h-8 w-48 mx-auto rounded" /></div>;
  }

  const shopName = profileUser?.shop_name || profileUser?.company_name || profileUser?.full_name || sellerNameFallback || "Vendeur";
  const displayName = profileUser?.full_name || sellerNameFallback || "Vendeur";
  const memberSince = profileUser?.created_date ? new Date(profileUser.created_date).getFullYear() : null;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <SEOHead
        title={`Boutique ${shopName} | SwingMarket`}
        description={`Découvrez les produits proposés par ${shopName} sur SwingMarket, la marketplace des golfeurs.`}
        url={`https://swingmarketgolf.com/Profile?id=${userId}`}
      />
      {/* Hero Banner */}
      <div className="relative h-56 md:h-72 rounded-none bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#1B5E20] overflow-hidden">
        {profileUser?.banner && <img src={profileUser.banner} alt="" className="w-full h-full object-cover opacity-80" />}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Profile Header */}
        <div className="relative -mt-20 md:-mt-28 mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            {/* Avatar */}
            <div className="relative z-10 flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white">
                {profileUser?.avatar ? (
                  <img src={profileUser.avatar} alt={shopName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] flex items-center justify-center text-white">
                    <span className="text-6xl font-bold">{shopName?.[0]?.toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shop Info */}
            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:items-baseline gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{shopName}</h1>
                {profileUser?.is_pro && (
                  <Badge className="bg-[#C5A028] text-white border-0 w-fit"><Building2 className="w-3 h-3 mr-1" />Vendeur Professionnel</Badge>
                )}
              </div>

              {profileUser?.shop_description && (
                <p className="text-gray-600 text-sm md:text-base mb-4 max-w-2xl">{profileUser.shop_description}</p>
              )}

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-3 mb-4">
                {profileUser?.trusted_seller && (
                  <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Vendeur de confiance
                  </Badge>
                )}
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Compte vérifié
                </Badge>
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Qualité garantie
                </Badge>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Rating */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-[#C5A028] fill-[#C5A028]" />
                    <span className="font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-500">{reviews.length} avis</p>
                </div>

                {/* Sales */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-[#1B5E20]" />
                    <span className="font-bold text-gray-900">{profileUser?.total_sales || 0}</span>
                  </div>
                  <p className="text-xs text-gray-500">Ventes</p>
                </div>

                {/* Articles */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Package className="w-4 h-4 text-orange-500" />
                    <span className="font-bold text-gray-900">{products.length}</span>
                  </div>
                  <p className="text-xs text-gray-500">Articles</p>
                </div>

                {/* Member Since */}
                {memberSince && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span className="font-bold text-gray-900">{memberSince}</span>
                    </div>
                    <p className="text-xs text-gray-500">Depuis</p>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <div className="w-full md:w-auto">
              <Link to={createPageUrl("Messages") + `?vendeur=${userId}`}>
                <Button className="w-full md:w-auto bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-full px-6 h-12 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Contacter le vendeur
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Pro Info Card */}
        {profileUser?.is_pro && profileUser?.company_name && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <Building2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{profileUser.company_name}</h3>
                {profileUser.siret && <p className="text-sm text-gray-600">SIRET: {profileUser.siret}</p>}
                {profileUser.city && <p className="text-sm text-gray-600 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {profileUser.city}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-8 border-b border-gray-200 flex gap-8">
          <button className="pb-4 px-2 border-b-2 border-[#1B5E20] text-gray-900 font-medium">
            Articles ({products.length})
          </button>
          <button className="pb-4 px-2 border-b-2 border-transparent text-gray-600 font-medium hover:text-gray-900">
            Avis ({reviews.length})
          </button>
        </div>

        {/* Products Section */}
        <div className="mb-16">
          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Aucun article en vente pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Avis clients ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Aucun avis pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-900">{r.buyer_name}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${s <= r.rating ? "text-[#C5A028] fill-[#C5A028]" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      {r.product_title && <p className="text-xs text-gray-500">Produit: {r.product_title}</p>}
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-0"><CheckCircle className="w-3 h-3 mr-1" />Acheté</Badge>
                  </div>
                  {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}