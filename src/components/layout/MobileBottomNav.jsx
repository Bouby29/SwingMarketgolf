import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/lib/supabase";
import { Home, ShoppingBag, Plus, User } from "lucide-react";

export default function MobileBottomNav() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    Promise.resolve(true).then(setIsLoggedIn);
  }, []);

  const tabs = [
    { name: "Accueil", path: createPageUrl("Home"), icon: Home },
    { name: "Marketplace", path: createPageUrl("Marketplace"), icon: ShoppingBag },
    { name: "Vendre", path: createPageUrl("CreateListing"), icon: Plus, highlight: true },
    { name: "Profil", path: createPageUrl("Dashboard"), icon: User },
  ];

  const isActive = (path) => {
    if (path === createPageUrl("Home")) return location.pathname === "/" || location.pathname === path;
    return location.pathname === path;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 mobile-safe-bottom z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          if (tab.name === "Vendre") {
            return (
              <Link
                key={tab.name}
                to={tab.path}
                onClick={(e) => {
                  if (!isLoggedIn) {
                    e.preventDefault();
                    base44.auth.redirectToLogin();
                  }
                }}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="w-14 h-14 rounded-full bg-[#1B5E20] flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[9px] font-medium text-gray-600 mt-1">{tab.name}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.name}
              to={tab.path}
              onClick={(e) => {
                if (tab.name === "Profil" && !isLoggedIn) {
                  e.preventDefault();
                  base44.auth.redirectToLogin();
                }
              }}
              className="flex flex-col items-center justify-center py-1 px-4 min-w-[60px]"
            >
              <Icon className={`w-5 h-5 ${active ? "text-[#1B5E20]" : "text-gray-400"}`} />
              <span className={`text-[10px] font-medium mt-0.5 ${active ? "text-[#1B5E20]" : "text-gray-500"}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}