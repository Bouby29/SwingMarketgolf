import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, entities, auth } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

const CATEGORIES = [
  "🔐 Mon compte",
  "🏌️ Produits & Annonces",
  "💳 Paiement & Sécurité",
  "🚚 Expédition & Livraison",
  "📦 Commandes",
  "🏡 Vacances Golf",
];

function FAQForm({ entry, onSave, onCancel }) {
  const [form, setForm] = useState(entry || { question: "", answer: "", category: CATEGORIES[0], order: 0, is_active: true });

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Catégorie</label>
          <select
           value={form.category}
           onChange={e => setForm({ ...form, category: e.target.value })}
           className="w-full border rounded-lg px-3 py-2 text-sm bg-white text-black"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Ordre</label>
          <Input type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} className="text-sm text-black" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Question</label>
        <Input value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} placeholder="Ex: Comment créer un compte ?" className="text-sm text-black" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Réponse</label>
        <Textarea value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} rows={4} placeholder="Réponse détaillée..." className="text-sm text-black" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
        <label htmlFor="is_active" className="text-sm text-gray-600">Visible sur la FAQ</label>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}><X className="w-4 h-4 mr-1" />Annuler</Button>
        <Button size="sm" onClick={() => onSave(form)} className="bg-[#1B5E20] hover:bg-[#2E7D32]"><Check className="w-4 h-4 mr-1" />Enregistrer</Button>
      </div>
    </div>
  );
}

export default function AdminFAQ() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null); // null | "new" | entry.id
  const [editEntry, setEditEntry] = useState(null);

  const { data: entries = [] } = useQuery({
    queryKey: ["faq-entries"],
    queryFn: () => entities.FAQEntry.list("order"),
  });

  const createMut = useMutation({
    mutationFn: (data) => entities.FAQEntry.create(data),
    onSuccess: () => { qc.invalidateQueries(["faq-entries"]); setEditing(null); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => entities.FAQEntry.update(id, data),
    onSuccess: () => { qc.invalidateQueries(["faq-entries"]); setEditing(null); setEditEntry(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => entities.FAQEntry.delete(id),
    onSuccess: () => qc.invalidateQueries(["faq-entries"]),
  });

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = entries.filter(e => e.category === cat && e.is_active);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Gestion de la FAQ</h2>
        <Button onClick={() => setEditing("new")} className="bg-[#1B5E20] hover:bg-[#2E7D32] gap-2 text-black">
          <Plus className="w-4 h-4" /> Nouvelle question
        </Button>
      </div>

      {editing === "new" && (
        <FAQForm onSave={(data) => createMut.mutate(data)} onCancel={() => setEditing(null)} />
      )}

      {CATEGORIES.map(cat => (
        <div key={cat}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#1B5E20]">{cat}</h3>
            {grouped[cat].length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (window.confirm(`Supprimer toutes les ${grouped[cat].length} question(s) de cette catégorie ?`)) {
                    grouped[cat].forEach(e => deleteMut.mutate(e.id));
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Supprimer la catégorie
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {grouped[cat].length === 0 && (
              <p className="text-sm text-gray-400 italic px-3">Aucune question dans cette catégorie</p>
            )}
            {grouped[cat].map(entry => (
              <div key={entry.id}>
                {editing === entry.id ? (
                  <FAQForm
                    entry={editEntry}
                    onSave={(data) => updateMut.mutate({ id: entry.id, data })}
                    onCancel={() => { setEditing(null); setEditEntry(null); }}
                  />
                ) : (
                  <div className="bg-white rounded-xl border px-4 py-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {!entry.is_active && <Badge className="bg-gray-100 text-gray-500 border-0 text-[10px]">Masqué</Badge>}
                        <span className="text-xs text-gray-400">#{entry.order}</span>
                      </div>
                      <p className="font-medium text-sm text-gray-900">{entry.question}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{entry.answer}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(entry.id); setEditEntry(entry); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => deleteMut.mutate(entry.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}