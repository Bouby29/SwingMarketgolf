import React from "react";
import LegalLayout from "../components/legal/LegalLayout";
import { Section, SubSection, InfoBox, DataTable } from "../components/legal/Section";

export default function CGV() {
  return (
    <LegalLayout title="Conditions Générales de Vente" version="Version du 08.03.2026">

      <InfoBox color="green">
        <strong>BIENVENUE SUR SWINGMARKET ! LA MARKETPLACE SPÉCIALISÉE DANS LE SECTEUR DU GOLF</strong>
      </InfoBox>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="font-bold text-amber-800">IMPORTANT :</p>
        <p className="mt-1 text-amber-700">
          La Commande de Produits est conclue entre le Client et le Vendeur. Les prix des Produits commercialisés sur la Plateforme sont librement décidés par les Vendeurs, DANIEL PARTNERS n'étant pas partie à cette transaction.
        </p>
        <p className="mt-2 text-amber-700">
          Les dispositions détaillées ci-après ont vocation à préciser le prix et les modalités de facturation des Services proposés par DANIEL PARTNERS dans le cadre de l'intermédiation. Ces Services sont facturés aux Clients par DANIEL PARTNERS.
        </p>
      </div>

      <div className="mt-8 space-y-2">

        <Section title="ARTICLE 1. OBJET">
          <p>
            Les présentes CGV (<em>ci-après « le Contrat »</em>), sont conclues entre <strong>DANIEL PARTNERS</strong> (<em>Société à Responsabilité Limitée, au capital social de 2.700 euros, immatriculée au RCS de Versailles sous le numéro 927 678 169, dont le siège social est situé au 6 rue des Vignes 78910 Tacoignières qui édite la Plateforme</em>) et le <strong>Client</strong>, qui garantit avoir la qualité de consommateur, et qui procède à la Commande de Produits sur la Plateforme SwingMarket auprès d'un Vendeur.
          </p>
          <p>
            Le Contrat a pour objet de fixer les conditions et modalités d'accès du Client aux Services ainsi que les droits et obligations respectifs des Parties.
          </p>
          <p>
            Il est précisé que ce Contrat vient compléter les Conditions Générales d'Utilisation de la Plateforme afin de régir spécifiquement la transaction commerciale conclue entre DANIEL PARTNERS et le Client.
          </p>
        </Section>

        <Section title="ARTICLE 2. QUELQUES DÉFINITIONS">
          <p>Les termes, mentionnés ci-dessous, ont dans le présent Contrat, la signification suivante :</p>
          <div className="space-y-3 mt-4">
            {[
              ["Client", "désigne toute personne qui garantit avoir la qualité de consommateur telle que définie par le droit et la jurisprudence française, qui accède à la Plateforme et procède à une Commande de Produits auprès d'un Vendeur. Le Client est une personne physique qui agit à des fins qui n'entrent pas dans le cadre de son activité commerciale, industrielle, artisanale, libérale ou agricole."],
              ["Commande", "désigne l'achat de Produit réalisé par un Client sur la Plateforme."],
              ["Compte", "désigne l'espace au sein duquel est regroupé l'ensemble des données fournies par le Client."],
              ["Conditions Générales d'Utilisation ou CGU", "désigne conditions contractuelles mises à disposition sur la page d'accueil de la Plateforme régissant l'utilisation de celle-ci et que tout Utilisateur de la Plateforme doit accepter lors de son inscription sur la Plateforme, qu'il soit Vendeur ou Client."],
              ["Identifiants", "désigne l'adresse e-mail et le mot de passe choisis par le Client lui permettant de se connecter à son Compte."],
              ["Parties", "au pluriel, désigne ensemble DANIEL PARTNERS et le Client. Au singulier, désigne une seule des deux Parties."],
              ["Plateforme", "désigne la Plateforme en ligne accessible à l'adresse suivante : www.swingmarket.fr. La Plateforme regroupe l'ensemble des pages web, Services et fonctionnalités proposés aux Utilisateurs."],
              ["Prestataire de Services de Paiement ou PSP", "désigne la société détentrice d'un agrément bancaire fournissant par l'intermédiaire de DANIEL PARTNERS, ses services de paiement aux Vendeurs afin de leur permettre d'encaisser les paiements des Clients. Le PSP choisi par DANIEL PARTNERS est Stripe Payments Europe, Ltd., société de droit irlandais, dont le siège social est situé à the One Building, 1, Lower Grand Canal Street, Dublin 2, Ireland, et habilitée à exercer son activité au sein de l'Espace Economique Européen, en qualité d'établissement de monnaie électronique agréé par la Banque Centrale d'Irlande sous le numéro C187865. Le PSP dispose d'une filiale en France (« Stripe France »), immatriculée au Registre du Commerce et des Sociétés de Paris sous le numéro 807 572 011 et dont le siège est au 10 Boulevard Haussmann, 75009 – Paris."],
              ["Produits", "désigne le matériel de golf (clubs tels que drivers, bois, hybrides, fers, wedges et putters ; balles de golf ; sacs de golf ; chariots ; accessoires golf ; équipements d'entraînement ; vêtements et chaussures golf) et leurs accessoires pouvant être commercialisés sur la Plateforme par un Vendeur."],
              ["Services", "désigne l'ensemble des services proposés par DANIEL PARTNERS aux Clients par l'intermédiaire de la Plateforme."],
              ["Vendeur", "désigne toute personne qui accède et s'inscrit sur la Plateforme afin de pouvoir commercialiser ses Produits aux Clients. Le Vendeur peut être un Vendeur consommateur ou un Vendeur professionnel."],
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

        <Section title="ARTICLE 3. ACCEPTATION DU CONTRAT">
          <p>
            Le présent Contrat est disponible dans le footer de la Plateforme au moyen d'un lien hypertexte et peut être consulté, imprimé, à tout moment.
          </p>
          <p>
            Le Client s'engage à lire attentivement le présent Contrat et à l'accepter expressément, sans limitation ni condition, avant de procéder au paiement des Services lors de la Commande de Produits.
          </p>
          <p>
            DANIEL PARTNERS conseille au Client de lire le présent Contrat avant toute nouvelle Commande de Produits sur la Plateforme, la dernière version des présentes s'appliquant à toute nouvelle transaction.
          </p>
        </Section>

        <Section title="ARTICLE 4. PRÉREQUIS TECHNIQUES">
          <p>
            Le Client reconnaît disposer des moyens et des compétences nécessaires pour l'utilisation des Services.
          </p>
          <p>
            Les équipements nécessaires à l'accès et à l'utilisation de la Plateforme et des Services sont à la charge du Client, de même que les frais de télécommunications éventuellement induits par leur utilisation.
          </p>
          <p>
            Le Client est informé qu'aucun niveau minimum de qualité des Services fournis au titre du présent Contrat n'est proposé par DANIEL PARTNERS en dehors des obligations de garanties visées par l'article L224-25-12 du Code de la consommation.
          </p>
        </Section>

        <Section title="ARTICLE 5. ACCÈS AUX SERVICES">
          <p>
            Pour pouvoir bénéficier des Services et passer une Commande de Produits sur la Plateforme, le Client doit être un consommateur, âgé d'au moins 18 ans et/ou disposer de la capacité légale et disposer d'un Compte créé conformément aux{" "}
            <a href="/CGU" className="text-[#1B5E20] hover:underline">Conditions Générales d'Utilisation</a>.
          </p>
          <p>
            A compter de son inscription, le Client pourra bénéficier de l'intégralité des Services en se connectant avec ses Identifiants à son Compte.
          </p>
        </Section>

        <Section title="ARTICLE 6. SERVICES">
          <p>
            DANIEL PARTNERS s'engage à présenter de manière claire, lisible et compréhensible les caractéristiques essentielles des Services compte tenu de leur nature et du support de communication utilisé, et notamment les fonctionnalités, la compatibilité et l'interopérabilité des Services, l'existence de toute restriction d'utilisation de ces derniers ainsi que les informations obligatoires que le Client doit recevoir en vertu du droit applicable.
          </p>
          <p>DANIEL PARTNERS s'engage à mettre à disposition du Client une architecture logicielle lui permettant :</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>D'être mis en relation avec les Vendeurs référencés et commander des Produits sur la Plateforme ;</li>
            <li>De bénéficier d'un Compte à partir duquel il pourra, en sus des fonctionnalités détaillées dans les CGU, suivre ses Commandes en cours, accéder à l'historique complet des Commandes passées.</li>
          </ul>
          <p>
            DANIEL PARTNERS permet au Client de disposer d'une solution de paiement sécurisée, assurée par un Prestataire de Services de Paiement (PSP). Le PSP choisi par DANIEL PARTNERS est Stripe Payments Europe, Ltd., société de droit irlandais, dont le siège social est situé à the One Building, 1, Lower Grand Canal Street, Dublin 2, Ireland, et habilitée à exercer son activité au sein de l'Espace Economique Européen, en qualité d'établissement de monnaie électronique agréé par la Banque Centrale d'Irlande sous le numéro C187865. Le PSP dispose d'une filiale en France (« Stripe France »), immatriculée au Registre du Commerce et des Sociétés de Paris sous le numéro 807 572 011 et dont le siège est au 10 Boulevard Haussmann, 75009 – Paris.
          </p>
          <p>
            Les Services comprennent également l'accès au support clients, c'est-à-dire la possibilité de consulter l'ensemble des données de son compte (se référer aux <a href="/CGU" className="text-[#1B5E20] hover:underline">CGU</a>).
          </p>
        </Section>

        <Section title="ARTICLE 7. MODALITÉS FINANCIÈRES">
          <SubSection title="7.1. Prix">
            <p>
              En sus du prix des Produits des Vendeurs affichés sur la Plateforme, le Client procédant à une Commande devra payer une commission et des frais de services à DANIEL PARTNERS à savoir :
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Une commission forfaitaire correspondant à 8% TTC du prix de vente du Produit ; et</li>
              <li>La somme de 0,70 euros TTC par transaction.</li>
            </ul>
            <p>
              Les prix incluent lorsqu'elle est applicable la taxe sur la valeur ajoutée (TVA) au taux en vigueur à la date de la transaction. Toute modification du taux applicable peut impacter le prix des Services à compter de la date d'entrée en vigueur du nouveau taux.
            </p>
            <p>
              Le taux de TVA applicable est exprimé en pourcentage de la valeur des Services.
            </p>
            <p>
              Le prix des Services est celui qui est indiqué sur la Plateforme au moment du paiement. DANIEL PARTNERS se réserve la possibilité de modifier les prix de ses Services à tout moment, tout en garantissant au Client l'application du prix en vigueur au jour de la transaction.
            </p>
          </SubSection>

          <SubSection title="7.2. Moyens de paiement">
            <p>
              Le Client peut procéder au paiement des Services sur la Plateforme suivant les moyens proposés par DANIEL PARTNERS c'est-à-dire par carte bancaire (Visa, MasterCard, American Express) ; Portefeuilles électroniques compatibles (ex : Apple Pay, Google Pay) ; Klarna (paiement en plusieurs fois).
            </p>
            <p>
              Lorsqu'il choisira son moyen de paiement, le Client sera redirigé vers un espace sécurisé géré par le PSP correspondant à ce choix afin de procéder au paiement.
            </p>
            <p>
              Le Client garantit à DANIEL PARTNERS qu'il détient toutes les autorisations requises pour utiliser le moyen de paiement choisi.
            </p>
            <p>
              DANIEL PARTNERS prend toutes les mesures nécessaires pour garantir la sécurité et la confidentialité des données transmises en ligne dans le cadre du paiement en ligne sur la Plateforme.
            </p>
          </SubSection>

          <SubSection title="7.3. Refus de paiement">
            <p>
              Si la banque refuse de débiter une carte ou autre moyen de paiement, le Client devra contacter le support clients afin de payer par tout autre moyen de paiement valable et accepté par DANIEL PARTNERS.
            </p>
            <p>
              Dans l'hypothèse où, pour quelle que raison que ce soit, le débit des sommes dues par le Client s'avérerait impossible, la procédure de Commande de matériel golf serait immédiatement suspendue et la Commande automatiquement annulée.
            </p>
          </SubSection>

          <SubSection title="7.4. Facturation">
            <p>
              Pour chaque Commande de matériel golf passée sur la Plateforme, DANIEL PARTNERS adresse au Client une facture électronique récapitulant le détail de la commande (prix du Produit, commission SwingMarket, frais de livraison) disponible dans l'espace « Mes commandes » du Compte du Client.
            </p>
          </SubSection>
        </Section>

        <Section title="ARTICLE 8. LIVRAISON ET EXPÉDITION">
          <SubSection title="8.1. Transporteurs partenaires">
            <p>SwingMarket propose les transporteurs suivants pour l'expédition des Produits :</p>
            <DataTable
              headers={["Transporteur", "Type", "Petit colis", "Moyen colis", "Grand colis"]}
              rows={[
                ["Mondial Relay", "Point relais", "3,99 €", "5,99 €", "8,99 €"],
                ["La Poste Colissimo", "Domicile", "5,49 €", "7,49 €", "11,49 €"],
                ["Chronopost", "Express J+1", "8,99 €", "12,99 €", "18,99 €"],
              ]}
            />
          </SubSection>

          <SubSection title="8.2. Délais d'expédition">
            <p>
              Le Vendeur dispose d'un délai maximum de 72 heures pour confirmer la disponibilité du Produit et procéder à son expédition après réception du paiement. Sans confirmation dans ce délai, la Commande est automatiquement annulée et l'Acheteur intégralement remboursé.
            </p>
            <p>
              Les délais de livraison estimés sont communiqués à titre indicatif lors du choix du transporteur au moment du paiement et sont fonction du transporteur sélectionné et de la destination.
            </p>
          </SubSection>

          <SubSection title="8.3. Suivi de livraison">
            <p>
              Un numéro de suivi est communiqué au Client dès l'expédition de son matériel golf. Le Client peut suivre l'acheminement de sa Commande directement depuis son Compte SwingMarket ou sur le site du transporteur concerné.
            </p>
          </SubSection>

          <SubSection title="8.4. Réception et vérification">
            <p>
              Le Client est invité à vérifier l'état du matériel golf à la réception. En cas d'anomalie (colis endommagé, produit non conforme à l'annonce), le Client dispose de <strong>48 heures</strong> après confirmation de livraison pour signaler un litige via la Plateforme. Passé ce délai, les fonds sont automatiquement virés au Vendeur.
            </p>
          </SubSection>
        </Section>

        <Section title="ARTICLE 9. DROIT DE RÉTRACTATION">
          <SubSection title="9.1. Principe général">
            <p>
              Conformément aux articles L.221-18 et suivants du Code de la consommation, le Client consommateur dispose d'un droit de rétractation de <strong>14 jours</strong> à compter de la réception du matériel golf commandé, sans avoir à justifier de motifs ni à payer de pénalités.
            </p>
          </SubSection>

          <SubSection title="9.2. Exercice du droit de rétractation">
            <p>
              Pour exercer ce droit, le Client doit notifier sa décision de rétractation via la messagerie interne de la Plateforme ou par email à{" "}
              <a href="mailto:contact@swingmarket.fr" className="text-[#1B5E20] hover:underline">contact@swingmarket.fr</a>{" "}
              avant l'expiration du délai de 14 jours.
            </p>
          </SubSection>

          <SubSection title="9.3. Exceptions">
            <p>Le droit de rétractation ne s'applique pas :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Aux Produits personnalisés ou sur mesure (grips gravés, clubs reshaftés selon spécifications du Client)</li>
              <li>Aux enchères golf remportées par le Client</li>
              <li>Aux Produits manifestement utilisés au-delà de ce qui est nécessaire pour constater leur nature et leurs caractéristiques</li>
            </ul>
          </SubSection>

          <SubSection title="9.4. Remboursement">
            <p>
              En cas de rétractation valide, DANIEL PARTNERS procède au remboursement intégral du Client (prix du Produit + commission SwingMarket + frais de livraison initiaux) dans un délai maximum de <strong>14 jours</strong> à compter de la réception du Produit retourné en bon état.
            </p>
          </SubSection>
        </Section>

        <Section title="ARTICLE 10. GARANTIES">
          <SubSection title="10.1. Garantie légale de conformité">
            <p>
              Conformément aux articles L.217-3 et suivants du Code de la consommation, le Client bénéficie de la garantie légale de conformité pour les Produits achetés. Le Vendeur est responsable des défauts de conformité existant lors de la délivrance du matériel golf.
            </p>
          </SubSection>

          <SubSection title="10.2. Garantie contre les vices cachés">
            <p>
              Conformément aux articles 1641 et suivants du Code civil, le Client peut invoquer la garantie contre les vices cachés pour tout matériel golf présentant un défaut caché qui rend le Produit impropre à l'usage auquel il est destiné.
            </p>
          </SubSection>

          <SubSection title="10.3. Garantie SwingMarket Safety">
            <InfoBox color="green">
              SwingMarket met en place le programme <strong>SwingMarket Safety</strong> qui garantit à l'Acheteur une protection en cas de litige. Les fonds sont conservés en séquestre pendant 48h après confirmation de livraison, permettant à l'Acheteur de signaler tout problème avant le virement au Vendeur.
            </InfoBox>
          </SubSection>
        </Section>

        <Section title="ARTICLE 11. RESPONSABILITÉ DE DANIEL PARTNERS">
          <p>
            En sa qualité d'intermédiaire technique, DANIEL PARTNERS ne saurait être tenue responsable des contenus publiés par les Vendeurs dans leurs annonces de matériel golf, de la qualité ou de la conformité des Produits mis en vente, ni des litiges nés entre Vendeurs et Acheteurs relatifs à l'exécution de la transaction.
          </p>
          <p>
            La responsabilité de DANIEL PARTNERS ne pourra pas être engagée en cas de dommages résultant d'une utilisation inadaptée du matériel golf par le Client, d'une interruption du Service due à un cas de force majeure, ou d'une inexécution imputable au Client lui-même.
          </p>
          <p>
            Dans tous les cas, la responsabilité de DANIEL PARTNERS au titre du présent Contrat est limitée aux sommes effectivement perçues par DANIEL PARTNERS au titre de la transaction concernée (commission + frais de services).
          </p>
        </Section>

        <Section title="ARTICLE 12. PROTECTION DES DONNÉES PERSONNELLES">
          <p>
            DANIEL PARTNERS s'engage à protéger les données personnelles de ses Clients conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
          </p>
          <p>
            Consultez notre{" "}
            <a href="/Confidentialite" className="text-[#1B5E20] font-medium hover:underline">Politique de Confidentialité</a>{" "}
            pour plus de détails sur la collecte, le traitement et la conservation de vos données personnelles.
          </p>
        </Section>

        <Section title="ARTICLE 13. PROPRIÉTÉ INTELLECTUELLE">
          <p>
            L'ensemble des éléments constituant la Plateforme SwingMarket est protégé par le droit de la propriété intellectuelle et constitue la propriété exclusive de DANIEL PARTNERS ou de ses partenaires. Toute reproduction non autorisée est strictement interdite.
          </p>
        </Section>

        <Section title="ARTICLE 14. MODIFICATIONS DES CGV">
          <p>
            DANIEL PARTNERS se réserve le droit de modifier les présentes CGV à tout moment. Le Client sera informé de toute modification significative par email ou par notification sur la Plateforme. Les nouvelles CGV s'appliquent à compter de leur mise en ligne pour toute nouvelle Commande.
          </p>
        </Section>

        <Section title="ARTICLE 15. LOI APPLICABLE ET JURIDICTION COMPÉTENTE">
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige relatif à leur interprétation ou à leur exécution, les Parties s'engagent à rechercher une solution amiable avant tout recours judiciaire.
          </p>
          <p>
            À défaut de résolution amiable, le litige sera porté devant les tribunaux français compétents, sauf dispositions légales impératives contraires applicables au consommateur.
          </p>
          <InfoBox color="blue">
            Pour toute réclamation, le Client peut contacter le service client SwingMarket à l'adresse{" "}
            <a href="mailto:contact@swingmarket.fr" className="text-[#1B5E20] font-medium hover:underline">contact@swingmarket.fr</a>.
            En cas de litige non résolu, le Client peut également recourir gratuitement à un médiateur de la consommation conformément à l'article L.612-1 du Code de la consommation.
          </InfoBox>
        </Section>

      </div>
    </LegalLayout>
  );
}