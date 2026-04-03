import React from "react";
import SEOHead from "../components/seo/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "../components/providers/TranslationProvider";
import { supabase, entities, auth } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";
import HeroSection from "../components/home/HeroSection";
import CategoriesGrid from "../components/home/CategoriesGrid";
import ProductCarousel from "../components/home/ProductCarousel";
import TrustBanner from "../components/home/TrustBanner";
import ReviewsSection from "../components/home/ReviewsSection";
import SellCTAStrip from "../components/home/SellCTAStrip";
import AuctionCarousel from "../components/auction/AuctionCarousel";

export default function Home() {
  const { t } = useTranslate();
  
  const { data: products = [] } = useQuery({
    queryKey: ["products-home"],
    queryFn: () => entities.Product.filter({ status: "active" }, "-created_at", 50),
  });

  const clubProducts = products.filter(p => p.category && p.category.toLowerCase().includes("club")).slice(0, 10);
  const newProducts = [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
  const deals = [...products].sort((a, b) => a.price - b.price).slice(0, 10);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SwingMarketGolf",
    "url": "https://swingmarketgolf.com",
    "description": "Marketplace français du matériel de golf d'occasion. Achetez et vendez vos clubs, balles, sacs de golf.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://swingmarketgolf.com/Marketplace?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div>
      <SEOHead
        title="SwingMarket - Marketplace de golf d'occasion | Achat & Vente"
        description="SwingMarket, la marketplace dédiée au golf d'occasion : achetez et vendez votre matériel au meilleur prix avec achat immédiat ou enchères. Paiement sécurisé et livraison suivie."
        url="https://swingmarketgolf.com/"
        structuredData={structuredData}
      />
      <div className="sr-only">
        <h1>SwingMarketGolf - Marketplace de golf d'occasion en France</h1>
        <h2>Achetez et vendez clubs de golf, balles, sacs et accessoires entre passionnés</h2>
      </div>
      <HeroSection />

      <SellCTAStrip />
      <TrustBanner />
      <CategoriesGrid />
      
      <ProductCarousel
        title={t('home.title')}
        subtitle={t('nav.golfClubs')}
        products={clubProducts}
      />

      <ProductCarousel
        title={t('home.new_listings')}
        subtitle={t('home.fresh')}
        products={newProducts}
      />

      <ProductCarousel
        title={t('home.deals')}
        subtitle={t('home.best_prices')}
        products={deals}
      />

      <AuctionCarousel />


      <ReviewsSection />
    </div>
  );
}