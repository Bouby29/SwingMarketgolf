import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Bell, MessageCircle, Plus, Clock, Tag, Wallet, ChevronRight } from "lucide-react";

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
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Toutes");
  // Toast "publié avec succès" depuis SearchRequest (?published=1)
  const [justPublished, setJustPublished] = useState(false);

  const CATS = ["Toutes", "Clubs de golf", "Balles de golf", "Chariots", "Sacs de golf", "Accessoires", "Vetements"];

  useEffect(() => {
    supabase.from("search_requests").select("*").eq("status", "active").order("created_at", { ascending: false })
      .then(({ data }) => { setRequests(data || []); setLoading(false); });
  }, []);

  // Toast au retour d'une publication réussie
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("published") === "1") {
      setJustPublished(true);
      // Nettoie l'URL pour ne pas re-déclencher au refresh
      window.history.replaceState({}, "", window.location.pathname);
      const t = setTimeout(() => setJustPublished(false), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  // Ouverture détail d'une recherche
  const openDetail = (req) => navigate(`/SearchRequestDetail?id=${req.id}`);

  const filtered = filter === "Toutes" ? requests : requests.filter(r => r.category === filter);

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

        {/* Toast publication réussie */}
        {justPublished && (
          <div style={{
            background: "#ECFDF5", border: "1px solid rgba(16,185,129,.25)",
            borderRadius: 14, padding: "0.85rem 1.1rem", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 10,
            color: "#047857", fontSize: "0.875rem", fontWeight: 600,
            boxShadow: "0 4px 18px rgba(16,185,129,.10)",
          }}>
            ✓ Recherche publiée — les vendeurs concernés peuvent maintenant la consulter.
          </div>
        )}

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
            const isMine = !!(user && req.user_id && user.id === req.user_id);
            return (
              <button
                key={req.id}
                onClick={() => openDetail(req)}
                type="button"
                style={{
                  background: "white", borderRadius: 16, padding: "1.5rem",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                  border: isMine ? "1px solid rgba(197,160,40,.35)" : "1px solid #f3f4f6",
                  transition: "all 0.18s ease",
                  cursor: "pointer", textAlign: "left", width: "100%",
                  position: "relative",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(15,23,42,0.10)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)";  e.currentTarget.style.transform = ""; }}
              >
                {/* Badge "Votre recherche" en haut-droite */}
                {isMine && (
                  <span style={{
                    position: "absolute", top: 14, right: 14,
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: "0.7rem", fontWeight: 700,
                    color: "#8B6914", background: "#FEF9E7",
                    border: "1px solid rgba(197,160,40,.30)",
                    borderRadius: 999, padding: "0.18rem 0.55rem",
                    letterSpacing: ".02em",
                  }}>
                    Votre recherche
                  </span>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: req.description ? 12 : 0, gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: cat.bg, border: `1.5px solid ${cat.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
                      {cat.emoji}
                    </div>
                    <div style={{ minWidth: 0, paddingRight: isMine ? 96 : 0 }}>
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
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight style={{ width: 18, height: 18, color: "#9ca3af", flexShrink: 0, marginTop: 4 }} />
                </div>

                {req.description && (
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0", lineHeight: 1.6, paddingLeft: 60 }}>
                    {req.description.length > 200 ? req.description.slice(0, 200) + "…" : req.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}