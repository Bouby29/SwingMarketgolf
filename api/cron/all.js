/**
 * GET /api/cron/all
 * ─────────────────────────────────────────────────────────
 * Endpoint UNIQUE déclenché par le cron Vercel (toutes les heures).
 * Vercel Free n'autorise qu'un seul cron — on regroupe ici tous
 * les jobs périodiques :
 *   1. Libération des fonds Stripe (release-funds)
 *   2. Sync des flux distants pros (feeds dûs selon sync_frequency)
 *
 * Sécurité : Vercel ajoute automatiquement
 *   Authorization: Bearer <CRON_SECRET>
 * sur tous les appels de cron quand la variable est définie.
 * Voir https://vercel.com/docs/cron-jobs/manage-cron-jobs
 */

const { pickFeedsToRun, runFeedSync } = require("../feeds/_lib");

module.exports = async (req, res) => {
  // ── Authentification : on n'accepte que le cron Vercel ou un appel
  // ── manuel avec le bon secret.
  const auth = req.headers["authorization"] || "";
  const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : null;
  if (expected && auth !== expected) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  const startedAt = Date.now();
  const results = {
    release_funds: null,
    feeds: { processed: 0, runs: [] },
    duration_ms: 0,
  };

  // ─────────────────────────────────────────
  // 1) Release-funds (Stripe escrow)
  // ─────────────────────────────────────────
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT || 3000}`;
    const r = await fetch(`${baseUrl}/api/release-funds`, {
      method: "POST",
      headers: { "x-internal-cron": "1" },
    });
    results.release_funds = { ok: r.ok, status: r.status };
  } catch (err) {
    console.error("[cron] release-funds error:", err);
    results.release_funds = { ok: false, error: err.message || String(err) };
  }

  // ─────────────────────────────────────────
  // 2) Sync des flux distants
  // ─────────────────────────────────────────
  try {
    const feeds = await pickFeedsToRun();
    for (const feed of feeds) {
      try {
        const out = await runFeedSync(feed);
        results.feeds.runs.push({
          feed_id: feed.id,
          name: feed.name,
          status: out.status,
          stats: out.stats,
        });
      } catch (err) {
        results.feeds.runs.push({
          feed_id: feed.id,
          name: feed.name,
          status: "error",
          error: err.message || String(err),
        });
      }
    }
    results.feeds.processed = feeds.length;
  } catch (err) {
    console.error("[cron] feeds error:", err);
    results.feeds.error = err.message || String(err);
  }

  results.duration_ms = Date.now() - startedAt;
  return res.status(200).json({ ok: true, ...results });
};
