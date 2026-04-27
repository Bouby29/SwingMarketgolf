import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown, Search, User, Tag, ShieldCheck, Truck,
  ShoppingBag, ArrowRight, Mail, Sparkles, HelpCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import LegalLayout from "../components/legal/LegalLayout";
import { useQuery } from "@tanstack/react-query";
import { entities } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────
// Sections statiques (fallback si la DB est vide)
// La section "Vacances Golf" a été supprimée de la marketplace.
// ─────────────────────────────────────────────────────────
const sections = [
  {
    id: "compte",
    title: "Mon compte",
    Icon: User,
    color: "#1B5E20",
    bg: "#F7FEF7",
    items: [
      {
        q: "Comment créer mon compte ?",
        a: "Cliquez sur « Connexion » puis suivez les instructions d'inscription. Vous devrez renseigner votre prénom, nom, email, mot de passe, date de naissance et indiquer si vous souhaitez vendre en tant que particulier ou professionnel. Vous recevrez un email de confirmation — vérifiez vos spams. Le mot de passe doit contenir au moins 8 caractères dont une majuscule, un chiffre et un caractère spécial.",
      },
      {
        q: "J'ai oublié mon mot de passe, que faire ?",
        a: "Cliquez sur « Se connecter » puis sur « Mot de passe oublié ». Saisissez votre email et cliquez sur « Récupérer ». Vous recevrez un lien de réinitialisation par email. Pour des raisons de sécurité, nous n'enverrons jamais votre ancien mot de passe.",
      },
      {
        q: "Comment modifier mes informations personnelles ?",
        a: "Rendez-vous dans votre tableau de bord, puis dans votre profil. Vous pouvez modifier votre nom, photo, bannière, bio, numéro de téléphone et localisation.",
      },
      {
        q: "Je suis mineur(e), puis-je utiliser SwingMarket ?",
        a: "SwingMarket est réservé aux personnes majeures (18 ans et plus). Si vous êtes mineur, vous devez obtenir l'autorisation de votre représentant légal. Tout compte créé par un mineur sans autorisation sera supprimé.",
      },
      {
        q: "Je suis professionnel, puis-je vendre sur SwingMarket ?",
        a: "Oui, SwingMarket permet aux vendeurs professionnels (boutiques, pro shops, marques) de proposer leurs articles. Lors de l'inscription, sélectionnez « Vendeur professionnel ». Vous devrez fournir vos informations professionnelles (SIRET, dénomination sociale, adresse). Vos annonces seront clairement identifiées comme provenant d'un vendeur professionnel.",
      },
    ],
  },
  {
    id: "produits",
    title: "Produits & Annonces",
    Icon: Tag,
    color: "#1B5E20",
    bg: "#F7FEF7",
    items: [
      {
        q: "Comment mettre en ligne une annonce ?",
        a: "Cliquez sur « Vendre » dans la barre de navigation. Si vous n'êtes pas connecté, vous serez invité à créer un compte. Remplissez ensuite le formulaire : titre, description, prix, état, marque, catégorie, photos et taille du colis. La mise en vente est entièrement gratuite !",
      },
      {
        q: "Comment bien vendre mon matériel de golf ?",
        a: "Pour vendre rapidement : ajoutez des photos de qualité (fond neutre, plusieurs angles), rédigez une description complète (marque, modèle, loft, flex du shaft, état précis, taille...) et fixez un prix cohérent avec le marché. Pensez à soigner vos échanges avec les acheteurs via la messagerie.",
      },
      {
        q: "Comment modifier ou supprimer une annonce ?",
        a: "Rendez-vous dans votre tableau de bord > Mes annonces. Vous pouvez y modifier les détails de votre annonce (photos, prix, description) ou la désactiver. Une annonce vendue passe automatiquement en statut « Vendu ».",
      },
      {
        q: "Quelles catégories sont disponibles ?",
        a: "SwingMarket propose : Clubs de golf (drivers, bois, hybrides, fers, wedges, putters, sets complets, shafts, grips), Balles de golf, Chariots (manuels et électriques), Sacs de golf, Accessoires (télémètres, GPS, tees, gants...), Équipement d'entraînement (simulateurs, putting mats...) et Vêtements golf.",
      },
      {
        q: "Puis-je vendre des balles recyclées ?",
        a: "Oui, les balles recyclées ont leur propre sous-catégorie. Précisez bien dans la description le grade de qualité (Grade A, B, C) et la marque pour aider les acheteurs à choisir.",
      },
    ],
  },
  {
    id: "paiement",
    title: "Paiement & Sécurité",
    Icon: ShieldCheck,
    color: "#C5A028",
    bg: "#FEF9E7",
    items: [
      {
        q: "Mon paiement est-il sécurisé ?",
        a: "Absolument. Sur SwingMarket, les paiements transitent de façon sécurisée et chiffrée directement vers les serveurs bancaires de Stripe. SwingMarket ne stocke jamais vos coordonnées bancaires. L'argent est conservé et sécurisé jusqu'à la confirmation de réception par l'acheteur.",
      },
      {
        q: "Quels sont les moyens de paiement disponibles ?",
        a: "Sur SwingMarket, vos paiements sont 100% sécurisés grâce à notre partenaire Stripe. Vous pouvez payer par : carte bancaire (Visa, Mastercard, American Express), Apple Pay, Google Pay, Klarna (paiement en plusieurs fois) et Bancontact (Belgique).",
      },
      {
        q: "Quelle est la commission SwingMarket ?",
        a: "SwingMarket prélève une commission dégressive selon le prix de l'article, à la charge de l'acheteur :\n\n• 0 € à 99,99 € → 10% + 0,70 € (ex : article à 50 € → commission de 5,70 €)\n• 100 € à 299,99 € → 8% + 0,70 € (ex : article à 150 € → commission de 12,70 €)\n• 300 € à 999,99 € → 6% + 0,70 € (ex : article à 500 € → commission de 30,70 €)\n• 1 000 € et plus → 4% + 0,70 € (ex : article à 1 000 € → commission de 40,70 €)\n\nLa commission s'ajoute au prix de l'article et aux frais de livraison. Le vendeur reçoit 100% du prix affiché, la mise en vente est entièrement gratuite.",
      },
      {
        q: "Quand le vendeur reçoit-il son paiement ?",
        a: "L'argent est sécurisé par Stripe lors de l'achat. Le vendeur reçoit son paiement après confirmation de la bonne réception de l'article par l'acheteur. En l'absence de réponse de l'acheteur dans les 5 jours suivant la livraison, le paiement est automatiquement débloqué.",
      },
      {
        q: "Comment ajouter mon RIB pour recevoir mes paiements ?",
        a: "Rendez-vous dans votre tableau de bord > Mes informations bancaires > Ajouter un compte bancaire. Vous devrez renseigner votre IBAN. Attention : la vérification d'identité (pièce d'identité + justificatif de domicile) est obligatoire pour débloquer vos paiements, conformément à la réglementation Stripe KYC.",
      },
      {
        q: "Puis-je négocier le prix ?",
        a: "Oui, il est possible de négocier dans la limite du raisonnable. Contactez le vendeur via la messagerie interne pour lui soumettre une offre. Si le vendeur accepte, il mettra à jour le prix de son annonce avant que vous ne passiez commande.",
      },
    ],
  },
  {
    id: "livraison",
    title: "Expédition & Livraison",
    Icon: Truck,
    color: "#1B5E20",
    bg: "#F7FEF7",
    items: [
      {
        q: "Quels transporteurs sont disponibles ?",
        a: "SwingMarket propose trois options : Mondial Relay (livraison en point relais, le plus économique), La Poste Colissimo (livraison à domicile) et Chronopost (livraison express J+1). L'acheteur choisit son transporteur préféré au moment du paiement.",
      },
      {
        q: "Comment sont calculés les frais de port ?",
        a: "Les frais de port sont calculés automatiquement en fonction de la taille du colis choisie par le vendeur lors de la création de l'annonce (Petit, Moyen, Grand) et du transporteur sélectionné par l'acheteur. Les tarifs sont affichés de façon transparente avant validation de la commande.",
      },
      {
        q: "Combien de temps le vendeur a-t-il pour expédier ?",
        a: "Dès qu'une vente est réalisée, le vendeur dispose de 72 heures maximum pour confirmer la disponibilité du produit et procéder à l'expédition. Sans confirmation dans ce délai, la commande est automatiquement annulée et l'acheteur intégralement remboursé.",
      },
      {
        q: "En cas de perte de colis, quelles sont mes indemnisations ?",
        a: "En cas de perte de colis, contactez immédiatement le support SwingMarket. Les niveaux d'indemnisation dépendent du transporteur choisi. Nous vous recommandons de déclarer la valeur réelle de votre colis lors de l'expédition pour bénéficier d'une couverture optimale.",
      },
    ],
  },
  {
    id: "commandes",
    title: "Commandes",
    Icon: ShoppingBag,
    color: "#1B5E20",
    bg: "#F7FEF7",
    items: [
      {
        q: "Comment passer une commande ?",
        a: "Acheter sur SwingMarket est très simple ! Sélectionnez l'article qui vous intéresse et cliquez sur « Acheter ». Choisissez votre mode de livraison préféré. Renseignez votre adresse et moyen de paiement. Confirmez et payez. C'est tout !",
      },
      {
        q: "Qu'est-ce que la protection acheteur SwingMarket ?",
        a: "La Protection Acheteur SwingMarket vous permet de faire vos achats en toute sérénité. Vos paiements sont protégés contre la fraude. L'argent est conservé par Stripe jusqu'à confirmation de réception. En cas de non-conformité, ouvrez un litige et notre équipe vous accompagne.",
      },
      {
        q: "J'ai reçu un article non conforme, que faire ?",
        a: "Vous disposez de 72 heures après réception pour signaler le problème depuis votre espace commandes (bouton « Ouvrir un litige »). Décrivez le problème avec photos à l'appui. Notre équipe SwingMarket intervient comme médiateur pour trouver une solution équitable.",
      },
      {
        q: "Puis-je bénéficier du droit de rétractation ?",
        a: "Pour les achats auprès de vendeurs professionnels : oui, vous disposez de 14 jours après réception pour exercer votre droit de rétractation, sans motif ni pénalité (conformément à l'article L.221-18 du Code de la consommation). Pour les transactions entre particuliers : le droit de rétractation légal ne s'applique pas, mais SwingMarket encourage la résolution amiable.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────
// Item d'accordéon
// ─────────────────────────────────────────────────────────
function FAQItem({ q, a, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full text-left py-4 px-1 flex items-center justify-between gap-4 group transition-colors"
      >
        <span className={`font-semibold text-[15px] leading-snug transition-colors ${
          open ? "text-[#0F172A]" : "text-gray-800 group-hover:text-[#1B5E20]"
        }`}>
          {q}
        </span>
        <span
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
            open ? "rotate-180" : ""
          }`}
          style={{ background: open ? color : "#F1F5F9", color: open ? "#fff" : "#475569" }}
        >
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
        style={{
          maxHeight: open ? 600 : 0,
          opacity: open ? 1 : 0,
        }}
      >
        <p className="text-[14px] text-gray-600 leading-relaxed pb-4 pl-1 pr-1 whitespace-pre-line">
          {a}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Page FAQ
// ─────────────────────────────────────────────────────────
export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: dbEntries = [] } = useQuery({
    queryKey: ["faq-entries-public"],
    queryFn: () => entities.FAQEntry.filter({ is_active: true }, "order"),
  });

  // Si entries DB → on utilise — sinon fallback statique
  const activeSections = useMemo(() => {
    if (dbEntries.length === 0) return sections;
    // Map DB entries vers la même structure (avec icône par défaut)
    return Object.entries(
      dbEntries.reduce((acc, e) => {
        if (!acc[e.category]) acc[e.category] = [];
        acc[e.category].push({ q: e.question, a: e.answer });
        return acc;
      }, {})
    ).map(([title, items], idx) => ({
      id: `db-${idx}`,
      title,
      items,
      Icon: HelpCircle,
      color: "#1B5E20",
      bg: "#F7FEF7",
    }));
  }, [dbEntries]);

  const filtered = useMemo(() => {
    if (!searchTerm) return activeSections;
    const s = searchTerm.toLowerCase();
    return activeSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (it) => it.q.toLowerCase().includes(s) || it.a.toLowerCase().includes(s)
        ),
      }))
      .filter((sec) => sec.items.length > 0);
  }, [activeSections, searchTerm]);

  const totalQuestions = activeSections.reduce((sum, s) => sum + s.items.length, 0);

  const scrollToSection = (id) => {
    document.getElementById(`faq-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <LegalLayout
      title="Questions Fréquentes"
      version=""
      seoTitle="FAQ | SwingMarket"
      seoDescription="Consultez la FAQ de SwingMarket, la marketplace dédiée au golf d'occasion. Réponses sur les achats, ventes, paiements et livraisons."
    >
      {/* Eyebrow + intro */}
      <div className="mb-7">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#1B5E20] bg-[#F7FEF7] border border-[#1B5E20]/15 rounded-full px-3 py-1 mb-4">
          <Sparkles className="w-3 h-3" />
          {totalQuestions} réponses · mises à jour régulièrement
        </span>
        <p className="text-[15px] text-gray-500 leading-relaxed max-w-2xl">
          Tout ce qu'il faut savoir pour acheter et vendre votre matériel de golf
          en toute sérénité. Une question reste sans réponse&nbsp;? Notre équipe
          vous répond en moins de 24&nbsp;h.
        </p>
      </div>

      {/* Search bar premium */}
      <div className="mb-8 relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une question…"
          className="pl-13 py-4 rounded-2xl text-[15px] border-gray-200 focus:border-[#1B5E20] focus:ring-4 focus:ring-[#1B5E20]/10 shadow-sm hover:shadow-md transition-shadow"
          style={{ paddingLeft: 52 }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-[#1B5E20] transition-colors"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Quick links — chips de navigation rapide vers chaque section */}
      {!searchTerm && activeSections.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {activeSections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#1B5E20]/30 hover:text-[#1B5E20] rounded-full px-3 py-1.5 transition-all"
            >
              <section.Icon className="w-3.5 h-3.5" />
              {section.title}
            </button>
          ))}
        </div>
      )}

      {/* Résultats vides */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-gray-700 font-semibold mb-1">Aucun résultat trouvé</p>
          <p className="text-sm text-gray-500 mb-4">
            Aucune question ne correspond à « <span className="text-gray-700 font-medium">{searchTerm}</span> ».
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="text-sm font-medium text-[#1B5E20] hover:underline"
          >
            Effacer la recherche
          </button>
        </div>
      ) : (
        <div className="space-y-7">
          {filtered.map((section) => (
            <section
              key={section.id}
              id={`faq-${section.id}`}
              className="scroll-mt-24 bg-white border border-gray-100 rounded-[14px] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header de section */}
              <header className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/60 to-transparent">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: section.bg, color: section.color }}
                >
                  <section.Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[16px] font-bold text-[#0F172A] tracking-tight">
                    {section.title}
                  </h2>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    {section.items.length} question{section.items.length > 1 ? "s" : ""}
                  </p>
                </div>
              </header>

              {/* Liste des questions */}
              <div className="px-6 divide-y divide-gray-100">
                {section.items.map((item) => (
                  <FAQItem
                    key={item.q}
                    q={item.q}
                    a={item.a}
                    color={section.color}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* CTA final — vers la page Contact */}
      <div
        className="mt-14 relative overflow-hidden rounded-[20px]"
        style={{
          background:
            "radial-gradient(80% 60% at 100% 0%, rgba(197,160,40,0.22), transparent 55%)," +
            "radial-gradient(80% 60% at 0% 100%, rgba(76,175,80,0.18), transparent 55%)," +
            "linear-gradient(180deg, #0A1F0C 0%, #143818 100%)",
          border: "1px solid rgba(27,94,32,0.18)",
          boxShadow: "0 24px 48px -16px rgba(10,31,12,0.35)",
        }}
      >
        {/* Halos de lumière en surcouche (purement décoratifs) */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.06) 0%, transparent 40%)," +
              "radial-gradient(circle at 80% 70%, rgba(255,255,255,0.04) 0%, transparent 40%)",
          }}
        />

        <div className="relative px-7 sm:px-10 py-10 sm:py-12 text-center">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
            style={{
              background: "rgba(197,160,40,0.18)",
              border: "1px solid rgba(197,160,40,0.35)",
            }}
          >
            <HelpCircle className="w-5 h-5" style={{ color: "#E8C84A" }} />
          </div>

          <h3
            className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-3"
            style={{ color: "#FFFFFF" }}
          >
            Vous n'avez pas trouvé votre réponse&nbsp;?
          </h3>
          <p
            className="text-[14.5px] max-w-md mx-auto mb-7 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.78)" }}
          >
            Notre équipe support vous accompagne — réponse personnalisée
            sous <span style={{ color: "#E8C84A", fontWeight: 600 }}>24&nbsp;h ouvrées</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/Contact" className="group">
              <button
                className="inline-flex items-center gap-2 font-semibold rounded-full px-6 py-3 text-sm transition-all hover:-translate-y-0.5"
                style={{
                  background: "#C5A028",
                  color: "#1a1305",
                  boxShadow: "0 14px 32px -10px rgba(197,160,40,0.55)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#D4AF37"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#C5A028"; }}
              >
                Contacter le support
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </Link>
            <a
              href="mailto:contact@swingmarketgolf.com"
              className="inline-flex items-center gap-2 text-[13px] font-medium transition-colors group"
              style={{ color: "rgba(255,255,255,0.78)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.78)"; }}
            >
              <Mail className="w-3.5 h-3.5" />
              <span style={{ borderBottom: "1px solid rgba(255,255,255,0.25)" }}>
                contact@swingmarketgolf.com
              </span>
            </a>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
}
