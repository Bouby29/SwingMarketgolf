import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { supabase } from "@/lib/supabase";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";

export default function MobileBottomNav() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const unreadCount = useUnreadMessages();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));
  }, []);

  const isActive = (path) => {
    if (path === createPageUrl("Home")) return location.pathname === "/" || location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleVendre = (e) => {
    if (!isLoggedIn) { e.preventDefault(); window.location.href = "/Login"; }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] z-50" style={{paddingBottom: "env(safe-area-inset-bottom)"}}>
      <div className="flex items-stretch h-14">

        <Link to={createPageUrl("Home")} className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${isActive(createPageUrl("Home")) ? "text-[#1B5E20]" : "text-gray-400"}`}>
          <Home className="w-[22px] h-[22px]" strokeWidth={1.8} />
          <span className="text-[10px] font-medium">Accueil</span>
        </Link>

        <Link to={createPageUrl("Marketplace")} className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${isActive(createPageUrl("Marketplace")) ? "text-[#1B5E20]" : "text-gray-400"}`}>
          <Search className="w-[22px] h-[22px]" strokeWidth={1.8} />
          <span className="text-[10px] font-medium">Rechercher</span>
        </Link>

        <div className="flex-1 flex flex-col items-center justify-center">
          <Link to={createPageUrl("CreateListing")} onClick={handleVendre} className="flex flex-col items-center gap-0.5 -mt-3">
            <div className="w-11 h-11 rounded-full bg-[#1B5E20] flex items-center justify-center shadow-md">
              <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-medium text-[#1B5E20]">Publier</span>
          </Link>
        </div>

        <Link to={isLoggedIn ? createPageUrl("Messages") : "/Login"} className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${isActive(createPageUrl("Messages")) ? "text-[#1B5E20]" : "text-gray-400"}`}>
          <div className="relative">
            <MessageCircle className="w-[22px] h-[22px]" strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Messages</span>
        </Link>

        <Link to={isLoggedIn ? createPageUrl("Dashboard") : "/Login"} onClick={(e) => { if (!isLoggedIn) { e.preventDefault(); window.location.href="/Login"; }}} className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${isActive(createPageUrl("Dashboard")) ? "text-[#1B5E20]" : "text-gray-400"}`}>
          <User className="w-[22px] h-[22px]" strokeWidth={1.8} />
          <span className="text-[10px] font-medium">Mon compte</span>
        </Link>

      </div>
    </div>
  );
}
