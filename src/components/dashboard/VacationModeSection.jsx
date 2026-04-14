import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function VacationModeSection({ user, profile, onUpdate }) {
  const [isActive, setIsActive] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setIsActive(profile.vacation_mode || false);
      setStartDate(profile.vacation_start || "");
      setEndDate(profile.vacation_end || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const vacationActive = isActive && startDate && endDate;
    await supabase.from("profiles").update({
      vacation_mode: isActive,
      vacation_start: startDate || null,
      vacation_end: endDate || null,
    }).eq("id", user.id);
    if (vacationActive) {
      await supabase.from("products").update({ status: "vacation" }).eq("seller_id", user.id).eq("status", "active");
    } else {
      await supabase.from("products").update({ status: "active" }).eq("seller_id", user.id).eq("status", "vacation");
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    if (onUpdate) onUpdate();
  };

  const today = new Date().toISOString().split("T")[0];
  const isCurrentlyOnVacation = isActive && startDate && endDate && today >= startDate && today <= endDate;

  return (
    <div style={{ color: "#1a2332", maxWidth: 600 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a2332", marginBottom: 4 }}>Mode vacances</h2>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>Masquez temporairement toutes vos annonces pendant votre absence</p>
      </div>

      {/* Statut actuel */}
      <div style={{
        background: isCurrentlyOnVacation ? "#fff3e0" : isActive ? "#e8f5e9" : "#f5f7fa",
        border: `2px solid ${isCurrentlyOnVacation ? "#ff9800" : isActive ? "#1B5E20" : "#e0e0e0"}`,
        borderRadius: 16, padding: "1.25rem 1.5rem", marginBottom: "1.5rem",
        display: "flex", alignItems: "center", gap: 16
      }}>
        <div style={{ fontSize: "2.5rem" }}>
          {isCurrentlyOnVacation ? "🌴" : isActive ? "✅" : "🏠"}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1a2332" }}>
            {isCurrentlyOnVacation ? "Vous etes en vacances" : isActive ? "Mode vacances programme" : "Boutique active"}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#666", marginTop: 2 }}>
            {isCurrentlyOnVacation
              ? `Vos annonces sont masquees jusqu'au ${new Date(endDate).toLocaleDateString("fr-FR")}`
              : isActive && startDate
              ? `Programmee du ${new Date(startDate).toLocaleDateString("fr-FR")} au ${new Date(endDate).toLocaleDateString("fr-FR")}`
              : "Toutes vos annonces sont visibles"}
          </div>
        </div>
      </div>

      {/* Toggle */}
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isActive ? "1.25rem" : 0 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a2332" }}>Activer le mode vacances</div>
            <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 2 }}>Vos annonces seront masquees aux acheteurs</div>
          </div>
          <div
            onClick={() => setIsActive(!isActive)}
            style={{
              width: 52, height: 28, borderRadius: 14, cursor: "pointer", transition: "background 0.2s",
              background: isActive ? "#1B5E20" : "#d1d5db", position: "relative", flexShrink: 0
            }}
          >
            <div style={{
              position: "absolute", top: 3, left: isActive ? 27 : 3,
              width: 22, height: 22, borderRadius: "50%", background: "white",
              transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
            }} />
          </div>
        </div>

        {isActive && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Date de debut
              </label>
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8,
                  border: "1.5px solid #d1d5db", fontSize: "0.88rem", color: "#1a2332",
                  background: "white", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || today}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8,
                  border: "1.5px solid #d1d5db", fontSize: "0.88rem", color: "#1a2332",
                  background: "white", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ background: "#f0f7f0", borderRadius: 10, padding: "0.9rem 1.1rem", marginBottom: "1.25rem", fontSize: "0.82rem", color: "#2e7d32" }}>
        <strong>Comment ca marche ?</strong> En activant le mode vacances, toutes vos annonces actives seront automatiquement masquees et reactivees a la date de fin.
      </div>

      <button
        onClick={handleSave}
        disabled={saving || (isActive && (!startDate || !endDate))}
        style={{
          width: "100%", padding: "0.85rem", borderRadius: 50, border: "none",
          background: saving ? "#ccc" : "#1B5E20", color: "white",
          fontWeight: 700, fontSize: "0.95rem", cursor: saving ? "not-allowed" : "pointer"
        }}
      >
        {saving ? "Enregistrement..." : saved ? "Enregistre !" : "Enregistrer"}
      </button>
    </div>
  );
}
