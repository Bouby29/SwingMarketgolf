import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp } from "lucide-react";

export default function WalletSection({ mySales = [] }) {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);

  const balance = mySales
    .filter(o => o.status === "completed")
    .reduce((s, o) => s + (o.price || 0), 0);

  const handleWithdraw = () => {
    if (withdrawAmount && parseFloat(withdrawAmount) > 0) {
      alert(`Demande de retrait de ${withdrawAmount}€ en cours de traitement`);
      setWithdrawAmount("");
      setShowWithdraw(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mon porte-monnaie</h2>
        <p className="text-gray-600">Gérez vos gains et retraits</p>
      </div>
      
      <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white rounded-lg p-6 mb-6">
        <p className="text-sm opacity-90 mb-1">Solde disponible</p>
        <p className="text-4xl font-bold">{balance.toFixed(2)}€</p>
      </div>

      <div className="space-y-4">
        {!showWithdraw ? (
          <div className="flex gap-2">
            <Button onClick={() => setShowWithdraw(true)} className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full flex-1 gap-2">
              <TrendingUp className="w-4 h-4" /> Retirer l'argent
            </Button>
            <Button variant="outline" className="rounded-full flex-1 gap-2">
              <DollarSign className="w-4 h-4" /> Dépenser sur la marketplace
            </Button>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Montant à retirer (€)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                max={balance}
                className="rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum: {balance.toFixed(2)}€</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowWithdraw(false)} className="rounded-full flex-1">
                Annuler
              </Button>
              <Button onClick={handleWithdraw} className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full flex-1">
                Confirmer
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t">
        <h3 className="font-bold text-sm mb-3">Historique des transactions</h3>
        <p className="text-sm text-gray-600">Aucune transaction pour le moment</p>
      </div>
    </div>
  );
}