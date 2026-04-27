/**
 * POST /api/feeds/test-url
 * ────────────────────────────────────────────────────────
 * Teste une URL distante depuis le wizard admin :
 *  - récupère le contenu (HTTP)
 *  - détecte le format (csv / xml / json) et la plateforme
 *  - retourne un preview (100 lignes par défaut) pour le mapping
 *
 * Body : { url: string, preview?: boolean }
 * Réponse OK : { ok: true, format, platform, totalRows, columns, preview: [] }
 * Réponse KO : { ok: false, error: string }
 */

const { fetchAndParseFeed } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const { url, preview = true } = req.body || {};
    if (!url || typeof url !== "string") {
      return res.status(400).json({ ok: false, error: "URL manquante." });
    }

    const { format, platform, rows, columns } = await fetchAndParseFeed(url);

    return res.status(200).json({
      ok: true,
      format,
      platform,
      totalRows: rows.length,
      columns,
      preview: preview ? rows.slice(0, 100) : rows,
    });
  } catch (err) {
    console.error("[/api/feeds/test-url]", err);
    return res.status(200).json({
      ok: false,
      error: err.message || "Erreur lors du test de l'URL",
    });
  }
};
