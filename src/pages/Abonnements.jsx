import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Zap, Star, Trophy, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Basique",
    icon: "🎯",
    desc: "Idéal pour commencer à vendre",
    monthly: 0,
    annual: 0,
    annualTotal: 0,
    discount: 0,
    color: "gray",
    features: [
      "5 annonces par mois",
      "Fonctionnalités de base",
      "Support standard",
    ],
    cta: "S'inscrire gratuitement",
    ctaLink: "/Login",
    highlight: false,
  },
  {
    name: "Pro",
    icon: "⚡",
    desc: "L'essentiel pour vendre régulièrement.",
    monthly: 19,
    annual: 199,
    annualTotal: 228,
    discount: 13,
    color: "green",
    features: [
      "30 annonces par mois",
      "Service client standard",
      "Statistiques de base",
      "Badge "Vendeur Pro"",
    ],
    cta: "Commencer",
    ctaLink: "/Login",
    highlight: false,
  },
  {
    name: "Premium",
    icon: "⭐",
    desc: "Le pack complet pour progresser.",
    monthly: 39,
    annual: 399,
    annualTotal: 468,
    discount: 15,
    color: "gold",
    features: [
      "Annonces illimitées",
      "Rapports analytiques avancés",
      "Vitrine personnalisée",
      "1 mise en avant auto/mois",
      "Service client prioritaire",
      "Badge "Pro vérifié"",
      "URL dédiée",
    ],
    cta: "Commencer",
    ctaLink: "/Login",
    highlight: true,
  },
  {
    name: "Business",
    icon: "🏆",
    desc: "La solution avancée des vendeurs établis.",
    monthly: 99,
    annual: 950,
    annualTotal: 1188,
    discount: 20,
    color: "dark",
    features: [
      "Annonces illimitées",
      "Rapports analytiques complets",
      "Vitrine ultra-personnalisée",
      "URL Vitrine premium + SEO",
      "4 mises en avant auto/mois",
      "Remise de 15% sur les boosters",
      "Consultant dédié",
      "Badge Business 🏆",
      "Newsletter dédiée",
    ],
    cta: "Commencer",
    ctaLink: "/Login",
    highlight: false,
  },
];

const cardStyles = {
  gray: {
    bg: "bg-white",
    border: "border-gray-200",
    badge: "bg-gray-100 text-gray-600",
    btn: "bg-gray-100 hover:bg-gray-200 text-gray-800",
    check: "text-gray-400",
    icon: "bg-gray-100",
  },
  green: {
    bg: "bg-white",
    border: "border-[#1B5E20]/30",
    badge: "bg-[#1B5E20]/10 text-[#1B5E20]",
    btn: "bg-[#1B5E20] hover:bg-[#2E7D32] text-white",
    check: "text-[#1B5E20]",
    icon: "bg-[#1B5E20]/10",
  },
  gold: {
    bg: "bg-gradient-to-b from-[#0A2E1A] to-[#1B5E20]",
    border: "border-[#C5A028]",
    badge: "bg-[#C5A028] text-white",
    btn: "bg-[#C5A028] hover:bg-[#B8920F] text-white",
    check: "text-[#C5A028]",
    icon: "bg-[#C5A028]/20",
    text: "text-white",
    subtext: "text-green-200",
    price: "text-white",
    feature: "text-green-100",
  },
  dark: {
    bg: "bg-[#0A1628]",
    border: "border-[#1B3A6B]",
    badge: "bg-blue-900 text-blue-200",
    btn: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white",
    check: "text-blue-400",
    icon: "bg-blue-900/50",
    text: "text-white",
    subtext: "text-gray-400",
    price: "text-white",
    feature: "text-gray-300",
  },
};

