import { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Basique",
    desc: "Ideal pour commencer a vendre",
    monthly: 0,
    annual: 0,
    annualTotal: 0,
    discount: 0,
    features: [
      "5 annonces par mois",
      "Fonctionnalites de base",
      "Support standard",
    ],
    cta: "S inscrire gratuitement",
    ctaLink: "/Login",
    highlight: false,
  },
  {
    name: "Pro",
    desc: "L essentiel pour vendre regulierement.",
    monthly: 19,
    annual: 199,
    annualTotal: 228,
    discount: 13,
    features: [
      "30 annonces par mois",
      "Service client standard",
      "Statistiques de base",
      'Badge "Vendeur Pro"',
    ],
    cta: "S inscrire",
    ctaLink: "/Login",
    highlight: false,
  },
  {
    name: "Premium",
    desc: "Le pack complet pour progresser.",
    monthly: 39,
    annual: 399,
    annualTotal: 468,
    discount: 15,
    features: [
      "Annonces illimitees",
      "Rapports analytiques",
      "Vitrine personnalisee",
      "1 mise en avant auto/mois",
      "Service client prioritaire",
      'Badge "Pro verifie"',
      "URL dediee",
    ],
    cta: "S inscrire",
    ctaLink: "/Login",
    highlight: true,
  },
  {
    name: "Business",
    desc: "La solution avancee des vendeurs etablis.",
    monthly: 99,
    annual: 950,
    annualTotal: 1188,
    discount: 20,
    features: [
      "Annonces illimitees",
      "Rapports analytiques",
      "Vitrine ultra-personnalisee",
      "URL Vitrine premium + SEO",
      "4 mises en avant auto/mois",
      "Remise de 15% sur les boosters",
      "Consultant dedie",
      "Badge Business",
      "Newsletter dediee",
    ],
    cta: "S inscrire",
    ctaLink: "/Login",
    highlight: false,
  },
];

export default function Abonnements() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0A2E1A] to-[#1B5E20] py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4">Offres Vendeurs Pro</h1>
        <p className="text-green-200 max-w-2xl mx-auto text-sm md:text-base">
          Attirez des acheteurs passionnes de golf, gagnez en credibilite et mettez en valeur votre materiel sur la marketplace golf numero 1 en France.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex justify-center mt-10 mb-8">
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${!annual ? "bg-[#1B5E20] text-white" : "text-gray-500"}`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${annual ? "bg-[#1B5E20] text-white" : "text-gray-500"}`}
          >
            Annuel <span className="text-[#C5A028] font-bold">🔥 -20%</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative bg-white rounded-2xl border-2 shadow-sm flex flex-col ${
              plan.highlight ? "border-[#1B5E20] shadow-lg scale-105" : "border-gray-100"
            }`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B5E20] text-white text-xs font-bold px-4 py-1 rounded-full">
                  Le plus populaire
                </div>
              )}
              <div className="p-6 flex-1">
                <h2 className="text-lg font-black text-gray-900">{plan.name}</h2>
                <p className="text-xs text-gray-500 mt-1 mb-4">{plan.desc}</p>

                {plan.monthly === 0 ? (
                  <div>
                    <p className="text-3xl font-black text-gray-900">Gratuit</p>
                    <p className="text-xs text-gray-400 mt-1">Aucun moyen de paiement requis</p>
                  </div>
                ) : annual ? (
                  <div>
                    <p className="text-xs text-gray-400 line-through">{plan.annualTotal} EUR</p>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black text-gray-900">{plan.annual}</span>
                      <span className="text-sm text-gray-500 mb-1">EUR HT / an</span>
                    </div>
                    <span className="inline-block bg-green-100 text-[#1B5E20] text-xs font-bold px-2 py-0.5 rounded-full mt-1">
                      -{plan.discount}%
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black text-gray-900">{plan.monthly}</span>
                      <span className="text-sm text-gray-500 mb-1">EUR HT / mois</span>
                    </div>
                  </div>
                )}

                <ul className="mt-5 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-700">
                      <Check className="w-3.5 h-3.5 text-[#1B5E20] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 pt-0">
                <Link to={plan.ctaLink}>
                  <Button className={`w-full rounded-xl h-10 text-sm font-semibold ${
                    plan.highlight
                      ? "bg-[#1B5E20] hover:bg-[#2E7D32] text-white"
                      : plan.monthly === 0
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      : "bg-[#1B5E20] hover:bg-[#2E7D32] text-white"
                  }`}>
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bandeau bas */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <h3 className="text-lg font-black text-gray-900 mb-2">Flexibilite, croissance et visibilite</h3>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mb-6">
            Nos abonnements s adaptent a votre activite. Passez a l offre superieure a tout moment pour publier davantage d annonces et gagner en visibilite aupres des golfeurs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { title: "Sans engagement", desc: "Resiliez en un clic" },
              { title: "Evolutif", desc: "Changez d offre quand vous le souhaitez" },
              { title: "Support inclus", desc: "Une aide personnalisee et reactive" },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-xl p-4">
                <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/Login">
            <Button className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-full px-8">
              Demarrer ma boutique pro
            </Button>
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            Des questions ?{" "}
            <a href="mailto:contact@swingmarketgolf.com" className="text-[#1B5E20] underline">
              Contactez notre equipe
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
