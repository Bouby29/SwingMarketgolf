import React from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

export default function ShippingAddressForm({ address, onChange }) {
  const set = (field, value) => onChange({ ...address, [field]: value });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="w-4 h-4 text-[#1B5E20]" />
        <p className="text-sm font-semibold text-gray-900">Adresse de livraison</p>
      </div>
      <Input
        placeholder="Adresse (ex: 12 rue des Acacias)"
        value={address.street || ""}
        onChange={e => set("street", e.target.value)}
        className="text-sm"
      />
      <div className="flex gap-2">
        <Input
          placeholder="Code postal"
          value={address.postal_code || ""}
          onChange={e => set("postal_code", e.target.value)}
          className="text-sm w-32"
        />
        <Input
          placeholder="Ville"
          value={address.city || ""}
          onChange={e => set("city", e.target.value)}
          className="text-sm flex-1"
        />
      </div>
      <Input
        placeholder="Téléphone (recommandé)"
        value={address.phone || ""}
        onChange={e => set("phone", e.target.value)}
        className="text-sm"
      />
    </div>
  );
}