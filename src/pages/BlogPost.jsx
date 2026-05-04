import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft, ArrowRight, Calendar, Clock, Loader2,
  AlertCircle, Sparkles, Share2, Check,
} from "lucide-react";

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "";

const readTime = (content) => {
  if (!content) return "1 min";
  const words = content.split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 220))} min`;
};

const makeExcerpt = (content, len = 220) => {
  if (!content) return "";
  const clean = content
    .replace(/^#{1,6}\s+/gm, "").replace(/[*_>`]/g, "").replace(/\n+/g, " ").trim();
  if (clean.length <= len) return clean;
  return clean.slice(0, len).replace(/\s+\S*$/, "") + "…";
};

function guessCategory(post) {
  const text = `${post?.title || ""}`.toLowerCase();
  if (/guide|comment\b/.test(text))             return { id: "guide",       label: "Guide",       hue: 145 };
  if (/conseil|astuce|tip\b/.test(text))        return { id: "conseil",     label: "Conseils",    hue: 175 };
  if (/comparatif|test|review|vs\b/.test(text)) return { id: "comparatif",  label: "Comparatif",  hue: 38  };
  if (/actu|news|annonce/.test(text))           return { id: "actu",        label: "Actualités",  hue: 268 };
  if (/entretien|nettoy|réparer/.test(text))    return { id: "entretien",   label: "Entretien",   hue: 200 };
  return                                              { id: "general",     label: "À lire",      hue: 110 };
}

