import React, { createContext, useContext, useState } from 'react';

const TranslationContext = createContext();

const translations = {
  fr: {
    common: {
      language: "Français",
      currency: "Devise",
      home: "Accueil",
      marketplace: "Marketplace",
      about: "À propos",
      contact: "Contact",
      login: "Connexion",
      signup: "S'inscrire",
      logout: "Déconnexion",
      search: "Rechercher",
      filter: "Filtres",
      sort: "Trier",
      categories: "Catégories",
      condition: "État",
      price: "Prix",
      minPrice: "Prix min",
      maxPrice: "Prix max",
      new: "Neuf",
      likeNew: "Comme neuf",
      goodCondition: "Bon état",
      fair: "État correct",
      buy: "Acheter",
      sell: "Vendre",
      message: "Message",
      favorite: "Favori",
      cart: "Panier",
      checkout: "Passer la commande",
      order: "Commande",
      shipping: "Livraison",
      payment: "Paiement",
      success: "Succès",
      error: "Erreur",
      loading: "Chargement...",
      noResults: "Aucun résultat"
    },
    nav: {
      allListings: "Toutes les annonces",
      golfClubs: "Clubs de golf",
      golfBalls: "Balles de golf",
      carts: "Chariots",
      bags: "Sacs de golf",
      accessories: "Accessoires",
      training: "Entraînement",
      clothing: "Vêtements",
      golfVacations: "Vacances golf",
      dashboard: "Tableau de bord",
      myProfile: "Mon profil",
      myOrders: "Mes commandes",
      myListings: "Mes annonces",
      messages: "Messages"
    },
    home: {
      title: "SwingMarket - Marketplace Golf",
      tagline: "Achetez et vendez du matériel de golf en toute confiance",
      heroTitle: "Bienvenue sur SwingMarket",
      browseListings: "Parcourir les annonces",
      startSelling: "Commencer à vendre",
      hero_tag1: "Marketplace #1 Golf France",
      hero_title1: "Achetez, vendez\nvotre matériel de golf",
      hero_subtitle1: "Rejoignez des milliers de golfeurs qui achètent et vendent en toute confiance.",
      hero_signup: "S'inscrire",
      hero_sell: "Vendre un article",
      hero_tag2: "Clubs & équipements",
      hero_title2: "Des clubs premium\nà prix occasion",
      hero_subtitle2: "Drivers, fers, putters, sacs — tout le matériel golf d'occasion entre passionnés.",
      hero_clubs: "Voir les clubs",
      hero_tag3: "Vacances golf",
      hero_title3: "Partez jouer au soleil\nLocations golf",
      hero_subtitle3: "Villas, maisons et résorts près des plus beaux golfs de France et d'Europe.",
      hero_rentals: "Voir les locations",
      categories_title: "Catégories",
      categories_subtitle: "Trouvez exactement ce que vous cherchez",
      new_listings: "Nouvelles annonces",
      fresh: "Fraîchement ajoutées",
      deals: "Bonnes affaires",
      best_prices: "Les meilleurs prix",
      popular_rentals: "Locations golf populaires",
      near_golf: "Séjours au plus proche des greens",
      per_night: "/ nuit",
      reviews_tag: "Avis vérifiés de la communauté",
      reviews_title: "Ils font confiance à SwingMarket",
      reviews_rating: "4.9/5",
      reviews_count: "+500 avis",
      active_members: "Membres actifs",
      transactions: "Transactions réalisées",
      commission_only: "Commission seulement",
      commission_title: "Barème des commissions",
      commission_subtitle: "Protection acheteur - Les commissions sont payées au moment du paiement",
      price_range: "Tranche de prix",
      commission: "Commission",
      example: "Exemple",
      how_commission: "Comment fonctionne la commission ?",
      trust_secure: "Paiement sécurisé",
      trust_secure_desc: "Vendeur payé après livraison",
      trust_shipping: "Livraison suivie & assurée",
      trust_shipping_desc: "Mondial Relay · Chronopost · Colissimo",
      trust_refund: "Remboursement automatique",
      trust_refund_desc: "Si le vendeur ne valide pas sous 72h",
      trust_support: "Assistance SwingMarket",
      trust_support_desc: "En cas de litige ou de problème",
      trust_commission: "Commission dégressive",
      trust_commission_desc: "Les meilleurs frais du marché"
    },
    marketplace: {
      title: "Marketplace",
      noResults: "Aucun résultat trouvé",
      allListings: "Toutes les annonces"
    },
    footer: {
      copyright: "© 2026 SwingMarket. Tous droits réservés."
    },
    legal: {
      cgv: "Conditions Générales de Vente",
      cgu: "Conditions Générales d'Utilisation",
      confidentialite: "Politique de Confidentialité",
      mentionsLegales: "Mentions Légales",
      faq: "Questions Fréquentes"
    }
  },
  en: {
    common: {
      language: "English",
      currency: "Currency",
      home: "Home",
      marketplace: "Marketplace",
      about: "About",
      contact: "Contact",
      login: "Login",
      signup: "Sign Up",
      logout: "Logout",
      search: "Search",
      filter: "Filters",
      sort: "Sort",
      categories: "Categories",
      condition: "Condition",
      price: "Price",
      minPrice: "Min Price",
      maxPrice: "Max Price",
      new: "New",
      likeNew: "Like New",
      goodCondition: "Good Condition",
      fair: "Fair",
      buy: "Buy",
      sell: "Sell",
      message: "Message",
      favorite: "Favorite",
      cart: "Cart",
      checkout: "Checkout",
      order: "Order",
      shipping: "Shipping",
      payment: "Payment",
      success: "Success",
      error: "Error",
      loading: "Loading...",
      noResults: "No results"
    },
    nav: {
      allListings: "All Listings",
      golfClubs: "Golf Clubs",
      golfBalls: "Golf Balls",
      carts: "Carts",
      bags: "Golf Bags",
      accessories: "Accessories",
      training: "Training",
      clothing: "Clothing",
      golfVacations: "Golf Vacations",
      dashboard: "Dashboard",
      myProfile: "My Profile",
      myOrders: "My Orders",
      myListings: "My Listings",
      messages: "Messages"
    },
    home: {
      title: "SwingMarket - Golf Marketplace",
      tagline: "Buy and sell golf equipment with confidence",
      heroTitle: "Welcome to SwingMarket",
      browseListings: "Browse Listings",
      startSelling: "Start Selling",
      hero_tag1: "Marketplace #1 Golf France",
      hero_title1: "Buy, sell\nyour golf equipment",
      hero_subtitle1: "Join thousands of golfers who buy and sell with confidence.",
      hero_signup: "Sign Up",
      hero_sell: "Sell an item",
      hero_tag2: "Clubs & Equipment",
      hero_title2: "Premium clubs\nat discounted prices",
      hero_subtitle2: "Drivers, irons, putters, bags — all used golf equipment among enthusiasts.",
      hero_clubs: "See clubs",
      hero_tag3: "Golf Vacations",
      hero_title3: "Play in the sun\nGolf rentals",
      hero_subtitle3: "Villas, houses and resorts near the most beautiful golf courses in France and Europe.",
      hero_rentals: "See rentals",
      categories_title: "Categories",
      categories_subtitle: "Find exactly what you're looking for",
      new_listings: "New listings",
      fresh: "Recently added",
      deals: "Great deals",
      best_prices: "Best prices",
      popular_rentals: "Popular golf rentals",
      near_golf: "Stays close to the greens",
      per_night: "/ night",
      reviews_tag: "Verified community reviews",
      reviews_title: "They trust SwingMarket",
      reviews_rating: "4.9/5",
      reviews_count: "+500 reviews",
      active_members: "Active members",
      transactions: "Transactions completed",
      commission_only: "Commission only",
      commission_title: "Commission rates",
      commission_subtitle: "Buyer protection - Commissions are paid at the time of payment",
      price_range: "Price range",
      commission: "Commission",
      example: "Example",
      how_commission: "How does the commission work?",
      trust_secure: "Secure payment",
      trust_secure_desc: "Seller paid after delivery",
      trust_shipping: "Tracked & insured shipping",
      trust_shipping_desc: "Mondial Relay · Chronopost · Colissimo",
      trust_refund: "Automatic refund",
      trust_refund_desc: "If seller doesn't validate within 72h",
      trust_support: "SwingMarket support",
      trust_support_desc: "In case of dispute or problem",
      trust_commission: "Degressive commission",
      trust_commission_desc: "The best fees on the market"
    },
    marketplace: {
      title: "Marketplace",
      noResults: "No results found",
      allListings: "All Listings"
    },
    footer: {
      copyright: "© 2026 SwingMarket. All rights reserved."
    },
    legal: {
      cgv: "Terms and Conditions of Sale",
      cgu: "General Terms of Use",
      confidentialite: "Privacy Policy",
      mentionsLegales: "Legal Notices",
      faq: "Frequently Asked Questions"
    }
  }
};

export function TranslationProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'fr';
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <TranslationContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslate() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslate must be used within TranslationProvider');
  }
  return context;
}

export const AVAILABLE_LANGUAGES = ['fr', 'en'];