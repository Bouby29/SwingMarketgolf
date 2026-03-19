import React, { useState, useMemo, useEffect } from "react";
import SEOHead from "../components/seo/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase as base44 } from "@/lib/supabase";
import ProductCard from "../components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";

const ALL_CATEGORIES = [
  "Clubs de golf", "Balles de golf", "Chariots", "Sacs de golf",
  "Accessoires", "Entraînement", "Vêtements"
];

const CONDITIONS = [
  { value: "neuf", label: "Neuf" },
  { value: "comme_neuf", label: "Comme neuf" },
  { value: "bon_etat", label: "Bon état" },
  { value: "etat_correct", label: "État correct" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Plus récent" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
];

const SHAFT_FLEX = [
  { value: "ladies", label: "Ladies (L)" },
  { value: "senior", label: "Senior (A)" },
  { value: "regular", label: "Regular (R)" },
  { value: "stiff", label: "Stiff (S)" },
  { value: "extra_stiff", label: "Extra Stiff (X)" },
];

const CLUB_TYPES = [
  { value: "driver", label: "Driver" },
  { value: "bois", label: "Bois de parcours" },
  { value: "hybride", label: "Hybride" },
  { value: "fer", label: "Fers" },
  { value: "wedge", label: "Wedges" },
  { value: "putter", label: "Putter" },
  { value: "serie", label: "Série complète" },
];

export default function Marketplace() {
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [brand, setBrand] = useState("");
  const [shaftFlex, setShaftFlex] = useState("");
  const [clubType, setClubType] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Sync category/search from URL whenever URL changes (navbar clicks, etc.)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setCategory(params.get("category") || "");
    setSearch(params.get("search") || "");
  }, [location.search]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["marketplace-products"],
    queryFn: () => base44.entities.Product.filter({ status: "active" }, "-created_date", 100),
  });

  // Extract unique brands from products
  const availableBrands = useMemo(() => {
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    return brands.sort();
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p =>
        p.title?.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s) ||
        p.brand?.toLowerCase().includes(s)
      );
    }

    if (category) {
      result = result.filter(p => p.category === category || p.subcategory === category);
    }

    if (condition) {
      result = result.filter(p => p.condition === condition);
    }

    if (brand) {
      result = result.filter(p => p.brand === brand);
    }

    if (shaftFlex) {
      result = result.filter(p => p.specs?.shaft_flex === shaftFlex);
    }

    if (clubType) {
      result = result.filter(p => p.specs?.club_type === clubType);
    }

    if (priceMin) {
      result = result.filter(p => p.price >= parseFloat(priceMin));
    }
    if (priceMax) {
      result = result.filter(p => p.price <= parseFloat(priceMax));
    }

    if (sortBy === "price_asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") result.sort((a, b) => b.price - a.price);
    else result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    return result;
  }, [products, search, category, condition, brand, shaftFlex, clubType, sortBy, priceMin, priceMax]);

  const activeFilters = [
    category, 
    condition, 
    brand,
    shaftFlex && `Flex: ${shaftFlex}`,
    clubType,
    priceMin && `Min: ${priceMin}€`, 
    priceMax && `Max: ${priceMax}€`
  ].filter(Boolean);

  const clearFilters = () => {
    setCategory("");
    setCondition("");
    setPriceMin("");
    setPriceMax("");
    setBrand("");
    setShaftFlex("");
    setClubType("");
    setSearch("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEOHead
        title={category ? `Achat ${category} occasion | SwingMarket` : "Achat matériel golf occasion | SwingMarket"}
        description={category ? `Découvrez nos ${category.toLowerCase()} d'occasion. Achetez et vendez votre matériel de golf facilement sur SwingMarket.` : "Découvrez nos annonces de matériel golf d'occasion. Achetez et vendez votre équipement facilement sur SwingMarket."}
        url={`https://swingmarketgolf.com/Marketplace${category ? `?category=${encodeURIComponent(category)}` : ""}`}
      />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {category ? `${category} de golf d'occasion` : "Marketplace golf - Matériel de golf d'occasion"}
        </h1>
        <h2 className="text-lg text-gray-600 mt-2">
          {category 
            ? `Trouvez les meilleurs ${category.toLowerCase()} au meilleur prix`
            : "Achetez et vendez votre équipement de golf entre passionnés"
          }
        </h2>
        <p className="text-gray-500 mt-1">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Search & Sort bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full bg-white"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-full gap-2 bg-white border-2 border-gray-300 text-gray-900 font-medium"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filtres
          </Button>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] rounded-full bg-white border-2 border-gray-300 font-medium text-gray-900 pl-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Catégorie</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Toutes</SelectItem>
                  {ALL_CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Marque</label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Toutes</SelectItem>
                  {availableBrands.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">État</label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Tous</SelectItem>
                  {CONDITIONS.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Prix min (€)</label>
              <Input type="number" placeholder="0" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Prix max (€)</label>
              <Input type="number" placeholder="∞" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="rounded-lg" />
            </div>
            {category === "Clubs de golf" && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Type de club</label>
                  <Select value={clubType} onValueChange={setClubType}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Tous</SelectItem>
                      {CLUB_TYPES.map(ct => (
                        <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Flexibilité du shaft</label>
                  <Select value={shaftFlex} onValueChange={setShaftFlex}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Toutes</SelectItem>
                      {SHAFT_FLEX.map(sf => (
                        <SelectItem key={sf.value} value={sf.value}>{sf.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {activeFilters.map(f => (
            <Badge key={f} variant="secondary" className="bg-green-50 text-[#1B5E20] rounded-full px-3 py-1">
              {f}
            </Badge>
          ))}
          <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
            <X className="w-3 h-3" /> Effacer
          </button>
        </div>
      )}

      {/* Products grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden">
              <div className="aspect-square shimmer" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-20 shimmer rounded" />
                <div className="h-4 w-full shimmer rounded" />
                <div className="h-5 w-16 shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Aucun résultat</h3>
          <p className="text-gray-500 text-sm mt-1">Essayez avec d'autres filtres</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}