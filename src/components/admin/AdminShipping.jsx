import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase as base44 } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Truck, Package, CheckCircle2, XCircle, GripVertical, Info } from "lucide-react";

const CARRIERS = {
  mondial_relay:  { label: "Mondial Relay",  color: "bg-red-100 text-red-700",    logo: "🔴" },
  chronopost:     { label: "Chronopost",     color: "bg-yellow-100 text-yellow-700", logo: "🟡" },
  colissimo:      { label: "Colissimo",      color: "bg-blue-100 text-blue-700",  logo: "🔵" },
  ups:            { label: "UPS",            color: "bg-amber-100 text-amber-800", logo: "🟤" },
  dhl:            { label: "DHL",            color: "bg-orange-100 text-orange-700", logo: "🟠" },
  custom:         { label: "Personnalisé",   color: "bg-gray-100 text-gray-700",  logo: "⚫" },
};

const PACKAGE_SIZES = {
  petit:  { label: "Petit",  desc: "≤ 30x20x5cm" },
  moyen:  { label: "Moyen",  desc: "≤ 50x30x20cm" },
  grand:  { label: "Grand",  desc: "≤ 100x60x40cm" },
  tous:   { label: "Tous formats", desc: "" },
};

const EMPTY_FORM = {
  carrier: "colissimo",
  carrier_label: "",
  offer_name: "",
  description: "",
  package_size: "petit",
  max_weight_kg: "",
  max_dimensions_cm: "",
  base_price: "",
  delivery_days_min: "",
  delivery_days_max: "",
  is_active: true,
  sendcloud_service_point: false,
  tracking_included: true,
  price_grid: [],
};

import AdminShippingCarriers from "./AdminShippingCarriers";

