import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Star, Plus, Trash2, Edit2, Check, X } from "lucide-react";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ seller_id: "", buyer_name: "", rating: 5, comment: "" });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    setReviews(data || []);
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, shop_name, email").order("full_name");
    setSellers(profiles || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.seller_id || !form.buyer_name || !form.rating) return;
    if (editing) {
      await supabase.from("reviews").update({ seller_id: form.seller_id, buyer_name: form.buyer_name, rating: parseInt(form.rating), comment: form.comment }).eq("id", editing);
    } else {
      await supabase.from("reviews").insert({ seller_id: form.seller_id, buyer_name: form.buyer_name, rating: parseInt(form.rating), comment: form.comment });
    }
    setForm({ seller_id: "", buyer_name: "", rating: 5, comment: "" });
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleEdit = (r) => {
    setForm({ seller_id: r.seller_id, buyer_name: r.buyer_name, rating: r.rating, comment: r.comment || "" });
    setEditing(r.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet avis ?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    load();
  };

  const sellerName = (id) => {
    const s = sellers.find(s => s.id === id);
    return s ? (s.shop_name || s.full_name || s.email || id) : id;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1a2332" }}>⭐ Gestion des avis</div>
          <div style={{ color: "#888", fontSize: "0.85rem" }}>{reviews.length} avis au total</div>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ seller_id: "", buyer_name: "", rating: 5, comment: "" }); }}
          style={{ background: "#1B5E20", color: "white", border: "none", borderRadius: 10, padding: "0.6rem 1.2rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={16} /> Ajouter un avis
        </button>
      </div>

      {showForm && (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: "1.5rem", marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, color: "#1a2332" }}>{editing ? "✏️ Modifier l'avis" : "➕ Nouvel avis"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>Vendeur *</label>
              <select value={form.seller_id} onChange={e => setForm(f => ({ ...f, seller_id: e.target.value }))}
                style={{ width: "100%", padding: "0.6rem", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: "0.9rem" }}>
                <option value="">Choisir un vendeur...</option>
                {sellers.map(s => <option key={s.id} value={s.id}>{s.shop_name || s.full_name || s.email}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>Nom de l'acheteur *</label>
              <input value={form.buyer_name} onChange={e => setForm(f => ({ ...f, buyer_name: e.target.value }))}
                placeholder="Ex: Jean D." style={{ width: "100%", padding: "0.6rem", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: "0.9rem", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>Note *</label>
            <div style={{ display: "flex", gap: 6 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setForm(f => ({ ...f, rating: n }))}
                  style={{ fontSize: "1.5rem", background: "none", border: "none", cursor: "pointer", opacity: n <= form.rating ? 1 : 0.3 }}>⭐</button>
              ))}
              <span style={{ marginLeft: 8, fontWeight: 700, color: "#1B5E20", alignSelf: "center" }}>{form.rating}/5</span>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>Commentaire</label>
            <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Excellent vendeur, très réactif..." rows={3}
              style={{ width: "100%", padding: "0.6rem", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: "0.9rem", resize: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleSave} style={{ background: "#1B5E20", color: "white", border: "none", borderRadius: 8, padding: "0.65rem 1.5rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Check size={14} /> {editing ? "Mettre à jour" : "Enregistrer"}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={{ background: "#f5f5f5", color: "#666", border: "none", borderRadius: 8, padding: "0.65rem 1.2rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <X size={14} /> Annuler
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>Chargement...</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#888", background: "white", borderRadius: 16, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>⭐</div>
          <p style={{ fontWeight: 600 }}>Aucun avis pour le moment</p>
          <p style={{ fontSize: "0.85rem" }}>Ajoutez des avis manuellement via le bouton ci-dessus</p>
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          {reviews.map((r, i) => (
            <div key={r.id} style={{ padding: "1rem 1.25rem", borderBottom: i < reviews.length - 1 ? "1px solid #f0f0f0" : "none", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f0f7f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#1B5E20", fontSize: "1rem", flexShrink: 0 }}>
                {r.buyer_name?.[0]?.toUpperCase() || "?"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{r.buyer_name}</span>
                  <span style={{ fontSize: "0.75rem", color: "#888" }}>→</span>
                  <span style={{ fontSize: "0.85rem", color: "#1B5E20", fontWeight: 600 }}>{sellerName(r.seller_id)}</span>
                  <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#aaa" }}>{r.created_at ? new Date(r.created_at).toLocaleDateString("fr-FR") : ""}</span>
                </div>
                <div style={{ display: "flex", gap: 2, margin: "2px 0" }}>
                  {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize: "0.9rem", opacity: n <= r.rating ? 1 : 0.2 }}>⭐</span>)}
                </div>
                {r.comment && <p style={{ fontSize: "0.85rem", color: "#555", margin: 0 }}>{r.comment}</p>}
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => handleEdit(r)} style={{ background: "#f0f7ff", color: "#1565c0", border: "none", borderRadius: 8, padding: "0.4rem 0.7rem", cursor: "pointer", fontWeight: 600, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}>
                  <Edit2 size={12} /> Modifier
                </button>
                <button onClick={() => handleDelete(r.id)} style={{ background: "#ffebee", color: "#c62828", border: "none", borderRadius: 8, padding: "0.4rem 0.7rem", cursor: "pointer", fontWeight: 600, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}>
                  <Trash2 size={12} /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
