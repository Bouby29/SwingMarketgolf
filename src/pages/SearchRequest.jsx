import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Search, Bell, CheckCircle } from "lucide-react";

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
      category: form.category,
      title: form.title,
      description: form.description,
      budget: form.budget,
      email: form.email,
      name: form.name,
      user_id: user?.id || null,
      status: "active",
    });
    setLoading(false);
    if (!error) setSent(true);
    else alert("Une erreur est survenue. Reessaie.");
  };

  if (sent) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f0f7f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
          <CheckCircle style={{ width: 40, height: 40, color: "#1B5E20" }} />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1a2332", marginBottom: 12 }}>Recherche enregistree !</h2>
        <p style={{ color: "#6b7280", marginBottom: 24, lineHeight: 1.6 }}>
          Nous avons bien recu ta demande. Tu seras notifie par email des qu une annonce correspondante est publiee sur SwingMarketGolf.
        </p>
        <a href="/" style={{ display: "inline-block", background: "#1B5E20", color: "white", padding: "0.75rem 2rem", borderRadius: 50, fontWeight: 700, textDecoration: "none" }}>
          Retour a l accueil
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0f7f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
          <Search style={{ width: 28, height: 28, color: "#1B5E20" }} />
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1a2332", marginBottom: 8 }}>Poster une recherche</h1>
        <p style={{ color: "#6b7280", fontSize: "1rem", lineHeight: 1.6 }}>
          Tu ne trouves pas ce que tu cherches ? Poste ta recherche et les vendeurs te contacteront des qu ils ont le materiel.
        </p>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: "2rem", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 20 }}>

        <div style={{ background: "#f0f7f0", borderRadius: 10, padding: "1rem", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Bell style={{ width: 18, height: 18, color: "#1B5E20", marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontSize: "0.85rem", color: "#2e7d32", margin: 0 }}>
            <strong>Comment ca marche ?</strong> Tu remplis ce formulaire, on le partage avec nos vendeurs, et tu recois un email des qu une annonce correspond a ta recherche.
          </p>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: "#1a2332", marginBottom: 6 }}>
            Categorie <span style={{ color: "#e53935" }}>*</span>
          </label>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
            style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: "0.9rem", color: "#1a2332", background: "white", outline: "none" }}>
            <option value="">Selectionner une categorie</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: "#1a2332", marginBottom: 6 }}>
            Ce que tu recherches <span style={{ color: "#e53935" }}>*</span>
          </label>
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
            placeholder="Ex: Driver TaylorMade SIM2, Fers Callaway Apex..."
            style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: "0.9rem", color: "#1a2332", outline: "none", boxSizing: "border-box" }} />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: "#1a2332", marginBottom: 6 }}>
            Description (optionnel)
          </label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            placeholder="Precisions sur l etat souhaite, la taille, la marque..."
            rows={3}
            style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: "0.9rem", color: "#1a2332", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: "#1a2332", marginBottom: 6 }}>
            Budget approximatif
          </label>
          <select value={form.budget} onChange={e => setForm({...form, budget: e.target.value})}
            style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: "0.9rem", color: "#1a2332", background: "white", outline: "none" }}>
            <option value="">Selectionner un budget</option>
            {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: "#1a2332", marginBottom: 6 }}>
              Prenom
            </label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Ton prenom"
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: "0.9rem", color: "#1a2332", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: "#1a2332", marginBottom: 6 }}>
              Email <span style={{ color: "#e53935" }}>*</span>
            </label>
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              placeholder="ton@email.com" type="email"
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: "0.9rem", color: "#1a2332", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "1rem", borderRadius: 50, border: "none", background: loading ? "#ccc" : "#1B5E20", color: "white", fontWeight: 700, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", marginTop: 8 }}>
          {loading ? "Envoi en cours..." : "Envoyer ma recherche"}
        </button>

        <p style={{ fontSize: "0.78rem", color: "#9ca3af", textAlign: "center", margin: 0 }}>
          En soumettant ce formulaire, tu acceptes d etre contacte par email lorsqu une annonce correspondante est publiee.
        </p>
      </div>
    </div>
  );
}