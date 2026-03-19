import React from "react";
import LegalLayout from "../components/legal/LegalLayout";
import { Section, SubSection, InfoBox } from "../components/legal/Section";
import { MapPin, Mail, Globe, Building2 } from "lucide-react";

export default function MentionsLegales() {
  return (
    <LegalLayout title="Mentions Légales" version="Version du 08.03.2026">
      <InfoBox color="green">
        <strong>SwingMarket</strong> — La marketplace spécialisée dans l'achat, la vente et la location de matériel de golf entre passionnés.
      </InfoBox>

      <div className="mt-8">
        <Section title="ÉDITEUR DU SITE">
          <p>
            Le présent site internet accessible à l'adresse suivante : <strong>www.swingmarket.fr</strong> est édité et exploité par{" "}
            <strong>DANIEL PARTNERS</strong>, société à responsabilité limitée au capital social de 2 700 euros, immatriculée au Registre du Commerce et des Sociétés de Versailles sous le numéro <strong>927 678 169</strong>, dont le siège social est sis <strong>6 rue des Vignes, 78910 Tacoignières</strong>, ayant pour numéro de TVA intracommunautaire <strong>FR50927678169</strong>.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Mail className="w-4 h-4 text-[#1B5E20] mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-800 text-xs uppercase tracking-wide mb-1">E-mail</p>
                <p>contact@swingmarket.fr</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Building2 className="w-4 h-4 text-[#1B5E20] mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-800 text-xs uppercase tracking-wide mb-1">Directeur de publication</p>
                <p>Monsieur Alexandre DANIEL-GIROUDIERE</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Globe className="w-4 h-4 text-[#1B5E20] mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-800 text-xs uppercase tracking-wide mb-1">Site web</p>
                <p>www.swingmarket.fr</p>
              </div>
            </div>
          </div>
        </Section>

        <Section title="HÉBERGEUR">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <MapPin className="w-4 h-4 text-[#1B5E20] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-gray-800">DigitalOcean, LLC</p>
              <p>101 Avenue of the Americas, 10th Floor</p>
              <p>New York, NY 10013 — United States</p>
              <p>🌐 <a href="https://www.digitalocean.com" className="text-[#1B5E20] hover:underline">www.digitalocean.com</a></p>
            </div>
          </div>
        </Section>

        <Section title="PROPRIÉTÉ INTELLECTUELLE">
          <p>
            L'ensemble des éléments composant le site SwingMarket (textes, graphiques, logiciels, photographies, images, sons, plans, noms, logos, marques, créations et œuvres protégeables diverses, bases de données, etc.) ainsi que le site lui-même, relèvent des législations françaises et internationales sur le droit d'auteur et la propriété intellectuelle.
          </p>
          <p>
            Ces éléments sont la propriété exclusive de DANIEL PARTNERS. Toute reproduction, même partielle, de ce contenu est strictement interdite sans autorisation préalable écrite de DANIEL PARTNERS.
          </p>
          <p>
            Les marques et logos des partenaires (Stripe, Mondial Relay, Chronopost, Colissimo) sont la propriété exclusive de leurs détenteurs respectifs.
          </p>
        </Section>

        <Section title="DONNÉES PERSONNELLES & COOKIES">
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD) (UE) 2016/679 et à la loi Informatique et Libertés n°78-17 du 6 janvier 1978 modifiée, les données personnelles collectées sur ce site font l'objet d'un traitement informatique destiné à la gestion des comptes utilisateurs et des transactions commerciales.
          </p>
          <p>
            L'Utilisateur dispose d'un droit d'accès, de modification, de rectification et de suppression des données le concernant.
            Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@swingmarket.fr" className="text-[#1B5E20] hover:underline">contact@swingmarket.fr</a>
          </p>
          <p>
            Pour plus d'informations sur le traitement de vos données personnelles, consultez notre{" "}
            <a href="/Confidentialite" className="text-[#1B5E20] font-medium hover:underline">Politique de Confidentialité</a>.
          </p>
        </Section>

        <Section title="RESPONSABILITÉ">
          <p>
            DANIEL PARTNERS s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Cependant, DANIEL PARTNERS ne peut garantir l'exactitude, la complétude ou l'actualité des informations diffusées sur ce site.
          </p>
          <p>
            SwingMarket agit en qualité d'intermédiaire technique et ne saurait être tenue responsable des contenus publiés par les Vendeurs et des transactions conclues entre Vendeurs et Acheteurs, sous réserve de son obligation de médiation.
          </p>
        </Section>

        <Section title="DROIT APPLICABLE ET JURIDICTION COMPÉTENTE">
          <p>
            Les présentes mentions légales sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.
          </p>
          <InfoBox color="blue">
            La marketplace SwingMarket est régie par le droit français. En cas de litige relatif à l'utilisation de la plateforme, les tribunaux français seront compétents, sauf dispositions légales contraires.
          </InfoBox>
        </Section>
      </div>
    </LegalLayout>
  );
}