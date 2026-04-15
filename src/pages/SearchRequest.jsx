import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Search, Bell, CheckCircle, ArrowRight, Users } from "lucide-react";

const CATEGORIES = ["Clubs de golf", "Balles de golf", "Chariots", "Sacs de golf", "Accessoires", "Entrainement", "Vetements"];
const BUDGETS = ["Moins de 100 EUR", "100 - 300 EUR", "300 - 500 EUR", "500 - 1000 EUR", "Plus de 1000 EUR"];

export default function SearchRequest() {
  const { user } = useAuth();
  const [form, setForm] = useState({ category: "", title: "", description: "", budget: "", email: user?.email || "", name: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.category || !form.title || !form.email) return alert("Merci de remplir les champs obligatoires.");
    setLoading(true);
    const { error } = await supabase.from("search_requests").insert({
      category: form.category, title: form.title, description: form.description,
      budget: form.budget, email: form.email, name: form.name,
      user_id: user?.id || null, status: "active",
    });
    setLoading(false);
    if (!error) setSent(true);
    else alert("Une erreur est survenue. Reessaie.");
  };

  if (sent) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f7f0 0%, #ffffff 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: 520, background: "white", borderRadius: 24, padding: "3rem 2.5rem", boxShadow: "0 8px 40px rgba(27,94,32,0.12)" }}>
        <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg, #1B5E20, #2E7D32)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", boxShadow: "0 8px 24px rgba(27,94,32,0.3)" }}>
          <CheckCircle style={{ width: 44, height: 44, color: "white" }} />
        </div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1a2332", marginBottom: 12 }}>Recherche enregistree !</h2>
        <p style={{ color: "#6b7280", marginBottom: 8, lineHeight: 1.7, fontSize: "1rem" }}>
          Ta demande est maintenant visible par tous les vendeurs de SwingMarketGolf.
        </p>
        <p style={{ color: "#6b7280", marginBottom: 32, lineHeight: 1.7, fontSize: "0.95rem" }}>
          Si un vendeur a ce que tu cherches, il pourra te contacter directement.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f5f5f5", color: "#1a2332", padding: "0.85rem 1.75rem", borderRadius: 50, fontWeight: 600, textDecoration: "none", fontSize: "0.9rem" }}>
            Retour a l accueil
          </a>
          <a href="/SearchRequestsList" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #1B5E20, #2E7D32)", color: "white", padding: "0.85rem 1.75rem", borderRadius: 50, fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
            Voir toutes les demandes <ArrowRight style={{ width: 16, height: 16 }} />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f7f0 0%, #ffffff 60%)" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)", padding: "3rem 1rem 4rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -30, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", borderRadius: 50, padding: "0.5rem 1.25rem", marginBottom: "1.25rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
            <Search style={{ width: 14, height: 14 }} /> Bourse aux recherches
          </div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 900, color: "white", marginBottom: 16, lineHeight: 1.2 }}>
            Tu ne trouves pas ce que tu cherches ?
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.1rem", lineHeight: 1.6 }}>
            Poste ta recherche. Les vendeurs de SwingMarketGolf verront ta demande et pourront te contacter.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 700, margin: "-1.5rem auto 0", padding: "0 1rem", position: "relative", zIndex: 1 }}>
        <div style={{ background: "white", borderRadius: 16, padding: "1rem 1.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 12 }}>
          {[["🏌️", "Gratuit", "Pour les acheteurs"], ["⚡", "Rapide", "Reponse en 24-48h"], ["🔒", "Simple", "Contacte direct"]].map(([emoji, label, desc]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: 2 }}>{emoji}</div>
              <div style={{ fontWeight: 700, color: "#1a2332", fontSize: "0.9rem" }}>{label}</div>
              <div style={{ color: "#9ca3af", fontSize: "0.78rem" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 700, margin: "2rem auto 3rem", padding: "0 1rem" }}>
        <div style={{ background: "white", borderRadius: 20, padding: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

          <div style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1px solid #bbf7d0", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 24 }}>
            <Bell style={{ width: 18, height: 18, color: "#16a34a", marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "0.875rem", color: "#15803d", margin: 0, fontWeight: 600 }}>Comment ca marche ?</p>
              <p style={{ fontSize: "0.82rem", color: "#166534", margin: "4px 0 0", lineHeight: 1.5 }}>Tu remplis ce formulaire → ta demande est visible sur la page "Demandes acheteurs" → les vendeurs te contactent si ils ont le materiel.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 6 }}>Categorie <span style={{ color: "#ef4444" }}>*</span></label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: "0.9rem", color: "#1a2332", background: "white", outline: "none", cursor: "pointer" }}>
                <option value="">Choisir...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 6 }}>Budget</label>
              <select value={form.budget} onChange={e => setForm({...form, budget: e.target.value})}
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: "0.9rem", color: "#1a2332", background: "white", outline: "none", cursor: "pointer" }}>
                <option value="">Selectionner...</option>
                {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 6 }}>Ce que tu recherches <span style={{ color: "#ef4444" }}>*</span></label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              placeholder="Ex : Driver TaylorMade SIM2, Fers Callaway Apex..."
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: "0.9rem", color: "#1a2332", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 6 }}>Description <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optionnel)</span></label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Etat souhaite, taille de shaft, marque preferee..."
              rows={3} style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: "0.9rem", color: "#1a2332", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 6 }}>Prenom</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Ton prenom"
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: "0.9rem", color: "#1a2332", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 6 }}>Email <span style={{ color: "#ef4444" }}>*</span></label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                placeholder="ton@email.com" type="email"
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: "0.9rem", color: "#1a2332", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", padding: "1rem", borderRadius: 50, border: "none",
            background: loading ? "#ccc" : "linear-gradient(135deg, #1B5E20, #2E7D32)",
            color: "white", fontWeight: 700, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 16px rgba(27,94,32,0.3)", transition: "all 0.2s"
          }}>
            {loading ? "Envoi en cours..." : "Publier ma recherche 🏌️"}
          </button>

          <p style={{ fontSize: "0.78rem", color: "#9ca3af", textAlign: "center", margin: "12px 0 0" }}>
            Ton email ne sera visible que par les vendeurs qui te contactent. Gratuit et sans engagement.
          </p>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a href="/SearchRequestsList" style={{ color: "#1B5E20", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
            Voir les demandes en cours des acheteurs →
          </a>
        </div>
      </div>
    </div>
  );
}