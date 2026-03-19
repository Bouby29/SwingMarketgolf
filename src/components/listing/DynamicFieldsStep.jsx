import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GolfClubsFields from "./fields/GolfClubsFields";
import GolfBallsFields from "./fields/GolfBallsFields";
import CartsFields from "./fields/CartsFields";
import GolfBagsFields from "./fields/GolfBagsFields";
import AccessoriesFields from "./fields/AccessoriesFields";
import TrainingFields from "./fields/TrainingFields";
import ClothingFields from "./fields/ClothingFields";
import VacationFields from "./fields/VacationFields";

export default function DynamicFieldsStep({ category, form, onChange }) {
  const handleInputChange = (field, value) => {
    onChange({ ...form, specs: { ...form.specs, [field]: value } });
  };

  const renderCategoryFields = () => {
    switch (category) {
      case "Clubs de golf":
        return <GolfClubsFields specs={form.specs} onChange={handleInputChange} />;
      case "Balles de golf":
        return <GolfBallsFields specs={form.specs} onChange={handleInputChange} />;
      case "Chariots":
        return <CartsFields specs={form.specs} onChange={handleInputChange} />;
      case "Sacs de golf":
        return <GolfBagsFields specs={form.specs} onChange={handleInputChange} />;
      case "Accessoires":
        return <AccessoriesFields specs={form.specs} onChange={handleInputChange} />;
      case "Entraînement":
        return <TrainingFields specs={form.specs} onChange={handleInputChange} />;
      case "Vêtements":
        return <ClothingFields specs={form.specs} onChange={handleInputChange} />;
      case "Vacances golf":
        return <VacationFields specs={form.specs} onChange={handleInputChange} />;
      default:
        return null;
    }
  };

  if (!category) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Étape 3 : Caractéristiques techniques</h2>
      {renderCategoryFields()}
    </div>
  );
}