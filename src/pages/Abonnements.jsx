import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check, Sparkles, Zap, Crown, Trophy, ArrowRight, Shield,
  Headphones, RotateCcw, TrendingUp, Star, ChevronDown, Plus,
} from "lucide-react";

// ─────────────────────────────────────────────────────────
// Plans
// ─────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "basique",
    name: "Basique",
    Icon: Sparkles,
    tagline: "Pour découvrir la marketplace",
    monthly: 0,
    annual: 0,
    annualTotal: 0,
    target: "Particulier qui débute",
    features: [
      { label: "5 annonces par mois", incl: true },
      { label: "Paiement sécurisé Stripe", incl: true },
      { label: "Support standard (48h)", incl: true },
      { label: "Statistiques de base", incl: false },
      { label: "Badge Vendeur Pro", incl: false },
      { label: "Mises en avant auto", incl: false },
      { label: "Vitrine personnalisée", incl: false },
      { label: "Consultant dédié", incl: false },
    ],
    cta: "S'inscrire gratuitement",
    accent: "#94A3B8",
  },
  {
    id: "pro",
    name: "Pro",
    Icon: Zap,
    tagline: "L'essentiel pour vendre régulièrement",
    monthly: 19,
    annual: 199,
    annualTotal: 228,
    target: "Vendeur régulier",
    features: [
      { label: "30 annonces par mois", incl: true },
      { label: "Paiement sécurisé Stripe", incl: true },
      { label: "Support standard (24h)", incl: true },
      { label: "Statistiques de base", incl: true },
      { label: "Badge Vendeur Pro", incl: true },
      { label: "Mises en avant auto", incl: false },
      { label: "Vitrine personnalisée", incl: false },
      { label: "Consultant dédié", incl: false },
    ],
    cta: "Commencer en Pro",
    accent: "#1B5E20",
  },
  {
    id: "premium",
    name: "Premium",
    Icon: Crown,
    tagline: "Le pack complet pour progresser",
    monthly: 39,
    annual: 399,
    annualTotal: 468,
    target: "Pro qui veut accélérer",
    features: [
      { label: "Annonces illimitées", incl: true },
      { label: "Paiement sécurisé Stripe", incl: true },
      { label: "Support prioritaire (4h)", incl: true },
      { label: "Rapports analytiques avancés", incl: true },
      { label: "Badge Pro vérifié", incl: true },
      { label: "1 mise en avant auto / mois", incl: true },
      { label: "Vitrine personnalisée + URL dédiée", incl: true },
      { label: "Consultant dédié", incl: false },
    ],
    cta: "Choisir Premium",
    accent: "#C5A028",
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    Icon: Trophy,
    tagline: "La solution avancée des vendeurs établis",
    monthly: 99,
    annual: 950,
    annualTotal: 1188,
    target: "Boutique pro / shop",
    features: [
      { label: "Annonces illimitées", incl: true },
      { label: "Paiement sécurisé Stripe", incl: true },
      { label: "Support dédié (1h)", incl: true },
      { label: "Rapports analytiques complets", incl: true },
      { label: "Badge Business 🏆", incl: true },
      { label: "4 mises en avant auto / mois", incl: true },
      { label: "Vitrine ultra-perso + URL premium SEO", incl: true },
      { label: "Consultant dédié + newsletter", incl: true },
    ],
    cta: "Passer en Business",
    accent: "#0A1F0C",
  },
];

const FAQ = [
  {
    q: "Puis-je changer d'abonnement à tout moment ?",
    a: "Oui, vous pouvez upgrader ou rétrograder votre offre à tout moment. La différence est calculée au prorata et facturée sur votre prochaine échéance. Aucun frais caché.",
  },
  {
    q: "Comment fonctionne la résiliation ?",
    a: "La résiliation se fait en un clic depuis votre espace personnel, sans préavis. Vous gardez l'accès à toutes les fonctionnalités jusqu'à la fin de votre période en cours.",
  },
  {
    q: "Y a-t-il des frais cachés ?",
    a: "Aucun. Le prix affiché est le prix payé. Les commissions sur ventes sont distinctes et identiques pour tous les plans, et seuls les frais de paiement Stripe s'appliquent.",
  },
  {
    q: "L'annuel est-il vraiment plus avantageux ?",
    a: "Oui — vous économisez en moyenne 15 à 20 % par rapport au mensuel. Et le 13ᵉ mois est offert sur tous les plans payants.",
  },
  {
    q: "Que se passe-t-il si je dépasse mon quota d'annonces ?",
    a: "Sur les plans Basique et Pro, les annonces excédentaires sont mises en attente. Vous pouvez upgrader à tout moment ou attendre le mois suivant.",
  },
];

