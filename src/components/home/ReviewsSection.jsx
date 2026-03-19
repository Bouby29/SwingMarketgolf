import React from "react";
import { useTranslate } from "../providers/TranslationProvider";
import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    name: "Thomas M.",
    location: "Paris",
    rating: 5,
    text: "Plateforme sérieuse et sécurisée. La protection acheteur et le paiement via Stripe rassurent vraiment. Interface claire et facile à utiliser.",
    type: "Vendeur",
    avatar: "T",
    color: "bg-[#1B5E20]",
  },
  {
    name: "Claire D.",
    location: "Lyon",
    rating: 5,
    text: "Enfin une marketplace dédiée au golf ! La messagerie interne est pratique pour échanger avec les vendeurs. Transaction ultra rapide et sécurisée.",
    type: "Acheteuse",
    avatar: "C",
    color: "bg-[#C5A028]",
  },
  {
    name: "Marc L.",
    location: "Bordeaux",
    rating: 5,
    text: "Une plateforme qui comprend les besoins des golfeurs. Commission dégressive très avantageuse, système de paiement professionnel. Je recommande !",
    type: "Vendeur",
    avatar: "M",
    color: "bg-blue-600",
  },
  {
    name: "Sophie R.",
    location: "Toulouse",
    rating: 5,
    text: "Super expérience d'achat ! Produits de qualité, vendeurs réactifs et processus de paiement sécurisé. La communauté golf enfin réunie sur une plateforme fiable.",
    type: "Acheteuse",
    avatar: "S",
    color: "bg-purple-600",
  },
  {
    name: "Laurent B.",
    location: "Nice",
    rating: 5,
    text: "Interface moderne et intuitive. Les descriptions sont détaillées et les photos de qualité. On sent que la plateforme est pensée pour les passionnés de golf.",
    type: "Acheteur",
    avatar: "L",
    color: "bg-green-600",
  },
  {
    name: "Nathalie P.",
    location: "Marseille",
    rating: 5,
    text: "Très satisfaite de ma vente ! Processus fluide du début à la fin, paiement sécurisé et support réactif. Une vraie alternative aux sites généralistes.",
    type: "Vendeuse",
    avatar: "N",
    color: "bg-indigo-600",
  },
];

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? "text-[#C5A028] fill-[#C5A028]" : "text-gray-300"}`} />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const { t } = useTranslate();
  
  return (
    <section className="w-full px-4 py-16 bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
          <Star className="w-4 h-4 fill-[#C5A028] text-[#C5A028]" />
          Avis clients · 5.0/5
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Ils font confiance à SwingMarket
        </h2>
        <p className="text-gray-500 text-base max-w-2xl mx-auto">
          Des milliers de golfeurs achètent et vendent en toute sérénité sur notre plateforme.
        </p>
      </div>

      {/* Carousel Cards */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-5 pb-4" style={{ width: 'max-content' }}>
          {REVIEWS.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 relative w-80 flex-shrink-0">
              <Quote className="w-7 h-7 text-gray-100 absolute top-5 right-5" />
              <StarRow rating={r.rating} />
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">"{r.text}"</p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-50">
                <div className={`w-10 h-10 rounded-full ${r.color} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
                  {r.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.location} · <span className="text-[#1B5E20] font-medium">{r.type}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {[
          { value: "5.0/5", label: "Note moyenne" },
          { value: "100%", label: "Paiements sécurisés" },
          { value: "48h", label: "Protection acheteur" },
          { value: "0€", label: "Frais cachés" },
        ].map((s) => (
          <div key={s.label} className="text-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-2xl font-extrabold text-[#1B5E20]">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}