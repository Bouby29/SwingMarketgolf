import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Bell, MessageCircle, Plus, Clock, Tag, Wallet } from "lucide-react";

const CAT_COLORS = {
  "Clubs de golf": { bg: "#f0fdf4", border: "#86efac", text: "#15803d", emoji: "🏌️" },
  "Balles de golf": { bg: "#fff7ed", border: "#fdba74", text: "#c2410c", emoji: "⛳" },
  "Chariots": { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8", emoji: "🛒" },
  "Sacs de golf": { bg: "#faf5ff", border: "#c4b5fd", text: "#7c3aed", emoji: "🎒" },
  "Accessoires": { bg: "#fefce8", border: "#fde047", text: "#a16207", emoji: "🎯" },
  "Vetements": { bg: "#fdf2f8", border: "#f0abfc", text: "#a21caf", emoji: "👕" },
  "Entrainement": { bg: "#f0fdfa", border: "#5eead4", text: "#0f766e", emoji: "🎓" },
};

function timeAgo(d) {
  const days = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (days === 0) return "Aujourd hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} j`;
  return `Il y a ${Math.floor(days/7)} sem`;
}

export default function SearchRequestsList() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Toutes");
  const [proposing, setProposing] = useState(null);
  const [form, setForm] = useState({ name: "", email: user?.email || "", message: "" });
  const [sent, setSent] = useState({});

  const CATS = ["Toutes", "Clubs de golf", "Balles de golf", "Chariots", "Sacs de golf", "Accessoires", "Vetements"];

  useEffect(() => {
    supabase.from("search_requests").select("*").eq("status", "active").order("created_at", { ascending: false })
      .then(({ data }) => { setRequests(data || []); setLoading(false); });
  }, []);

  const filtered = filter === "Toutes" ? requests : requests.filter(r => r.category === filter);

  const handlePropose = (req) => {
    if (!form.email || !form.message) return alert("Remplis ton email et ton message.");
    const subject = encodeURIComponent("J ai le materiel que tu recherches - SwingMarketGolf");
    const body = encodeURIComponent(`Bonjour ${req.name || ""},

Tu recherches : ${req.title}

${form.message}

Cordialement,
${form.name || "Un vendeur SwingMarketGolf"}

Voir mes annonces : https://swingmarketgolf.com`);
    window.open(`mailto:${req.email}?subject=${subject}&body=${body}`);
    setSent(prev => ({...prev, [req.id]: true}));
    setProposing(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1a2332 0%, #1B5E20 100%)", padding: "2.5rem 1rem 5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 350, height: 350, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", borderRadius: 50, padding: "0.4rem 1rem", marginBottom: 12, fontSize: "0.8rem", color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
              <Bell style={{ width: 13, height: 13 }} /> Bourse aux recherches
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "white", marginBottom: 8, lineHeight: 1.2 }}>
              Demandes des acheteurs
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", margin: 0 }}>
              {requests.length} acheteur{requests.length > 1 ? "s" : ""} cherche{requests.length > 1 ? "nt" : ""} du materiel en ce moment
            </p>
          </div>
          <a href="/SearchRequest" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", color: "#1B5E20", padding: "0.85rem 1.5rem", borderRadius: 50, fontWeight: 700, textDecoration: "none", fontSize: "0.9rem", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", whiteSpace: "nowrap" }}>
            <Plus style={{ width: 16, height: 16 }} /> Poster ma recherche
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "-2.5rem auto 0", padding: "0 1rem 3rem", position: "relative" }}>

        {/* Filtres */}
        <div style={{ background: "white", borderRadius: 16, padding: "1rem 1.25rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", marginBottom: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATS.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              padding: "0.45rem 1rem", borderRadius: 20, border: "1.5px solid",
              borderColor: filter === cat ? "#1B5E20" : "#e5e7eb",
              background: filter === cat ? "#1B5E20" : "transparent",
              color: filter === cat ? "white" : "#6b7280",
              fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s"
            }}>{cat === "Toutes" ? `Toutes (${requests.length})` : cat}</button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>⏳</div>
            <p>Chargement des demandes...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem", background: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔍</div>
            <p style={{ color: "#6b7280", fontWeight: 600, marginBottom: 16 }}>Aucune demande dans cette categorie.</p>
            <a href="/SearchRequest" style={{ background: "#1B5E20", color: "white", padding: "0.75rem 1.5rem", borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>
              Etre le premier a poster →
            </a>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(req => {
            const cat = CAT_COLORS[req.category] || CAT_COLORS["Clubs de golf"];
            return (
              <div key={req.id} style={{ background: "white", borderRadius: 16, padding: "1.5rem", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6", transition: "box-shadow 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: cat.bg, border: `1.5px solid ${cat.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
                      {cat.emoji}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#1a2332", margin: 0, marginBottom: 4 }}>{req.title}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: cat.text, background: cat.bg, border: `1px solid ${cat.border}`, borderRadius: 20, padding: "0.2rem 0.6rem", fontWeight: 600 }}>
                          <Tag style={{ width: 10, height: 10 }} />{req.category}
                        </span>
                        {req.budget && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 20, padding: "0.2rem 0.6rem", fontWeight: 600 }}>
                            <Wallet style={{ width: 10, height: 10 }} />{req.budget}
                          </span>
                        )}
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#9ca3af" }}>
                          <Clock style={{ width: 10, height: 10 }} />{timeAgo(req.created_at)}
                          {req.name && ` · ${req.name}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {req.description && (
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0 0 14px", lineHeight: 1.6, paddingLeft: 60 }}>{req.description}</p>
                )}

                {sent[req.id] ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#15803d", fontWeight: 600 }}>
                    ✅ Proposition envoyee ! Le vendeur a ete contacte.
                  </div>
                ) : proposing === req.id ? (
                  <div style={{ background: "#f9fafb", borderRadius: 12, padding: "1.25rem", border: "1px solid #e5e7eb" }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1a2332", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      <MessageCircle style={{ width: 16, height: 16, color: "#1B5E20" }} />
                      Contacter {req.name || "l acheteur"} par email
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        placeholder="Ton prenom" style={{ padding: "0.65rem 0.9rem", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: "0.85rem", color: "#1a2332", outline: "none" }} />
                      <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                        placeholder="Ton email" type="email" style={{ padding: "0.65rem 0.9rem", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: "0.85rem", color: "#1a2332", outline: "none" }} />
                    </div>
                    <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                      placeholder="Decris le materiel que tu proposes, son etat, son prix estimatif..."
                      rows={3} style={{ width: "100%", padding: "0.65rem 0.9rem", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: "0.85rem", color: "#1a2332", outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 10 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handlePropose(req)} style={{ flex: 1, padding: "0.75rem", borderRadius: 50, border: "none", background: "linear-gradient(135deg, #1B5E20, #2E7D32)", color: "white", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
                        📧 Envoyer ma proposition
                      </button>
                      <button onClick={() => setProposing(null)} style={{ padding: "0.75rem 1.25rem", borderRadius: 50, border: "1.5px solid #e5e7eb", background: "white", color: "#6b7280", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}>
                        Annuler
                      </button>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 8, textAlign: "center" }}>
                      Cela ouvrira ton client email avec le message pre-rempli.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={() => setProposing(req.id)} style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "0.65rem 1.25rem", borderRadius: 50, border: "none",
                      background: "linear-gradient(135deg, #1B5E20, #2E7D32)",
                      color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                      boxShadow: "0 2px 10px rgba(27,94,32,0.25)"
                    }}>
                      <MessageCircle style={{ width: 14, height: 14 }} />
                      Proposer ce materiel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}