const COMPARE_ROWS = [
  { key: "Annonces / mois",          values: ["5", "30", "Illimité", "Illimité"] },
  { key: "Statistiques",             values: ["—", "Basiques", "Avancées", "Complètes"] },
  { key: "Mises en avant auto",      values: ["—", "—", "1 / mois", "4 / mois"] },
  { key: "Vitrine personnalisée",    values: ["—", "—", "Standard", "Premium + SEO"] },
  { key: "Badge",                    values: ["—", "Pro", "Pro vérifié", "Business 🏆"] },
  { key: "Support",                  values: ["48h", "24h", "Prioritaire 4h", "Dédié 1h"] },
  { key: "Consultant dédié",         values: ["—", "—", "—", "Inclus"] },
  { key: "Newsletter dédiée",        values: ["—", "—", "—", "Inclus"] },
];

// ─────────────────────────────────────────────────────────
// Reveal hook
// ─────────────────────────────────────────────────────────
function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("a-revealed"); io.unobserve(e.target); }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ─────────────────────────────────────────────────────────
// Animated counter
// ─────────────────────────────────────────────────────────
function CountUp({ value, duration = 800, prefix = "", suffix = "" }) {
  const [n, setN] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setN(Math.round(from + (to - from) * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
      else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{prefix}{n}{suffix}</>;
}

// ─────────────────────────────────────────────────────────
// Plan card
// ─────────────────────────────────────────────────────────
function PlanCard({ plan, annual, idx }) {
  const Icon = plan.Icon;
  const isFree = plan.monthly === 0;
  const price = annual ? plan.annual : plan.monthly;
  const period = annual ? "an" : "mois";
  const saving = annual && !isFree ? plan.annualTotal - plan.annual : 0;
  const accent = plan.accent;

  return (
    <article
      className={`a-card ${plan.popular ? "a-card-pop" : ""}`}
      data-reveal
      style={{ "--accent": accent, animationDelay: `${idx * 60}ms` }}
    >
      {plan.popular && (
        <div className="a-card-ribbon">
          <Star className="w-3 h-3" /> Le plus choisi
        </div>
      )}

      <div className="a-card-head">
        <div className="a-card-icon">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="a-card-name">{plan.name}</h3>
          <p className="a-card-target">{plan.target}</p>
        </div>
      </div>

      <p className="a-card-tagline">{plan.tagline}</p>

      <div className="a-card-price">
        {isFree ? (
          <>
            <div className="a-price-row">
              <span className="a-price-num">Gratuit</span>
            </div>
            <p className="a-price-sub">Aucun moyen de paiement requis</p>
          </>
        ) : (
          <>
            <div className="a-price-row">
              <span className="a-price-currency">€</span>
              <span className="a-price-num">
                <CountUp value={price} />
              </span>
              <span className="a-price-period">HT / {period}</span>
            </div>
            {saving > 0 && (
              <span className="a-price-save">
                <span className="a-strike">{plan.annualTotal} €</span>
                <span className="a-save-pill">Économisez {saving} €</span>
              </span>
            )}
            {!annual && !isFree && (
              <p className="a-price-sub">soit {Math.round(plan.monthly * 12 * 0.85)} € / an avec l'annuel</p>
            )}
          </>
        )}
      </div>

      <Link
        to="/Login"
        className={`a-card-cta ${plan.popular ? "a-cta-popular" : ""}`}
        style={plan.popular ? undefined : { "--accent": accent }}
      >
        {plan.cta}
        <ArrowRight className="w-4 h-4" />
      </Link>

      <ul className="a-card-features">
        {plan.features.map((f) => (
          <li key={f.label} className={f.incl ? "" : "a-feat-off"}>
            {f.incl ? (
              <span className="a-feat-check">
                <Check className="w-3 h-3" />
              </span>
            ) : (
              <span className="a-feat-dash">—</span>
            )}
            {f.label}
          </li>
        ))}
      </ul>
    </article>
  );
}

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────
export default function Abonnements() {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);
  useReveal([annual]);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <Style />
      <main className="a-main">
        {/* ════════ HERO ════════ */}
        <section className="a-hero">
          <div className="a-hero-bg" aria-hidden>
            <div className="a-blob a-blob-1" />
            <div className="a-blob a-blob-2" />
            <div className="a-grid" />
          </div>

          <div className="a-hero-inner" data-reveal>
            <span className="a-kicker">
              <span className="a-kicker-dot" />
              Abonnements vendeurs · sans engagement
            </span>

            <h1 className="a-h1">
              <span className="a-h1-line">Vendez plus.</span>
              <span className="a-h1-line a-h1-accent">Gagnez plus.</span>
              <span className="a-h1-line a-h1-quiet">Sans frais cachés.</span>
            </h1>

            <p className="a-hero-sub">
              Choisissez l'offre adaptée à votre activité golf — du particulier au shop établi.
              Évoluez à votre rythme, résiliez quand vous voulez.
            </p>

            {/* Toggle annuel / mensuel */}
            <div className="a-toggle-wrap">
              <span className="a-toggle-label">Choisissez votre période de facturation</span>

              <div className={`a-toggle ${annual ? "a-toggle-annual" : ""}`} role="tablist" aria-label="Période de facturation">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!annual}
                  onClick={() => setAnnual(false)}
                  className="a-toggle-btn"
                >
                  <span className="a-toggle-btn-label">Mensuel</span>
                  <span className="a-toggle-btn-sub">Sans engagement</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={annual}
                  onClick={() => setAnnual(true)}
                  className="a-toggle-btn"
                >
                  <span className="a-toggle-btn-label">
                    Annuel
                    <span className="a-toggle-best">Meilleure offre</span>
                  </span>
                  <span className="a-toggle-btn-sub">2 mois offerts · jusqu'à −20%</span>
                </button>
                <span className="a-toggle-thumb" aria-hidden />
              </div>
            </div>

            {/* Mini stats — promesses, pas de chiffres */}
            <div className="a-promo-row" data-reveal>
              <div className="a-promo">
                <Shield className="w-4 h-4" />
                <span>Paiement sécurisé Stripe</span>
              </div>
              <span className="a-promo-sep">·</span>
              <div className="a-promo">
                <RotateCcw className="w-4 h-4" />
                <span>Résiliation en 1 clic</span>
              </div>
              <span className="a-promo-sep">·</span>
              <div className="a-promo">
                <Headphones className="w-4 h-4" />
                <span>Support humain inclus</span>
              </div>
            </div>
          </div>
        </section>

        {/* ════════ PLANS ════════ */}
        <section className="a-plans-section">
          <div className="a-plans-inner">
            <div className="a-plans">
              {PLANS.map((plan, i) => (
                <PlanCard key={plan.id} plan={plan} annual={annual} idx={i} />
              ))}
            </div>

            {/* Lien vers comparatif */}
            <a href="#compare" className="a-compare-link" data-reveal>
              Comparer les offres en détail
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* ════════ COMPARATIF ════════ */}
        <section id="compare" className="a-compare">
          <div className="a-compare-inner">
            <div className="a-section-head" data-reveal>
              <span className="a-section-line" />
              <h2 className="a-section-title">Comparatif détaillé</h2>
              <span className="a-section-meta">{annual ? "Tarifs annuels" : "Tarifs mensuels"}</span>
            </div>

            <div className="a-table-wrap" data-reveal>
              <table className="a-table">
                <thead>
                  <tr>
                    <th></th>
                    {PLANS.map((p) => (
                      <th key={p.id}>
                        <div className="a-table-h">
                          <p.Icon className="w-3.5 h-3.5" style={{ color: p.accent }} />
                          {p.name}
                        </div>
                        <div className="a-table-h-price">
                          {p.monthly === 0 ? "Gratuit" : `${annual ? p.annual : p.monthly} € HT/${annual ? "an" : "mois"}`}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, i) => (
                    <tr key={row.key} className={i % 2 ? "a-tr-alt" : ""}>
                      <th className="a-th-row">{row.key}</th>
                      {row.values.map((v, j) => (
                        <td key={j}>
                          {v === "—" ? <span className="a-td-dash">—</span> : <span className="a-td-yes">{v}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ════════ RÉASSURANCE ════════ */}
        <section className="a-reassure">
          <div className="a-reassure-inner">
            <div className="a-section-head" data-reveal>
              <span className="a-section-line" />
              <h2 className="a-section-title">Pourquoi SwingMarket ?</h2>
            </div>

            <div className="a-reassure-grid">
              {[
                {
                  Icon: Shield,
                  title: "100 % sécurisé",
                  desc: "Paiement Stripe avec séquestre escrow. Vous êtes payé après livraison conforme.",
                },
                {
                  Icon: TrendingUp,
                  title: "Pensé pour vendre",
                  desc: "Audience qualifiée 100 % golf, outils analytiques et boost intégré.",
                },
                {
                  Icon: RotateCcw,
                  title: "Sans engagement",
                  desc: "Résiliation en un clic, à tout moment. Aucune pénalité, aucune justification.",
                },
                {
                  Icon: Headphones,
                  title: "Équipe humaine",
                  desc: "Une équipe française à l'écoute, qui parle golf et comprend vos enjeux.",
                },
              ].map((item, i) => (
                <div key={item.title} className="a-reassure-card" data-reveal style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="a-reassure-icon">
                    <item.Icon className="w-5 h-5" />
                  </div>
                  <h3 className="a-reassure-title">{item.title}</h3>
                  <p className="a-reassure-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ FAQ ════════ */}
        <section className="a-faq">
          <div className="a-faq-inner">
            <div className="a-section-head" data-reveal>
              <span className="a-section-line" />
              <h2 className="a-section-title">Questions fréquentes</h2>
            </div>

            <div className="a-faq-list" data-reveal>
              {FAQ.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div key={item.q} className={`a-faq-item ${open ? "a-faq-open" : ""}`}>
                    <button
                      type="button"
                      className="a-faq-q"
                      onClick={() => setOpenFaq(open ? -1 : i)}
                      aria-expanded={open}
                    >
                      <span>{item.q}</span>
                      <Plus className="a-faq-icon w-4 h-4" />
                    </button>
                    <div className="a-faq-a">
                      <p>{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ════════ CTA FINAL ════════ */}
        <section className="a-final" data-reveal>
          <div className="a-final-card">
            <div className="a-final-deco" aria-hidden />
            <Sparkles className="a-final-spark w-5 h-5" />
            <h2 className="a-final-title">
              Prêt à <span className="a-final-accent">développer votre activité ?</span>
            </h2>
            <p className="a-final-sub">
              Démarrez gratuitement aujourd'hui. Évoluez quand vous êtes prêt.
            </p>
            <div className="a-final-actions">
              <Link to="/Login" className="a-btn a-btn-primary">
                Démarrer ma boutique pro <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="mailto:contact@swingmarketgolf.com" className="a-btn a-btn-ghost">
                Parler à notre équipe
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
      .a-main {
        min-height: 100vh;
        background: #FAF8F3;
        color: #0A1F0C;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-feature-settings: "ss01", "cv11";
        -webkit-font-smoothing: antialiased;
      }

      /* ════════ HERO ════════ */
      .a-hero {
        position: relative;
        overflow: hidden;
        padding: 88px 24px 64px;
        background:
          linear-gradient(180deg, #051A0E 0%, #0A2E1A 60%, #143818 100%);
        color: white;
        isolation: isolate;
      }
      .a-hero-bg { position: absolute; inset: 0; pointer-events: none; }
      .a-blob {
        position: absolute;
        filter: blur(80px);
        opacity: .55;
        border-radius: 50%;
      }
      .a-blob-1 {
        width: 520px; height: 520px;
        top: -180px; right: -120px;
        background: radial-gradient(circle, rgba(76,175,80,.55), transparent 70%);
        animation: a-float 14s ease-in-out infinite;
      }
      .a-blob-2 {
        width: 460px; height: 460px;
        bottom: -200px; left: -100px;
        background: radial-gradient(circle, rgba(232,200,74,.40), transparent 70%);
        animation: a-float 18s ease-in-out infinite reverse;
      }
      @keyframes a-float {
        0%, 100% { transform: translate(0, 0); }
        50%      { transform: translate(30px, -20px); }
      }
      .a-grid {
        position: absolute; inset: 0;
        background-image:
          linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
        background-size: 48px 48px;
        mask-image: radial-gradient(70% 80% at 50% 30%, #000, transparent 90%);
        -webkit-mask-image: radial-gradient(70% 80% at 50% 30%, #000, transparent 90%);
      }

      .a-hero-inner {
        position: relative; z-index: 2;
        max-width: 920px;
        margin: 0 auto;
        text-align: center;
      }
      .a-kicker {
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
      .a-kicker-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #E8C84A;
        box-shadow: 0 0 0 4px rgba(232,200,74,.18);
        animation: a-pulse 2s infinite;
      }
      @keyframes a-pulse {
        0%, 100% { box-shadow: 0 0 0 4px rgba(232,200,74,.18); }
        50%      { box-shadow: 0 0 0 7px rgba(232,200,74,.05); }
      }

      .a-h1 {
        font-weight: 900;
        font-size: clamp(44px, 7vw, 84px);
        line-height: .98;
        letter-spacing: -0.045em;
        margin: 0 0 22px;
        color: white;
      }
      .a-h1-line { display: block; }
      .a-h1-accent {
        background: linear-gradient(135deg, #E8C84A 0%, #C5A028 50%, #FFEDA8 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-style: italic;
        font-family: Georgia, 'Times New Roman', serif;
        font-weight: 400;
        font-size: 1em;
        padding-right: .04em;
        line-height: 1.05;
      }
      .a-h1-quiet {
        color: rgba(255,255,255,.55);
        font-size: .55em;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin-top: 8px;
      }

      .a-hero-sub {
        font-size: clamp(15px, 1.4vw, 18px);
        line-height: 1.6;
        color: rgba(255,255,255,.72);
        margin: 0 auto 36px;
        max-width: 600px;
      }

      /* Toggle */
      .a-toggle-wrap {
        display: flex; flex-direction: column; align-items: center;
        gap: 14px;
        margin-bottom: 32px;
      }
      .a-toggle-label {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10.5px;
        letter-spacing: .14em;
        text-transform: uppercase;
        color: rgba(255,255,255,.50);
        font-weight: 600;
      }
      .a-toggle {
        position: relative;
        display: inline-flex;
        background: rgba(255,255,255,.05);
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 18px;
        padding: 6px;
        backdrop-filter: blur(14px);
        box-shadow: 0 24px 48px -20px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.04);
      }
      .a-toggle-btn {
        position: relative; z-index: 2;
        background: transparent; border: 0; cursor: pointer;
        padding: 12px 22px;
        min-width: 188px;
        font-family: inherit;
        color: rgba(255,255,255,.72);
        border-radius: 14px;
        transition: color .3s;
        display: flex; flex-direction: column; align-items: center;
        gap: 3px;
      }
      .a-toggle-btn:hover { color: white; }
      .a-toggle-btn[aria-selected="true"] { color: #0A1F0C; }
      .a-toggle-btn-label {
        display: inline-flex; align-items: center; gap: 8px;
        font-size: 14.5px;
        font-weight: 800;
        letter-spacing: -0.01em;
      }
      .a-toggle-btn-sub {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10px;
        letter-spacing: .08em;
        font-weight: 600;
        opacity: .75;
      }
      .a-toggle-btn[aria-selected="true"] .a-toggle-btn-sub { opacity: .65; }

      .a-toggle-thumb {
        position: absolute;
        top: 6px; left: 6px;
        width: calc(50% - 6px);
        height: calc(100% - 12px);
        background: linear-gradient(135deg, #FFEDA8 0%, #E8C84A 50%, #C5A028 100%);
        border-radius: 14px;
        transition: transform .45s cubic-bezier(.4,1.4,.5,1);
        z-index: 1;
        box-shadow:
          0 14px 32px -8px rgba(232,200,74,.55),
          0 0 0 1px rgba(255,255,255,.20) inset;
      }
      .a-toggle-annual .a-toggle-thumb { transform: translateX(100%); }

      .a-toggle-best {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 9px;
        background: rgba(10,31,12,.85);
        color: #E8C84A;
        padding: 3px 7px;
        border-radius: 999px;
        letter-spacing: .12em;
        text-transform: uppercase;
        font-weight: 800;
        line-height: 1;
        white-space: nowrap;
      }
      .a-toggle:not(.a-toggle-annual) .a-toggle-best {
        background: linear-gradient(135deg, #E8C84A, #C5A028);
        color: #0A1F0C;
        animation: a-bounce 2.4s ease-in-out infinite;
      }
      @keyframes a-bounce {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-2px); }
      }

      @media (max-width: 540px) {
        .a-toggle-btn { min-width: 0; padding: 10px 14px; }
        .a-toggle-btn-label { font-size: 13px; gap: 6px; }
        .a-toggle-btn-sub { font-size: 9.5px; }
      }

      .a-promo-row {
        display: inline-flex; flex-wrap: wrap;
        align-items: center; gap: 12px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11.5px;
        color: rgba(255,255,255,.65);
        letter-spacing: .04em;
      }
      .a-promo { display: inline-flex; align-items: center; gap: 6px; }
      .a-promo svg { color: #E8C84A; }
      .a-promo-sep { color: rgba(255,255,255,.25); }

      /* ════════ PLANS ════════ */
      .a-plans-section {
        position: relative;
        padding: 0 24px;
        margin-top: -40px;
        z-index: 5;
      }
      .a-plans-inner { max-width: 1280px; margin: 0 auto; }
      .a-plans {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        align-items: stretch;
      }
      @media (max-width: 1100px) { .a-plans { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 580px)  { .a-plans { grid-template-columns: 1fr; } }

      .a-card {
        --accent: #1B5E20;
        position: relative;
        background: white;
        border: 1px solid rgba(10,31,12,.08);
        border-radius: 22px;
        padding: 28px 24px 24px;
        display: flex; flex-direction: column;
        transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s, border-color .25s;
        box-shadow: 0 18px 40px -24px rgba(10,31,12,.20);
      }
      .a-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 32px 56px -28px rgba(10,31,12,.30);
        border-color: rgba(10,31,12,.16);
      }

      .a-card-pop {
        background:
          radial-gradient(60% 80% at 80% 0%, rgba(232,200,74,.16), transparent 60%),
          linear-gradient(180deg, #051A0E 0%, #0A2E1A 100%);
        border-color: rgba(232,200,74,.32);
        color: white;
        padding-top: 38px;
        box-shadow: 0 32px 60px -24px rgba(10,31,12,.5);
      }
      @media (min-width: 1100px) {
        .a-card-pop { transform: translateY(-12px); }
        .a-card-pop:hover { transform: translateY(-18px); }
      }

      .a-card-ribbon {
        position: absolute;
        top: 14px; left: 50%; transform: translateX(-50%);
        display: inline-flex; align-items: center; gap: 5px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10px; font-weight: 700;
        letter-spacing: .14em; text-transform: uppercase;
        background: linear-gradient(135deg, #E8C84A, #C5A028);
        color: #0A1F0C;
        padding: 5px 14px;
        border-radius: 999px;
        box-shadow: 0 8px 20px -6px rgba(232,200,74,.5);
      }

      .a-card-head {
        display: flex; align-items: center; gap: 12px;
        margin-bottom: 14px;
      }
      .a-card-icon {
        width: 40px; height: 40px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--accent) 12%, transparent);
        color: var(--accent);
        display: grid; place-items: center;
        flex-shrink: 0;
      }
      .a-card-pop .a-card-icon {
        background: rgba(232,200,74,.14);
        color: #E8C84A;
      }
      .a-card-name {
        font-weight: 900;
        font-size: 22px;
        letter-spacing: -0.025em;
        margin: 0;
      }
      .a-card-target {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10.5px;
        letter-spacing: .12em; text-transform: uppercase;
        color: rgba(10,31,12,.55);
        margin: 2px 0 0;
      }
      .a-card-pop .a-card-target { color: rgba(255,255,255,.55); }

      .a-card-tagline {
        font-size: 13.5px;
        line-height: 1.5;
        color: rgba(10,31,12,.65);
        margin: 0 0 22px;
        min-height: 40px;
      }
      .a-card-pop .a-card-tagline { color: rgba(255,255,255,.7); }

      .a-card-price {
        margin-bottom: 22px;
        padding-bottom: 22px;
        border-bottom: 1px solid rgba(10,31,12,.08);
      }
      .a-card-pop .a-card-price { border-bottom-color: rgba(255,255,255,.10); }

      .a-price-row {
        display: flex; align-items: baseline; gap: 4px;
      }
      .a-price-currency {
        font-size: 20px;
        font-weight: 700;
        color: rgba(10,31,12,.55);
      }
      .a-card-pop .a-price-currency { color: rgba(255,255,255,.6); }
      .a-price-num {
        font-weight: 900;
        font-size: 56px;
        letter-spacing: -0.04em;
        line-height: 1;
      }
      .a-price-period {
        font-size: 13px;
        font-weight: 600;
        color: rgba(10,31,12,.55);
        margin-left: 4px;
      }
      .a-card-pop .a-price-period { color: rgba(255,255,255,.55); }
      .a-price-save {
        display: inline-flex; align-items: center; gap: 8px;
        margin-top: 10px;
        font-size: 12px;
      }
      .a-strike {
        text-decoration: line-through;
        color: rgba(10,31,12,.4);
      }
      .a-card-pop .a-strike { color: rgba(255,255,255,.35); }
      .a-save-pill {
        background: rgba(27,94,32,.10);
        color: #1B5E20;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 999px;
        font-size: 11px;
      }
      .a-card-pop .a-save-pill {
        background: rgba(232,200,74,.18);
        color: #E8C84A;
      }
      .a-price-sub {
        font-size: 11.5px;
        color: rgba(10,31,12,.5);
        margin: 8px 0 0;
      }
      .a-card-pop .a-price-sub { color: rgba(255,255,255,.55); }

      .a-card-cta {
        --accent: #1B5E20;
        display: inline-flex; align-items: center; justify-content: center; gap: 7px;
        background: var(--accent);
        color: white;
        font-family: inherit;
        font-weight: 800;
        font-size: 13.5px;
        padding: 13px 18px;
        border-radius: 12px;
        text-decoration: none;
        border: 0; cursor: pointer;
        transition: transform .15s, box-shadow .2s, background .2s;
        box-shadow: 0 12px 24px -10px color-mix(in srgb, var(--accent) 60%, transparent);
        margin-bottom: 22px;
      }
      .a-card-cta:hover {
        transform: translateY(-2px);
        filter: brightness(1.06);
        box-shadow: 0 18px 30px -10px color-mix(in srgb, var(--accent) 70%, transparent);
      }
      .a-cta-popular {
        background: linear-gradient(135deg, #E8C84A, #C5A028);
        color: #0A1F0C;
        box-shadow: 0 16px 32px -10px rgba(232,200,74,.5);
      }
      .a-cta-popular:hover {
        box-shadow: 0 22px 40px -10px rgba(232,200,74,.65);
      }

      .a-card-features {
        list-style: none;
        margin: 0; padding: 0;
        display: flex; flex-direction: column; gap: 10px;
      }
      .a-card-features li {
        display: flex; align-items: flex-start; gap: 10px;
        font-size: 13px;
        line-height: 1.45;
        color: rgba(10,31,12,.85);
      }
      .a-card-pop .a-card-features li { color: rgba(255,255,255,.85); }
      .a-card-features li.a-feat-off {
        color: rgba(10,31,12,.35);
      }
      .a-card-pop .a-card-features li.a-feat-off { color: rgba(255,255,255,.30); }
      .a-feat-check {
        flex-shrink: 0;
        width: 18px; height: 18px;
        border-radius: 50%;
        background: rgba(27,94,32,.12);
        color: #1B5E20;
        display: grid; place-items: center;
        margin-top: 1px;
      }
      .a-card-pop .a-feat-check {
        background: rgba(232,200,74,.18);
        color: #E8C84A;
      }
      .a-feat-dash {
        flex-shrink: 0;
        width: 18px; height: 18px;
        display: grid; place-items: center;
        color: rgba(10,31,12,.30);
        font-weight: 700;
      }
      .a-card-pop .a-feat-dash { color: rgba(255,255,255,.30); }

      .a-compare-link {
        display: inline-flex; align-items: center; gap: 6px;
        margin: 36px auto 0;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 12px;
        letter-spacing: .12em; text-transform: uppercase;
        color: #1B5E20;
        text-decoration: none;
        font-weight: 700;
        padding: 10px 18px;
        background: white;
        border: 1px solid rgba(10,31,12,.08);
        border-radius: 999px;
        width: fit-content;
        transition: border-color .2s, transform .2s;
      }
      .a-plans-inner { display: flex; flex-direction: column; align-items: stretch; }
      .a-compare-link:hover {
        border-color: #1B5E20;
        transform: translateY(-1px);
      }

      /* ════════ COMPARE ════════ */
      .a-compare {
        padding: 80px 24px 56px;
      }
      .a-compare-inner { max-width: 1100px; margin: 0 auto; }

      .a-section-head {
        display: flex; align-items: center; gap: 14px;
        margin-bottom: 28px;
      }
      .a-section-line {
        flex: 0 0 32px; height: 2px;
        background: linear-gradient(90deg, #C5A028, transparent);
      }
      .a-section-title {
        font-weight: 900;
        font-size: clamp(22px, 2.6vw, 32px);
        letter-spacing: -0.03em;
        margin: 0;
        color: #0A1F0C;
      }
      .a-section-meta {
        margin-left: auto;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11.5px;
        color: rgba(10,31,12,.5);
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .a-table-wrap {
        background: white;
        border: 1px solid rgba(10,31,12,.08);
        border-radius: 22px;
        overflow: auto;
        box-shadow: 0 12px 32px -16px rgba(10,31,12,.10);
      }
      .a-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13.5px;
        min-width: 720px;
      }
      .a-table thead {
        background: #FAF8F3;
      }
      .a-table th, .a-table td {
        padding: 16px 18px;
        text-align: left;
        vertical-align: middle;
      }
      .a-table th {
        font-weight: 800;
        color: #0A1F0C;
      }
      .a-table thead th:first-child { background: transparent; }
      .a-table-h {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 14px;
      }
      .a-table-h-price {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11px;
        color: rgba(10,31,12,.55);
        font-weight: 600;
        margin-top: 4px;
      }
      .a-th-row {
        font-weight: 600;
        color: rgba(10,31,12,.75);
        font-size: 13px;
      }
      .a-tr-alt { background: rgba(10,31,12,.02); }
      .a-td-yes {
        font-weight: 600;
        color: #1B5E20;
      }
      .a-td-dash { color: rgba(10,31,12,.30); font-weight: 600; }

      /* ════════ REASSURE ════════ */
      .a-reassure { padding: 56px 24px 56px; }
      .a-reassure-inner { max-width: 1100px; margin: 0 auto; }
      .a-reassure-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 18px;
      }
      .a-reassure-card {
        background: white;
        border: 1px solid rgba(10,31,12,.08);
        border-radius: 18px;
        padding: 26px 22px;
        transition: transform .25s, box-shadow .25s, border-color .2s;
      }
      .a-reassure-card:hover {
        transform: translateY(-3px);
        border-color: rgba(10,31,12,.16);
        box-shadow: 0 18px 32px -16px rgba(10,31,12,.18);
      }
      .a-reassure-icon {
        width: 42px; height: 42px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(76,175,80,.12), rgba(232,200,74,.10));
        color: #1B5E20;
        display: grid; place-items: center;
        margin-bottom: 16px;
      }
      .a-reassure-title {
        font-weight: 800;
        font-size: 16px;
        letter-spacing: -0.015em;
        color: #0A1F0C;
        margin: 0 0 6px;
      }
      .a-reassure-desc {
        font-size: 13px;
        line-height: 1.55;
        color: rgba(10,31,12,.65);
        margin: 0;
      }

      /* ════════ FAQ ════════ */
      .a-faq { padding: 56px 24px 56px; }
      .a-faq-inner { max-width: 820px; margin: 0 auto; }
      .a-faq-list {
        display: flex; flex-direction: column;
        gap: 10px;
      }
      .a-faq-item {
        background: white;
        border: 1px solid rgba(10,31,12,.08);
        border-radius: 14px;
        overflow: hidden;
        transition: border-color .2s, box-shadow .2s;
      }
      .a-faq-item:hover { border-color: rgba(10,31,12,.16); }
      .a-faq-q {
        width: 100%;
        background: transparent;
        border: 0;
        padding: 18px 22px;
        display: flex; align-items: center; justify-content: space-between;
        font-family: inherit;
        font-size: 15px;
        font-weight: 700;
        color: #0A1F0C;
        text-align: left;
        cursor: pointer;
        gap: 16px;
      }
      .a-faq-icon {
        flex-shrink: 0;
        color: #1B5E20;
        transition: transform .3s;
      }
      .a-faq-open .a-faq-icon { transform: rotate(45deg); }
      .a-faq-a {
        max-height: 0;
        overflow: hidden;
        transition: max-height .35s ease;
      }
      .a-faq-open .a-faq-a { max-height: 240px; }
      .a-faq-a p {
        padding: 0 22px 20px;
        font-size: 14px;
        line-height: 1.65;
        color: rgba(10,31,12,.65);
        margin: 0;
      }

      /* ════════ FINAL CTA ════════ */
      .a-final {
        padding: 24px 24px 88px;
      }
      .a-final-card {
        position: relative;
        max-width: 1100px;
        margin: 0 auto;
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
      .a-final-deco {
        position: absolute; inset: 0; z-index: 0;
        background-image:
          linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
        background-size: 32px 32px;
        mask-image: radial-gradient(60% 80% at 50% 0%, #000, transparent 70%);
        -webkit-mask-image: radial-gradient(60% 80% at 50% 0%, #000, transparent 70%);
        pointer-events: none;
      }
      .a-final-card > * { position: relative; z-index: 1; }
      .a-final-spark {
        color: #E8C84A;
        margin-bottom: 14px;
      }
      .a-final-title {
        font-weight: 900;
        font-size: clamp(28px, 4vw, 46px);
        letter-spacing: -0.035em;
        line-height: 1.1;
        margin: 0 0 14px;
      }
      .a-final-accent {
        background: linear-gradient(135deg, #E8C84A, #C5A028);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-style: italic;
        font-family: Georgia, serif;
        font-weight: 400;
      }
      .a-final-sub {
        font-size: 16px;
        color: rgba(255,255,255,.72);
        margin: 0 0 32px;
      }
      .a-final-actions {
        display: inline-flex; flex-wrap: wrap;
        gap: 12px; justify-content: center;
      }
      .a-btn {
        display: inline-flex; align-items: center; gap: 8px;
        font-family: inherit;
        font-weight: 800; font-size: 14px;
        padding: 14px 26px;
        border-radius: 999px;
        text-decoration: none;
        border: 0; cursor: pointer;
        transition: transform .2s, box-shadow .2s, background .2s;
      }
      .a-btn-primary {
        background: #E8C84A;
        color: #0A1F0C;
        box-shadow: 0 16px 32px -10px rgba(232,200,74,.5);
      }
      .a-btn-primary:hover {
        background: #F2D55C;
        transform: translateY(-2px);
        box-shadow: 0 22px 40px -10px rgba(232,200,74,.65);
      }
      .a-btn-ghost {
        background: rgba(255,255,255,.10);
        color: white;
        border: 1px solid rgba(255,255,255,.20);
        backdrop-filter: blur(10px);
      }
      .a-btn-ghost:hover {
        background: rgba(255,255,255,.18);
        transform: translateY(-2px);
      }

      /* ════════ Reveal ════════ */
      [data-reveal] {
        opacity: 0; transform: translateY(16px);
        transition: opacity .65s cubic-bezier(.2,.7,.2,1), transform .65s cubic-bezier(.2,.7,.2,1);
      }
      [data-reveal].a-revealed { opacity: 1; transform: none; }

      @media (prefers-reduced-motion: reduce) {
        [data-reveal] { opacity: 1; transform: none; transition: none; }
        .a-card:hover, .a-reassure-card:hover, .a-card-cta:hover, .a-btn:hover, .a-compare-link:hover { transform: none; }
        .a-blob-1, .a-blob-2 { animation: none; }
        .a-kicker-dot { animation: none; }
        .a-toggle:not(.a-toggle-annual) .a-toggle-best { animation: none; }
      }
    `}</style>
  );
}
