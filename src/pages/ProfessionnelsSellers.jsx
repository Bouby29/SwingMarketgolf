import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  CheckCircle, Target, TrendingUp, Users, Zap, Package,
  Lock, Upload, Headphones, Trophy, ShieldCheck, Sparkles,
  ArrowRight, ArrowDown, Wallet, Settings2, Globe2,
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
            e.target.classList.add("p-revealed");
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

// Compteur animé (s'incrémente quand visible)
function CountUp({ to, suffix = "", duration = 1400 }) {
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
      setVal(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started, to, duration]);

  return <span ref={ref}>{val}{suffix}</span>;
}

// ─────────────────────────────────────────────────────────
// Page Vendeurs Pros
// ─────────────────────────────────────────────────────────
export default function ProfessionnelsSellers() {
  useReveal();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const scrollToBento = () => {
    document.getElementById("p-bento")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Style />
      <div className="min-h-screen bg-[#FAFAFA]">

        {/* ════════ HERO IMMERSIF ════════ */}
        <section className="p-hero">
          <div className="p-hero-bg" aria-hidden />
          <div className="p-hero-grid" aria-hidden />
          <div className="p-orbits" aria-hidden>
            <div className="p-o p-o1" /><div className="p-o p-o2" /><div className="p-o p-o3" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-24">
            <div className="grid md:grid-cols-[1.15fr_1fr] gap-12 items-center">
              {/* LEFT — copy */}
              <div>
                <span className="p-pill">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Vendeurs professionnels · marketplace golf</span>
                </span>

                <h1 className="p-h1">
                  <span className="p-w" style={{ "--i": 0 }}><span>Le&nbsp;</span></span>
                  <span className="p-w p-grad-gold" style={{ "--i": 1 }}><span>nouveau&nbsp;canal</span></span>
                  <br />
                  <span className="p-w" style={{ "--i": 2 }}><span>de&nbsp;vente&nbsp;</span></span>
                  <span className="p-w p-grad-lime" style={{ "--i": 3 }}><span>du&nbsp;golf.</span></span>
                </h1>

                <p className="p-lede">
                  Touchez une audience qualifiée de golfeurs passionnés.
                  Pas d'abonnement obligatoire, pas d'engagement, pas de
                  commission cachée — vous gardez <em>100&nbsp;%</em> de
                  la valeur de vos ventes.
                </p>

                <div className="p-cta-row">
                  <Link to={createPageUrl("CreateListing")} className="p-cta-primary group">
                    <span>Créer mon compte pro</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link to="/Abonnements" className="p-cta-ghost">
                    <Trophy className="w-3.5 h-3.5" />
                    Voir nos abonnements
                  </Link>
                </div>

                {/* Stats */}
                <div className="p-stats">
                  <div>
                    <span className="p-stat-num"><CountUp to={100} suffix="%" /></span>
                    <span className="p-stat-lab">du prix affiché<br/>vous revient</span>
                  </div>
                  <div>
                    <span className="p-stat-num"><CountUp to={0} suffix="€" /></span>
                    <span className="p-stat-lab">d'abonnement<br/>obligatoire</span>
                  </div>
                  <div>
                    <span className="p-stat-num">⛳</span>
                    <span className="p-stat-lab">Audience<br/>100% golf</span>
                  </div>
                </div>
              </div>

              {/* RIGHT — card flottante "console pro" */}
              <div className="p-stage-wrap">
                <div className="p-stage">
                  <div className="p-stage-chrome">
                    <span className="p-stage-live"><span className="p-stage-livedot" />portail vendeur · v2</span>
                    <span>shop · 01</span>
                  </div>
                  <div className="p-stage-body">
                    <div className="p-stage-row">
                      <span className="p-stage-key">CHIFFRE D'AFFAIRES</span>
                      <span className="p-stage-val">42 380<small>&nbsp;€</small></span>
                      <span className="p-stage-trend">▲ 18.4%</span>
                    </div>
                    <div className="p-stage-row">
                      <span className="p-stage-key">VENTES CE MOIS</span>
                      <span className="p-stage-val p-stage-val-lime">68</span>
                      <span className="p-stage-trend">▲ 12.1%</span>
                    </div>
                    <div className="p-stage-row">
                      <span className="p-stage-key">COMMISSION VENDEUR</span>
                      <span className="p-stage-val p-stage-val-gold">0<small>&nbsp;€</small></span>
                      <span className="p-stage-trend p-stage-trend-flat">— 0%</span>
                    </div>
                    <div className="p-stage-row">
                      <span className="p-stage-key">VOUS TOUCHEZ</span>
                      <span className="p-stage-val p-stage-val-100">100<small>&nbsp;%</small></span>
                      <span className="p-stage-trend">verrouillé</span>
                    </div>
                  </div>
                  <div className="p-stage-footer">
                    <Lock className="w-3 h-3" />
                    Données chiffrées · simulation
                  </div>
                </div>
              </div>
            </div>

            <button onClick={scrollToBento} className="p-scroll">
              Découvrir nos avantages
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* ════════ BENTO — Pourquoi nous choisir ════════ */}
        <section id="p-bento" className="max-w-6xl mx-auto px-4 pt-20 pb-12">
          <div className="text-center mb-12" data-reveal>
            <span className="p-kicker">Pourquoi SwingMarket</span>
            <h2 className="p-h2">Conçu pour les pros du golf, pas pour la masse.</h2>
            <p className="p-sub">
              Une marketplace 100% spécialisée, sans dilution face aux géants généralistes.
            </p>
          </div>

          <div className="p-bento">
            <BentoCard
              span="md:col-span-3 md:row-span-2"
              tone="green-deep"
              data-reveal
              tag="Avantage exclusif"
              title="Aucune commission vendeur"
              body={
                <>
                  Vous touchez <strong className="text-white">100&nbsp;% du prix affiché</strong>.
                  La commission SwingMarket est à la charge de l'acheteur — vous gardez la
                  totalité de votre marge sans frais cachés ni surprise en fin de mois.
                </>
              }
              illustration={
                <div className="p-bento-illu">
                  <div className="p-100">
                    <span className="p-100-num">100</span>
                    <span className="p-100-pct">%</span>
                  </div>
                  <span className="p-100-sub">VOUS TOUCHEZ</span>
                </div>
              }
            />
            <BentoCard
              span="md:col-span-3"
              tone="white"
              data-reveal
              Icon={Target}
              tag="Audience"
              title="Une audience qualifiée"
              body="Des acheteurs en intention d'achat, passionnés et exigeants. Pas de visiteurs perdus."
            />
            <BentoCard
              span="md:col-span-3"
              tone="white"
              data-reveal
              Icon={Globe2}
              tag="Reach"
              title="Rayonnement national"
              body="Ouvrez votre activité à toute la France, sans créer ni maintenir votre propre site marchand."
            />
            <BentoCard
              span="md:col-span-2"
              tone="white"
              data-reveal
              Icon={Zap}
              tag="Sans engagement"
              title="Liberté totale"
              body="Pas d'abonnement obligatoire. Pas de durée minimum. Vous arrêtez quand vous voulez."
            />
            <BentoCard
              span="md:col-span-2"
              tone="white"
              data-reveal
              Icon={ShieldCheck}
              tag="Confiance"
              title="Paiement sécurisé"
              body="Stripe verrouille les fonds jusqu'à confirmation de réception. Aucune fraude possible."
            />
            <BentoCard
              span="md:col-span-2"
              tone="white"
              data-reveal
              Icon={Headphones}
              tag="Accompagnement"
              title="Support pro dédié"
              body="Une équipe à votre écoute, disponible sous 24 h pour vous accompagner."
            />
          </div>
        </section>

        {/* ════════ POUR QUI — chips ════════ */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-10" data-reveal>
            <span className="p-kicker">Pour qui</span>
            <h2 className="p-h2">Pensé pour tous les acteurs du golf.</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3" data-reveal>
            {[
              { emoji: "🏷️", label: "Marques de golf" },
              { emoji: "🏬", label: "Shops indépendants" },
              { emoji: "🛠️", label: "Artisans & créateurs" },
              { emoji: "🧰", label: "Ateliers spécialisés" },
              { emoji: "♻️", label: "Revendeurs d'occasion" },
              { emoji: "🧪", label: "Marques émergentes" },
            ].map((c, i) => (
              <span
                key={c.label}
                className="p-chip"
                style={{ animationDelay: `${0.1 + i * 0.06}s` }}
              >
                <span className="text-base">{c.emoji}</span>
                {c.label}
              </span>
            ))}
          </div>

          <p className="text-center text-gray-500 mt-8 max-w-2xl mx-auto text-[14.5px] leading-relaxed" data-reveal>
            SwingMarket valorise les <strong className="text-[#1B5E20]">marques engagées</strong>,
            le <strong className="text-[#1B5E20]">Made in France</strong>, la
            fabrication responsable et les logiques de circuit court — en complément
            d'une offre de qualité.
          </p>
        </section>

        {/* ════════ TIMELINE — comment ça marche ════════ */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-14" data-reveal>
            <span className="p-kicker">Mise en route en 4 étapes</span>
            <h2 className="p-h2">Un onboarding sans friction.</h2>
            <p className="p-sub">De la création du compte au premier paiement reçu.</p>
          </div>

          <div className="p-timeline">
            <div className="p-timeline-line" aria-hidden />
            {[
              { n: "01", icon: Settings2,  title: "Créez votre compte pro",   desc: "Renseignez votre SIRET et votre dénomination sociale. Vérification rapide." },
              { n: "02", icon: Upload,     title: "Importez votre catalogue", desc: "Saisie unitaire ou import de masse pour les pros à fort volume." },
              { n: "03", icon: TrendingUp, title: "Vendez à l'audience golf", desc: "Vos annonces sont identifiées « Vendeur Pro » — gage de confiance." },
              { n: "04", icon: Wallet,     title: "Recevez vos paiements",    desc: "Versement automatique à J+3 après confirmation de la livraison." },
            ].map((s, i) => (
              <div key={s.n} className="p-step" data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="p-step-icon">
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="p-step-num">{s.n}</span>
                <h4 className="p-step-title">{s.title}</h4>
                <p className="p-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════ MODÈLE — features sans la commission 5% ════════ */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12" data-reveal>
            <span className="p-kicker">Le modèle SwingMarket</span>
            <h2 className="p-h2">Transparent, simple, sans surprises.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                Icon: Wallet,
                title: "Vous touchez 100 % du prix affiché",
                desc: "Aucune commission vendeur. La commission SwingMarket est intégralement à la charge de l'acheteur.",
                accent: "green",
              },
              {
                Icon: Zap,
                title: "Aucun abonnement obligatoire",
                desc: "Pas de frais fixes, pas d'engagement caché. Une formule pro existe pour les vendeurs à fort volume.",
                accent: "gold",
              },
              {
                Icon: Trophy,
                title: "Liberté tarifaire totale",
                desc: "Vous fixez vos prix, vous décidez de vos remises. SwingMarket ne s'invite jamais dans votre stratégie commerciale.",
                accent: "green",
              },
              {
                Icon: Package,
                title: "Expédition intégrée",
                desc: "Génération automatique des étiquettes Mondial Relay, Colissimo, Chronopost depuis votre espace.",
                accent: "gold",
              },
              {
                Icon: Lock,
                title: "Paiement sécurisé Stripe",
                desc: "Les fonds sont protégés et débloqués automatiquement après confirmation de réception.",
                accent: "green",
              },
              {
                Icon: Upload,
                title: "Import catalogue",
                desc: "Solutions adaptées pour les pros (catalogue, lots, volumes). Notre équipe vous aide à migrer.",
                accent: "gold",
              },
              {
                Icon: Headphones,
                title: "Pas d'engagement de durée",
                desc: "Vous arrêtez quand vous voulez, sans pénalité ni justification. Liberté totale.",
                accent: "green",
              },
              {
                Icon: CheckCircle,
                title: "Support professionnel",
                desc: "Un canal direct avec notre équipe pro pour les questions stratégiques et techniques.",
                accent: "gold",
              },
            ].map((f, i) => (
              <FeatureCard key={f.title} {...f} idx={i} />
            ))}
          </div>
        </section>

        {/* ════════ GOLF SPÉCIFIQUE ════════ */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 items-start">
              <div data-reveal>
                <span className="p-kicker">Spécifique golf</span>
                <h2 className="p-h2">Pensé pour la réalité<br/>du matériel de golf.</h2>
                <p className="text-gray-500 text-[14.5px] mt-4 leading-relaxed">
                  De la putter au sac trépied, des balles aux drivers : on a
                  prévu chaque format, chaque poids, chaque condition d'expédition.
                </p>

                <ul className="mt-8 space-y-4">
                  {[
                    { title: "Colis standards et volumineux",
                      desc: "Support complet de toutes les tailles (sacs golf, sets complets)." },
                    { title: "Solutions adaptées au matériel",
                      desc: "Clubs, balles, sacs, chariots, GPS, vêtements, accessoires." },
                    { title: "Étiquettes prépayées",
                      desc: "Génération automatique avec nos partenaires logistiques." },
                    { title: "Support en cas de souci",
                      desc: "Équipe disponible pour résoudre tout problème rapidement." },
                    { title: "Amélioration continue",
                      desc: "Évolution constante de la plateforme selon vos retours." },
                  ].map((it) => (
                    <li key={it.title} className="flex items-start gap-3">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-[#F7FEF7] border border-[#1B5E20]/20 flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#1B5E20]" />
                      </span>
                      <div>
                        <p className="font-semibold text-[#0F172A] text-[14.5px]">{it.title}</p>
                        <p className="text-[13px] text-gray-500 leading-relaxed">{it.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA card */}
              <div data-reveal>
                <div className="p-cta-card">
                  <span className="p-kicker p-kicker-gold">Prêt à démarrer</span>
                  <h3 className="text-2xl font-bold tracking-tight mt-2 mb-3" style={{ color: "#FFFFFF" }}>
                    Développez votre vente de golf<br/>dès aujourd'hui.
                  </h3>
                  <p className="text-[14.5px] leading-relaxed mb-7" style={{ color: "rgba(255,255,255,0.78)" }}>
                    Rejoignez les pros qui font confiance à SwingMarket pour leur
                    canal de vente complémentaire. Création de compte gratuite,
                    100 % du prix vous revient.
                  </p>

                  <div className="flex flex-col gap-3">
                    <Link to={createPageUrl("CreateListing")}>
                      <button className="w-full inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-3.5 text-sm transition-all hover:-translate-y-0.5"
                        style={{
                          background: "#C5A028",
                          color: "#1a1305",
                          boxShadow: "0 14px 32px -10px rgba(197,160,40,0.55)",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#D4AF37"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#C5A028"; }}
                      >
                        Créer mon compte professionnel
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                    <Link to="/Contact">
                      <button className="w-full inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-3.5 text-sm transition-all border"
                        style={{
                          borderColor: "rgba(255,255,255,0.25)",
                          color: "#FFFFFF",
                          background: "rgba(255,255,255,0.04)",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                      >
                        Parler à l'équipe
                      </button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-7 pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    {[
                      { Icon: Lock, label: "Stripe sécurisé" },
                      { Icon: ShieldCheck, label: "Sans engagement" },
                      { Icon: Zap, label: "Onboarding < 24 h" },
                    ].map(({ Icon, label }) => (
                      <div key={label} className="flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                        <Icon className="w-3 h-3" style={{ color: "#7BD389" }} />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════ CTA FINAL ════════ */}
        <section className="max-w-4xl mx-auto px-4 pt-20 pb-32 md:pb-40 text-center" data-reveal>
          <h2 className="p-h2 mb-3">Une question, un projet, une intégration ?</h2>
          <p className="p-sub mb-10">L'équipe SwingMarket vous répond sous 24 h ouvrées.</p>
          <Link to="/Contact" className="inline-block mt-2">
            <button className="inline-flex items-center gap-2 bg-[#0A1F0C] hover:bg-black text-white font-semibold rounded-full px-7 py-3.5 text-sm transition-all hover:shadow-xl hover:-translate-y-0.5">
              Contacter l'équipe pro
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </section>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Bento card (taille variable + tone variants)
// ─────────────────────────────────────────────────────────
function BentoCard({ span, tone, tag, title, body, Icon, illustration, ...rest }) {
  const isDeep = tone === "green-deep";
  return (
    <article
      className={`p-bento-card ${span} ${isDeep ? "p-bento-deep" : "p-bento-white"}`}
      {...rest}
    >
      {!isDeep && Icon && (
        <div className="p-bento-icon">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <p className="p-bento-tag">{tag}</p>
      <h3 className="p-bento-title">{title}</h3>
      <p className="p-bento-body">{body}</p>
      {illustration}
    </article>
  );
}

// Feature card avec accent vert ou or
function FeatureCard({ Icon, title, desc, accent, idx }) {
  const isGreen = accent === "green";
  return (
    <article
      data-reveal
      className="p-feat group"
      style={{ transitionDelay: `${idx * 30}ms` }}
    >
      <div
        className="p-feat-icon"
        style={{
          background: isGreen ? "#F7FEF7" : "#FEF9E7",
          color: isGreen ? "#1B5E20" : "#C5A028",
        }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-[#0F172A] text-[15px] mb-1 leading-snug">{title}</h4>
        <p className="text-[13px] text-gray-600 leading-relaxed">{desc}</p>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────
function Style() {
  return (
    <style>{`
      /* ── Hero ── */
      .p-hero {
        position: relative;
        background: linear-gradient(180deg, #0A1F0C 0%, #061309 100%);
        color: #E5E7EB;
        overflow: hidden;
        isolation: isolate;
      }
      .p-hero-bg {
        position: absolute; inset: -20% -10% auto -10%; height: 70%;
        z-index: 0; pointer-events: none; filter: blur(70px); opacity: .55;
        background:
          radial-gradient(40% 50% at 30% 50%, rgba(76,175,80,.30), transparent 60%),
          radial-gradient(40% 50% at 75% 30%, rgba(197,160,40,.26), transparent 60%);
        animation: p-drift 22s ease-in-out infinite;
      }
      @keyframes p-drift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(2%,1.5%)} }
      .p-hero-grid {
        position: absolute; inset: 0; pointer-events: none; z-index: 0;
        background-image:
          linear-gradient(rgba(123,211,137,.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(123,211,137,.05) 1px, transparent 1px);
        background-size: 56px 56px;
        mask-image: radial-gradient(ellipse 80% 80% at 50% 30%, black 30%, transparent 90%);
        -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 30%, black 30%, transparent 90%);
      }
      .p-orbits { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
      .p-o {
        position: absolute; left: 60%; top: 60%;
        border-radius: 50%; transform: translate(-50%,-50%);
        opacity: 0; animation: p-orbits-in 1.6s .3s ease-out forwards;
      }
      @keyframes p-orbits-in { to { opacity: 1; } }
      .p-o1 { width: 480px;  height: 480px;  border: 1px dashed rgba(123,211,137,.10); animation: p-orbits-in 1.6s .3s ease-out forwards, p-spin 60s linear infinite; }
      .p-o2 { width: 720px;  height: 720px;  border: 1px solid  rgba(255,255,255,.05); animation: p-orbits-in 1.6s .3s ease-out forwards, p-spin-rev 90s linear infinite; }
      .p-o3 { width: 1000px; height: 1000px; border: 1px dashed rgba(123,211,137,.06); animation: p-orbits-in 1.6s .3s ease-out forwards, p-spin 120s linear infinite; }
      @keyframes p-spin     { to { transform: translate(-50%,-50%) rotate(360deg); } }
      @keyframes p-spin-rev { to { transform: translate(-50%,-50%) rotate(-360deg); } }

      .p-pill {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 6px 14px; background: rgba(255,255,255,.04);
        border: 1px solid rgba(123,211,137,.18); border-radius: 999px;
        font-size: 11.5px; color: #B7C2BB; backdrop-filter: blur(8px);
        opacity: 0; transform: translateY(10px);
        animation: p-rise .9s .35s cubic-bezier(.2,.8,.2,1) forwards;
        margin-bottom: 24px;
      }

      .p-h1 {
        font-family: 'Inter', sans-serif; font-weight: 800;
        font-size: clamp(40px, 5.6vw, 76px);
        letter-spacing: -0.035em; line-height: 1.12;
        color: #F5F7F4; margin: 0 0 24px;
      }
      /* On garde l'overflow hidden pour le clip à l'arrivée, mais on
         ajoute du padding pour ne pas tronquer les lettres italiques
         (notamment le L final de "canal" qui dépasse à droite/bas). */
      .p-w {
        display: inline-block;
        overflow: hidden;
        vertical-align: top;
        padding-bottom: .12em;
        padding-right: .04em;
        margin-bottom: -.08em;
      }
      .p-w > span {
        display: inline-block; transform: translateY(108%);
        animation: p-word .9s cubic-bezier(.2,.8,.2,1) forwards;
        animation-delay: calc(.55s + var(--i, 0) * .08s);
        padding-right: .08em;
      }
      @keyframes p-word { to { transform: translateY(0); } }
      .p-grad-gold > span {
        background: linear-gradient(180deg, #E8C84A, #C5A028);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-style: italic; font-weight: 700;
      }
      .p-grad-lime > span {
        background: linear-gradient(180deg, #FFFFFF, #7BD389);
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }

      .p-lede {
        font-size: clamp(15px, 1.2vw, 17px); line-height: 1.65;
        color: #B7C2BB; max-width: 540px; margin: 0 0 28px;
        opacity: 0; animation: p-rise .9s 1.05s cubic-bezier(.2,.8,.2,1) forwards;
      }
      .p-lede em { font-style: italic; color: #E8C84A; font-weight: 600; }
      @keyframes p-rise { to { opacity: 1; transform: translateY(0); } }

      .p-cta-row {
        display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
        opacity: 0; animation: p-rise .9s 1.2s cubic-bezier(.2,.8,.2,1) forwards;
        margin-bottom: 32px;
      }
      .p-cta-primary {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 13px 22px; border-radius: 999px;
        background: linear-gradient(135deg, #C5A028, #D4AF37);
        color: #1a1305; font-weight: 700; font-size: 14px;
        text-decoration: none;
        box-shadow: 0 18px 40px -12px rgba(197,160,40,0.55);
        transition: all .25s cubic-bezier(.2,.8,.2,1);
      }
      .p-cta-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 22px 48px -10px rgba(197,160,40,0.7);
      }
      .p-cta-ghost {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 13px; color: #B7C2BB; text-decoration: none;
        padding: 8px 4px; border-bottom: 1px solid rgba(183,194,187,.2);
        transition: color .2s, border-color .2s;
      }
      .p-cta-ghost:hover { color: #E8C84A; border-color: #E8C84A; }

      .p-stats {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        padding-top: 18px; border-top: 1px solid rgba(255,255,255,.06);
        opacity: 0; animation: p-rise .9s 1.35s cubic-bezier(.2,.8,.2,1) forwards;
      }
      .p-stats > div { display: flex; flex-direction: column; gap: 4px; }
      .p-stat-num {
        font-weight: 800; font-size: clamp(22px, 2.4vw, 32px);
        letter-spacing: -0.025em; color: #F5F7F4;
        font-variant-numeric: tabular-nums;
      }
      .p-stat-lab {
        font-size: 11px; color: #8A9690;
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: .04em; line-height: 1.3;
      }

      /* Stage card "console pro" à droite */
      .p-stage-wrap {
        opacity: 0; transform: translateY(20px) scale(.98);
        animation: p-stage-in 1.1s .8s cubic-bezier(.2,.8,.2,1) forwards;
      }
      @keyframes p-stage-in { to { opacity: 1; transform: translateY(0) scale(1); } }
      .p-stage {
        position: relative; width: 100%; max-width: 460px; margin: 0 auto;
        border-radius: 22px; overflow: hidden;
        background:
          radial-gradient(80% 60% at 30% 20%, rgba(123,211,137,.08), transparent 60%),
          radial-gradient(80% 60% at 100% 100%, rgba(27,94,32,.4), transparent 60%),
          linear-gradient(180deg, #0F1418, #06080A);
        border: 1px solid rgba(123,211,137,.14);
        box-shadow: 0 40px 80px -30px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.04);
      }
      .p-stage-chrome {
        display: flex; justify-content: space-between; align-items: center;
        padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.05);
        font-family: 'JetBrains Mono', monospace; font-size: 10px;
        letter-spacing: .14em; text-transform: uppercase; color: #5C6770;
      }
      .p-stage-live { display: inline-flex; align-items: center; gap: 6px; color: #7BD389; }
      .p-stage-livedot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #7BD389; box-shadow: 0 0 8px #7BD389;
        animation: p-blink 2s infinite;
      }
      @keyframes p-blink {
        0%,100% { box-shadow: 0 0 0 0 rgba(123,211,137,.6); }
        70%     { box-shadow: 0 0 0 12px rgba(123,211,137,0); }
      }
      .p-stage-body { display: flex; flex-direction: column; padding: 6px 0; }
      .p-stage-row {
        display: grid; grid-template-columns: 1fr auto auto;
        align-items: center; gap: 12px; padding: 14px 18px;
        border-bottom: 1px solid rgba(255,255,255,.04);
      }
      .p-stage-row:last-child { border-bottom: 0; }
      .p-stage-key {
        font-family: 'JetBrains Mono', monospace; font-size: 9.5px;
        letter-spacing: .14em; text-transform: uppercase; color: #5C6770;
      }
      .p-stage-val {
        font-family: 'Inter', sans-serif; font-weight: 700;
        font-size: 22px; letter-spacing: -0.02em; color: #F5F7F4;
        font-variant-numeric: tabular-nums;
      }
      .p-stage-val small { font-size: 12px; font-weight: 500; color: #8A929A; margin-left: 2px; }
      .p-stage-val-lime { color: #7BD389; }
      .p-stage-val-gold { color: #E8C84A; }
      .p-stage-val-100 {
        background: linear-gradient(135deg, #C5A028, #E8C84A);
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      .p-stage-trend {
        font-family: 'JetBrains Mono', monospace; font-size: 10px;
        font-weight: 600; color: #7BD389;
        background: rgba(123,211,137,.10); padding: 3px 7px; border-radius: 4px;
      }
      .p-stage-trend-flat { color: #8A929A; background: rgba(255,255,255,.05); }
      .p-stage-footer {
        display: flex; align-items: center; gap: 6px;
        padding: 12px 16px; border-top: 1px solid rgba(255,255,255,.05);
        font-size: 10.5px; color: #5C6770;
      }

      .p-scroll {
        margin: 56px auto 0; display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 16px; background: rgba(255,255,255,.04);
        border: 1px solid rgba(123,211,137,.14); border-radius: 999px;
        color: #B7C2BB; font-size: 12px; cursor: pointer;
        animation: p-bob 2.4s ease-in-out infinite;
      }
      .p-scroll:hover { color: #E8C84A; border-color: rgba(232,200,74,.3); }
      @keyframes p-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(4px); } }

      /* ── Reveal scroll ── */
      [data-reveal] {
        opacity: 0; transform: translateY(20px);
        transition: opacity .8s cubic-bezier(.2,.8,.2,1), transform .8s cubic-bezier(.2,.8,.2,1);
      }
      [data-reveal].p-revealed { opacity: 1; transform: none; }

      /* ── Section commun ── */
      .p-kicker {
        display: inline-block;
        font-family: 'JetBrains Mono', monospace; font-size: 11px;
        font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
        color: #1B5E20; background: #F7FEF7;
        border: 1px solid rgba(27,94,32,.15);
        padding: 5px 12px; border-radius: 999px; margin-bottom: 14px;
      }
      .p-kicker-gold {
        color: #C5A028 !important; background: #FEF9E7 !important;
        border-color: rgba(197,160,40,.20) !important;
      }
      .p-h2 {
        font-family: 'Inter', sans-serif; font-weight: 800;
        font-size: clamp(28px, 3.4vw, 44px);
        letter-spacing: -0.025em; line-height: 1.1;
        color: #0A1F0C; margin: 0;
      }
      .p-sub {
        font-size: 15px; color: #6B7280; max-width: 640px;
        margin: 14px auto 0; line-height: 1.6;
      }

      /* ── Bento ── */
      .p-bento {
        display: grid; grid-template-columns: repeat(6, 1fr);
        gap: 14px; grid-auto-rows: minmax(170px, auto);
      }
      .p-bento-card {
        position: relative; overflow: hidden;
        border-radius: 18px; padding: 24px; display: flex; flex-direction: column;
        transition: all .3s cubic-bezier(.2,.8,.2,1);
      }
      .p-bento-card:hover { transform: translateY(-3px); }
      .p-bento-white {
        background: linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%);
        border: 1px solid #E5E7EB;
      }
      .p-bento-white:hover {
        border-color: rgba(27,94,32,.30);
        box-shadow: 0 12px 28px -8px rgba(15,23,42,.10);
      }
      .p-bento-deep {
        color: #FFFFFF;
        background:
          radial-gradient(80% 60% at 100% 0%, rgba(197,160,40,0.22), transparent 55%),
          radial-gradient(80% 60% at 0% 100%, rgba(76,175,80,0.18), transparent 55%),
          linear-gradient(180deg, #0A1F0C 0%, #143818 100%);
        border: 1px solid rgba(197,160,40,0.20);
      }
      .p-bento-icon {
        width: 40px; height: 40px; border-radius: 12px;
        background: #F7FEF7; color: #1B5E20;
        display: grid; place-items: center;
        margin-bottom: 14px;
      }
      .p-bento-tag {
        font-family: 'JetBrains Mono', monospace; font-size: 10.5px;
        font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
        color: #1B5E20; margin: 0 0 8px;
      }
      .p-bento-deep .p-bento-tag { color: #E8C84A; }
      .p-bento-title {
        font-family: 'Inter', sans-serif; font-weight: 700;
        font-size: 19px; letter-spacing: -0.02em; line-height: 1.2;
        color: #0A1F0C; margin: 0 0 8px; max-width: 320px;
      }
      .p-bento-deep .p-bento-title { color: #FFFFFF; font-size: 28px; max-width: 460px; }
      .p-bento-body {
        font-size: 13px; color: #6B7280; line-height: 1.55; margin: 0; max-width: 320px;
      }
      .p-bento-deep .p-bento-body { color: rgba(255,255,255,0.78); font-size: 14.5px; max-width: 460px; }

      /* Illustration "100%" dans la bento card deep */
      .p-bento-illu {
        position: absolute; right: 28px; bottom: 28px;
        display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
      }
      .p-100 {
        display: inline-flex; align-items: baseline;
        font-family: 'Inter', sans-serif; font-weight: 800;
        letter-spacing: -0.04em; line-height: .9;
        background: linear-gradient(135deg, #C5A028 0%, #E8C84A 50%, #D4AF37 100%);
        background-size: 200% 100%;
        -webkit-background-clip: text; background-clip: text; color: transparent;
        animation: p-shimmer 4s ease-in-out infinite;
        filter: drop-shadow(0 4px 16px rgba(232,200,74,0.35));
      }
      .p-100-num { font-size: 88px; }
      .p-100-pct { font-size: 56px; margin-left: 4px; }
      .p-100-sub {
        font-family: 'JetBrains Mono', monospace; font-size: 10px;
        letter-spacing: .16em; text-transform: uppercase; color: #E8C84A;
      }
      @keyframes p-shimmer { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

      @media (max-width: 768px) {
        .p-bento { grid-template-columns: repeat(2, 1fr); }
        .p-bento-card { grid-column: span 2 !important; grid-row: span 1 !important; }
        .p-bento-deep .p-bento-title { font-size: 22px; }
        .p-100-num { font-size: 64px; }
        .p-100-pct { font-size: 40px; }
      }

      /* ── Chips "pour qui" ── */
      .p-chip {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 9px 16px; border-radius: 999px;
        background: white; border: 1px solid #E5E7EB;
        font-size: 13.5px; font-weight: 500; color: #374151;
        transition: all .25s cubic-bezier(.2,.8,.2,1);
        opacity: 0; transform: translateY(8px);
        animation: p-chip-in .6s cubic-bezier(.2,.8,.2,1) forwards;
      }
      .p-chip:hover {
        border-color: rgba(27,94,32,.4); color: #1B5E20;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px -6px rgba(15,23,42,.10);
      }
      @keyframes p-chip-in { to { opacity: 1; transform: translateY(0); } }

      /* ── Timeline étapes ── */
      .p-timeline {
        position: relative; display: grid;
        grid-template-columns: repeat(4, 1fr); gap: 24px;
      }
      .p-timeline-line {
        position: absolute; left: 7%; right: 7%; top: 28px; height: 2px;
        background: linear-gradient(90deg, transparent, rgba(27,94,32,.3), rgba(197,160,40,.3), transparent);
      }
      .p-step {
        position: relative; text-align: center;
        background: white; padding: 20px 16px 22px;
        border-radius: 18px; border: 1px solid #F1F5F9;
        transition: all .3s cubic-bezier(.2,.8,.2,1);
        z-index: 1;
      }
      .p-step:hover {
        border-color: rgba(27,94,32,.30);
        transform: translateY(-3px);
        box-shadow: 0 12px 28px -8px rgba(15,23,42,.08);
      }
      .p-step-icon {
        width: 56px; height: 56px; border-radius: 16px;
        background: linear-gradient(135deg, #1B5E20, #2E7D32);
        color: white; display: grid; place-items: center;
        margin: 0 auto 12px;
        box-shadow: 0 8px 20px -8px rgba(27,94,32,.45);
      }
      .p-step-num {
        display: inline-block; font-family: 'JetBrains Mono', monospace;
        font-size: 10.5px; font-weight: 600;
        color: #C5A028; background: #FEF9E7;
        padding: 2px 8px; border-radius: 4px;
        letter-spacing: .12em; margin-bottom: 8px;
      }
      .p-step-title {
        font-family: 'Inter', sans-serif; font-weight: 700; font-size: 15px;
        color: #0A1F0C; margin: 0 0 4px; letter-spacing: -0.01em;
      }
      .p-step-desc { font-size: 12.5px; color: #6B7280; margin: 0; line-height: 1.5; }

      @media (max-width: 768px) {
        .p-timeline { grid-template-columns: 1fr; }
        .p-timeline-line { display: none; }
      }

      /* ── Feature card (modèle) ── */
      .p-feat {
        display: flex; align-items: flex-start; gap: 14px;
        padding: 18px 20px; background: white;
        border: 1px solid #F1F5F9; border-radius: 14px;
        transition: all .25s cubic-bezier(.2,.8,.2,1);
      }
      .p-feat:hover {
        border-color: rgba(27,94,32,.25);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px -8px rgba(15,23,42,.06);
      }
      .p-feat-icon {
        width: 38px; height: 38px; border-radius: 10px;
        display: grid; place-items: center; flex-shrink: 0;
        transition: transform .25s;
      }
      .p-feat:hover .p-feat-icon { transform: scale(1.08); }

      /* ── CTA card ── */
      .p-cta-card {
        position: relative; overflow: hidden;
        border-radius: 22px; padding: 32px 28px;
        background:
          radial-gradient(80% 60% at 100% 0%, rgba(197,160,40,0.22), transparent 55%),
          radial-gradient(80% 60% at 0% 100%, rgba(76,175,80,0.18), transparent 55%),
          linear-gradient(180deg, #0A1F0C 0%, #143818 100%);
        border: 1px solid rgba(197,160,40,0.20);
        box-shadow: 0 24px 48px -16px rgba(10,31,12,0.35);
      }

      /* ── Reduced motion ── */
      @media (prefers-reduced-motion: reduce) {
        .p-hero-bg, .p-o1, .p-o2, .p-o3, .p-w > span, .p-pill, .p-lede,
        .p-cta-row, .p-stats, .p-stage-wrap, .p-scroll, .p-stage-livedot,
        .p-100, .p-chip {
          animation: none !important;
          opacity: 1 !important;
          transform: none !important;
        }
        [data-reveal] { opacity: 1; transform: none; transition: none; }
      }
    `}</style>
  );
}
