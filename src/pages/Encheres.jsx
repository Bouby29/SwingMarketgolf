import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Gavel, Clock, TrendingUp, Shield, ChevronRight, Star, Zap, Trophy, Timer, ArrowRight } from "lucide-react";

export default function Encheres() {
  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-[#0F3D2E] via-[#1B5E20] to-[#2E7D32] overflow-hidden py-24 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Gavel className="w-4 h-4" />
            Ventes aux Enchères SwingMarket
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Vendez plus vite,<br />
            <span className="text-amber-400">achetez mieux</span>
          </h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Le système d'enchères SwingMarket vous permet de mettre votre matériel golf aux enchères et d'obtenir le meilleur prix grâce à la compétition entre acheteurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("CreateListing")}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-full text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              <Gavel className="w-5 h-5" />
              Mettre aux enchères
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to={createPageUrl("Marketplace") + "?sale_type=auction"}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-full text-lg transition-all border border-white/20">
              <Trophy className="w-5 h-5" />
              Voir les enchères en cours
            </Link>
          </div>
        </div>
      </section>

      

      {/* COMMENT CA MARCHE */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Comment mettre votre article aux enchères ?</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">En 3 étapes simples, votre matériel golf est en ligne et visible par des milliers d'acheteurs passionnés.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: "🔨", title: "Choisissez le mode Enchère", desc: "Lors de la publication de votre annonce, sélectionnez le mode Enchère au lieu de Prix fixe. Option disponible dans la section Type de vente.", detail: "Vous gardez le contrôle total sur les conditions de vente." },
              { step: "02", icon: "💶", title: "Définissez votre prix de départ", desc: "Fixez le prix minimum à partir duquel les offres peuvent commencer. Ce prix peut être inférieur à la valeur marchande pour déclencher plus d'enchères.", detail: "Conseil : démarrez à 30–40% en dessous de la valeur pour générer de l'intérêt." },
              { step: "03", icon: "⏱️", title: "Choisissez la durée", desc: "Sélectionnez la durée de votre enchère : 24h, 48h, 72h ou 7 jours. À la fin du délai, l'acheteur ayant fait la meilleure offre remporte l'article.", detail: "Les enchères de 72h obtiennent en moyenne 23% de mieux que les enchères de 24h." },
            ].map((item, i) => (
              <div key={i} className="relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow p-8">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-[#1B5E20] text-white rounded-full flex items-center justify-center font-black text-sm shadow-md">
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{item.desc}</p>
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500 italic">💡 {item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Pourquoi choisir les enchères ?</h2>
            <p className="text-gray-500 text-lg">Idéales pour les articles de valeur, les modèles rares ou les équipements très demandés.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "📈", title: "Meilleur prix garanti", desc: "La compétition entre acheteurs fait monter les prix. Les articles populaires dépassent souvent leur valeur estimée." },
              { icon: "⚡", title: "Vente rapide", desc: "Une enchère de 72h suffit pour vendre votre matériel. Fini les annonces qui traînent pendant des semaines." },
              { icon: "🛡️", title: "Paiement sécurisé", desc: "L'acheteur gagnant est prélevé automatiquement. Vous recevez votre paiement dès confirmation de livraison." },
              { icon: "⭐", title: "Visibilité maximale", desc: "Les enchères en cours sont mises en avant sur la page d'accueil et notifiées aux acheteurs intéressés." },
              { icon: "⏰", title: "Chrono en temps réel", desc: "Le compte à rebours et le nombre d'offres sont visibles par tous, créant une urgence naturelle chez les acheteurs." },
              { icon: "🏆", title: "Idéal pour les raretés", desc: "Drivers vintage, sets complets de marque, équipements pro — les enchères subliment les articles d'exception." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 text-3xl">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-gray-900 mb-10 text-center">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              { q: "Puis-je fixer un prix de réserve ?", a: "Oui, vous pouvez définir un prix de réserve confidentiel. L'enchère ne sera validée que si ce seuil est atteint." },
              { q: "Que se passe-t-il si personne ne mise ?", a: "Si aucune offre n'est reçue avant la fin du délai, l'annonce expire sans obligation de vente. Vous pouvez la republier en modifiant le prix de départ." },
              { q: "L'acheteur peut-il se rétracter ?", a: "Non, une offre d'enchère est un engagement ferme d'achat. L'acheteur gagnant doit procéder au paiement pour finaliser la transaction." },
              { q: "Quelle commission SwingMarket prélève-t-il ?", a: "Les mêmes commissions dégressives qu'une vente classique s'appliquent : de 10% pour les articles sous 100€ à 4% pour les articles au-dessus de 1000€." },
              { q: "Puis-je annuler mon enchère en cours ?", a: "L'annulation est possible uniquement si aucune offre n'a encore été reçue. Une fois des enchères placées, la vente doit aller à son terme." },
            ].map((item, i) => (
              <details key={i} className="group bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 transition-colors list-none">
                  {item.q}
                  <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-gradient-to-br from-[#0F3D2E] via-[#1B5E20] to-[#2E7D32] py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-6">🏌️</div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Prêt à mettre votre matériel aux enchères ?</h2>
          <p className="text-green-100 text-lg mb-10 max-w-xl mx-auto">
            Rejoignez les centaines de golfeurs qui ont déjà vendu leur matériel plus vite et plus cher grâce aux enchères SwingMarket.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("CreateListing")}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-black px-8 py-4 rounded-full text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              <Gavel className="w-5 h-5" />
              Créer mon enchère maintenant
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to={createPageUrl("Marketplace") + "?sale_type=auction"}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-full text-lg transition-all border border-white/20">
              Voir les enchères en cours
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