export default function AdminShipping() {
  return <AdminShippingCarriers />;
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [newRow, setNewRow] = useState({ weight_min: "", weight_max: "", price: "" });

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["admin-shipping-offers"],
    queryFn: () => base44.entities.ShippingOffer.list("-created_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ShippingOffer.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-shipping-offers"] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShippingOffer.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-shipping-offers"] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ShippingOffer.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-shipping-offers"] }),
  });

  const toggleActive = (offer) => {
    updateMutation.mutate({ id: offer.id, data: { is_active: !offer.is_active } });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setNewRow({ weight_min: "", weight_max: "", price: "" });
    setModalOpen(true);
  };

  const openEdit = (offer) => {
    setEditing(offer);
    setForm({
      carrier: offer.carrier || "colissimo",
      carrier_label: offer.carrier_label || "",
      offer_name: offer.offer_name || "",
      description: offer.description || "",
      package_size: offer.package_size || "petit",
      max_weight_kg: offer.max_weight_kg ?? "",
      max_dimensions_cm: offer.max_dimensions_cm || "",
      base_price: offer.base_price ?? "",
      delivery_days_min: offer.delivery_days_min ?? "",
      delivery_days_max: offer.delivery_days_max ?? "",
      is_active: offer.is_active !== false,
      sendcloud_service_point: offer.sendcloud_service_point || false,
      tracking_included: offer.tracking_included !== false,
      price_grid: offer.price_grid || [],
    });
    setNewRow({ weight_min: "", weight_max: "", price: "" });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const addGridRow = () => {
    if (!newRow.weight_max || !newRow.price) return;
    setForm(f => ({
      ...f,
      price_grid: [...f.price_grid, {
        weight_min: parseFloat(newRow.weight_min) || 0,
        weight_max: parseFloat(newRow.weight_max),
        price: parseFloat(newRow.price),
      }].sort((a, b) => a.weight_min - b.weight_min),
    }));
    setNewRow({ weight_min: "", weight_max: "", price: "" });
  };

  const removeGridRow = (idx) => {
    setForm(f => ({ ...f, price_grid: f.price_grid.filter((_, i) => i !== idx) }));
  };

  const handleSave = () => {
    const payload = {
      ...form,
      max_weight_kg: form.max_weight_kg !== "" ? parseFloat(form.max_weight_kg) : null,
      base_price: form.base_price !== "" ? parseFloat(form.base_price) : null,
      delivery_days_min: form.delivery_days_min !== "" ? parseInt(form.delivery_days_min) : null,
      delivery_days_max: form.delivery_days_max !== "" ? parseInt(form.delivery_days_max) : null,
    };
    if (editing) updateMutation.mutate({ id: editing.id, data: payload });
    else createMutation.mutate(payload);
  };

  // Grouper par transporteur
  const byCarrier = CARRIERS;
  const grouped = Object.keys(CARRIERS).reduce((acc, key) => {
    acc[key] = offers.filter(o => o.carrier === key);
    return acc;
  }, {});

  const totalActive = offers.filter(o => o.is_active !== false).length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Offres de transport</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {offers.length} offre{offers.length > 1 ? "s" : ""} configurée{offers.length > 1 ? "s" : ""} · {totalActive} active{totalActive > 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreate} className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white gap-2">
          <Plus className="w-4 h-4" /> Nouvelle offre
        </Button>
      </div>

      {/* Sendcloud banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Intégration Sendcloud</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Connectez votre compte Sendcloud pour synchroniser automatiquement les étiquettes et le suivi. 
            Les offres ci-dessous définissent les tarifs affichés aux acheteurs lors du paiement.
          </p>
        </div>
        <Button variant="outline" size="sm" className="border-blue-400 text-blue-700 hover:bg-blue-100 whitespace-nowrap ml-auto text-xs">
          Connecter Sendcloud
        </Button>
      </div>

      {/* Grilles par transporteur */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(CARRIERS).map(([key, carrier]) => {
            const carrierOffers = grouped[key] || [];
            if (key !== "custom" && carrierOffers.length === 0) return null;
            return (
              <div key={key} className="bg-white rounded-xl border overflow-hidden">
                {/* Transporteur header */}
                <div className="px-5 py-3 bg-gray-50 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{carrier.logo}</span>
                    <span className="font-semibold text-gray-800">{carrier.label}</span>
                    <Badge className={`text-xs ${carrier.color}`}>{carrierOffers.length} offre{carrierOffers.length > 1 ? "s" : ""}</Badge>
                  </div>
                  <Button
                    variant="ghost" size="sm"
                    className="text-xs text-[#1B5E20] gap-1"
                    onClick={() => { openCreate(); setForm(f => ({ ...f, carrier: key })); }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter
                  </Button>
                </div>

                {carrierOffers.length === 0 ? (
                  <div className="px-5 py-6 text-sm text-gray-400 text-center">Aucune offre configurée</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {carrierOffers.map(offer => (
                      <div key={offer.id} className="px-5 py-4 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 text-sm">{offer.offer_name}</span>
                            <Badge className={`text-xs ${offer.is_active !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                              {offer.is_active !== false ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {PACKAGE_SIZES[offer.package_size]?.label || offer.package_size}
                            </Badge>
                            {offer.sendcloud_service_point && (
                              <Badge className="text-xs bg-purple-100 text-purple-700">Point relais</Badge>
                            )}
                          </div>
                          {offer.description && (
                            <p className="text-xs text-gray-500 mt-1">{offer.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                            {offer.max_weight_kg && <span>Max {offer.max_weight_kg} kg</span>}
                            {offer.max_dimensions_cm && <span>Max {offer.max_dimensions_cm} cm</span>}
                            {(offer.delivery_days_min || offer.delivery_days_max) && (
                              <span>⏱ {offer.delivery_days_min || "?"}-{offer.delivery_days_max || "?"} j. ouvrés</span>
                            )}
                            {offer.tracking_included && <span>📦 Suivi inclus</span>}
                          </div>
                          {/* Grille tarifaire */}
                          {offer.price_grid && offer.price_grid.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {offer.price_grid.map((row, i) => (
                                <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                  {row.weight_min}–{row.weight_max} kg → <strong>{row.price}€</strong>
                                </span>
                              ))}
                            </div>
                          ) : offer.base_price != null ? (
                            <div className="mt-2">
                              <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                                Prix fixe : {offer.base_price}€
                              </span>
                            </div>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => toggleActive(offer)}
                            className={`p-1.5 rounded-lg transition-colors ${offer.is_active !== false ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                            title={offer.is_active !== false ? "Désactiver" : "Activer"}
                          >
                            {offer.is_active !== false ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openEdit(offer)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { if (confirm("Supprimer cette offre ?")) deleteMutation.mutate(offer.id); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Si aucune offre du tout */}
          {offers.length === 0 && (
            <div className="bg-white rounded-xl border p-12 text-center">
              <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucune offre de transport configurée</p>
              <p className="text-gray-400 text-sm mt-1">Créez votre première offre pour l'afficher lors du paiement</p>
              <Button onClick={openCreate} className="mt-4 bg-[#1B5E20] hover:bg-[#2E7D32] text-white gap-2">
                <Plus className="w-4 h-4" /> Créer une offre
              </Button>
            </div>
          )}
        </div>
      )}

      {/* MODAL CRÉATION / MODIFICATION */}
      <Dialog open={modalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'offre" : "Nouvelle offre de transport"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Transporteur */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Transporteur</label>
                <Select value={form.carrier} onValueChange={v => setForm(f => ({ ...f, carrier: v }))}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CARRIERS).map(([k, c]) => (
                      <SelectItem key={k} value={k}>{c.logo} {c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.carrier === "custom" && (
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Nom du transporteur</label>
                  <Input value={form.carrier_label} onChange={e => setForm(f => ({ ...f, carrier_label: e.target.value }))} className="text-sm" placeholder="Ex: FedEx, TNT..." />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Nom de l'offre *</label>
                <Input value={form.offer_name} onChange={e => setForm(f => ({ ...f, offer_name: e.target.value }))} className="text-sm" placeholder="Ex: Envoi Standard, Express J+1..." />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Description</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="text-sm h-16 resize-none" placeholder="Description courte pour l'acheteur" />
            </div>

            {/* Taille & dimensions */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Taille de colis</label>
                <Select value={form.package_size} onValueChange={v => setForm(f => ({ ...f, package_size: v }))}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PACKAGE_SIZES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label} {v.desc && `(${v.desc})`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Poids max (kg)</label>
                <Input type="number" value={form.max_weight_kg} onChange={e => setForm(f => ({ ...f, max_weight_kg: e.target.value }))} className="text-sm" placeholder="Ex: 5" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Dimensions max (cm)</label>
                <Input value={form.max_dimensions_cm} onChange={e => setForm(f => ({ ...f, max_dimensions_cm: e.target.value }))} className="text-sm" placeholder="Ex: 50x30x20" />
              </div>
            </div>

            {/* Délais */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Délai min (j. ouvrés)</label>
                <Input type="number" value={form.delivery_days_min} onChange={e => setForm(f => ({ ...f, delivery_days_min: e.target.value }))} className="text-sm" placeholder="2" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Délai max (j. ouvrés)</label>
                <Input type="number" value={form.delivery_days_max} onChange={e => setForm(f => ({ ...f, delivery_days_max: e.target.value }))} className="text-sm" placeholder="4" />
              </div>
            </div>

            {/* Options */}
            <div className="flex gap-4 flex-wrap">
              {[
                { key: "tracking_included", label: "Suivi inclus" },
                { key: "sendcloud_service_point", label: "Point relais (Sendcloud)" },
                { key: "is_active", label: "Offre active" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="rounded" />
                  {label}
                </label>
              ))}
            </div>

            {/* Grille tarifaire */}
            <div className="border rounded-xl p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Grille tarifaire par poids</p>
                <span className="text-xs text-gray-400">ou prix fixe ci-dessous</span>
              </div>

              {form.price_grid.length > 0 && (
                <div className="space-y-1.5">
                  {form.price_grid.map((row, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border text-sm">
                      <span className="text-gray-700 flex-1">
                        {row.weight_min} – {row.weight_max} kg
                      </span>
                      <span className="font-semibold text-[#1B5E20]">{row.price} €</span>
                      <button onClick={() => removeGridRow(i)} className="text-red-400 hover:text-red-600 ml-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 block mb-0.5">Poids min (kg)</label>
                  <Input type="number" value={newRow.weight_min} onChange={e => setNewRow(r => ({ ...r, weight_min: e.target.value }))} className="text-sm h-8" placeholder="0" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 block mb-0.5">Poids max (kg)</label>
                  <Input type="number" value={newRow.weight_max} onChange={e => setNewRow(r => ({ ...r, weight_max: e.target.value }))} className="text-sm h-8" placeholder="2" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 block mb-0.5">Prix (€)</label>
                  <Input type="number" value={newRow.price} onChange={e => setNewRow(r => ({ ...r, price: e.target.value }))} className="text-sm h-8" placeholder="4.99" />
                </div>
                <Button variant="outline" size="sm" onClick={addGridRow} className="h-8 px-3 gap-1">
                  <Plus className="w-3.5 h-3.5" /> Ajouter
                </Button>
              </div>
            </div>

            {/* Prix fixe */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Prix fixe (€) — si pas de grille par poids</label>
              <Input type="number" value={form.base_price} onChange={e => setForm(f => ({ ...f, base_price: e.target.value }))} className="text-sm" placeholder="Ex: 5.99" />
            </div>

            {/* Boutons */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={closeModal} className="flex-1">Annuler</Button>
              <Button
                onClick={handleSave}
                disabled={!form.offer_name || createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] text-white"
              >
                {createMutation.isPending || updateMutation.isPending ? "Enregistrement..." : editing ? "Enregistrer" : "Créer l'offre"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}