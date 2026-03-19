import React from "react";
import LegalLayout from "../components/legal/LegalLayout";
import { Section, SubSection, InfoBox } from "../components/legal/Section";

export default function CGS() {
  return (
    <LegalLayout title="Conditions Générales de Services — Vendeurs Consommateurs" version="Version du 29.09.2025">
      <InfoBox color="green">
        <strong>DANIEL PARTNERS</strong> édite et exploite la marketplace SwingMarket accessible à l'adresse <strong>www.swingmarket.fr</strong>. Par le biais de la Plateforme, DANIEL PARTNERS permet de mettre en relation des Vendeurs de matériel de golf avec des Clients consommateurs.
      </InfoBox>

      <p className="mt-6 text-gray-600 leading-relaxed">
        Les présentes Conditions Générales de Services (ci-après les « <strong>CGS</strong> » ou le « <strong>Contrat</strong> ») ont vocation à régir la relation contractuelle entre DANIEL PARTNERS et les <strong>Vendeurs Consommateurs</strong> afin de leur permettre de bénéficier des différents Services via la Plateforme. Les Services proposés à des Vendeurs Professionnels font l'objet de conditions contractuelles spécifiques.
      </p>
      <p className="mt-3 text-gray-600 leading-relaxed">
        Le Vendeur reconnaît avoir reçu de la part de DANIEL PARTNERS l'ensemble des informations et conseils lui permettant de bien connaître la teneur des Services, d'apprécier leur adéquation à ses besoins et ainsi d'accepter le Contrat en connaissance de cause.
      </p>

      <InfoBox color="amber">
        <strong>AVERTISSEMENT :</strong> Toute souscription des Services sur la Plateforme par le Vendeur implique l'acceptation sans réserve des présentes Conditions Générales de Services.
      </InfoBox>

      <div className="mt-8 space-y-2">

        <Section title="ARTICLE 1. QUELQUES DÉFINITIONS">
          <div className="space-y-3">
            {[
              ["Back-Office", "désigne l'interface permettant au Vendeur d'accéder à son espace personnel à partir duquel il pourra notamment gérer sa page HOME, son catalogue de Produits, ses Commandes, le suivi de son activité."],
              ["Catalogue", "désigne le catalogue de Produits du Vendeur présenté à la vente sur la Plateforme."],
              ["Client", "désigne toute personne qui garantit avoir la qualité de consommateur telle que définie par le droit et la jurisprudence française, qui accède à la Plateforme et procède à une Commande de Produits. Le Client est une personne physique qui agit à des fins qui n'entrent pas dans le cadre de son activité commerciale, industrielle, artisanale, libérale ou agricole."],
              ["Commande", "désigne l'achat de Produit réalisé par un Client auprès du Vendeur sur la Plateforme."],
              ["Conditions Générales d'Utilisation ou CGU", "désigne les conditions contractuelles mises à disposition sur la page d'accueil de la Plateforme régissant l'utilisation de celle-ci par tout Utilisateur."],
              ["Conditions Générales de Services ou CGS ou Contrat", "désigne les présentes conditions contractuelles conclues entre le Vendeur et DANIEL PARTNERS."],
              ["Contenus", "désigne l'ensemble des informations, textes, logos, marques, animations, dessins et modèles, photographies, vidéos, données et de façon générale tous les éléments et contenus du Vendeur publiés sur la Plateforme selon les modalités prévues dans le cadre des Services."],
              ["Données Personnelles", "désigne toute information se rapportant à une personne physique identifiée ou identifiable, conformément à l'Article 4.1 du RGPD."],
              ["Fiche Produit", "désigne l'offre commerciale liée à un Produit publiée par le Vendeur, devant fournir l'ensemble des informations essentielles légalement requises."],
              ["Identifiants", "désigne l'adresse e-mail et le mot de passe choisis par le Client ou par le Vendeur lui permettant de se connecter à son Compte ou à son Back-Office."],
              ["Informations confidentielles", "désigne toutes les informations financières, juridiques, techniques, commerciales, stratégiques, ainsi que les données, documents de toute nature, dessins, concepts, secrets de fabrication, savoir-faire, systèmes d'information, logiciels, transmis ou portés à la connaissance d'une Partie au titre du Contrat, quels que soient la forme et/ou les supports utilisés."],
              ["Page HOME", "désigne la page de la Plateforme dédiée à la présentation d'un Vendeur."],
              ["Parties", "au pluriel, désigne ensemble DANIEL PARTNERS et le Vendeur. Au singulier, désigne DANIEL PARTNERS ou le Vendeur, de façon indifférenciée."],
              ["Plateforme", "désigne la Plateforme en ligne accessible à l'adresse suivante : www.swingmarket.fr. La Plateforme regroupe l'ensemble des pages web, Services et fonctionnalités proposés aux Utilisateurs."],
              ["Prestataire de Services de Paiement ou PSP", "désigne la société détentrice d'un agrément bancaire fournissant par l'intermédiaire de DANIEL PARTNERS, ses services de paiement aux Vendeurs afin de leur permettre d'encaisser les paiements des Clients. Le PSP choisi par DANIEL PARTNERS est Stripe Payments Europe, Ltd., société de droit irlandais, dont le siège social est situé à the One Building, 1, Lower Grand Canal Street, Dublin 2, Ireland, et habilitée à exercer son activité au sein de l'Espace Economique Européen, en qualité d'établissement de monnaie électronique agréé par la Banque Centrale d'Irlande sous le numéro C187865. Le PSP dispose d'une filiale en France (« Stripe France »), immatriculée au Registre du Commerce et des Sociétés de Paris sous le numéro 807 572 011 et dont le siège est au 10 Boulevard Haussmann, 75009 – Paris."],
              ["Produits", "désigne le matériel de golf (clubs tels que drivers, bois, hybrides, fers, wedges et putters ; balles de golf ; sacs de golf ; chariots manuels et électriques ; accessoires golf ; équipements d'entraînement ; vêtements et chaussures golf) et leurs accessoires pouvant être commercialisés sur la Plateforme par un Vendeur."],
              ["Services", "désigne l'ensemble des services proposés par DANIEL PARTNERS aux Vendeurs par l'intermédiaire de sa Plateforme."],
              ["Utilisateur", "désigne toute personne qui accède et navigue sur la Plateforme, qu'il soit Vendeur, Client ou simple internaute."],
              ["Vendeur", "désigne toute personne qui garantit avoir la qualité de consommateur telle que définie par le droit et la jurisprudence française, qui accède à la Plateforme afin de pouvoir commercialiser ses Produits aux Clients. Le Vendeur est une personne physique qui agit à des fins qui n'entrent pas dans le cadre de son activité commerciale, industrielle, artisanale, libérale ou agricole."],
            ].map(([term, def]) => (
              <div key={term} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-1 bg-[#1B5E20] rounded-full shrink-0" />
                <div>
                  <span className="font-semibold text-gray-800">« {term} » : </span>
                  <span className="text-gray-600">{def}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="ARTICLE 2. DOCUMENTS CONTRACTUELS">
          <p>Le Contrat est composé des documents contractuels suivants, listés par ordre de préséance :</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Les Conditions Générales de Services ;</li>
            <li>Les Annexes.</li>
          </ul>
        </Section>

        <Section title="ARTICLE 3. MODIFICATION DU CONTRAT">
          <p>DANIEL PARTNERS se réserve la possibilité de modifier à tout moment le présent Contrat. Ces modifications seront notifiées au Vendeur sur un support durable au moins trente (30) jours avant l'entrée en vigueur des changements.</p>
          <p>En cas de modifications substantielles des présentes :</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Soit le Vendeur consent auxdites modifications substantielles, auquel cas celles-ci entreront automatiquement en vigueur à la date prévue dans la notification ;</li>
            <li>Soit le Vendeur refuse les modifications substantielles, en adressant à DANIEL PARTNERS, dans les quinze (15) jours suivant la réception de la notification, une LRAR mentionnant expressément son opposition aux modifications. Dans ce cas, les conditions contractuelles applicables au jour de l'engagement initial seront maintenues jusqu'au terme de la Période Contractuelle en cours, sans que le Contrat ne puisse être tacitement renouvelé.</li>
          </ul>
          <p>Le Vendeur accepte expressément que son silence consécutif à l'information donnée au sujet de la modification du Contrat soit considéré comme une acceptation des modifications apportées.</p>
          <p>Ce délai de préavis est susceptible de ne pas s'appliquer si DANIEL PARTNERS est assujettie à une obligation légale ou réglementaire ne permettant pas de respecter ce délai, ou doit faire face à un danger imminent et imprévu (fraude, logiciels malveillants, spams ou risque en matière de cybersécurité).</p>
        </Section>

        <Section title="ARTICLE 4. OBJET">
          <p>Le présent Contrat a pour objet de fixer les conditions et modalités d'accès du Vendeur aux Services ainsi que les droits et obligations respectifs des Parties induits par l'utilisation de ces Services.</p>
        </Section>

        <Section title="ARTICLE 5. MODALITÉS D'ACCÈS AUX SERVICES">
          <p>Pour pouvoir bénéficier des Services, le Vendeur devra compléter le formulaire dédié disponible sur la Plateforme.</p>
          <p>Pour pouvoir être référencé sur la Plateforme, le Vendeur devra :</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Accepter le présent Contrat ainsi que les CGU ;</li>
            <li>Agir en qualité de consommateur ;</li>
            <li>Fournir et maintenir à jour : nom, prénom, adresse e-mail, adresse postale, numéro de téléphone (facultatif à la création du compte) ;</li>
            <li>Fournir la copie d'une pièce d'identité (CNI ou passeport) ;</li>
            <li>Fournir l'ensemble des documents demandés par le PSP ;</li>
            <li>Proposer des Produits correspondant aux catégories disponibles sur la Plateforme ;</li>
            <li>Fournir l'ensemble des Contenus devant figurer sur sa Page HOME, ses Fiches Produits et son Catalogue.</li>
          </ul>
          <InfoBox color="amber">
            Le fait de se présenter faussement comme un consommateur alors que l'on agit à titre professionnel est constitutif d'une pratique commerciale déloyale trompeuse au sens de l'article L.121-2 du Code de la consommation. DANIEL PARTNERS se réserve le droit de suspendre immédiatement tout Vendeur dont la qualité de consommateur serait mise en doute.
          </InfoBox>
        </Section>

        <Section title="ARTICLE 6. DESCRIPTION DES SERVICES">
          <SubSection title="6.1. Services proposés par DANIEL PARTNERS">
            <p>Dans le cadre de son rôle d'intermédiaire, DANIEL PARTNERS met à la disposition du Vendeur :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Un Back-Office permettant la gestion des annonces de matériel golf, commandes et statistiques ;</li>
              <li>Une Page HOME pour présenter son profil de vendeur golf ;</li>
              <li>Un système de messagerie interne sécurisé ;</li>
              <li>Un accès au système de paiement sécurisé via le PSP Stripe ;</li>
              <li>Des solutions d'expédition via les transporteurs partenaires (Mondial Relay, Chronopost, Colissimo) ;</li>
              <li>Un système de gestion des avis acheteurs ;</li>
              <li>La possibilité de créer des ventes aux enchères de matériel golf.</li>
            </ul>
          </SubSection>
          <SubSection title="6.2. Disponibilité des Services">
            <p>DANIEL PARTNERS s'efforce de rendre la Plateforme accessible 24h/24 et 7j/7. Cependant, DANIEL PARTNERS ne garantit pas une disponibilité ininterrompue et se réserve le droit de suspendre l'accès pour des opérations de maintenance ou en cas de force majeure.</p>
          </SubSection>
        </Section>

        <Section title="ARTICLE 7. COMMISSIONS ET TARIFS">
          <SubSection title="7.1. Principe de gratuité à la publication">
            <InfoBox color="green">
              La publication d'annonces sur SwingMarket est <strong>entièrement gratuite</strong>. Aucun abonnement ni frais fixes ne sont demandés au Vendeur Consommateur.
            </InfoBox>
          </SubSection>
          <SubSection title="7.2. Commission sur vente">
            <p>DANIEL PARTNERS perçoit une commission dégressive sur le montant de chaque transaction réussie. Cette commission est prélevée automatiquement par le PSP au moment du paiement de la Commande par le Client.</p>
            <p>La grille tarifaire des commissions est accessible sur la Plateforme et peut être modifiée par DANIEL PARTNERS sous réserve du respect du délai de préavis visé à l'Article 3.</p>
          </SubSection>
          <SubSection title="7.3. Reversement au Vendeur">
            <p>Le montant dû au Vendeur (prix de vente déduction faite de la commission et des frais de livraison) est versé par le PSP sur le compte bancaire du Vendeur après :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Confirmation de la livraison au Client ;</li>
              <li>Expiration du délai de protection de 48 heures sans litige signalé par l'Acheteur (programme SwingMarket Safety).</li>
            </ul>
          </SubSection>
        </Section>

        <Section title="ARTICLE 8. OBLIGATIONS DU VENDEUR">
          <SubSection title="8.1. Exactitude des informations">
            <p>Le Vendeur s'engage à fournir des informations exactes, complètes et à jour sur ses Produits (état réel, marque, caractéristiques techniques du matériel golf) et son identité. Toute fausse déclaration engage sa responsabilité.</p>
          </SubSection>
          <SubSection title="8.2. Respect de la réglementation">
            <p>Le Vendeur s'engage à :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Ne mettre en vente que des Produits dont il est propriétaire et dont la vente est légale en France ;</li>
              <li>Respecter les droits de propriété intellectuelle (ne pas vendre de contrefaçons) ;</li>
              <li>Respecter la réglementation applicable à la vente entre particuliers ;</li>
              <li>Déclarer les revenus issus de ses ventes conformément à la réglementation fiscale et sociale en vigueur ;</li>
              <li>Ne pas vendre un volume de Produits constitutif d'une activité professionnelle sans en avoir fait la déclaration préalable.</li>
            </ul>
          </SubSection>
          <SubSection title="8.3. Gestion des commandes">
            <p>Le Vendeur s'engage à :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Confirmer la disponibilité du Produit dans les 72 heures suivant la réception d'une Commande ;</li>
              <li>Expédier le Produit dans le délai annoncé sur la Fiche Produit ;</li>
              <li>Fournir le numéro de suivi au Client dès l'expédition ;</li>
              <li>Répondre aux messages des Clients dans un délai raisonnable ;</li>
              <li>Gérer les litiges de bonne foi et en coopération avec DANIEL PARTNERS.</li>
            </ul>
          </SubSection>
          <SubSection title="8.4. Contenus publiés">
            <p>Le Vendeur garantit que les Contenus publiés sur la Plateforme :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Sont exacts, honnêtes et ne sont pas trompeurs ;</li>
              <li>Ne portent pas atteinte aux droits de tiers (propriété intellectuelle, vie privée) ;</li>
              <li>Ne contiennent pas de propos illicites, diffamatoires, racistes ou contraires à l'ordre public ;</li>
              <li>Sont des photos originales et représentatives du Produit réel mis en vente.</li>
            </ul>
          </SubSection>
        </Section>

        <Section title="ARTICLE 9. VÉRIFICATION D'IDENTITÉ (KYC)">
          <p>Conformément à la réglementation européenne en matière de lutte contre le blanchiment d'argent et le financement du terrorisme (LCB-FT), le PSP Stripe procède à une vérification d'identité (Know Your Customer — KYC) préalablement à tout versement de fonds au Vendeur.</p>
          <p>Le Vendeur devra fournir :</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Une pièce d'identité en cours de validité (carte nationale d'identité ou passeport) ;</li>
            <li>Un justificatif de domicile de moins de 3 mois ;</li>
            <li>Tout document complémentaire demandé par Stripe dans le cadre de ses obligations réglementaires.</li>
          </ul>
          <InfoBox color="blue">
            Le refus ou l'impossibilité de réaliser la vérification KYC bloquera les versements au Vendeur. DANIEL PARTNERS ne peut être tenu responsable des délais ou blocages liés aux procédures du PSP.
          </InfoBox>
        </Section>

        <Section title="ARTICLE 10. PROTECTION DES DONNÉES PERSONNELLES">
          <p>Dans le cadre de l'exécution du présent Contrat, DANIEL PARTNERS est amenée à traiter des Données Personnelles du Vendeur en sa qualité de Responsable de traitement.</p>
          <p>Ces traitements sont réalisés conformément au Règlement Général sur la Protection des Données (RGPD) (UE) 2016/679 et à la loi Informatique et Libertés. Pour plus d'informations, le Vendeur est invité à consulter la{" "}
            <a href="/Confidentialite" className="text-[#1B5E20] font-medium hover:underline">Politique de Confidentialité</a> de la Plateforme.
          </p>
        </Section>

        <Section title="ARTICLE 11. PROPRIÉTÉ INTELLECTUELLE">
          <SubSection title="11.1. Droits de DANIEL PARTNERS">
            <p>DANIEL PARTNERS est titulaire de l'ensemble des droits de propriété intellectuelle relatifs à la Plateforme. Le Vendeur s'engage à ne pas reproduire, représenter, modifier ou exploiter tout ou partie de la Plateforme sans autorisation préalable écrite de DANIEL PARTNERS.</p>
          </SubSection>
          <SubSection title="11.2. Droits du Vendeur sur ses Contenus">
            <p>Le Vendeur conserve la propriété de l'ensemble des Contenus qu'il publie sur la Plateforme. Il concède à DANIEL PARTNERS une licence d'utilisation non exclusive, gratuite et mondiale, pour les besoins de la diffusion de ses annonces sur la Plateforme et à des fins promotionnelles.</p>
          </SubSection>
          <SubSection title="11.3. Confidentialité">
            <p>Chaque Partie s'engage à garder strictement confidentielles les Informations Confidentielles de l'autre Partie et à ne pas les divulguer à des tiers sans accord préalable écrit. Cette obligation de confidentialité survivra pendant cinq (5) ans à compter de la fin du Contrat.</p>
          </SubSection>
        </Section>

        <Section title="ARTICLE 12. RESPONSABILITÉ">
          <SubSection title="12.1. Responsabilité du Vendeur">
            <p>Le Vendeur est seul responsable :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>De la qualité, de la conformité et de l'état réel des Produits mis en vente ;</li>
              <li>De l'exactitude des informations publiées sur ses annonces de matériel golf ;</li>
              <li>Du respect de ses obligations légales (fiscales, sociales) ;</li>
              <li>Des Contenus publiés sur la Plateforme.</li>
            </ul>
          </SubSection>
          <SubSection title="12.2. Limitation de responsabilité de DANIEL PARTNERS">
            <p>DANIEL PARTNERS intervient en qualité de simple intermédiaire technique. À ce titre, sa responsabilité ne saurait être engagée pour :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Les contenus publiés par les Vendeurs ;</li>
              <li>La qualité ou la conformité des Produits mis en vente ;</li>
              <li>Les interruptions du Service pour maintenance ou force majeure ;</li>
              <li>Tout préjudice indirect subi par le Vendeur du fait de l'utilisation de la Plateforme.</li>
            </ul>
          </SubSection>
        </Section>

        <Section title="ARTICLE 13. SUSPENSION ET RÉSILIATION">
          <SubSection title="13.1. Suspension par DANIEL PARTNERS">
            <p>DANIEL PARTNERS se réserve le droit de suspendre l'accès aux Services de tout Vendeur qui :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Violerait les présentes CGS ou les CGU ;</li>
              <li>Publierait des annonces de Produits interdits ou non conformes ;</li>
              <li>Ferait l'objet de plaintes répétées de la part des Clients ;</li>
              <li>Se présenterait faussement comme consommateur tout en agissant à titre professionnel.</li>
            </ul>
            <p>La suspension est notifiée au Vendeur avec indication des motifs, sauf si la notification risque de compromettre la lutte contre la fraude.</p>
          </SubSection>
          <SubSection title="13.2. Résiliation par le Vendeur">
            <p>Le Vendeur peut résilier le présent Contrat à tout moment en contactant DANIEL PARTNERS à <a href="mailto:contact@swingmarket.fr" className="text-[#1B5E20] hover:underline">contact@swingmarket.fr</a>. La résiliation prend effet après traitement des Commandes en cours.</p>
          </SubSection>
          <SubSection title="13.3. Effets de la résiliation">
            <p>En cas de résiliation, les annonces du Vendeur sont désactivées. Les Commandes en cours sont exécutées jusqu'à leur terme. Les données personnelles sont conservées conformément aux délais légaux applicables.</p>
          </SubSection>
        </Section>

        <Section title="ARTICLE 14. MÉDIATION ET LITIGES">
          <p>En cas de litige entre le Vendeur et DANIEL PARTNERS relatif à l'interprétation ou à l'exécution du présent Contrat, les Parties s'engagent à rechercher une solution amiable dans un délai de trente (30) jours à compter de la notification du litige.</p>
          <p>À défaut d'accord amiable, le Vendeur peut avoir recours à un médiateur de la consommation conformément aux articles L.611-1 et suivants du Code de la consommation.</p>
          <InfoBox color="blue">
            Les présentes CGS sont soumises au droit français. En cas de litige non résolu à l'amiable, les tribunaux français seront seuls compétents, sauf dispositions légales impératives contraires applicables au consommateur.
          </InfoBox>
        </Section>

        <Section title="ARTICLE 15. DISPOSITIONS DIVERSES">
          <SubSection title="15.1. Divisibilité">
            <p>Si l'une quelconque des stipulations du présent Contrat était déclarée nulle au regard d'une disposition législative ou réglementaire en vigueur, elle sera réputée non écrite, sans pour autant entraîner la nullité du Contrat ou altérer la validité de ses autres dispositions.</p>
          </SubSection>
          <SubSection title="15.2. Non-renonciation">
            <p>Le fait pour DANIEL PARTNERS de ne pas se prévaloir d'un manquement du Vendeur à l'une des obligations du Contrat ne saurait être interprété comme une renonciation à se prévaloir à l'avenir de ce manquement.</p>
          </SubSection>
          <SubSection title="15.3. Intégralité du Contrat">
            <p>Le présent Contrat constitue l'intégralité de l'accord entre les Parties concernant l'objet des présentes et remplace tout accord antérieur, écrit ou oral, portant sur le même objet.</p>
          </SubSection>
        </Section>

      </div>
    </LegalLayout>
  );
}