import React, { useState, useRef, useEffect } from "react";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const SYSTEM_PROMPT = "Tu es Alexandre, membre de l equipe SwingMarketGolf, marketplace francaise de materiel de golf d occasion. Tu as deux roles : 1) SUPPORT : reponds aux questions sur la plateforme (paiement Stripe, livraison Sendcloud, compte, annonces, abonnements). 2) COACH GOLF : quand l utilisateur cherche du materiel, agis comme un vendeur expert. Pose max 2-3 questions (niveau, budget, objectif), puis recommande des produits. Mets en avant le rapport qualite/prix de l occasion. Regles : toujours en francais, tutoiement decontracte, reponses courtes 3-4 lignes max, objectif mener vers l achat. Si tu ne sais pas : contacte-nous a support@swingmarketgolf.com";

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Salut ! Je suis Alexandre de l'equipe SwingMarketGolf. Je peux t'aider a trouver du materiel ou repondre a tes questions. Comment puis-je t'aider ?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const [quickReplies, setQuickReplies] = useState([
    "Je cherche un driver",
    "Comment fonctionne la livraison ?",
    "Le paiement est-il securise ?",
    "Je veux vendre du materiel",
    "Je cherche des fers pour debutant",
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) { setUnread(0); bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }
  }, [open, messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      if (!GROQ_API_KEY) { setMessages(prev => [...prev, { role: "assistant", content: "Service temporairement indisponible. Contacte-nous a support@swingmarketgolf.com" }]); setLoading(false); return; }
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "system", content: SYSTEM_PROMPT }, ...newMessages] })
      });
      const data = await res.json();
      console.log("Groq response:", JSON.stringify(data));
      const reply = data?.choices?.[0]?.message?.content || "Desolee, je n ai pas pu repondre. Contacte support@swingmarketgolf.com";
      const replyLower = reply.toLowerCase();
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      if (replyLower.includes('niveau') || replyLower.includes('debutant') || replyLower.includes('intermediaire')) {
        setQuickReplies(['Debutant', 'Intermediaire', 'Avance']);
      } else if (replyLower.includes('budget')) {
        setQuickReplies(['Moins de 100 EUR', '100-300 EUR', '300-500 EUR', 'Plus de 500 EUR']);
      } else if (replyLower.includes('type') || replyLower.includes('quel materiel')) {
        setQuickReplies(['Driver', 'Fers', 'Wedge', 'Putter', 'Sac de golf']);
      } else {
        setQuickReplies(['Je cherche des clubs', 'Comment vendre ?', 'Autre question', 'Merci !']);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Desolee, une erreur est survenue. Reessaie dans un instant !" }]);
    }
    setLoading(false);
  };

  return (
    <>
      <div onClick={() => setOpen(!open)} style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #1B5E20, #2E7D32)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 20px rgba(27,94,32,0.4)", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        {open ? <span style={{ color: "white", fontSize: "1.4rem" }}>x</span> : <span style={{ fontSize: "1.6rem" }}>&#127948;</span>}
        {!open && unread > 0 && <div style={{ position: "absolute", top: -4, right: -4, background: "#e53935", color: "white", borderRadius: "50%", width: 20, height: 20, fontSize: "0.7rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</div>}
      </div>
      {open && (
        <div style={{ position: "fixed", bottom: 96, right: 24, zIndex: 9998, width: "min(360px, calc(100vw - 48px))", height: "min(500px, calc(100vh - 120px))", borderRadius: 20, background: "white", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>
          <div style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32)", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>&#127948;</div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "0.95rem" }}>Alexandre</div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.75rem" }}><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#69f0ae", marginRight: 5 }}/>Equipe SwingMarketGolf</div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "80%", padding: "0.65rem 0.9rem", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.role === "user" ? "#1B5E20" : "#f5f7fa", color: msg.role === "user" ? "white" : "#1a2332", fontSize: "0.85rem", lineHeight: 1.5 }}>{msg.content.split(/(https?:\/\/[^\s]+)/g).map((part, j) =>
                      /^https?:\/\//.test(part)
                        ? <a key={j} href={part} target="_blank" rel="noopener noreferrer" style={{ color: msg.role === "user" ? "#a5d6a7" : "#1B5E20", textDecoration: "underline", fontWeight: 600, wordBreak: "break-all" }}>{part}</a>
                        : part
                    )}</div>
              </div>
            ))}
            {loading && <div style={{ display: "flex", justifyContent: "flex-start" }}><div style={{ background: "#f5f7fa", borderRadius: "16px 16px 16px 4px", padding: "0.65rem 0.9rem" }}><span style={{ display: "inline-flex", gap: 4 }}>{[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#1B5E20", animation: "bounce 1s infinite", animationDelay: i*0.2+"s" }}/>)}</span></div></div>}
            <div ref={bottomRef} />
          </div>
          {quickReplies.length > 0 && (
            <div style={{ padding: "0.5rem 0.75rem 0", display: "flex", flexWrap: "wrap", gap: 6 }}>
              {quickReplies.map((reply, i) => (
                <button key={i} onClick={async () => {
                  setQuickReplies([]);
                  const userMsg = { role: "user", content: reply };
                  const newMessages = [...messages, userMsg];
                  setMessages(newMessages);
                  setLoading(true);
                  try {
                    const res = await fetch("/api/chat", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ messages: [{ role: "system", content: SYSTEM_PROMPT }, ...newMessages] })
                    });
                    const data = await res.json();
                    const rep = data?.choices?.[0]?.message?.content || "Contacte-nous a support@swingmarketgolf.com";
                    setMessages(prev => [...prev, { role: "assistant", content: rep }]);
                    // Quick replies contextuelles selon la reponse du bot
      const repLower = rep.toLowerCase();
      if (repLower.includes('niveau') || repLower.includes('debutant') || repLower.includes('intermediaire')) {
        setQuickReplies(['Debutant', 'Intermediaire', 'Avance']);
      } else if (repLower.includes('budget')) {
        setQuickReplies(['Moins de 100 EUR', '100-300 EUR', '300-500 EUR', 'Plus de 500 EUR']);
      } else if (repLower.includes('type') || repLower.includes('quel materiel') || repLower.includes('categorie')) {
        setQuickReplies(['Driver', 'Fers', 'Wedge', 'Putter', 'Sac de golf', 'Chaussures']);
      } else if (repLower.includes('paiement') || repLower.includes('livraison') || repLower.includes('stripe')) {
        setQuickReplies(['Autre question', 'Je cherche du materiel', 'Comment vendre ?']);
      } else {
        setQuickReplies(['Je cherche des clubs', 'Comment vendre ?', 'Autre question', 'Merci !']);
      }
                  } catch { setMessages(prev => [...prev, { role: "assistant", content: "Erreur, reessaie !" }]); }
                  setLoading(false);
                }} style={{
                  padding: "0.35rem 0.75rem", borderRadius: 20, border: "1.5px solid #1B5E20",
                  background: "white", color: "#1B5E20", fontSize: "0.75rem", fontWeight: 600,
                  cursor: "pointer", whiteSpace: "nowrap"
                }}>{reply}</button>
              ))}
            </div>
          )}
          <div style={{ padding: "0.75rem", borderTop: "1px solid #f0f0f0", display: "flex", gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Pose ta question..." className="chatbot-input" style={{ flex: 1, padding: "0.6rem 0.9rem", borderRadius: 50, border: "1.5px solid #e0e0e0", fontSize: "0.85rem", outline: "none", color: "#1a2332" }} />
            <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: loading || !input.trim() ? "#e0e0e0" : "#1B5E20", color: "white", cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>&#10148;</button>
          </div>
        </div>
      )}
      <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`}</style>
    </>
  );
}