import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CartsFields({ specs, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-900 font-bold text-base">Modèle *</Label>
          <Input 
            value={specs.cart_model || ""} 
            onChange={e => onChange('cart_model', e.target.value)}
            placeholder="Ex: M1"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-base">Type *</Label>
          <Select value={specs.cart_type || ""} onValueChange={v => onChange('cart_type', v)}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="manuel">Manuel</SelectItem>
              <SelectItem value="electrique">Électrique</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label className="text-gray-900 font-bold text-base">Nombre de roues</Label>
          <Input 
            type="number"
            value={specs.wheels || ""} 
            onChange={e => onChange('wheels', e.target.value)}
            placeholder="Ex: 3"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-base">Pliable</Label>
          <Select value={specs.foldable || ""} onValueChange={v => onChange('foldable', v)}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="oui">Oui</SelectItem>
              <SelectItem value="non">Non</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-base">Année</Label>
          <Input 
            type="number"
            value={specs.cart_year || ""} 
            onChange={e => onChange('cart_year', e.target.value)}
            placeholder="Ex: 2023"
            className="mt-1.5"
          />
        </div>
      </div>

      {specs.cart_type === "electrique" && (
        <div>
          <Label className="text-gray-900 font-bold text-base">Batterie</Label>
          <Input 
            value={specs.battery || ""} 
            onChange={e => onChange('battery', e.target.value)}
            placeholder="Ex: Lithium 36V"
            className="mt-1.5"
          />
        </div>
      )}
    </div>
  );
}