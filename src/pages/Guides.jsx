import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart, Tag, Package, CreditCard, Shield, MessageSquare,
  Camera, Truck, CheckCircle, AlertTriangle, Clock, FileText,
  ArrowRight, ArrowDown, Search, Sparkles, Star, BookOpen,
  Users, Lock, Award, Zap,
} from "lucide-react";
import SEOHead from "../components/seo/SEOHead";
import MobileHeader from "../components/layout/MobileHeader";

// ─────────────────────────────────────────────────────────
// Étapes du Guide Vendeur
// ─────────────────────────────────────────────────────────
const SELLER_STEPS = [
  {
    icon: Camera,
    title: "Préparez vos photos",
    desc: "Fond neutre, lumière naturelle, plusieurs angles. Une belle photo augmente vos chances de vente de 70%.",
    tips: ["Photographiez chaque face du club", "Mettez en valeur les défauts éventuels", "Évitez les filtres et retouches"],
  },
  {
    icon: FileText,
    title: "Rédigez votre annonce",
    desc: "Soyez précis : marque, modèle, année, état exact, mensurations. Plus vous êtes transparent, plus la confiance s'installe.",
    tips: ["Indiquez le loft, le flex, la longueur", "Précisez l'état (neuf, comme neuf, bon état…)", "Mentionnez les éventuelles réparations"],
  },
  {
    icon: Tag,
    title: "Fixez le bon prix",
    desc: "Comparez avec des annonces similaires. Un prix juste se vend en moyenne 3× plus vite qu'un prix surévalué.",
    tips: ["Consultez le prix neuf du modèle", "Décotez de 30-50% selon l'état", "Acceptez la négociation raisonnable"],
  },
  {
    icon: MessageSquare,
    title: "Répondez vite et bien",
    desc: "Les acheteurs aiment quand le vendeur est réactif. Activez les notifications pour ne rien manquer.",
    tips: ["Répondez sous 12h en moyenne", "Restez courtois même en cas de désaccord", "Envoyez des photos supplémentaires si demandées"],
  },
  {
    icon: Truck,
    title: "Expédiez sous 72 h",
    desc: "Une fois la vente confirmée, emballez avec soin et expédiez rapidement. Le tracking est notre meilleur ami.",
    tips: ["Utilisez du papier bulle ou de la mousse", "Renseignez le numéro de suivi", "Envoyez une photo du colis prêt"],
  },
  {
    icon: CheckCircle,
    title: "Recevez votre paiement",
    desc: "Dès que l'acheteur confirme la réception, votre argent est débloqué automatiquement sur votre RIB.",
    tips: ["Vérifiez votre IBAN dans votre profil", "Le KYC Stripe est obligatoire (CNI + justif)", "Délai de virement : 1 à 3 jours ouvrés"],
  },
];

// ─────────────────────────────────────────────────────────
// Étapes du Guide Acheteur
// ─────────────────────────────────────────────────────────
const BUYER_STEPS = [
  {
    icon: Search,
    title: "Trouvez votre matériel",
    desc: "Parcourez la marketplace ou utilisez notre bourse aux recherches pour décrire votre besoin précis.",
    tips: ["Filtrez par catégorie, marque, état", "Postez votre recherche si rien ne convient", "Activez les alertes pour de nouvelles annonces"],
  },
  {
    icon: MessageSquare,
    title: "Posez vos questions",
    desc: "Notre messagerie sécurisée vous permet d'échanger directement avec le vendeur avant tout achat.",
    tips: ["Demandez des photos détaillées", "Vérifiez l'état précis du club", "Négociez le prix si nécessaire"],
  },
  {
    icon: CreditCard,
    title: "Payez en sécurité",
    desc: "Paiement 100% sécurisé via Stripe. Carte, Apple Pay, Google Pay, Klarna en plusieurs fois.",
    tips: ["Aucune donnée bancaire stockée chez nous", "Argent bloqué jusqu'à confirmation", "Reçu PDF envoyé automatiquement"],
  },
  {
    icon: Truck,
    title: "Suivez votre livraison",
    desc: "Mondial Relay, Colissimo ou Chronopost express. Le tracking apparaît dans votre espace commandes.",
    tips: ["Choisissez votre mode de livraison", "Notifications à chaque étape", "Délai moyen : 2 à 5 jours ouvrés"],
  },
  {
    icon: Shield,
    title: "Confirmez la réception",
    desc: "Vérifiez l'article dès réception. Tout va bien ? Confirmez et le vendeur reçoit son paiement.",
    tips: ["Inspectez l'article sous 72h", "Photographiez tout problème éventuel", "Confirmez en un clic depuis votre espace"],
  },
  {
    icon: AlertTriangle,
    title: "Litige ? On vous accompagne",
    desc: "Article non conforme, perte du colis, vendeur injoignable ? Notre équipe intervient comme médiateur.",
    tips: ["Bouton « Ouvrir un litige » dans la commande", "Décrivez avec photos à l'appui", "Réponse de l'équipe sous 24h"],
  },
];

