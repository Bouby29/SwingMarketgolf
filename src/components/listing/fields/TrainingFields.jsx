import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TrainingFields({ specs, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-900 font-bold text-base">Type d'équipement *</Label>
          <Select value={specs.training_type || ""} onValueChange={v => onChange('training_type', v)}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tapis">Tapis d'entraînement</SelectItem>
              <SelectItem value="filet">Filet</SelectItem>
              <SelectItem value="putting_mat">Putting mat</SelectItem>
              <SelectItem value="simulateur">Simulateur</SelectItem>
              <SelectItem value="aide_swing">Aide au swing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-base">Modèle</Label>
          <Input 
            value={specs.training_model || ""} 
            onChange={e => onChange('training_model', e.target.value)}
            placeholder="Ex: Pro Swing"
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label className="text-gray-900 font-bold text-base">Dimensions</Label>
        <Input 
          value={specs.training_dimensions || ""} 
          onChange={e => onChange('training_dimensions', e.target.value)}
          placeholder="Ex: 150cm x 100cm"
          className="mt-1.5"
        />
      </div>
    </div>
  );
}