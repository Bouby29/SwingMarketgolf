import React from "react";
import { useTranslate } from "../providers/TranslationProvider";
import { Shield, Truck, CreditCard, Headphones, RotateCcw } from "lucide-react";

export default function TrustBanner() {
  const { t } = useTranslate();
  
  const features = [
    {
      icon: Shield,
      title: t('home.trust_secure'),
      desc: t('home.trust_secure_desc'),
      color: "text-[#1B5E20] bg-green-50",
    },
    {
      icon: Truck,
      title: t('home.trust_shipping'),
      desc: t('home.trust_shipping_desc'),
      color: "text-blue-600 bg-blue-50",
    },
    {
      icon: RotateCcw,
      title: t('home.trust_refund'),
      desc: t('home.trust_refund_desc'),
      color: "text-amber-600 bg-amber-50",
    },
    {
      icon: Headphones,
      title: t('home.trust_support'),
      desc: t('home.trust_support_desc'),
      color: "text-purple-600 bg-purple-50",
    },
    {
      icon: CreditCard,
      title: t('home.trust_commission'),
      desc: t('home.trust_commission_desc'),
      color: "text-rose-600 bg-rose-50",
    },
  ];

  return (
    <section className="bg-white border-y border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${f.color}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 leading-tight">{f.title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}