// ─────────────────────────────────────────────────────────
// Garanties / Trust strip
// ─────────────────────────────────────────────────────────
const TRUST_BADGES = [
  { Icon: Lock,    label: "Paiement sécurisé Stripe" },
  { Icon: Shield,  label: "Protection acheteur incluse" },
  { Icon: Award,   label: "Vendeurs vérifiés" },
  { Icon: Zap,     label: "Réponse support < 24h" },
];

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
            e.target.classList.add("g-revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ─────────────────────────────────────────────────────────
// Page Guides
// ─────────────────────────────────────────────────────────
export default function Guides() {
  const [activeTab, setActiveTab] = useState("seller");
  const sellerRef = useRef(null);
  const buyerRef = useRef(null);

  useReveal();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const scrollTo = (which) => {
    const el = which === "seller" ? sellerRef.current : buyerRef.current;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Style />
      <SEOHead
        title="Guides Acheteur & Vendeur — SwingMarket Golf"
        description="Tout savoir pour acheter et vendre votre matériel de golf en toute sécurité sur SwingMarket : guides pas-à-pas, conseils pratiques, paiement sécurisé Stripe."
        url="https://swingmarketgolf.com/Guides"
      />
      <MobileHeader title="Guides" showBack />

      <div className="min-h-screen bg-[#FAFAFA]">
        {/* ════════ HERO ════════ */}
        <section className="g-hero">
          <div className="g-hero-bg" aria-hidden />
          <div className="g-hero-grid" aria-hidden />
          <div className="g-orbits" aria-hidden>
            <div className="g-o g-o1" /><div className="g-o g-o2" /><div className="g-o g-o3" />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-24 text-center">
            <span className="g-pill">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guides pratiques · mis à jour 2026</span>
            </span>

            <h1 className="g-h1">
              <span className="g-w" style={{ "--i": 0 }}><span>Achetez,&nbsp;</span></span>
              <span className="g-w g-grad-lime" style={{ "--i": 1 }}><span>vendez,</span></span>
              <br />
              <span className="g-w" style={{ "--i": 2 }}><span>en&nbsp;</span></span>
              <span className="g-w g-grad-gold" style={{ "--i": 3 }}><span>toute&nbsp;</span></span>
              <span className="g-w g-grad-gold" style={{ "--i": 4 }}><span>sérénité.</span></span>
            </h1>

            <p className="g-lede">
              Deux parcours, six étapes, zéro mauvaise surprise.
              SwingMarketGolf vous guide pas à pas — que vous vendiez votre
              vieux driver ou que vous chassiez le set parfait.
            </p>

            {/* Tabs */}
            <div className="g-tabs">
              <button
                onClick={() => { setActiveTab("seller"); scrollTo("seller"); }}
                className={`g-tab ${activeTab === "seller" ? "g-tab-active" : ""}`}
              >
                <Tag className="w-4 h-4" />
                Je vends mon matériel
              </button>
              <button
                onClick={() => { setActiveTab("buyer"); scrollTo("buyer"); }}
                className={`g-tab ${activeTab === "buyer" ? "g-tab-active" : ""}`}
              >
                <ShoppingCart className="w-4 h-4" />
                J'achète du matériel
              </button>
            </div>

            {/* Scroll hint */}
            <div className="g-scroll">
              <span>Découvrir les étapes</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </section>

        {/* ════════ TRUST STRIP ════════ */}
        <section className="max-w-5xl mx-auto px-4 -mt-12 relative z-10" data-reveal>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGES.map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F7FEF7] flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5 text-[#1B5E20]" />
                </div>
                <span className="text-[12.5px] font-medium text-gray-700 leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ════════ GUIDE VENDEUR ════════ */}
        <section ref={sellerRef} id="vendeur" className="max-w-5xl mx-auto px-4 pt-24 pb-16 scroll-mt-20">
          <SectionHeader
            tone="green"
            kicker="Guide vendeur · 6 étapes"
            title="Vendez votre matériel de golf"
            subtitle="Mise en ligne en 5 minutes, paiement sécurisé, expédition simple. La vente sur SwingMarket, c'est la transparence du début à la fin."
            Icon={Tag}
          />

          <div className="grid md:grid-cols-2 gap-5 mt-10">
            {SELLER_STEPS.map((step, idx) => (
              <StepCard key={step.title} step={step} idx={idx} tone="green" />
            ))}
          </div>

          <CTACard
            tone="green"
            title="Prêt à mettre votre matériel en vente ?"
            subtitle="Création d'annonce gratuite — paiement sécurisé Stripe."
            ctaLabel="Créer une annonce"
            ctaTo="/CreateListing"
          />
        </section>

        {/* ════════ GUIDE ACHETEUR ════════ */}
        <section ref={buyerRef} id="acheteur" className="max-w-5xl mx-auto px-4 pt-16 pb-16 scroll-mt-20">
          <SectionHeader
            tone="gold"
            kicker="Guide acheteur · 6 étapes"
            title="Achetez en toute confiance"
            subtitle="Vendeurs vérifiés, paiement bloqué jusqu'à réception, médiation en cas de pépin. Le golf d'occasion sans prendre de risque."
            Icon={ShoppingCart}
          />

          <div className="grid md:grid-cols-2 gap-5 mt-10">
            {BUYER_STEPS.map((step, idx) => (
              <StepCard key={step.title} step={step} idx={idx} tone="gold" />
            ))}
          </div>

          <CTACard
            tone="gold"
            title="Trouvez le matériel qu'il vous faut"
            subtitle="8 400+ annonces vérifiées · livraison suivie · protection acheteur incluse."
            ctaLabel="Parcourir la marketplace"
            ctaTo="/Marketplace"
          />
        </section>

        {/* ════════ FAQ TEASER ════════ */}
        <section className="max-w-5xl mx-auto px-4 pb-24" data-reveal>
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F7FEF7] border border-[#1B5E20]/15 mb-4">
              <Sparkles className="w-5 h-5 text-[#1B5E20]" />
            </div>
            <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2">
              Une question reste sans réponse ?
            </h3>
            <p className="text-[14.5px] text-gray-500 max-w-md mx-auto mb-6">
              Notre FAQ couvre les questions les plus fréquentes —
              ou contactez directement notre équipe support.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/FAQ">
                <button className="inline-flex items-center justify-center gap-2 bg-[#0A1F0C] hover:bg-black text-white font-semibold rounded-full px-6 py-3 text-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
                  Consulter la FAQ
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/Contact">
                <button className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#1B5E20]/40 hover:text-[#1B5E20] text-gray-700 font-semibold rounded-full px-6 py-3 text-sm transition-all">
                  Contacter le support
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
// Composants
// ─────────────────────────────────────────────────────────
function SectionHeader({ tone, kicker, title, subtitle, Icon }) {
  const isGreen = tone === "green";
  const accent = isGreen ? "#1B5E20" : "#C5A028";
  const bg = isGreen ? "#F7FEF7" : "#FEF9E7";
  return (
    <div className="text-center" data-reveal>
      <div
        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
        style={{ background: bg, color: accent }}
      >
        <Icon className="w-6 h-6" />
      </div>
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.16em] mb-3"
        style={{ color: accent }}
      >
        {kicker}
      </p>
      <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] tracking-tight leading-tight mb-3">
        {title}
      </h2>
      <p className="text-[15px] text-gray-500 max-w-2xl mx-auto leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}

function StepCard({ step, idx, tone }) {
  const [open, setOpen] = useState(false);
  const isGreen = tone === "green";
  const accent = isGreen ? "#1B5E20" : "#C5A028";
  const bg = isGreen ? "#F7FEF7" : "#FEF9E7";
  const Icon = step.icon;

  return (
    <article
      data-reveal
      className="g-step group bg-white rounded-2xl border border-gray-100 hover:border-[#1B5E20]/30 hover:shadow-lg p-6 transition-all duration-300 cursor-pointer"
      onClick={() => setOpen((o) => !o)}
      style={{ transitionDelay: `${idx * 40}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Step number + icon */}
        <div className="relative shrink-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: bg, color: accent }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <span
            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center text-white shadow-md"
            style={{ background: accent }}
          >
            {String(idx + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-[#0F172A] tracking-tight mb-1.5 leading-snug">
            {step.title}
          </h3>
          <p className="text-[13.5px] text-gray-600 leading-relaxed">
            {step.desc}
          </p>

          {/* Tips (expand on hover/click) */}
          <div
            className="overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out"
            style={{
              maxHeight: open ? 240 : 0,
              opacity: open ? 1 : 0,
              marginTop: open ? 14 : 0,
            }}
          >
            <ul className="space-y-1.5 pl-1 border-l-2" style={{ borderColor: accent + "33" }}>
              {step.tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2 pl-3 text-[12.5px] text-gray-500 leading-snug">
                  <CheckCircle className="w-3 h-3 mt-1 shrink-0" style={{ color: accent }} />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold transition-colors"
            style={{ color: accent }}
          >
            {open ? "Masquer les conseils" : "Voir nos conseils"}
            <ArrowRight
              className="w-3 h-3 transition-transform"
              style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
            />
          </button>
        </div>
      </div>
    </article>
  );
}

function CTACard({ tone, title, subtitle, ctaLabel, ctaTo }) {
  const isGreen = tone === "green";
  return (
    <div
      data-reveal
      className="mt-12 relative overflow-hidden rounded-[20px] p-8 sm:p-10 text-center"
      style={{
        background: isGreen
          ? "radial-gradient(80% 60% at 100% 0%, rgba(197,160,40,0.18), transparent 55%)," +
            "radial-gradient(80% 60% at 0% 100%, rgba(76,175,80,0.16), transparent 55%)," +
            "linear-gradient(180deg, #0A1F0C 0%, #143818 100%)"
          : "radial-gradient(80% 60% at 100% 0%, rgba(76,175,80,0.18), transparent 55%)," +
            "radial-gradient(80% 60% at 0% 100%, rgba(197,160,40,0.22), transparent 55%)," +
            "linear-gradient(180deg, #1a1305 0%, #2a1f0a 100%)",
        border: "1px solid rgba(197,160,40,0.20)",
        boxShadow: "0 24px 48px -16px rgba(10,31,12,0.35)",
      }}
    >
      <h3
        className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-3"
        style={{ color: "#FFFFFF" }}
      >
        {title}
      </h3>
      <p
        className="text-[14.5px] max-w-md mx-auto mb-7 leading-relaxed"
        style={{ color: "rgba(255,255,255,0.78)" }}
      >
        {subtitle}
      </p>
      <Link to={ctaTo} className="group inline-block">
        <button
          className="inline-flex items-center gap-2 font-semibold rounded-full px-7 py-3 text-sm transition-all hover:-translate-y-0.5"
          style={{
            background: "#C5A028",
            color: "#1a1305",
            boxShadow: "0 14px 32px -10px rgba(197,160,40,0.55)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#D4AF37"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#C5A028"; }}
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Styles partagés (animations, hero)
// ─────────────────────────────────────────────────────────
function Style() {
  return (
    <style>{`
      /* ── Hero ── */
      .g-hero {
        position: relative;
        background: linear-gradient(180deg, #0A1F0C 0%, #061309 100%);
        color: #E5E7EB;
        overflow: hidden;
        isolation: isolate;
      }
      .g-hero-bg {
        position: absolute; inset: -20% -10% auto -10%; height: 70%;
        z-index: 0; pointer-events: none; filter: blur(70px); opacity: .55;
        background:
          radial-gradient(40% 50% at 30% 50%, rgba(76,175,80,.30), transparent 60%),
          radial-gradient(40% 50% at 75% 30%, rgba(197,160,40,.26), transparent 60%);
        animation: g-drift 22s ease-in-out infinite;
      }
      @keyframes g-drift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(2%,1.5%)} }
      .g-hero-grid {
        position: absolute; inset: 0; pointer-events: none; z-index: 0;
        background-image:
          linear-gradient(rgba(123,211,137,.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(123,211,137,.05) 1px, transparent 1px);
        background-size: 56px 56px;
        mask-image: radial-gradient(ellipse 80% 80% at 50% 30%, black 30%, transparent 90%);
        -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 30%, black 30%, transparent 90%);
      }
      .g-orbits { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
      .g-o {
        position: absolute; left: 50%; top: 70%;
        border-radius: 50%; transform: translate(-50%,-50%);
        opacity: 0; animation: g-orbits-in 1.6s .3s ease-out forwards;
      }
      @keyframes g-orbits-in { to { opacity: 1; } }
      .g-o1 { width: 480px;  height: 480px;  border: 1px dashed rgba(123,211,137,.10); animation: g-orbits-in 1.6s .3s ease-out forwards, g-spin 60s linear infinite; }
      .g-o2 { width: 720px;  height: 720px;  border: 1px solid  rgba(255,255,255,.05); animation: g-orbits-in 1.6s .3s ease-out forwards, g-spin-rev 90s linear infinite; }
      .g-o3 { width: 1000px; height: 1000px; border: 1px dashed rgba(123,211,137,.06); animation: g-orbits-in 1.6s .3s ease-out forwards, g-spin 120s linear infinite; }
      @keyframes g-spin     { to { transform: translate(-50%,-50%) rotate(360deg); } }
      @keyframes g-spin-rev { to { transform: translate(-50%,-50%) rotate(-360deg); } }

      .g-pill {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 6px 14px;
        background: rgba(255,255,255,.04);
        border: 1px solid rgba(123,211,137,.18);
        border-radius: 999px;
        font-size: 11.5px; color: #B7C2BB;
        backdrop-filter: blur(8px);
        opacity: 0; transform: translateY(10px);
        animation: g-rise .9s .35s cubic-bezier(.2,.8,.2,1) forwards;
        margin-bottom: 24px;
      }

      .g-h1 {
        font-family: 'Inter', sans-serif;
        font-weight: 800;
        font-size: clamp(36px, 5.6vw, 72px);
        letter-spacing: -0.035em;
        line-height: 1.05;
        color: #F5F7F4;
        margin: 0 auto 22px;
        max-width: 880px;
      }
      .g-w { display: inline-block; overflow: hidden; vertical-align: top; }
      .g-w > span {
        display: inline-block;
        transform: translateY(108%);
        animation: g-word .9s cubic-bezier(.2,.8,.2,1) forwards;
        animation-delay: calc(.55s + var(--i, 0) * .08s);
      }
      @keyframes g-word { to { transform: translateY(0); } }
      .g-grad-gold > span {
        background: linear-gradient(180deg, #E8C84A 0%, #C5A028 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        font-style: italic; font-weight: 700;
      }
      .g-grad-lime > span {
        background: linear-gradient(180deg, #FFFFFF 0%, #7BD389 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }

      .g-lede {
        font-size: clamp(15px, 1.3vw, 17px);
        line-height: 1.65; color: #B7C2BB;
        max-width: 580px; margin: 0 auto 32px;
        opacity: 0; animation: g-rise .9s 1.05s cubic-bezier(.2,.8,.2,1) forwards;
      }
      @keyframes g-rise { to { opacity: 1; transform: translateY(0); } }

      .g-tabs {
        display: inline-flex; gap: 8px; padding: 5px;
        background: rgba(255,255,255,.05);
        border: 1px solid rgba(123,211,137,.14);
        border-radius: 999px;
        backdrop-filter: blur(8px);
        opacity: 0; animation: g-rise .9s 1.2s cubic-bezier(.2,.8,.2,1) forwards;
      }
      .g-tab {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 10px 20px; border-radius: 999px;
        font-size: 13px; font-weight: 600; color: rgba(255,255,255,.75);
        background: transparent; border: 0; cursor: pointer;
        transition: all .25s cubic-bezier(.2,.8,.2,1);
      }
      .g-tab:hover { color: #FFFFFF; }
      .g-tab-active {
        background: linear-gradient(135deg, #C5A028, #D4AF37);
        color: #1a1305 !important;
        box-shadow: 0 6px 18px -6px rgba(197,160,40,.55);
      }

      .g-scroll {
        display: inline-flex; align-items: center; gap: 6px;
        margin-top: 36px; padding: 7px 14px;
        background: rgba(255,255,255,.04);
        border: 1px solid rgba(123,211,137,.12);
        border-radius: 999px;
        font-size: 11.5px; color: #B7C2BB;
        opacity: 0;
        animation: g-rise-bob 2.4s 1.6s cubic-bezier(.4,0,.2,1) forwards, g-bob 2.4s 2.3s ease-in-out infinite;
      }
      @keyframes g-rise-bob { to { opacity: 1; transform: translateY(0); } }
      @keyframes g-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(4px); } }

      /* ── Reveal scroll ── */
      [data-reveal] {
        opacity: 0; transform: translateY(20px);
        transition: opacity .8s cubic-bezier(.2,.8,.2,1), transform .8s cubic-bezier(.2,.8,.2,1);
      }
      [data-reveal].g-revealed { opacity: 1; transform: none; }

      /* ── Step card hover lift ── */
      .g-step:hover { transform: translateY(-3px); }

      /* ── Reduced motion ── */
      @media (prefers-reduced-motion: reduce) {
        .g-hero-bg, .g-o1, .g-o2, .g-o3, .g-w > span, .g-pill, .g-lede,
        .g-tabs, .g-scroll {
          animation: none !important;
          opacity: 1 !important;
          transform: none !important;
        }
        [data-reveal] { opacity: 1; transform: none; transition: none; }
      }
    `}</style>
  );
}
