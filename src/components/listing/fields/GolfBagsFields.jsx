import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GolfBagsFields({ specs, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-900 font-bold text-base">Type de sac *</Label>
          <Select value={specs.bag_type || ""} onValueChange={v => onChange('bag_type', v)}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="trepied">Trépied</SelectItem>
              <SelectItem value="chariot">Chariot</SelectItem>
              <SelectItem value="tour">Tour</SelectItem>
              <SelectItem value="voyage">Voyage</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-base">Nombre de compartiments</Label>
          <Input 
            type="number"
            value={specs.compartments || ""} 
            onChange={e => onChange('compartments', e.target.value)}
            placeholder="Ex: 14"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-900 font-bold text-base">Couleur</Label>
          <Input 
            value={specs.bag_color || ""} 
            onChange={e => onChange('bag_color', e.target.value)}
            placeholder="Ex: Noir"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-base">Poids (kg)</Label>
          <Input 
            type="number"
            step="0.1"
            value={specs.bag_weight || ""} 
            onChange={e => onChange('bag_weight', e.target.value)}
            placeholder="Ex: 2.5"
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
}