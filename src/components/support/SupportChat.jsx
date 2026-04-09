import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, Send, ChevronRight } from "lucide-react";
import { supabase, entities, auth } from "@/lib/supabase";

const FAQ = [
{
  keywords: ["paiement", "sécurisé", "sécurité", "carte", "payer", "argent"],
  question: "Le paiement est-il sécurisé ?",
  answer: "Oui, toutes les transactions sont sécurisées via Stripe, leader mondial du paiement en ligne. Vos données sont cryptées et le vendeur ne reçoit l'argent qu'après confirmation de votre livraison. 🔒"
},
{
  keywords: ["livraison", "livrer", "expédition", "expédier", "colis", "envoi", "recevoir"],
  question: "Comment fonctionne la livraison ?",
  answer: "Le vendeur génère une étiquette depuis son espace et expédie votre commande. Vous recevez un numéro de suivi par email dès l'envoi. Délai moyen : 2 à 5 jours ouvrés. 📦"
},
{
  keywords: ["point relais", "relais", "mondial relay", "domicile"],
  question: "Puis-je choisir un point relais ?",
  answer: "Oui ! Lors du paiement, vous pouvez choisir entre une livraison à domicile (Colissimo, Chronopost) ou en point relais (Mondial Relay). 📍"
},
{
  keywords: ["négocier", "négociation", "offre", "prix", "discount", "réduction"],
  question: "Puis-je négocier le prix ?",
  answer: "Oui, vous pouvez envoyer une offre directement au vendeur via le bouton \"Faire une offre\" sur la fiche produit. Le vendeur peut accepter, refuser ou contre-proposer. 💬"
},
{
  keywords: ["enchère", "enchères", "enchérir", "bid", "auction"],
  question: "Comment fonctionnent les enchères ?",
  answer: "Certains articles sont en vente aux enchères. Vous placez une offre et le meilleur enchérisseur remporte l'article à la fin du temps imparti. Paiement sécurisé garanti. 🏆"
},
{
  keywords: ["vendre", "vente", "annonce", "publier", "créer", "mettre en vente", "vendeur"],
  question: "Comment vendre un article ?",
  answer: "C'est simple et gratuit ! Créez un compte, cliquez sur \"Vendre mon matériel\", ajoutez vos photos et infos, et publiez votre annonce en quelques minutes. ⛳"
},
{
  keywords: ["expédier", "étiquette", "envoi", "expédition"],
  question: "Comment expédier mon produit vendu ?",
  answer: "Après la vente, une étiquette d'expédition est générée automatiquement dans votre espace vendeur. Imprimez-la et déposez votre colis chez le transporteur. Tout est inclus ! 🏷️"
},
{
  keywords: ["commission", "frais", "tarif", "combien", "coût"],
  question: "Quelle est la commission ?",
  answer: "La commission est dégressive : plus vous vendez, moins vous payez. Elle s'applique uniquement en cas de vente réussie. Pas de frais d'inscription ni de publication. ✅"
},
{
  keywords: ["compte", "inscription", "inscrire", "créer un compte", "s'inscrire", "rejoindre"],
  question: "Comment créer un compte ?",
  answer: "Cliquez sur \"S'inscrire\" en haut de la page, entrez votre email et mot de passe. C'est gratuit et prend moins d'une minute ! 🎉"
},
{
  keywords: ["litige", "problème", "arnaque", "pas reçu", "remboursement", "protection"],
  question: "Que faire en cas de problème ?",
  answer: "SwingMarket vous protège ! Ouvrez un litige depuis \"Mes commandes\" dans les 48h après réception. Notre équipe intervient rapidement pour résoudre chaque situation. 🛡️"
},
{
  keywords: ["contact", "support", "aide", "équipe", "joindre"],
  question: "Comment contacter le support ?",
  answer: "Vous pouvez nous contacter via la page Contact. Notre équipe répond sous 24h ouvrées. 📧",
  link: { label: "Aller à la page Contact", to: "/Contact" }
},
{
  keywords: ["golf", "matériel", "club", "driver", "fer", "bois", "putter", "sac"],
  question: "Quel type de matériel trouve-t-on ?",
  answer: "Clubs (drivers, fers, putters, wedges), sacs, chaussures, vêtements, accessoires, chariots, balles… Tout le matériel de golf d'occasion certifié par des vendeurs vérifiés ! ⛳",
  link: { label: "Parcourir les annonces", to: "/Marketplace" }
}];


