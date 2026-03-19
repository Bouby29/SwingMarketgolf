import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase as base44 } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Package, Clock, Image as ImageIcon, Video, X, Loader2 } from "lucide-react";
import moment from "moment";
import "moment/locale/fr";
import { useEmailService } from "../components/email/useEmailService";

export default function Messages() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const toUserId = params.get("to");
  const productId = params.get("product");

  const [user, setUser] = useState(null);
  const [selectedConv, setSelectedConv] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  // Cache product/seller name for new conversations
  const [newConvMeta, setNewConvMeta] = useState({ receiverName: "", productTitle: "" });
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sendingRef = useRef(false);
  const queryClient = useQueryClient();
  const { sendNewMessageNotification } = useEmailService();

  useEffect(() => {
    const init = async () => {
      const auth = await Promise.resolve(true);
      if (!auth) { base44.auth.redirectToLogin(); return; }
      const me = await Promise.resolve(null);
      setUser(me);
    };
    init();
  }, []);

  // Fetch seller name and product title when opening a new conversation from ProductDetail
  useEffect(() => {
    const fetchMeta = async () => {
      if (!toUserId) return;
      let receiverName = "";
      let productTitle = "";
      try {
        const sellers = await base44.entities.User.filter({ id: toUserId });
        if (sellers.length > 0) receiverName = sellers[0].full_name || "";
      } catch {}
      if (productId) {
        try {
          const prods = await base44.entities.Product.filter({ id: productId });
          if (prods.length > 0) productTitle = prods[0].title || "";
        } catch {}
      }
      setNewConvMeta({ receiverName, productTitle });
    };
    fetchMeta();
  }, [toUserId, productId]);

  const { data: allMessages = [] } = useQuery({
    queryKey: ["all-messages", user?.id],
    queryFn: async () => {
      const [sent, received] = await Promise.all([
        base44.entities.Message.filter({ sender_id: user.id }, "-created_date", 500),
        base44.entities.Message.filter({ receiver_id: user.id }, "-created_date", 500),
      ]);
      return [...sent, ...received].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  // Fetch product images for conversations
  const productIds = [...new Set(allMessages.map(m => m.product_id).filter(Boolean))];
  const { data: products = [] } = useQuery({
    queryKey: ["conv-products", productIds],
    queryFn: async () => {
      if (productIds.length === 0) return [];
      return await base44.entities.Product.filter({ id: { $in: productIds } });
    },
    enabled: productIds.length > 0,
  });

  const productMap = products.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  // Group by conversation - use conversation_id if exists, otherwise generate from user IDs
  const conversations = {};
  allMessages.forEach(m => {
    // Generate conversation ID consistently
    let convId;
    if (m.conversation_id) {
      convId = m.conversation_id;
    } else {
      // Generate ID from sorted user IDs to ensure consistency
      convId = [m.sender_id, m.receiver_id].sort().join("_");
    }
    
    if (!conversations[convId]) {
      conversations[convId] = {
        id: convId,
        messages: [],
        otherUser: m.sender_id === user?.id
          ? { id: m.receiver_id, name: m.receiver_name }
          : { id: m.sender_id, name: m.sender_name },
        productTitle: m.product_title,
        productId: m.product_id,
      };
    }
    conversations[convId].messages.push(m);
  });

  const convList = Object.values(conversations).sort((a, b) => {
    const aLast = a.messages[a.messages.length - 1];
    const bLast = b.messages[b.messages.length - 1];
    return new Date(bLast.created_date) - new Date(aLast.created_date);
  });

  // Auto-select conversation from URL
  useEffect(() => {
    if (toUserId && user?.id) {
      const convId = [user.id, toUserId].sort().join("_");
      setSelectedConv(convId);
    }
  }, [toUserId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return {
          url: file_url,
          type: file.type.startsWith("image/") ? "image" : "video",
          name: file.name
        };
      });
      const uploaded = await Promise.all(uploadPromises);
      setAttachments(prev => [...prev, ...uploaded]);
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading(false);
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
   if (!newMessage.trim() && attachments.length === 0) return;
   if (sending || sendingRef.current) return; // Prevent double submission
   sendingRef.current = true;
   setSending(true);

   try {
     // Determine receiver — from existing conv or from URL param
     const activeConvData = selectedConv ? conversations[selectedConv] : null;
     const receiverId = activeConvData?.otherUser?.id || toUserId;
     const receiverName = activeConvData?.otherUser?.name || newConvMeta.receiverName;
     const convId = selectedConv || [user.id, receiverId].sort().join("_");
     const prodTitle = activeConvData?.productTitle || newConvMeta.productTitle;

     if (!receiverId) { 
       setSending(false);
       sendingRef.current = false;
       return;
     }

     // Build message content with attachments
     let messageContent = newMessage.trim();
     if (attachments.length > 0) {
       const attachmentLinks = attachments.map(att => 
         att.type === "image" 
           ? `[Image: ${att.url}]` 
           : `[Video: ${att.url}]`
       ).join("\n");
       messageContent = messageContent ? `${messageContent}\n\n${attachmentLinks}` : attachmentLinks;
     }

     await base44.entities.Message.create({
       conversation_id: convId,
       sender_id: user.id,
       sender_name: user.full_name,
       receiver_id: receiverId,
       receiver_name: receiverName,
       content: messageContent,
       product_id: productId || "",
       product_title: prodTitle,
       read: false,
     });

     // Send email notification to recipient
     try {
       const recipientData = await base44.entities.User.filter({ id: receiverId });
       if (recipientData?.length > 0) {
         await sendNewMessageNotification(recipientData[0], {
           senderName: user.full_name,
           productTitle: prodTitle,
           messagePreview: newMessage || "📎 Pièce jointe"
         });
       }
     } catch (err) {
       console.error("Failed to send message notification email:", err);
     }

     setNewMessage("");
     setAttachments([]);
     setSelectedConv(convId);
     queryClient.invalidateQueries({ queryKey: ["all-messages"] });
   } catch (err) {
     console.error("Message send error:", err);
   } finally {
     setSending(false);
     sendingRef.current = false;
   }
  };

  const activeConv = selectedConv ? conversations[selectedConv] : null;
  const isNewConv = toUserId && !activeConv;

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ height: "calc(100vh - 250px)" }}>
        <div className="flex h-full">
          {/* Conversations list */}
          <div className={`w-full md:w-80 border-r ${(selectedConv || isNewConv) ? "hidden md:block" : "block"}`}>
            <div className="p-4 border-b">
              <p className="font-medium text-sm text-gray-500">{convList.length} conversation{convList.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="overflow-y-auto h-full">
              {convList.length === 0 && !isNewConv ? (
                <div className="p-8 text-center text-gray-400 text-sm">Aucun message</div>
              ) : (
                convList.map(conv => {
                  const lastMsg = conv.messages[conv.messages.length - 1];
                  const product = productMap[conv.productId];
                  moment.locale("fr");
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConv(conv.id)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors border-b ${selectedConv === conv.id ? "bg-green-50" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        {product?.photos?.[0] ? (
                          <img
                            src={product.photos[0]}
                            alt={conv.productTitle}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#1B5E20] flex items-center justify-center shrink-0">
                            <span className="text-white text-sm font-medium">{conv.otherUser.name?.[0] || "?"}</span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-medium text-sm text-[#1B5E20] truncate">{conv.otherUser.name || "Utilisateur"}</p>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3" />
                              {moment(lastMsg.created_date).fromNow()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{lastMsg.content}</p>
                          {conv.productTitle && (
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                              <Package className="w-3 h-3" /> {conv.productTitle}
                            </p>
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
          <div className={`flex-1 flex flex-col ${!selectedConv && !isNewConv ? "hidden md:flex" : "flex"}`}>
            {activeConv || isNewConv ? (
              <>
                <div className="p-4 border-b flex items-center gap-3">
                  <button onClick={() => setSelectedConv(null)} className="md:hidden">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-[#1B5E20] flex items-center justify-center">
                    <span className="text-white text-sm">
                      {(activeConv?.otherUser?.name || newConvMeta.receiverName)?.[0] || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#1B5E20]">
                      {activeConv?.otherUser?.name || newConvMeta.receiverName || "Nouveau message"}
                    </p>
                    {(activeConv?.productTitle || newConvMeta.productTitle) && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {activeConv?.productTitle || newConvMeta.productTitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeConv ? activeConv.messages
                    .filter(msg => {
                      // Only show messages for this specific conversation
                      const msgConvId = msg.conversation_id || [msg.sender_id, msg.receiver_id].sort().join("_");
                      return msgConvId === selectedConv;
                    })
                    .map(m => {
                    // Parse message for attachments
                    const imageMatches = m.content.match(/\[Image: (.*?)\]/g) || [];
                    const videoMatches = m.content.match(/\[Video: (.*?)\]/g) || [];
                    const textContent = m.content
                      .replace(/\[Image: .*?\]/g, "")
                      .replace(/\[Video: .*?\]/g, "")
                      .trim();
                    const images = imageMatches.map(match => match.match(/\[Image: (.*?)\]/)[1]);
                    const videos = videoMatches.map(match => match.match(/\[Video: (.*?)\]/)[1]);

                    return (
                      <div key={m.id} className={`flex ${m.sender_id === user.id ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-2xl text-sm ${
                          m.sender_id === user.id
                            ? "bg-[#1B5E20] text-white rounded-br-md"
                            : "bg-gray-100 text-gray-900 rounded-bl-md"
                        }`}>
                          {textContent && (
                            <div className="px-4 py-2.5">
                              {textContent}
                            </div>
                          )}
                          {images.length > 0 && (
                            <div className="px-2 pb-2 pt-1 space-y-2">
                              {images.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                  <img src={url} alt="Pièce jointe" className="rounded-lg max-w-full hover:opacity-90 transition-opacity" />
                                </a>
                              ))}
                            </div>
                          )}
                          {videos.length > 0 && (
                            <div className="px-2 pb-2 pt-1 space-y-2">
                              {videos.map((url, i) => (
                                <video key={i} src={url} controls className="rounded-lg max-w-full" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }) : isNewConv ? (
                    <div className="text-center text-sm text-gray-400 py-8">
                      Démarrez la conversation avec le vendeur
                    </div>
                  ) : null}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t">
                  {attachments.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {attachments.map((att, i) => (
                        <div key={i} className="relative group">
                          {att.type === "image" ? (
                            <img src={att.url} alt={att.name} className="w-20 h-20 object-cover rounded-lg" />
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Video className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeAttachment(i)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <form onSubmit={(e) => { e.preventDefault(); if (!sending && !sendingRef.current) sendMessage(); }} className="flex gap-2 items-end">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      variant="outline"
                      size="icon"
                      className="rounded-full shrink-0"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Votre message..."
                      className="rounded-full flex-1 text-gray-900"
                    />
                    <Button type="submit" disabled={sending || (!newMessage.trim() && attachments.length === 0)} size="icon" className="rounded-full bg-[#1B5E20] hover:bg-[#2E7D32] shrink-0">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Sélectionnez une conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}