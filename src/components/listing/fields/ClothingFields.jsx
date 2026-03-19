import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClothingFields({ specs, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-900 font-bold text-base">Type de vêtement *</Label>
          <Select value={specs.clothing_type || ""} onValueChange={v => onChange('clothing_type', v)}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="polo">Polo</SelectItem>
              <SelectItem value="pantalon">Pantalon</SelectItem>
              <SelectItem value="veste">Veste</SelectItem>
              <SelectItem value="chaussures">Chaussures</SelectItem>
              <SelectItem value="casquette">Casquette</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-base">Taille *</Label>
          <Input 
            value={specs.clothing_size || ""} 
            onChange={e => onChange('clothing_size', e.target.value)}
            placeholder="Ex: L"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-900 font-bold text-base">Couleur</Label>
          <Input 
            value={specs.clothing_color || ""} 
            onChange={e => onChange('clothing_color', e.target.value)}
            placeholder="Ex: Bleu marine"
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
}