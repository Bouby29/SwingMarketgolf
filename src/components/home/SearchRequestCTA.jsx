import React from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";

export default function SearchRequestCTA() {
  return (
    <section className="bg-white">
      <div className="max-w-3xl mx-auto px-4 py-20 md:py-24 text-center">
        {/* Filet or fin */}
        <div className="mx-auto mb-8 h-px w-16 bg-gradient-to-r from-transparent via-[#C5A028] to-transparent" />

        {/* Eyebrow */}
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C5A028] mb-4">
          Une recherche précise&nbsp;?
        </p>

        {/* Titre */}
        <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A2E] tracking-tight leading-[1.15] mb-4">
          Dites-nous ce que vous cherchez,<br className="hidden md:block" />
          <span className="text-[#1B5E20]">les vendeurs vous répondent.</span>
        </h2>

        {/* Sous-titre */}
        <p className="text-base text-gray-500 leading-relaxed max-w-xl mx-auto mb-10">
          Décrivez votre matériel idéal en une minute. Notre communauté de vendeurs
          vérifiés vous propose directement ce qu'il vous faut.
        </p>

        {/* CTA principal + lien secondaire */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/SearchRequest" className="group">
            <button className="inline-flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold rounded-full px-7 py-3 text-sm transition-all shadow-sm hover:shadow-md">
              <Search className="w-4 h-4" />
              Poster ma recherche
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
          <Link
            to="/SearchRequestsList"
            className="text-sm font-medium text-gray-500 hover:text-[#1B5E20] transition-colors underline-offset-4 hover:underline"
          >
            ou parcourir les demandes en cours
          </Link>
        </div>
      </div>
    </section>
  );
}
