import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase as base44 } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit, Save, X, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminShippingCarriers() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const handleSyncFromSendcloud = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await base44.functions.invoke("getSendcloudShippingMethods", {});
    const methods = res.data?.shipping_methods || [];

    const frMethods = methods.filter(m => {
      const hasFR = m.countries?.some(c => c.iso_2 === "FR");
      return hasFR && m.carrier !== "sendcloud";
    });

    const existing = await base44.entities.ShippingCarrier.list();
    const existingCodes = new Set(existing.map(e => e.carrier_code));

    let created = 0;
    const toCreate = frMethods.filter(m => !existingCodes.has(`sendcloud_${m.id}`));
    
    // Bulk create in batches of 3 with delay to avoid rate limit
    for (let i = 0; i < toCreate.length; i++) {
      const m = toCreate[i];
      const fr = m.countries?.find(c => c.iso_2 === "FR");
      await base44.entities.ShippingCarrier.create({
        carrier_code: `sendcloud_${m.id}`,
        carrier_name: m.name,
        description: m.carrier,
        delivery_time: "",
        sendcloud_service_id: m.id,
        sendcloud_service_point: m.service_point_input === "required" || m.service_point_input === "optional",
        price_grid: [{ weight_min_kg: parseFloat(m.min_weight), weight_max_kg: parseFloat(m.max_weight), price: fr?.price ?? 0 }],
        is_active: false,
        order: existing.length + created,
      });
      created++;
      // Wait 400ms every 3 creations to avoid rate limit
      if (created % 3 === 0) await new Promise(r => setTimeout(r, 400));
    }

    queryClient.invalidateQueries(["admin-carriers"]);
    setSyncResult({ created, total: frMethods.length });
    setSyncing(false);
    toast.success(`Synchronisation : ${created} nouveau(x) transporteur(s) importé(s)`);
  };

  const { data: carriers = [] } = useQuery({
    queryKey: ["admin-carriers"],
    queryFn: async () => {
      const data = await base44.entities.ShippingCarrier.list();
      return data.sort((a, b) => a.order - b.order);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShippingCarrier.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-carriers"]);
      setEditingId(null);
      setEditData(null);
      toast.success("Transporteur mis à jour");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) =>
      base44.entities.ShippingCarrier.update(id, { is_active: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-carriers"]);
      toast.success("Statut modifié");
    },
  });

  const startEdit = (carrier) => { setEditingId(carrier.id); setEditData({ ...carrier }); };
  const cancelEdit = () => { setEditingId(null); setEditData(null); };
  const saveEdit = () => { if (editData) updateMutation.mutate({ id: editingId, data: editData }); };

  const addPriceRange = () => {
    if (!editData) return;
    setEditData({ ...editData, price_grid: [...(editData.price_grid || []), { weight_min_kg: 0, weight_max_kg: 1, price: 0 }] });
  };

  const removePriceRange = (index) => {
    if (!editData) return;
    setEditData({ ...editData, price_grid: editData.price_grid.filter((_, i) => i !== index) });
  };

  const updatePriceRange = (index, field, value) => {
    if (!editData) return;
    const newGrid = [...editData.price_grid];
    newGrid[index] = { ...newGrid[index], [field]: parseFloat(value) || 0 };
    setEditData({ ...editData, price_grid: newGrid });
  };

  return (
    <div className="space-y-6 bg-white rounded-xl p-6 border">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transporteurs & Tarifs</h2>
          <p className="text-sm text-gray-500 mt-1">Les méthodes sont récupérées dynamiquement depuis Sendcloud au checkout.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            onClick={handleSyncFromSendcloud}
            disabled={syncing}
            variant="outline"
            className="border-[#1B5E20] text-[#1B5E20] hover:bg-green-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            Sync depuis Sendcloud
          </Button>
          {syncResult && (
            <div className="flex items-center gap-1 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              {syncResult.created} importé(s) / {syncResult.total} disponibles
            </div>
          )}
          <Button onClick={() => {
            base44.entities.ShippingCarrier.create({
              carrier_code: "nouveau_transporteur",
              carrier_name: "Nouveau transporteur",
              description: "Description",
              delivery_time: "2-3 jours",
              price_grid: [{ weight_min_kg: 0, weight_max_kg: 1, price: 5 }],
              is_active: false,
              order: carriers.length,
            }).then(() => {
              queryClient.invalidateQueries(["admin-carriers"]);
              toast.success("Transporteur créé");
            });
          }}>
            <Plus className="w-4 h-4 mr-2" /> Ajouter un transporteur
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {carriers.map((carrier) => {
          const isEditing = editingId === carrier.id;
          const current = isEditing ? editData : carrier;

          return (
            <Card key={carrier.id} className="p-6 bg-white shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input value={current.carrier_name} onChange={(e) => setEditData({ ...editData, carrier_name: e.target.value })} placeholder="Nom du transporteur" className="text-gray-900" />
                        <Input value={current.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} placeholder="Description" className="text-gray-900" />
                        <Input value={current.delivery_time} onChange={(e) => setEditData({ ...editData, delivery_time: e.target.value })} placeholder="Délai de livraison" className="text-gray-900" />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900">{carrier.carrier_name}</h3>
                        <p className="text-sm text-gray-600">{carrier.description}</p>
                        <p className="text-xs text-gray-500">{carrier.delivery_time}</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{carrier.is_active ? "Actif" : "Inactif"}</span>
                      <Switch
                        checked={carrier.is_active}
                        onCheckedChange={() => toggleActiveMutation.mutate({ id: carrier.id, isActive: carrier.is_active })}
                      />
                    </div>
                    {isEditing ? (
                      <>
                        <Button size="sm" onClick={saveEdit}><Save className="w-4 h-4" /></Button>
                        <Button size="sm" onClick={cancelEdit} variant="outline"><X className="w-4 h-4" /></Button>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => startEdit(carrier)} variant="outline"><Edit className="w-4 h-4" /></Button>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm text-gray-900">Grille tarifaire</h4>
                    {isEditing && (
                      <Button size="sm" onClick={addPriceRange} variant="outline">
                        <Plus className="w-3 h-3 mr-1" /> Ajouter tranche
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {current.price_grid?.map((range, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white border p-3 rounded-lg">
                        {isEditing ? (
                          <>
                            <Input type="number" step="0.1" value={range.weight_min_kg} onChange={(e) => updatePriceRange(index, "weight_min_kg", e.target.value)} className="w-20 text-gray-900" placeholder="Min" />
                            <span className="text-gray-700">à</span>
                            <Input type="number" step="0.1" value={range.weight_max_kg} onChange={(e) => updatePriceRange(index, "weight_max_kg", e.target.value)} className="w-20 text-gray-900" placeholder="Max" />
                            <span className="text-gray-700">kg =</span>
                            <Input type="number" step="0.01" value={range.price} onChange={(e) => updatePriceRange(index, "price", e.target.value)} className="w-24 text-gray-900" placeholder="Prix" />
                            <span className="text-gray-700">€</span>
                            <Button size="sm" variant="ghost" onClick={() => removePriceRange(index)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </>
                        ) : (
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">{range.weight_min_kg} kg - {range.weight_max_kg} kg</span>
                            <span className="mx-2 text-gray-600">→</span>
                            <span className="font-bold text-[#1B5E20]">{range.price?.toFixed(2)} €</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}