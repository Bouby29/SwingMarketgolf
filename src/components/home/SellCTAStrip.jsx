import React from "react";
import { useTranslate } from '../providers/TranslationProvider';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, ShoppingBag } from "lucide-react";

export default function SellCTAStrip() {
  const { t } = useTranslate();
  return (
    <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] py-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6 text-center">
        <div>
          <h2 className="text-white font-bold text-xl md:text-2xl mb-1">La marketplace 100% dédiée au golf</h2>
          <p className="text-white/75 text-sm">Vendeurs vérifiés · Paiement sécurisé · Protection acheteur incluse</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to={createPageUrl(t("common.marketplace"))}>
            <button className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-full px-6 py-2.5 text-sm flex items-center gap-2 transition-all backdrop-blur-sm">
              <ShoppingBag className="w-4 h-4" /> Parcourir les annonces
            </button>
          </Link>
          <Link to={createPageUrl("CreateListing")}>
            <button className="bg-[#C5A028] hover:bg-[#D4AF37] text-white font-semibold rounded-full px-6 py-2.5 text-sm flex items-center gap-2 transition-colors shadow-lg">
              <Plus className="w-4 h-4" /> Vendre mon matériel
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}