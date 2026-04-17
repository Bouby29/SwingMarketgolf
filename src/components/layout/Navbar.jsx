import { supabase } from '@/lib/supabase';
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import AnnouncementTicker from "./AnnouncementTicker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Menu, X, Heart, MessageCircle, User, LogOut,
  ShoppingBag, Plus, ChevronDown, ChevronRight, Home, LayoutGrid
} from "lucide-react";
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

// Menu déroulant mobile (slide depuis le haut)
function MobileMenu({ open, onClose, isLoggedIn, user, unreadCount, handleVendre, handleLogout, t, mobileOpenCategory, setMobileOpenCategory }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={onClose} />
      <div className="fixed top-0 left-0 right-0 bg-white z-[9999] max-h-[85vh] overflow-y-auto shadow-2xl rounded-b-2xl">
        {/* Header du menu */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-bold text-[#1B5E20] text-base">SwingMarket<span className="text-[#C5A028]">Golf</span></span>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        {/* User info ou login */}
        {isLoggedIn ? (
          <div className="px-4 py-3 bg-green-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1B5E20] flex items-center justify-center">
                <span className="text-white font-bold">{user?.full_name?.[0] || "U"}</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <a href="#" onClick={handleVendre}>
              <Button size="sm" className="bg-[#1B5E20] text-white rounded-full gap-1 text-xs px-3"><Plus className="w-3.5 h-3.5" /> Vendre</Button>
            </a>
          </div>
        ) : (
          <div className="px-4 py-3 flex gap-2 border-b">
            <Button className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-full" onClick={() => window.location.href = createPageUrl("Login")}>Se connecter</Button>
            <Button variant="outline" className="flex-1 border-[#C5A028] text-[#C5A028] rounded-full" onClick={() => window.location.href = createPageUrl("Login")}>S'inscrire</Button>
          </div>
        )}

        {/* Actions rapides */}
        <div className="px-4 py-3 grid grid-cols-2 gap-2 border-b">
          <Link to={createPageUrl("Marketplace")} onClick={onClose} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#1B5E20]">
            <LayoutGrid className="w-4 h-4" /> Toutes les annonces
          </Link>
          <Link to={createPageUrl("Home")} onClick={onClose} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#1B5E20]">
            <Home className="w-4 h-4" /> Accueil
          </Link>
          {isLoggedIn && <>
            <Link to={createPageUrl("Dashboard")} onClick={onClose} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#1B5E20]">
              <ShoppingBag className="w-4 h-4" /> Dashboard
            </Link>
            <Link to={createPageUrl("Favorites")} onClick={onClose} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#1B5E20]">
              <Heart className="w-4 h-4" /> Favoris
            </Link>
          </>}
          <a href="/SearchRequestsList" onClick={onClose} className="flex items-center gap-2 px-3 py-2.5 bg-yellow-50 rounded-xl text-sm font-medium text-[#C5A028]">
            📋 Demandes acheteurs
          </a>
          <a href="/SearchRequest" onClick={onClose} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#1B5E20]">
            🔍 Poster une recherche
          </a>
        </div>

        {/* Catégories */}
        <div className="px-4 py-2 pb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Catégories</p>
          {CATEGORIES.map((cat) => (
            <div key={cat.name}>
              <button onClick={() => setMobileOpenCategory(mobileOpenCategory === cat.name ? null : cat.name)}
                className="w-full text-left flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[#1B5E20] rounded-xl transition-colors">
                {cat.name}
                <ChevronRight className={`w-4 h-4 transition-transform ${mobileOpenCategory === cat.name ? 'rotate-90' : ''}`} />
              </button>
              {mobileOpenCategory === cat.name && (
                <div className="pl-4 mb-1 space-y-0.5">
                  {cat.subcats.map((sub) => (
                    <Link key={sub} to={createPageUrl("Marketplace") + `?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub)}`}
                      onClick={onClose} className="block px-3 py-1.5 text-xs text-gray-600 hover:text-[#1B5E20] hover:bg-green-50 rounded-lg">{sub}</Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {isLoggedIn && (
          <div className="px-4 pb-4 border-t pt-3">
            <button onClick={() => { handleLogout(); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function Navbar() {
  const { language, changeLanguage, t } = useTranslate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const unreadCount = useUnreadMessages();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpenCategory, setMobileOpenCategory] = useState(null);

  const handleVendre = async (e) => {
    e.preventDefault();
    if (!user) { window.location.href = "/Login"; return; }
    const localDone = localStorage.getItem("seller_onboarding_" + user.email);
    if (localDone === "true") { window.location.href = "/CreateListing"; return; }
    const { data: profile } = await supabase.from("profiles").select("seller_onboarding_completed").eq("email", user.email).single();
    if (profile?.seller_onboarding_completed) {
      localStorage.setItem("seller_onboarding_" + user.email, "true");
      window.location.href = "/CreateListing";
    } else {
      window.location.href = "/SellerOnboarding";
    }
  };

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
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-[9999]">
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

            {/* Mobile: search bar inline */}
            {searchOpen && (
              <form onSubmit={handleSearch} className="md:hidden flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input autoFocus type="text" placeholder="Rechercher..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#2E7D32]" />
                </div>
              </form>
            )}
            {!searchOpen && <div className="flex-1 md:hidden" />}

            <div className="flex items-center gap-1">
              {/* Mobile search toggle */}
              <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden p-2 text-gray-500 hover:text-[#1B5E20]">
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>

              {/* Desktop nav */}
              {isLoggedIn ? (
                <>
                  <a href="/SearchRequestsList" className="hidden sm:block text-xs font-medium text-[#C5A028] hover:underline px-3 py-2 whitespace-nowrap">📋 Demandes</a>
                  <a href="#" onClick={handleVendre} className="hidden sm:block">
                    <Button size="sm" className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-full gap-1.5 text-xs px-3">
                      <Plus className="w-3.5 h-3.5" /> Vendre
                    </Button>
                  </a>
                  <Link to={createPageUrl("Favorites")} className="hidden md:block p-2 text-gray-500 hover:text-[#1B5E20]"><Heart className="w-5 h-5" /></Link>
                  <Link to={createPageUrl(t("nav.messages"))} className="hidden md:block p-2 text-gray-500 hover:text-[#1B5E20] relative">
                    <MessageCircle className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hidden md:block">
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
                  <Button size="sm" onClick={() => window.location.href = createPageUrl("Login")}
                    className="rounded-full bg-[#1B5E20] text-white hover:bg-[#2E7D32] text-xs px-3">{t("common.login")}</Button>
                  <Button size="sm" onClick={() => window.location.href = createPageUrl("Login")}
                    className="rounded-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs px-3">{t("common.sell")}</Button>
                </div>
              )}

              {/* Hamburger mobile - seulement visible sur mobile */}
              <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-gray-500">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop categories bar */}
        <div className="hidden md:flex items-center justify-center gap-2 px-6 py-3 overflow-x-auto border-t border-gray-50 bg-white relative z-[9999]">
          {CATEGORIES.map((cat) => (<CategoryItem key={cat.name} cat={cat} />))}
          <Link to={createPageUrl("Blog")} className="text-xs font-medium text-gray-600 hover:text-[#1B5E20] px-3 py-1.5 rounded-full hover:bg-green-50 transition-all whitespace-nowrap">Blog</Link>
        </div>
      </nav>

      {/* Mobile menu déroulant */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isLoggedIn={isLoggedIn}
        user={user}
        unreadCount={unreadCount}
        handleVendre={handleVendre}
        handleLogout={handleLogout}
        t={t}
        mobileOpenCategory={mobileOpenCategory}
        setMobileOpenCategory={setMobileOpenCategory}
      />

      {/* Bottom Tab Bar - style Leboncoin */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[9990] bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]" style={{paddingBottom: "env(safe-area-inset-bottom)"}}>
        <div className="flex items-stretch h-14">

          {/* Accueil */}
          <Link to={createPageUrl("Home")} className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-400 active:text-[#1B5E20]">
            <Home className="w-[22px] h-[22px]" strokeWidth={1.8} />
            <span className="text-[10px] font-medium tracking-tight">Accueil</span>
          </Link>

          {/* Marketplace */}
          <Link to={createPageUrl("Marketplace")} className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-400 active:text-[#1B5E20]">
            <Search className="w-[22px] h-[22px]" strokeWidth={1.8} />
            <span className="text-[10px] font-medium tracking-tight">Rechercher</span>
          </Link>

          {/* Vendre - bouton central surélevé */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <a href="#" onClick={handleVendre} className="flex flex-col items-center gap-0.5 -mt-3">
              <div className="w-11 h-11 rounded-full bg-[#1B5E20] flex items-center justify-center shadow-md">
                <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-medium text-[#1B5E20] tracking-tight">Publier</span>
            </a>
          </div>

          {/* Messages */}
          <Link to={isLoggedIn ? createPageUrl(t("nav.messages")) : createPageUrl("Login")} className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-400 active:text-[#1B5E20]">
            <div className="relative">
              <MessageCircle className="w-[22px] h-[22px]" strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium tracking-tight">Messages</span>
          </Link>

          {/* Mon compte */}
          <Link to={isLoggedIn ? createPageUrl("Dashboard") : createPageUrl("Login")} className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-400 active:text-[#1B5E20]">
            {isLoggedIn ? (
              <div className="w-[22px] h-[22px] rounded-full bg-[#1B5E20] flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">{user?.full_name?.[0] || "U"}</span>
              </div>
            ) : (
              <User className="w-[22px] h-[22px]" strokeWidth={1.8} />
            )}
            <span className="text-[10px] font-medium tracking-tight">Mon compte</span>
          </Link>

        </div>
      </div>

      {/* Spacer */}
      <div className="md:hidden h-16" />
    </>
  );
}