export default function Abonnements() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#051A0E] via-[#0A2E1A] to-[#1B5E20] py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white" style={{
              width: 200 + i * 80, height: 200 + i * 80,
              top: -50 + i * 10 + "%", left: -10 + i * 15 + "%",
              opacity: 0.03 + i * 0.01
            }} />
          ))}
        </div>
        <div className="relative z-10">
          <span className="inline-block bg-[#C5A028]/20 text-[#C5A028] text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-[#C5A028]/30">
            🏌️ POUR LES PROFESSIONNELS DU GOLF
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Vendez plus.<br />
            <span className="text-[#C5A028]">Gagnez plus.</span>
          </h1>
          <p className="text-green-200 max-w-xl mx-auto text-base">
            Choisissez l'offre adaptée à votre activité et rejoignez les professionnels qui font confiance à SwingMarketGolf.
          </p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex justify-center mt-10 mb-10">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full p-1.5 shadow-md">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${!annual ? "bg-[#1B5E20] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${annual ? "bg-[#1B5E20] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Annuel
            <span className="bg-[#C5A028] text-white text-xs font-black px-2 py-0.5 rounded-full">-20%</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {plans.map((plan) => {
            const s = cardStyles[plan.color];
            return (
              <div key={plan.name} className={`relative rounded-2xl border-2 flex flex-col overflow-hidden transition-transform hover:-translate-y-1 ${s.bg} ${s.border} ${plan.highlight ? "shadow-2xl lg:-mt-4 lg:mb-4" : "shadow-md"}`}>
                {plan.highlight && (
                  <div className={`text-center py-2 text-xs font-black tracking-wide ${s.badge}`}>
                    ⭐ LE PLUS POPULAIRE
                  </div>
                )}
                <div className="p-6 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${s.icon}`}>
                    {plan.icon}
                  </div>
                  <h2 className={`text-xl font-black mb-1 ${s.text || "text-gray-900"}`}>{plan.name}</h2>
                  <p className={`text-xs mb-5 ${s.subtext || "text-gray-500"}`}>{plan.desc}</p>

                  {plan.monthly === 0 ? (
                    <div className="mb-5">
                      <p className={`text-4xl font-black ${s.price || "text-gray-900"}`}>Gratuit</p>
                      <p className={`text-xs mt-1 ${s.subtext || "text-gray-400"}`}>Aucun moyen de paiement requis</p>
                    </div>
                  ) : annual ? (
                    <div className="mb-5">
                      <p className={`text-xs line-through ${s.subtext || "text-gray-400"}`}>{plan.annualTotal} €</p>
                      <div className="flex items-end gap-1">
                        <span className={`text-4xl font-black ${s.price || "text-gray-900"}`}>{plan.annual}</span>
                        <span className={`text-sm mb-1 ${s.subtext || "text-gray-500"}`}>€ HT/an</span>
                      </div>
                      <span className="inline-block bg-green-100 text-[#1B5E20] text-xs font-bold px-2 py-0.5 rounded-full mt-1">
                        Économisez {plan.annualTotal - plan.annual} €
                      </span>
                    </div>
                  ) : (
                    <div className="mb-5">
                      <div className="flex items-end gap-1">
                        <span className={`text-4xl font-black ${s.price || "text-gray-900"}`}>{plan.monthly}</span>
                        <span className={`text-sm mb-1 ${s.subtext || "text-gray-500"}`}>€ HT/mois</span>
                      </div>
                    </div>
                  )}

                  <div className={`w-full h-px mb-4 ${plan.color === "gold" ? "bg-white/20" : plan.color === "dark" ? "bg-white/10" : "bg-gray-100"}`} />

                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2 text-xs ${s.feature || "text-gray-700"}`}>
                        <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${s.check}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 pt-2">
                  <Link to={plan.ctaLink}>
                    <button className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${s.btn}`}>
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
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
        <div className="mt-10 bg-gradient-to-r from-[#0A2E1A] to-[#1B5E20] rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-black mb-2">Prêt à développer votre activité ?</h3>
          <p className="text-green-200 text-sm mb-6">Rejoignez les vendeurs professionnels de SwingMarketGolf dès aujourd'hui.</p>
          <Link to="/Login">
            <button className="bg-[#C5A028] hover:bg-[#B8920F] text-white font-bold px-8 py-3 rounded-full transition-all shadow-lg hover:shadow-xl">
              Démarrer ma boutique pro →
            </button>
          </Link>
          <p className="text-green-300 text-xs mt-4">
            Des questions ?{" "}
            <a href="mailto:contact@swingmarketgolf.com" className="underline">
              Contactez notre équipe
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
