import React from "react";
import LegalLayout from "../components/legal/LegalLayout";
import { Section, SubSection, InfoBox } from "../components/legal/Section";

export default function CGU() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" version="Version du 08.03.2026">
      <InfoBox color="green">
        <strong>BIENVENUE SUR SWINGMARKET ! LA MARKETPLACE SPÉCIALISÉE DANS LE SECTEUR DU GOLF</strong>
      </InfoBox>

      <div className="mt-8 space-y-2">

        <Section title="1. L'OBJET DE SWINGMARKET">
          <p>
            La Plateforme SWINGMARKET permet de mettre en relation, des vendeurs (ci-après « <strong>les Vendeurs</strong> ») de matériel de golf (clubs, balles, sacs, chariots, accessoires et vêtements golf) et leurs accessoires (ci-après « <strong>les Produits</strong> ») avec des clients consommateurs (ci-après « <strong>les Clients</strong> »).
          </p>
          <p>Les présentes Conditions Générales d'Utilisation (CGU) :</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>ont pour objet de fixer les dispositions contractuelles relatives aux droits et obligations respectifs des Parties dans le cadre de l'utilisation de la Plateforme et de l'ensemble des Services qui y sont proposés</li>
            <li>sont conclues entre la société DANIEL PARTNERS Société à Responsabilité Limitée, au capital social de 2.700 euros, immatriculée au RCS de Versailles sous le numéro 927 678 169, dont le siège social est situé au 6 rue des Vignes 78910 Tacoignières qui édite la Plateforme (ci-après « <strong>DANIEL PARTNERS</strong> ») et l'Utilisateur (ci-après désignées collectivement les « <strong>Parties</strong> » ou individuellement une « <strong>Partie</strong> »).</li>
            <li>ne confèrent en aucun cas aux Utilisateurs la qualité de salarié, mandataire, agent ou représentant de DANIEL PARTNERS.</li>
          </ul>
        </Section>

        <Section title="2. QUELQUES DÉFINITIONS">
          <p>Les termes, mentionnés ci-dessous, ont dans les présentes Conditions Générales d'Utilisation, la signification suivante :</p>
          <div className="space-y-3 mt-4">
            {[
              ["Back-Office", "désigne l'interface permettant au Vendeur d'accéder à son espace personnel à partir duquel il pourra notamment gérer sa Page Home, son catalogue de Produits, ses Commandes, le suivi de son activité."],
              ["Catalogue", "désigne le catalogue de Produits du Vendeur présenté à la vente sur la Plateforme."],
              ["Client", "désigne toute personne qui garantit avoir la qualité de consommateur telle que définie par le droit et la jurisprudence française, qui accède à la Plateforme et procède à une Commande de Produits. Le Client est une personne physique qui agit à des fins qui n'entrent pas dans le cadre de son activité commerciale, industrielle, artisanale, libérale ou agricole."],
              ["Commande", "désigne l'achat de Produit réalisé par un Client sur la Plateforme."],
              ["Compte", "désigne l'espace au sein duquel est regroupé l'ensemble des données fournies par le Client."],
              ["Conditions Générales d'Utilisation ou CGU", "désigne les présentes conditions contractuelles mises à disposition sur la page d'accueil de la Plateforme régissant l'utilisation de celle-ci et que tout Utilisateur de la Plateforme doit accepter lors de son inscription sur la Plateforme, qu'il soit Vendeur ou Client."],
              ["Conditions Générales de Services ou CGS", "désigne les conditions contractuelles encadrant la fourniture de Services par DANIEL PARTNERS aux Vendeurs."],
              ["Contenus", "désigne l'ensemble des informations, textes, logos, marques, animations, dessins et modèles, photographies, images, données et de façon générale tous les éléments et contenus de l'Utilisateur publiés sur la Plateforme selon les modalités, la forme et les conditions qui lui sont proposées dans le cadre des Services."],
              ["Fiche Produit", "désigne l'offre commerciale liée à un Produit publiée par le Vendeur, devant fournir l'ensemble des informations essentielles légalement requises."],
              ["Identifiants", "désigne l'adresse e-mail et le mot de passe choisis par le Client ou par le Vendeur lui permettant de se connecter à son Compte ou à son Back-Office."],
              ["Page Home", "désigne la page de la Plateforme dédiée à la présentation d'un Vendeur."],
              ["Plateforme", "désigne la Plateforme en ligne accessible à l'adresse suivante : www.swingmarket.fr. La Plateforme regroupe l'ensemble des pages web, Services et fonctionnalités proposés aux Utilisateurs."],
              ["Prestataire de Services de Paiement ou PSP", "désigne la société détentrice d'un agrément bancaire fournissant par l'intermédiaire de DANIEL PARTNERS, ses services de paiement aux Vendeurs afin de leur permettre d'encaisser les paiements des Clients. Le PSP choisi par DANIEL PARTNERS est Stripe Payments Europe, Ltd., société de droit irlandais, dont le siège social est situé à the One Building, 1, Lower Grand Canal Street, Dublin 2, Ireland, et habilitée à exercer son activité au sein de l'Espace Economique Européen, en qualité d'établissement de monnaie électronique agréé par la Banque Centrale d'Irlande sous le numéro C187865. Le PSP dispose d'une filiale en France (« Stripe France »), immatriculée au Registre du Commerce et des Sociétés de Paris sous le numéro 807 572 011 et dont le siège est au 10 Boulevard Haussmann, 75009 – Paris."],
              ["Produits", "désigne le matériel de golf (clubs tels que drivers, bois, hybrides, fers, wedges et putters ; balles de golf ; sacs de golf ; chariots manuels et électriques ; accessoires golf ; équipements d'entraînement ; vêtements et chaussures golf) et leurs accessoires pouvant être commercialisés sur la Plateforme par un Vendeur."],
              ["Services", "désigne l'ensemble des services proposés par DANIEL PARTNERS aux Utilisateurs par l'intermédiaire de la Plateforme."],
              ["Utilisateur", "désigne toute personne qui accède et navigue sur la Plateforme, qu'il soit Vendeur, Client ou simple internaute."],
              ["Vendeur", <>désigne toute personne qui accède et s'inscrit sur la Plateforme afin de pouvoir commercialiser ses Produits aux Clients. Le Vendeur peut être :<br /><br />
                Un <strong>Vendeur consommateur</strong> c'est-à-dire une personne physique qui agit à des fins qui n'entrent pas dans le cadre de son activité commerciale, industrielle, artisanale, libérale ou agricole.<br /><br />
                Un <strong>Vendeur professionnel</strong> c'est-à-dire une personne physique ou morale, publique ou privée, qui agit à des fins entrant dans le cadre de son activité commerciale, industrielle, artisanale, libérale ou agricole, y compris lorsqu'elle agit au nom ou pour le compte d'un autre professionnel.</>],
            ].map(([term, def]) => (
              <div key={String(term)} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-1 bg-[#1B5E20] rounded-full shrink-0" />
                <div>
                  <span className="font-semibold text-gray-800">« {term} » : </span>
                  <span className="text-gray-600">{def}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="3. ACCEPTATION DES CGU">
          <p>
            L'utilisation des fonctionnalités de la Plateforme et des Services implique l'acceptation des présentes CGU.
          </p>
          <p>
            Ainsi, l'Utilisateur s'engage à lire attentivement les présentes Conditions Générales d'Utilisation lors de l'accès à la Plateforme et est invité à les imprimer et à en conserver une copie.
          </p>
          <p>
            Les présentes CGU sont disponibles dans le footer de la Plateforme au moyen d'un lien hypertexte et peuvent être consultées à tout moment.
          </p>
        </Section>

        <Section title="4. PRÉREQUIS TECHNIQUES">
          <p>
            L'Utilisateur reconnaît disposer des moyens et des compétences nécessaires pour l'utilisation des Services.
          </p>
          <p>
            Les équipements nécessaires à l'accès et à l'utilisation de la Plateforme et des Services sont à la charge de l'Utilisateur, de même que les frais de télécommunications éventuellement induits par leur utilisation.
          </p>
        </Section>

        <Section title="5. QUEL EST LE RÔLE DE DANIEL PARTNERS ?">
          <SubSection title="5.1. Présentation de l'intervention de DANIEL PARTNERS, simple intermédiaire">
            <p>La Plateforme éditée par DANIEL PARTNERS consiste à référencer les Vendeurs et à mettre en relation, par voie électronique, les Clients et les Vendeurs en vue de la vente de Produits.</p>
            <p>Les indications disponibles sur la Fiche Produit sont établies par le Vendeur.</p>
            <p>DANIEL PARTNERS n'exerce aucun contrôle sur les Fiches Produits, ni sur tout autre Contenu publié sur la Page Home dédiée au Vendeur.</p>
            <p>En sa qualité de fournisseur de place de marché en ligne, DANIEL PARTNERS intervient comme simple intermédiaire technique.</p>
            <p>DANIEL PARTNERS est rémunérée par des frais de services et par une commission sur chaque Commande, à la charge des Clients.</p>
          </SubSection>
          <SubSection title="5.2. Obligation générale d'information précontractuelle">
            <p>En tant que fournisseur de place de marché en ligne, DANIEL PARTNERS agit de manière neutre, claire et transparente.</p>
            <p>DANIEL PARTNERS n'entretient aucun lien capitalistique ou de quelconque dépendance juridique avec un des Vendeurs référencés sur la Plateforme qui influencerait le classement des Fiches Produits ou le référencement des Vendeurs. Aucune rémunération qui influencerait le classement des Vendeurs référencés n'est perçue par DANIEL PARTNERS.</p>
          </SubSection>
          <SubSection title="5.3. Transparence financière">
            <p>Conformément à l'article 242 bis du Code général des impôts, en tant qu'opérateur de plateforme, DANIEL PARTNERS informe, à chaque transaction, tout Utilisateur qui génère des revenus via sa Plateforme sur ses obligations civiles et fiscales.</p>
            <p>Les informations utiles sont accessibles à partir des liens suivants :</p>
            <p><strong>Concernant les obligations fiscales :</strong></p>
            <ul className="list-disc ml-5 space-y-1">
              <li><a href="https://entreprendre.service-public.fr/vosdroits/N13442" target="_blank" rel="noopener noreferrer" className="text-[#1B5E20] hover:underline">https://entreprendre.service-public.fr/vosdroits/N13442</a></li>
            </ul>
            <p><strong>Concernant les obligations sociales :</strong></p>
            <ul className="list-disc ml-5 space-y-1">
              <li><a href="https://www.urssaf.fr/portail/" target="_blank" rel="noopener noreferrer" className="text-[#1B5E20] hover:underline">https://www.urssaf.fr/portail/</a></li>
              <li><a href="https://www.urssaf.fr/portail/home/espaces-dedies/activites-relevant-de-leconomie.html" target="_blank" rel="noopener noreferrer" className="text-[#1B5E20] hover:underline">https://www.urssaf.fr/portail/home/espaces-dedies/activites-relevant-de-leconomie.html</a></li>
            </ul>
            <p>En matière de protection sociale, ces revenus doivent pouvoir ouvrir des droits à l'assurance maladie ou à la retraite. Cela vaut également en matière de fiscalité : les revenus générés doivent être soumis à l'impôt.</p>
            <p>Chaque Utilisateur de la Plateforme est seul responsable de ses obligations légales. Les règles ci-dessus exposées sont précisées à titre indicatif et sont susceptibles d'être modifiées. En cas de doute, il est recommandé à l'Utilisateur de se rapprocher de son centre des impôts et/ou de sa caisse de sécurité sociale.</p>
          </SubSection>
        </Section>

        <Section title="6. CRÉATION DE COMPTE ET INSCRIPTION">
          <SubSection title="6.1. Conditions d'inscription">
            <p>Tout Utilisateur souhaitant accéder aux Services de la Plateforme doit créer un Compte en renseignant les informations suivantes :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Prénom et nom</li>
              <li>Adresse e-mail valide</li>
              <li>Mot de passe sécurisé</li>
              <li>Statut : particulier ou professionnel</li>
            </ul>
            <p>L'Utilisateur doit accepter les présentes CGU pour finaliser son inscription.</p>
            <p>L'Utilisateur garantit que les informations fournies lors de son inscription sont exactes, complètes et à jour.</p>
          </SubSection>
          <SubSection title="6.2. Compte professionnel">
            <p>
              Les Vendeurs professionnels (boutiques golf, pro shops, distributeurs de matériel golf) doivent fournir des informations complémentaires vérifiables : dénomination sociale, numéro SIRET, adresse du siège social. Ces informations sont affichées sur leur profil public dans un souci de transparence vis-à-vis des Acheteurs.
            </p>
          </SubSection>
          <SubSection title="6.3. Un seul Compte par Utilisateur">
            <p>
              Chaque Utilisateur ne peut détenir qu'un seul Compte actif. La création de plusieurs Comptes par un même Utilisateur est strictement interdite et peut entraîner la suspension immédiate de l'ensemble des Comptes concernés.
            </p>
          </SubSection>
          <SubSection title="6.4. Vérification d'identité (KYC)">
            <p>
              Conformément à la réglementation européenne en matière de lutte contre le blanchiment d'argent et le financement du terrorisme, notre PSP Stripe procède à une vérification d'identité (KYC) dès la première vente. Le Vendeur devra fournir une pièce d'identité en cours de validité et un justificatif de domicile récent.
            </p>
          </SubSection>
        </Section>

        <Section title="7. GESTION DU COMPTE">
          <SubSection title="7.1. Confidentialité des Identifiants">
            <p>L'Utilisateur est seul responsable de la confidentialité de ses Identifiants. Toute utilisation du Compte avec ses Identifiants est présumée être réalisée par l'Utilisateur lui-même. En cas de perte ou de vol, l'Utilisateur doit immédiatement modifier son mot de passe et contacter DANIEL PARTNERS.</p>
          </SubSection>
          <SubSection title="7.2. Fonctionnalités du Compte Client">
            <p>Le Compte Client donne accès aux fonctionnalités suivantes :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Achat de matériel golf et suivi des Commandes</li>
              <li>Gestion de la liste de favoris</li>
              <li>Messagerie interne avec les Vendeurs</li>
              <li>Dépôt d'avis et d'évaluations sur les Vendeurs</li>
              <li>Gestion des informations personnelles et adresses de livraison</li>
            </ul>
          </SubSection>
          <SubSection title="7.3. Fonctionnalités du Back-Office Vendeur">
            <p>Le Back-Office Vendeur donne accès aux fonctionnalités suivantes :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Publication et gestion des annonces de matériel golf</li>
              <li>Suivi des ventes, revenus et statistiques</li>
              <li>Messagerie interne avec les Acheteurs</li>
              <li>Personnalisation de la Page Home (boutique)</li>
              <li>Choix des transporteurs partenaires</li>
              <li>Gestion des enchères golf</li>
            </ul>
          </SubSection>
          <SubSection title="7.4. Clôture du Compte">
            <p>
              L'Utilisateur peut clôturer son Compte à tout moment en contactant DANIEL PARTNERS à l'adresse{" "}
              <a href="mailto:contact@swingmarket.fr" className="text-[#1B5E20] hover:underline">contact@swingmarket.fr</a>. La clôture entraîne la suppression des données personnelles dans les délais légaux applicables, sous réserve des obligations de conservation légale.
            </p>
          </SubSection>
        </Section>

        <Section title="8. PUBLICATION D'ANNONCES">
          <SubSection title="8.1. Produits autorisés">
            <p>Seuls les Produits relevant du golf et de son univers peuvent être mis en vente sur SwingMarket :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Clubs de golf : drivers, bois de parcours, hybrides, fers, wedges, putters, sets complets</li>
              <li>Balles de golf : neuves, remises à neuf, lake balls</li>
              <li>Sacs de golf : stand bag, cart bag, staff bag, travel bag</li>
              <li>Chariots de golf : manuels, électriques, télécommandés</li>
              <li>Accessoires golf : télémètres laser, GPS, tees, gants, grips, pitch forks</li>
              <li>Équipements d'entraînement : simulateurs, putting mats, filets de frappe, analyseurs de swing</li>
              <li>Vêtements et chaussures golf techniques</li>
              <li>Locations de vacances à proximité de parcours de golf</li>
            </ul>
            <p>Tout Produit ne relevant pas de ces catégories sera supprimé sans préavis.</p>
          </SubSection>
          <SubSection title="8.2. Produits interdits">
            <p>Sont strictement interdits à la vente sur la Plateforme :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Tout produit contrefait ou portant atteinte aux droits de propriété intellectuelle</li>
              <li>Tout produit dangereux ou non conforme aux normes de sécurité en vigueur</li>
              <li>Tout produit dont la vente est illégale en France</li>
              <li>Tout produit volé ou dont la provenance est douteuse</li>
            </ul>
          </SubSection>
          <SubSection title="8.3. Obligations du Vendeur">
            <p>Le Vendeur s'engage à :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Décrire fidèlement et précisément les Produits (état réel, marque, caractéristiques techniques)</li>
              <li>Fixer un prix cohérent avec l'état et le marché du matériel golf d'occasion</li>
              <li>Publier des photos représentatives et de qualité suffisante</li>
              <li>Confirmer la disponibilité du Produit dans les 72h suivant une vente</li>
              <li>Expédier le Produit dans les délais annoncés</li>
              <li>Ne pas publier de contenu illicite, trompeur ou portant atteinte aux droits de tiers</li>
            </ul>
          </SubSection>
          <SubSection title="8.4. Mise en vente gratuite">
            <InfoBox color="green">
              La publication d'annonces sur SwingMarket est <strong>entièrement gratuite</strong>. Une commission dégressive est prélevée uniquement lors d'une transaction réussie.
            </InfoBox>
          </SubSection>
        </Section>

        <Section title="9. OBLIGATIONS ET COMPORTEMENT DES UTILISATEURS">
          <p>Les Utilisateurs s'engagent à :</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Respecter les présentes CGU et l'ensemble des lois et réglementations applicables</li>
            <li>Ne pas utiliser de données d'identification fictives ou usurpées</li>
            <li>Ne pas harceler, insulter, menacer ou tenir des propos discriminatoires envers d'autres Utilisateurs</li>
            <li>Ne pas publier de contenus à caractère pornographique, raciste, diffamatoire ou contraire à l'ordre public</li>
            <li>Ne pas tenter de contourner les mécanismes de paiement sécurisés de la Plateforme</li>
            <li>Ne pas utiliser la messagerie interne à des fins commerciales non liées à une annonce</li>
            <li>Ne pas publier de fausses annonces, de faux avis ou de fausses descriptions de matériel golf</li>
            <li>Ne pas introduire de virus, malwares ou tout code malveillant sur la Plateforme</li>
          </ul>
          <p className="mt-3">
            Tout manquement aux présentes obligations peut entraîner la <strong>suspension immédiate ou la suppression définitive</strong> du Compte, sans préavis ni indemnité, et sans préjudice de toute action en justice que DANIEL PARTNERS se réserve le droit d'engager.
          </p>
        </Section>

        <Section title="10. AVIS ET ÉVALUATIONS">
          <p>
            À l'issue de chaque transaction, l'Acheteur est invité à évaluer le Vendeur (note de 1 à 5 étoiles et commentaire libre). Les avis sont publiés publiquement sur le profil du Vendeur.
          </p>
          <p>
            DANIEL PARTNERS se réserve le droit de modérer et de supprimer tout avis contenant des propos injurieux, diffamatoires, contraires aux bonnes mœurs ou aux présentes CGU.
          </p>
          <InfoBox color="amber">
            Les avis publiés sur SwingMarket sont uniquement issus d'Acheteurs ayant effectivement réalisé une transaction. Tout avis frauduleux engage la responsabilité de son auteur.
          </InfoBox>
        </Section>

        <Section title="11. RESPONSABILITÉ DE DANIEL PARTNERS">
          <SubSection title="11.1. Limitation de responsabilité">
            <p>DANIEL PARTNERS agit en qualité d'intermédiaire technique et ne saurait être tenue responsable :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Des contenus publiés par les Vendeurs sur leurs annonces de matériel golf</li>
              <li>De la qualité, de la conformité ou de la disponibilité des Produits mis en vente</li>
              <li>Des litiges nés entre Vendeurs et Acheteurs, sous réserve de son rôle de médiation</li>
              <li>Des interruptions temporaires du Service pour maintenance ou force majeure</li>
            </ul>
          </SubSection>
          <SubSection title="11.2. Protection SwingMarket Safety">
            <p>
              DANIEL PARTNERS met en place le programme <strong>SwingMarket Safety</strong> qui garantit à l'Acheteur une protection en cas de litige : les fonds sont conservés en séquestre pendant 48h après confirmation de livraison, permettant à l'Acheteur de signaler tout problème avant le virement au Vendeur.
            </p>
          </SubSection>
        </Section>

        <Section title="12. PROTECTION DES DONNÉES PERSONNELLES">
          <p>
            DANIEL PARTNERS s'engage à protéger les données personnelles de ses Utilisateurs conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés. Consultez notre{" "}
            <a href="/Confidentialite" className="text-[#1B5E20] font-medium hover:underline">Politique de Confidentialité</a> pour plus de détails sur la collecte, le traitement et la conservation de vos données.
          </p>
        </Section>

        <Section title="13. PROPRIÉTÉ INTELLECTUELLE">
          <p>
            L'ensemble des éléments constituant la Plateforme SwingMarket (textes, graphiques, logiciels, photographies, logos, marques, bases de données) est protégé par le droit de la propriété intellectuelle et constitue la propriété exclusive de DANIEL PARTNERS ou de ses partenaires.
          </p>
          <p>
            Les Utilisateurs conservent la propriété de leurs Contenus publiés sur la Plateforme mais accordent à DANIEL PARTNERS une licence d'utilisation non exclusive, gratuite et mondiale pour les besoins du fonctionnement du Service.
          </p>
          <p>
            Toute reproduction, même partielle, de la Plateforme ou de ses éléments sans autorisation préalable écrite de DANIEL PARTNERS est strictement interdite.
          </p>
        </Section>

        <Section title="14. MODIFICATIONS DES CGU">
          <p>
            DANIEL PARTNERS se réserve le droit de modifier les présentes CGU à tout moment. Les Utilisateurs seront informés de toute modification significative par email ou par notification sur la Plateforme. L'utilisation de la Plateforme après notification vaut acceptation des nouvelles CGU.
          </p>
        </Section>

        <Section title="15. LOI APPLICABLE ET JURIDICTION COMPÉTENTE">
          <p>
            Les présentes CGU sont soumises au droit français. En cas de litige relatif à leur interprétation ou à leur exécution, les Parties s'engagent à rechercher une solution amiable avant tout recours judiciaire.
          </p>
          <InfoBox color="blue">
            La marketplace SwingMarket est régie par le droit français. En cas de litige non résolu à l'amiable, les tribunaux français seront seuls compétents, sauf dispositions légales impératives contraires applicables au consommateur.
          </InfoBox>
        </Section>

      </div>
    </LegalLayout>
  );
}