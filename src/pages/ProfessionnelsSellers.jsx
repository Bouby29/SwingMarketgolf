import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, Target, TrendingUp, Users, Zap, DollarSign, Package, Lock, Upload, Headphones, Trophy } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="flex gap-3 p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
    <Icon className="w-6 h-6 text-[#1B5E20] shrink-0 mt-1" />
    <div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

const BenefitItem = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-[#1B5E20] mt-1 shrink-0" />
    <div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

export default function ProfessionnelsSellers() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative py-16 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ad6e01c03e7e5793047eec/8ca2fab3d_image.png')"}}></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="text-white">
              <div className="mb-4 md:mb-6 inline-block bg-white/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-white text-xs sm:text-sm font-bold">
                ✨ Développez votre activité
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-tight text-white drop-shadow-lg">
                Vendeurs<br />Professionnels
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white mb-6 md:mb-8 leading-relaxed drop-shadow-md font-medium">
                Développez vos ventes de matériel de golf sur une marketplace spécialisée, sans créer votre propre site.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link
                  to={createPageUrl("CreateListing")}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#1B5E20] font-bold rounded-lg hover:bg-gray-100 transition-colors text-base sm:text-lg shadow-lg"
                >
                  Créer mon compte pro
                </Link>
                <a
                  href="mailto:contact@swingmarket.fr?subject=Partenariat professionnel SwingMarket"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur border-2 border-white text-white font-bold rounded-lg hover:bg-white/30 transition-colors text-base sm:text-lg"
                >
                  Nous contacter
                </a>
              </div>
            </div>
            <div className="hidden md:flex justify-center mt-8 md:mt-0">
              <div className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-3xl p-8 md:p-12 text-center shadow-2xl w-full max-w-sm">
                <div className="text-6xl md:text-8xl mb-4 md:mb-6">⛳</div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2 text-white drop-shadow-lg">La plateforme golf</h3>
                <p className="text-white text-base md:text-lg drop-shadow-md font-medium">Dédiée aux vendeurs professionnels</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Pourquoi les professionnels choisissent SwingMarket
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <BenefitItem
              icon={Target}
              title="Audience ciblée golf"
              description="Des acheteurs en intention d'achat, spécialisés dans le matériel de golf."
            />
            <BenefitItem
              icon={TrendingUp}
              title="Valorisation du stock"
              description="Produits d'occasion, reconditionnés ou fins de série trouvent une seconde vie."
            />
            <BenefitItem
              icon={Users}
              title="Moins de concurrence"
              description="Une plateforme dédiée au golf, sans dilution face aux géantes généralistes."
            />
            <BenefitItem
              icon={Zap}
              title="Relation humaine"
              description="Un échange simple et transparent, loin des plateformes anonymes."
            />
            <BenefitItem
              icon={Package}
              title="Canal complémentaire"
              description="Développez un nouveau canal de vente sans remettre en cause votre activité."
            />
            <BenefitItem
              icon={Trophy}
              title="Rayonnement national"
              description="Ouvrez votre activité à une clientèle nationale de golfeurs passionnés."
            />
          </div>
        </div>
      </section>

      {/* For Who Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Pour quels professionnels ?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "🏷️ Marques de golf",
              "🏬 Shops indépendants",
              "🛠️ Artisans & créateurs",
              "🧰 Ateliers spécialisés",
              "♻️ Revendeurs de matériel d'occasion",
              "🧪 Professionnels testant un nouveau canal"
            ].map((item) => (
              <div key={item} className="p-4 bg-[#F5F5F5] rounded-lg font-medium text-gray-900">
                {item}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-8 text-lg">
            SwingMarket valorise les <strong>marques engagées, le Made in France, la fabrication responsable</strong> et les logiques de circuit court, en complément d'une offre de qualité.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Un fonctionnement simple
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Créez votre compte", desc: "Vendeur pro" },
              { step: "2", title: "Accès immédiat", desc: "À la plateforme" },
              { step: "3", title: "Accompagnement", desc: "Selon vos besoins" },
              { step: "4", title: "Commencez à vendre", desc: "Audience ciblée" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-[#1B5E20] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                  {item.step}
                </div>
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Un modèle clair et transparent
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              icon={DollarSign}
              title="Commission vendeur pro"
              description="5% + 0,70€ TTC, prélevée uniquement sur les ventes réalisées."
            />
            <FeatureCard
              icon={Zap}
              title="Aucun abonnement obligatoire"
              description="Pas de frais fixes, pas d'engagement caché. Vous ne payez que pour vos ventes."
            />
            <FeatureCard
              icon={Trophy}
              title="Vous fixez vos prix"
              description="Liberté tarifaire totale. Vous gardez la maîtrise de votre politique commerciale."
            />
            <FeatureCard
              icon={Package}
              title="Expédition intégrée"
              description="Génération automatique des étiquettes depuis votre espace vendeur."
            />
            <FeatureCard
              icon={Lock}
              title="Paiement sécurisé"
              description="Les fonds sont protégés jusqu'à la confirmation de réception par l'acheteur."
            />
            <FeatureCard
              icon={Upload}
              title="Intégration de catalogue"
              description="Solutions d'import adaptées aux professionnels (catalogue, lots, volumes)."
            />
            <FeatureCard
              icon={Headphones}
              title="Aucun engagement de durée"
              description="Vous êtes libre d'arrêter quand vous le souhaitez, sans pénalité."
            />
            <FeatureCard
              icon={CheckCircle}
              title="Support professionnel"
              description="Accompagnement et support client dédié aux vendeurs professionnels."
            />
          </div>
        </div>
      </section>

      {/* Golf Specific */}
      <section className="py-16 bg-[#F5F5F5]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Pensé pour la réalité du matériel de golf
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-[#1B5E20] shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Colis standards et volumineux</h4>
                  <p className="text-gray-600 text-sm">Support complet des différentes tailles de colis et conditions d'expédition.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-[#1B5E20] shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Solutions adaptées</h4>
                  <p className="text-gray-600 text-sm">Pour les clubs, balles, sacs, chariots et équipements spécifiques au golf.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-[#1B5E20] shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Étiquettes prépayées</h4>
                  <p className="text-gray-600 text-sm">Simplification de la gestion des expéditions avec nos partenaires logistiques.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-[#1B5E20] shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Support en cas de souci</h4>
                  <p className="text-gray-600 text-sm">Équipe disponible pour résoudre tout problème rapidement et efficacement.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-[#1B5E20] shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Amélioration continue</h4>
                  <p className="text-gray-600 text-sm">Évolution constante de nos services selon vos retours et besoins.</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-[#1B5E20] mb-4">Prêt à développer votre vente de golf ?</h3>
              <p className="text-gray-600 mb-6">
                Rejoignez des dizaines de professionnels qui font confiance à SwingMarket pour développer leur activité de vente de matériel de golf.
              </p>
              <div className="space-y-3">
                <Link
                  to={createPageUrl("CreateListing")}
                  className="block w-full px-6 py-3 bg-[#1B5E20] text-white font-semibold rounded-lg hover:bg-[#2E7D32] transition-colors text-center"
                >
                  Créer mon compte professionnel
                </Link>
                <a
                  href="mailto:contact@swingmarket.fr?subject=Professionnel golf - prise de contact"
                  className="block w-full px-6 py-3 border border-[#1B5E20] text-[#1B5E20] font-semibold rounded-lg hover:bg-[#F5F5F5] transition-colors text-center"
                >
                  Nous écrire
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Vous avez une question ou un projet à nous présenter ?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            L'équipe SwingMarket est disponible pour répondre à toutes vos questions et vous accompagner.
          </p>
          <a
            href="mailto:contact@swingmarket.fr?subject=Professionnel golf - question"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#1B5E20] text-white font-semibold rounded-lg hover:bg-[#2E7D32] transition-colors text-lg"
          >
            Écrivez-nous
          </a>
        </div>
      </section>
    </div>
  );
}