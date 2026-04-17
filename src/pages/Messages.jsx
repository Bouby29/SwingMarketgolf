import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { useEmailService } from "../components/email/useEmailService";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, MessageCircle, Package } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function Messages() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const offerPrice = params.get("offer");
  const offerTitle = params.get("title");
  const toUserId = params.get("to");
  const productId = params.get("product");

  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [profiles, setProfiles] = useState({});
  const [products, setProducts] = useState({});
  const [unreadPerConv, setUnreadPerConv] = useState({});
  const [counterOfferInput, setCounterOfferInput] = useState({}); // { [msgId]: value }
  const [offerActions, setOfferActions] = useState({}); // { [msgId]: "accepted"|"refused"|"countered" }
  const messagesEndRef = useRef(null);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = "/Login"; return; }
      setUser(session.user);
    });
  }, []);

  // Load conversations
  useEffect(() => {
    if (!user?.id) return;
    loadConversations();
    // Realtime subscription
    const sub = supabase.channel("conversations")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, loadConversations)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [user?.id]);

  const loadConversations = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order("last_message_at", { ascending: false });
    if (!data) return;
    setConversations(data);

    // Load profiles for all participants
    const otherIds = [...new Set(data.flatMap(c => [c.participant_1, c.participant_2]).filter(id => id !== user.id))];
    if (otherIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("id,full_name,shop_name,avatar_url").in("id", otherIds);
      if (profs) {
        const map = {};
        profs.forEach(p => map[p.id] = p);
        setProfiles(map);
      }
    }

    // Load products
    const prodIds = [...new Set(data.map(c => c.product_id).filter(Boolean))];
    if (prodIds.length > 0) {
      const { data: prods } = await supabase.from("products").select("id,title,images,seller_id").in("id", prodIds);
      if (prods) {
        const map = {};
        prods.forEach(p => map[p.id] = p);
        setProducts(map);
      }
    }
  };

  // Open conversation from ProductDetail (?to=userId&product=productId)
  useEffect(() => {
    if (!user?.id || !toUserId) return;
    openOrCreateConversation(toUserId, productId);
  }, [user?.id, toUserId]);

  const openOrCreateConversation = async (otherId, prodId) => {
    // Check if conversation exists
    let query = supabase.from("conversations")
      .select("*")
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherId}),and(participant_1.eq.${otherId},participant_2.eq.${user.id})`);
    if (prodId) query = query.eq("product_id", prodId);
    
    const { data: existing } = await query.limit(1);
    
    if (existing && existing.length > 0) {
      setSelectedConv(existing[0]);
      loadMessages(existing[0].id);
      if (offerPrice) {
        setNewMessage(`🏷️ Bonjour, je suis intéressé par "${offerTitle || "votre article"}". Je vous propose ${offerPrice} €. Est-ce que ce prix vous convient ?`);
      }
    } else {
      // Create new conversation
      const { data: newConv } = await supabase.from("conversations").insert({
        participant_1: user.id,
        participant_2: otherId,
        product_id: prodId || null,
      }).select().single();
      if (newConv) {
        setSelectedConv(newConv);
        setMessages([]);
        loadConversations();
        if (offerPrice) {
          setNewMessage(`🏷️ Bonjour, je suis intéressé par "${offerTitle || "votre article"}". Je vous propose ${offerPrice} €. Est-ce que ce prix vous convient ?`);
        }
      }
    }
  };

  const loadMessages = async (convId) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    // Mark as read
    await supabase.from("messages")
      .update({ read: true })
      .eq("conversation_id", convId)
      .neq("sender_id", user.id);
  };

  const selectConversation = (conv) => {
    setSelectedConv(conv);
    loadMessages(conv.id);
  };

  // Polling messages toutes les 2s
  useEffect(() => {
    if (!selectedConv?.id) return;
    const interval = setInterval(() => {
      loadMessages(selectedConv.id);
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedConv?.id]);

  const prevMsgCount = useRef(0);
  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMsgCount.current = messages.length;
  }, [messages]);

  const { sendNewMessageNotification } = useEmailService();

  // Extraire le montant d'une offre depuis le contenu du message
  const extractOfferAmount = (content) => {
    const match = content.match(/Je vous propose ([\d.,]+)\s*€/);
    return match ? parseFloat(match[1].replace(',', '.')) : null;
  };

  const isSeller = (conv) => {
    if (!conv?.product_id || !products[conv.product_id]) return false;
    // On n'a pas seller_id dans products (on charge id,title,images) — on le recupere depuis selectedConv
    return conv.seller_id === user?.id;
  };

  const handleAcceptOffer = async (msg) => {
    const amount = extractOfferAmount(msg.content);
    if (!amount || !selectedConv?.product_id) return;
    // Mettre a jour le prix du produit
    await supabase.from("products").update({ price: amount }).eq("id", selectedConv.product_id);
    // Envoyer message de confirmation
    const content = `✅ J'accepte votre offre de ${amount} €. Le prix de l'annonce a été mis à jour. Vous pouvez procéder au paiement !`;
    await supabase.from("messages").insert({ conversation_id: selectedConv.id, sender_id: user.id, content, read: false });
    await supabase.from("conversations").update({ last_message: content, last_message_at: new Date().toISOString() }).eq("id", selectedConv.id);
    setOfferActions(prev => ({ ...prev, [msg.id]: "accepted" }));
    loadMessages(selectedConv.id);
    loadConversations();
  };

  const handleRefuseOffer = async (msg) => {
    const amount = extractOfferAmount(msg.content);
    const content = `❌ Désolé, je ne peux pas accepter cette offre${amount ? ` de ${amount} €` : ""}.`;
    await supabase.from("messages").insert({ conversation_id: selectedConv.id, sender_id: user.id, content, read: false });
    await supabase.from("conversations").update({ last_message: content, last_message_at: new Date().toISOString() }).eq("id", selectedConv.id);
    setOfferActions(prev => ({ ...prev, [msg.id]: "refused" }));
    loadMessages(selectedConv.id);
    loadConversations();
  };

  const handleCounterOffer = async (msg) => {
    const newPrice = parseFloat(counterOfferInput[msg.id]);
    if (!newPrice || newPrice <= 0) return;
    const prodTitle = selectedConv?.product_id ? products[selectedConv.product_id]?.title : "l'article";
    const content = `🏷️ Bonjour, je vous propose ${newPrice} € pour "${prodTitle}". Est-ce que ce prix vous convient ?`;
    await supabase.from("messages").insert({ conversation_id: selectedConv.id, sender_id: user.id, content, read: false });
    await supabase.from("conversations").update({ last_message: content, last_message_at: new Date().toISOString() }).eq("id", selectedConv.id);
    setOfferActions(prev => ({ ...prev, [msg.id]: "countered" }));
    setCounterOfferInput(prev => ({ ...prev, [msg.id]: "" }));
    loadMessages(selectedConv.id);
    loadConversations();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");
    
    await supabase.from("messages").insert({
      conversation_id: selectedConv.id,
      sender_id: user.id,
      content,
      read: false,
    });

    await supabase.from("conversations").update({
      last_message: content,
      last_message_at: new Date().toISOString(),
    }).eq("id", selectedConv.id);

    loadConversations();
    setSending(false);
  };

  const getOtherParticipant = (conv) => {
    const otherId = conv.participant_1 === user?.id ? conv.participant_2 : conv.participant_1;
    return profiles[otherId];
  };

  const getDisplayName = (profile) => {
    return profile?.shop_name || profile?.full_name || "Utilisateur";
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "À l'instant";
    if (diff < 3600000) return `${Math.floor(diff/60000)}min`;
    if (diff < 86400000) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gray-50">
      {/* Sidebar conversations */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white flex flex-col ${selectedConv ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageCircle className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">Aucune conversation</p>
              <p className="text-gray-300 text-xs mt-1">Contactez un vendeur depuis une annonce</p>
            </div>
          ) : (
            conversations.map(conv => {
              const other = getOtherParticipant(conv);
              const product = conv.product_id ? products[conv.product_id] : null;
              const isSelected = selectedConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${isSelected ? "bg-[#F0F7F0] border-l-4 border-l-[#1B5E20]" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[#1B5E20] flex items-center justify-center text-white font-bold">
                        {getDisplayName(other)?.[0]?.toUpperCase() || "?"}
                      </div>
                      {product?.images?.[0] && (
                        <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-gray-900 truncate">{getDisplayName(other)}</p>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {unreadPerConv[conv.id] > 0 && (
                            <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                              {unreadPerConv[conv.id] > 9 ? "9+" : unreadPerConv[conv.id]}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{formatTime(conv.last_message_at)}</span>
                        </div>
                      </div>
                      {product && (
                        <p className="text-xs text-[#1B5E20] truncate flex items-center gap-1 mt-0.5">
                          <Package className="w-3 h-3 shrink-0" />{product.title}
                        </p>
                      )}
                      {conv.last_message && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{conv.last_message}</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${!selectedConv ? "hidden md:flex" : "flex"}`}>
        {!selectedConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageCircle className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">Sélectionnez une conversation</p>
          </div>
        ) : (
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
              <button onClick={() => setSelectedConv(null)} className="md:hidden p-1 rounded-lg hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </button>
              {(() => {
                const other = getOtherParticipant(selectedConv);
                const product = selectedConv.product_id ? products[selectedConv.product_id] : null;
                return (
                    <div className="w-9 h-9 rounded-full bg-[#1B5E20] flex items-center justify-center text-white font-bold text-sm">
                      {getDisplayName(other)?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{getDisplayName(other)}</p>
                      {product && (
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <Package className="w-3 h-3" />{product.title}
                        </p>
                      )}
                    </div>
                    {product && (
                      <Link to={createPageUrl("ProductDetail") + `?id=${selectedConv.product_id}`} className="shrink-0">
                        {product.images?.[0] && (
                          <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                        )}
                      </Link>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">Commencez la conversation !</p>
                </div>
              )}
              {messages.map(msg => {
                const isMine = msg.sender_id === user.id;
                const isOffer = msg.content?.startsWith("🏷️");
                const amSeller = !!(selectedConv?.product_id && products[selectedConv.product_id]?.seller_id === user?.id);
                const alreadyActed = offerActions[msg.id];
                const showActions = isOffer && !isMine && amSeller && !alreadyActed;
                const showCounter = showActions && counterOfferInput[msg.id] !== undefined;

                return (
                  <React.Fragment key={msg.id}>
                    {/* Bouton Acheter si vendeur a accepté — visible pour l acheteur */}
                    {msg.content?.startsWith("✅ J'accepte") && !isMine && selectedConv?.product_id && (
                      <div className="flex justify-start mb-2">
                        
                          href={"/Checkout?product=" + selectedConv.product_id}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B5E20] text-white text-sm font-bold hover:bg-green-800 transition-colors shadow-md"
                        >
                          🛒 Acheter au prix négocié
                        </a>
                      </div>
                    )}
                    <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        isOffer
                          ? "bg-amber-50 border-2 border-[#C5A028] text-gray-900 rounded-bl-sm shadow-sm"
                          : isMine
                            ? "bg-[#1B5E20] text-white rounded-br-sm"
                            : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-sm"
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMine && !isOffer ? "text-green-200" : "text-gray-400"}`}>{formatTime(msg.created_at)}</p>
                      </div>

                      {showActions && !showCounter && (
                        <div className="flex gap-2 mt-2 max-w-[75%]">
                          <button onClick={() => handleAcceptOffer(msg)} className="flex-1 py-2 px-3 rounded-full bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#2E7D32] transition-colors">✅ Accepter</button>
                          <button onClick={() => setCounterOfferInput(prev => ({ ...prev, [msg.id]: "" }))} className="flex-1 py-2 px-3 rounded-full bg-[#C5A028] text-white text-xs font-bold hover:bg-[#b8902a] transition-colors">💬 Contre-proposer</button>
                          <button onClick={() => handleRefuseOffer(msg)} className="flex-1 py-2 px-3 rounded-full bg-white border border-red-300 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors">❌ Refuser</button>
                        </div>
                      )}

                      {showActions && showCounter && (
                        <div className="flex gap-2 mt-2 max-w-[75%] items-center">
                          <input
                            type="number"
                            value={counterOfferInput[msg.id] || ""}
                            onChange={e => setCounterOfferInput(prev => ({ ...prev, [msg.id]: e.target.value }))}
                            placeholder="Votre prix €"
                            className="flex-1 border-2 border-[#C5A028] rounded-full px-3 py-1.5 text-sm text-center font-bold outline-none"
                            autoFocus
                          />
                          <button onClick={() => handleCounterOffer(msg)} className="py-2 px-3 rounded-full bg-[#C5A028] text-white text-xs font-bold hover:bg-[#b8902a]">Envoyer →</button>
                          <button onClick={() => setCounterOfferInput(prev => { const n = {...prev}; delete n[msg.id]; return n; })} className="py-2 px-3 rounded-full border border-gray-300 text-gray-500 text-xs">✕</button>
                        </div>
                      )}

                      {alreadyActed && isOffer && !isMine && (
                        <p className="text-xs text-gray-400 mt-1">
                          {alreadyActed === "accepted" ? "✅ Offre acceptée" : alreadyActed === "refused" ? "❌ Offre refusée" : "💬 Contre-offre envoyée"}
                        </p>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Écrivez un message..."
                  className="flex-1 rounded-full bg-gray-50 border-gray-200"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-[#1B5E20] hover:bg-[#145218] text-white rounded-full w-10 h-10 p-0 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
