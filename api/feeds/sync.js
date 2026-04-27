/**
 * POST /api/feeds/sync
 * ────────────────────────────────────────────────────────
 * Lance la sync d'un flux donné (manuel, depuis l'admin).
 *  - body : { feed_id }
 *  - Réponse : { ok: true, run_id, status, stats }
 */

const { getSupabase, runFeedSync } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const { feed_id } = req.body || {};
    if (!feed_id) return res.status(400).json({ ok: false, error: "feed_id manquant" });

    const supabase = getSupabase();
    const { data: feed, error } = await supabase
      .from("seller_feeds")
      .select("*")
      .eq("id", feed_id)
      .maybeSingle();
    if (error || !feed) return res.status(404).json({ ok: false, error: "Flux introuvable" });
    if (feed.source_type !== "remote_url") {
      return res.status(400).json({ ok: false, error: "Ce flux n'est pas une URL distante (sync auto non applicable)." });
    }
    if (!feed.source_url) return res.status(400).json({ ok: false, error: "URL source manquante sur ce flux." });

    const result = await runFeedSync(feed);
    return res.status(200).json({ ok: true, ...result });
  } catch (err) {
    console.error("[/api/feeds/sync]", err);
    return res.status(500).json({ ok: false, error: err.message || "Erreur sync" });
  }
};