const SUGGESTIONS = [
"Le paiement est-il sécurisé ?",
"Comment fonctionne la livraison ?",
"Comment vendre un article ?",
"Puis-je négocier le prix ?",
"Comment fonctionnent les enchères ?"];


function findAnswer(query) {
  const q = query.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const item of FAQ) {
    const score = item.keywords.filter((k) => q.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  if (best && bestScore > 0) return best;
  return null;
}

function MessageBubble({ msg, user }) {
  const isUser = msg.role === "user";

  const handleLinkClick = (e, to) => {
    if (!user && (to === "/Contact" || to === "/Dashboard")) {
      e.preventDefault();
      base44.auth.redirectToLogin(window.location.pathname);
    }
  };

  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser &&
      <div className="w-7 h-7 rounded-full bg-[#1B5E20] flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">S</span>
        </div>
      }
      <div className={`max-w-[82%] ${isUser ? "" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser ?
          "bg-[#1B5E20] text-white rounded-br-sm" :
          "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"}`
          }>
          
          {msg.content}
        </div>
        {msg.link &&
        <Link
          to={msg.link.to}
          onClick={(e) => handleLinkClick(e, msg.link.to)}
          className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-[#1B5E20] font-medium hover:underline">
          
            <ChevronRight className="w-3 h-3" />
            {msg.link.label}
          </Link>
        }
      </div>
    </div>);

}

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [currentUser, setCurrentUser] = useState(undefined);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setCurrentUser(data.session?.user || null));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = (text) => {
    const content = (text || input).trim();
    if (!content || typing) return;
    setInput("");
    setShowSuggestions(false);

    const userMsg = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    // Simulate thinking delay
    setTimeout(() => {
      const found = findAnswer(content);
      let botMsg;
      if (found) {
        botMsg = { role: "bot", content: found.answer, link: found.link };
      } else {
        botMsg = {
          role: "bot",
          content:
          "Je n'ai pas trouvé de réponse précise à votre question. Vous pouvez consulter notre FAQ complète ou contacter notre support qui répond sous 24h. 😊",
          link: { label: "Contacter le support", to: "/Contact" }
        };
      }
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!open &&
      <button
        onClick={() => setOpen(true)} className="bg-[#1B5E20] text-white my-5 px-5 py-3 rounded-full fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex items-center gap-2.5 hover:bg-[#2E7D32] shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">

        
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold text-sm">Besoin d'aide ?</span>
        </button>
      }

      {open &&
      <div
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-gray-50 rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
        style={{ height: "520px" }}>
        
          {/* Header */}
          <div className="bg-[#1B5E20] px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Alexandre – SwingMarket</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  <span className="text-white/70 text-xs">En ligne · Répond instantanément</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Welcome */}
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-[#1B5E20] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <div className="max-w-[82%] bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-gray-800 leading-relaxed">
                Bonjour 👋<br />Je suis Alexandre de SwingMarket, là pour vous aider.<br />N'hésitez pas à me poser votre question !
              </div>
            </div>

            {messages.map((msg, i) =>
          <MessageBubble key={i} msg={msg} user={currentUser} />
          )}

            {typing &&
          <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#1B5E20] flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
          }
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {showSuggestions &&
        <div className="px-3 py-2 border-t border-gray-100 bg-white shrink-0">
              <p className="text-xs text-gray-400 mb-2 px-1">Questions fréquentes</p>
              <div className="flex flex-col gap-1">
                {SUGGESTIONS.slice(0, 3).map((s) =>
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="text-left text-xs text-[#1B5E20] bg-green-50 hover:bg-green-100 rounded-lg px-3 py-2 flex items-center gap-2 transition-colors">
              
                    <ChevronRight className="w-3 h-3 shrink-0" />
                    {s}
                  </button>
            )}
              </div>
            </div>
        }

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 bg-white shrink-0 flex gap-2">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1B5E20]/30" />
          
            <button
            onClick={() => handleSend()}
            disabled={!input.trim() || typing}
            className="w-9 h-9 rounded-full bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-40 flex items-center justify-center transition-colors shrink-0">
            
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      }
    </>);

}