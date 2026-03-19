import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function VacationFields({ specs, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-900 font-bold text-base">Type de logement *</Label>
          <Select value={specs.property_type || ""} onValueChange={v => onChange('property_type', v)}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="maison">Maison</SelectItem>
              <SelectItem value="appartement">Appartement</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="hotel">Hôtel</SelectItem>
              <SelectItem value="resort">Resort</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-base">Ville *</Label>
          <Input 
            value={specs.vacation_city || ""} 
            onChange={e => onChange('vacation_city', e.target.value)}
            placeholder="Ex: Versailles"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-900 font-bold text-base">Pays *</Label>
          <Input 
            value={specs.vacation_country || ""} 
            onChange={e => onChange('vacation_country', e.target.value)}
            placeholder="Ex: France"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-base">Prix par nuit (€) *</Label>
          <Input 
            type="number"
            step="0.01"
            value={specs.vacation_price || ""} 
            onChange={e => onChange('vacation_price', e.target.value)}
            placeholder="0.00"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label className="text-gray-900 font-bold text-base">Nombre de personnes</Label>
          <Input 
            type="number"
            value={specs.vacation_guests || ""} 
            onChange={e => onChange('vacation_guests', e.target.value)}
            placeholder="Ex: 4"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-base">Nombre de chambres</Label>
          <Input 
            type="number"
            value={specs.vacation_rooms || ""} 
            onChange={e => onChange('vacation_rooms', e.target.value)}
            placeholder="Ex: 2"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-base">Proximité d'un golf</Label>
          <Input 
            value={specs.vacation_golf_proximity || ""} 
            onChange={e => onChange('vacation_golf_proximity', e.target.value)}
            placeholder="Ex: 2 km"
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
}