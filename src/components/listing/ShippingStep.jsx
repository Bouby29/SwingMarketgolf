import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ShippingStep({ form, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Étape 4 : Livraison</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-900 font-medium">Transporteur *</Label>
          <Select value={form.shipping_carrier} onValueChange={v => handleChange('shipping_carrier', v)}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mondial_relay">Mondial Relay</SelectItem>
              <SelectItem value="chronopost">Chronopost</SelectItem>
              <SelectItem value="colissimo">Colissimo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}