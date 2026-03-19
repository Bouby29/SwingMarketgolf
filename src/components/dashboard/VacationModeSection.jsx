import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export default function VacationModeSection() {
  const [isActive, setIsActive] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSave = async () => {
    alert("Mode vacances " + (isActive ? "activé" : "désactivé"));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mode vacances</h2>
        <p className="text-gray-600">Mettez votre boutique en pause temporairement</p>
      </div>
      
      <div className="space-y-5">
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div>
            <p className="font-medium">Activer le mode vacances</p>
            <p className="text-sm text-gray-600 mt-1">Vos produits seront masqués pendant la durée définie</p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        {isActive && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Date de début</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Date de fin</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>
        )}

        <Button onClick={handleSave} className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full w-full">
          Enregistrer
        </Button>
      </div>
    </div>
  );
}