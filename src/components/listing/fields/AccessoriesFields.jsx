import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AccessoriesFields({ specs, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-900 font-bold text-base">Type d'accessoire *</Label>
          <Select value={specs.accessory_type || ""} onValueChange={v => onChange('accessory_type', v)}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tees">Tees</SelectItem>
              <SelectItem value="telemetre">Télémètre</SelectItem>
              <SelectItem value="gps">GPS</SelectItem>
              <SelectItem value="gants">Gants</SelectItem>
              <SelectItem value="serviettes">Serviettes</SelectItem>
              <SelectItem value="marqueur_balle">Marqueur de balle</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-base">Modèle</Label>
          <Input 
            value={specs.acc_model || ""} 
            onChange={e => onChange('acc_model', e.target.value)}
            placeholder="Ex: PRO XS"
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
}