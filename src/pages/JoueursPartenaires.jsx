import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight, ArrowDown, ShieldCheck, Sparkles, MessageCircle,
  Trophy, BadgeCheck, Mail,
} from "lucide-react";

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const initialsOf = (prenom = "", nom = "") =>
  ((prenom?.[0] || "") + (nom?.[0] || "")).toUpperCase() || "SM";

const padNum = (n) => String(n).padStart(2, "0");

// Reveal au scroll
function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("jp-revealed"); io.unobserve(e.target); }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ─────────────────────────────────────────────────────────
// Pro card (réelle)
// ─────────────────────────────────────────────────────────
function ProCard({ pro, index }) {
  const c1 = pro.gradient_color_1 || "#143818";
  const c2 = pro.gradient_color_2 || "#1B5E20";
  const c3 = pro.gradient_color_3 || "#C5A028";
  const init = initialsOf(pro.prenom, pro.nom);

  return (
    <Link
      to={`/joueurs-partenaires/${pro.slug}`}
      className="jp-card"
      data-reveal
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span className="jp-card-num" aria-hidden>{padNum(index + 1)}</span>

      <div
        className="jp-card-cover"
        style={{
          background: pro.photo_url
            ? `url(${pro.photo_url}) center/cover no-repeat, linear-gradient(180deg, ${c1}, ${c2})`
            : `radial-gradient(70% 60% at 50% 30%, ${c3}33, transparent 70%), linear-gradient(180deg, ${c1} 0%, ${c2} 60%, ${c1} 100%)`,
        }}
      >
        {!pro.photo_url && <span className="jp-card-init">{init}</span>}
      </div>

      <div className="jp-card-grad" aria-hidden />

      <div className="jp-card-body">
        {pro.statut_label && (
          <span className="jp-tag">
            <span className="jp-tag-dot" />
            {pro.statut_label}
          </span>
        )}
        <h3 className="jp-card-name">
          {pro.prenom} <span className="jp-card-lname">{pro.nom}</span>
        </h3>
        {pro.palmares_court && (
          <p className="jp-card-pal">{pro.palmares_court}</p>
        )}
        <span className="jp-card-cta">
          Voir le setup <ArrowRight className="jp-card-cta-icn w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────
// Silhouette card (état vide / coming soon)
// ─────────────────────────────────────────────────────────
function SilhouetteCard({ index }) {
  return (
    <div className="jp-card jp-card-silh" data-reveal style={{ animationDelay: `${index * 70}ms` }}>
      <span className="jp-card-num jp-card-num-silh" aria-hidden>{padNum(index + 1)}</span>

      <div className="jp-card-cover jp-card-cover-silh">
        {/* Silhouette golfeur SVG, contour or */}
        <svg viewBox="0 0 200 320" className="jp-silh-svg" aria-hidden preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={`silh-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#E8C84A" stopOpacity=".55" />
              <stop offset="100%" stopColor="#C5A028" stopOpacity=".22" />
            </linearGradient>
          </defs>
          {/* Tête */}
          <circle cx="100" cy="48" r="20" fill="none" stroke={`url(#silh-${index})`} strokeWidth="1.8" />
          {/* Buste / bras qui swing */}
          <path d="M 70 90 Q 100 80 130 90 L 140 170 Q 100 180 60 170 Z"
                fill="none" stroke={`url(#silh-${index})`} strokeWidth="1.8" strokeLinejoin="round" />
          {/* Bras tendu vers haut-droite (club) */}
          <path d="M 130 90 Q 165 60 185 30" fill="none" stroke={`url(#silh-${index})`} strokeWidth="1.8" strokeLinecap="round" />
          {/* Club (ligne diagonale qui sort en haut) */}
          <line x1="185" y1="30" x2="195" y2="8" stroke={`url(#silh-${index})`} strokeWidth="2" strokeLinecap="round" />
          {/* Tête de club */}
          <ellipse cx="195" cy="8" rx="6" ry="3" fill={`url(#silh-${index})`} opacity=".7" />
          {/* Jambes */}
          <path d="M 80 170 L 76 280" fill="none" stroke={`url(#silh-${index})`} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 120 170 L 124 280" fill="none" stroke={`url(#silh-${index})`} strokeWidth="1.8" strokeLinecap="round" />
          {/* Sol / ombre */}
          <ellipse cx="100" cy="290" rx="55" ry="6" fill="rgba(232,200,74,.10)" />
        </svg>
      </div>

      <div className="jp-card-grad jp-card-grad-silh" aria-hidden />

      <div className="jp-card-body">
        <span className="jp-tag jp-tag-soon">
          <span className="jp-tag-dot jp-tag-dot-soon" />
          Bientôt
        </span>
        <h3 className="jp-card-name jp-card-name-silh">
          Notre <span className="jp-card-lname jp-italic">prochain pro</span>
        </h3>
        <p className="jp-card-pal jp-card-pal-silh">Recrutement en cours</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Skeleton (loading)
// ─────────────────────────────────────────────────────────
function SkeletonCard({ index }) {
  return (
    <div className="jp-card jp-card-skel" aria-hidden>
      <span className="jp-card-num jp-card-num-silh">{padNum(index + 1)}</span>
      <div className="jp-card-cover jp-card-cover-skel" />
      <div className="jp-card-grad jp-card-grad-silh" aria-hidden />
      <div className="jp-card-body">
        <div className="jp-skel-line jp-skel-w-30" />
        <div className="jp-skel-line jp-skel-w-70 jp-skel-h-7" />
        <div className="jp-skel-line jp-skel-w-50" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────
export default function JoueursPartenaires() {
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);

  useReveal([pros.length, loading]);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from("pro_partners")
      .select("id, slug, prenom, nom, photo_url, statut_label, palmares_court, gradient_color_1, gradient_color_2, gradient_color_3, display_order, is_featured")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("[JoueursPartenaires] fetch error:", error);
          setError(error.message);
        }
        setPros(data || []);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const isEmpty = !loading && pros.length === 0;

  const scrollToGrid = () => {
    const el = document.getElementById("jp-grid");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Style />
      <main className="jp-main">

        {/* ════════ HERO ════════ */}
        <section className="jp-hero">
          <div className="jp-hero-bg" aria-hidden>
            <div className="jp-blob jp-blob-1" />
            <div className="jp-blob jp-blob-2" />
            <div className="jp-grid-bg" />
          </div>

          <div className="jp-hero-inner" data-reveal>
            <span className="jp-kicker">
              <span className="jp-kicker-dot" />
              Joueurs partenaires SwingMarketGolf
            </span>

            <h1 className="jp-h1">
              <span className="jp-h1-line">Le matériel des champions.</span>
              <span className="jp-h1-line jp-h1-accent">Accessible.</span>
            </h1>

            <p className="jp-hero-sub">
              Découvrez le setup des pros partenaires SwingMarketGolf.
              Achetez le matériel qu'ils utilisent en compétition —
              directement depuis leur vitrine personnelle.
            </p>

            <div className="jp-hero-actions">
              <button onClick={scrollToGrid} className="jp-btn jp-btn-primary">
                Découvrir les pros <ArrowDown className="w-4 h-4" />
              </button>
              <a
                href="mailto:partenariats@swingmarketgolf.com?subject=Candidature%20partenariat%20pro"
                className="jp-btn jp-btn-ghost"
              >
                Devenir partenaire
              </a>
            </div>

            <div className="jp-trust" data-reveal>
              <span><BadgeCheck className="w-3.5 h-3.5" /> Setup vérifié</span>
              <span className="jp-trust-sep">·</span>
              <span><Trophy className="w-3.5 h-3.5" /> Vendeurs pros</span>
              <span className="jp-trust-sep">·</span>
              <span><ShieldCheck className="w-3.5 h-3.5" /> Authenticité garantie</span>
            </div>
          </div>
        </section>

        {/* ════════ GRILLE ════════ */}
        <section id="jp-grid" className="jp-grid-section">
          <div className="jp-grid-inner">
            <div className="jp-section-head" data-reveal>
              <span className="jp-section-line" />
              <h2 className="jp-section-title">
                {isEmpty ? "La team se construit" : "La team partenaire"}
              </h2>
              {!isEmpty && !loading && (
                <span className="jp-section-meta">{pros.length} pro{pros.length > 1 ? "s" : ""}</span>
              )}
            </div>

            <div className="jp-grid">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} index={i} />)
                : isEmpty
                  ? Array.from({ length: 3 }).map((_, i) => <SilhouetteCard key={i} index={i} />)
                  : pros.map((p, i) => <ProCard key={p.id} pro={p} index={i} />)}
            </div>

            {/* Encart recrutement (état vide) */}
            {isEmpty && (
              <div className="jp-recruit" data-reveal>
                <div className="jp-recruit-deco" aria-hidden />
                <span className="jp-recruit-kicker">
                  <Sparkles className="w-3.5 h-3.5" />
                  Vous êtes joueur professionnel&nbsp;?
                </span>
                <h3 className="jp-recruit-title">
                  Rejoignez la team <span className="jp-recruit-accent">SwingMarketGolf.</span>
                </h3>
                <p className="jp-recruit-sub">
                  Une vitrine dédiée. Vos clubs visibles par toute la communauté.
                  Pas de commission sur vos premières ventes.
                </p>
                <div className="jp-recruit-actions">
                  <a
                    href="mailto:partenariats@swingmarketgolf.com?subject=Candidature%20partenariat%20pro"
                    className="jp-btn jp-btn-gold"
                  >
                    <Mail className="w-4 h-4" /> Postuler comme partenaire
                  </a>
                  <Link to="/Contact" className="jp-btn jp-btn-ghost-dark">
                    En savoir plus <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ════════ PROOF ════════ */}
        <section className="jp-proof">
          <div className="jp-proof-inner">
            <div className="jp-section-head" data-reveal>
              <span className="jp-section-line" />
              <h2 className="jp-section-title">Pourquoi un pro vous vend mieux</h2>
            </div>

            <div className="jp-proof-grid">
              {[
                {
                  Icon: BadgeCheck,
                  title: "Setup vérifié",
                  desc: "Chaque club proposé est référencé dans le setup officiel du pro en compétition.",
                },
                {
                  Icon: Trophy,
                  title: "Achat direct",
                  desc: "Vous achetez directement chez le pro, pas d'intermédiaire, pas de copie.",
                },
                {
                  Icon: MessageCircle,
                  title: "Communauté",
                  desc: "Échangez avec les pros via la messagerie SwingMarket.",
                },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className="jp-proof-card"
                  data-reveal
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <div className="jp-proof-icon">
                    <item.Icon className="w-5 h-5" />
                  </div>
                  <h3 className="jp-proof-title">{item.title}</h3>
                  <p className="jp-proof-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ CTA FINAL ════════ */}
        <section className="jp-final" data-reveal>
          <div className="jp-final-card">
            <div className="jp-final-deco" aria-hidden />
            <Sparkles className="jp-final-spark w-5 h-5" />
            <h2 className="jp-final-title">
              Le matériel des pros, <span className="jp-final-accent">à portée de main.</span>
            </h2>
            <p className="jp-final-sub">
              Découvrez la team et leur setup, ou candidatez pour devenir partenaire.
            </p>
            <div className="jp-final-actions">
              <button onClick={scrollToGrid} className="jp-btn jp-btn-primary">
                Voir tous les pros <ArrowDown className="w-4 h-4" />
              </button>
              <a
                href="mailto:partenariats@swingmarketgolf.com?subject=Candidature%20partenariat%20pro"
                className="jp-btn jp-btn-outline"
              >
                Devenir partenaire <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────
function Style() {
  return (
    <style>{`
      .jp-main {
        min-height: 100vh;
        background: #FAF8F3;
        color: #0A1F0C;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-feature-settings: "ss01", "cv11";
        -webkit-font-smoothing: antialiased;
      }

      /* ════════ HERO ════════ */
      .jp-hero {
        position: relative; overflow: hidden;
        padding: 96px 24px 72px;
        background: linear-gradient(180deg, #051A0E 0%, #0A2E1A 60%, #143818 100%);
        color: white;
        isolation: isolate;
      }
      .jp-hero-bg { position: absolute; inset: 0; pointer-events: none; }
      .jp-blob {
        position: absolute;
        filter: blur(80px);
        opacity: .5;
        border-radius: 50%;
      }
      .jp-blob-1 {
        width: 540px; height: 540px;
        top: -200px; right: -120px;
        background: radial-gradient(circle, rgba(76,175,80,.55), transparent 70%);
        animation: jp-float 16s ease-in-out infinite;
      }
      .jp-blob-2 {
        width: 480px; height: 480px;
        bottom: -200px; left: -100px;
        background: radial-gradient(circle, rgba(232,200,74,.45), transparent 70%);
        animation: jp-float 20s ease-in-out infinite reverse;
      }
      @keyframes jp-float {
        0%, 100% { transform: translate(0, 0); }
        50%      { transform: translate(40px, -25px); }
      }
      .jp-grid-bg {
        position: absolute; inset: 0;
        background-image:
          linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
        background-size: 56px 56px;
        mask-image: radial-gradient(70% 80% at 50% 30%, #000, transparent 90%);
        -webkit-mask-image: radial-gradient(70% 80% at 50% 30%, #000, transparent 90%);
      }

      .jp-hero-inner {
        position: relative; z-index: 2;
        max-width: 1100px; margin: 0 auto;
      }
      .jp-kicker {
        display: inline-flex; align-items: center; gap: 8px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11.5px; font-weight: 600;
        letter-spacing: .14em; text-transform: uppercase;
        color: #E8C84A;
        padding: 7px 16px;
        background: rgba(232,200,74,.10);
        border: 1px solid rgba(232,200,74,.28);
        border-radius: 999px;
        margin-bottom: 28px;
      }
      .jp-kicker-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #E8C84A;
        box-shadow: 0 0 0 4px rgba(232,200,74,.18);
        animation: jp-pulse 2s infinite;
      }
      @keyframes jp-pulse {
        0%, 100% { box-shadow: 0 0 0 4px rgba(232,200,74,.18); }
        50%      { box-shadow: 0 0 0 8px rgba(232,200,74,.05); }
      }

      .jp-h1 {
        font-weight: 900;
        font-size: clamp(44px, 7.4vw, 92px);
        line-height: .96;
        letter-spacing: -0.045em;
        margin: 0 0 22px;
        max-width: 940px;
      }
      .jp-h1-line { display: block; }
      .jp-h1-accent {
        background: linear-gradient(135deg, #E8C84A 0%, #C5A028 50%, #FFEDA8 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-style: italic;
        font-family: Georgia, 'Times New Roman', serif;
        font-weight: 400;
        font-size: 1em;
        padding-right: .04em;
        line-height: 1.05;
      }
      .jp-hero-sub {
        font-family: Georgia, 'Times New Roman', serif;
        font-style: italic;
        font-size: clamp(15px, 1.5vw, 19px);
        line-height: 1.6;
        color: rgba(255,255,255,.78);
        margin: 0 0 36px;
        max-width: 600px;
      }

      .jp-hero-actions {
        display: flex; flex-wrap: wrap;
        gap: 12px; margin-bottom: 32px;
      }

      .jp-btn {
        display: inline-flex; align-items: center; justify-content: center;
        gap: 8px;
        font-family: inherit;
        font-weight: 800; font-size: 14px;
        padding: 13px 22px;
        border-radius: 999px;
        text-decoration: none;
        border: 0; cursor: pointer;
        transition: transform .2s, box-shadow .2s, background .2s, color .2s;
      }
      .jp-btn-primary {
        background: linear-gradient(135deg, #1B5E20, #2E7D32);
        color: white;
        box-shadow: 0 16px 32px -10px rgba(27,94,32,.55);
      }
      .jp-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 22px 40px -10px rgba(27,94,32,.7);
      }
      .jp-btn-gold {
        background: linear-gradient(135deg, #E8C84A, #C5A028);
        color: #0A1F0C;
        box-shadow: 0 16px 32px -10px rgba(232,200,74,.55);
      }
      .jp-btn-gold:hover {
        transform: translateY(-2px);
        background: linear-gradient(135deg, #FFEDA8, #E8C84A);
        box-shadow: 0 22px 40px -10px rgba(232,200,74,.7);
      }
      .jp-btn-ghost {
        background: rgba(255,255,255,.08);
        color: white;
        border: 1px solid rgba(255,255,255,.20);
        backdrop-filter: blur(10px);
      }
      .jp-btn-ghost:hover {
        background: rgba(255,255,255,.16);
        transform: translateY(-2px);
      }
      .jp-btn-ghost-dark {
        background: white;
        color: #0A1F0C;
        border: 1px solid rgba(10,31,12,.10);
      }
      .jp-btn-ghost-dark:hover {
        border-color: rgba(10,31,12,.20);
        transform: translateY(-2px);
      }
      .jp-btn-outline {
        background: transparent;
        color: white;
        border: 1px solid rgba(255,255,255,.30);
      }
      .jp-btn-outline:hover {
        background: rgba(255,255,255,.10);
        border-color: rgba(255,255,255,.50);
        transform: translateY(-2px);
      }

      .jp-trust {
        display: inline-flex; flex-wrap: wrap; align-items: center; gap: 12px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11.5px;
        color: rgba(255,255,255,.62);
        letter-spacing: .04em;
      }
      .jp-trust > span { display: inline-flex; align-items: center; gap: 6px; }
      .jp-trust svg { color: #E8C84A; }
      .jp-trust-sep { color: rgba(255,255,255,.25); }

      /* ════════ Grille ════════ */
      .jp-grid-section { padding: 80px 24px 64px; }
      .jp-grid-inner { max-width: 1280px; margin: 0 auto; }

      .jp-section-head {
        display: flex; align-items: center; gap: 14px;
        margin-bottom: 36px;
      }
      .jp-section-line {
        flex: 0 0 32px; height: 2px;
        background: linear-gradient(90deg, #C5A028, transparent);
      }
      .jp-section-title {
        font-weight: 900;
        font-size: clamp(22px, 2.6vw, 32px);
        letter-spacing: -0.03em;
        margin: 0;
        color: #0A1F0C;
      }
      .jp-section-meta {
        margin-left: auto;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11.5px;
        color: rgba(10,31,12,.5);
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .jp-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }
      @media (max-width: 1100px) { .jp-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 640px)  { .jp-grid { grid-template-columns: 1fr; } }

      .jp-card {
        position: relative;
        aspect-ratio: 3 / 4;
        min-height: 480px;
        border-radius: 22px;
        overflow: hidden;
        background: #0A1F0C;
        text-decoration: none;
        color: white;
        isolation: isolate;
        box-shadow: 0 24px 48px -24px rgba(10,31,12,.40);
        transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s;
        display: block;
      }
      .jp-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 36px 64px -24px rgba(10,31,12,.55);
      }

      .jp-card-num {
        position: absolute;
        top: 14px; left: 18px;
        z-index: 3;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-weight: 900;
        font-size: clamp(96px, 11vw, 140px);
        line-height: 1;
        letter-spacing: -0.06em;
        color: rgba(255,255,255,.08);
        pointer-events: none;
      }

      .jp-card-cover {
        position: absolute; inset: 0;
        z-index: 1;
        transition: transform .6s cubic-bezier(.2,.7,.2,1);
        display: grid; place-items: center;
      }
      .jp-card:hover .jp-card-cover { transform: scale(1.04); }

      .jp-card-init {
        font-family: 'Inter', sans-serif;
        font-weight: 900;
        font-size: clamp(72px, 9vw, 120px);
        letter-spacing: -0.04em;
        color: rgba(255,255,255,.22);
        text-shadow: 0 4px 24px rgba(0,0,0,.25);
      }

      .jp-card-grad {
        position: absolute; inset: 0;
        z-index: 2;
        background: linear-gradient(180deg, transparent 35%, rgba(0,0,0,.55) 65%, rgba(0,0,0,.92) 100%);
        pointer-events: none;
      }

      .jp-card-body {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        z-index: 3;
        padding: clamp(20px, 2.4vw, 28px);
        display: flex; flex-direction: column;
        gap: 8px;
      }

      .jp-tag {
        align-self: flex-start;
        display: inline-flex; align-items: center; gap: 6px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10.5px; font-weight: 700;
        padding: 5px 11px; border-radius: 999px;
        letter-spacing: .14em; text-transform: uppercase;
        background: rgba(255,255,255,.12);
        color: white;
        border: 1px solid rgba(255,255,255,.18);
        backdrop-filter: blur(10px);
        margin-bottom: 6px;
      }
      .jp-tag-dot {
        width: 5px; height: 5px; border-radius: 50%;
        background: #7BD389;
        box-shadow: 0 0 0 3px rgba(123,211,137,.20);
      }

      .jp-card-name {
        font-family: 'Inter', sans-serif;
        font-weight: 900;
        font-size: clamp(22px, 2.4vw, 28px);
        letter-spacing: -0.025em;
        line-height: 1.1;
        color: white;
        margin: 0;
        text-shadow: 0 2px 18px rgba(0,0,0,.35);
      }
      .jp-card-lname { font-weight: 800; }
      .jp-card-pal {
        font-family: Georgia, 'Times New Roman', serif;
        font-style: italic;
        font-size: 13.5px;
        line-height: 1.4;
        color: #E8C84A;
        margin: 0;
        text-shadow: 0 1px 6px rgba(0,0,0,.4);
      }
      .jp-card-cta {
        margin-top: 10px;
        display: inline-flex; align-items: center; gap: 4px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11.5px;
        letter-spacing: .12em; text-transform: uppercase;
        color: rgba(255,255,255,.85);
        font-weight: 700;
        transition: gap .25s, color .25s;
      }
      .jp-card:hover .jp-card-cta { gap: 9px; color: #E8C84A; }
      .jp-card-cta-icn { transition: transform .25s; }
      .jp-card:hover .jp-card-cta-icn { transform: translateX(3px); }

      /* ─── Silhouette / état vide ─── */
      .jp-card-silh {
        cursor: not-allowed;
        background:
          radial-gradient(70% 60% at 50% 30%, rgba(232,200,74,.06), transparent 70%),
          linear-gradient(180deg, #0F2818 0%, #061608 100%);
        box-shadow: 0 18px 40px -24px rgba(10,31,12,.30);
      }
      .jp-card-silh:hover { transform: none; box-shadow: 0 18px 40px -24px rgba(10,31,12,.30); }
      .jp-card-num-silh { color: rgba(232,200,74,.10); }
      .jp-card-cover-silh {
        background:
          radial-gradient(60% 50% at 50% 30%, rgba(232,200,74,.06), transparent 70%),
          repeating-linear-gradient(45deg, rgba(232,200,74,.04) 0 1px, transparent 1px 12px);
      }
      .jp-card-silh:hover .jp-card-cover { transform: none; }
      .jp-silh-svg {
        width: 60%; height: 100%;
        max-height: 80%;
        opacity: .85;
      }
      .jp-card-grad-silh {
        background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,.50) 75%, rgba(0,0,0,.85) 100%);
      }
      .jp-tag-soon {
        background: rgba(232,200,74,.16);
        color: #E8C84A;
        border-color: rgba(232,200,74,.30);
      }
      .jp-tag-dot-soon {
        background: #E8C84A;
        box-shadow: 0 0 0 3px rgba(232,200,74,.22);
        animation: jp-pulse 2s infinite;
      }
      .jp-card-name-silh { color: rgba(255,255,255,.82); }
      .jp-italic { font-style: italic; font-family: Georgia, serif; font-weight: 400; color: #E8C84A; }
      .jp-card-pal-silh {
        color: rgba(255,255,255,.55);
        font-style: normal;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11.5px;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      /* ─── Skeleton ─── */
      .jp-card-skel { cursor: default; }
      .jp-card-cover-skel {
        background: linear-gradient(110deg, #0A1F0C 30%, #143818 50%, #0A1F0C 70%);
        background-size: 200% 100%;
        animation: jp-shimmer 1.6s infinite;
      }
      @keyframes jp-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .jp-skel-line {
        height: 12px;
        border-radius: 6px;
        background: rgba(255,255,255,.10);
      }
      .jp-skel-w-30 { width: 30%; }
      .jp-skel-w-50 { width: 50%; }
      .jp-skel-w-70 { width: 70%; }
      .jp-skel-h-7  { height: 22px; }

      /* ─── Encart recrutement ─── */
      .jp-recruit {
        position: relative;
        margin-top: 56px;
        padding: 56px 32px;
        border-radius: 28px;
        background:
          radial-gradient(60% 80% at 80% 0%, rgba(232,200,74,.16), transparent 60%),
          radial-gradient(50% 70% at 0% 100%, rgba(76,175,80,.18), transparent 60%),
          linear-gradient(135deg, #0A1F0C 0%, #143818 100%);
        color: white;
        text-align: center;
        overflow: hidden;
        isolation: isolate;
        box-shadow: 0 32px 64px -24px rgba(10,31,12,.40);
      }
      .jp-recruit-deco {
        position: absolute; inset: 0; z-index: 0;
        background-image:
          linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
        background-size: 32px 32px;
        mask-image: radial-gradient(60% 80% at 50% 0%, #000, transparent 70%);
        -webkit-mask-image: radial-gradient(60% 80% at 50% 0%, #000, transparent 70%);
        pointer-events: none;
      }
      .jp-recruit > *:not(.jp-recruit-deco) { position: relative; z-index: 1; }
      .jp-recruit-kicker {
        display: inline-flex; align-items: center; gap: 8px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11.5px; font-weight: 700;
        letter-spacing: .14em; text-transform: uppercase;
        color: #E8C84A;
        padding: 6px 14px;
        background: rgba(232,200,74,.10);
        border: 1px solid rgba(232,200,74,.25);
        border-radius: 999px;
        margin-bottom: 18px;
      }
      .jp-recruit-title {
        font-weight: 900;
        font-size: clamp(26px, 3.4vw, 40px);
        letter-spacing: -0.03em; line-height: 1.12;
        margin: 0 0 14px;
      }
      .jp-recruit-accent {
        background: linear-gradient(135deg, #E8C84A, #C5A028);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-style: italic;
        font-family: Georgia, serif;
        font-weight: 400;
      }
      .jp-recruit-sub {
        font-family: Georgia, serif;
        font-size: 15.5px; line-height: 1.6;
        color: rgba(255,255,255,.72);
        margin: 0 auto 28px;
        max-width: 580px;
      }
      .jp-recruit-actions {
        display: inline-flex; flex-wrap: wrap;
        gap: 12px; justify-content: center;
      }

      /* ════════ Proof ════════ */
      .jp-proof { padding: 64px 24px 48px; }
      .jp-proof-inner { max-width: 1100px; margin: 0 auto; }
      .jp-proof-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 18px;
      }
      .jp-proof-card {
        background: white;
        border: 1px solid rgba(10,31,12,.08);
        border-radius: 18px;
        padding: 28px 24px;
        transition: transform .25s, box-shadow .25s, border-color .2s;
      }
      .jp-proof-card:hover {
        transform: translateY(-3px);
        border-color: rgba(10,31,12,.16);
        box-shadow: 0 18px 32px -16px rgba(10,31,12,.18);
      }
      .jp-proof-icon {
        width: 44px; height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(76,175,80,.12), rgba(232,200,74,.10));
        color: #1B5E20;
        display: grid; place-items: center;
        margin-bottom: 16px;
      }
      .jp-proof-title {
        font-weight: 800;
        font-size: 17px;
        letter-spacing: -0.015em;
        color: #0A1F0C;
        margin: 0 0 8px;
      }
      .jp-proof-desc {
        font-family: Georgia, serif;
        font-size: 14.5px; line-height: 1.6;
        color: #4A5450;
        margin: 0;
      }

      /* ════════ CTA Final ════════ */
      .jp-final { padding: 24px 24px 96px; }
      .jp-final-card {
        position: relative;
        max-width: 1100px; margin: 0 auto;
        background:
          radial-gradient(60% 80% at 80% 0%, rgba(232,200,74,.20), transparent 60%),
          radial-gradient(50% 70% at 0% 100%, rgba(76,175,80,.22), transparent 60%),
          linear-gradient(135deg, #051A0E 0%, #0A2E1A 50%, #143818 100%);
        border-radius: 32px;
        padding: 72px 32px;
        text-align: center;
        color: white;
        overflow: hidden;
        isolation: isolate;
        box-shadow: 0 40px 80px -30px rgba(10,31,12,.40);
      }
      .jp-final-deco {
        position: absolute; inset: 0; z-index: 0;
        background-image:
          linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
        background-size: 32px 32px;
        mask-image: radial-gradient(60% 80% at 50% 0%, #000, transparent 70%);
        -webkit-mask-image: radial-gradient(60% 80% at 50% 0%, #000, transparent 70%);
        pointer-events: none;
      }
      .jp-final-card > *:not(.jp-final-deco) { position: relative; z-index: 1; }
      .jp-final-spark { color: #E8C84A; margin-bottom: 14px; }
      .jp-final-title {
        font-weight: 900;
        font-size: clamp(26px, 4vw, 44px);
        letter-spacing: -0.035em;
        line-height: 1.12;
        margin: 0 0 14px;
      }
      .jp-final-accent {
        background: linear-gradient(135deg, #E8C84A, #C5A028);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-style: italic;
        font-family: Georgia, serif;
        font-weight: 400;
      }
      .jp-final-sub {
        font-family: Georgia, serif;
        font-size: 16px;
        color: rgba(255,255,255,.72);
        margin: 0 0 32px;
      }
      .jp-final-actions {
        display: inline-flex; flex-wrap: wrap;
        gap: 12px; justify-content: center;
      }

      /* ════════ Reveal ════════ */
      [data-reveal] {
        opacity: 0; transform: translateY(16px);
        transition: opacity .65s cubic-bezier(.2,.7,.2,1), transform .65s cubic-bezier(.2,.7,.2,1);
      }
      [data-reveal].jp-revealed { opacity: 1; transform: none; }

      @media (prefers-reduced-motion: reduce) {
        [data-reveal] { opacity: 1; transform: none; transition: none; }
        .jp-card:hover, .jp-proof-card:hover, .jp-btn:hover { transform: none; }
        .jp-card:hover .jp-card-cover { transform: none; }
        .jp-blob-1, .jp-blob-2, .jp-kicker-dot, .jp-tag-dot-soon { animation: none; }
        .jp-card-cover-skel { animation: none; }
      }
    `}</style>
  );
}
