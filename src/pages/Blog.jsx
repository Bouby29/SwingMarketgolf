import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight, Search, Loader2, Mail, Clock, Calendar, Sparkles,
} from "lucide-react";

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "";

const readTime = (content) => {
  if (!content) return "1 min";
  const words = content.split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 220))} min`;
};

// Génère un extrait depuis le contenu (1ère phrase / paragraphe)
const makeExcerpt = (content, len = 180) => {
  if (!content) return "";
  const clean = content
    .replace(/^#{1,6}\s+/gm, "")     // titres MD
    .replace(/[*_>`]/g, "")           // formatages MD
    .replace(/\n+/g, " ")
    .trim();
  if (clean.length <= len) return clean;
  return clean.slice(0, len).replace(/\s+\S*$/, "") + "…";
};

// Catégorie devinée depuis le titre
function guessCategory(post) {
  const text = `${post.title || ""}`.toLowerCase();
  if (/guide|comment\b/.test(text))             return { id: "guide",       label: "Guide",       hue: 145 };
  if (/conseil|astuce|tip\b/.test(text))        return { id: "conseil",     label: "Conseils",    hue: 175 };
  if (/comparatif|test|review|vs\b/.test(text)) return { id: "comparatif",  label: "Comparatif",  hue: 38  };
  if (/actu|news|annonce/.test(text))           return { id: "actu",        label: "Actualités",  hue: 268 };
  if (/entretien|nettoy|réparer/.test(text))    return { id: "entretien",   label: "Entretien",   hue: 200 };
  return                                              { id: "general",     label: "À lire",      hue: 110 };
}

// ────── Couvertures SVG si pas d'image ──────
const COVER_PATTERNS = [
  ({ id, c1, c2 }) => (
    <svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" className="b-cov-svg" aria-hidden>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient>
      </defs>
      <rect width="600" height="380" fill={`url(#g-${id})`} />
      <g stroke="rgba(255,255,255,.18)" strokeWidth="1.5" fill="none">
        <path d="M-50 180 Q150 140 300 180 T 700 180" /><path d="M-50 220 Q150 180 300 220 T 700 220" />
        <path d="M-50 260 Q150 220 300 260 T 700 260" /><path d="M-50 300 Q150 260 300 300 T 700 300" />
      </g>
      <circle cx="500" cy="100" r="60" fill="rgba(255,255,255,.06)" />
      <circle cx="80" cy="60" r="30" fill="rgba(255,255,255,.08)" />
    </svg>
  ),
  ({ id, c1, c2 }) => (
    <svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" className="b-cov-svg" aria-hidden>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient>
      </defs>
      <rect width="600" height="380" fill={`url(#g-${id})`} />
      <ellipse cx="300" cy="350" rx="280" ry="40" fill="rgba(0,0,0,.18)" />
      <line x1="430" y1="80" x2="430" y2="350" stroke="rgba(255,255,255,.85)" strokeWidth="3" />
      <path d="M430 80 L 540 105 L 430 130 Z" fill="rgba(255,255,255,.92)" />
      <text x="445" y="112" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill="#1B5E20">SM</text>
      <circle cx="160" cy="320" r="14" fill="rgba(255,255,255,.95)" />
    </svg>
  ),
  ({ id, c1, c2 }) => (
    <svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" className="b-cov-svg" aria-hidden>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient>
        <radialGradient id={`b-${id}`} cx="35%" cy="35%"><stop offset="0%" stopColor="rgba(255,255,255,1)" /><stop offset="100%" stopColor="rgba(220,220,220,.95)" /></radialGradient>
      </defs>
      <rect width="600" height="380" fill={`url(#g-${id})`} />
      {[[120, 90, 36], [430, 70, 28], [200, 220, 42], [490, 200, 32], [80, 320, 26], [340, 320, 38], [560, 330, 22], [310, 130, 22]].map(([cx, cy, r], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          <circle r={r} fill={`url(#b-${id})`} />
          <circle r={r * 0.15} cx={-r * 0.3} cy={-r * 0.3} fill="rgba(0,0,0,.06)" />
          <circle r={r * 0.12} cx={r * 0.2} cy={-r * 0.1} fill="rgba(0,0,0,.05)" />
        </g>
      ))}
    </svg>
  ),
  ({ id, c1, c2 }) => (
    <svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" className="b-cov-svg" aria-hidden>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient>
        <pattern id={`p-${id}`} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1" /></pattern>
      </defs>
      <rect width="600" height="380" fill={`url(#g-${id})`} />
      <rect width="600" height="380" fill={`url(#p-${id})`} />
      <g transform="translate(300 190)">
        <circle r="130" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="1.5" />
        <circle r="90"  fill="none" stroke="rgba(255,255,255,.20)" strokeWidth="1.5" />
        <circle r="55"  fill="none" stroke="rgba(255,255,255,.30)" strokeWidth="1.5" />
        <circle r="22"  fill="rgba(255,255,255,.85)" />
      </g>
    </svg>
  ),
  ({ id, c1, c2 }) => (
    <svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" className="b-cov-svg" aria-hidden>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient>
      </defs>
      <rect width="600" height="380" fill={`url(#g-${id})`} />
      <path d="M0 280 Q 150 220 300 280 T 600 280 V 380 H 0 Z" fill="rgba(255,255,255,.10)" />
      <path d="M0 320 Q 150 270 300 320 T 600 320 V 380 H 0 Z" fill="rgba(255,255,255,.14)" />
      <path d="M0 350 Q 150 320 300 350 T 600 350 V 380 H 0 Z" fill="rgba(0,0,0,.10)" />
      <circle cx="490" cy="90" r="50" fill="rgba(255,255,255,.18)" />
    </svg>
  ),
  ({ id, c1, c2 }) => (
    <svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" className="b-cov-svg" aria-hidden>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient>
        <pattern id={`d-${id}`} width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.5" fill="rgba(255,255,255,.12)" /></pattern>
      </defs>
      <rect width="600" height="380" fill={`url(#g-${id})`} />
      <rect width="600" height="380" fill={`url(#d-${id})`} />
      <g transform="translate(420 110) rotate(28)" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.45)" strokeWidth="1.2">
        <rect x="-3" y="0" width="6" height="180" rx="2" />
        <path d="M -45 180 Q -50 220 -10 230 L 50 230 Q 60 220 50 200 L 5 195 Z" />
      </g>
    </svg>
  ),
];

