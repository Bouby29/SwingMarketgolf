import React, { useRef } from "react";
import { useTranslate } from '../providers/TranslationProvider';
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import ProductCard from "../shared/ProductCard";

export default function ProductCarousel({ title, subtitle, products, titleKey, subtitleKey }) {
  const { t } = useTranslate();
  const scrollRef = useRef(null);
  const displayProducts = products.slice(0, 10);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!displayProducts.length) return null;

  return (
    <section className="w-full px-4 py-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Suivant"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {displayProducts.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-72">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <a
          href={createPageUrl(t("common.marketplace"))}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-full font-semibold transition-colors"
        >
          Voir plus de produits
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}