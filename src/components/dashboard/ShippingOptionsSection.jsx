import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function ShippingOptionsSection() {
  const { data: shippingOffers = [] } = useQuery({
    queryKey: ["shipping-offers"],
    queryFn: () => base44.entities.ShippingOffer.filter({ is_active: true }, "-created_date", 50),
  });

  const [activeShippers, setActiveShippers] = useState({});

  const toggleShipper = (id) => {
    setActiveShippers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes options d'envoi</h2>
        <p className="text-gray-600">Configurez vos méthodes d'expédition</p>
      </div>
      
      <div className="space-y-4">
        {shippingOffers.length === 0 ? (
          <p className="text-gray-600">Aucune option d'envoi disponible</p>
        ) : (
          shippingOffers.map(offer => (
            <div key={offer.id} className="border rounded-lg p-4 flex items-start justify-between">
              <div>
                <p className="font-bold text-sm">{offer.carrier_label || offer.carrier}</p>
                <p className="text-sm text-gray-600">{offer.offer_name}</p>
                {offer.description && <p className="text-xs text-gray-500 mt-1">{offer.description}</p>}
              </div>
              <Switch checked={activeShippers[offer.id] ?? true} onCheckedChange={() => toggleShipper(offer.id)} />
            </div>
          ))
        )}
      </div>

      <Button className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full w-full mt-6">
        Enregistrer les modifications
      </Button>
    </div>
  );
}