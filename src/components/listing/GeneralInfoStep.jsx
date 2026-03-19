import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gavel, Tag, Package, Info } from "lucide-react";

const PARCEL_SIZES = [
  {
    value: "small",
    label: "Petit colis",
    weight: "1 – 2 kg",
    examples: "Vêtements, tees, balles, gants, petits accessoires",
    icon: "📦",
  },
  {
    value: "medium",
    label: "Colis moyen",
    weight: "2 – 4 kg",
    examples: "Chaussures, sac léger, accessoires volumineux",
    icon: "📫",
  },
  {
    value: "large",
    label: "Grand colis",
    weight: "4 – 15 kg",
    examples: "Clubs, chariots, équipements volumineux",
    icon: "🗃️",
  },
];

const CONDITIONS = [
  { value: "neuf", label: "Neuf" },
  { value: "comme_neuf", label: "Comme neuf" },
  { value: "tres_bon_etat", label: "Très bon état" },
  { value: "bon_etat", label: "Bon état" },
  { value: "etat_correct", label: "État correct" },
];

export default function GeneralInfoStep({ form, onChange }) {
  const handleInputChange = (field, value) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Étape 2 : Informations générales</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
           <Label className="text-gray-900 font-bold text-base">Titre de l'annonce *</Label>
          <Input 
            value={form.title} 
            onChange={e => handleInputChange('title', e.target.value)}
            placeholder="Ex: Driver TaylorMade Stealth 2"
            className="mt-1.5"
          />
        </div>
        <div>
           <Label className="text-gray-900 font-bold text-base">Marque *</Label>
          <Input 
            value={form.brand} 
            onChange={e => handleInputChange('brand', e.target.value)}
            placeholder="Ex: TaylorMade"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="mb-4">
        <Label className="text-gray-900 font-bold text-base">Description *</Label>
        <Textarea 
          value={form.description} 
          onChange={e => handleInputChange('description', e.target.value)}
          placeholder="Décrivez votre article en détail..."
          className="mt-1.5 min-h-[100px]"
        />
      </div>

      {/* Sale type selector */}
      <div className="mb-4">
        <Label className="text-gray-900 font-bold text-base">Type de vente *</Label>
        <div className="grid grid-cols-2 gap-3 mt-1.5">
          <button
            type="button"
            onClick={() => handleInputChange('sale_type', 'fixed')}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${(form.sale_type || 'fixed') === 'fixed' ? 'border-[#1B5E20] bg-green-50 text-[#1B5E20]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
          >
            <Tag className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Prix fixe</p>
              <p className="text-xs opacity-70">Vente immédiate</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleInputChange('sale_type', 'auction')}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${form.sale_type === 'auction' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
          >
            <Gavel className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Enchère</p>
              <p className="text-xs opacity-70">Meilleure offre gagne</p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <div>
           <Label className="text-gray-900 font-bold text-base">{form.sale_type === 'auction' ? 'Prix de départ (€) *' : 'Prix (€) *'}</Label>
          <Input 
            type="number"
            step="0.01"
            value={form.price} 
            onChange={e => handleInputChange('price', e.target.value)}
            placeholder="0.00"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-base">Prix neuf (€)</Label>
          <Input 
            type="number"
            step="0.01"
            value={form.retail_price} 
            onChange={e => handleInputChange('retail_price', e.target.value)}
            placeholder="0.00"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-gray-900 font-bold text-base">État *</Label>
          <Select value={form.condition} onValueChange={v => handleInputChange('condition', v)}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>
              {CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Parcel size selector */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Label className="text-gray-900 font-bold text-base">Taille du colis *</Label>
        </div>
        <p className="text-xs text-gray-500 mb-3 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-400" />
          Choisissez la taille correspondant à votre article afin de proposer les transporteurs adaptés à l'acheteur.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PARCEL_SIZES.map(size => (
            <button
              key={size.value}
              type="button"
              onClick={() => handleInputChange('package_size', size.value)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                form.package_size === size.value
                  ? 'border-[#1B5E20] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{size.icon}</div>
              <p className={`font-semibold text-sm mb-0.5 ${form.package_size === size.value ? 'text-[#1B5E20]' : 'text-gray-900'}`}>
                {size.label}
              </p>
              <p className="text-xs font-medium text-gray-500 mb-1">{size.weight}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{size.examples}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Auction options */}
      {form.sale_type === 'auction' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Gavel className="w-4 h-4 text-amber-600" />
            <p className="font-semibold text-sm text-amber-800">Paramètres de l'enchère</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-amber-900 font-bold text-base">Durée de l'enchère</Label>
              <Select
                value={form.auction_duration || '7'}
                onValueChange={v => handleInputChange('auction_duration', v)}
              >
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 jour</SelectItem>
                  <SelectItem value="3">3 jours</SelectItem>
                  <SelectItem value="5">5 jours</SelectItem>
                  <SelectItem value="7">7 jours (défaut)</SelectItem>
                  <SelectItem value="10">10 jours</SelectItem>
                  <SelectItem value="14">14 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <p className="text-xs text-amber-700 pb-1">
                L'enchère se terminera automatiquement après la durée choisie. Le meilleur enchérisseur remporte l'article.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}