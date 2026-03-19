import React, { useEffect } from "react";
import { TranslationProvider } from "./components/providers/TranslationProvider";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import CookieConsent from "./components/CookieConsent";
import SupportChat from "./components/support/SupportChat";

export default function Layout({ children, currentPageName }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentPageName]);

  return (
    <TranslationProvider>
      <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
        <div className="hidden md:block relative z-[9999]">
          <Navbar />
        </div>
        <main className="flex-1 pb-20 md:pb-0 relative z-0">
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
        <CookieConsent />
        <SupportChat />
      </div>
    </TranslationProvider>
  );
}