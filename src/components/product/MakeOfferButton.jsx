import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase as base44 } from "@/lib/supabase";
import { Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MakeOfferButton({ product, isLoggedIn, currentUser }) {
  const [showDialog, setShowDialog] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const handleMakeOffer = async () => {
    if (!isLoggedIn) {
      base44.auth.redirectToLogin();
      return;
    }

    const amount = parseFloat(offerAmount);
    if (!amount || amount <= 0 || amount >= product.price) {
      alert("Veuillez saisir un montant valide inférieur au prix demandé");
      return;
    }

    if (sending) return; // Prevent double submission
    setSending(true);
    try {
      // Create conversation ID
      const conversationId = [currentUser.id, product.seller_id].sort().join('_') + '_' + product.id;

      // Send offer message
      await base44.entities.Message.create({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        sender_name: currentUser.full_name,
        receiver_id: product.seller_id,
        receiver_name: product.seller_name,
        content: `Bonjour,\n\nJe suis intéressé par votre article "${product.title}".\n\n💰 Je vous propose : ${amount.toFixed(2)} €\n\nN'hésitez pas à me faire une contre-proposition si vous le souhaitez !\n\nCordialement`,
        product_id: product.id,
        product_title: product.title,
        read: false,
      });

      // Send email to buyer
      await base44.integrations.Core.SendEmail({
        to: currentUser.email,
        subject: "Votre offre a bien été envoyée - SwingMarket",
        body: `
          <h2>Votre offre a été envoyée !</h2>
          <p>Bonjour ${currentUser.full_name},</p>
          <p>Votre offre de <strong>${amount.toFixed(2)} €</strong> pour l'article "<strong>${product.title}</strong>" a bien été transmise au vendeur.</p>
          <p>Le vendeur peut maintenant accepter, refuser ou faire une contre-offre.</p>
          <p>Vous serez notifié de sa réponse par email.</p>
          <p>Cordialement,<br>L'équipe SwingMarket</p>
        `,
      });

      // Send email to seller
      const seller = await base44.entities.User.filter({ id: product.seller_id });
      if (seller.length > 0) {
        await base44.integrations.Core.SendEmail({
          to: seller[0].email,
          subject: "Vous avez reçu une offre - SwingMarket",
          body: `
            <h2>Nouvelle offre reçue !</h2>
            <p>Bonjour ${product.seller_name},</p>
            <p><strong>${currentUser.full_name}</strong> vous a fait une offre de <strong>${amount.toFixed(2)} €</strong> pour votre article "<strong>${product.title}</strong>".</p>
            <p>Prix initial : ${product.price.toFixed(2)} €</p>
            <p>Connectez-vous à votre messagerie pour accepter, refuser ou faire une contre-offre.</p>
            <p>Cordialement,<br>L'équipe SwingMarket</p>
          `,
        });
      }

      setShowDialog(false);
      setOfferAmount("");
      
      // Redirect to messages
      navigate(`/Messages?to=${product.seller_id}&product=${product.id}`);
    } catch (err) {
      alert("Erreur lors de l'envoi de l'offre");
      setSending(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        size="lg"
        className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-full font-semibold"
      >
        <Tag className="w-4 h-4 mr-2" /> Faire une offre
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1B5E20]">Faire une offre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Article : {product.title}</p>
              <p className="text-sm font-semibold text-[#1B5E20]">Prix demandé : {product.price.toFixed(2)} €</p>
            </div>

            {/* Suggestions de prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Suggestions d'offres</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { percent: 3, label: "-3%" },
                  { percent: 7, label: "-7%" },
                  { percent: 10, label: "-10%" }
                ].map(({ percent, label }) => {
                  const suggestedPrice = (product.price * (1 - percent / 100)).toFixed(2);
                  return (
                    <button
                      key={percent}
                      type="button"
                      onClick={() => setOfferAmount(suggestedPrice)}
                      className="p-3 border-2 border-[#1B5E20] bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <div className="text-sm font-bold text-[#1B5E20]">{suggestedPrice} €</div>
                      <div className="text-xs text-gray-600">{label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ou saisissez votre offre</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 150.00"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="rounded-lg border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">
                Votre offre doit être inférieure au prix demandé
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                📩 Votre offre sera envoyée directement au vendeur via la messagerie. Le vendeur pourra accepter, refuser ou faire une contre-offre.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1 rounded-full border-gray-300"
              >
                Annuler
              </Button>
              <Button
                onClick={handleMakeOffer}
                disabled={sending}
                className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-full"
              >
                {sending ? "Envoi..." : "Envoyer l'offre"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}