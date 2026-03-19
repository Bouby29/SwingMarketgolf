import { useEffect } from "react";

function setMeta(name, content, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function SEOHead({ title, description, image, url, type = "website", structuredData }) {
  const fullTitle = title ? `${title} | SwingMarket Golf` : "SwingMarket Golf - Marketplace du matériel de golf d'occasion";
  const fullDescription = description || "Achetez et vendez votre matériel de golf d'occasion. Clubs, balles, sacs, chariots... Paiement sécurisé, livraison partout en France.";
  const fullImage = image || "https://swingmarketgolf.com/og-image.jpg";
  const fullUrl = url || (typeof window !== "undefined" ? window.location.href : "https://swingmarketgolf.com");

  useEffect(() => {
    document.title = fullTitle;

    setMeta("description", fullDescription);
    setMeta("keywords", "golf occasion, matériel golf, clubs golf, balles golf, vente golf, achat golf, SwingMarket");
    setMeta("robots", "index, follow");
    setMeta("author", "SwingMarket Golf");

    // Open Graph
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", fullDescription, true);
    setMeta("og:type", type, true);
    setMeta("og:url", fullUrl, true);
    setMeta("og:image", fullImage, true);
    setMeta("og:site_name", "SwingMarket Golf", true);
    setMeta("og:locale", "fr_FR", true);

    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", fullDescription);
    setMeta("twitter:image", fullImage);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", fullUrl);

    // Structured data JSON-LD
    let script = document.querySelector("#structured-data");
    if (structuredData) {
      if (!script) {
        script = document.createElement("script");
        script.id = "structured-data";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    } else if (script) {
      script.remove();
    }
  }, [fullTitle, fullDescription, fullImage, fullUrl, type, structuredData]);

  return null;
}