import React from "react";
import { useTranslate } from "../providers/TranslationProvider";
import { Info } from "lucide-react";

export default function CommissionGrid() {
  const { t } = useTranslate();
  
  const tiers = [
    {
      range: "0 € à 99,99 €",
      percentage: "10%",
      fixed: "0,70 €",
      example: "Article à 50 € → Commission: 5,70 €"
    },
    {
      range: "100 € à 299,99 €",
      percentage: "8%",
      fixed: "0,70 €",
      example: "Article à 150 € → Commission: 12,70 €"
    },
    {
      range: "300 € à 999,99 €",
      percentage: "6%",
      fixed: "0,70 €",
      example: "Article à 500 € → Commission: 30,70 €"
    },
    {
      range: "1000 € et plus",
      percentage: "4%",
      fixed: "0,70 €",
      example: "Article à 1000 € → Commission: 40,70 €"
    }
  ];

  return (
    <section className="w-full py-16 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Info className="w-5 h-5 text-[#1B5E20]" />
            <h2 className="text-3xl font-bold text-gray-900">{t('home.commission_title')}</h2>
          </div>
          <p className="text-gray-600">{t('home.commission_subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
           {tiers.map((tier, idx) => (
             <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
               <div className="mb-4">
                 <p className="text-sm font-semibold text-[#1B5E20] mb-2">{t('home.price_range')}</p>
                 <p className="text-lg font-bold text-gray-900">{tier.range}</p>
               </div>

               <div className="bg-green-50 rounded-lg p-3 mb-4">
                 <p className="text-sm text-gray-600 mb-1">{t('home.commission')}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#1B5E20]">{tier.percentage}</span>
                  <span className="text-sm font-semibold text-[#1B5E20]">+ {tier.fixed}</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs font-medium text-blue-900">{tier.example}</p>
              </div>
            </div>
            ))}
            </div>

            <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex gap-4">
            <div className="w-6 h-6 rounded-full bg-[#C5A028] flex-shrink-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm">!</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">{t('home.how_commission')}</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ La commission est payée par l'acheteur au moment du paiement</li>
                <li>✓ Elle est ajoutée au prix du produit et aux frais de livraison</li>
                <li>✓ Le vendeur reçoit le prix du produit (sans commission)</li>
                <li>✓ La commission couvre la protection acheteur et la sécurité des transactions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}