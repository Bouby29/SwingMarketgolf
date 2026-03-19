import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traductions
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
      signup: "Inscription",
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
      startSelling: "Commencer à vendre"
    },
    marketplace: {
      title: "Marketplace",
      noResults: "Aucun résultat trouvé",
      allListings: "Toutes les annonces"
    },
    footer: {
      copyright: "© 2026 SwingMarket. Tous droits réservés."
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
      startSelling: "Start Selling"
    },
    marketplace: {
      title: "Marketplace",
      noResults: "No results found",
      allListings: "All Listings"
    },
    footer: {
      copyright: "© 2026 SwingMarket. All rights reserved."
    }
  },
  es: {
    common: {
      language: "Español",
      currency: "Moneda",
      home: "Inicio",
      marketplace: "Marketplace",
      about: "Acerca de",
      contact: "Contacto",
      login: "Iniciar sesión",
      signup: "Registrarse",
      logout: "Cerrar sesión",
      search: "Buscar",
      filter: "Filtros",
      sort: "Ordenar",
      categories: "Categorías",
      condition: "Condición",
      price: "Precio",
      minPrice: "Precio mín",
      maxPrice: "Precio máx",
      new: "Nuevo",
      likeNew: "Como nuevo",
      goodCondition: "Buen estado",
      fair: "Estado regular",
      buy: "Comprar",
      sell: "Vender",
      message: "Mensaje",
      favorite: "Favorito",
      cart: "Carrito",
      checkout: "Pagar",
      order: "Pedido",
      shipping: "Envío",
      payment: "Pago",
      success: "Éxito",
      error: "Error",
      loading: "Cargando...",
      noResults: "Sin resultados"
    },
    nav: {
      allListings: "Todos los anuncios",
      golfClubs: "Palos de golf",
      golfBalls: "Pelotas de golf",
      carts: "Carritos",
      bags: "Bolsas de golf",
      accessories: "Accesorios",
      training: "Entrenamiento",
      clothing: "Ropa",
      golfVacations: "Vacaciones de golf",
      dashboard: "Panel de control",
      myProfile: "Mi perfil",
      myOrders: "Mis pedidos",
      myListings: "Mis anuncios",
      messages: "Mensajes"
    },
    home: {
      title: "SwingMarket - Marketplace de Golf",
      tagline: "Compra y vende equipos de golf con confianza",
      heroTitle: "Bienvenido a SwingMarket",
      browseListings: "Ver anuncios",
      startSelling: "Comenzar a vender"
    },
    marketplace: {
      title: "Marketplace",
      noResults: "Sin resultados encontrados",
      allListings: "Todos los anuncios"
    },
    footer: {
      copyright: "© 2026 SwingMarket. Todos los derechos reservados."
    }
  },
  de: {
    common: {
      language: "Deutsch",
      currency: "Währung",
      home: "Startseite",
      marketplace: "Marketplace",
      about: "Über uns",
      contact: "Kontakt",
      login: "Anmelden",
      signup: "Registrieren",
      logout: "Abmelden",
      search: "Suche",
      filter: "Filter",
      sort: "Sortieren",
      categories: "Kategorien",
      condition: "Zustand",
      price: "Preis",
      minPrice: "Mindestpreis",
      maxPrice: "Höchstpreis",
      new: "Neu",
      likeNew: "Wie neu",
      goodCondition: "Guter Zustand",
      fair: "Befriedigender Zustand",
      buy: "Kaufen",
      sell: "Verkaufen",
      message: "Nachricht",
      favorite: "Favorit",
      cart: "Warenkorb",
      checkout: "Zur Kasse",
      order: "Bestellung",
      shipping: "Versand",
      payment: "Zahlung",
      success: "Erfolg",
      error: "Fehler",
      loading: "Wird geladen...",
      noResults: "Keine Ergebnisse"
    },
    nav: {
      allListings: "Alle Angebote",
      golfClubs: "Golfschläger",
      golfBalls: "Golfbälle",
      carts: "Golfwagen",
      bags: "Golftaschen",
      accessories: "Zubehör",
      training: "Training",
      clothing: "Kleidung",
      golfVacations: "Golfferien",
      dashboard: "Dashboard",
      myProfile: "Mein Profil",
      myOrders: "Meine Bestellungen",
      myListings: "Meine Angebote",
      messages: "Nachrichten"
    },
    home: {
      title: "SwingMarket - Golf-Marktplatz",
      tagline: "Kaufen und verkaufen Sie Golfausrüstung mit Zuversicht",
      heroTitle: "Willkommen bei SwingMarket",
      browseListings: "Angebote ansehen",
      startSelling: "Verkaufen beginnen"
    },
    marketplace: {
      title: "Marketplace",
      noResults: "Keine Ergebnisse gefunden",
      allListings: "Alle Angebote"
    },
    footer: {
      copyright: "© 2026 SwingMarket. Alle Rechte vorbehalten."
    }
  },
  it: {
    common: {
      language: "Italiano",
      currency: "Valuta",
      home: "Home",
      marketplace: "Marketplace",
      about: "Chi siamo",
      contact: "Contatti",
      login: "Accedi",
      signup: "Registrati",
      logout: "Esci",
      search: "Cerca",
      filter: "Filtri",
      sort: "Ordina",
      categories: "Categorie",
      condition: "Condizione",
      price: "Prezzo",
      minPrice: "Prezzo minimo",
      maxPrice: "Prezzo massimo",
      new: "Nuovo",
      likeNew: "Come nuovo",
      goodCondition: "Buone condizioni",
      fair: "Condizioni discrete",
      buy: "Acquista",
      sell: "Vendi",
      message: "Messaggio",
      favorite: "Preferito",
      cart: "Carrello",
      checkout: "Procedi all'acquisto",
      order: "Ordine",
      shipping: "Spedizione",
      payment: "Pagamento",
      success: "Successo",
      error: "Errore",
      loading: "Caricamento...",
      noResults: "Nessun risultato"
    },
    nav: {
      allListings: "Tutti gli annunci",
      golfClubs: "Mazze da golf",
      golfBalls: "Palline da golf",
      carts: "Carrelli da golf",
      bags: "Borse da golf",
      accessories: "Accessori",
      training: "Allenamento",
      clothing: "Abbigliamento",
      golfVacations: "Vacanze golf",
      dashboard: "Bacheca",
      myProfile: "Il mio profilo",
      myOrders: "I miei ordini",
      myListings: "I miei annunci",
      messages: "Messaggi"
    },
    home: {
      title: "SwingMarket - Marketplace Golf",
      tagline: "Compra e vendi attrezzature da golf con fiducia",
      heroTitle: "Benvenuto in SwingMarket",
      browseListings: "Visualizza annunci",
      startSelling: "Inizia a vendere"
    },
    marketplace: {
      title: "Marketplace",
      noResults: "Nessun risultato trovato",
      allListings: "Tutti gli annunci"
    },
    footer: {
      copyright: "© 2026 SwingMarket. Tutti i diritti riservati."
    }
  },
  nl: {
    common: {
      language: "Nederlands",
      currency: "Valuta",
      home: "Startpagina",
      marketplace: "Marketplace",
      about: "Over ons",
      contact: "Contact",
      login: "Inloggen",
      signup: "Registreren",
      logout: "Uitloggen",
      search: "Zoeken",
      filter: "Filters",
      sort: "Sorteren",
      categories: "Categorieën",
      condition: "Toestand",
      price: "Prijs",
      minPrice: "Minimumprijs",
      maxPrice: "Maximumprijs",
      new: "Nieuw",
      likeNew: "Als nieuw",
      goodCondition: "Goede toestand",
      fair: "Redelijke toestand",
      buy: "Kopen",
      sell: "Verkopen",
      message: "Bericht",
      favorite: "Favoriet",
      cart: "Winkelwagen",
      checkout: "Afrekenen",
      order: "Bestelling",
      shipping: "Verzending",
      payment: "Betaling",
      success: "Succes",
      error: "Fout",
      loading: "Laden...",
      noResults: "Geen resultaten"
    },
    nav: {
      allListings: "Alle aanbiedingen",
      golfClubs: "Golfclubs",
      golfBalls: "Golfballen",
      carts: "Golfwagens",
      bags: "Golftassen",
      accessories: "Accessoires",
      training: "Training",
      clothing: "Kleding",
      golfVacations: "Golfvakanties",
      dashboard: "Dashboard",
      myProfile: "Mijn profiel",
      myOrders: "Mijn bestellingen",
      myListings: "Mijn aanbiedingen",
      messages: "Berichten"
    },
    home: {
      title: "SwingMarket - Golfmarktplaats",
      tagline: "Koop en verkoop golfuitrusting met vertrouwen",
      heroTitle: "Welkom bij SwingMarket",
      browseListings: "Aanbiedingen bekijken",
      startSelling: "Beginnen met verkopen"
    },
    marketplace: {
      title: "Marketplace",
      noResults: "Geen resultaten gevonden",
      allListings: "Alle aanbiedingen"
    },
    footer: {
      copyright: "© 2026 SwingMarket. Alle rechten voorbehouden."
    }
  }
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: translations,
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(i18n.language || 'fr');

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <I18nContext.Provider value={{ language, changeLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useLanguage must be used within I18nProvider');
  }
  return context;
}

export default i18n;