// ────── SVG covers (fallback si pas d'image_url) ──────
const COVER_PATTERNS = [
  ({ id, c1, c2 }) => (
    <svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" className="bp-cov-svg" aria-hidden>
      <defs><linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient></defs>
      <rect width="600" height="380" fill={`url(#g-${id})`} />
      <g stroke="rgba(255,255,255,.18)" strokeWidth="1.5" fill="none">
        <path d="M-50 180 Q150 140 300 180 T 700 180" /><path d="M-50 220 Q150 180 300 220 T 700 220" />
        <path d="M-50 260 Q150 220 300 260 T 700 260" /><path d="M-50 300 Q150 260 300 300 T 700 300" />
      </g>
      <circle cx="500" cy="100" r="60" fill="rgba(255,255,255,.06)" /><circle cx="80" cy="60" r="30" fill="rgba(255,255,255,.08)" />
    </svg>
  ),
  ({ id, c1, c2 }) => (
    <svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" className="bp-cov-svg" aria-hidden>
      <defs><linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient></defs>
      <rect width="600" height="380" fill={`url(#g-${id})`} />
      <ellipse cx="300" cy="350" rx="280" ry="40" fill="rgba(0,0,0,.18)" />
      <line x1="430" y1="80" x2="430" y2="350" stroke="rgba(255,255,255,.85)" strokeWidth="3" />
      <path d="M430 80 L 540 105 L 430 130 Z" fill="rgba(255,255,255,.92)" />
      <text x="445" y="112" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill="#1B5E20">SM</text>
      <circle cx="160" cy="320" r="14" fill="rgba(255,255,255,.95)" />
    </svg>
  ),
  ({ id, c1, c2 }) => (
    <svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" className="bp-cov-svg" aria-hidden>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient>
        <radialGradient id={`b-${id}`} cx="35%" cy="35%"><stop offset="0%" stopColor="rgba(255,255,255,1)" /><stop offset="100%" stopColor="rgba(220,220,220,.95)" /></radialGradient>
      </defs>
      <rect width="600" height="380" fill={`url(#g-${id})`} />
      {[[120,90,36],[430,70,28],[200,220,42],[490,200,32],[80,320,26],[340,320,38],[560,330,22],[310,130,22]].map(([cx,cy,r],i)=>(
        <g key={i} transform={`translate(${cx} ${cy})`}><circle r={r} fill={`url(#b-${id})`}/><circle r={r*0.15} cx={-r*0.3} cy={-r*0.3} fill="rgba(0,0,0,.06)"/><circle r={r*0.12} cx={r*0.2} cy={-r*0.1} fill="rgba(0,0,0,.05)"/></g>
      ))}
    </svg>
  ),
  ({ id, c1, c2 }) => (
    <svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" className="bp-cov-svg" aria-hidden>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient>
        <pattern id={`p-${id}`} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1"/></pattern>
      </defs>
      <rect width="600" height="380" fill={`url(#g-${id})`} /><rect width="600" height="380" fill={`url(#p-${id})`} />
      <g transform="translate(300 190)"><circle r="130" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="1.5"/><circle r="90" fill="none" stroke="rgba(255,255,255,.20)" strokeWidth="1.5"/><circle r="55" fill="none" stroke="rgba(255,255,255,.30)" strokeWidth="1.5"/><circle r="22" fill="rgba(255,255,255,.85)"/></g>
    </svg>
  ),
  ({ id, c1, c2 }) => (
    <svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" className="bp-cov-svg" aria-hidden>
      <defs><linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient></defs>
      <rect width="600" height="380" fill={`url(#g-${id})`} />
      <path d="M0 280 Q 150 220 300 280 T 600 280 V 380 H 0 Z" fill="rgba(255,255,255,.10)" />
      <path d="M0 320 Q 150 270 300 320 T 600 320 V 380 H 0 Z" fill="rgba(255,255,255,.14)" />
      <path d="M0 350 Q 150 320 300 350 T 600 350 V 380 H 0 Z" fill="rgba(0,0,0,.10)" />
      <circle cx="490" cy="90" r="50" fill="rgba(255,255,255,.18)" />
    </svg>
  ),
  ({ id, c1, c2 }) => (
    <svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" className="bp-cov-svg" aria-hidden>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient>
        <pattern id={`d-${id}`} width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.5" fill="rgba(255,255,255,.12)"/></pattern>
      </defs>
      <rect width="600" height="380" fill={`url(#g-${id})`} /><rect width="600" height="380" fill={`url(#d-${id})`} />
      <g transform="translate(420 110) rotate(28)" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.45)" strokeWidth="1.2">
        <rect x="-3" y="0" width="6" height="180" rx="2"/>
        <path d="M -45 180 Q -50 220 -10 230 L 50 230 Q 60 220 50 200 L 5 195 Z"/>
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

function CoverArt({ post, sizeKey = "hero" }) {
  if (post.image_url) {
    return (
      <div className={`bp-cover-wrap bp-cw-${sizeKey}`}>
        <img src={post.image_url} alt="" className="bp-cov-img" />
      </div>
    );
  }
  const idx = hashIndex(post.id || post.title, COVER_PATTERNS.length);
  const palIdx = hashIndex((post.id || post.title) + "p", PALETTES.length);
  const [c1, c2] = PALETTES[palIdx];
  const Pattern = COVER_PATTERNS[idx];
  return (
    <div className={`bp-cover-wrap bp-cw-${sizeKey}`}>
      <Pattern id={`${post.id || idx}-${sizeKey}`} c1={c1} c2={c2} />
    </div>
  );
}

// ────── Render markdown-like content ──────
function renderContent(text) {
  if (!text) return null;
  const blocks = text.split(/\n\n+/);
  return blocks.map((b, i) => {
    const trimmed = b.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("## ")) return <h2 key={i} className="bp-h2">{trimmed.replace(/^## /, "")}</h2>;
    if (trimmed.startsWith("# "))  return <h1 key={i} className="bp-h1">{trimmed.replace(/^# /, "")}</h1>;
    if (trimmed.startsWith("> "))  return <blockquote key={i} className="bp-quote">{trimmed.replace(/^> /, "")}</blockquote>;
    if (/^[-•] /.test(trimmed)) {
      const items = trimmed.split("\n").map((l) => l.replace(/^[-•]\s*/, ""));
      return <ul key={i} className="bp-list">{items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ul>;
    }
    return <p key={i} className="bp-p">{renderInline(trimmed)}</p>;
  });
}

// Inline : **gras** *italique*
function renderInline(text) {
  const parts = [];
  let last = 0;
  const re = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  let m;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2]) parts.push(<strong key={key++}>{m[2]}</strong>);
    else if (m[4]) parts.push(<em key={key++}>{m[4]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────
export default function BlogPost() {
  const [params] = useSearchParams();
  const id = params.get("id");

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPost(null);

    if (!id) { setLoading(false); return; }

    supabase
      .from("blog_posts")
      .select("id, title, content, image_url, status, created_at")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (cancelled) return;
        if (error) console.error("[BlogPost]", error);
        setPost(data || null);
        setLoading(false);

        if (data?.id) {
          const { data: rest } = await supabase
            .from("blog_posts")
            .select("id, title, content, image_url, created_at")
            .eq("status", "published")
            .neq("id", data.id)
            .order("created_at", { ascending: false })
            .limit(3);
          if (!cancelled) setRelated(rest || []);
        }
      });

    return () => { cancelled = true; };
  }, [id]);

  const share = async () => {
    const url = window.location.href;
    const title = post?.title || "SwingMarket Blog";
    if (navigator.share) {
      try { await navigator.share({ title, url }); return; } catch { /* annulé */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  if (loading) {
    return (
      <>
        <Style />
        <main className="bp-main bp-loading">
          <Loader2 className="w-7 h-7 animate-spin" />
          <span>Chargement de l'article…</span>
        </main>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Style />
        <main className="bp-main">
          <div className="bp-empty">
            <div className="bp-empty-icon"><AlertCircle className="w-7 h-7" /></div>
            <h1 className="bp-empty-title">Article introuvable</h1>
            <p className="bp-empty-sub">Cet article n'existe plus ou n'a pas encore été publié.</p>
            <Link to="/Blog" className="bp-empty-cta">
              <ArrowLeft className="w-4 h-4" /> Retour au blog
            </Link>
          </div>
        </main>
      </>
    );
  }

  const cat = guessCategory(post);
  const excerpt = makeExcerpt(post.content, 240);

  return (
    <>
      <Style />

      <div className="bp-progress" aria-hidden>
        <div className="bp-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <main className="bp-main">
        <section className="bp-hero">
          <CoverArt post={post} sizeKey="hero" />
          <div className="bp-hero-grad" aria-hidden />
          <div className="bp-hero-content">
            <div className="bp-back">
              <Link to="/Blog">
                <ArrowLeft className="w-3.5 h-3.5" /> Retour au journal
              </Link>
            </div>

            <span className="bp-tag" style={{
              background: `hsla(${cat.hue}, 70%, 55%, .18)`,
              color: `hsl(${cat.hue} 80% 80%)`,
              borderColor: `hsla(${cat.hue}, 70%, 60%, .35)`,
            }}>
              {cat.label}
            </span>

            <h1 className="bp-title">{post.title}</h1>

            {excerpt && <p className="bp-excerpt">{excerpt}</p>}

            <div className="bp-byline">
              <span><Calendar className="w-3.5 h-3.5" /> {fmtDate(post.created_at)}</span>
              <span className="bp-sep">·</span>
              <span><Clock className="w-3.5 h-3.5" /> {readTime(post.content)} de lecture</span>
              <span className="bp-sep">·</span>
              <button onClick={share} className="bp-share-btn">
                {copied
                  ? (<><Check className="w-3.5 h-3.5" /> Lien copié</>)
                  : (<><Share2 className="w-3.5 h-3.5" /> Partager</>)
                }
              </button>
            </div>
          </div>
        </section>

        <article className="bp-article">
          <div className="bp-body">
            {renderContent(post.content)}
          </div>

          <section className="bp-cta">
            <div className="bp-cta-card">
              <div className="bp-cta-deco" aria-hidden />
              <Sparkles className="bp-cta-spark w-5 h-5" />
              <h3 className="bp-cta-title">
                Trouvez votre prochain club <span className="bp-cta-accent">sur SwingMarket</span>
              </h3>
              <p className="bp-cta-sub">
                Marketplace 100 % golf · paiement sécurisé · vendeurs vérifiés.
              </p>
              <Link to="/Marketplace" className="bp-cta-btn">
                Découvrir les annonces <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {related.length > 0 && (
            <section className="bp-related">
              <div className="bp-related-head">
                <span className="bp-related-line" />
                <h2 className="bp-related-title">À lire aussi</h2>
              </div>
              <div className="bp-related-grid">
                {related.map((r) => {
                  const rcat = guessCategory(r);
                  return (
                    <Link key={r.id} to={`/BlogPost?id=${r.id}`} className="bp-related-card">
                      <CoverArt post={r} sizeKey="related" />
                      <div className="bp-related-body">
                        <span className="bp-tag bp-tag-sm" style={{ color: `hsl(${rcat.hue} 55% 28%)`, background: `hsl(${rcat.hue} 70% 94%)` }}>
                          {rcat.label}
                        </span>
                        <h3 className="bp-related-name">{r.title}</h3>
                        <div className="bp-related-meta">
                          <span>{fmtDate(r.created_at)}</span>
                          <span className="bp-related-dot" />
                          <span>{readTime(r.content)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <div className="bp-footer-back">
            <Link to="/Blog">
              <ArrowLeft className="w-4 h-4" /> Retour au journal
            </Link>
          </div>
        </article>
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
      .bp-main {
        background: #FAF8F3;
        color: #0A1F0C;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        min-height: 100vh;
      }

      .bp-progress {
        position: fixed; top: 0; left: 0; right: 0;
        height: 3px;
        background: rgba(10,31,12,.06);
        z-index: 50;
      }
      .bp-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #1B5E20, #C5A028);
        transition: width .15s linear;
      }

      .bp-loading {
        display: flex; align-items: center; justify-content: center;
        gap: 12px; padding: 140px 20px;
        color: #6B7268; font-size: 14px;
      }
      .bp-loading svg { color: #1B5E20; }

      .bp-cover-wrap { position: relative; overflow: hidden; }
      .bp-cov-svg, .bp-cov-img {
        position: absolute; inset: 0;
        width: 100%; height: 100%; display: block;
        object-fit: cover;
      }
      .bp-cw-hero { position: absolute; inset: 0; }

      .bp-hero {
        position: relative;
        min-height: clamp(380px, 56vh, 580px);
        overflow: hidden;
        isolation: isolate;
      }
      .bp-hero-grad {
        position: absolute; inset: 0; z-index: 1;
        background: linear-gradient(180deg, rgba(0,0,0,.20) 0%, rgba(10,31,12,.45) 60%, rgba(10,31,12,.95) 100%);
        pointer-events: none;
      }
      .bp-hero-content {
        position: relative; z-index: 2;
        max-width: 820px; margin: 0 auto;
        padding: 56px 28px 44px;
        min-height: clamp(380px, 56vh, 580px);
        display: flex; flex-direction: column; justify-content: flex-end;
        color: white;
      }
      .bp-back { position: absolute; top: 28px; left: 28px; }
      .bp-back a {
        display: inline-flex; align-items: center; gap: 6px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11.5px;
        letter-spacing: .14em; text-transform: uppercase;
        color: rgba(255,255,255,.75);
        text-decoration: none;
        padding: 8px 14px;
        background: rgba(255,255,255,.08);
        border: 1px solid rgba(255,255,255,.16);
        border-radius: 999px;
        backdrop-filter: blur(10px);
        transition: background .2s, color .2s;
      }
      .bp-back a:hover { background: rgba(255,255,255,.16); color: white; }

      .bp-tag {
        display: inline-block;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10.5px; font-weight: 700;
        padding: 5px 12px; border-radius: 999px;
        letter-spacing: .14em; text-transform: uppercase;
        border: 1px solid transparent;
        backdrop-filter: blur(8px);
        margin-bottom: 14px;
        align-self: flex-start;
      }
      .bp-tag-sm { font-size: 10px; padding: 3px 10px; }

      .bp-title {
        font-weight: 900;
        font-size: clamp(30px, 5vw, 60px);
        line-height: 1.06;
        letter-spacing: -0.04em;
        color: white;
        margin: 0 0 18px;
        max-width: 720px;
        text-shadow: 0 2px 30px rgba(0,0,0,.25);
      }
      .bp-excerpt {
        font-family: Georgia, 'Times New Roman', serif;
        font-style: italic;
        font-size: clamp(15px, 1.5vw, 19px);
        line-height: 1.55;
        color: rgba(255,255,255,.82);
        margin: 0 0 26px;
        max-width: 640px;
      }
      .bp-byline {
        display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11.5px;
        letter-spacing: .08em;
        color: rgba(255,255,255,.70);
      }
      .bp-byline > span { display: inline-flex; align-items: center; gap: 6px; }
      .bp-sep { color: #E8C84A; opacity: .6; }

      .bp-share-btn {
        display: inline-flex; align-items: center; gap: 6px;
        font-family: inherit; font-size: 11.5px;
        letter-spacing: .08em;
        background: rgba(255,255,255,.08);
        border: 1px solid rgba(255,255,255,.16);
        color: rgba(255,255,255,.85);
        border-radius: 999px;
        padding: 6px 12px;
        cursor: pointer;
        transition: background .2s, color .2s, transform .15s;
      }
      .bp-share-btn:hover {
        background: rgba(255,255,255,.16);
        color: white;
        transform: translateY(-1px);
      }

      .bp-article { max-width: 760px; margin: 0 auto; padding: 56px 28px 80px; }
      .bp-body {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 18px; line-height: 1.8;
        color: #2A2F2C;
      }
      .bp-body > * { margin-bottom: 1.3em; }
      .bp-body > *:last-child { margin-bottom: 0; }
      .bp-body > p:first-of-type::first-letter {
        font-family: Georgia, serif;
        font-weight: 700;
        font-size: 3.4em;
        line-height: .9;
        float: left;
        padding: .12em .12em 0 0;
        color: #1B5E20;
      }
      .bp-h1 {
        font-family: 'Inter', sans-serif;
        font-weight: 900; font-size: 32px;
        letter-spacing: -0.03em; line-height: 1.15;
        color: #0A1F0C; margin: 1.6em 0 .6em;
      }
      .bp-h2 {
        font-family: 'Inter', sans-serif;
        font-weight: 800; font-size: 24px;
        letter-spacing: -0.02em; line-height: 1.25;
        color: #0A1F0C; margin: 1.8em 0 .6em;
        padding-left: 18px;
        border-left: 4px solid #1B5E20;
      }
      .bp-p { margin: 0 0 1.3em; }
      .bp-list { margin: 0 0 1.3em; padding-left: 24px; }
      .bp-list li { margin-bottom: .6em; line-height: 1.7; }
      .bp-list li::marker { color: #C5A028; }
      .bp-quote {
        margin: 1.6em 0;
        padding: 18px 22px 18px 28px;
        background: linear-gradient(135deg, rgba(197,160,40,.10), rgba(76,175,80,.06));
        border-left: 4px solid #C5A028;
        border-radius: 0 14px 14px 0;
        font-style: italic;
        color: #4A5450;
      }
      .bp-body strong { color: #0A1F0C; font-weight: 700; }
      .bp-body em { font-style: italic; color: #4A5450; }

      .bp-cta { margin: 64px 0 56px; }
      .bp-cta-card {
        position: relative;
        background:
          radial-gradient(60% 80% at 80% 0%, rgba(76,175,80,.18), transparent 60%),
          radial-gradient(50% 70% at 0% 100%, rgba(232,200,74,.14), transparent 60%),
          linear-gradient(135deg, #0A1F0C 0%, #143818 100%);
        border-radius: 24px;
        padding: 48px 32px;
        text-align: center;
        color: white;
        overflow: hidden;
        isolation: isolate;
      }
      .bp-cta-deco {
        position: absolute; inset: 0; z-index: 0;
        background-image:
          linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
        background-size: 32px 32px;
        mask-image: radial-gradient(60% 80% at 50% 0%, #000 0%, transparent 70%);
        -webkit-mask-image: radial-gradient(60% 80% at 50% 0%, #000 0%, transparent 70%);
        pointer-events: none;
      }
      .bp-cta-card > * { position: relative; z-index: 1; }
      .bp-cta-spark { color: #E8C84A; margin-bottom: 12px; }
      .bp-cta-title {
        font-weight: 900;
        font-size: clamp(22px, 2.6vw, 32px);
        letter-spacing: -0.025em; line-height: 1.18;
        margin: 0 0 12px;
      }
      .bp-cta-accent {
        background: linear-gradient(135deg, #E8C84A 0%, #C5A028 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-family: Georgia, serif; font-style: italic; font-weight: 400;
      }
      .bp-cta-sub {
        font-family: Georgia, serif;
        font-size: 15px; line-height: 1.6;
        color: rgba(255,255,255,.72);
        margin: 0 0 24px;
      }
      .bp-cta-btn {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 12px 24px;
        background: #E8C84A; color: #0A1F0C;
        font-weight: 800; font-size: 13.5px;
        text-decoration: none; border-radius: 999px;
        box-shadow: 0 16px 32px -10px rgba(197,160,40,.55);
        transition: transform .2s, box-shadow .2s, background .2s;
      }
      .bp-cta-btn:hover {
        transform: translateY(-2px);
        background: #F2D55C;
        box-shadow: 0 22px 40px -10px rgba(197,160,40,.7);
      }

      .bp-related { padding-top: 48px; border-top: 1px solid rgba(10,31,12,.10); }
      .bp-related-head {
        display: flex; align-items: center; gap: 14px;
        margin-bottom: 28px;
      }
      .bp-related-line {
        flex: 0 0 32px; height: 2px;
        background: linear-gradient(90deg, #C5A028, transparent);
      }
      .bp-related-title {
        font-weight: 900; font-size: 22px;
        letter-spacing: -0.025em;
        color: #0A1F0C; margin: 0;
      }
      .bp-related-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
      }
      .bp-related-card {
        text-decoration: none; color: inherit;
        background: white;
        border: 1px solid rgba(10,31,12,.08);
        border-radius: 16px;
        overflow: hidden;
        display: flex; flex-direction: column;
        transition: transform .25s, box-shadow .25s, border-color .2s;
      }
      .bp-related-card:hover {
        transform: translateY(-3px);
        border-color: rgba(10,31,12,.16);
        box-shadow: 0 18px 32px -16px rgba(10,31,12,.18);
      }
      .bp-cw-related { position: relative; aspect-ratio: 16 / 10; }
      .bp-related-body {
        padding: 14px 16px 16px;
        display: flex; flex-direction: column; gap: 8px; flex: 1;
      }
      .bp-related-name {
        font-weight: 800; font-size: 15px;
        letter-spacing: -0.015em;
        color: #0A1F0C; margin: 0; line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .bp-related-card:hover .bp-related-name { color: #1B5E20; }
      .bp-related-meta {
        display: flex; align-items: center; gap: 7px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10.5px;
        color: #6B7268;
        margin-top: auto;
      }
      .bp-related-dot {
        width: 3px; height: 3px; border-radius: 50%;
        background: currentColor; opacity: .5;
      }

      .bp-footer-back { margin-top: 48px; text-align: center; }
      .bp-footer-back a {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 14px; font-weight: 700;
        color: #1B5E20;
        text-decoration: none;
      }
      .bp-footer-back a:hover { text-decoration: underline; }

      .bp-empty {
        max-width: 480px; margin: 80px auto;
        text-align: center;
        background: white;
        border: 1px solid rgba(10,31,12,.08);
        border-radius: 22px;
        padding: 48px 32px;
        box-shadow: 0 12px 32px -16px rgba(10,31,12,.10);
      }
      .bp-empty-icon {
        width: 60px; height: 60px; border-radius: 18px;
        background: linear-gradient(135deg, #FEF2F2, #FFEFE6);
        color: #B91C1C;
        display: grid; place-items: center;
        margin: 0 auto 22px;
      }
      .bp-empty-title {
        font-weight: 800; font-size: 26px;
        color: #0A1F0C; margin: 0 0 12px;
        letter-spacing: -0.02em;
      }
      .bp-empty-sub {
        font-family: Georgia, serif;
        font-size: 14.5px; line-height: 1.6;
        color: #4A5450; margin: 0 0 24px;
      }
      .bp-empty-cta {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 12px 22px;
        background: #0A1F0C; color: #fff;
        font-weight: 700; font-size: 13.5px;
        text-decoration: none; border-radius: 999px;
        transition: background .2s, transform .15s;
      }
      .bp-empty-cta:hover { background: #143818; transform: translateY(-1px); }

      @media (prefers-reduced-motion: reduce) {
        .bp-related-card:hover, .bp-cta-btn:hover, .bp-empty-cta:hover, .bp-share-btn:hover { transform: none; }
        .bp-progress-bar { transition: none; }
      }
    `}</style>
  );
}
