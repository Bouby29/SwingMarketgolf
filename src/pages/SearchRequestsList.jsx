import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Search, Bell, MessageCircle, ChevronDown } from "lucide-react";

const CATEGORY_COLORS = {
  "Clubs de golf": "#1B5E20",
  "Balles de golf": "#E65100",
  "Chariots": "#1565C0",
  "Sacs de golf": "#6A1B9A",
  "Accessoires": "#C5A028",
  "Vetements": "#AD1457",
  "Entrainement": "#00695C",
};

const CATEGORY_EMOJIS = {
  "Clubs de golf": "🏌️",
  "Balles de golf": "⛳",
  "Chariots": "🛒",
  "Sacs de golf": "🎒",
  "Accessoires": "🎯",
  "Vetements": "👕",
  "Entrainement": "🎓",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 30) return `Il y a ${Math.floor(days/7)} sem.`;
  return `Il y a ${Math.floor(days/30)} mois`;
}

export default function SearchRequestsList() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Toutes");
  const [proposing, setProposing] = useState(null); // id de la demande en cours
  const [form, setForm] = useState({ name: "", email: user?.email || "", message: "" });
  const [sent, setSent] = useState({});

  const CATEGORIES = ["Toutes", "Clubs de golf", "Balles de golf", "Chariots", "Sacs de golf", "Accessoires", "Vetements"];

  useEffect(() => {
    supabase.from("search_requests").select("*").eq("status", "active").order("created_at", { ascending: false })
      .then(({ data }) => { setRequests(data || []); setLoading(false); });
  }, []);

  const filtered = filter === "Toutes" ? requests : requests.filter(r => r.category === filter);

  const handlePropose = async (req) => {
    if (!form.email || !form.message) return alert("Merci de remplir ton email et ton message.");
    const subject = encodeURIComponent("J'ai le matériel que tu recherches sur SwingMarketGolf !");
    const body = encodeURIComponent(
      `Bonjour ${req.name || ""},

Tu recherches : ${req.title}

${form.message}

` +
      `Pour voir mes annonces sur SwingMarketGolf : https://swingmarketgolf.com

` +
      `Cordialement,
${form.name || "Un vendeur SwingMarketGolf"}`
    );
    window.open(`mailto:${req.email}?subject=${subject}&body=${body}`);
    setSent(prev => ({ ...prev, [req.id]: true }));
    setProposing(null);
    setForm({ name: form.name, email: form.email, message: "" });
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0f7f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
          <Bell style={{ width: 28, height: 28, color: "#1B5E20" }} />
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1a2332", marginBottom: 8 }}>Demandes des acheteurs</h1>
        <p style={{ color: "#6b7280", fontSize: "1rem" }}>
          Des golfeurs cherchent du matériel. Si tu as ce qu'ils recherchent, propose-le leur !
        </p>
        <a href="/SearchRequest" style={{ display: "inline-block", marginTop: 12, background: "#1B5E20", color: "white", padding: "0.6rem 1.5rem", borderRadius: 50, fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
          + Poster ma recherche
        </a>
      </div>

      {/* Filtres catégories */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.5rem", justifyContent: "center" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: "0.4rem 1rem", borderRadius: 20, border: "1.5px solid",
            borderColor: filter === cat ? "#1B5E20" : "#e5e7eb",
            background: filter === cat ? "#1B5E20" : "white",
            color: filter === cat ? "white" : "#6b7280",
            fontSize: "0.82rem", fontWeight: 600, cursor: "pointer"
          }}>{cat}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>Chargement...</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>🔍</div>
          <p>Aucune demande dans cette catégorie pour l'instant.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.map(req => (
          <div key={req.id} style={{ background: "white", borderRadius: 16, padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.5rem" }}>{CATEGORY_EMOJIS[req.category] || "🏌️"}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1a2332" }}>{req.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: 2 }}>
                    {req.name && <span>{req.name} · </span>}
                    {timeAgo(req.created_at)}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{
                  padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700,
                  background: (CATEGORY_COLORS[req.category] || "#1B5E20") + "15",
                  color: CATEGORY_COLORS[req.category] || "#1B5E20"
                }}>{req.category}</span>
                {req.budget && <span style={{ padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, background: "#fef9e7", color: "#C5A028" }}>💶 {req.budget}</span>}
              </div>
            </div>

            {req.description && (
              <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0 0 12px", lineHeight: 1.6 }}>{req.description}</p>
            )}

            {sent[req.id] ? (
              <div style={{ background: "#f0f7f0", borderRadius: 10, padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#1B5E20", fontWeight: 600 }}>
                ✅ Message envoyé !
              </div>
            ) : proposing === req.id ? (
              <div style={{ background: "#f9fafb", borderRadius: 12, padding: "1rem", marginTop: 8 }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a2332", marginBottom: 10 }}>
                  📧 Ton message sera envoyé par email à {req.name || "l'acheteur"}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="Ton prénom" style={{ padding: "0.6rem 0.9rem", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: "0.85rem", color: "#1a2332", outline: "none" }} />
                  <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="Ton email" type="email" style={{ padding: "0.6rem 0.9rem", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: "0.85rem", color: "#1a2332", outline: "none" }} />
                </div>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                  placeholder="Décris le matériel que tu proposes, son état, son prix..."
                  rows={3} style={{ width: "100%", padding: "0.6rem 0.9rem", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: "0.85rem", color: "#1a2332", outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handlePropose(req)} style={{ flex: 1, padding: "0.7rem", borderRadius: 50, border: "none", background: "#1B5E20", color: "white", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
                    📧 Envoyer ma proposition
                  </button>
                  <button onClick={() => setProposing(null)} style={{ padding: "0.7rem 1.2rem", borderRadius: 50, border: "1.5px solid #e5e7eb", background: "white", color: "#6b7280", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}>
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setProposing(req.id)} style={{
                padding: "0.6rem 1.25rem", borderRadius: 50, border: "none",
                background: "linear-gradient(135deg, #1B5E20, #2E7D32)",
                color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6
              }}>
                <MessageCircle style={{ width: 15, height: 15 }} />
                Proposer ce matériel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}