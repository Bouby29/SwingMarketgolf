import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tag } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function MakeOfferButton({ product, isLoggedIn, currentUser }) {
  const [showDialog, setShowDialog] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");

  const handleOpen = () => {
    if (!isLoggedIn) { window.location.href = "/Login"; return; }
    setShowDialog(true);
  };

  const handleSend = () => {
    const amount = parseFloat(offerAmount);
    if (!amount || amount <= 0) {
      alert("Veuillez saisir un montant valide");
      return;
    }
    window.location.href = createPageUrl("Messages") + `?to=${product.seller_id}&product=${product.id}&offer=${encodeURIComponent(amount)}`;
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        size="lg"
        className="flex-1 bg-[#C5A028] hover:bg-[#b8902a] text-white rounded-full font-semibold"
      >
        <Tag className="w-4 h-4 mr-2" /> Faire une offre
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1B5E20]">💰 Faire une offre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">{product.title}</p>
              <p className="text-sm font-semibold text-[#1B5E20]">Prix demandé : {product.price?.toFixed(2)} €</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Suggestions</label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 7, 10].map(percent => {
                  const suggested = (product.price * (1 - percent / 100)).toFixed(2);
                  return (
                    <button
                      key={percent}
                      type="button"
                      onClick={() => setOfferAmount(suggested)}
                      className={`p-3 border-2 rounded-lg transition-colors ${offerAmount == suggested ? "border-[#C5A028] bg-yellow-50" : "border-gray-200 hover:border-[#C5A028] hover:bg-yellow-50"}`}
                    >
                      <div className="text-sm font-bold text-gray-800">{suggested} €</div>
                      <div className="text-xs text-gray-500">-{percent}%</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ou saisissez votre prix</label>
              <Input
                type="number"
                placeholder="Ex: 150"
                value={offerAmount}
                onChange={e => setOfferAmount(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                className="rounded-lg"
                autoFocus
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                📩 Votre offre sera envoyée via la messagerie. Le vendeur pourra accepter, refuser ou contre-proposer.
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1 rounded-full">
                Annuler
              </Button>
              <Button
                onClick={handleSend}
                disabled={!offerAmount || parseFloat(offerAmount) <= 0}
                className="flex-1 bg-[#C5A028] hover:bg-[#b8902a] text-white rounded-full"
              >
                Envoyer mon offre →
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
