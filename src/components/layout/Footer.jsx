import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const InstagramIcon = () =>
<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>;


const FacebookIcon = () =>
<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>;


const TikTokIcon = () =>
<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>;


export default function Footer() {
  return (
    <footer className="bg-[#0A1F0C] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ad6e01c03e7e5793047eec/e82fe0216_Image14-03-2026a0031.png"
                alt="SwingMarketGolf" className="px-12 h-10 w-auto" />

              
            </div>
            <span className="text-lg font-bold hidden md:block mb-4">
              SwingMarket<span className="text-[#C5A028]">Golf</span>
            </span>
            <p className="text-gray-400 text-sm leading-relaxed">
              La marketplace du matériel de golf. Achetez et vendez vos clubs, balles et accessoires.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#C5A028]">Marketplace</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link to={createPageUrl("Marketplace") + "?category=Clubs de golf"} className="block hover:text-white transition-colors">Clubs de golf</Link>
              <Link to={createPageUrl("Marketplace") + "?category=Balles de golf"} className="block hover:text-white transition-colors">Balles de golf</Link>
              <Link to={createPageUrl("Marketplace") + "?category=Sacs de golf"} className="block hover:text-white transition-colors">Sacs de golf</Link>
              <Link to={createPageUrl("Marketplace") + "?category=Vêtements"} className="block hover:text-white transition-colors">Vêtements golf</Link>
              <Link to={createPageUrl("ProfessionnelsSellers")} className="block hover:text-white transition-colors">Vendeurs pro</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#C5A028]">Informations</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link to={createPageUrl("QuiSommesNous")} className="block hover:text-white transition-colors">Qui sommes-nous ?</Link>
              <Link to="/Guides" className="block hover:text-white transition-colors">Guides acheteur & vendeur</Link>
              <Link to={createPageUrl("Blog")} className="block hover:text-white transition-colors">Blog</Link>
              <Link to={createPageUrl("FAQ")} className="block hover:text-white transition-colors">FAQ</Link>
              <Link to={createPageUrl("MentionsLegales")} className="block hover:text-white transition-colors">Mentions légales</Link>
              <Link to={createPageUrl("CGV")} className="block hover:text-white transition-colors">CGV</Link>
              <Link to={createPageUrl("CGU")} className="block hover:text-white transition-colors">CGU</Link>
              <Link to={createPageUrl("CGS")} className="block hover:text-white transition-colors">CGS Vendeurs</Link>
              <Link to={createPageUrl("CGSPro")} className="block hover:text-white transition-colors">CGS Vendeurs Pro</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#C5A028]">Contact</h4>
            <div className="space-y-2 text-sm text-gray-400 mb-6">
              <Link to={createPageUrl("Confidentialite")} className="block hover:text-white transition-colors">Politique de confidentialité</Link>
              <Link to="/Contact" className="block hover:text-white transition-colors">Nous contacter</Link>
              <p>contact@swingmarket.fr</p>
            </div>
            <h4 className="font-semibold mb-3 text-[#C5A028]">Suivez-nous</h4>
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E1306C] flex items-center justify-center transition-colors">
                <InstagramIcon />
              </a>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#1877F2] flex items-center justify-center transition-colors">
                <FacebookIcon />
              </a>
              <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-black flex items-center justify-center transition-colors">
                <TikTokIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col gap-4">
          {/* Payment logos */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Visa */}
            <div className="bg-white rounded-md px-2 py-1 flex items-center justify-center h-8 w-14">
              <svg viewBox="0 0 38 24" className="h-5"><rect width="38" height="24" rx="4" fill="#1A1F71" /><path d="M15.6 7.5l-2.3 9h-2.1l2.3-9h2.1zm8.8 5.8l1.1-3.1.6 3.1h-1.7zm2.3 3.2h2l-1.7-9h-1.9c-.4 0-.8.2-1 .6l-3.4 8.4h2.2l.4-1.2h2.7l.7 1.2zm-5.5-3c0-2.2-3-2.3-3-3.3 0-.3.3-.6.9-.7.6-.1 1.3 0 1.9.3l.3-1.6a5.4 5.4 0 00-1.8-.3c-1.9 0-3.3 1-3.3 2.5 0 1.1 1 1.7 1.7 2 .7.4 1 .6 1 1 0 .5-.6.8-1.2.8-.7 0-1.4-.2-2-.5l-.4 1.6c.7.3 1.4.4 2.2.4 2 0 3.4-1 3.4-2.7h.3zm-8.3-6L9.7 16.5H7.5L5.1 9.4c-.1-.4-.3-.5-.6-.7-.7-.3-1.7-.6-2.5-.8V7.6l3.5-.1c.4 0 .8.3.9.8l.8 4.5 2.2-5.3H12z" fill="#fff" /></svg>
            </div>
            {/* Mastercard */}
            <div className="bg-white rounded-md px-2 py-1 flex items-center justify-center h-8 w-14">
              <svg viewBox="0 0 38 24" className="h-5"><rect width="38" height="24" rx="4" fill="#252525" /><circle cx="15" cy="12" r="7" fill="#EB001B" /><circle cx="23" cy="12" r="7" fill="#F79E1B" /><path d="M19 7.2a7 7 0 000 9.6A7 7 0 0019 7.2z" fill="#FF5F00" /></svg>
            </div>
            {/* Amex */}
            <div className="bg-[#007BC1] rounded-md px-2 py-1 flex items-center justify-center h-8 w-14">
              <span className="text-white font-bold text-[10px] tracking-tight">AMEX</span>
            </div>
            {/* Apple Pay */}
            <div className="bg-black rounded-md px-2 py-1 flex items-center justify-center h-8 w-14">
              <svg viewBox="0 0 38 24" className="h-5 w-auto"><text x="50%" y="16" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif" fontWeight="600"> Pay</text><path d="M10 8c.6-.7 1-1.6.9-2.5-.9.1-2 .6-2.6 1.3-.6.6-1 1.5-.9 2.4.9.1 1.9-.4 2.6-1.2z" fill="white" /><path d="M10.9 9.3c-1.4-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.9-.7-1.5 0-2.8.9-3.6 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.8 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 1.9-1 2.7-2.1.8-1.2 1.1-2.4 1.2-2.5-.1 0-2.2-.9-2.3-3.3 0-2.1 1.7-3.1 1.8-3.1-.9-1.4-2.4-1.9-3.1-2z" fill="white" /></svg>
            </div>
            {/* Google Pay */}
            <div className="bg-white rounded-md px-2 py-1 flex items-center justify-center h-8 w-14 border border-gray-200">
              <svg viewBox="0 0 38 24" className="h-5"><text x="2" y="16" fill="#4285F4" fontSize="8" fontFamily="sans-serif" fontWeight="700">G</text><text x="9" y="16" fill="#EA4335" fontSize="8" fontFamily="sans-serif" fontWeight="700">o</text><text x="15" y="16" fill="#FBBC05" fontSize="8" fontFamily="sans-serif" fontWeight="700">o</text><text x="20" y="16" fill="#4285F4" fontSize="8" fontFamily="sans-serif" fontWeight="700">g</text><text x="26" y="16" fill="#34A853" fontSize="8" fontFamily="sans-serif" fontWeight="700">le</text><text x="4" y="22" fill="#5F6368" fontSize="6" fontFamily="sans-serif"> Pay</text></svg>
            </div>
            {/* Klarna */}
            <div className="bg-[#FFB3C7] rounded-md px-2 py-1 flex items-center justify-center h-8 w-14">
              <span className="text-black font-bold text-[11px]">Klarna</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-2">
            <p>© 2026 SwingMarketGolf. Tous droits réservés.</p>
            <div className="flex gap-4">
              <span>Paiement sécurisé par Stripe</span>
              <span>·</span>
              <span>Mondial Relay · Chronopost · Colissimo</span>
            </div>
          </div>
        </div>
      </div>
    </footer>);

}