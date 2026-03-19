import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GolfBallsFields({ specs, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-900 font-bold text-base">Modèle *</Label>
          <Input 
            value={specs.ball_model || ""} 
            onChange={e => onChange('ball_model', e.target.value)}
            placeholder="Ex: Pro V1x"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-base">Nombre de balles *</Label>
          <Input 
            type="number"
            value={specs.ball_count || ""} 
            onChange={e => onChange('ball_count', e.target.value)}
            placeholder="Ex: 12"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-900 font-bold text-base">État *</Label>
          <Select value={specs.ball_condition || ""} onValueChange={v => onChange('ball_condition', v)}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="neuves">Neuves</SelectItem>
              <SelectItem value="recyclees">Recyclées</SelectItem>
              <SelectItem value="lake_balls">Lake balls</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-base">Couleur</Label>
          <Input 
            value={specs.ball_color || ""} 
            onChange={e => onChange('ball_color', e.target.value)}
            placeholder="Ex: Blanc"
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
}