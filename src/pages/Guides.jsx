import React from "react";
import SEOHead from "../components/seo/SEOHead";
import { Link } from "react-router-dom";
import { ShoppingCart, Tag, Package, CreditCard, Shield, MessageSquare, Camera, Truck, CheckCircle, AlertTriangle, Clock, FileText } from "lucide-react";
import MobileHeader from "../components/layout/MobileHeader";

export default function Guides() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Guides Acheteur & Vendeur - Comment vendre et acheter du golf"
        description="Tout savoir pour acheter et vendre du matériel de golf d'occasion en toute sécurité sur SwingMarket : guides complets, étapes, paiement sécurisé."
        url="https://swingmarketgolf.com/Guides"
      />
      <MobileHeader title="Guides" showBack={true} />
      
      {/* Hero Section */}
      <div className="bg-[#1B5E20] text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Guides Acheteur & Vendeur SwingMarket
          </h1>
          <h2 className="text-lg text-white/90 max-w-2xl mx-auto">
            Tout ce que vous devez savoir pour acheter et vendre votre matériel de golf en toute sécurité
          </h2>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <a href="#vendeur" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1B5E20] flex items-center justify-center">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Guide Vendeur</h3>
                <p className="text-sm text-gray-600">Comment vendre votre matériel</p>
              </div>
            </div>
          </a>
          <a href="#acheteur" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#C5A028] flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Guide Acheteur</h3>
                <p className="text-sm text-gray-600">Comment acheter en toute sécurité</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Messagerie Section */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <MessageSquare className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">💬 Messagerie Sécurisée (important)</h3>
              <p className="text-gray-700 mb-3">
                La messagerie SwingMarket est là pour permettre aux acheteurs et vendeurs d'échanger <strong>en toute sécurité</strong> : 
                poser des questions, demander des <strong>photos/vidéos</strong>, ou <strong>négocier le prix</strong>.
              </p>
              <div className="bg-white rounded-lg p-4 border border-amber-300 mb-3">
                <p className="font-semibold text-red-700 mb-2">⚠️ Ne sortez pas de la messagerie</p>
                <p className="text-sm text-gray-700">
                  Si la discussion se fait en dehors de SwingMarket (SMS, WhatsApp, email, etc.), 
                  <strong> toute la protection acheteur et vendeur peut être perdue</strong>. 
                  La messagerie est modérée pour limiter les abus et sécuriser les échanges.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="font-semibold text-green-800 mb-2">✅ En cas d'accord sur un nouveau prix :</p>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li><strong>Vendeur :</strong> modifiez le prix dans votre espace vendeur → Mes annonces</li>
                  <li><strong>Acheteur :</strong> rechargez votre panier pour mettre à jour le prix</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Vendeur */}
      <div id="vendeur" className="max-w-4xl mx-auto px-4 mb-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#1B5E20] flex items-center justify-center">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">🏌️ Guide Vendeur</h2>
          </div>

          <p className="text-gray-700 mb-8">
            Sur SwingMarket, vous mettez votre matériel en ligne, vous expédiez avec une étiquette prépayée, 
            et vous êtes payé après la livraison (ou automatiquement une fois le délai de validation passé).
          </p>

          {/* Step 1 */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <Camera className="w-6 h-6 text-[#1B5E20] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">1. Mettre votre matériel en ligne</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Photos nettes :</strong> fond clair, plusieurs angles, défauts visibles (évite les litiges)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Titre précis :</strong> marque + modèle + caractéristiques (ex : "Driver TaylorMade M4 10.5° Regular")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Description honnête :</strong> état, usage, accessoires inclus, informations importantes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Choix du colis :</strong> à sélectionner selon la taille du produit <strong>une fois emballé</strong></span>
                  </li>
                </ul>
                <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                  <p className="text-sm text-gray-700">
                    <strong>⚠️ Attention au choix du colis :</strong> Le colis doit être adapté à votre produit une fois emballé (carton + protections). 
                    Si le colis choisi n'est pas le bon, cela peut poser problème au dépôt.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <Clock className="w-6 h-6 text-[#1B5E20] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">2. Quand vous faites une vente</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Vous recevez une notification <strong>email + SMS</strong></li>
                  <li>• Vous avez <strong>72h</strong> pour <strong>confirmer la vente</strong></li>
                  <li>• Après confirmation, l'étiquette d'expédition <strong>prépayée</strong> est générée automatiquement</li>
                </ul>
                <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <p className="text-sm text-gray-700">
                    👉 L'étiquette est disponible dans votre <strong>espace vendeur</strong>, sur le produit vendu.<br/>
                    👉 Livraison <strong>suivie</strong> et <strong>assurée</strong> vol et dégradation à partir de 200€
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <Package className="w-6 h-6 text-[#1B5E20] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">3. Expédier</h3>
                <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                  <li>Emballez soigneusement le matériel (protection + calage)</li>
                  <li>Collez l'étiquette prépayée sur le colis</li>
                  <li>Déposez le colis en point relais ou à La Poste selon le transporteur</li>
                </ol>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" /> Transport payé par l'acheteur
                  </span>
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" /> Zéro avance de frais
                  </span>
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" /> Suivi en ligne
                  </span>
                </div>
                <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <p className="text-sm text-gray-700">
                    <strong>📸 Conseil :</strong> Avant le dépôt, prenez des <strong>photos du colis</strong> (extérieur + protections). 
                    En cas de dégât pendant le transport, ces photos sont essentielles.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div>
            <div className="flex items-start gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-[#1B5E20] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">4. Vérification KYC & paiement</h3>
                <p className="text-gray-700 mb-3">
                  Pour vendre sur une marketplace en Europe, la vérification d'identité est une <strong>obligation légale</strong>. 
                  C'est ce qu'on appelle le <strong>KYC</strong> (Know Your Customer).
                </p>
                <ul className="space-y-2 text-gray-700 mb-4">
                  <li>• Le KYC est à faire <strong>une seule fois</strong></li>
                  <li>• Documents demandés : <strong>pièce d'identité + RIB</strong></li>
                  <li>• Conseil : faites-le <strong>avant votre première vente</strong> pour débloquer le paiement rapidement</li>
                </ul>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-green-900 mb-2">💳 Comment vous êtes payé</p>
                  <p className="text-sm text-gray-700 mb-2">
                    Le vendeur n'est <strong>pas payé tant que l'acheteur n'a pas reçu la commande et confirmé que tout est OK</strong>, 
                    ou tant que le délai de validation n'est pas passé.
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✅ Une fois le colis livré, l'acheteur dispose de <strong>48h</strong> pour signaler un souci</li>
                    <li>⏱️ Passé ce délai, l'argent est automatiquement transféré sur votre <strong>porte-monnaie SwingMarket</strong></li>
                    <li>🔁 Ensuite, sous <strong>24h</strong>, Stripe déclenche le virement vers le <strong>RIB renseigné</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Acheteur */}
      <div id="acheteur" className="max-w-4xl mx-auto px-4 mb-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#C5A028] flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">🛒 Guide Acheteur</h2>
          </div>

          <p className="text-gray-700 mb-8">
            Acheter sur SwingMarket, c'est simple : vous choisissez votre matériel, vous payez en ligne de façon sécurisée, 
            vous suivez la livraison, et vous disposez d'un délai pour valider la conformité à réception.
          </p>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-8">
            <p className="font-semibold text-green-900 mb-2">✅ Annulation automatique & remboursement</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Si le vendeur ne confirme pas la vente sous <strong>72h</strong> → annulation & remboursement automatique</li>
              <li>• Si le vendeur n'expédie pas sous <strong>5 jours ouvrés</strong> → annulation & remboursement automatique</li>
            </ul>
          </div>

          {/* Step 1 */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-6 h-6 text-[#C5A028] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">1. Avant d'acheter (check rapide)</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Photos suffisantes et cohérentes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Description claire (état, accessoires, détails)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>En cas de doute : utilisez la <strong>messagerie sécurisée</strong> (photos/vidéos, questions, négociation)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-[#C5A028] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">2. Paiement & protection</h3>
                <ul className="space-y-2 text-gray-700 mb-4">
                  <li>• Paiement sécurisé via <strong>Stripe</strong> (Visa, Mastercard, Apple Pay, Google Pay, etc.)</li>
                  <li>• Possibilité de payer en plusieurs fois avec <strong>Klarna</strong> selon éligibilité</li>
                  <li>• Le vendeur est payé uniquement après livraison + validation</li>
                </ul>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <p className="font-semibold text-blue-900 mb-2">⏱️ Délai de 48h après livraison</p>
                  <p className="text-sm text-gray-700 mb-2">
                    Une fois le colis livré, vous disposez de <strong>48h</strong> pour signaler tout problème 
                    (produit non conforme, défaut non mentionné, etc.).
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>👉 <strong>En cas de problème :</strong> le paiement est bloqué, nous intervenons pour résoudre le litige</li>
                    <li>👉 <strong>Sans problème :</strong> passé 48h, la commande est validée et le vendeur est payé</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <Truck className="w-6 h-6 text-[#C5A028] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">3. Livraison</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Le transporteur dépend du type de colis (Mondial Relay, Chronopost, Colissimo)</li>
                  <li>• Le suivi est disponible dès l'expédition</li>
                  <li>• Délai moyen : 2 à 5 jours ouvrés selon le transporteur</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div>
            <div className="flex items-start gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-[#C5A028] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">4. Besoin d'aide ?</h3>
                <p className="text-gray-700">
                  Si vous avez une question avant achat, ou si quelque chose vous semble anormal après réception, 
                  contactez-nous : nous sommes là pour vous aider.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 mb-16">
        <div className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Besoin d'aide ?</h3>
          <p className="text-white/90 mb-6">
            Notre équipe est là pour vous accompagner à chaque étape
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/FAQ" className="inline-flex items-center justify-center gap-2 bg-white text-[#1B5E20] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              <FileText className="w-5 h-5" />
              Consulter la FAQ
            </Link>
            <a href="mailto:contact@swingmarketgolf.com" className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20">
              <MessageSquare className="w-5 h-5" />
              Nous contacter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}