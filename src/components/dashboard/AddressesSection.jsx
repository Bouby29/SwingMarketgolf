import React, { useState, useEffect } from "react";
import { supabase as base44 } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const EMPTY_FORM = { name: "", street: "", zip: "", city: "" };

export default function AddressesSection() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Load existing addresses from user profile
  useEffect(() => {
    const load = async () => {
      try {
        const me = await Promise.resolve(null);
        setAddresses(me?.addresses || []);
      } catch (e) {
        console.error(e);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const save = async (updatedAddresses) => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await base44.auth.updateMe({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      setSuccessMsg("Adresse enregistrée avec succès !");
      setTimeout(() => setSuccessMsg(""), 4000);
      resetForm();
    } catch (e) {
      setErrorMsg("Erreur lors de la sauvegarde. Veuillez réessayer.");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.street || !formData.city || !formData.zip) {
      setErrorMsg("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setErrorMsg("");

    if (editingId !== null) {
      const updated = addresses.map(a => a.id === editingId ? { ...formData, id: editingId } : a);
      save(updated);
    } else {
      const newAddr = { ...formData, id: Date.now() };
      save([...addresses, newAddr]);
    }
  };

  const handleEdit = (addr) => {
    setFormData({ name: addr.name, street: addr.street, zip: addr.zip, city: addr.city });
    setEditingId(addr.id);
    setShowForm(true);
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleDelete = (id) => {
    const updated = addresses.filter(a => a.id !== id);
    save(updated);
  };

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-[#1B5E20]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Adresses</h2>
        <p className="text-gray-600">Gérez vos adresses de livraison et de facturation</p>
      </div>

      {!showForm && (
        <Button
          onClick={() => { setShowForm(true); setFormData(EMPTY_FORM); setEditingId(null); setSuccessMsg(""); setErrorMsg(""); }}
          className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full gap-2 mb-6"
        >
          <Plus className="w-4 h-4" /> Ajouter une adresse
        </Button>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm mb-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          <h3 className="font-semibold text-gray-800">{editingId !== null ? "Modifier l'adresse" : "Nouvelle adresse"}</h3>
          <Input
            placeholder="Nom de l'adresse (Maison, Bureau...)"
            value={formData.name}
            onChange={e => handleChange("name", e.target.value)}
            className="rounded-lg"
          />
          <Input
            placeholder="Adresse *"
            value={formData.street}
            onChange={e => handleChange("street", e.target.value)}
            className="rounded-lg"
            required
          />
          <div className="flex gap-3">
            <Input
              placeholder="Code postal *"
              value={formData.zip}
              onChange={e => handleChange("zip", e.target.value)}
              className="rounded-lg w-32"
              required
            />
            <Input
              placeholder="Ville *"
              value={formData.city}
              onChange={e => handleChange("city", e.target.value)}
              className="rounded-lg flex-1"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={resetForm} className="rounded-full">Annuler</Button>
            <Button type="submit" disabled={loading} className="bg-[#1B5E20] hover:bg-[#2E7D32] rounded-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-sm">Aucune adresse enregistrée.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr.id} className="border rounded-lg p-4 flex items-start justify-between">
              <div>
                {addr.name && <p className="font-bold text-sm">{addr.name}</p>}
                <p className="text-sm text-gray-600">{addr.street}</p>
                <p className="text-sm text-gray-600">{addr.zip} {addr.city}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(addr)}>
                  <Edit2 className="w-4 h-4 text-blue-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(addr.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}