const PALETTES = [
  ["#0A1F0C", "#1B5E20"], ["#1B5E20", "#4CAF50"], ["#7B5E12", "#C5A028"],
  ["#0F172A", "#334155"], ["#064E3B", "#10B981"], ["#3B2F0E", "#8B6914"],
];

function hashIndex(s, mod) {
  let h = 0; const str = String(s || "");
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

function CoverArt({ post, sizeKey = "md" }) {
  if (post.image_url) {
    return (
      <div className={`b-cover b-cov-${sizeKey}`}>
        <img src={post.image_url} alt="" className="b-cov-img" loading="lazy" />
      </div>
    );
  }
  const idx = hashIndex(post.id || post.title, COVER_PATTERNS.length);
  const palIdx = hashIndex((post.id || post.title) + "p", PALETTES.length);
  const [c1, c2] = PALETTES[palIdx];
  const Pattern = COVER_PATTERNS[idx];
  return (
    <div className={`b-cover b-cov-${sizeKey}`}>
      <Pattern id={`${post.id || idx}-${sizeKey}`} c1={c1} c2={c2} />
    </div>
  );
}

function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("b-revealed"); io.unobserve(e.target); }
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
// Page
// ─────────────────────────────────────────────────────────
export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");

  useReveal([posts.length, search, activeCat]);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from("blog_posts")
      .select("id, title, content, image_url, status, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("[Blog] fetch error:", error);
          setError(error.message || "Erreur de chargement");
        }
        setPosts(data || []);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const availableCats = useMemo(() => {
    const seen = new Map();
    posts.forEach((p) => {
      const c = guessCategory(p);
      if (!seen.has(c.id)) seen.set(c.id, c);
    });
    return Array.from(seen.values());
  }, [posts]);

  const filtered = useMemo(() => {
    let arr = posts;
    if (activeCat !== "all") arr = arr.filter((p) => guessCategory(p).id === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((p) =>
        (p.title || "").toLowerCase().includes(q) ||
        (p.content || "").toLowerCase().includes(q)
      );
    }
    return arr;
  }, [posts, search, activeCat]);

  const featured = filtered[0];
  const secondaries = filtered.slice(1, 3);
  const rest = filtered.slice(3);

  return (
    <>
      <Style />
      <main className="b-main">

        {/* HERO */}
        <header className="b-hero" data-reveal>
          <div className="b-hero-inner">
            <div className="b-hero-kicker">
              <span className="b-kicker-dot" />
              <span>Le journal SwingMarket</span>
              {posts.length > 0 && (
                <>
                  <span className="b-kicker-sep">·</span>
                  <span>{posts.length} article{posts.length > 1 ? "s" : ""}</span>
                </>
              )}
            </div>

            <h1 className="b-hero-title">
              <span className="b-hero-line">Tout pour acheter,</span>
              <span className="b-hero-line">vendre, et entretenir</span>
              <span className="b-hero-line b-hero-accent">votre matériel de golf.</span>
            </h1>

            <p className="b-hero-sub">
              Conseils pratiques, comparatifs honnêtes et actualités du golf d'occasion —
              écrits par notre équipe, pour les passionnés.
            </p>

            {posts.length > 0 && (
              <div className="b-hero-tools" data-reveal>
                <label className="b-search">
                  <Search className="w-4 h-4" />
                  <input type="search" placeholder="Rechercher un article…"
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    aria-label="Rechercher dans le blog" />
                  {search && (
                    <button type="button" onClick={() => setSearch("")} className="b-search-clear" aria-label="Effacer">×</button>
                  )}
                </label>

                {availableCats.length > 0 && (
                  <div className="b-cats" role="tablist" aria-label="Filtrer par catégorie">
                    <button type="button" onClick={() => setActiveCat("all")}
                      className={`b-cat ${activeCat === "all" ? "b-cat-on" : ""}`}>
                      Tous <span className="b-cat-count">{posts.length}</span>
                    </button>
                    {availableCats.map((c) => {
                      const count = posts.filter((p) => guessCategory(p).id === c.id).length;
                      return (
                        <button key={c.id} type="button" onClick={() => setActiveCat(c.id)}
                          className={`b-cat ${activeCat === c.id ? "b-cat-on" : ""}`}
                          style={activeCat === c.id ? { background: `hsl(${c.hue} 60% 18%)` } : undefined}>
                          <span className="b-cat-dot" style={{ background: `hsl(${c.hue} 65% 45%)` }} />
                          {c.label} <span className="b-cat-count">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="b-hero-deco" aria-hidden />
        </header>

        {/* CONTENU */}
        <section className="b-section">
          {loading && (
            <div className="b-loading">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Chargement du journal…</span>
            </div>
          )}

          {!loading && error && (
            <div className="b-empty" data-reveal>
              <div className="b-empty-icon b-empty-icon-error">!</div>
              <h2 className="b-empty-title">Impossible de charger le blog</h2>
              <p className="b-empty-sub">{error}</p>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="b-empty" data-reveal>
              <div className="b-empty-icon"><Sparkles className="w-7 h-7" /></div>
              <h2 className="b-empty-title">Le journal démarre bientôt</h2>
              <p className="b-empty-sub">
                Nos premiers articles seront publiés très prochainement.
                En attendant, l'aventure se passe sur la marketplace.
              </p>
              <Link to="/Marketplace" className="b-empty-cta">
                Voir les annonces <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {!loading && !error && posts.length > 0 && filtered.length === 0 && (
            <div className="b-empty" data-reveal>
              <div className="b-empty-icon"><Search className="w-7 h-7" /></div>
              <h2 className="b-empty-title">Aucun article trouvé</h2>
              <p className="b-empty-sub">
                Aucun résultat {search && <>pour <strong>« {search} »</strong></>}.
              </p>
              <button onClick={() => { setSearch(""); setActiveCat("all"); }} className="b-empty-cta">
                Réinitialiser
              </button>
            </div>
          )}

          {!loading && featured && (
            <div className="b-top">
              <Link to={`/BlogPost?id=${featured.id}`} className="b-feat" data-reveal>
                <CoverArt post={featured} sizeKey="lg" />
                <div className="b-feat-overlay">
                  <span className="b-tag b-tag-light">{guessCategory(featured).label}</span>
                  <h2 className="b-feat-title">{featured.title}</h2>
                  <p className="b-feat-excerpt">{makeExcerpt(featured.content, 200)}</p>
                  <div className="b-feat-meta">
                    <span><Calendar className="w-3.5 h-3.5" /> {fmtDate(featured.created_at)}</span>
                    <span className="b-dot" />
                    <span><Clock className="w-3.5 h-3.5" /> {readTime(featured.content)} de lecture</span>
                    <span className="b-feat-cta">Lire l'article <ArrowRight className="w-3.5 h-3.5" /></span>
                  </div>
                </div>
              </Link>

              {secondaries.length > 0 && (
                <div className="b-side">
                  {secondaries.map((p) => {
                    const cat = guessCategory(p);
                    return (
                      <Link key={p.id} to={`/BlogPost?id=${p.id}`} className="b-side-card" data-reveal>
                        <div className="b-side-cover-wrap">
                          <CoverArt post={p} sizeKey="sm" />
                        </div>
                        <div className="b-side-body">
                          <span className="b-tag" style={{ color: `hsl(${cat.hue} 55% 28%)`, background: `hsl(${cat.hue} 70% 94%)` }}>
                            {cat.label}
                          </span>
                          <h3 className="b-side-title">{p.title}</h3>
                          <div className="b-side-meta">
                            <span>{fmtDate(p.created_at)}</span>
                            <span className="b-dot" />
                            <span>{readTime(p.content)}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!loading && rest.length > 0 && (
            <>
              <div className="b-section-head" data-reveal>
                <span className="b-section-line" />
                <h2 className="b-section-title">Tous les articles</h2>
                <span className="b-section-count">{rest.length} de plus</span>
              </div>
              <div className="b-grid">
                {rest.map((p) => {
                  const cat = guessCategory(p);
                  return (
                    <Link key={p.id} to={`/BlogPost?id=${p.id}`} className="b-card" data-reveal>
                      <CoverArt post={p} sizeKey="md" />
                      <div className="b-card-body">
                        <span className="b-tag" style={{ color: `hsl(${cat.hue} 55% 28%)`, background: `hsl(${cat.hue} 70% 94%)` }}>
                          {cat.label}
                        </span>
                        <h3 className="b-card-title">{p.title}</h3>
                        <p className="b-card-excerpt">{makeExcerpt(p.content, 130)}</p>
                        <div className="b-card-meta">
                          <span>{fmtDate(p.created_at)}</span>
                          <span className="b-dot" />
                          <span>{readTime(p.content)}</span>
                          <ArrowRight className="b-card-arrow w-3.5 h-3.5" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* NEWSLETTER */}
        <section className="b-newsletter" data-reveal>
          <div className="b-news-card">
            <div className="b-news-deco" aria-hidden />
            <div className="b-news-icon"><Mail className="w-5 h-5" /></div>
            <h2 className="b-news-title">
              Le golf d'occasion, <span className="b-news-accent">livré chaque semaine</span>
            </h2>
            <p className="b-news-sub">Un email par semaine, zéro spam. Désinscription en un clic.</p>
            <form className="b-news-form" onSubmit={(e) => { e.preventDefault(); alert("Inscription bientôt disponible — merci de votre intérêt !"); }}>
              <input type="email" required placeholder="votre@email.com" />
              <button type="submit">S'abonner <ArrowRight className="w-4 h-4" /></button>
            </form>
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
      .b-main {
        min-height: 100vh;
        background: #FAF8F3;
        color: #0A1F0C;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-feature-settings: "ss01", "cv11";
        -webkit-font-smoothing: antialiased;
      }

      .b-hero {
        position: relative; overflow: hidden;
        padding: 72px 24px 56px;
        background:
          radial-gradient(60% 80% at 90% 0%, rgba(76,175,80,.10), transparent 60%),
          radial-gradient(50% 70% at 0% 100%, rgba(197,160,40,.08), transparent 60%),
          #FAF8F3;
        border-bottom: 1px solid rgba(10,31,12,.08);
      }
      .b-hero-inner { max-width: 1140px; margin: 0 auto; position: relative; z-index: 2; }
      .b-hero-deco {
        position: absolute; inset: 0;
        background-image:
          linear-gradient(rgba(10,31,12,.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(10,31,12,.025) 1px, transparent 1px);
        background-size: 48px 48px;
        mask-image: radial-gradient(60% 70% at 50% 30%, #000 30%, transparent 90%);
        -webkit-mask-image: radial-gradient(60% 70% at 50% 30%, #000 30%, transparent 90%);
        z-index: 1; pointer-events: none;
      }

      .b-hero-kicker {
        display: inline-flex; align-items: center; gap: 8px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11.5px; font-weight: 600;
        letter-spacing: .14em; text-transform: uppercase;
        color: #1B5E20;
        margin-bottom: 28px; padding: 6px 14px;
        background: rgba(27,94,32,.08);
        border-radius: 999px;
        border: 1px solid rgba(27,94,32,.14);
      }
      .b-kicker-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #1B5E20;
        box-shadow: 0 0 0 4px rgba(27,94,32,.15);
        animation: b-pulse 2s infinite;
      }
      @keyframes b-pulse {
        0%, 100% { box-shadow: 0 0 0 4px rgba(27,94,32,.15); }
        50%      { box-shadow: 0 0 0 7px rgba(27,94,32,.05); }
      }
      .b-kicker-sep { color: #C5A028; opacity: .7; }

      .b-hero-title {
        font-weight: 900;
        font-size: clamp(40px, 6.5vw, 80px);
        line-height: .98;
        letter-spacing: -0.045em;
        margin: 0 0 24px;
        max-width: 980px;
      }
      .b-hero-line { display: block; }
      .b-hero-accent {
        background: linear-gradient(135deg, #C5A028 0%, #E8C84A 50%, #8B6914 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-style: italic;
        font-family: Georgia, 'Times New Roman', serif;
        font-weight: 400;
        font-size: .95em;
        padding-right: .04em;
        line-height: 1.05;
      }

      .b-hero-sub {
        font-size: clamp(15px, 1.5vw, 18px);
        line-height: 1.55;
        color: #4A5450;
        margin: 0 0 36px;
        max-width: 620px;
      }

      .b-hero-tools { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
      .b-search {
        display: inline-flex; align-items: center; gap: 10px;
        background: white;
        border: 1px solid rgba(10,31,12,.10);
        border-radius: 12px;
        padding: 12px 16px;
        flex: 1; max-width: 380px; min-width: 240px;
        transition: border-color .15s, box-shadow .15s;
        color: #94A3B8;
      }
      .b-search:focus-within {
        border-color: #1B5E20;
        box-shadow: 0 0 0 4px rgba(27,94,32,.10);
        color: #1B5E20;
      }
      .b-search input {
        flex: 1; border: 0; outline: 0; background: transparent;
        font-size: 14.5px; color: #0A1F0C;
        font-family: inherit;
      }
      .b-search input::placeholder { color: #94A3B8; }
      .b-search-clear {
        background: #F1F5F9; border: 0; cursor: pointer;
        width: 22px; height: 22px; border-radius: 50%;
        font-size: 16px; color: #64748B;
        display: grid; place-items: center;
      }
      .b-search-clear:hover { background: #E2E8F0; color: #0A1F0C; }

      .b-cats { display: inline-flex; gap: 6px; flex-wrap: wrap; }
      .b-cat {
        display: inline-flex; align-items: center; gap: 7px;
        background: white;
        border: 1px solid rgba(10,31,12,.10);
        border-radius: 10px;
        padding: 9px 14px;
        font-size: 13px; font-weight: 600;
        color: #4A5450; cursor: pointer;
        transition: all .15s;
        font-family: inherit;
      }
      .b-cat:hover {
        border-color: rgba(10,31,12,.20);
        color: #0A1F0C;
        transform: translateY(-1px);
      }
      .b-cat-on { background: #0A1F0C; color: white; border-color: #0A1F0C; }
      .b-cat-on .b-cat-dot { box-shadow: 0 0 0 2px rgba(255,255,255,.25); }
      .b-cat-dot { width: 7px; height: 7px; border-radius: 50%; }
      .b-cat-count {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11px; opacity: .65; margin-left: 2px;
      }

      .b-section { max-width: 1140px; margin: 0 auto; padding: 56px 24px 24px; }

      .b-top {
        display: grid;
        grid-template-columns: 1.3fr 1fr;
        gap: 24px;
        margin-bottom: 64px;
      }
      @media (max-width: 920px) { .b-top { grid-template-columns: 1fr; } }

      .b-cover { position: relative; overflow: hidden; border-radius: 14px; }
      .b-cov-svg, .b-cov-img {
        position: absolute; inset: 0;
        width: 100%; height: 100%; display: block;
        object-fit: cover;
      }
      .b-cov-lg { aspect-ratio: 5 / 4; }
      .b-cov-md { aspect-ratio: 16 / 10; }
      .b-cov-sm { aspect-ratio: 16 / 11; }

      .b-feat {
        position: relative; display: block;
        text-decoration: none; color: inherit;
        border-radius: 22px; overflow: hidden;
        background: #0A1F0C;
        box-shadow: 0 30px 60px -30px rgba(10,31,12,.40);
        transition: transform .35s, box-shadow .35s;
        isolation: isolate;
      }
      .b-feat .b-cover { border-radius: 0; }
      .b-feat::after {
        content: ""; position: absolute; inset: 0;
        background: linear-gradient(180deg, transparent 30%, rgba(0,0,0,.30) 60%, rgba(0,0,0,.85) 100%);
        z-index: 1;
      }
      .b-feat:hover {
        transform: translateY(-3px);
        box-shadow: 0 40px 80px -30px rgba(10,31,12,.55);
      }
      .b-feat:hover .b-cov-svg, .b-feat:hover .b-cov-img { transform: scale(1.04); }
      .b-cov-svg, .b-cov-img { transition: transform .6s ease-out; }

      .b-feat-overlay {
        position: absolute; inset: 0; z-index: 2;
        padding: clamp(24px, 4vw, 44px);
        display: flex; flex-direction: column; justify-content: flex-end;
        color: white;
      }
      .b-feat-title {
        font-weight: 800;
        font-size: clamp(24px, 3.4vw, 40px);
        letter-spacing: -0.03em;
        line-height: 1.12;
        margin: 14px 0 10px;
        max-width: 540px;
      }
      .b-feat-excerpt {
        font-size: clamp(14px, 1.3vw, 16px);
        line-height: 1.55;
        color: rgba(255,255,255,.85);
        margin: 0 0 20px;
        max-width: 520px;
        display: -webkit-box;
        -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .b-feat-meta {
        display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        font-size: 12.5px; color: rgba(255,255,255,.75);
      }
      .b-feat-meta > span { display: inline-flex; align-items: center; gap: 5px; }
      .b-feat-cta {
        margin-left: auto;
        color: #E8C84A; font-weight: 700;
        transition: gap .25s; gap: 4px;
      }
      .b-feat:hover .b-feat-cta { gap: 9px; }

      .b-tag {
        display: inline-block;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10.5px; font-weight: 700;
        padding: 4px 10px; border-radius: 999px;
        letter-spacing: .12em; text-transform: uppercase;
        align-self: flex-start;
      }
      .b-tag-light {
        background: rgba(255,255,255,.16); color: white;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,.22);
      }

      .b-side { display: flex; flex-direction: column; gap: 24px; }
      .b-side-card {
        display: grid; grid-template-columns: 130px 1fr; gap: 18px;
        text-decoration: none; color: inherit;
        background: white;
        border: 1px solid rgba(10,31,12,.08);
        border-radius: 16px;
        overflow: hidden; padding: 14px;
        transition: border-color .2s, box-shadow .2s, transform .2s;
      }
      .b-side-card:hover {
        border-color: rgba(10,31,12,.16);
        box-shadow: 0 20px 40px -20px rgba(10,31,12,.20);
        transform: translateY(-2px);
      }
      .b-side-cover-wrap { border-radius: 12px; overflow: hidden; }
      .b-side-cover-wrap .b-cover { border-radius: 0; height: 100%; aspect-ratio: 1 / 1; }
      .b-side-body {
        display: flex; flex-direction: column;
        gap: 8px; justify-content: center;
        padding: 4px 6px 4px 0;
      }
      .b-side-title {
        font-weight: 800; font-size: 16px;
        letter-spacing: -0.02em; line-height: 1.25;
        color: #0A1F0C; margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 3; -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .b-side-card:hover .b-side-title { color: #1B5E20; }
      .b-side-meta {
        display: flex; align-items: center; gap: 7px;
        font-size: 11.5px; color: #6B7268;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
      }
      @media (max-width: 460px) {
        .b-side-card { grid-template-columns: 100px 1fr; gap: 12px; padding: 10px; }
      }

      .b-section-head {
        display: flex; align-items: center; gap: 14px;
        margin: 16px 0 28px;
      }
      .b-section-line {
        flex: 0 0 32px; height: 2px;
        background: linear-gradient(90deg, #C5A028, transparent);
      }
      .b-section-title {
        font-weight: 900;
        font-size: clamp(20px, 2vw, 26px);
        letter-spacing: -0.025em;
        margin: 0; color: #0A1F0C;
      }
      .b-section-count {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11.5px; color: #6B7268;
        margin-left: auto;
      }

      .b-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
      }
      .b-card {
        text-decoration: none; color: inherit;
        background: white;
        border: 1px solid rgba(10,31,12,.08);
        border-radius: 18px;
        overflow: hidden;
        display: flex; flex-direction: column;
        transition: border-color .2s, box-shadow .25s, transform .25s;
      }
      .b-card:hover {
        border-color: rgba(10,31,12,.16);
        box-shadow: 0 24px 44px -22px rgba(10,31,12,.20);
        transform: translateY(-4px);
      }
      .b-card .b-cover { border-radius: 0; }
      .b-card-body {
        padding: 18px 20px 20px;
        display: flex; flex-direction: column;
        flex: 1; gap: 10px;
      }
      .b-card-title {
        font-weight: 800; font-size: 17px;
        letter-spacing: -0.02em; line-height: 1.3;
        color: #0A1F0C; margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .b-card:hover .b-card-title { color: #1B5E20; }
      .b-card-excerpt {
        font-size: 13.5px; line-height: 1.55;
        color: #6B7268; margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .b-card-meta {
        display: flex; align-items: center; gap: 8px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11.5px; color: #94A3B8;
        margin-top: auto; padding-top: 6px;
      }
      .b-card-arrow {
        margin-left: auto; color: #1B5E20;
        transition: transform .25s;
      }
      .b-card:hover .b-card-arrow { transform: translateX(4px); }

      .b-dot {
        width: 3px; height: 3px; border-radius: 50%;
        background: currentColor; opacity: .5; flex-shrink: 0;
      }

      .b-loading {
        display: flex; align-items: center; justify-content: center;
        gap: 10px; padding: 100px 20px;
        color: #6B7268; font-size: 14px;
      }
      .b-loading svg { color: #1B5E20; }

      .b-empty {
        max-width: 480px; margin: 60px auto;
        padding: 44px 28px; text-align: center;
        background: white;
        border: 1px solid rgba(10,31,12,.08);
        border-radius: 22px;
        box-shadow: 0 12px 32px -16px rgba(10,31,12,.08);
      }
      .b-empty-icon {
        width: 60px; height: 60px;
        border-radius: 18px;
        background: linear-gradient(135deg, #FEF9E7, #F0FDF4);
        color: #1B5E20;
        display: grid; place-items: center;
        margin: 0 auto 22px;
      }
      .b-empty-icon-error {
        background: linear-gradient(135deg, #FEF2F2, #FFEFE6);
        color: #B91C1C;
        font-weight: 900; font-size: 26px;
      }
      .b-empty-title {
        font-size: clamp(20px, 2.4vw, 24px);
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #0A1F0C; margin: 0 0 10px;
      }
      .b-empty-sub {
        font-size: 14.5px; line-height: 1.55;
        color: #6B7268; margin: 0 0 22px;
      }
      .b-empty-cta {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 11px 20px; border-radius: 999px;
        background: #0A1F0C; color: white;
        font-size: 13.5px; font-weight: 700;
        text-decoration: none; border: 0; cursor: pointer;
        transition: background .15s, transform .15s;
        font-family: inherit;
      }
      .b-empty-cta:hover { background: #143818; transform: translateY(-1px); }

      .b-newsletter { max-width: 1140px; margin: 32px auto 96px; padding: 0 24px; }
      .b-news-card {
        position: relative;
        background:
          radial-gradient(60% 80% at 80% 0%, rgba(76,175,80,.18), transparent 60%),
          radial-gradient(50% 70% at 0% 100%, rgba(232,200,74,.14), transparent 60%),
          linear-gradient(135deg, #0A1F0C 0%, #143818 100%);
        border-radius: 24px;
        padding: 64px 32px;
        text-align: center;
        color: white;
        overflow: hidden;
        isolation: isolate;
      }
      .b-news-deco {
        position: absolute; inset: 0; z-index: 0;
        background-image:
          linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
        background-size: 32px 32px;
        mask-image: radial-gradient(60% 80% at 50% 0%, #000 0%, transparent 70%);
        -webkit-mask-image: radial-gradient(60% 80% at 50% 0%, #000 0%, transparent 70%);
        pointer-events: none;
      }
      .b-news-card > * { position: relative; z-index: 1; }
      .b-news-icon {
        width: 52px; height: 52px; border-radius: 14px;
        background: rgba(255,255,255,.08);
        color: #E8C84A;
        display: grid; place-items: center;
        margin: 0 auto 18px;
        border: 1px solid rgba(232,200,74,.22);
      }
      .b-news-title {
        font-weight: 900;
        font-size: clamp(24px, 2.8vw, 34px);
        letter-spacing: -0.03em;
        line-height: 1.15;
        margin: 0 0 12px;
      }
      .b-news-accent {
        background: linear-gradient(135deg, #E8C84A 0%, #C5A028 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-family: Georgia, serif;
        font-style: italic; font-weight: 400; font-size: .95em;
      }
      .b-news-sub {
        font-size: 15px;
        color: rgba(255,255,255,.70);
        margin: 0 0 28px;
      }
      .b-news-form {
        display: inline-flex; gap: 6px;
        background: rgba(255,255,255,.10);
        border: 1px solid rgba(255,255,255,.18);
        border-radius: 14px;
        padding: 6px;
        max-width: 480px; width: 100%;
        backdrop-filter: blur(10px);
      }
      .b-news-form input {
        flex: 1; border: 0; outline: 0; background: transparent;
        padding: 12px 16px;
        font-size: 14px; color: white;
        font-family: inherit;
      }
      .b-news-form input::placeholder { color: rgba(255,255,255,.5); }
      .b-news-form button {
        display: inline-flex; align-items: center; gap: 6px;
        background: #E8C84A; color: #0A1F0C;
        font-weight: 800; font-size: 13.5px;
        padding: 12px 20px; border-radius: 10px;
        border: 0; cursor: pointer;
        transition: background .15s, transform .15s;
        font-family: inherit;
      }
      .b-news-form button:hover { background: #F2D55C; transform: translateY(-1px); }
      @media (max-width: 540px) {
        .b-news-form { flex-direction: column; padding: 8px; border-radius: 16px; }
        .b-news-form button { justify-content: center; padding: 14px; }
      }

      [data-reveal] {
        opacity: 0; transform: translateY(14px);
        transition: opacity .6s cubic-bezier(.2,.7,.2,1), transform .6s cubic-bezier(.2,.7,.2,1);
      }
      [data-reveal].b-revealed { opacity: 1; transform: none; }

      @media (prefers-reduced-motion: reduce) {
        [data-reveal] { opacity: 1; transform: none; transition: none; }
        .b-card:hover, .b-feat:hover, .b-side-card:hover, .b-empty-cta:hover, .b-news-form button:hover { transform: none; }
        .b-feat:hover .b-cov-svg, .b-feat:hover .b-cov-img { transform: none; }
        .b-cov-svg, .b-cov-img { transition: none; }
        .b-kicker-dot { animation: none; }
      }
    `}</style>
  );
}
