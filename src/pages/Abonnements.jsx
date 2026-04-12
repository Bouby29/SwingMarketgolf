import { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Basique",
    icon: "🎯",
    desc: "Idéal pour commencer à vendre",
    monthly: 0,
    annual: 0,
    annualTotal: 0,
    discount: 0,
    features: ["5 annonces par mois", "Fonctionnalités de base", "Support standard"],
    cta: "S'inscrire gratuitement",
    style: "free",
  },
  {
    name: "Pro",
    icon: "⚡",
    desc: "L'essentiel pour vendre régulièrement.",
    monthly: 19,
    annual: 199,
    annualTotal: 228,
    discount: 13,
    features: ["30 annonces par mois", "Service client standard", "Statistiques de base", "Badge Vendeur Pro"],
    cta: "Commencer",
    style: "pro",
  },
  {
    name: "Premium",
    icon: "⭐",
    desc: "Le pack complet pour progresser.",
    monthly: 39,
    annual: 399,
    annualTotal: 468,
    discount: 15,
    features: ["Annonces illimitées", "Rapports analytiques avancés", "Vitrine personnalisée", "1 mise en avant auto/mois", "Service client prioritaire", "Badge Pro vérifié", "URL dédiée"],
    cta: "Commencer",
    style: "premium",
    popular: true,
  },
  {
    name: "Business",
    icon: "🏆",
    desc: "La solution avancée des vendeurs établis.",
    monthly: 99,
    annual: 950,
    annualTotal: 1188,
    discount: 20,
    features: ["Annonces illimitées", "Rapports analytiques complets", "Vitrine ultra-personnalisée", "URL Vitrine premium + SEO", "4 mises en avant auto/mois", "Remise de 15% sur les boosters", "Consultant dédié", "Badge Business 🏆", "Newsletter dédiée"],
    cta: "Commencer",
    style: "business",
  },
];

