import React, { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import LegalLayout from "../components/legal/LegalLayout";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/lib/supabase";

// Fallback statique si la DB est vide
const sections = [
  {
    title: "🔐 Mon compte",
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
    title: "🏌️ Produits & Annonces",
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
        a: "SwingMarket propose : Clubs de golf (drivers, bois, hybrides, fers, wedges, putters, sets complets, shafts, grips), Balles de golf, Chariots (manuels et électriques), Sacs de golf, Accessoires (télémètres, GPS, tees, gants...), Équipement d'entraînement (simulateurs, putting mats...), Vêtements golf, et Vacances golf (locations de logements à proximité de parcours).",
      },
      {
        q: "Puis-je vendre des balles recyclées ?",
        a: "Oui, les balles recyclées ont leur propre sous-catégorie. Précisez bien dans la description le grade de qualité (Grade A, B, C) et la marque pour aider les acheteurs à choisir.",
      },
    ],
  },
  {
    title: "💳 Paiement & Sécurité",
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
    title: "🚚 Expédition & Livraison",
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
    title: "📦 Commandes",
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
  {
    title: "🏡 Vacances Golf",
    items: [
      {
        q: "Comment fonctionnent les locations de vacances golf ?",
        a: "Les propriétaires publient leurs logements (maisons, appartements, villas, resorts) avec photos, description, localisation, distance au golf le plus proche, prix par nuit et disponibilités. Vous pouvez contacter le propriétaire via la messagerie et réserver directement sur la plateforme.",
      },
      {
        q: "Les locations sont-elles sécurisées ?",
        a: "Oui, comme pour les produits, les paiements de location transitent par Stripe pour garantir la sécurité de la transaction. L'argent est sécurisé jusqu'à confirmation d'arrivée.",
      },
      {
        q: "Quelles sont les conditions d'annulation ?",
        a: "Les conditions d'annulation (politique flexible, modérée ou stricte) sont fixées par chaque propriétaire et clairement indiquées sur l'annonce avant réservation.",
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-4 flex items-center justify-between gap-4 hover:text-[#1B5E20] transition-colors"
      >
        <span className="font-medium text-gray-900">{q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-[#1B5E20]" : ""}`} />
      </button>
      {open && (
        <div className="pb-4">
          <p className="text-sm text-gray-600 leading-relaxed bg-green-50 rounded-xl p-4">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: dbEntries = [] } = useQuery({
    queryKey: ["faq-entries-public"],
    queryFn: () => base44.entities.FAQEntry.filter({ is_active: true }, "order"),
  });

  // Si des entrées existent en DB, on les utilise — sinon on utilise le fallback statique
  const activeSections = dbEntries.length > 0
    ? Object.entries(
        dbEntries.reduce((acc, e) => {
          if (!acc[e.category]) acc[e.category] = [];
          acc[e.category].push({ q: e.question, a: e.answer });
          return acc;
        }, {})
      ).map(([title, items]) => ({ title, items }))
    : sections;

  const filtered = searchTerm
    ? activeSections.map(s => ({
        ...s,
        items: s.items.filter(
          item =>
            item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.a.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      })).filter(s => s.items.length > 0)
    : activeSections;

  return (
    <LegalLayout title="Questions Fréquentes" version="" seoTitle="FAQ | SwingMarket" seoDescription="Consultez la FAQ de SwingMarket, la marketplace dédiée au golf d'occasion. Réponses sur les achats, ventes, paiements et livraisons.">
      <div className="mb-8 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Rechercher dans la FAQ..."
          className="pl-12 py-3 rounded-full text-base"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Aucun résultat pour « {searchTerm} »</p>
          <button onClick={() => setSearchTerm("")} className="text-[#1B5E20] mt-2 text-sm hover:underline">Effacer la recherche</button>
        </div>
      ) : (
        <div className="space-y-8">
          {filtered.map(section => (
            <div key={section.title}>
              <h2 className="text-lg font-bold text-[#1B5E20] mb-4 flex items-center gap-2">
                {section.title}
              </h2>
              <div className="bg-gray-50 rounded-2xl px-6 divide-y divide-gray-100">
                {section.items.map(item => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-[#1B5E20] rounded-2xl text-white text-center">
        <h3 className="font-bold text-lg">Vous n'avez pas trouvé votre réponse ?</h3>
        <p className="text-green-200 text-sm mt-1">Notre équipe est disponible pour vous aider</p>
        <a
          href="mailto:contact@swingmarket.fr"
          className="inline-block mt-4 px-6 py-2 bg-[#C5A028] hover:bg-[#D4AF37] text-white rounded-full font-semibold text-sm transition-colors"
        >
          Nous contacter
        </a>
      </div>
    </LegalLayout>
  );
}