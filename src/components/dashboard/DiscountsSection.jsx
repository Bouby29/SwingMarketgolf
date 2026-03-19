import React from "react";

export default function DiscountsSection() {
  const discounts = [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bons de réduction</h2>
        <p className="text-gray-600">Vos codes promos et réductions disponibles</p>
      </div>
      
      {discounts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Vous ne possédez pas de bon de réduction.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {discounts.map(d => (
            <div key={d.id} className="border rounded-lg p-4">
              <p className="font-bold">{d.code}</p>
              <p className="text-sm text-gray-600">{d.value}% de réduction</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}