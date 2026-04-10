import { supabase } from '@/lib/supabase';
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";
import AnnouncementTicker from "./AnnouncementTicker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Menu, X, Heart, MessageCircle, User, LogOut,
  ShoppingBag, Plus, ChevronDown, ChevronRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTranslate, AVAILABLE_LANGUAGES } from "../providers/TranslationProvider";

const CATEGORIES = [
  { name: "Clubs de golf", subcats: ["Drivers", "Bois de parcours", "Hybrides", "Fers (sets complets)", "Fers individuels", "Wedges", "Putters", "Sets complets", "Clubs juniors", "Clubs femmes", "Clubs gauchers", "Shafts", "Grips", "Pièces détachées"] },
  { name: "Balles de golf", subcats: ["Balles neuves", "Balles recyclées", "Balles premium", "Balles d'entraînement", "Balles personnalisées", "Balles de récupération"] },
  { name: "Chariots", subcats: ["Chariots manuels", "Chariots électriques", "Chariots pliables", "Accessoires chariot", "Batteries chariot", "Roues de chariot"] },
  { name: "Sacs de golf", subcats: ["Sacs trépied", "Sacs chariot", "Sacs tour", "Sacs voyage", "Sacs légers", "Accessoires sacs"] },
  { name: "Accessoires", subcats: ["Tees", "Gants", "Marqueurs de balle", "Releveurs de pitch", "Serviettes golf", "Parapluies golf", "Télémètres", "GPS golf", "Montres GPS", "Nettoyeurs de clubs", "Porte cartes de score"] },
  { name: "Entraînement", subcats: ["Tapis d'entraînement", "Filets de practice", "Putting mats", "Cibles d'entraînement", "Aides au swing", "Simulateurs de golf", "Caméras analyse swing", "Trackers de swing"] },
  { name: "Vêtements", subcats: ["Polos golf", "Pantalons golf", "Shorts golf", "Vestes golf", "Chaussures golf", "Casquettes golf", "Bonnets golf", "Ceintures golf", "Gants hiver"] },
];

function CategoryItem({ cat }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const handleMouseEnter = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setOpen(true); };
  const handleMouseLeave = () => { timeoutRef.current = setTimeout(() => setOpen(false), 150); };
  return (
    <div className="relative z-[10000]" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button onClick={() => window.location.href = createPageUrl("Marketplace") + `?category=${encodeURIComponent(cat.name)}`}
        className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-[#1B5E20] px-3 py-2 rounded-lg hover:bg-green-50 transition-colors whitespace-nowrap">
        {cat.name}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="fixed bg-white border border-gray-200 rounded-xl shadow-2xl py-3 min-w-[260px] max-h-[450px] overflow-y-auto"
          style={{ zIndex: 99999, top: 'var(--dropdown-top)', left: 'var(--dropdown-left)' }}
          ref={(el) => { if (el) { const b = el.previousElementSibling; const r = b.getBoundingClientRect(); el.style.setProperty('--dropdown-top', `${r.bottom + 4}px`); el.style.setProperty('--dropdown-left', `${r.left}px`); } }}>
          {cat.subcats.map((sub) => (
            <Link key={sub} to={createPageUrl("Marketplace") + `?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub)}`}
              className="block px-4 py-2.5 text-sm text-gray-700 hover:text-[#1B5E20] hover:bg-green-50 transition-colors">{sub}</Link>
          ))}
        </div>
      )}
    </div>
  );
}


// Hook pour compter les messages non lus
function useUnreadMessages() {
  const [unread, setUnread] = React.useState(0);
  React.useEffect(() => {
    let interval;
    const checkUnread = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const uid = session.user.id;
        const { data: convs } = await supabase.from('conversations').select('id').or(`participant_1.eq.${uid},participant_2.eq.${uid}`);
        if (!convs?.length) return;
        const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('read', false).neq('sender_id', uid).in('conversation_id', convs.map(c => c.id));
        setUnread(count || 0);
      } catch (e) {}
    };
    checkUnread();
    interval = setInterval(checkUnread, 15000);
    return () => clearInterval(interval);
  }, []);
  return unread;
}

