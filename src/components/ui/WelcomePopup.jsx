import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { X } from "lucide-react";

export default function WelcomePopup() {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("popup_closed")) return;

    const timer = setTimeout(() => openPopup(), 3000);
    const onScroll = () => {
      const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (progress >= 0.3) { openPopup(); window.removeEventListener("scroll", onScroll); }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, []);

  const openPopup = () => { setShow(true); setTimeout(() => setVisible(true), 10); };
  const closePopup = () => {
    setVisible(false);
    setTimeout(() => setShow(false), 300);
    sessionStorage.setItem("popup_closed", "1");
  };

  return (
    <>
      {/* Popup */}
      {show && (
        <div
          onClick={(e) => e.target === e.currentTarget && closePopup()}
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          <div style={{
            background: "#F9F9F9",
            borderRadius: 16,
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            maxWidth: 460,
            width: "100%",
            overflow: "hidden",
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "transform 0.3s ease, opacity 0.3s ease",
            opacity: visible ? 1 : 0,
          }}>
            {/* Ligne dorée */}
            <div style={{ height: 3, background: "linear-gradient(90deg, #D4AF37, #f0d060, #D4AF37)" }} />

            <div style={{ padding: "2rem" }}>
              {/* Close */}
              <button onClick={closePopup} style={{
                position: "absolute", top: 16, right: 16,
                background: "none", border: "none", cursor: "pointer",
                color: "#666", padding: 4,
              }}>
                <X size={20} />
              </button>

              {/* Logo / emoji */}
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "#0F3D2E",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1rem",
                  fontSize: 28,
                }}>🏌️</div>
                <h2 style={{
                  fontSize: "1.6rem", fontWeight: 800,
                  color: "#0F3D2E", margin: "0 0 0.5rem",
                  lineHeight: 1.2,
                }}>Bienvenue sur SwingMarket</h2>
                <p style={{ color: "#555", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                  La marketplace dédiée aux passionnés de golf.<br />
                  <strong>Achetez, vendez</strong> et faites vivre votre équipement.
                </p>
              </div>

              {/* CTAs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <Link to="/login" onClick={closePopup}>
                  <button style={{
                    width: "100%", padding: "0.85rem",
                    background: "#0F3D2E", color: "white",
                    border: "none", borderRadius: 10,
                    fontWeight: 700, fontSize: "0.95rem",
                    cursor: "pointer", transition: "background 0.2s",
                  }}
                  onMouseOver={e => e.target.style.background = "#1B5E20"}
                  onMouseOut={e => e.target.style.background = "#0F3D2E"}
                  >
                    S'inscrire gratuitement
                  </button>
                </Link>
                <Link to={createPageUrl("CreateListing")} onClick={closePopup}>
                  <button style={{
                    width: "100%", padding: "0.85rem",
                    background: "transparent", color: "#D4AF37",
                    border: "2px solid #D4AF37", borderRadius: 10,
                    fontWeight: 700, fontSize: "0.95rem",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseOver={e => { e.target.style.background = "#D4AF37"; e.target.style.color = "white"; }}
                  onMouseOut={e => { e.target.style.background = "transparent"; e.target.style.color = "#D4AF37"; }}
                  >
                    Je vends mon équipement
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton flottant */}
      {!show && sessionStorage.getItem("popup_closed") && (
        <button
          onClick={openPopup}
          style={{
            position: "fixed", bottom: 24, left: 24,
            background: "#0F3D2E", color: "white",
            border: "2px solid #D4AF37",
            borderRadius: 50, padding: "0.75rem 1.25rem",
            fontWeight: 700, fontSize: "0.85rem",
            cursor: "pointer", zIndex: 9998,
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            transition: "transform 0.2s",
          }}
          onMouseOver={e => e.target.style.transform = "scale(1.05)"}
          onMouseOut={e => e.target.style.transform = "scale(1)"}
        >
          🏌️ Rejoindre SwingMarket
        </button>
      )}
    </>
  );
}
