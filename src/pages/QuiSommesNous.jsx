import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowRight, Heart, Users, Sparkles, Leaf,
  ShieldCheck, MessageCircle, Quote,
  Flag, Lock, Handshake, MapPin,
} from "lucide-react";

// ─────────────────────────────────────────────────────────
// Hook : reveal au scroll
// ─────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("q-revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -80px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// Cursor follower : cercle lime qui suit la souris (desktop seulement)
function CursorFollower() {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    let raf;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x, ty = y;
    const onMove = (e) => { tx = e.clientX; ty = e.clientY; };
    const tick = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    tick();
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} className="q-cursor" aria-hidden />;
}

// Card 3D tilt
function TiltCard({ children, className = "" }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg) translateZ(0)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <div ref={ref} className={`q-tilt ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

// CountUp
function CountUp({ to, suffix = "", duration = 1600 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [started]);
  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    let raf;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(to * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started, to, duration]);
  return <span ref={ref}>{Math.round(val).toLocaleString("fr-FR")}{suffix}</span>;
}

// ─────────────────────────────────────────────────────────
// Page Qui Sommes-Nous — style éditorial / magazine
// ─────────────────────────────────────────────────────────
export default function QuiSommesNous() {
  useReveal();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <Style />
      <CursorFollower />

      <main className="q-main">

        {/* ════════ HERO ÉDITORIAL ════════ */}
        <section className="q-hero">
          <div className="q-hero-grain" aria-hidden />

          <div className="q-hero-meta">
            <span className="q-meta-label">A propos</span>
            <span className="q-meta-sep">·</span>
            <span>SwingMarket Vol. 01</span>
            <span className="q-meta-sep">·</span>
            <span>Édition 2026</span>
          </div>

          <h1 className="q-hero-title">
            <span className="q-clip" style={{ "--d": "0s" }}>
              <span>Une marketplace</span>
            </span>
            <span className="q-clip q-clip-italic" style={{ "--d": "0.2s" }}>
              <span>née sur un&nbsp;</span><em>fairway.</em>
            </span>
          </h1>

          <div className="q-hero-grid">
            <div className="q-hero-photo" data-reveal>
              <div className="q-photo q-photo-1">
                <div className="q-photo-emoji">⛳</div>
                <span className="q-photo-tag">Hole-in-one · 2024</span>
              </div>
              <div className="q-photo q-photo-2">
                <div className="q-photo-emoji">🏌️‍♂️</div>
                <span className="q-photo-tag">Driving range · matin</span>
              </div>
              <div className="q-photo q-photo-3">
                <div className="q-photo-emoji">🏆</div>
                <span className="q-photo-tag">Communauté</span>
              </div>
              <div className="q-photo-frame" />
            </div>

            <div className="q-hero-text">
              <p className="q-drop">
                <span className="q-dropcap">S</span>wingMarket est née d'une
                conviction simple&nbsp;: <em>le matériel de golf coûte trop
                cher pour ne servir qu'une saison</em>. Nous croyons en une
                circulation intelligente du matériel — entre passionnés, sans
                intermédiaires gourmands, dans une communauté de confiance.
              </p>
              <p className="q-hero-by">
                <span className="q-by-line" /> Par <strong>Alexandre&nbsp;D.</strong>, fondateur
              </p>
            </div>
          </div>
        </section>

        {/* ════════ MARQUEE ════════ */}
        <section className="q-marquee" aria-hidden>
          <div className="q-marquee-track">
            {Array.from({ length: 2 }).map((_, k) => (
              <div className="q-marquee-row" key={k}>
                <span>Vendeurs vérifiés</span><span className="q-marquee-dot">●</span>
                <span>Paiement sécurisé Stripe</span><span className="q-marquee-dot">●</span>
                <span>Livraison 48-72h</span><span className="q-marquee-dot">●</span>
                <span>100% golf, 0% bullshit</span><span className="q-marquee-dot">●</span>
                <span>Made in France</span><span className="q-marquee-dot">●</span>
                <span>Communauté de passionnés</span><span className="q-marquee-dot">●</span>
              </div>
            ))}
          </div>
        </section>

        {/* ════════ MANIFESTE / PROMESSES ════════ */}
        <section className="q-manifesto">
          <div className="q-section-head" data-reveal>
            <span className="q-kicker">Notre manifeste</span>
            <h2 className="q-h2">
              <em>Le golf,</em> on en vit.<br />
              On veut juste qu'il <span className="q-h2-gold">vive plus</span>.
            </h2>
          </div>

          <div className="q-promises">
            {[
              { Icon: Flag,      title: "100 % golf",        sub: "Pas de pollution généraliste · juste votre passion" },
              { Icon: Lock,      title: "Paiement sécurisé", sub: "Stripe · vendeurs vérifiés · protection acheteur" },
              { Icon: Handshake, title: "Direct entre nous", sub: "Pas d'intermédiaires gourmands · 100 % du prix vous revient" },
              { Icon: MapPin,    title: "Made in France",    sub: "Une équipe passionnée · au service des golfeurs" },
            ].map((p, i) => (
              <div key={p.title} className="q-promise" data-reveal style={{ "--d": `${i * 0.08}s` }}>
                <div className="q-promise-icon">
                  <p.Icon className="w-5 h-5" />
                </div>
                <div className="q-promise-title">{p.title}</div>
                <div className="q-promise-sub">{p.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════ HISTOIRE / TIMELINE VERTICALE ════════ */}
        <section className="q-story">
          <div className="q-section-head" data-reveal>
            <span className="q-kicker">Notre histoire</span>
            <h2 className="q-h2">D'une <em>frustration</em> au club<br/>à la <span className="q-h2-gold">marketplace</span> golf française.</h2>
          </div>

          <div className="q-timeline">
            <div className="q-timeline-line" aria-hidden />
            {[
              {
                year: "2024",
                side: "left",
                title: "L'idée germe sur le green",
                body: "Alexandre, golfeur passionné depuis plus de dix ans, vend ses fers d'occasion sur Leboncoin et galère avec les acheteurs non-golfeurs. L'idée : créer une plateforme 100 % dédiée au golf.",
              },
              {
                year: "2025",
                side: "right",
                title: "Premiers prototypes",
                body: "Nuits blanches sur Figma, puis Vite + React + Supabase. Premières versions testées avec quelques amis du club. Les retours sont catégoriques : il faut foncer.",
              },
              {
                year: "Aujourd'hui",
                side: "left",
                title: "Phase finale de lancement",
                body: "Ouverture imminente de SwingMarketGolf.com — paiement sécurisé via Stripe, vendeurs vérifiés, expérience pensée pour les golfeurs. Préparez vos clubs : la marketplace arrive.",
              },
              {
                year: "Demain",
                side: "right",
                title: "Notre ambition",
                body: "Devenir la référence du matériel golf d'occasion en France, puis en Europe. Une communauté de passionnés qui se font confiance, sans intermédiaires gourmands.",
              },
            ].map((e, i) => (
              <div key={e.year} className={`q-event q-event-${e.side}`} data-reveal style={{ "--d": `${i * 0.1}s` }}>
                <div className="q-event-dot" aria-hidden />
                <div className="q-event-card">
                  <div className="q-event-year">{e.year}</div>
                  <h3 className="q-event-title">{e.title}</h3>
                  <p className="q-event-body">{e.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════ VALEURS — cards 3D tilt ════════ */}
        <section className="q-values">
          <div className="q-section-head" data-reveal>
            <span className="q-kicker">Ce qui nous anime</span>
            <h2 className="q-h2">Quatre <em>valeurs.</em><br/>Aucun compromis.</h2>
          </div>

          <div className="q-values-grid">
            {[
              { Icon: Heart,        tag: "Passion",     title: "Golfeurs avant tout",      body: "Notre équipe est composée à 100% de joueurs. On comprend votre matos parce qu'on l'utilise tous les week-ends.", color: "#1B5E20", bg: "#F2FCF3" },
              { Icon: ShieldCheck,  tag: "Confiance",   title: "Vendeurs vérifiés",        body: "Vérification d'identité Stripe KYC, modération humaine, protection acheteur. La confiance se mérite.", color: "#C5A028", bg: "#FEF9E7" },
              { Icon: Leaf,         tag: "Durabilité",  title: "Lutter contre le neuf",    body: "Un driver d'occasion vendu = un driver neuf qui ne sera pas produit. L'écologie passe par la circulation du matériel.", color: "#4CAF50", bg: "#F2FCF3" },
              { Icon: Users,        tag: "Communauté",  title: "Entre passionnés",         body: "Pas d'algos qui dévorent l'humain. Une vraie messagerie, des conseils entre golfeurs, du temps pour discuter handicap.", color: "#8B6914", bg: "#FEF9E7" },
            ].map((v, i) => (
              <div data-reveal key={v.title} style={{ "--d": `${i * 0.06}s` }}>
                <TiltCard className="q-value">
                  <div className="q-value-icon" style={{ background: v.bg, color: v.color }}>
                    <v.Icon className="w-5 h-5" />
                  </div>
                  <p className="q-value-tag" style={{ color: v.color }}>{v.tag}</p>
                  <h3 className="q-value-title">{v.title}</h3>
                  <p className="q-value-body">{v.body}</p>
                </TiltCard>
              </div>
            ))}
          </div>
        </section>

        {/* ════════ CITATION FONDATEUR ════════ */}
        <section className="q-quote-section">
          <div className="q-quote" data-reveal>
            <Quote className="q-quote-icon" />
            <blockquote className="q-quote-text">
              On ne voulait pas faire <em>une énième marketplace.</em>
              On voulait recréer le sentiment qu'on a après une bonne partie&nbsp;:
              celui de partager un terrain commun, où chacun comprend l'autre.
            </blockquote>
            <div className="q-quote-author">
              <div className="q-quote-avatar">AD</div>
              <div>
                <div className="q-quote-name">Alexandre Daniel</div>
                <div className="q-quote-role">Fondateur · SwingMarketGolf</div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════ CTA FINAL ════════ */}
        <section className="q-cta-section" data-reveal>
          <div className="q-cta">
            <h2 className="q-cta-title">
              Vous aussi,<br/>
              vous êtes <em>passionné</em> de golf&nbsp;?
            </h2>
            <p className="q-cta-sub">
              Rejoignez la communauté SwingMarketGolf — gratuitement, sans
              engagement. Nous sommes pressés de vous y accueillir.
            </p>
            <div className="q-cta-row">
              <Link to={createPageUrl("Marketplace")}>
                <button className="q-btn-primary">
                  <Sparkles className="w-4 h-4" />
                  Découvrir la marketplace
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/Contact" className="q-btn-ghost">
                <MessageCircle className="w-4 h-4" />
                Nous contacter
              </Link>
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
      .q-main {
        background: #FAF8F3;
        color: #1A1F1A;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        overflow-x: hidden;
      }

      /* ── Cursor follower ── */
      .q-cursor {
        position: fixed; top: 0; left: 0;
        width: 28px; height: 28px;
        margin: -14px 0 0 -14px;
        pointer-events: none;
        background: radial-gradient(circle, rgba(123,211,137,0.55), transparent 70%);
        border-radius: 50%;
        z-index: 999;
        mix-blend-mode: multiply;
      }
      @media (pointer: coarse) { .q-cursor { display: none; } }
      @media (prefers-reduced-motion: reduce) { .q-cursor { display: none; } }

      /* ── HERO ── */
      .q-hero {
        position: relative;
        max-width: 1240px; margin: 0 auto;
        padding: 80px 32px 48px;
        overflow: hidden;
      }
      .q-hero-grain {
        position: absolute; inset: 0;
        background-image:
          radial-gradient(circle at 15% 22%, rgba(197,160,40,.10), transparent 50%),
          radial-gradient(circle at 88% 75%, rgba(76,175,80,.08), transparent 50%);
        pointer-events: none;
      }
      .q-hero-meta {
        position: relative;
        display: flex; align-items: center; gap: 10px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px; color: #6B7268;
        letter-spacing: .14em; text-transform: uppercase;
        margin-bottom: 36px;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(26,31,26,.10);
      }
      .q-meta-label { color: #1B5E20; font-weight: 700; }
      .q-meta-sep { color: #C5A028; }

      .q-hero-title {
        position: relative;
        font-family: 'Inter', sans-serif;
        font-weight: 900;
        font-size: clamp(48px, 8.5vw, 124px);
        line-height: .92;
        letter-spacing: -0.045em;
        color: #0A1F0C;
        margin: 0 0 56px;
      }
      /* Animation clip-path : le texte est révélé par un masque qui s'ouvre */
      .q-clip { display: block; position: relative; overflow: hidden; padding-bottom: 0.04em; }
      .q-clip > span,
      .q-clip > em {
        display: inline-block;
        clip-path: inset(0 100% 0 0);
        animation: q-clip-reveal 1.1s cubic-bezier(.7,.05,.2,1) forwards;
        animation-delay: var(--d, 0s);
      }
      @keyframes q-clip-reveal {
        from { clip-path: inset(0 100% 0 0); }
        to   { clip-path: inset(0 0 0 0); }
      }
      .q-clip-italic em {
        font-style: italic;
        background: linear-gradient(180deg, #C5A028 0%, #8B6914 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-weight: 800;
      }

      .q-hero-grid {
        display: grid; grid-template-columns: 1.1fr 1fr;
        gap: 60px; align-items: center;
        position: relative;
      }
      .q-hero-photo {
        position: relative; aspect-ratio: 1 / 1.1; min-height: 380px;
      }
      .q-photo {
        position: absolute; border-radius: 22px;
        display: flex; flex-direction: column; justify-content: space-between;
        padding: 22px;
        box-shadow: 0 30px 60px -20px rgba(10,31,12,.35);
        overflow: hidden;
        transition: transform .6s cubic-bezier(.2,.8,.2,1);
      }
      .q-photo:hover { transform: translateY(-6px) rotate(-1deg); }
      .q-photo-emoji {
        font-size: 88px; line-height: 1;
        filter: drop-shadow(0 8px 16px rgba(0,0,0,.15));
      }
      .q-photo-tag {
        font-family: 'JetBrains Mono', monospace; font-size: 10px;
        letter-spacing: .12em; text-transform: uppercase;
        align-self: flex-end;
        background: rgba(255,255,255,.85);
        padding: 4px 10px; border-radius: 999px;
        backdrop-filter: blur(4px);
      }
      .q-photo-1 {
        top: 0; left: 0; width: 60%; height: 55%;
        background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%);
        color: #fff; transform: rotate(-2deg); z-index: 2;
      }
      .q-photo-2 {
        top: 30%; right: 0; width: 50%; height: 50%;
        background: linear-gradient(135deg, #FEF9E7 0%, #F4E4A1 100%);
        color: #8B6914; transform: rotate(3deg); z-index: 3;
      }
      .q-photo-3 {
        bottom: 0; left: 8%; width: 55%; height: 40%;
        background: linear-gradient(135deg, #C5A028 0%, #D4AF37 100%);
        color: #fff; transform: rotate(-1deg); z-index: 2;
      }
      .q-photo-frame {
        position: absolute; inset: -8px;
        border: 1px dashed rgba(197,160,40,.4);
        border-radius: 28px;
        z-index: 1; pointer-events: none;
        animation: q-frame-spin 60s linear infinite;
      }
      @keyframes q-frame-spin {
        from { transform: rotate(0); }
        to   { transform: rotate(2deg); }
      }

      .q-hero-text { font-family: Georgia, 'Times New Roman', serif; }
      .q-drop {
        font-size: clamp(18px, 1.6vw, 22px);
        line-height: 1.55; color: #1A1F1A;
        margin: 0 0 24px;
      }
      .q-drop em { font-style: italic; color: #1B5E20; }
      .q-dropcap {
        float: left;
        font-family: 'Inter', sans-serif; font-weight: 900;
        font-size: 80px; line-height: .85;
        margin: 4px 12px 0 0;
        background: linear-gradient(180deg, #C5A028 0%, #8B6914 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      .q-hero-by {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11.5px; letter-spacing: .04em;
        color: #6B7268; display: flex; align-items: center; gap: 10px;
      }
      .q-by-line { flex: 0 0 32px; height: 1px; background: #C5A028; }
      .q-hero-by strong { color: #0A1F0C; font-weight: 600; }

      @media (max-width: 900px) {
        .q-hero-grid { grid-template-columns: 1fr; gap: 40px; }
        .q-hero-photo { max-width: 480px; margin: 0 auto; }
        .q-dropcap { font-size: 60px; }
      }

      /* ── MARQUEE ── */
      .q-marquee {
        position: relative;
        background: #0A1F0C;
        color: #E8C84A;
        padding: 22px 0;
        overflow: hidden;
        margin: 64px 0 0;
        border-top: 1px solid rgba(232,200,74,.18);
        border-bottom: 1px solid rgba(232,200,74,.18);
      }
      .q-marquee-track {
        display: inline-flex;
        animation: q-marquee 40s linear infinite;
        white-space: nowrap;
      }
      .q-marquee-row {
        display: inline-flex; align-items: center; gap: 28px;
        padding: 0 28px;
        font-family: 'Inter', sans-serif; font-weight: 600;
        font-size: 22px; letter-spacing: -0.01em;
        text-transform: uppercase;
      }
      .q-marquee-row > span:not(.q-marquee-dot) { font-style: italic; }
      .q-marquee-dot { color: #7BD389; font-size: 8px; }
      @keyframes q-marquee {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      @media (prefers-reduced-motion: reduce) {
        .q-marquee-track { animation: none; }
      }

      /* ── MANIFESTE ── */
      .q-manifesto {
        max-width: 1240px; margin: 0 auto;
        padding: 100px 32px 60px;
      }
      .q-section-head { max-width: 720px; margin: 0 auto 48px; text-align: center; }
      .q-kicker {
        display: inline-block;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px; font-weight: 600;
        letter-spacing: .18em; text-transform: uppercase;
        color: #C5A028;
        padding: 4px 12px;
        border: 1px solid rgba(197,160,40,.25);
        border-radius: 999px;
        background: rgba(197,160,40,.08);
        margin-bottom: 18px;
      }
      .q-h2 {
        font-family: 'Inter', sans-serif; font-weight: 900;
        font-size: clamp(34px, 4.8vw, 64px);
        letter-spacing: -0.035em; line-height: 1.05;
        color: #0A1F0C; margin: 0;
      }
      .q-h2 em {
        font-style: italic;
        background: linear-gradient(180deg, #1B5E20, #4CAF50);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-weight: 800;
      }
      .q-h2-gold {
        background: linear-gradient(180deg, #C5A028, #8B6914);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-style: italic; font-weight: 800;
      }

      .q-promises {
        display: grid; grid-template-columns: repeat(4, 1fr);
        gap: 0;
        border-top: 1px solid rgba(10,31,12,.10);
        border-bottom: 1px solid rgba(10,31,12,.10);
      }
      .q-promise {
        padding: 40px 28px;
        border-right: 1px solid rgba(10,31,12,.10);
        transition: background .3s;
      }
      .q-promise:last-child { border-right: 0; }
      .q-promise:hover { background: rgba(255,255,255,.6); }
      .q-promise-icon {
        width: 52px; height: 52px; border-radius: 14px;
        display: grid; place-items: center; margin-bottom: 18px;
        background: linear-gradient(135deg, #FEF9E7, #F2FCF3);
        color: #1B5E20;
        border: 1px solid rgba(197,160,40,.20);
      }
      .q-promise-title {
        font-family: 'Inter', sans-serif; font-weight: 800;
        font-size: clamp(20px, 2.4vw, 28px);
        letter-spacing: -0.025em; line-height: 1.1;
        color: #0A1F0C; margin-bottom: 8px;
      }
      .q-promise-sub {
        font-family: Georgia, serif;
        font-size: 13.5px; color: #4A5450;
        line-height: 1.55;
      }
      @media (max-width: 768px) {
        .q-promises { grid-template-columns: repeat(2, 1fr); }
        .q-promise { border-right: 0; border-bottom: 1px solid rgba(10,31,12,.08); }
        .q-promise:nth-child(2n) { border-right: 0; }
      }

      /* ── TIMELINE ── */
      .q-story {
        max-width: 1240px; margin: 0 auto;
        padding: 80px 32px;
      }
      .q-timeline {
        position: relative; max-width: 920px; margin: 0 auto;
      }
      .q-timeline-line {
        position: absolute;
        left: 50%; top: 0; bottom: 0;
        width: 2px;
        background: linear-gradient(180deg, transparent, #C5A028 12%, #1B5E20 50%, #C5A028 88%, transparent);
        transform: translateX(-1px);
      }
      .q-event {
        position: relative;
        display: grid; grid-template-columns: 1fr 1fr;
        margin-bottom: 56px;
      }
      .q-event-dot {
        position: absolute; left: 50%; top: 28px;
        width: 14px; height: 14px;
        margin-left: -7px;
        border-radius: 50%;
        background: linear-gradient(135deg, #C5A028, #E8C84A);
        box-shadow: 0 0 0 4px #FAF8F3, 0 0 0 5px rgba(197,160,40,.3),
                    0 0 20px rgba(232,200,74,.5);
        z-index: 2;
      }
      .q-event-card {
        background: white; border: 1px solid rgba(10,31,12,.08);
        border-radius: 16px; padding: 24px 28px;
        box-shadow: 0 12px 32px -16px rgba(10,31,12,.12);
        max-width: 400px;
      }
      .q-event-left .q-event-card  { grid-column: 1; justify-self: end; margin-right: 40px; }
      .q-event-right .q-event-card { grid-column: 2; justify-self: start; margin-left: 40px; }

      .q-event-year {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px; font-weight: 600;
        letter-spacing: .14em; text-transform: uppercase;
        color: #C5A028; margin-bottom: 8px;
      }
      .q-event-title {
        font-family: 'Inter', sans-serif; font-weight: 800;
        font-size: 19px; letter-spacing: -0.02em;
        color: #0A1F0C; margin: 0 0 8px; line-height: 1.2;
      }
      .q-event-body {
        font-size: 13.5px; color: #4A5450; line-height: 1.6;
        font-family: Georgia, serif;
        margin: 0;
      }
      @media (max-width: 768px) {
        .q-timeline-line { left: 22px; }
        .q-event { grid-template-columns: 1fr; }
        .q-event-dot { left: 22px; }
        .q-event-left .q-event-card,
        .q-event-right .q-event-card {
          grid-column: 1; justify-self: stretch;
          margin: 0 0 0 56px;
        }
      }

      /* ── VALUES ── */
      .q-values {
        max-width: 1240px; margin: 0 auto;
        padding: 60px 32px 80px;
      }
      .q-values-grid {
        display: grid; grid-template-columns: repeat(2, 1fr);
        gap: 22px;
      }
      .q-tilt {
        transition: transform .35s cubic-bezier(.2,.8,.2,1);
        transform-style: preserve-3d;
        will-change: transform;
      }
      .q-value {
        background: white;
        border-radius: 22px;
        padding: 32px 28px;
        border: 1px solid rgba(10,31,12,.06);
        box-shadow: 0 18px 50px -28px rgba(10,31,12,.18);
      }
      .q-value-icon {
        width: 52px; height: 52px; border-radius: 14px;
        display: grid; place-items: center; margin-bottom: 18px;
      }
      .q-value-tag {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10.5px; font-weight: 700;
        letter-spacing: .14em; text-transform: uppercase;
        margin: 0 0 10px;
      }
      .q-value-title {
        font-family: 'Inter', sans-serif; font-weight: 800;
        font-size: 26px; letter-spacing: -0.025em;
        color: #0A1F0C; margin: 0 0 10px; line-height: 1.15;
      }
      .q-value-body {
        font-family: Georgia, serif;
        font-size: 14.5px; line-height: 1.65;
        color: #4A5450; margin: 0;
      }
      @media (max-width: 768px) {
        .q-values-grid { grid-template-columns: 1fr; }
        .q-tilt { transform: none !important; }
      }

      /* ── QUOTE ── */
      .q-quote-section {
        max-width: 920px; margin: 60px auto;
        padding: 0 32px;
      }
      .q-quote {
        position: relative;
        background: #0A1F0C; color: white;
        padding: 80px 60px 60px;
        border-radius: 26px;
        text-align: center;
        overflow: hidden;
      }
      .q-quote::before {
        content: "";
        position: absolute; inset: 0;
        background:
          radial-gradient(60% 50% at 80% 20%, rgba(197,160,40,.18), transparent 60%),
          radial-gradient(50% 50% at 20% 80%, rgba(76,175,80,.12), transparent 60%);
        pointer-events: none;
      }
      .q-quote-icon {
        position: absolute; top: 32px; left: 32px;
        width: 36px; height: 36px;
        color: rgba(232,200,74,.35);
      }
      .q-quote-text {
        font-family: 'Inter', sans-serif; font-weight: 500;
        font-size: clamp(20px, 2.4vw, 30px);
        line-height: 1.4;
        margin: 0 auto 36px; max-width: 700px;
        position: relative; letter-spacing: -0.015em;
      }
      .q-quote-text em {
        font-style: italic; font-weight: 600;
        color: #E8C84A;
      }
      .q-quote-author {
        display: inline-flex; align-items: center; gap: 14px;
        padding-top: 24px;
        border-top: 1px solid rgba(255,255,255,.12);
        position: relative;
      }
      .q-quote-avatar {
        width: 44px; height: 44px; border-radius: 50%;
        background: linear-gradient(135deg, #C5A028, #E8C84A);
        color: #1a1305; font-weight: 800; font-size: 14px;
        display: grid; place-items: center;
      }
      .q-quote-name {
        font-weight: 700; font-size: 14.5px; color: #fff;
        text-align: left;
      }
      .q-quote-role {
        font-size: 12px; color: rgba(255,255,255,.65);
        font-family: 'JetBrains Mono', monospace; letter-spacing: .04em;
        text-align: left; margin-top: 2px;
      }

      /* ── CTA ── */
      .q-cta-section {
        max-width: 1240px; margin: 60px auto 100px;
        padding: 0 32px;
      }
      .q-cta {
        background: linear-gradient(135deg, #FEF9E7 0%, #FAF8F3 60%);
        border: 1px solid rgba(197,160,40,.25);
        border-radius: 28px;
        padding: 80px 60px;
        text-align: center;
        position: relative; overflow: hidden;
      }
      .q-cta::before, .q-cta::after {
        content: ""; position: absolute;
        border-radius: 50%; pointer-events: none;
      }
      .q-cta::before {
        top: -80px; right: -60px;
        width: 240px; height: 240px;
        background: radial-gradient(circle, rgba(197,160,40,.18), transparent 70%);
      }
      .q-cta::after {
        bottom: -100px; left: -80px;
        width: 280px; height: 280px;
        background: radial-gradient(circle, rgba(76,175,80,.12), transparent 70%);
      }
      .q-cta-title {
        position: relative;
        font-family: 'Inter', sans-serif; font-weight: 900;
        font-size: clamp(32px, 4.4vw, 56px);
        line-height: 1.05; letter-spacing: -0.04em;
        color: #0A1F0C; margin: 0 0 18px;
      }
      .q-cta-title em {
        font-style: italic;
        background: linear-gradient(180deg, #C5A028, #8B6914);
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      .q-cta-sub {
        position: relative;
        font-family: Georgia, serif;
        font-size: 17px; line-height: 1.6; color: #4A5450;
        max-width: 540px; margin: 0 auto 36px;
      }
      .q-cta-row {
        position: relative;
        display: flex; flex-wrap: wrap; gap: 14px; justify-content: center;
      }
      .q-btn-primary {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 14px 26px; border-radius: 999px;
        background: linear-gradient(135deg, #1B5E20, #2E7D32);
        color: #fff; font-weight: 700; font-size: 14px;
        border: 0; cursor: pointer;
        box-shadow: 0 18px 40px -12px rgba(46,125,50,.55);
        transition: all .25s cubic-bezier(.2,.8,.2,1);
      }
      .q-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 22px 48px -10px rgba(46,125,50,.7);
      }
      .q-btn-ghost {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 14px 26px; border-radius: 999px;
        background: white;
        color: #1B5E20; font-weight: 600; font-size: 14px;
        text-decoration: none;
        border: 1px solid rgba(27,94,32,.20);
        transition: all .25s;
      }
      .q-btn-ghost:hover {
        border-color: rgba(27,94,32,.45);
        background: #F2FCF3;
      }

      /* ── Reveal commun ── */
      [data-reveal] {
        opacity: 0; transform: translateY(20px);
        transition: opacity .9s cubic-bezier(.2,.8,.2,1) var(--d, 0s),
                    transform .9s cubic-bezier(.2,.8,.2,1) var(--d, 0s);
      }
      [data-reveal].q-revealed { opacity: 1; transform: none; }

      .q-event-left  { transform: translateY(20px) translateX(-30px); }
      .q-event-right { transform: translateY(20px) translateX(30px); }
      .q-event.q-revealed { transform: none; }
      @media (max-width: 768px) {
        .q-event-left, .q-event-right { transform: translateY(20px); }
      }

      @media (prefers-reduced-motion: reduce) {
        .q-clip > span, .q-clip > em {
          animation: none;
          clip-path: inset(0 0 0 0);
        }
        .q-photo-frame { animation: none; }
        [data-reveal] { opacity: 1; transform: none; transition: none; }
        .q-tilt { transform: none !important; }
      }
    `}</style>
  );
}
