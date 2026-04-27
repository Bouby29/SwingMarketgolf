import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import {
  Search, CheckCircle2, ArrowRight, ArrowLeft, ArrowDown,
  Loader2, ShieldCheck, Bell, Zap,
} from "lucide-react";

const CATEGORIES = [
  "Clubs de golf", "Balles de golf", "Chariots", "Sacs de golf",
  "Accessoires", "Entraînement", "Vêtements",
];
const BUDGETS = [
  "< 100 €", "100 – 300 €", "300 – 500 €",
  "500 – 1 000 €", "1 000 – 2 000 €", "2 000 € +",
];

const PENDING_KEY = "pending_search_request";

// ═════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═════════════════════════════════════════════════════════
export default function SearchRequest() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category: "", title: "", description: "", budget: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Refs internes pour gérer le déclenchement de l'auto-submit
  // au retour de Login (sans dépendre du re-render).
  const autoSubmittingRef = useRef(false);

  // Toujours charger la page en haut (sur l'animation hero), peu importe
  // d'où on arrive (la home, le footer, etc.). React Router ne reset pas
  // le scroll par défaut.
  useEffect(() => {
    window.scrollTo(0, 0);
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };

  const validate = (data = form) => {
    const e = {};
    if (!data.category) e.category = "Choisissez une catégorie";
    if (!data.title || data.title.length < 3) e.title = "Décrivez ce que vous cherchez";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Insertion réelle en base, partagée entre submit manuel et auto-submit
  const publish = async (data) => {
    setLoading(true);
    setErrors({});
    const { error } = await supabase.from("search_requests").insert({
      user_id: user.id,
      title: data.title,
      category: data.category,
      description: data.description || null,
      budget: data.budget || null,
      status: "active",
    });
    setLoading(false);
    if (error) {
      console.error("search_requests insert error:", error);
      setErrors({ form: "Une erreur est survenue. Réessayez." });
      return false;
    }
    return true;
  };

  const handleSubmit = async (ev) => {
    ev?.preventDefault?.();
    if (!validate()) return;

    // Pas connecté → on sauve en sessionStorage et on redirige Login.
    if (!user) {
      try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(form)); } catch {}
      const next = encodeURIComponent("/SearchRequest");
      navigate(`/Login?next=${next}&action=publish_search`);
      return;
    }

    // Connecté → publication directe + redirect liste.
    const ok = await publish(form);
    if (ok) {
      try { sessionStorage.removeItem(PENDING_KEY); } catch {}
      navigate("/SearchRequestsList?published=1");
    }
  };

  // Au retour de Login : si action=publish_search ET utilisateur connecté
  // ET formulaire en attente → pré-remplit + auto-publie.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    if (action !== "publish_search" || !user || autoSubmittingRef.current) return;

    let pending;
    try {
      const raw = sessionStorage.getItem(PENDING_KEY);
      pending = raw ? JSON.parse(raw) : null;
    } catch { pending = null; }
    if (!pending) return;

    autoSubmittingRef.current = true;
    setForm(f => ({ ...f, ...pending }));

    if (!validate(pending)) {
      autoSubmittingRef.current = false;
      return;
    }
    const t = setTimeout(async () => {
      const ok = await publish(pending);
      if (ok) {
        try { sessionStorage.removeItem(PENDING_KEY); } catch {}
        navigate("/SearchRequestsList?published=1", { replace: true });
      } else {
        autoSubmittingRef.current = false;
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.search]);

  const progress = (() => {
    // Champs requis : category + title.  Optionnels : budget + description.
    let p = 0;
    if (form.category)   p += 35;
    if (form.title)      p += 35;
    if (form.budget)     p += 15;
    if (form.description) p += 15;
    return Math.min(100, p);
  })();

  const scrollToForm = (e) => {
    e?.preventDefault?.();
    document.getElementById("sr-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ────── Page principale ──────
  return (
    <>
      <SharedStyle />

      {/* ════════════════════════════════════════════════
           HERO IMMERSIF — full screen sombre
         ════════════════════════════════════════════════ */}
      <section className="sr-hero">
        <div className="sr-grid-bg" aria-hidden />
        <div className="sr-mesh"   aria-hidden />
        <div className="sr-orbits" aria-hidden>
          <div className="sr-o sr-o1"><span className="sr-pip" /></div>
          <div className="sr-o sr-o2"><span className="sr-pip" /></div>
          <div className="sr-o sr-o3"><span className="sr-pip" /></div>
        </div>

        <div className="sr-hero-grid">
          {/* LEFT — copy */}
          <div className="sr-hero-left">
            <span className="sr-pill">
              <span className="sr-pill-dot" />
              <span>Bourse aux recherches</span>
            </span>

            <h1 className="sr-h1">
              <span className="sr-w" style={{ "--i": 0 }}><span>Trouvez&nbsp;</span></span>
              <span className="sr-w" style={{ "--i": 1 }}><span>le&nbsp;</span></span>
              <span className="sr-w" style={{ "--i": 2 }}><span>matériel</span></span>
              <br />
              <span className="sr-w sr-grad-gold" style={{ "--i": 3 }}><span>qui&nbsp;</span></span>
              <span className="sr-w sr-grad-gold" style={{ "--i": 4 }}><span>vous&nbsp;</span></span>
              <span className="sr-w sr-grad-lime" style={{ "--i": 5 }}><span>correspond.</span></span>
            </h1>

            <p className="sr-lede">
              Décrivez votre matériel idéal en moins d'une minute.
              Notre communauté de vendeurs vérifiés vous propose
              <em> directement</em> ce qu'il vous faut.
            </p>

            <div className="sr-cta-row">
              <a href="#sr-form" onClick={scrollToForm} className="sr-cta-primary group">
                <Search className="w-4 h-4" />
                Poster ma recherche
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <Link to="/SearchRequestsList" className="sr-cta-ghost">
                Voir les recherches en cours
              </Link>
            </div>
          </div>

          {/* RIGHT — animation cinématographique */}
          <div className="sr-hero-right">
            <SwingStage />
          </div>
        </div>

        {/* Scroll hint */}
        <a href="#sr-form" onClick={scrollToForm} className="sr-scroll-hint">
          <span>Décrire ma recherche</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </a>
      </section>

      {/* ════════════════════════════════════════════════
           FORM SECTION — light, transition douce
         ════════════════════════════════════════════════ */}
      <section id="sr-form" className="sr-form-section">
        <div className="sr-form-bg" aria-hidden />

        <div className="sr-form-wrap">
          <div className="sr-form-head">
            <span className="sr-kicker">Étape unique · ~ 60 secondes</span>
            <h2 className="sr-form-title">Décrivez votre demande</h2>
            <p className="sr-form-sub">
              Plus c'est précis, plus les vendeurs concernés vous trouvent vite.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="sr-form-card">
            <div className="sr-progress">
              <div className="sr-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="sr-form-inner">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Catégorie" required error={errors.category}>
                  <SelectField
                    value={form.category}
                    onChange={(v) => setField("category", v)}
                    options={CATEGORIES}
                    placeholder="Choisir une catégorie"
                    invalid={!!errors.category}
                  />
                </Field>
                <Field label="Budget" hint="optionnel">
                  <SelectField
                    value={form.budget}
                    onChange={(v) => setField("budget", v)}
                    options={BUDGETS}
                    placeholder="Tous budgets"
                  />
                </Field>
              </div>

              <Field label="Ce que vous recherchez" required error={errors.title}>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="Ex : Driver TaylorMade SIM2 Max, fers Callaway Apex…"
                  className={inputClass(errors.title)}
                />
              </Field>

              <Field label="Détails" hint="optionnel">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="État souhaité, taille de shaft, marque préférée, droitier/gaucher…"
                  className={`${inputClass()} resize-none leading-relaxed`}
                />
              </Field>

              {/* Mention auth — l'utilisateur sera redirigé Login si non connecté */}
              {!user && (
                <div className="flex items-start gap-2.5 bg-[#F7FEF7] border border-[#1B5E20]/15 rounded-xl px-3.5 py-3 text-[13px] text-[#0F172A]">
                  <ShieldCheck className="w-4 h-4 text-[#1B5E20] shrink-0 mt-0.5" />
                  <span>
                    Pour publier votre recherche, nous vous demanderons de
                    <strong> vous connecter ou créer un compte</strong> juste
                    après — votre saisie est conservée.
                  </span>
                </div>
              )}

              {errors.form && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {errors.form}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="sr-submit group"
              >
                <span className={`inline-flex items-center gap-2 transition-all ${loading ? "opacity-0" : "opacity-100"}`}>
                  Publier ma recherche
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
                {loading && (
                  <span className="absolute inset-0 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Envoi…
                  </span>
                )}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Votre email reste privé · service gratuit · sans engagement
              </p>
            </div>

            <div className="sr-form-trust">
              {[
                { icon: ShieldCheck, label: "Vendeurs vérifiés" },
                { icon: Zap,         label: "Réponse en 24-48h" },
                { icon: Bell,        label: "Email direct" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center justify-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-[#1B5E20] shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

// ═════════════════════════════════════════════════════════
// SwingStage — animation cinématographique du design Landing
// Backswing → top hold → downswing → IMPACT (flash + dust + camera shake)
// → ball flight along quadratic path → trail draws (lime → gold)
// → target pin fades in → hit ring + "+248 yards" pop → loop.
// ═════════════════════════════════════════════════════════
function SwingStage() {
  const stageRef    = useRef(null);
  const ballRef     = useRef(null);
  const dimplesRef  = useRef(null);
  const shadowRef   = useRef(null);
  const clubRef     = useRef(null);
  const impactRef   = useRef(null);
  const dustRef     = useRef(null);
  const trajMainRef = useRef(null);
  const trajDashRef = useRef(null);
  const pathRef     = useRef(null);
  const hitRingRef  = useRef(null);
  const popRef      = useRef(null);
  const pinRef      = useRef(null);
  const distRef     = useRef(null);
  const speedRef    = useRef(null);
  const scopeRef    = useRef(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const path = pathRef.current;
    if (!path) return;
    const totalLen = path.getTotalLength();

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
    const easeInQuad   = (t) => t * t;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const T_BACK = 900, T_HOLD = 200, T_DOWN = 220, T_IMPACT = 80;
    const T_FOLLOW = 800, T_FLY = 1800, T_REST = 1600;

    let raf, visible = true;

    function reset() {
      const stage = stageRef.current;
      pinRef.current.style.transition = "opacity .8s";
      pinRef.current.style.opacity = "0";
      hitRingRef.current.style.opacity = "0";
      popRef.current.style.opacity = "0";
      impactRef.current.style.opacity = "0";
      dustRef.current.style.opacity = "0";
      ballRef.current.setAttribute("cx", 110); ballRef.current.setAttribute("cy", 478);
      shadowRef.current.setAttribute("cx", 110); shadowRef.current.setAttribute("cy", 490);
      shadowRef.current.setAttribute("r", 6); shadowRef.current.setAttribute("opacity", .5);
      dimplesRef.current.setAttribute("transform", "translate(0 0)");
      distRef.current.innerHTML = "0<small> yards</small>";
      speedRef.current.textContent = "SWING SPEED · 0 mph";
      scopeRef.current.style.opacity = 0;
      trajMainRef.current.setAttribute("stroke-dashoffset", 900);
      trajDashRef.current.setAttribute("stroke-dashoffset", 900);
      clubRef.current.setAttribute("transform", "translate(110 478) rotate(-150)");
      stage.style.transform = "";
    }

    function animate() {
      cancelAnimationFrame(raf);
      reset();
      const t0 = performance.now();

      function frame(now) {
        if (!visible) return;
        const t = now - t0;

        if (t < T_BACK) {
          const u = easeOutCubic(t / T_BACK);
          clubRef.current.setAttribute("transform", `translate(110 478) rotate(${-150 - 60 * u})`);
          speedRef.current.textContent = `SWING SPEED · ${Math.round(u * 78)} mph`;
        }
        else if (t < T_BACK + T_HOLD) {
          clubRef.current.setAttribute("transform", "translate(110 478) rotate(-210)");
          speedRef.current.textContent = "SWING SPEED · 78 mph";
        }
        else if (t < T_BACK + T_HOLD + T_DOWN) {
          const u = easeInQuad((t - T_BACK - T_HOLD) / T_DOWN);
          clubRef.current.setAttribute("transform", `translate(110 478) rotate(${-210 + 165 * u})`);
          speedRef.current.textContent = `SWING SPEED · ${Math.round(78 + u * 38)} mph`;
          scopeRef.current.style.opacity = u * 0.7;
        }
        else if (t < T_BACK + T_HOLD + T_DOWN + T_IMPACT) {
          impactRef.current.style.opacity = "1";
          dustRef.current.style.opacity = "1";
          scopeRef.current.style.opacity = 0.9;
          stageRef.current.style.transform =
            `translate(${(Math.random() - .5) * 2}px, ${(Math.random() - .5) * 2}px)`;
          speedRef.current.textContent = "SWING SPEED · 116 mph";
        }
        else if (t < T_BACK + T_HOLD + T_DOWN + T_IMPACT + Math.max(T_FOLLOW, T_FLY)) {
          stageRef.current.style.transform = "";
          const local = t - T_BACK - T_HOLD - T_DOWN - T_IMPACT;
          impactRef.current.style.opacity = Math.max(0, 1 - local / 200);
          dustRef.current.style.opacity   = Math.max(0, 1 - local / 400);

          if (local < T_FOLLOW) {
            const u = easeOutQuart(local / T_FOLLOW);
            clubRef.current.setAttribute("transform", `translate(110 478) rotate(${-45 + 135 * u})`);
          }
          if (local < T_FLY) {
            const u = easeOutCubic(local / T_FLY);
            const p = path.getPointAtLength(totalLen * u);
            ballRef.current.setAttribute("cx", p.x);
            ballRef.current.setAttribute("cy", p.y);
            dimplesRef.current.setAttribute("transform", `translate(${p.x - 110} ${p.y - 478})`);
            const heightAbove = Math.max(0, 480 - p.y);
            shadowRef.current.setAttribute("cx", p.x);
            shadowRef.current.setAttribute("cy", 490);
            shadowRef.current.setAttribute("r",  Math.max(2, 6 - heightAbove / 120));
            shadowRef.current.setAttribute("opacity", Math.max(.15, .5 - heightAbove / 400));
            const offset = 900 * (1 - u);
            trajMainRef.current.setAttribute("stroke-dashoffset", offset);
            trajDashRef.current.setAttribute("stroke-dashoffset", offset);
            distRef.current.innerHTML = `${Math.round(248 * u)}<small> yards</small>`;
            speedRef.current.textContent = `BALL SPEED · ${Math.round(168 - 50 * u)} mph`;
            pinRef.current.style.opacity = u > 0.4 ? Math.min(1, (u - 0.4) / 0.3) : 0;
            scopeRef.current.style.opacity = Math.max(0, .9 - u);
          } else {
            hitRingRef.current.style.opacity = "1";
            popRef.current.style.opacity = "1";
            pinRef.current.style.opacity = "1";
            distRef.current.innerHTML = "248<small> yards</small>";
            speedRef.current.textContent = "LANDED · 248 y · GREEN HIT";
          }
        }
        else if (t < T_BACK + T_HOLD + T_DOWN + T_IMPACT + Math.max(T_FOLLOW, T_FLY) + T_REST) { /* hold */ }
        else { animate(); return; }

        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
    }

    const onVis = () => {
      visible = !document.hidden;
      if (!visible) cancelAnimationFrame(raf); else animate();
    };
    document.addEventListener("visibilitychange", onVis);
    const start = setTimeout(animate, 1100);

    return () => {
      clearTimeout(start);
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="sr-stage-wrap" aria-hidden>
      <div ref={stageRef} className="sr-stage">
        <div className="sr-stage-chrome">
          <span className="sr-stage-live"><span className="sr-stage-livedot" />live · driving range</span>
          <span>tee · 01</span>
        </div>

        <div ref={scopeRef} className="sr-stage-scope" />

        <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice"
             style={{ display: "block", width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="sw-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F1418" /><stop offset="100%" stopColor="#06080A" />
            </linearGradient>
            <linearGradient id="sw-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B5E20" /><stop offset="100%" stopColor="#0A1F0C" />
            </linearGradient>
            <radialGradient id="sw-ball" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="70%" stopColor="#E8E3D6" />
              <stop offset="100%" stopColor="#A09C8E" />
            </radialGradient>
            <linearGradient id="sw-shaft" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E5E3DD" /><stop offset="100%" stopColor="#7A828C" />
            </linearGradient>
            <linearGradient id="sw-head" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#D4AF37" /><stop offset="50%" stopColor="#C5A028" /><stop offset="100%" stopColor="#8B6F1A" />
            </linearGradient>
            <linearGradient id="sw-trail" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#7BD389" stopOpacity="0" />
              <stop offset="40%"  stopColor="#7BD389" stopOpacity=".4" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity=".9" />
            </linearGradient>
            <filter id="sw-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <path ref={pathRef} id="sw-path" d="M 110 480 Q 280 60, 540 200" fill="none" />
          </defs>

          <rect width="600" height="600" fill="url(#sw-sky)" />
          <ellipse cx="300" cy="580" rx="500" ry="120" fill="url(#sw-ground)" opacity=".85" />
          <ellipse cx="300" cy="540" rx="380" ry="60" fill="#0A1F0C" opacity=".5" />

          <g stroke="rgba(123,211,137,.18)" strokeWidth="1">
            <line x1="120" y1="500" x2="480" y2="500" />
            <line x1="170" y1="470" x2="430" y2="470" />
            <line x1="210" y1="440" x2="390" y2="440" />
          </g>
          <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#4B535C" letterSpacing="2">
            <text x="120" y="495" textAnchor="end">100y</text>
            <text x="170" y="465" textAnchor="end">150y</text>
            <text x="210" y="435" textAnchor="end">200y</text>
          </g>

          <g ref={pinRef} opacity="0">
            <line x1="540" y1="200" x2="540" y2="270" stroke="#7A828C" strokeWidth="1.5" />
            <path d="M 540 200 L 564 207 L 540 214 Z" fill="#D4AF37" />
            <circle cx="540" cy="270" r="3" fill="#1B5E20" />
            <ellipse cx="540" cy="272" rx="10" ry="2" fill="#0A1F0C" opacity=".6" />
          </g>

          <path ref={trajDashRef} d="M 110 480 Q 280 60, 540 200" fill="none"
                stroke="rgba(123,211,137,.25)" strokeWidth="1.2"
                strokeDasharray="2 5" strokeDashoffset="900" pathLength="900" />
          <path ref={trajMainRef} d="M 110 480 Q 280 60, 540 200" fill="none"
                stroke="url(#sw-trail)" strokeWidth="2.4" strokeLinecap="round"
                strokeDasharray="900" strokeDashoffset="900" filter="url(#sw-glow)" />

          <g transform="translate(110 482)">
            <ellipse cx="0" cy="6" rx="22" ry="3" fill="#0A1F0C" opacity=".6" />
            <line x1="0" y1="0" x2="0" y2="14" stroke="#C5A028" strokeWidth="2" />
            <g stroke="#4CAF50" strokeWidth="1" opacity=".7">
              <line x1="-18" y1="6" x2="-18" y2="-2" />
              <line x1="-12" y1="6" x2="-13" y2="-1" />
              <line x1="-6"  y1="6" x2="-7"  y2="0" />
              <line x1="14"  y1="6" x2="13"  y2="-1" />
              <line x1="20"  y1="6" x2="20"  y2="-2" />
            </g>
          </g>

          <g>
            <circle ref={shadowRef} cx="110" cy="490" r="6" fill="#000" opacity=".5" />
            <circle ref={ballRef}   cx="110" cy="478" r="7" fill="url(#sw-ball)" filter="url(#sw-glow)" />
            <g ref={dimplesRef} fill="#7A828C" opacity=".25">
              <circle cx="108" cy="476" r="0.7" />
              <circle cx="112" cy="478" r="0.7" />
              <circle cx="110" cy="480" r="0.7" />
            </g>
          </g>

          <g ref={impactRef} opacity="0">
            <circle cx="110" cy="478" r="14" fill="none" stroke="#E8C84A" strokeWidth="2" />
            <circle cx="110" cy="478" r="22" fill="none" stroke="#7BD389" strokeWidth="1.4" opacity=".7" />
            <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
              <line x1="92"  y1="478" x2="80"  y2="478" />
              <line x1="118" y1="468" x2="128" y2="462" />
              <line x1="118" y1="488" x2="128" y2="494" />
              <line x1="100" y1="466" x2="92"  y2="458" />
            </g>
          </g>

          <g ref={clubRef} transform="translate(110 478) rotate(-150)">
            <line x1="0" y1="0" x2="0" y2="-160" stroke="url(#sw-shaft)" strokeWidth="3" strokeLinecap="round" />
            <rect x="-3.5" y="-160" width="7" height="34" rx="3" fill="#0E0E0C" />
            <g>
              <path d="M -2 0 L 22 6 L 26 -2 L 22 -10 L -2 -6 Z" fill="url(#sw-head)" stroke="#8B6F1A" strokeWidth=".8" />
              <line x1="6"  y1="-3" x2="6"  y2="3" stroke="#0E0E0C" strokeWidth=".6" opacity=".5" />
              <line x1="11" y1="-4" x2="11" y2="4" stroke="#0E0E0C" strokeWidth=".6" opacity=".5" />
              <line x1="16" y1="-4" x2="16" y2="4" stroke="#0E0E0C" strokeWidth=".6" opacity=".5" />
            </g>
          </g>

          <g ref={dustRef} opacity="0">
            <circle cx="100" cy="490" r="2"   fill="#9aebab" />
            <circle cx="115" cy="494" r="1.5" fill="#7BD389" />
            <circle cx="125" cy="488" r="2.5" fill="#D4AF37" />
            <circle cx="92"  cy="492" r="1.6" fill="#fff" opacity=".7" />
          </g>

          <g ref={hitRingRef} transform="translate(540 200)" opacity="0">
            <circle r="6"  fill="none" stroke="#7BD389" strokeWidth="2" />
            <circle r="14" fill="none" stroke="#D4AF37" strokeWidth="1.4" opacity=".7" />
            <circle r="22" fill="none" stroke="#7BD389" strokeWidth="1"   opacity=".4" />
          </g>

          <g ref={popRef} transform="translate(540 178)" opacity="0">
            <rect x="-44" y="-18" width="88" height="22" rx="6" fill="#0E0E0C" stroke="#7BD389" strokeWidth="1" />
            <text x="0" y="-3" textAnchor="middle" fontFamily="JetBrains Mono, monospace"
                  fontSize="11" fontWeight="600" fill="#7BD389" letterSpacing="1">+248 YARDS</text>
          </g>
        </svg>

        <div className="sr-stage-readout">
          <span className="sr-stage-k">DRIVE · CARRY</span>
          <span ref={distRef} className="sr-stage-v">
            0<small> yards</small>
          </span>
          <span ref={speedRef} className="sr-stage-meta">SWING SPEED · 0 mph</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Atomes du formulaire
// ─────────────────────────────────────────────────────────
function Field({ label, hint, required, error, children }) {
  return (
    <label className="block group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12.5px] font-semibold text-gray-700 tracking-tight">
          {label}{required && <span className="text-[#1B5E20] ml-0.5">*</span>}
        </span>
        {hint && !error && <span className="text-[11px] text-gray-400">{hint}</span>}
      </div>
      {children}
      <span className={`block text-[11px] text-red-500 mt-1 transition-all duration-200 ${
        error ? "opacity-100 translate-y-0 max-h-6" : "opacity-0 -translate-y-1 max-h-0 overflow-hidden"
      }`}>{error || " "}</span>
    </label>
  );
}

function SelectField({ value, onChange, options, placeholder, invalid }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className={`${inputClass(invalid)} appearance-none pr-10 cursor-pointer`}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
           viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function inputClass(invalid) {
  return [
    "w-full h-11 px-3.5 text-[14px] text-[#0F172A] bg-white",
    "border rounded-xl transition-all duration-150 outline-none",
    "placeholder:text-gray-400",
    invalid
      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
      : "border-gray-200 hover:border-gray-300 focus:border-[#1B5E20] focus:ring-4 focus:ring-[#1B5E20]/10",
  ].join(" ");
}

// ═════════════════════════════════════════════════════════
// STYLES partagés
// ═════════════════════════════════════════════════════════
function SharedStyle() {
  return (
    <style>{`
      /* ───── Animations utilitaires (confirmation) ───── */
      @keyframes sr-fade-up { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
      .sr-fade-up { animation: sr-fade-up .55s cubic-bezier(.4,0,.2,1) both; }
      @keyframes sr-pop { 0%{transform:scale(.4);opacity:0} 60%{transform:scale(1.08);opacity:1} 100%{transform:scale(1)} }
      .sr-pop { animation: sr-pop .55s cubic-bezier(.34,1.56,.64,1) both; }
      @keyframes sr-pulse-ring { 0%{transform:scale(.85);opacity:.5} 100%{transform:scale(1.6);opacity:0} }
      .sr-pulse-ring { animation: sr-pulse-ring 1.6s cubic-bezier(.4,0,.2,1) infinite; }

      /* ═══════ HERO IMMERSIF ═══════ */
      .sr-hero {
        position: relative;
        min-height: 100vh;
        padding: 88px 32px 48px;
        background: radial-gradient(120% 80% at 80% -10%, rgba(197,160,40,.12), transparent 55%),
                    radial-gradient(100% 80% at 0% 100%, rgba(76,175,80,.10), transparent 55%),
                    linear-gradient(180deg, #0A1F0C 0%, #061309 100%);
        color: #E5E7EB;
        overflow: hidden;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        isolation: isolate;
      }

      /* Grid background subtle */
      .sr-grid-bg {
        position: absolute; inset: 0; pointer-events: none; z-index: 0;
        background-image:
          linear-gradient(rgba(123,211,137,.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(123,211,137,.04) 1px, transparent 1px);
        background-size: 56px 56px;
        mask-image: radial-gradient(ellipse 80% 80% at 50% 30%, black 30%, transparent 90%);
        -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 30%, black 30%, transparent 90%);
      }
      .sr-mesh {
        position: absolute; inset: -40% -10% auto -10%; height: 70%;
        z-index: 0; pointer-events: none; filter: blur(80px); opacity: .55;
        background:
          radial-gradient(40% 50% at 30% 50%, rgba(76,175,80,.35), transparent 60%),
          radial-gradient(40% 50% at 75% 30%, rgba(197,160,40,.30), transparent 60%),
          radial-gradient(35% 45% at 60% 70%, rgba(27,94,32,.40), transparent 60%);
        animation: sr-mesh-drift 22s ease-in-out infinite;
      }
      @keyframes sr-mesh-drift {
        0%,100% { transform: translate(0,0); }
        50%     { transform: translate(2%, 1.5%); }
      }

      /* Orbits décoratives qui tournent */
      .sr-orbits {
        position: absolute; inset: 0; pointer-events: none;
        z-index: 0; overflow: hidden;
      }
      .sr-o {
        position: absolute; left: 50%; top: 60%;
        border-radius: 50%; transform: translate(-50%, -50%);
        opacity: 0; animation: sr-orbits-in 1.8s .3s ease-out forwards;
      }
      @keyframes sr-orbits-in { to { opacity: 1; } }
      .sr-o1 { width: 520px;  height: 520px;  border: 1px dashed rgba(123,211,137,.10); animation: sr-orbits-in 1.8s .3s ease-out forwards, sr-spin 60s linear infinite; }
      .sr-o2 { width: 760px;  height: 760px;  border: 1px solid  rgba(255,255,255,.05);  animation: sr-orbits-in 1.8s .3s ease-out forwards, sr-spin-rev 90s linear infinite; }
      .sr-o3 { width: 1040px; height: 1040px; border: 1px dashed rgba(123,211,137,.06); animation: sr-orbits-in 1.8s .3s ease-out forwards, sr-spin 120s linear infinite; }
      @keyframes sr-spin     { to { transform: translate(-50%,-50%) rotate(360deg); } }
      @keyframes sr-spin-rev { to { transform: translate(-50%,-50%) rotate(-360deg); } }
      .sr-pip {
        position: absolute; top: 0; left: 50%; transform: translate(-50%,-50%);
        width: 6px; height: 6px; border-radius: 50%;
        background: #7BD389; box-shadow: 0 0 12px #7BD389;
      }
      .sr-o2 .sr-pip { background: #C5A028; box-shadow: 0 0 12px #C5A028; }

      /* Hero grid */
      .sr-hero-grid {
        position: relative; z-index: 2;
        max-width: 1280px; margin: 0 auto;
        display: grid; grid-template-columns: 1.05fr 1fr;
        gap: 64px; align-items: center;
        min-height: calc(100vh - 136px);
      }
      .sr-hero-left { display: flex; flex-direction: column; gap: 28px; }
      .sr-hero-right { display: flex; justify-content: flex-end; }

      /* Pill */
      .sr-pill {
        display: inline-flex; align-items: center; gap: 10px;
        padding: 6px 14px 6px 8px;
        background: rgba(255,255,255,.04);
        border: 1px solid rgba(123,211,137,.18);
        border-radius: 999px;
        font-size: 12px; color: #B7C2BB;
        backdrop-filter: blur(8px);
        opacity: 0; transform: translateY(10px);
        animation: sr-rise .9s .35s cubic-bezier(.2,.8,.2,1) forwards;
        max-width: max-content;
      }
      .sr-pill-badge {
        font-family: 'JetBrains Mono', monospace; font-size: 10px;
        font-weight: 600; letter-spacing: .04em;
        background: linear-gradient(135deg, #7BD389, #1B5E20);
        color: #061309; padding: 2px 7px; border-radius: 5px;
      }
      .sr-pill-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #7BD389; box-shadow: 0 0 0 0 #7BD389;
        animation: sr-live 2s infinite;
      }
      @keyframes sr-live {
        0%   { box-shadow: 0 0 0 0 rgba(123,211,137,.55); }
        70%  { box-shadow: 0 0 0 12px rgba(123,211,137,0); }
        100% { box-shadow: 0 0 0 0 rgba(123,211,137,0); }
      }
      @keyframes sr-rise { to { opacity: 1; transform: translateY(0); } }

      /* H1 split words */
      .sr-h1 {
        font-family: 'Inter', sans-serif;
        font-weight: 800;
        font-size: clamp(40px, 6.4vw, 88px);
        letter-spacing: -0.035em;
        line-height: 1.02;
        margin: 0;
        color: #F5F7F4;
      }
      .sr-w {
        display: inline-block;
        overflow: hidden;
        vertical-align: top;
      }
      .sr-w > span {
        display: inline-block;
        transform: translateY(108%);
        animation: sr-word-in .9s cubic-bezier(.2,.8,.2,1) forwards;
        animation-delay: calc(.55s + var(--i, 0) * .08s);
      }
      @keyframes sr-word-in { to { transform: translateY(0); } }
      .sr-grad-gold > span {
        background: linear-gradient(180deg, #E8C84A 0%, #C5A028 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-style: italic; font-weight: 700;
      }
      .sr-grad-lime > span {
        background: linear-gradient(180deg, #FFFFFF 0%, #7BD389 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }

      .sr-lede {
        font-size: clamp(15px, 1.4vw, 17px);
        line-height: 1.65; color: #B7C2BB;
        max-width: 540px; margin: 0;
        opacity: 0; animation: sr-rise .9s 1.05s cubic-bezier(.2,.8,.2,1) forwards;
      }
      .sr-lede em { font-style: italic; color: #E8C84A; font-weight: 500; }

      /* CTA row */
      .sr-cta-row {
        display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
        opacity: 0; animation: sr-rise .9s 1.2s cubic-bezier(.2,.8,.2,1) forwards;
      }
      .sr-cta-primary {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 13px 22px; border-radius: 999px;
        background: linear-gradient(135deg, #1B5E20, #2E7D32);
        color: #fff; font-weight: 600; font-size: 14px;
        text-decoration: none; cursor: pointer;
        box-shadow: 0 18px 40px -12px rgba(46,125,50,.55), inset 0 1px 0 rgba(255,255,255,.15);
        transition: all .25s cubic-bezier(.2,.8,.2,1);
      }
      .sr-cta-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 22px 48px -10px rgba(46,125,50,.7), inset 0 1px 0 rgba(255,255,255,.2);
      }
      .sr-cta-ghost {
        font-size: 13.5px; color: #B7C2BB; text-decoration: none;
        padding: 8px 4px; border-bottom: 1px solid rgba(183,194,187,.2);
        transition: color .2s, border-color .2s;
      }
      .sr-cta-ghost:hover { color: #E8C84A; border-color: #E8C84A; }

      /* Stats */
      .sr-stats {
        display: flex; gap: 40px; flex-wrap: wrap; padding-top: 14px;
        border-top: 1px solid rgba(255,255,255,.06);
        opacity: 0; animation: sr-rise .9s 1.35s cubic-bezier(.2,.8,.2,1) forwards;
      }
      .sr-stats > div { display: flex; flex-direction: column; gap: 2px; }
      .sr-stat-num {
        font-family: 'Inter', sans-serif; font-weight: 700;
        font-size: 22px; letter-spacing: -0.02em; color: #F5F7F4;
      }
      .sr-stat-lab {
        font-size: 11.5px; color: #8A9690;
        font-family: 'JetBrains Mono', monospace; letter-spacing: .04em;
      }

      /* Stage container */
      .sr-stage-wrap {
        width: 100%; max-width: 540px;
        opacity: 0; transform: translateY(20px) scale(.98);
        animation: sr-stage-in 1.1s .8s cubic-bezier(.2,.8,.2,1) forwards;
      }
      @keyframes sr-stage-in { to { opacity: 1; transform: translateY(0) scale(1); } }
      .sr-stage {
        position: relative; aspect-ratio: 1/1; width: 100%;
        border-radius: 28px; overflow: hidden;
        background:
          radial-gradient(80% 60% at 30% 20%, rgba(123,211,137,.08), transparent 60%),
          radial-gradient(80% 60% at 100% 100%, rgba(27,94,32,.4), transparent 60%),
          linear-gradient(180deg, #0F1418, #06080A);
        border: 1px solid rgba(123,211,137,.14);
        box-shadow: 0 40px 80px -30px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.04);
      }
      .sr-stage-chrome {
        position: absolute; top: 14px; left: 14px; right: 14px; z-index: 3;
        display: flex; justify-content: space-between; align-items: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10.5px; letter-spacing: .16em;
        text-transform: uppercase; color: #5C6770;
      }
      .sr-stage-live { display: inline-flex; align-items: center; gap: 6px; color: #7BD389; }
      .sr-stage-livedot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #7BD389; box-shadow: 0 0 8px #7BD389;
        animation: sr-live 2s infinite;
      }
      .sr-stage-scope {
        position: absolute; left: 50%; top: 50%; width: 40px; height: 40px;
        transform: translate(-50%,-50%); pointer-events: none; z-index: 2; opacity: 0;
        transition: opacity .15s linear;
      }
      .sr-stage-scope::before, .sr-stage-scope::after {
        content: ""; position: absolute; background: #7BD389;
        box-shadow: 0 0 8px #7BD389;
      }
      .sr-stage-scope::before { left: 0; right: 0; top: 50%; height: 1px; transform: translateY(-50%); }
      .sr-stage-scope::after  { top: 0; bottom: 0; left: 50%; width: 1px; transform: translateX(-50%); }
      .sr-stage-readout {
        position: absolute; left: 18px; bottom: 18px; z-index: 3;
        display: flex; flex-direction: column; gap: 4px;
        font-family: 'JetBrains Mono', monospace; color: #B7C2BB;
      }
      .sr-stage-k { font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: #5C6770; }
      .sr-stage-v {
        font-family: 'Inter', sans-serif; font-size: 36px; font-weight: 700;
        letter-spacing: -0.035em; color: #7BD389; line-height: 1;
      }
      .sr-stage-v small {
        color: #8A929A; font-size: 13px; font-weight: 400;
        font-style: italic; font-family: 'Inter', sans-serif; margin-left: 4px;
      }
      .sr-stage-meta { font-size: 10.5px; color: #8A929A; margin-top: 6px; letter-spacing: .04em; }

      /* Scroll hint */
      .sr-scroll-hint {
        position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 16px; border-radius: 999px;
        background: rgba(255,255,255,.04);
        border: 1px solid rgba(123,211,137,.14);
        color: #B7C2BB; font-size: 12px;
        text-decoration: none; backdrop-filter: blur(8px);
        animation: sr-bob 2.4s ease-in-out infinite;
        opacity: 0; animation-delay: 1.6s;
        animation-name: sr-bob-in, sr-bob;
        animation-duration: .7s, 2.4s;
        animation-iteration-count: 1, infinite;
        animation-delay: 1.6s, 2.3s;
        animation-fill-mode: forwards, none;
        z-index: 3;
      }
      .sr-scroll-hint:hover { color: #E8C84A; border-color: rgba(232,200,74,.3); }
      @keyframes sr-bob-in { to { opacity: 1; } }
      @keyframes sr-bob { 0%,100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, 5px); } }

      /* ═══════ FORM SECTION ═══════ */
      .sr-form-section {
        position: relative;
        background: linear-gradient(180deg, #061309 0%, #FAFAFA 110px);
        padding: 80px 24px 100px;
      }
      .sr-form-bg {
        position: absolute; inset: 0; pointer-events: none;
        background:
          radial-gradient(60% 40% at 20% 10%, rgba(27,94,32,.04), transparent 60%),
          radial-gradient(60% 40% at 80% 60%, rgba(197,160,40,.04), transparent 60%);
      }
      .sr-form-wrap {
        position: relative; max-width: 720px; margin: 0 auto;
        font-family: 'Inter', sans-serif;
      }
      .sr-form-head { text-align: center; margin-bottom: 32px; }
      .sr-kicker {
        display: inline-block;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px; letter-spacing: .14em;
        text-transform: uppercase; color: #1B5E20;
        background: rgba(27,94,32,.08); padding: 5px 12px; border-radius: 999px;
        margin-bottom: 16px;
      }
      .sr-form-title {
        font-size: clamp(28px, 3.4vw, 42px); font-weight: 800;
        letter-spacing: -0.025em; color: #0A1F0C;
        margin: 0 0 10px; line-height: 1.1;
      }
      .sr-form-sub { font-size: 15px; color: #6B7280; margin: 0; }

      .sr-form-card {
        background: #fff;
        border: 1px solid rgba(15,23,42,.08);
        border-radius: 22px;
        box-shadow: 0 24px 60px -28px rgba(15,23,42,.18), 0 4px 20px -6px rgba(15,23,42,.06);
        overflow: hidden;
      }
      .sr-progress { position: relative; height: 2px; background: #F1F5F9; }
      .sr-progress-fill {
        position: absolute; inset: 0; right: auto;
        background: linear-gradient(90deg, #1B5E20, #2E7D32, #C5A028);
        transition: width .5s cubic-bezier(.2,.8,.2,1);
      }
      .sr-form-inner { padding: 28px; display: flex; flex-direction: column; gap: 18px; }
      @media (min-width: 640px) { .sr-form-inner { padding: 36px; } }

      .sr-submit {
        position: relative; overflow: hidden;
        width: 100%; height: 50px; padding: 0 18px;
        background: linear-gradient(135deg, #0A1F0C, #1B5E20);
        color: #fff; font-weight: 600; font-size: 14px;
        border: 0; border-radius: 14px; cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        box-shadow: 0 16px 36px -14px rgba(27,94,32,.5);
        transition: transform .2s, box-shadow .2s, opacity .2s;
      }
      .sr-submit:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 22px 44px -14px rgba(27,94,32,.65);
      }
      .sr-submit:disabled { opacity: .6; cursor: not-allowed; }

      .sr-form-trust {
        display: grid; grid-template-columns: repeat(3,1fr); gap: 8px;
        padding: 16px 28px; background: rgba(15,23,42,.02);
        border-top: 1px solid #F1F5F9;
        font-size: 11.5px; color: #6B7280; font-weight: 500;
      }
      @media (min-width: 640px) { .sr-form-trust { padding: 16px 36px; font-size: 12px; } }

      input::placeholder, textarea::placeholder { transition: opacity .2s; }
      input:focus::placeholder, textarea:focus::placeholder { opacity: .5; }

      /* ═══════ Responsive ═══════ */
      @media (max-width: 980px) {
        .sr-hero { padding: 64px 20px 40px; }
        .sr-hero-grid { grid-template-columns: 1fr; gap: 40px; }
        .sr-hero-right { justify-content: center; }
        .sr-stage-wrap { max-width: 440px; }
        .sr-scroll-hint { display: none; }
      }
      @media (max-width: 540px) {
        .sr-hero { padding: 48px 16px 32px; }
        .sr-stats { gap: 24px; }
        .sr-stat-num { font-size: 18px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .sr-mesh, .sr-o1, .sr-o2, .sr-o3,
        .sr-pill-dot, .sr-stage-livedot,
        .sr-scroll-hint, .sr-w > span {
          animation: none !important;
        }
        .sr-w > span { transform: translateY(0); }
        .sr-pill, .sr-lede, .sr-cta-row, .sr-stats, .sr-stage-wrap {
          opacity: 1; transform: none; animation: none;
        }
      }
    `}</style>
  );
}
