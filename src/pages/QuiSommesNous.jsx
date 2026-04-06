import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, ShoppingBag, Tag } from "lucide-react";

const Section = ({ title, children }) => (
  <div className="mb-12">
    <h2 className="text-2xl font-bold text-[#1B5E20] mb-4">{title}</h2>
    {children}
  </div>
);

const BulletList = ({ items }) => (
  <ul className="mt-3 space-y-2">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2 text-gray-700">
        <span className="mt-1.5 w-2 h-2 rounded-full bg-[#C5A028] flex-shrink-0" />
        {item}
      </li>
    ))}
  </ul>
);

export default function QuiSommesNous() {
  return (
    <div className="bg-[#FAFAFA]">
      {/* Hero */}
      <div className="relative h-[420px] md:h-[520px] overflow-hidden">
        <img
          src="https://leclub-golf.com/_next/image?url=%2Fimages%2Fhomepage%2FLCG-Home.webp&w=3840&q=75"
          alt="SwingMarket - Qui sommes-nous"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/65" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
            Qui sommes-nous ?
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-xl">
            Une marketplace créée par des passionnés de golf
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-16">

        <Section title="Une marketplace créée par des passionnés de golf">
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              SwingMarket est né d'une idée simple : rassembler les passionnés de golf autour d'une plateforme dédiée à l'achat, la vente et le partage d'équipements entre golfeurs.
            </p>
            <p>
              Comme beaucoup de joueurs, nous avons accumulé au fil du temps des clubs, des sacs, des balles et des accessoires qui finissent parfois oubliés dans un garage ou un placard. Pourtant, ces équipements peuvent encore servir et permettre à d'autres golfeurs de profiter de ce sport.
            </p>
            <p className="font-medium text-[#1B5E20]">
              C'est de cette réflexion qu'est née l'idée de créer SwingMarket.
            </p>
          </div>
        </Section>

        <Section title="Rendre le golf plus accessible">
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Le golf est un sport extraordinaire : il demande de la précision, de la patience et offre des moments uniques sur les parcours.
            </p>
            <p>
              Mais il peut aussi être un sport coûteux, surtout lorsqu'on débute.
            </p>
            <p className="font-medium">Avec SwingMarket, notre objectif est simple : <span className="text-[#1B5E20] font-bold">rendre le golf plus accessible à tous.</span></p>
            <p>En favorisant la seconde main, chacun peut :</p>
            <BulletList items={[
              "acheter du matériel à un prix plus abordable",
              "vendre l'équipement qu'il n'utilise plus",
              "découvrir ou redécouvrir ce sport sans se ruiner",
            ]} />
          </div>
        </Section>

        <Section title="Donner une seconde vie au matériel de golf">
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Un club de golf ne perd pas sa valeur après quelques parties. Chaque driver, chaque fer ou chaque sac peut continuer son histoire entre les mains d'un autre joueur.
            </p>
            <p>Sur SwingMarket, nous voulons encourager :</p>
            <BulletList items={[
              "le partage entre passionnés",
              "la transmission du matériel",
              "une approche plus responsable du sport",
            ]} />
            <p>
              Acheter ou vendre d'occasion permet non seulement d'économiser, mais aussi de prolonger la vie des équipements.
            </p>
          </div>
        </Section>

        <Section title="Une communauté avant tout">
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              SwingMarket n'est pas seulement une marketplace. C'est aussi une communauté de golfeurs qui partagent la même passion pour le jeu, les parcours et les sensations uniques qu'offre le golf.
            </p>
            <p>Que vous soyez :</p>
            <BulletList items={[
              "débutant",
              "joueur occasionnel",
              "passionné confirmé",
            ]} />
            <p className="mt-3">
              vous trouverez ici un espace pour acheter, vendre et échanger avec d'autres golfeurs.
            </p>
          </div>
        </Section>

        <Section title="Notre ambition">
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Notre ambition est de construire une plateforme simple, sécurisée et pensée pour les golfeurs.
            </p>
            <p>
              Aujourd'hui, SwingMarket commence son aventure. Demain, nous espérons réunir une communauté de passionnés partout en Europe et ailleurs.
            </p>
            <p className="italic text-[#1B5E20] font-medium">
              Parce qu'au fond, le golf est avant tout une histoire de passion, de partage… et de plaisir sur le parcours.
            </p>
          </div>
        </Section>

        {/* Mot du fondateur */}
        <div className="my-12 bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A028]/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#C5A028]/20 border border-[#C5A028]/40 text-[#C5A028] rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider mb-4">
              Le mot du fondateur
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#C5A028] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                A
              </div>
              <div>
                <p className="text-white/90 text-lg leading-relaxed italic">
                  "Alexandre, passionné de golf et fondateur de SwingMarket, avec l'objectif de rendre le matériel de golf plus accessible grâce à la seconde main."
                </p>
                <p className="mt-3 font-semibold text-[#C5A028]">Alexandre — Fondateur de SwingMarket</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link to={createPageUrl("Marketplace")}>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold rounded-full px-8 py-3.5 text-sm transition-all shadow-lg hover:shadow-xl">
              <ShoppingBag className="w-4 h-4" />
              Découvrir les annonces
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link to={createPageUrl("Login")}>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#C5A028] hover:bg-[#D4AF37] text-white font-semibold rounded-full px-8 py-3.5 text-sm transition-all shadow-lg hover:shadow-xl">
              <Tag className="w-4 h-4" />
              Vendre mon équipement
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}