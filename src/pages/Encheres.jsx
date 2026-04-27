import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import {
  Gavel, Clock, TrendingUp, Shield, ArrowRight, Sparkles,
  Trophy, Zap, Eye, Users, Flame, ArrowDown, Lock, CheckCircle2,
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
            e.target.classList.add("e-revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ─────────────────────────────────────────────────────────
// Live countdown
// ─────────────────────────────────────────────────────────
function useCountdown(targetMs) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, targetMs - now);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const isUrgent = diff < 60_000;
  const isFinishing = diff < 5_000;
  return { hours, mins, secs, diff, isUrgent, isFinishing };
}

// ─────────────────────────────────────────────────────────
// Stage centrale : enchère live simulée (chrono + bid live)
// ─────────────────────────────────────────────────────────
function AuctionStage() {
  const targetRef = useRef(Date.now() + 8 * 60_000 + 12_000);
  const { hours, mins, secs, isUrgent, isFinishing } = useCountdown(targetRef.current);

  const [currentBid, setCurrentBid] = useState(485);
  const [bids, setBids] = useState(28);
  const [watchers, setWatchers] = useState(142);
  const [bidPulse, setBidPulse] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.55) {
        setCurrentBid((b) => b + Math.floor(Math.random() * 20) + 5);
        setBids((n) => n + 1);
        setBidPulse(true);
        setTimeout(() => setBidPulse(false), 700);
      }
      setWatchers((w) => Math.max(80, w + Math.floor(Math.random() * 6) - 2));
    }, 4000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="e-stage-wrap" aria-hidden>
      <div className="e-stage">
        <div className="e-stage-chrome">
          <span className="e-live"><span className="e-live-dot" />live · vente aux enchères</span>
          <span>lot · 042</span>
        </div>

        <div className={`e-glow ${isUrgent ? "e-glow-urgent" : ""}`} aria-hidden />

        <div className="e-stage-body">
          <div className="e-product">
            <div className="e-product-tag">⛳ ICONIC PUTTER</div>
            <div className="e-product-name">Scotty Cameron</div>
            <div className="e-product-sub">Newport 2 · 34" · 2024</div>
          </div>

          <div className={`e-timer ${isUrgent ? "e-timer-urgent" : ""} ${isFinishing ? "e-timer-finishing" : ""}`}>
            <div className="e-timer-label">se termine dans</div>
            <div className="e-timer-grid">
              <div className="e-timer-block">
                <div className="e-timer-num">{String(hours).padStart(2, "0")}</div>
                <div className="e-timer-unit">h</div>
              </div>
              <div className="e-timer-sep">:</div>
              <div className="e-timer-block">
                <div className="e-timer-num">{String(mins).padStart(2, "0")}</div>
                <div className="e-timer-unit">min</div>
              </div>
              <div className="e-timer-sep">:</div>
              <div className="e-timer-block e-timer-block-secs">
                <div className="e-timer-num">{String(secs).padStart(2, "0")}</div>
                <div className="e-timer-unit">sec</div>
              </div>
            </div>
          </div>

          <div className="e-bid">
            <div className="e-bid-label">enchère actuelle</div>
            <div className={`e-bid-amount ${bidPulse ? "e-bid-pulse" : ""}`}>
              {currentBid}<span className="e-bid-currency">&nbsp;€</span>
            </div>
            {bidPulse && <div className="e-bid-flash">+ nouvelle enchère</div>}
          </div>

          <div className="e-stats">
            <div>
              <Flame className="w-3.5 h-3.5" style={{ color: "#E8C84A" }} />
              <span><strong>{bids}</strong> enchères</span>
            </div>
            <div>
              <Eye className="w-3.5 h-3.5" style={{ color: "#7BD389" }} />
              <span><strong>{watchers}</strong> en train de regarder</span>
            </div>
          </div>
        </div>

        <div className="e-stage-footer">
          <Lock className="w-3 h-3" /> Simulation · données fictives
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Page Enchères
// ─────────────────────────────────────────────────────────
export default function Encheres() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useReveal();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));
    window.scrollTo(0, 0);
  }, []);

  const scrollToHow = () => {
    document.getElementById("e-how")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Style />
      <div className="min-h-screen bg-[#FAFAFA]">

        {/* ════════ HERO IMMERSIF ════════ */}
        <section className="e-hero">
          <div className="e-hero-bg" aria-hidden />
          <div className="e-hero-grid" aria-hidden />
          <div className="e-orbits" aria-hidden>
            <div className="e-o e-o1" /><div className="e-o e-o2" /><div className="e-o e-o3" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-24">
            <div className="grid md:grid-cols-[1.05fr_1fr] gap-12 items-center">
              {/* LEFT — copy */}
              <div>
                <span className="e-pill">
                  <Gavel className="w-3.5 h-3.5" />
                  <span>Enchères SwingMarketGolf</span>
                </span>

                <h1 className="e-h1">
                  <span className="e-w" style={{ "--i": 0 }}><span>Le&nbsp;</span></span>
                  <span className="e-w" style={{ "--i": 1 }}><span>marteau&nbsp;</span></span>
                  <span className="e-w e-grad-gold" style={{ "--i": 2 }}><span>tombe.</span></span>
                  <br />
                  <span className="e-w" style={{ "--i": 3 }}><span>Le&nbsp;</span></span>
                  <span className="e-w e-grad-lime" style={{ "--i": 4 }}><span>meilleur&nbsp;</span></span>
                  <span className="e-w e-grad-lime" style={{ "--i": 5 }}><span>prix&nbsp;</span></span>
                  <span className="e-w" style={{ "--i": 6 }}><span>gagne.</span></span>
                </h1>

                <p className="e-lede">
                  Mettez vos clubs aux enchères et laissez la communauté
                  faire monter le prix. <em>Adrénaline garantie</em> —
                  côté vendeur comme côté acheteur.
                </p>

                <div className="e-cta-row">
                  <Link to={isLoggedIn ? createPageUrl("CreateListing") : createPageUrl("Login")} className="e-cta-primary group">
                    <Gavel className="w-4 h-4" />
                    Mettre un club aux enchères
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link to={createPageUrl("Marketplace") + "?sale_type=auction"} className="e-cta-ghost">
                    Voir les enchères en cours
                  </Link>
                </div>

                <div className="e-trust">
                  {[
                    { Icon: Shield, label: "Paiement sécurisé Stripe" },
                    { Icon: Trophy, label: "+ de 30 % vs prix fixe" },
                    { Icon: Zap,    label: "Finalisation en 7 jours" },
                  ].map(({ Icon, label }) => (
                    <div key={label}>
                      <Icon className="w-3.5 h-3.5" style={{ color: "#7BD389" }} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — stage live (chrono + bid) */}
              <div>
                <AuctionStage />
              </div>
            </div>

            <button onClick={scrollToHow} className="e-scroll">
              Découvrir le fonctionnement
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* ════════ POURQUOI LES ENCHÈRES ════════ */}
        <section className="max-w-6xl mx-auto px-4 pt-24 pb-12">
          <div className="text-center mb-14" data-reveal>
            <span className="e-kicker">3 raisons</span>
            <h2 className="e-h2">Pourquoi vendre <em>aux enchères</em> ?</h2>
            <p className="e-sub">
              La compétition entre acheteurs fait monter votre prix de
              vente. Sans effort. Sans bagarre.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                Icon: TrendingUp,
                tag: "Prix optimisé",
                title: "Gagnez +30 % en moyenne",
                body: "Les enchères dépassent quasi systématiquement le prix fixe. Plus l'objet est rare, plus l'écart se creuse.",
                color: "#1B5E20", bg: "#F7FEF7",
              },
              {
                Icon: Zap,
                tag: "Vente rapide",
                title: "Finalisé en 3 à 7 jours",
                body: "Vous fixez la durée de l'enchère. Une fois le marteau tombé, paiement et expédition s'enchaînent automatiquement.",
                color: "#C5A028", bg: "#FEF9E7",
              },
              {
                Icon: Users,
                tag: "Communauté",
                title: "Visible par milliers",
                body: "Vos enchères sont mises en avant sur toute la marketplace. Plus d'yeux, plus de bids, meilleur prix final.",
                color: "#1B5E20", bg: "#F7FEF7",
              },
            ].map((c) => (
              <article key={c.title} data-reveal className="e-card group">
                <div className="e-card-icon" style={{ background: c.bg, color: c.color }}>
                  <c.Icon className="w-5 h-5" />
                </div>
                <p className="e-card-tag" style={{ color: c.color }}>{c.tag}</p>
                <h3 className="e-card-title">{c.title}</h3>
                <p className="e-card-body">{c.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ════════ COMMENT ÇA MARCHE ════════ */}
        <section id="e-how" className="max-w-6xl mx-auto px-4 py-20 scroll-mt-20">
          <div className="text-center mb-14" data-reveal>
            <span className="e-kicker">Comment ça marche</span>
            <h2 className="e-h2">4 étapes, zéro friction.</h2>
          </div>

          <div className="e-timeline">
            <div className="e-timeline-line" aria-hidden />
            {[
              { n: "01", Icon: Gavel,  title: "Créez votre enchère",     desc: "Photos, prix de départ, durée (3 / 5 / 7 jours)." },
              { n: "02", Icon: Eye,    title: "La communauté regarde",   desc: "Vos cibles vendeurs/acheteurs sont notifiées en live." },
              { n: "03", Icon: Flame,  title: "Les enchères montent",    desc: "Chaque bid prolonge la fin de 60s — anti-snipping intégré." },
              { n: "04", Icon: Trophy, title: "Le marteau tombe",        desc: "Paiement Stripe sécurisé · livraison sous 48h en moyenne." },
            ].map((s, i) => (
              <div key={s.n} className="e-step" data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="e-step-icon"><s.Icon className="w-5 h-5" /></div>
                <span className="e-step-num">{s.n}</span>
                <h4 className="e-step-title">{s.title}</h4>
                <p className="e-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════ TÉMOIGNAGE ════════ */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div data-reveal className="e-quote">
            <div className="e-quote-mark">"</div>
            <p className="e-quote-text">
              J'ai mis mon Driver TaylorMade Stealth 2 aux enchères à <strong>299&nbsp;€</strong>.
              <br />Il est parti 7 jours plus tard à <strong style={{ color: "#C5A028" }}>489&nbsp;€</strong>,
              après <strong>34 enchères</strong>.
            </p>
            <div className="e-quote-author">
              <div className="e-quote-avatar">AD</div>
              <div>
                <div className="e-quote-name">Alexandre D.</div>
                <div className="e-quote-meta">Membre depuis 2025 · Particulier</div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════ CTA FINAL ════════ */}
        <section className="max-w-4xl mx-auto px-4 pt-12 pb-32 md:pb-40 text-center" data-reveal>
          <div className="e-cta-card">
            <span className="e-kicker e-kicker-gold">Prêt&nbsp;?</span>
            <h2 className="e-cta-title">Mettez votre matériel<br/>aux enchères en 5 minutes.</h2>
            <p className="e-cta-sub">
              Création gratuite. Vous touchez 100&nbsp;% du prix final.
              Aucun engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
              <Link to={isLoggedIn ? createPageUrl("CreateListing") : createPageUrl("Login")}>
                <button
                  className="inline-flex items-center justify-center gap-2 font-semibold rounded-full px-7 py-3.5 text-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background: "#C5A028", color: "#1a1305",
                    boxShadow: "0 14px 32px -10px rgba(197,160,40,0.55)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#D4AF37"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#C5A028"; }}
                >
                  <Gavel className="w-4 h-4" />
                  Lancer mon enchère
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to={createPageUrl("Marketplace") + "?sale_type=auction"}>
                <button
                  className="inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-3.5 text-sm transition-all border"
                  style={{
                    borderColor: "rgba(255,255,255,0.25)",
                    color: "#FFFFFF",
                    background: "rgba(255,255,255,0.04)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                >
                  Voir les enchères live
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────
function Style() {
  return (
    <style>{`
      /* ── Hero ── */
      .e-hero {
        position: relative;
        background: linear-gradient(180deg, #0A1F0C 0%, #061309 100%);
        color: #E5E7EB;
        overflow: hidden;
        isolation: isolate;
      }
      .e-hero-bg {
        position: absolute; inset: -20% -10% auto -10%; height: 70%;
        z-index: 0; pointer-events: none; filter: blur(70px); opacity: .55;
        background:
          radial-gradient(40% 50% at 30% 50%, rgba(197,160,40,.32), transparent 60%),
          radial-gradient(40% 50% at 75% 30%, rgba(76,175,80,.26), transparent 60%);
        animation: e-drift 22s ease-in-out infinite;
      }
      @keyframes e-drift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(2%,1.5%)} }
      .e-hero-grid {
        position: absolute; inset: 0; pointer-events: none; z-index: 0;
        background-image:
          linear-gradient(rgba(197,160,40,.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(197,160,40,.06) 1px, transparent 1px);
        background-size: 56px 56px;
        mask-image: radial-gradient(ellipse 80% 80% at 50% 30%, black 30%, transparent 90%);
        -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 30%, black 30%, transparent 90%);
      }
      .e-orbits { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
      .e-o {
        position: absolute; left: 60%; top: 60%;
        border-radius: 50%; transform: translate(-50%,-50%);
        opacity: 0; animation: e-orbits-in 1.6s .3s ease-out forwards;
      }
      @keyframes e-orbits-in { to { opacity: 1; } }
      .e-o1 { width: 480px;  height: 480px;  border: 1px dashed rgba(197,160,40,.14); animation: e-orbits-in 1.6s .3s ease-out forwards, e-spin 60s linear infinite; }
      .e-o2 { width: 720px;  height: 720px;  border: 1px solid  rgba(255,255,255,.05); animation: e-orbits-in 1.6s .3s ease-out forwards, e-spin-rev 90s linear infinite; }
      .e-o3 { width: 1000px; height: 1000px; border: 1px dashed rgba(123,211,137,.07); animation: e-orbits-in 1.6s .3s ease-out forwards, e-spin 120s linear infinite; }
      @keyframes e-spin     { to { transform: translate(-50%,-50%) rotate(360deg); } }
      @keyframes e-spin-rev { to { transform: translate(-50%,-50%) rotate(-360deg); } }

      .e-pill {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 6px 14px;
        background: rgba(197,160,40,.10);
        border: 1px solid rgba(197,160,40,.30);
        border-radius: 999px;
        font-size: 11.5px; color: #E8C84A; font-weight: 600;
        letter-spacing: .04em;
        backdrop-filter: blur(8px);
        opacity: 0; transform: translateY(10px);
        animation: e-rise .9s .35s cubic-bezier(.2,.8,.2,1) forwards;
        margin-bottom: 24px;
      }

      .e-h1 {
        font-family: 'Inter', sans-serif; font-weight: 800;
        font-size: clamp(40px, 5.6vw, 76px);
        letter-spacing: -0.035em; line-height: 1.08;
        color: #F5F7F4; margin: 0 0 24px;
      }
      .e-w {
        display: inline-block; overflow: hidden; vertical-align: top;
        padding-bottom: .12em; padding-right: .04em; margin-bottom: -.08em;
      }
      .e-w > span {
        display: inline-block; transform: translateY(108%);
        animation: e-word .9s cubic-bezier(.2,.8,.2,1) forwards;
        animation-delay: calc(.55s + var(--i, 0) * .08s);
        padding-right: .08em;
      }
      @keyframes e-word { to { transform: translateY(0); } }
      .e-grad-gold > span {
        background: linear-gradient(180deg, #E8C84A, #C5A028);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-style: italic; font-weight: 700;
      }
      .e-grad-lime > span {
        background: linear-gradient(180deg, #FFFFFF, #7BD389);
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }

      .e-lede {
        font-size: clamp(15px, 1.2vw, 17px); line-height: 1.65;
        color: #B7C2BB; max-width: 540px; margin: 0 0 28px;
        opacity: 0; animation: e-rise .9s 1.05s cubic-bezier(.2,.8,.2,1) forwards;
      }
      .e-lede em { font-style: italic; color: #E8C84A; font-weight: 600; }
      @keyframes e-rise { to { opacity: 1; transform: translateY(0); } }

      .e-cta-row {
        display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
        opacity: 0; animation: e-rise .9s 1.2s cubic-bezier(.2,.8,.2,1) forwards;
        margin-bottom: 32px;
      }
      .e-cta-primary {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 13px 22px; border-radius: 999px;
        background: linear-gradient(135deg, #C5A028, #D4AF37);
        color: #1a1305; font-weight: 700; font-size: 14px;
        text-decoration: none;
        box-shadow: 0 18px 40px -12px rgba(197,160,40,0.55);
        transition: all .25s cubic-bezier(.2,.8,.2,1);
      }
      .e-cta-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 22px 48px -10px rgba(197,160,40,0.7);
      }
      .e-cta-ghost {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 13px; color: #B7C2BB; text-decoration: none;
        padding: 8px 4px; border-bottom: 1px solid rgba(183,194,187,.2);
        transition: color .2s, border-color .2s;
      }
      .e-cta-ghost:hover { color: #E8C84A; border-color: #E8C84A; }

      .e-trust {
        display: flex; gap: 18px; flex-wrap: wrap; padding-top: 14px;
        border-top: 1px solid rgba(255,255,255,.06);
        opacity: 0; animation: e-rise .9s 1.35s cubic-bezier(.2,.8,.2,1) forwards;
      }
      .e-trust > div {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 12px; color: #B7C2BB;
      }

      /* ═══════ Stage live ═══════ */
      .e-stage-wrap {
        opacity: 0; transform: translateY(20px) scale(.98);
        animation: e-stage-in 1.1s .8s cubic-bezier(.2,.8,.2,1) forwards;
      }
      @keyframes e-stage-in { to { opacity: 1; transform: translateY(0) scale(1); } }
      .e-stage {
        position: relative; width: 100%; max-width: 460px; margin: 0 auto;
        border-radius: 24px; overflow: hidden;
        background:
          radial-gradient(80% 60% at 30% 20%, rgba(232,200,74,.10), transparent 60%),
          radial-gradient(80% 60% at 100% 100%, rgba(27,94,32,.4), transparent 60%),
          linear-gradient(180deg, #0F1418, #06080A);
        border: 1px solid rgba(232,200,74,.20);
        box-shadow: 0 40px 80px -30px rgba(0,0,0,.7),
                    inset 0 1px 0 rgba(255,255,255,.04);
      }
      .e-stage-chrome {
        display: flex; justify-content: space-between; align-items: center;
        padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.05);
        font-family: 'JetBrains Mono', monospace; font-size: 10px;
        letter-spacing: .14em; text-transform: uppercase; color: #5C6770;
        position: relative; z-index: 2;
      }
      .e-live { display: inline-flex; align-items: center; gap: 6px; color: #FF6B5C; }
      .e-live-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #FF6B5C; box-shadow: 0 0 8px #FF6B5C;
        animation: e-live-pulse 1.6s infinite;
      }
      @keyframes e-live-pulse {
        0%,100% { box-shadow: 0 0 0 0 rgba(255,107,92,.7); }
        70%     { box-shadow: 0 0 0 12px rgba(255,107,92,0); }
      }

      .e-glow {
        position: absolute; left: 50%; top: 56%;
        width: 420px; height: 420px; border-radius: 50%;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle, rgba(232,200,74,.18), transparent 65%);
        filter: blur(40px); pointer-events: none;
        animation: e-glow-pulse 4s ease-in-out infinite;
      }
      @keyframes e-glow-pulse {
        0%,100% { opacity: .6; transform: translate(-50%,-50%) scale(1); }
        50%     { opacity: 1;  transform: translate(-50%,-50%) scale(1.08); }
      }
      .e-glow-urgent {
        background: radial-gradient(circle, rgba(255,107,92,.22), transparent 65%);
        animation: e-glow-pulse-urgent 1s ease-in-out infinite;
      }
      @keyframes e-glow-pulse-urgent {
        0%,100% { opacity: .7;  transform: translate(-50%,-50%) scale(1); }
        50%     { opacity: 1;   transform: translate(-50%,-50%) scale(1.12); }
      }

      .e-stage-body {
        position: relative; z-index: 1;
        padding: 28px 22px 24px;
        display: flex; flex-direction: column; gap: 20px; align-items: center;
      }

      .e-product { text-align: center; }
      .e-product-tag {
        font-family: 'JetBrains Mono', monospace; font-size: 9.5px;
        letter-spacing: .18em; color: #E8C84A;
        background: rgba(232,200,74,.10);
        padding: 3px 10px; border-radius: 999px;
        display: inline-block; margin-bottom: 10px;
      }
      .e-product-name {
        font-family: 'Inter', sans-serif; font-weight: 700;
        font-size: 24px; letter-spacing: -0.02em; color: #FFFFFF;
        line-height: 1.1; margin-bottom: 4px;
      }
      .e-product-sub {
        font-size: 12.5px; color: #8A929A;
        font-family: 'JetBrains Mono', monospace; letter-spacing: .04em;
      }

      .e-timer {
        text-align: center;
        padding: 18px 24px;
        border: 1px solid rgba(232,200,74,.20);
        border-radius: 14px;
        background: rgba(0,0,0,.25);
        backdrop-filter: blur(8px);
        transition: all .3s;
      }
      .e-timer-label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 9.5px; letter-spacing: .22em; text-transform: uppercase;
        color: #8A929A; margin-bottom: 8px;
      }
      .e-timer-grid {
        display: inline-flex; align-items: baseline; gap: 8px;
      }
      .e-timer-block {
        display: inline-flex; align-items: baseline; gap: 4px;
      }
      .e-timer-num {
        font-family: 'Inter', sans-serif; font-weight: 800;
        font-size: 42px; letter-spacing: -0.045em; line-height: 1;
        background: linear-gradient(180deg, #FFFFFF 0%, #E8C84A 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-variant-numeric: tabular-nums;
        filter: drop-shadow(0 4px 12px rgba(232,200,74,.25));
      }
      .e-timer-unit {
        font-family: 'JetBrains Mono', monospace; font-size: 11px;
        color: #8A929A; letter-spacing: .04em; text-transform: lowercase;
      }
      .e-timer-sep {
        font-family: 'Inter', sans-serif; font-weight: 800; font-size: 32px;
        color: #4A5460; line-height: 1; transform: translateY(-6px);
        animation: e-blink 1s steps(2) infinite;
      }
      @keyframes e-blink { 0%, 49.99% { opacity: 1; } 50%, 100% { opacity: .25; } }

      .e-timer-block-secs .e-timer-num {
        animation: e-tick 1s ease-out infinite;
      }
      @keyframes e-tick {
        0%   { transform: scale(1.06); filter: drop-shadow(0 6px 18px rgba(232,200,74,.4)); }
        100% { transform: scale(1);    filter: drop-shadow(0 4px 12px rgba(232,200,74,.25)); }
      }

      .e-timer-urgent {
        border-color: rgba(255,107,92,.35);
        animation: e-shake-urgent 1s ease-in-out infinite;
      }
      .e-timer-urgent .e-timer-num {
        background: linear-gradient(180deg, #FFFFFF 0%, #FF6B5C 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        filter: drop-shadow(0 4px 12px rgba(255,107,92,.4));
      }
      .e-timer-urgent .e-timer-label { color: #FF6B5C; }
      @keyframes e-shake-urgent {
        0%,100% { transform: translateX(0); }
        25%     { transform: translateX(-1px); }
        75%     { transform: translateX(1px); }
      }
      .e-timer-finishing { animation: e-pop 0.5s ease-out infinite; }
      @keyframes e-pop {
        0%,100% { transform: scale(1); }
        50%     { transform: scale(1.04); }
      }

      .e-bid {
        text-align: center;
        padding: 16px 20px;
        background: linear-gradient(180deg, rgba(123,211,137,.05), rgba(123,211,137,0));
        border-top: 1px solid rgba(255,255,255,.05);
        border-bottom: 1px solid rgba(255,255,255,.05);
        width: calc(100% + 44px); margin: 0 -22px;
        position: relative;
      }
      .e-bid-label {
        font-family: 'JetBrains Mono', monospace; font-size: 9.5px;
        letter-spacing: .22em; text-transform: uppercase;
        color: #5C6770; margin-bottom: 4px;
      }
      .e-bid-amount {
        font-family: 'Inter', sans-serif; font-weight: 800;
        font-size: 56px; letter-spacing: -0.045em; line-height: 1;
        color: #7BD389;
        font-variant-numeric: tabular-nums;
        transition: transform .2s;
      }
      .e-bid-currency { font-size: 28px; font-weight: 600; color: #7BD389; opacity: .7; }
      .e-bid-pulse { animation: e-bid-bump .7s cubic-bezier(.34,1.56,.64,1); }
      @keyframes e-bid-bump {
        0%   { transform: scale(1); }
        40%  { transform: scale(1.08); filter: drop-shadow(0 0 20px rgba(123,211,137,.6)); }
        100% { transform: scale(1); }
      }
      .e-bid-flash {
        font-family: 'JetBrains Mono', monospace; font-size: 10px;
        color: #7BD389; margin-top: 4px; letter-spacing: .12em;
        text-transform: uppercase; animation: e-fade-out 1.5s forwards;
      }
      @keyframes e-fade-out {
        0%   { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-6px); }
      }

      .e-stats {
        display: flex; gap: 20px; flex-wrap: wrap; justify-content: center;
      }
      .e-stats > div {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 12px; color: #B7C2BB;
        font-variant-numeric: tabular-nums;
      }
      .e-stats strong { color: #FFFFFF; font-weight: 700; }

      .e-stage-footer {
        display: flex; align-items: center; gap: 6px;
        padding: 10px 16px; border-top: 1px solid rgba(255,255,255,.05);
        font-size: 10.5px; color: #5C6770;
      }

      .e-scroll {
        margin: 56px auto 0; display: flex; align-items: center; gap: 6px;
        padding: 8px 16px; background: rgba(255,255,255,.04);
        border: 1px solid rgba(232,200,74,.20); border-radius: 999px;
        color: #B7C2BB; font-size: 12px; cursor: pointer;
        animation: e-bob 2.4s ease-in-out infinite;
        margin-left: auto; margin-right: auto;
      }
      .e-scroll:hover { color: #E8C84A; border-color: rgba(232,200,74,.4); }
      @keyframes e-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(4px); } }

      [data-reveal] {
        opacity: 0; transform: translateY(20px);
        transition: opacity .8s cubic-bezier(.2,.8,.2,1), transform .8s cubic-bezier(.2,.8,.2,1);
      }
      [data-reveal].e-revealed { opacity: 1; transform: none; }

      .e-kicker {
        display: inline-block;
        font-family: 'JetBrains Mono', monospace; font-size: 11px;
        font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
        color: #C5A028; background: #FEF9E7;
        border: 1px solid rgba(197,160,40,.20);
        padding: 5px 12px; border-radius: 999px; margin-bottom: 14px;
      }
      .e-kicker-gold {
        color: #E8C84A !important;
        background: rgba(232,200,74,.15) !important;
        border-color: rgba(232,200,74,.30) !important;
      }
      .e-h2 {
        font-family: 'Inter', sans-serif; font-weight: 800;
        font-size: clamp(28px, 3.4vw, 44px);
        letter-spacing: -0.025em; line-height: 1.1;
        color: #0A1F0C; margin: 0;
      }
      .e-h2 em {
        font-style: italic;
        background: linear-gradient(180deg, #C5A028, #8B6914);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-weight: 700;
      }
      .e-sub {
        font-size: 15px; color: #6B7280; max-width: 640px;
        margin: 14px auto 0; line-height: 1.6;
      }

      .e-card {
        background: white; border: 1px solid #F1F5F9; border-radius: 18px;
        padding: 24px; transition: all .3s cubic-bezier(.2,.8,.2,1);
      }
      .e-card:hover {
        transform: translateY(-3px);
        border-color: rgba(197,160,40,.30);
        box-shadow: 0 12px 28px -8px rgba(15,23,42,.08);
      }
      .e-card-icon {
        width: 44px; height: 44px; border-radius: 12px;
        display: grid; place-items: center; margin-bottom: 16px;
        transition: transform .25s;
      }
      .e-card:hover .e-card-icon { transform: scale(1.08); }
      .e-card-tag {
        font-family: 'JetBrains Mono', monospace; font-size: 10.5px;
        font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
        margin: 0 0 8px;
      }
      .e-card-title {
        font-weight: 700; font-size: 18px; letter-spacing: -0.02em;
        color: #0A1F0C; margin: 0 0 8px; line-height: 1.25;
      }
      .e-card-body {
        font-size: 13.5px; color: #6B7280; line-height: 1.55; margin: 0;
      }

      .e-timeline {
        position: relative; display: grid;
        grid-template-columns: repeat(4, 1fr); gap: 24px;
      }
      .e-timeline-line {
        position: absolute; left: 7%; right: 7%; top: 28px; height: 2px;
        background: linear-gradient(90deg, transparent, rgba(27,94,32,.3), rgba(197,160,40,.5), transparent);
      }
      .e-step {
        position: relative; text-align: center;
        background: white; padding: 20px 16px 22px;
        border-radius: 18px; border: 1px solid #F1F5F9;
        transition: all .3s cubic-bezier(.2,.8,.2,1); z-index: 1;
      }
      .e-step:hover {
        border-color: rgba(197,160,40,.30);
        transform: translateY(-3px);
        box-shadow: 0 12px 28px -8px rgba(15,23,42,.08);
      }
      .e-step-icon {
        width: 56px; height: 56px; border-radius: 16px;
        background: linear-gradient(135deg, #C5A028, #D4AF37);
        color: #1a1305; display: grid; place-items: center;
        margin: 0 auto 12px;
        box-shadow: 0 8px 20px -8px rgba(197,160,40,.5);
      }
      .e-step-num {
        display: inline-block; font-family: 'JetBrains Mono', monospace;
        font-size: 10.5px; font-weight: 600;
        color: #1B5E20; background: #F7FEF7;
        padding: 2px 8px; border-radius: 4px;
        letter-spacing: .12em; margin-bottom: 8px;
      }
      .e-step-title {
        font-weight: 700; font-size: 15px;
        color: #0A1F0C; margin: 0 0 4px; letter-spacing: -0.01em;
      }
      .e-step-desc { font-size: 12.5px; color: #6B7280; margin: 0; line-height: 1.5; }

      @media (max-width: 768px) {
        .e-timeline { grid-template-columns: 1fr; }
        .e-timeline-line { display: none; }
      }

      .e-quote {
        position: relative; max-width: 740px; margin: 0 auto;
        background: white; border: 1px solid #F1F5F9; border-radius: 22px;
        padding: 36px 36px 30px; text-align: center;
        box-shadow: 0 12px 32px -16px rgba(15,23,42,.10);
      }
      .e-quote-mark {
        position: absolute; top: 0; left: 24px;
        font-family: Georgia, serif; font-size: 110px; line-height: 1;
        color: #C5A028; opacity: .15;
      }
      .e-quote-text {
        font-size: clamp(17px, 1.8vw, 22px); line-height: 1.55;
        color: #0A1F0C; font-weight: 500; margin: 0 0 24px;
        letter-spacing: -0.01em; position: relative;
      }
      .e-quote-author {
        display: inline-flex; align-items: center; gap: 10px;
        padding-top: 16px; border-top: 1px solid #F1F5F9;
      }
      .e-quote-avatar {
        width: 38px; height: 38px; border-radius: 50%;
        background: linear-gradient(135deg, #1B5E20, #4CAF50);
        color: #fff; font-weight: 700; font-size: 13px;
        display: grid; place-items: center;
      }
      .e-quote-name { font-weight: 700; font-size: 13.5px; color: #0A1F0C; text-align: left; }
      .e-quote-meta { font-size: 11.5px; color: #6B7280; text-align: left; }

      .e-cta-card {
        position: relative; overflow: hidden;
        border-radius: 22px; padding: 40px 32px;
        background:
          radial-gradient(80% 60% at 100% 0%, rgba(232,200,74,0.30), transparent 55%),
          radial-gradient(80% 60% at 0% 100%, rgba(76,175,80,0.18), transparent 55%),
          linear-gradient(180deg, #0A1F0C 0%, #143818 100%);
        border: 1px solid rgba(232,200,74,0.22);
        box-shadow: 0 24px 48px -16px rgba(10,31,12,0.45);
      }
      .e-cta-title {
        font-family: 'Inter', sans-serif; font-weight: 800;
        font-size: clamp(24px, 3vw, 36px);
        letter-spacing: -0.025em; line-height: 1.15;
        color: #FFFFFF; margin: 12px 0 12px;
      }
      .e-cta-sub {
        font-size: 14.5px; color: rgba(255,255,255,0.78);
        max-width: 480px; margin: 0 auto;
        line-height: 1.55;
      }

      @media (prefers-reduced-motion: reduce) {
        .e-hero-bg, .e-o1, .e-o2, .e-o3, .e-w > span, .e-pill, .e-lede,
        .e-cta-row, .e-trust, .e-stage-wrap, .e-scroll,
        .e-glow, .e-live-dot, .e-timer-block-secs .e-timer-num,
        .e-timer-sep, .e-timer-urgent, .e-bid-pulse, .e-bid-flash {
          animation: none !important;
          opacity: 1 !important;
          transform: none !important;
        }
        [data-reveal] { opacity: 1; transform: none; transition: none; }
      }
    `}</style>
  );
}
