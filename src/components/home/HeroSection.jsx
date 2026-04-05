import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslate } from "../providers/TranslationProvider";
import { createPageUrl } from "@/utils";
import { supabase as base44 } from "@/lib/supabase";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const VIDEO_URL = "https://pnhiuifejnnklbfpjmdr.supabase.co/storage/v1/object/public/products/6542259-uhd_2560_1440_25fps%20(1).mp4";

export default function HeroSection() {
  const { t } = useTranslate();
  const [current, setCurrent] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAlreadyConnected, setShowAlreadyConnected] = useState(false);

  useEffect(() => {
    Promise.resolve(true).then(setIsLoggedIn);
  }, []);

  const SLIDES = [
    {
      image: "https://le-clos-du-phare.com/wp-content/uploads/2022/05/golf-etretat.jpg",
      tag: t('home.hero_tag1'),
      title: t('home.hero_title1'),
      subtitle: t('home.hero_subtitle1'),
      cta: { label: t('home.hero_signup'), action: () => isLoggedIn ? setShowAlreadyConnected(true) : window.location.href='/login' },
      ctaSecondary: { label: t('home.hero_sell'), url: createPageUrl("CreateListing") },
    },
    {
      image: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=1400&h=700&fit=crop",
      tag: t('home.hero_tag2'),
      title: t('home.hero_title2'),
      subtitle: t('home.hero_subtitle2'),
      cta: { label: t('home.hero_clubs'), url: createPageUrl("Marketplace") + "?category=Clubs+de+golf" },
      ctaSecondary: null,
    },
    {
      type: "video",
      video: VIDEO_URL,
      tag: "🏌️ La passion du golf",
      title: "Vivez le golf\nautrement",
      subtitle: "Trouvez l'équipement qui fait la différence",
      cta: { label: "Voir les annonces", url: createPageUrl("Marketplace") },
      ctaSecondary: { label: "Vendre mon matériel", url: createPageUrl("CreateListing") },
    },
  ];

  useEffect(() => {
    const duration = SLIDES[current]?.type === 'video' ? 8000 : 5000;
    const t = setTimeout(() => setCurrent(c => (c + 1) % SLIDES.length), duration);
    return () => clearTimeout(t);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className="relative h-[520px] md:h-[620px] overflow-hidden z-0">
      {/* Background images */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {s.type === "video" ? (
            <video src={s.video} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={s.image} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <div className="inline-flex items-center gap-2 bg-[#C5A028]/20 border border-[#C5A028]/40 backdrop-blur-sm text-[#C5A028] rounded-full px-4 py-1.5 text-xs font-semibold mb-5 tracking-wider uppercase">
          🔥 Achat immédiat ou enchères
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 max-w-4xl" style={{ whiteSpace: "pre-line" }}>
          {slide.title}
        </h1>
        <p className="text-white/75 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
          {slide.subtitle}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {slide.cta.action ? (
            <button
              onClick={slide.cta.action}
              className="bg-[#C5A028] hover:bg-[#D4AF37] text-white font-semibold rounded-full px-8 py-3 text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              {slide.cta.label} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <Link to={slide.cta.url}>
              <button className="bg-[#C5A028] hover:bg-[#D4AF37] text-white font-semibold rounded-full px-8 py-3 text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl">
                {slide.cta.label} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          )}
          {slide.ctaSecondary && (
            <Link to={slide.ctaSecondary.url}>
              <button className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-full px-8 py-3 text-sm transition-all backdrop-blur-sm">
                {slide.ctaSecondary.label}
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrent(c => (c + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Already connected toast */}
      {showAlreadyConnected && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-white text-gray-800 rounded-xl px-5 py-3 shadow-xl flex items-center gap-3 text-sm font-medium">
          <span>✅ Vous êtes déjà connecté !</span>
          <button onClick={() => setShowAlreadyConnected(false)} className="text-gray-400 hover:text-gray-600 ml-2">✕</button>
        </div>
      )}

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? "w-8 h-2 bg-[#C5A028]" : "w-2 h-2 bg-white/40"}`}
          />
        ))}
      </div>
    </section>
  );
}