export default function Abonnements() {
  const [annual, setAnnual] = useState(false);

  const getCardClass = (style, popular) => {
    if (style === "premium") return "bg-[#0A2E1A] border-[#C5A028] border-2 shadow-2xl";
    if (style === "business") return "bg-[#0F1F12] border-[#2E5C2E] border-2 shadow-xl";
    return "bg-white border-gray-200 border shadow-md";
  };

  const getTextClass = (style) => {
    if (style === "premium" || style === "business") return "text-white";
    return "text-gray-900";
  };

  const getSubTextClass = (style) => {
    if (style === "premium") return "text-green-300";
    if (style === "business") return "text-gray-400";
    return "text-gray-500";
  };

  const getBtnClass = (style) => {
    if (style === "premium") return "bg-[#C5A028] hover:bg-[#B8920F] text-white";
    if (style === "business") return "bg-[#1B5E20] hover:bg-[#2E7D32] text-white";
    if (style === "free") return "bg-gray-100 hover:bg-gray-200 text-gray-700";
    return "bg-[#1B5E20] hover:bg-[#2E7D32] text-white";
  };

  const getCheckClass = (style) => {
    if (style === "premium") return "text-[#C5A028]";
    if (style === "business") return "text-[#4CAF50]";
    return "text-[#1B5E20]";
  };

  const getFeatureClass = (style) => {
    if (style === "premium") return "text-green-100";
    if (style === "business") return "text-gray-300";
    return "text-gray-600";
  };

  const getDividerClass = (style) => {
    if (style === "premium") return "bg-white/10";
    if (style === "business") return "bg-white/10";
    return "bg-gray-100";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#051A0E] via-[#0A2E1A] to-[#1B5E20] py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white/5" style={{
              width: 300 + i * 100, height: 300 + i * 100,
              top: -100 + i * 30 + "px", left: -50 + i * 20 + "%",
            }} />
          ))}
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-block bg-[#C5A028]/20 text-[#C5A028] text-xs font-bold px-4 py-1.5 rounded-full mb-5 border border-[#C5A028]/40 tracking-widest uppercase">
            🏌️ Vendeurs Professionnels
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Vendez plus.<br />
            <span className="text-[#C5A028]">Gagnez plus.</span>
          </h1>
          <p className="text-green-200 text-base">
            Choisissez l'offre adaptée à votre activité et rejoignez les professionnels qui font confiance à SwingMarketGolf.
          </p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex justify-center mt-10 mb-10">
        <div className="inline-flex items-center bg-white border border-gray-200 rounded-full p-1.5 shadow-md">
          <button onClick={() => setAnnual(false)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!annual ? "bg-[#1B5E20] text-white shadow" : "text-gray-500 hover:text-gray-700"}`}>
            Mensuel
          </button>
          <button onClick={() => setAnnual(true)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${annual ? "bg-[#1B5E20] text-white shadow" : "text-gray-500 hover:text-gray-700"}`}>
            Annuel
            <span className="bg-[#C5A028] text-white text-xs font-black px-2 py-0.5 rounded-full">-20%</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-center">
          {plans.map((plan) => (
            <div key={plan.name}
              className={`relative rounded-2xl flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 ${getCardClass(plan.style, plan.popular)} ${plan.popular ? "lg:scale-105" : ""}`}>
              {plan.popular && (
                <div className="bg-[#C5A028] text-white text-center py-2 text-xs font-black tracking-widest uppercase">
                  ⭐ Le plus populaire
                </div>
              )}
              <div className="p-6 flex-1">
                <div className={`text-2xl mb-3`}>{plan.icon}</div>
                <h2 className={`text-xl font-black mb-1 ${getTextClass(plan.style)}`}>{plan.name}</h2>
                <p className={`text-xs mb-5 ${getSubTextClass(plan.style)}`}>{plan.desc}</p>

                {plan.monthly === 0 ? (
                  <div className="mb-5">
                    <p className={`text-4xl font-black ${getTextClass(plan.style)}`}>Gratuit</p>
                    <p className={`text-xs mt-1 ${getSubTextClass(plan.style)}`}>Aucun moyen de paiement requis</p>
                  </div>
                ) : annual ? (
                  <div className="mb-5">
                    <p className={`text-xs line-through ${getSubTextClass(plan.style)}`}>{plan.annualTotal} €</p>
                    <div className="flex items-end gap-1">
                      <span className={`text-4xl font-black ${getTextClass(plan.style)}`}>{plan.annual}</span>
                      <span className={`text-sm mb-1 ${getSubTextClass(plan.style)}`}>€ HT/an</span>
                    </div>
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1 ${plan.style === "premium" ? "bg-[#C5A028]/20 text-[#C5A028]" : "bg-green-100 text-[#1B5E20]"}`}>
                      Économisez {plan.annualTotal - plan.annual} €
                    </span>
                  </div>
                ) : (
                  <div className="mb-5">
                    <div className="flex items-end gap-1">
                      <span className={`text-4xl font-black ${getTextClass(plan.style)}`}>{plan.monthly}</span>
                      <span className={`text-sm mb-1 ${getSubTextClass(plan.style)}`}>€ HT/mois</span>
                    </div>
                  </div>
                )}

                <div className={`w-full h-px mb-4 ${getDividerClass(plan.style)}`} />

                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-xs ${getFeatureClass(plan.style)}`}>
                      <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${getCheckClass(plan.style)}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 pt-2">
                <Link to="/Login">
                  <button className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${getBtnClass(plan.style)}`}>
                    {plan.cta}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Reassurance */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: "🔓", title: "Sans engagement", desc: "Résiliez en un clic, sans frais ni préavis." },
            { icon: "🚀", title: "Évolutif", desc: "Changez d'offre à tout moment selon vos besoins." },
            { icon: "💬", title: "Support inclus", desc: "Notre équipe vous accompagne à chaque étape." },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{item.icon}</div>
              <p className="font-black text-gray-900 mb-1">{item.title}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div className="mt-10 bg-gradient-to-r from-[#051A0E] to-[#1B5E20] rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-black text-white mb-2">Prêt à développer votre activité ?</h3>
          <p className="text-green-200 text-sm mb-6">Rejoignez les vendeurs professionnels de SwingMarketGolf dès aujourd'hui.</p>
          <Link to="/Login">
            <button className="bg-[#C5A028] hover:bg-[#B8920F] text-white font-bold px-8 py-3 rounded-full transition-all shadow-lg hover:shadow-xl">
              Démarrer ma boutique pro →
            </button>
          </Link>
          <p className="text-green-300 text-xs mt-4">
            Des questions ?{" "}
            <a href="mailto:contact@swingmarketgolf.com" className="underline hover:text-white">
              Contactez notre équipe
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
