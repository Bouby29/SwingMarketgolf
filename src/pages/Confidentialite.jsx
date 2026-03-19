import React from "react";
import LegalLayout from "../components/legal/LegalLayout";
import { Section, InfoBox, DataTable } from "../components/legal/Section";

export default function Confidentialite() {
  return (
    <LegalLayout title="Politique de Confidentialité" version="Version du 29-09-2025">
      <p className="text-gray-600 leading-relaxed">
        La présente Politique de confidentialité a vocation à informer tout utilisateur de la Plateforme SwingMarket sur les traitements de données à caractère personnel réalisés par <strong>DANIEL PARTNERS</strong> en sa qualité de Responsable de traitement au sens du RGPD et de la Loi Informatique et Libertés.
      </p>
      <p className="mt-3 text-gray-600 leading-relaxed">
        En application du principe de minimisation des données, DANIEL PARTNERS s'engage à limiter la collecte de données à caractère personnel à celles qui sont strictement nécessaires à la fourniture des Services proposés sur sa Plateforme.
      </p>

      <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-3 text-sm text-gray-600">
        <p><strong className="text-gray-800">La Réglementation sur la protection des données</strong> désigne la réglementation en vigueur applicable aux traitements de données à caractère personnel et notamment : (i) le Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 (« RGPD ») ; (ii) la loi « Informatique et Libertés » n°78-17 du 6 janvier 1978 modifiée ; (iii) toute législation entrant en vigueur susceptible d'affecter les traitements visés ; et (iv) tout guide de bonnes pratiques publié par la CNIL ou par le CEPD.</p>
        <p><strong className="text-gray-800">Une donnée à caractère personnel</strong> est toute information se rapportant à une personne physique identifiée ou identifiable, directement (ex : nom) ou indirectement (ex : identifiant).</p>
        <p><strong className="text-gray-800">Un traitement de données à caractère personnel</strong> est toute opération portant sur des données personnelles, quel que soit le procédé utilisé (enregistrer, organiser, conserver, modifier, transmettre, etc.).</p>
        <p><strong className="text-gray-800">La finalité d'un traitement</strong> est l'objectif principal de l'utilisation de données personnelles. Les données sont collectées pour un but déterminé et légitime et ne sont pas traitées de façon incompatible avec cet objectif initial.</p>
        <p><strong className="text-gray-800">Le responsable de traitement</strong> est la personne morale ou physique qui détermine les finalités et les moyens d'un traitement.</p>
        <p><strong className="text-gray-800">Le sous-traitant</strong> est la personne physique ou morale qui traite les données pour le compte d'un autre organisme dans le cadre d'un service ou d'une prestation.</p>
        <p><strong className="text-gray-800">La durée de conservation</strong> des données personnelles est déterminée en fonction de l'objectif ayant conduit à la collecte de ces données. Les données personnelles ne peuvent pas être conservées indéfiniment.</p>
        <p><strong className="text-gray-800">Le Délégué à la protection des données (DPO)</strong> a pour mission d'informer, de conseiller et de contrôler la conformité du Responsable de traitement. Il est le point de contact des personnes concernées et de la CNIL.</p>
        <p><strong className="text-gray-800">Le destinataire</strong> est la personne physique ou morale, l'autorité publique, le service ou tout autre organisme qui reçoit communication de données à caractère personnel.</p>
      </div>

      <div className="mt-8 space-y-2">

        <Section title="QUELQUES DÉFINITIONS">
          <div className="space-y-3">
            {[
              ["Back-Office", "désigne l'interface permettant au Vendeur d'accéder à son espace personnel à partir duquel il pourra notamment gérer sa page de présentation, son catalogue de Produits, ses Commandes, le suivi de son activité."],
              ["Client", "désigne toute personne qui garantit avoir la qualité de consommateur telle que définie par le droit et la jurisprudence française, qui accède à la Plateforme et procède à une Commande de Produits."],
              ["Commande", "désigne l'achat de Produit réalisé par un Client sur la Plateforme."],
              ["Compte", "désigne l'espace au sein duquel est regroupé l'ensemble des données fournies par le Client ou le Vendeur."],
              ["Identifiants", "désigne l'adresse e-mail et le mot de passe choisis par le Client ou par le Vendeur lui permettant de se connecter à son Compte ou à son Back-Office."],
              ["Plateforme", "désigne la Plateforme en ligne accessible à l'adresse suivante : www.swingmarket.fr. La Plateforme regroupe l'ensemble des pages web, Services et fonctionnalités proposés aux Utilisateurs."],
              ["Produits", "désigne le matériel de golf (clubs, balles, sacs, chariots, accessoires, équipements d'entraînement, vêtements et chaussures golf) et leurs accessoires pouvant être commercialisés sur la Plateforme par un Vendeur."],
              ["Services", "désigne l'ensemble des services proposés par DANIEL PARTNERS aux Utilisateurs par l'intermédiaire de la Plateforme."],
              ["Utilisateur", "désigne toute personne qui accède et navigue sur la Plateforme, qu'il soit Vendeur, Client ou simple internaute."],
              ["Vendeur", "désigne toute personne qui accède et s'inscrit sur la Plateforme afin de pouvoir commercialiser ses Produits aux Clients. Le Vendeur peut être un professionnel ou un consommateur."],
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

        <Section title="RESPONSABLE DE TRAITEMENT">
          <p>Le Responsable de traitement est <strong>DANIEL PARTNERS</strong>, Société à Responsabilité Limitée, au capital social de 2 700 euros, immatriculée au Registre du Commerce et des Sociétés de Versailles sous le numéro <strong>927 678 169</strong>, dont le siège social est sis 6 rue des Vignes, 78910 Tacoignières.</p>
          <p className="mt-2">DANIEL PARTNERS est joignable par courriel à <a href="mailto:contact@swingmarket.fr" className="text-[#1B5E20] hover:underline font-medium">contact@swingmarket.fr</a>.</p>
        </Section>

        <Section title="ORIGINE ET COLLECTE DE VOS DONNÉES PERSONNELLES">
          <p>En tant que Responsable de traitement, DANIEL PARTNERS collecte par principe directement les données à caractère personnel concernant l'Utilisateur. Ces données sont notamment collectées lors de l'inscription de l'Utilisateur, qu'il soit Vendeur ou Client, et lors des échanges avec tout Utilisateur souhaitant obtenir des renseignements sur les Services.</p>
          <p className="mt-2">DANIEL PARTNERS peut être amenée à collecter des données à caractère personnel de l'Utilisateur lors de sa navigation sur la Plateforme par le biais de cookies et autres traceurs.</p>
        </Section>

        <Section title="MINEURS">
          <InfoBox color="amber">
            La Plateforme SwingMarket s'adresse à des Utilisateurs majeurs (18 ans et plus). Dans le cas où un Utilisateur mineur utilise les Services et transmet ses Données personnelles sur la Plateforme, il garantit avoir obtenu l'autorisation préalable de son représentant légal, ou y être autorisé par la législation applicable.
          </InfoBox>
        </Section>

        <Section title="QUELS SONT LES TRAITEMENTS DE DONNÉES PERSONNELLES RÉALISÉS ?">
          <DataTable
            headers={["Finalités du traitement", "Bases légales", "Catégories de données", "Durées de conservation"]}
            rows={[
              [
                "Fourniture des Services — Mise à disposition des Services, mise en relation des Utilisateurs, gestion des inscriptions et des Comptes, publication des avis en ligne.",
                "Contractuelle : nécessaire à l'exécution d'un contrat ou de mesures précontractuelles",
                "Pour tous les Utilisateurs : Identifiants.\nPour les Clients : nom, prénom, email, adresse postale, téléphone (facultatif), historique des interactions.\nPour les Vendeurs professionnels : dénomination sociale, SIREN/SIRET, adresse siège, email pro, téléphone, nom et prénom du représentant légal.\nPour les Vendeurs consommateurs : nom, prénom, adresse postale, email, téléphone.",
                "Durée de la relation contractuelle puis archivage intermédiaire pendant 5 ans (prescription).\nLogs de connexion : 6 mois.\nAvis en ligne : 3 ans à compter de la publication."
              ],
              [
                "Suivi des Commandes — Suivi et gestion des Commandes, transmission des données Client au Vendeur, suivi des paiements.",
                "Contractuelle : nécessaire à l'exécution d'un contrat.\nConsentement lorsqu'il est nécessaire.",
                "Nom, prénom, email, adresse de livraison, adresse de facturation du Client. Numéro de Commande. Données de paiement.",
                "Durée de la relation contractuelle puis archivage intermédiaire pendant 5 ans.\nDocuments comptables : 10 ans."
              ],
              [
                "Gestion et suivi de la facturation des Services — Suivi des paiements, gestion des factures, gestion des impayés, tenue des registres comptables.",
                "Contractuelle : nécessaire à l'exécution d'un contrat.\nObligations légales (Livre des procédures fiscales).\nIntérêt légitime à assurer le suivi de la facturation.",
                "Données de paiement du Client. Données relatives à l'établissement et au règlement des factures.",
                "Durée nécessaire au suivi de la facturation, puis jusqu'à 10 ans pour respecter les obligations légales comptables.\nNB : La gestion des données CB est réalisée par Stripe."
              ],
              [
                "Administration de la Plateforme — Administration générale, dépôt de cookies et traceurs, opérations de maintenance, réalisation de statistiques.",
                "Intérêt légitime à assurer aux Utilisateurs la bonne exécution des Services et le bon fonctionnement de la Plateforme.",
                "Données de connexion, logs, données de navigation, cookies et traceurs.",
                "Durée limitée à la session ou selon les paramètres choisis par l'Utilisateur pour les cookies.\nStatistiques anonymisées : conservation possible au-delà."
              ],
              [
                "Obligations légales — Lutte contre le blanchiment d'argent et le financement du terrorisme (LCB-FT), vérification d'identité KYC/KYB.",
                "Obligation légale.",
                "Pièce d'identité, justificatif de domicile, Kbis (Vendeurs professionnels), RIB.",
                "Durée légale applicable (généralement 5 ans après la fin de la relation commerciale)."
              ],
              [
                "Communication — Envoi de newsletters, actualités golf, informations sur les Services (avec consentement).",
                "Consentement.",
                "Adresse email, préférences de communication.",
                "Jusqu'au retrait du consentement ou désinscription."
              ],
            ]}
          />
        </Section>

        <Section title="DESTINATAIRES DES DONNÉES">
          <p>Les données à caractère personnel collectées par DANIEL PARTNERS ne sont jamais vendues à des tiers. Dans le cadre des finalités décrites ci-dessus, DANIEL PARTNERS peut être amenée à communiquer des données personnelles aux destinataires suivants :</p>
          <div className="grid md:grid-cols-2 gap-3 mt-4">
            {[
              { name: "Stripe Payments Europe, Ltd.", desc: "Prestataire de Services de Paiement — traitement des paiements et vérification d'identité KYC/KYB" },
              { name: "Mondial Relay", desc: "Transporteur — livraison en point relais" },
              { name: "Chronopost", desc: "Transporteur — livraison express" },
              { name: "La Poste / Colissimo", desc: "Transporteur — livraison à domicile" },
              { name: "Sendcloud", desc: "Plateforme logistique — génération d'étiquettes d'expédition" },
              { name: "Autorités compétentes", desc: "Administration fiscale, autorités judiciaires ou administratives si requis par la loi ou une décision de justice" },
              { name: "Sous-traitants techniques", desc: "Prestataires d'hébergement, maintenance informatique, support technique" },
              { name: "Vendeurs de la Plateforme", desc: "Dans le cadre strict du traitement d'une Commande passée par un Client" },
            ].map(item => (
              <div key={item.name} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
          <InfoBox color="blue">
            Certains de ces destinataires peuvent être situés en dehors de l'Union européenne. Dans ce cas, DANIEL PARTNERS s'assure que les transferts sont encadrés par des garanties appropriées (clauses contractuelles types de la Commission européenne, décisions d'adéquation, etc.).
          </InfoBox>
        </Section>

        <Section title="VOS DROITS">
          <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants concernant vos données personnelles :</p>
          <div className="grid md:grid-cols-2 gap-3 mt-4">
            {[
              ["Droit d'accès (Art. 15 RGPD)", "Obtenir la confirmation que des données vous concernant sont traitées et en obtenir une copie."],
              ["Droit de rectification (Art. 16 RGPD)", "Demander la correction de données inexactes ou incomplètes vous concernant."],
              ["Droit à l'effacement (Art. 17 RGPD)", "Demander la suppression de vos données (« droit à l'oubli »), sous réserve des obligations légales de conservation."],
              ["Droit à la portabilité (Art. 20 RGPD)", "Recevoir vos données dans un format structuré, couramment utilisé et lisible par machine."],
              ["Droit d'opposition (Art. 21 RGPD)", "Vous opposer à tout moment à un traitement fondé sur l'intérêt légitime, pour des raisons tenant à votre situation particulière."],
              ["Droit à la limitation (Art. 18 RGPD)", "Obtenir la limitation du traitement de vos données dans certains cas prévus par le RGPD."],
              ["Droit de retirer votre consentement", "Retirer à tout moment votre consentement pour les traitements fondés sur celui-ci, sans que cela affecte la licéité du traitement antérieur."],
              ["Droit de définir des directives post-mortem", "Définir des directives relatives à la conservation, à l'effacement et à la communication de vos données après votre décès."],
            ].map(([droit, desc]) => (
              <div key={droit} className="flex gap-2 p-3 bg-green-50 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-[#1B5E20] mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[#1B5E20] text-sm">{droit}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <InfoBox color="blue">
            <p>Pour exercer vos droits, contactez-nous par email à : <a href="mailto:contact@swingmarket.fr" className="font-semibold hover:underline">contact@swingmarket.fr</a></p>
            <p className="mt-2">Vous devrez joindre à votre demande une copie d'un titre d'identité en cours de validité (carte d'identité ou passeport). DANIEL PARTNERS s'engage à répondre dans un délai d'un (1) mois à compter de la réception de votre demande.</p>
            <p className="mt-2">Vous pouvez également introduire une réclamation auprès de la <strong>CNIL</strong> — Commission Nationale de l'Informatique et des Libertés, 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 — <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">www.cnil.fr</a></p>
          </InfoBox>
        </Section>

        <Section title="COOKIES ET TRACEURS">
          <p>Lors de votre navigation sur la Plateforme SwingMarket, des cookies et autres traceurs peuvent être déposés sur votre terminal. Un cookie est un petit fichier texte déposé sur votre terminal lors de la visite d'un site.</p>
          <div className="mt-4 space-y-3">
            {[
              { type: "Cookies strictement nécessaires", desc: "Ces cookies sont indispensables au fonctionnement de la Plateforme (maintien de la session, sécurisation des transactions, mémorisation du panier). Ils ne peuvent pas être refusés.", color: "bg-green-50 border-green-100" },
              { type: "Cookies de mesure d'audience", desc: "Ces cookies permettent d'analyser la fréquentation de la Plateforme et d'améliorer nos services (ex : Google Analytics). Ils sont déposés uniquement avec votre consentement.", color: "bg-blue-50 border-blue-100" },
              { type: "Cookies de personnalisation", desc: "Ces cookies permettent de mémoriser vos préférences de navigation (langue, devise, filtres de recherche). Ils sont déposés avec votre consentement.", color: "bg-amber-50 border-amber-100" },
            ].map(item => (
              <div key={item.type} className={`p-4 rounded-xl border ${item.color}`}>
                <p className="font-semibold text-gray-800">{item.type}</p>
                <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600">Vous pouvez à tout moment modifier vos préférences en matière de cookies via le bandeau de gestion des cookies disponible en bas de page de la Plateforme, ou en paramétrant votre navigateur internet.</p>
        </Section>

        <Section title="SÉCURITÉ DES DONNÉES">
          <p>DANIEL PARTNERS met en œuvre les mesures techniques et organisationnelles appropriées pour garantir la sécurité de vos données personnelles et les protéger contre tout accès non autorisé, toute modification, divulgation ou destruction non autorisée, notamment :</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Chiffrement des communications par protocole SSL/TLS ;</li>
            <li>Authentification sécurisée pour l'accès aux comptes ;</li>
            <li>Aucun stockage des données bancaires sur nos serveurs (géré exclusivement par Stripe) ;</li>
            <li>Accès aux données limité selon le principe du moindre privilège ;</li>
            <li>Procédures internes de gestion des incidents de sécurité.</li>
          </ul>
          <InfoBox color="blue">
            En cas de violation de données à caractère personnel susceptible d'engendrer un risque élevé pour vos droits et libertés, DANIEL PARTNERS s'engage à vous en informer dans les meilleurs délais, conformément à l'article 34 du RGPD.
          </InfoBox>
        </Section>

        <Section title="MODIFICATIONS DE LA PRÉSENTE POLITIQUE">
          <p>DANIEL PARTNERS se réserve le droit de modifier à tout moment la présente Politique de confidentialité pour la mettre en conformité avec les évolutions législatives et réglementaires, ou faire suite à des changements apportés aux Services proposés.</p>
          <p className="mt-2">En cas de modification substantielle, DANIEL PARTNERS informera les Utilisateurs par tous moyens appropriés (email, notification sur la Plateforme). La date de dernière mise à jour est indiquée en haut de la présente Politique.</p>
          <p className="mt-2">La poursuite de l'utilisation de la Plateforme après notification des modifications vaut acceptation de la nouvelle version de la Politique de confidentialité.</p>
        </Section>

      </div>
    </LegalLayout>
  );
}