import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  { value: "Clubs de golf", label: "Clubs de golf" },
  { value: "Balles de golf", label: "Balles de golf" },
  { value: "Chariots", label: "Chariots" },
  { value: "Sacs de golf", label: "Sacs de golf" },
  { value: "Accessoires", label: "Accessoires" },
  { value: "Entraînement", label: "Entraînement" },
  { value: "Vêtements", label: "Vêtements" },
];

export default function CategorySelector({ value, onChange }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Étape 1 : Choisir une catégorie</h2>
      <Label className="mb-3 block text-gray-900 font-bold text-base">Catégorie *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-12"><SelectValue placeholder="Sélectionnez une catégorie" /></SelectTrigger>
        <SelectContent>
          {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}