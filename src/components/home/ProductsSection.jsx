import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";
import ProductCard from "../shared/ProductCard";

export default function ProductsSection({ title, subtitle, products, linkCategory }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
        </div>
        <Link
          to={createPageUrl("Marketplace") + (linkCategory ? `?category=${encodeURIComponent(linkCategory)}` : "")}
          className="text-[#1B5E20] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
        >
          Voir tout <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}