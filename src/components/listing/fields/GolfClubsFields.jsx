import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GolfClubsFields({ specs, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-900 font-bold text-sm">Type de club *</Label>
          <Select value={specs.club_type || ""} onValueChange={v => onChange('club_type', v)}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="driver">Driver</SelectItem>
              <SelectItem value="fer">Fer</SelectItem>
              <SelectItem value="wedge">Wedge</SelectItem>
              <SelectItem value="putter">Putter</SelectItem>
              <SelectItem value="hybride">Hybride</SelectItem>
              <SelectItem value="bois">Bois</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-sm">Modèle</Label>
           <Input 
             value={specs.club_model || ""} 
             onChange={e => onChange('club_model', e.target.value)}
             placeholder="Ex: Stealth 2"
             className="mt-1.5"
           />
          </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label className="text-gray-900 font-bold text-sm">Flex du shaft</Label>
          <Select value={specs.flex || ""} onValueChange={v => onChange('flex', v)}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="stiff">Stiff</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="extra_stiff">Extra Stiff</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-sm">Loft (°)</Label>
          <Input 
            value={specs.loft || ""} 
            onChange={e => onChange('loft', e.target.value)}
            placeholder="Ex: 10.5"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-sm">Longueur (pouces)</Label>
          <Input 
            value={specs.length || ""} 
            onChange={e => onChange('length', e.target.value)}
            placeholder="Ex: 45.5"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label className="text-gray-900 font-bold text-sm">Main</Label>
          <Select value={specs.hand || ""} onValueChange={v => onChange('hand', v)}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="droitier">Droitier</SelectItem>
              <SelectItem value="gaucher">Gaucher</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-sm">Shaft</Label>
          <Input 
            value={specs.shaft || ""} 
            onChange={e => onChange('shaft', e.target.value)}
            placeholder="Ex: Graphite"
            className="mt-1.5"
          />
          </div>
          <div>
          <Label className="text-gray-900 font-bold text-sm">Grip</Label>
          <Input 
            value={specs.grip || ""} 
            onChange={e => onChange('grip', e.target.value)}
            placeholder="Ex: Golf Pride"
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label className="text-gray-900 font-bold text-sm">Année du modèle</Label>
        <Input 
          type="number"
          value={specs.model_year || ""} 
          onChange={e => onChange('model_year', e.target.value)}
          placeholder="Ex: 2024"
          className="mt-1.5"
        />
      </div>
    </div>
  );
}