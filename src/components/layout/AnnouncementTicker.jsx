import React from "react";

const MESSAGES = [
  "🔒 Paiement sécurisé",
  "👤 Vendeurs vérifiés",
  "📦 Livraison suivie",
  "💬 Messagerie intégrée avec les vendeurs",
  "⚡ Achat immédiat ou enchères",
  "🛡️ Protection acheteur",
];

export default function AnnouncementTicker() {
  const doubled = [...MESSAGES, ...MESSAGES];

  return (
    <div className="bg-[#0A1F0C] text-white text-xs overflow-hidden py-2 relative">
      <div className="flex gap-12 animate-ticker whitespace-nowrap">
        {doubled.map((msg, i) => (
          <span key={i} className="shrink-0 font-medium tracking-wide">
            {msg}
            <span className="mx-6 text-[#C5A028]">•</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 35s linear infinite;
          display: inline-flex;
          min-width: 200%;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}