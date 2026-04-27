import React, { useEffect, useRef, useState } from "react";

/**
 * Slogan SwingMarketGolf — typewriter cyclique tech/marketing.
 *
 * Les 3 phrases s'écrivent et s'effacent en boucle avec un curseur
 * clignotant. La phrase finale ("Entre passionnés.") s'affiche en
 * gradient or animé (shimmer) et reste un peu plus longtemps.
 *
 * Variants :
 *   - "compact" : navbar (xs, italique, monochrome → or)
 *   - "footer"  : footer (md, italique, blanc 78% → or)
 */
const PHRASES = [
  { text: "Le bon club.",       gold: false, hold: 1300 },
  { text: "Au bon prix.",       gold: false, hold: 1300 },
  { text: "Entre passionnés.",  gold: true,  hold: 2200 },
];

const TYPE_SPEED  = 55;   // ms/char en mode typing
const ERASE_SPEED = 28;   // ms/char en mode erasing

export default function Tagline({ variant = "compact", className = "" }) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState("typing"); // typing | holding | erasing
  const reduced = useRef(false);

  // Respect prefers-reduced-motion : on affiche statiquement la 3ème phrase
  // et on ne lance aucune animation.
  useEffect(() => {
    reduced.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false;
    if (reduced.current) {
      setPhraseIdx(2);
      setDisplayed(PHRASES[2].text);
      setPhase("holding");
    }
  }, []);

  // Boucle de typewriter
  useEffect(() => {
    if (reduced.current) return;
    const phrase = PHRASES[phraseIdx].text;
    let timer;
    if (phase === "typing") {
      if (displayed.length < phrase.length) {
        timer = setTimeout(
          () => setDisplayed(phrase.slice(0, displayed.length + 1)),
          TYPE_SPEED + Math.random() * 30, // micro-jitter humain
        );
      } else {
        timer = setTimeout(() => setPhase("holding"), 0);
      }
    } else if (phase === "holding") {
      timer = setTimeout(() => setPhase("erasing"), PHRASES[phraseIdx].hold);
    } else if (phase === "erasing") {
      if (displayed.length > 0) {
        timer = setTimeout(
          () => setDisplayed(displayed.slice(0, -1)),
          ERASE_SPEED,
        );
      } else {
        setPhraseIdx((i) => (i + 1) % PHRASES.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timer);
  }, [phase, displayed, phraseIdx]);

  // Pause quand l'onglet est en arrière-plan : économie CPU + reprise propre
  useEffect(() => {
    if (reduced.current) return;
    const onVis = () => {
      // Quand l'utilisateur revient, on relance proprement à la phrase suivante
      if (!document.hidden && phase === "erasing") {
        // pas d'action — le useEffect courant reprend tout seul
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [phase]);

  const isGold = PHRASES[phraseIdx].gold;
  const longest = PHRASES.reduce((m, p) => (p.text.length > m.length ? p.text : m), "");

  return (
    <>
      <TaglineStyles />
      <span
        className={`tagline tagline-${variant} ${className}`}
        aria-label="Le bon club. Au bon prix. Entre passionnés."
      >
        {/* Largeur réservée invisible pour empêcher le layout shift pendant la frappe */}
        <span className="tagline-ghost" aria-hidden>{longest}</span>

        {/* Texte qui se tape */}
        <span className={`tagline-text ${isGold ? "tagline-gold" : ""}`} aria-hidden>
          {displayed}
        </span>

        {/* Curseur clignotant */}
        <span className={`tagline-caret ${isGold ? "tagline-caret-gold" : ""}`} aria-hidden>|</span>
      </span>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────
function TaglineStyles() {
  return (
    <style>{`
      .tagline {
        position: relative;
        display: inline-flex;
        align-items: center;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-style: italic;
        font-weight: 500;
        white-space: nowrap;
        line-height: 1.1;
      }

      /* ── Variante navbar : compacte, monochrome → or ── */
      .tagline-compact {
        font-size: 11.5px;
        color: #6B7280;
        letter-spacing: -0.005em;
        margin-left: 6px;
        padding-left: 12px;
        border-left: 1px solid #E5E7EB;
        height: 18px;
      }
      .tagline-compact { display: none; }
      @media (min-width: 1024px) { .tagline-compact { display: inline-flex; } }

      /* ── Variante footer : large, sur fond sombre ── */
      .tagline-footer {
        font-size: 14px;
        color: rgba(255,255,255,0.78);
        letter-spacing: -0.01em;
        margin: 12px 0 14px;
        height: 22px;
      }

      /* Largeur invisible : occupe la place de la phrase la plus longue
         pour que le layout ne saute pas pendant la frappe. */
      .tagline-ghost {
        visibility: hidden;
        pointer-events: none;
        white-space: nowrap;
      }

      /* Texte qui se tape (positionné par-dessus le ghost) */
      .tagline-text {
        position: absolute;
        left: 12px; /* pour la variante compact, après le séparateur */
        top: 50%;
        transform: translateY(-50%);
        white-space: nowrap;
      }
      .tagline-footer .tagline-text {
        left: 0;
      }

      /* Accent or animé sur "Entre passionnés." */
      .tagline-gold {
        background: linear-gradient(110deg, #C5A028 0%, #E8C84A 35%, #D4AF37 60%, #C5A028 100%);
        background-size: 220% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        font-weight: 700;
        animation: tagline-shimmer 2.6s ease-in-out infinite;
      }
      @keyframes tagline-shimmer {
        0%, 100% { background-position: 0% 50%; }
        50%      { background-position: 100% 50%; }
      }

      /* Curseur clignotant — vrai look terminal */
      .tagline-caret {
        display: inline-block;
        margin-left: 2px;
        font-style: normal;
        font-weight: 400;
        color: #1B5E20;
        animation: tagline-blink 1s steps(2) infinite;
        position: relative;
        z-index: 1;
        transform: translateY(-1px);
      }
      .tagline-footer .tagline-caret { color: #7BD389; }
      .tagline-caret-gold { color: #E8C84A !important; }

      @keyframes tagline-blink {
        0%, 49.99% { opacity: 1; }
        50%, 100%  { opacity: 0; }
      }

      /* Glow doux sous le texte or — effet "mots qui rayonnent" */
      .tagline-gold::after {
        content: "";
      }
      .tagline-text.tagline-gold {
        filter: drop-shadow(0 0 8px rgba(232,200,74,0.18));
      }

      @media (prefers-reduced-motion: reduce) {
        .tagline-gold,
        .tagline-caret {
          animation: none !important;
        }
        .tagline-caret { opacity: 0.6; }
      }
    `}</style>
  );
}
