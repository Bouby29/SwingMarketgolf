import React from "react";
import { Check, ShoppingBag } from "lucide-react";

const REVIEWS = [
  {
    stars: 5,
    text: "Driver Stealth 2 conforme description, le vendeur connaît son matériel : il m'a même conseillé sur le shaft selon ma vitesse de swing. Reçu en 48h via Mondial Relay. Mieux qu'un Leboncoin classique.",
    product: "TaylorMade Stealth 2",
    price: "380 €",
    icon: "check",
    initials: "JM",
    avatarColor: "#173404",
    name: "Jean-Michel C.",
    badge: "Index 14",
    meta: "Avis publié le 14 mars",
  },
  {
    stars: 4,
    text: "Vendu mes vieux Apex en 9 jours, commission 7% acceptable, paiement Stripe sécurisé. À améliorer : le calcul des frais de port lors de la mise en ligne.",
    product: "Set Callaway Apex",
    price: "720 €",
    icon: "bag",
    initials: "SD",
    avatarColor: "#BA7517",
    name: "Sébastien D.",
    badge: "Index 8",
    meta: "Avis publié le 28 février",
  },
  {
    stars: 5,
    text: "Premier achat d'occasion pour mon putter Scotty. Doutes au début vu les prix attractifs. La messagerie m'a permis de poser toutes mes questions au vendeur. Putter conforme aux photos.",
    product: "Scotty Cameron Newport 2",
    price: "240 €",
    icon: "check",
    initials: "AL",
    avatarColor: "#3C3489",
    name: "Anaïs L.",
    badge: "Index 22",
    meta: "Avis publié le 8 mars",
  },
  {
    stars: 5,
    text: "Le système d'escrow change tout : argent libéré seulement à réception. J'avais peur de payer 195€ pour des hybrides Mizuno. Reçus en 3 jours, comme sur les photos.",
    product: "2 hybrides Mizuno CLK",
    price: "195 €",
    icon: "check",
    initials: "FR",
    avatarColor: "#185FA5",
    name: "François R.",
    badge: "Index 18",
    meta: "Avis publié le 22 février",
  },
  {
    stars: 5,
    text: "Pro de club, je conseille SwingMarket à mes élèves qui débutent. C'est ma référence pour équiper sans casser sa tirelire. Pas besoin d'un set neuf à 2000€ pour apprendre.",
    product: "Set complet débutant",
    price: "490 €",
    icon: "bag",
    initials: "TG",
    avatarColor: "#993556",
    name: "Thierry G.",
    badge: "Pro PGA",
    meta: "Avis publié le 11 mars",
  },
  {
    stars: 5,
    text: "Wedges Vokey trouvés en quelques jours. Le filtre par loft et bounce m'a permis de cibler exactement ce que je cherchais. Vrai outil pensé golfeur, on sent l'expertise du domaine.",
    product: "3 wedges Vokey SM9",
    price: "285 €",
    icon: "check",
    initials: "RP",
    avatarColor: "#A32D2D",
    name: "Romain P.",
    badge: "Index 5",
    meta: "Avis publié le 5 mars",
  },
  {
    stars: 5,
    text: "J'ai changé tout mon set en 2 mois grâce à SwingMarket. Vendu mon ancien matériel, racheté les nouveaux modèles d'occasion. Économie de 60% vs neuf, sans sacrifier la qualité.",
    product: "Renouvellement complet",
    price: "— 60 %",
    icon: "bag",
    initials: "EB",
    avatarColor: "#534AB7",
    name: "Emmanuel B.",
    badge: "Index 11",
    meta: "Avis publié le 1 mars",
  },
  {
    stars: 5,
    text: "Mon mari m'a offert un sac Titleist trouvé ici. Sceptique au début, puis j'ai vu : photos détaillées, vendeur noté, paiement bloqué. Le sac est arrivé en parfait état.",
    product: "Sac Titleist Players 4",
    price: "150 €",
    icon: "check",
    initials: "CV",
    avatarColor: "#0F6E56",
    name: "Catherine V.",
    badge: "Index 28",
    meta: "Avis publié le 19 février",
  },
];

const STATS = [
  { value: "4.6/5", label: "Note moyenne · 47 avis" },
  { value: "100%", label: "Paiements Stripe sécurisés" },
  { value: "48h", label: "Litige résolu en moyenne" },
  { value: "94%", label: "Recommanderaient SwingMarket" },
];

