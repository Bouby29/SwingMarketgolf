/**
 * Calcule la commission dynamique en fonction du prix du produit
 * @param {number} price - Prix du produit en euros
 * @returns {number} Commission en euros
 */
export function calculateCommission(price) {
  if (price < 100) {
    return price * 0.10 + 0.70; // 10% + 0,70€
  } else if (price < 300) {
    return price * 0.08 + 0.70; // 8% + 0,70€
  } else if (price < 1000) {
    return price * 0.06 + 0.70; // 6% + 0,70€
  } else {
    return price * 0.04 + 0.70; // 4% + 0,70€
  }
}

/**
 * Retourne le taux de commission en fonction du prix
 * @param {number} price - Prix du produit en euros
 * @returns {string} Description du palier (ex: "10% + 0,70€")
 */
export function getCommissionTier(price) {
  if (price < 100) {
    return "10% + 0,70€";
  } else if (price < 300) {
    return "8% + 0,70€";
  } else if (price < 1000) {
    return "6% + 0,70€";
  } else {
    return "4% + 0,70€";
  }
}