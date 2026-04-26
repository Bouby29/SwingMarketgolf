import { supabase } from "./supabase";

/**
 * Calcule les frais de livraison selon le mode et le prix de l'article.
 *
 * Lit la table shipping_rates et retourne le premier tarif actif
 * qui matche la fourchette de prix.
 *
 * @param {string} deliveryMode - 'domicile' | 'relay' | 'main_propre'
 * @param {number} articlePrice - prix de l'article en euros
 * @returns {Promise<{shipping_price: number, carrier_name: string|null}>}
 *
 * TODO ÉVOLUTION :
 * - Ajouter package_size pour les 5 tailles de colis
 *   (small/medium/large/xlarge/bulky)
 * - Ajouter country_code pour gérer les zones (FR/BE/EU/INTL)
 * - Quand Sendcloud est connecté : essayer Sendcloud d'abord,
 *   puis fallback sur cette table
 */
export async function calculateShipping(deliveryMode, articlePrice) {
  const fallback = { shipping_price: 0, carrier_name: null };

  // Validation des entrées : si elles sont invalides, on évite la
  // requête réseau et on retourne directement le fallback.
  if (!deliveryMode || typeof deliveryMode !== "string") {
    console.warn(
      `Aucun tarif livraison trouvé pour mode=${deliveryMode}, price=${articlePrice}`
    );
    return fallback;
  }

  const price = Number(articlePrice);
  if (!Number.isFinite(price) || price < 0) {
    console.warn(
      `Aucun tarif livraison trouvé pour mode=${deliveryMode}, price=${articlePrice}`
    );
    return fallback;
  }

  try {
    // Sélection du tarif le plus spécifique :
    // - is_active = true
    // - price_min IS NULL OU price_min <= articlePrice
    // - price_max IS NULL OU price_max >= articlePrice
    // ORDER BY price_min DESC NULLS LAST : les règles avec un
    // price_min défini (plus spécifiques) passent avant la règle
    // par défaut (price_min NULL).
    const { data, error } = await supabase
      .from("shipping_rates")
      .select("shipping_price, carrier_name")
      .eq("delivery_mode", deliveryMode)
      .eq("is_active", true)
      .or(`price_min.is.null,price_min.lte.${price}`)
      .or(`price_max.is.null,price_max.gte.${price}`)
      .order("price_min", { ascending: false, nullsFirst: false })
      .limit(1);

    if (error) {
      console.error("Erreur shipping_rates:", error);
      return fallback;
    }

    if (!data || data.length === 0) {
      console.warn(
        `Aucun tarif livraison trouvé pour mode=${deliveryMode}, price=${price}`
      );
      return fallback;
    }

    const row = data[0];
    return {
      shipping_price: Number(row.shipping_price) || 0,
      carrier_name: row.carrier_name ?? null,
    };
  } catch (err) {
    console.error("Erreur shipping_rates:", err);
    return fallback;
  }
}