export default function Navbar() {
  const { language, changeLanguage, t } = useTranslate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpenCategory, setMobileOpenCategory] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        setUser(profile || session.user);
      }
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      if (session?.user) {
        supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data }) => setUser(data || session.user));
      } else { setUser(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false); setMobileOpen(false);
      window.location.href = createPageUrl("Marketplace") + `?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = "/"; };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-[9999] relative">
      <AnnouncementTicker />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14 md:h-16 gap-3">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full golf-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold text-[#1B5E20]">SwingMarket<span className="text-[#C5A028]">Golf</span></span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder={`${t("common.search")}...`} value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] transition-all" />
            </div>
          </form>

          <div className="flex-1 md:hidden" />

          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden p-2 text-gray-500 hover:text-[#1B5E20]">
              <Search className="w-5 h-5" />
            </button>

            {isLoggedIn ? (
              <>
                <Link to={createPageUrl("CreateListing")} className="hidden sm:block">
                  <Button size="sm" className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-full gap-1.5 text-xs px-3">
                    <Plus className="w-3.5 h-3.5" /> Vendre
                  </Button>
                </Link>
                <Link to={createPageUrl("Favorites")} className="hidden md:block p-2 text-gray-500 hover:text-[#1B5E20]"><Heart className="w-5 h-5" /></Link>
                <Link to={createPageUrl(t("nav.messages"))} className="hidden md:block p-2 text-gray-500 hover:text-[#1B5E20] relative">
                  <MessageCircle className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1">
                      <div className="w-8 h-8 rounded-full bg-[#1B5E20] flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{user?.full_name?.[0] || "U"}</span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="font-medium text-sm">{user?.full_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link to={createPageUrl("Dashboard")} className="cursor-pointer"><ShoppingBag className="w-4 h-4 mr-2" /> Tableau de bord</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to={createPageUrl("Profile") + `?id=${user?.id}`} className="cursor-pointer"><User className="w-4 h-4 mr-2" /> Mon profil</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to={createPageUrl("Favorites")} className="cursor-pointer"><Heart className="w-4 h-4 mr-2" /> Favoris</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer"><LogOut className="w-4 h-4 mr-2" /> Déconnexion</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg px-1.5 py-1">
                  {AVAILABLE_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded transition-colors ${language === lang.code ? "bg-[#1B5E20] text-white" : "text-gray-500 hover:text-[#1B5E20]"}`}
                    >
                      {lang.flag} {lang.label}
                    </button>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => window.location.href = createPageUrl("Login")}
                  className="rounded-full border-[#1B5E20] text-[#1B5E20] hover:bg-[#1B5E20] hover:text-white text-xs px-3">{t("common.login")}</Button>
                <Button size="sm" onClick={() => window.location.href = createPageUrl("Login")}
                  className="rounded-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs px-3">{t("common.sell")}</Button>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-500">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input autoFocus type="text" placeholder={`${t("common.search")}...`} value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]" />
            </div>
          </form>
        )}
      </div>

      <div className="hidden md:flex items-center justify-center gap-2 px-6 py-3 overflow-x-auto border-t border-gray-50 bg-white relative z-[9999]">
        {CATEGORIES.map((cat) => (<CategoryItem key={cat.name} cat={cat} />))}
        <Link to={createPageUrl("Blog")} className="text-xs font-medium text-gray-600 hover:text-[#1B5E20] px-3 py-1.5 rounded-full hover:bg-green-50 transition-all whitespace-nowrap">Blog</Link>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-white max-h-[80vh] overflow-y-auto">
          {!isLoggedIn && (
            <div className="p-4 flex gap-2 border-b">
              <Button className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-full" onClick={() => window.location.href = createPageUrl("Login")}>{t("common.login")}</Button>
              <Button variant="outline" className="flex-1 border-[#C5A028] text-[#C5A028] hover:bg-[#C5A028] hover:text-white rounded-full" onClick={() => window.location.href = createPageUrl("Login")}>S'inscrire</Button>
            </div>
          )}
          {isLoggedIn && (
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1B5E20] flex items-center justify-center">
                  <span className="text-white font-medium">{user?.full_name?.[0] || "U"}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Link to={createPageUrl("CreateListing")} onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="bg-[#1B5E20] text-white rounded-full gap-1 text-xs"><Plus className="w-3.5 h-3.5" /> Vendre</Button>
              </Link>
            </div>
          )}

          <div className="px-4 py-2 border-b flex gap-2">
            <Link to={createPageUrl("Marketplace")} onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm font-medium text-[#1B5E20] bg-green-50 rounded-lg">Toutes les annonces</Link>
            <Link to={createPageUrl("Blog")} onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">Blog</Link>
          </div>

          <div className="px-4 py-2 pb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Catégories</p>
            {CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <button onClick={() => setMobileOpenCategory(mobileOpenCategory === cat.name ? null : cat.name)}
                  className="w-full text-left flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[#1B5E20] rounded-lg transition-colors">
                  {cat.name}
                  <ChevronRight className={`w-4 h-4 transition-transform ${mobileOpenCategory === cat.name ? 'rotate-90' : ''}`} />
                </button>
                {mobileOpenCategory === cat.name && (
                  <div className="pl-4 mb-1 space-y-0.5">
                    {cat.subcats.map((sub) => (
                      <Link key={sub} to={createPageUrl("Marketplace") + `?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub)}`}
                        onClick={() => setMobileOpen(false)} className="block px-3 py-1.5 text-xs text-gray-600 hover:text-[#1B5E20] hover:bg-green-50 rounded-lg">{sub}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {isLoggedIn && (
            <div className="px-4 py-3 border-t space-y-1">
              <Link to={createPageUrl("Dashboard")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><ShoppingBag className="w-4 h-4" /> Tableau de bord</Link>
              <Link to={createPageUrl("Favorites")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><Heart className="w-4 h-4" /> Favoris</Link>
              <Link to={createPageUrl(t("nav.messages"))} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><MessageCircle className="w-4 h-4" /> Messages</Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"><LogOut className="w-4 h-4" /> Déconnexion</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}