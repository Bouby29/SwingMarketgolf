import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

export default function BankAccountsSection() {
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    holder: "",
    iban: "",
    bic: "",
  });

  const handleAddAccount = () => {
    if (formData.holder && formData.iban && formData.bic) {
      setAccounts([...accounts, { id: Date.now(), ...formData }]);
      setFormData({ holder: "", iban: "", bic: "" });
      setShowForm(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes comptes bancaires</h2>
        <p className="text-gray-600">Vos coordonnées bancaires pour les paiements</p>
      </div>
      <Button onClick={() => setShowForm(!showForm)} className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full gap-2 mb-6">
        <Plus className="w-4 h-4" /> Ajouter un compte
      </Button>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          <Input
            placeholder="Titulaire du compte"
            value={formData.holder}
            onChange={(e) => setFormData({ ...formData, holder: e.target.value })}
            className="rounded-lg"
          />
          <Input
            placeholder="IBAN"
            value={formData.iban}
            onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
            className="rounded-lg"
          />
          <Input
            placeholder="BIC"
            value={formData.bic}
            onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
            className="rounded-lg"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-full">Annuler</Button>
            <Button onClick={handleAddAccount} className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full">Enregistrer</Button>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Aucun compte bancaire enregistré</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map(account => (
            <div key={account.id} className="border rounded-lg p-4 flex items-start justify-between">
              <div>
                <p className="font-bold text-sm">{account.holder}</p>
                <p className="text-sm text-gray-600">{account.iban}</p>
                <p className="text-sm text-gray-600">BIC: {account.bic}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setAccounts(accounts.filter(a => a.id !== account.id))}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}