function StarRow({ count = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          width="14"
          height="14"
          fill={i < count ? "#EF9F27" : "#D3D1C7"}
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78L1.58 7.62l5.82-.85L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ r }) {
  const ProductIcon = r.icon === "bag" ? ShoppingBag : Check;
  return (
    <article className="tc-card relative shrink-0 bg-white border border-[#E5E0D5] rounded-[14px] p-[18px] flex flex-col">
      <span
        aria-hidden="true"
        className="absolute top-2 right-3 font-serif italic text-[#173404] leading-none select-none pointer-events-none"
        style={{
          fontSize: "56px",
          opacity: 0.08,
          fontFamily: '"Source Serif Pro", "Source Serif 4", Georgia, serif',
        }}
      >
        “
      </span>

      <StarRow count={r.stars} />

      <p className="mt-3 text-[13.5px] leading-[1.55] text-[#1A1F1A]">
        {r.text}
      </p>

      <div className="mt-4 inline-flex items-center gap-2 self-start max-w-full bg-[#FAF8F3] border border-[#E5E0D5] rounded-full px-3 py-1.5">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#173404] text-white shrink-0">
          <ProductIcon className="w-3 h-3" strokeWidth={3} />
        </span>
        <span className="text-[12px] font-medium text-[#1A1F1A] truncate">
          {r.product}
        </span>
        <span className="text-[12px] font-semibold text-[#BA7517] shrink-0">
          {r.price}
        </span>
      </div>

      <div className="mt-auto pt-4 mt-4 border-t border-[#EFEAE0]/80 flex items-center gap-2.5">
        <div
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
          style={{ background: r.avatarColor }}
        >
          {r.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-semibold text-[#042C53] truncate">
              {r.name}
            </p>
            <span className="text-[10px] font-semibold text-[#BA7517] bg-[#FBF3DE] border border-[#EFD89A] rounded-full px-1.5 py-0.5 shrink-0">
              {r.badge}
            </span>
          </div>
          <p className="text-[11px] text-[#6B6A65] mt-0.5 truncate">{r.meta}</p>
        </div>
      </div>
    </article>
  );
}

export default function TestimonialsCarousel() {
  const loop = [...REVIEWS, ...REVIEWS];

  return (
    <section
      className="tc-section relative w-full overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #FAF8F3 0%, #F5F1E8 100%)",
        padding: "80px 0",
      }}
    >
      <style>{`
        @keyframes tc-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-50% - 7px)); }
        }
        .tc-track {
          display: flex;
          width: max-content;
          gap: 14px;
          animation: tc-marquee 50s linear infinite;
          will-change: transform;
        }
        .tc-track:hover,
        .tc-track:focus-within {
          animation-play-state: paused;
        }
        .tc-card {
          width: 280px;
          min-height: 260px;
        }
        .tc-fade-left,
        .tc-fade-right {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 80px;
          pointer-events: none;
          z-index: 2;
        }
        .tc-fade-left {
          left: 0;
          background: linear-gradient(90deg, #FAF8F3 0%, rgba(250,248,243,0) 100%);
        }
        .tc-fade-right {
          right: 0;
          background: linear-gradient(-90deg, #F5F1E8 0%, rgba(245,241,232,0) 100%);
        }
        @keyframes tc-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(0.85); }
        }
        .tc-dot {
          animation: tc-pulse 1.8s ease-in-out infinite;
        }
        @media (max-width: 640px) {
          .tc-card { width: 240px; min-height: 240px; }
          .tc-track { animation-duration: 40s; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tc-track { animation: none; }
          .tc-dot { animation: none; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#8A6612]"
          style={{
            background: "rgba(239, 159, 39, 0.14)",
            border: "1px solid rgba(197, 160, 40, 0.35)",
          }}
        >
          <span
            className="tc-dot inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: "#C5A028" }}
          />
          4.6/5 — 47 avis vérifiés après transaction
        </div>

        <h2
          className="mt-5 text-2xl md:text-4xl text-[#042C53]"
          style={{ fontWeight: 500, letterSpacing: "-0.01em" }}
        >
          La communauté golf{" "}
          <em
            className="not-italic"
            style={{
              fontFamily:
                '"Source Serif Pro", "Source Serif 4", Georgia, serif',
              fontStyle: "italic",
              color: "#BA7517",
              fontWeight: 500,
            }}
          >
            nous fait confiance.
          </em>
        </h2>

        <p className="mt-3 mx-auto max-w-[520px] text-[14px] md:text-[15px] text-[#5F5E5A] leading-relaxed">
          Du débutant au joueur +1 d'index, tous trouvent leur matériel sur
          SwingMarket. Voici ce qu'ils en disent.
        </p>
      </div>

      <div className="relative">
        <div className="tc-fade-left" />
        <div className="tc-fade-right" />
        <div className="tc-track" role="list" aria-label="Avis vérifiés">
          {loop.map((r, i) => (
            <div role="listitem" key={i}>
              <ReviewCard r={r} />
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-[#E5E0D5]"
            >
              <p className="text-xl md:text-2xl font-extrabold text-[#173404]">
                {s.value}
              </p>
              <p className="text-[11px] md:text-xs text-[#5F5E5A] mt-1 font-medium">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
