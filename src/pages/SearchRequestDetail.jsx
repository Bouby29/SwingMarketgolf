import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "@/utils";
import {
  MessageCircle, Plus, MapPin, Tag, Wallet, Clock,
  ArrowLeft, CheckCircle2, AlertCircle, Loader2, ShieldCheck,
} from "lucide-react";

// Clé sessionStorage pour transmettre l'action voulue au passage Login
const PENDING_ACTION_KEY = "pending_search_action";

const STATUS_META = {
  active:    { label: "Recherche active",     bg: "#ECFDF5", fg: "#047857", border: "rgba(16,185,129,.22)" },
  closed:    { label: "Fermée",                bg: "#F1F5F9", fg: "#475569", border: "rgba(71,85,105,.18)" },
  fulfilled: { label: "Trouvée ✓",             bg: "#FEF9E7", fg: "#8B6914", border: "rgba(197,160,40,.30)" },
  expired:   { label: "Expirée",               bg: "#FEF2F2", fg: "#B91C1C", border: "rgba(239,68,68,.20)" },
};

function relativeTime(date) {
  if (!date) return "";
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.round(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.round(diff / 3600)} h`;
  const days = Math.round(diff / 86400);
  if (days < 7) return `il y a ${days} j`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function initialsOf(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join("") || "?";
}

export default function SearchRequestDetail() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const id = useMemo(() => new URLSearchParams(location.search).get("id"), [location.search]);

  const [request, setRequest] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [marking, setMarking] = useState(false);

  // Toujours en haut au mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Fetch recherche + profil acheteur (jamais l'email/téléphone)
  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: r, error } = await supabase
        .from("search_requests")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !r) { setNotFound(true); setLoading(false); return; }
      setRequest(r);
      // Profil de l'acheteur — on ne récupère QUE des infos non sensibles
      if (r.user_id) {
        const { data: p } = await supabase
          .from("profiles")
          .select("id, full_name, shop_name, city, role, is_pro")
          .eq("id", r.user_id)
          .maybeSingle();
        if (!cancelled) setBuyer(p || null);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const isOwner = !!(user && request && user.id === request.user_id);
  const isActive = request?.status === "active";

  // Au retour de Login : déclenche l'action mise en attente.
  useEffect(() => {
    if (!user || !request) return;
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    if (!action) return;

    let pending;
    try {
      const raw = sessionStorage.getItem(PENDING_ACTION_KEY);
      pending = raw ? JSON.parse(raw) : null;
    } catch { pending = null; }
    // Sécurité : on ne déclenche que si l'action concerne CETTE recherche.
    if (!pending || pending.search_id !== request.id) return;

    if (action === "contact_buyer") {
      sessionStorage.removeItem(PENDING_ACTION_KEY);
      goContact();
    } else if (action === "propose_product") {
      sessionStorage.removeItem(PENDING_ACTION_KEY);
      goPropose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, request, location.search]);

  // ─── Actions ───
  const requireAuthThen = (action) => {
    // Sauvegarde l'action en attente puis redirige vers Login
    try {
      sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify({ search_id: request.id, action }));
    } catch {}
    const next = encodeURIComponent(`/SearchRequestDetail?id=${request.id}`);
    navigate(`/Login?next=${next}&action=${action}`);
  };

  const goContact = () => {
    // Ouvre la messagerie avec le buyer + référence à la recherche
    const url = `${createPageUrl("Messages")}?to=${request.user_id}&about_search=${request.id}`;
    navigate(url);
  };

  const goPropose = () => {
    // Pré-remplit CreateListing avec catégorie + titre de la recherche
    const params = new URLSearchParams({
      prefill_title: request.title || "",
      prefill_category: request.category || "",
      from_search: request.id,
    });
    navigate(`${createPageUrl("CreateListing")}?${params.toString()}`);
  };

  const handleContact = () => {
    if (!user) return requireAuthThen("contact_buyer");
    if (isOwner) return;
    goContact();
  };

  const handlePropose = () => {
    if (!user) return requireAuthThen("propose_product");
    if (isOwner) return;
    goPropose();
  };

  const markFulfilled = async () => {
    if (!isOwner) return;
    if (!confirm("Marquer cette recherche comme « trouvée » ? Elle ne sera plus visible publiquement.")) return;
    setMarking(true);
    const { error } = await supabase
      .from("search_requests")
      .update({ status: "fulfilled" })
      .eq("id", request.id);
    setMarking(false);
    if (error) { alert("Erreur : " + error.message); return; }
    setRequest(r => ({ ...r, status: "fulfilled" }));
  };

  // ─── Rendu ───
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-7 h-7 text-[#1B5E20] animate-spin" />
      </div>
    );
  }

  if (notFound || !request) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Recherche introuvable</h1>
          <p className="text-sm text-gray-500 mb-6">Cette demande n'existe plus ou a été retirée.</p>
          <Link to="/SearchRequestsList">
            <button className="inline-flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold rounded-full px-5 py-2.5 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voir toutes les recherches
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const stat = STATUS_META[request.status] || STATUS_META.active;
  const buyerName = buyer?.shop_name || buyer?.full_name || "Acheteur SwingMarket";
  const buyerCity = buyer?.city || null;
  const buyerInitials = initialsOf(buyer?.full_name || buyer?.shop_name || "Acheteur");

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10 px-4">
      <div className="max-w-[720px] mx-auto">
        {/* Retour */}
        <Link to="/SearchRequestsList"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B5E20] mb-5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour aux recherches
        </Link>

        {/* Bannière "votre recherche" */}
        {isOwner && (
          <div className="bg-[#FEF9E7] border border-[#C5A028]/25 rounded-2xl p-4 mb-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#C5A028]/15 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#8B6914]" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#0F172A]">C'est votre recherche</div>
              <div className="text-xs text-[#8B6914]">Vous pouvez la marquer comme trouvée une fois que vous avez reçu une proposition qui vous convient.</div>
            </div>
            {isActive && (
              <button onClick={markFulfilled} disabled={marking}
                className="inline-flex items-center gap-1.5 bg-[#0F172A] hover:bg-black text-white font-semibold rounded-full px-4 py-2 text-xs transition-colors disabled:opacity-60">
                {marking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Marquer trouvée
              </button>
            )}
          </div>
        )}

        {/* Carte principale */}
        <article className="bg-white rounded-[14px] border border-gray-100 shadow-sm overflow-hidden">
          {/* Header carte */}
          <div className="px-7 py-7 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1B5E20] bg-[#F7FEF7] border border-[#1B5E20]/15 rounded-full px-2.5 py-1">
                <Tag className="w-3 h-3" /> {request.category || "—"}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1"
                    style={{ background: stat.bg, color: stat.fg, border: `1px solid ${stat.border}` }}>
                {stat.label}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight leading-tight mb-3">
              {request.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {relativeTime(request.created_at)}
              </span>
              {request.budget && (
                <span className="inline-flex items-center gap-1.5 text-[#8B6914]">
                  <Wallet className="w-3.5 h-3.5" /> {request.budget}
                </span>
              )}
            </div>
          </div>

          {/* Corps */}
          {request.description && (
            <div className="px-7 py-6 border-b border-gray-100">
              <h3 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">
                Détails
              </h3>
              <p className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-line">
                {request.description}
              </p>
            </div>
          )}

          {/* Acheteur (anonyme — jamais d'email/téléphone) */}
          <div className="px-7 py-5 flex items-center gap-3 bg-gray-50/50">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1B5E20] to-[#0A1F0C] text-white font-bold text-sm flex items-center justify-center shrink-0">
              {buyerInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#0F172A]">
                {buyerName}
                {buyer?.is_pro && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase text-[#C5A028] bg-[#FEF9E7] px-1.5 py-0.5 rounded-md">
                    Pro
                  </span>
                )}
              </div>
              {buyerCity && (
                <div className="text-xs text-gray-500 inline-flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {buyerCity}
                </div>
              )}
              {!buyerCity && <div className="text-xs text-gray-400 mt-0.5">Membre SwingMarketGolf</div>}
            </div>
          </div>
        </article>

        {/* Actions */}
        {isActive && (
          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            <button
              onClick={handleContact}
              disabled={isOwner}
              title={isOwner ? "C'est votre recherche" : ""}
              className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border-2 border-[#1B5E20] text-[#1B5E20] font-semibold rounded-full px-5 py-3.5 text-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <MessageCircle className="w-4 h-4" />
              {isOwner ? "C'est votre recherche" : "Discuter avec l'acheteur"}
            </button>
            <button
              onClick={handlePropose}
              disabled={isOwner}
              title={isOwner ? "C'est votre recherche" : ""}
              className="group inline-flex items-center justify-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold rounded-full px-5 py-3.5 text-sm transition-all hover:shadow-lg shadow-[#1B5E20]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <Plus className="w-4 h-4" />
              {isOwner ? "C'est votre recherche" : "Proposer un produit"}
            </button>
          </div>
        )}

        {/* Statut non actif */}
        {!isActive && (
          <div className="bg-gray-100 border border-gray-200 rounded-2xl px-5 py-4 mt-5 text-sm text-gray-600 text-center">
            Cette recherche n'est plus active. {request.status === "fulfilled" ? "L'acheteur a trouvé son matériel." : ""}
          </div>
        )}
      </div>
    </div>
  );
}
