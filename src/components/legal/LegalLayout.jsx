import React, { useEffect } from "react";
import SEOHead from "../seo/SEOHead";

export default function LegalLayout({ title, version, children, seoTitle, seoDescription }) {
  const computedSeoTitle = seoTitle || `${title} | SwingMarket`;
  const computedSeoDescription = seoDescription || `Consultez la page ${title} de SwingMarket, la marketplace dédiée au golf d'occasion.`;

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <SEOHead
        title={computedSeoTitle}
        description={computedSeoDescription}
      />
      {/* Header banner */}
      <div className="relative py-16 md:py-20 bg-cover bg-center" style={{backgroundImage: "url('https://media.istockphoto.com/id/687159868/fr/photo/joueurs-sur-un-terrain-de-golf-vert.jpg?s=612x612&w=0&k=20&c=mBnIjF1ij0iicL0X1u4O1tiWGjTmNhqaEiEKz-NrXwc=')"}}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}