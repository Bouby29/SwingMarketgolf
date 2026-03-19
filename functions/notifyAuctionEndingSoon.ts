import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Notifie les enchérisseurs et vendeurs quand une enchère se termine dans moins de 2 heures
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const allActive = await base44.asServiceRole.entities.Product.filter({ sale_type: 'auction', status: 'active' });

    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    // Enchères qui se terminent dans 1-2h (pour notifier une seule fois environ)
    const endingSoon = allActive.filter(p => {
      if (!p.auction_end_date) return false;
      const end = new Date(p.auction_end_date);
      return end > oneHourLater && end <= twoHoursLater;
    });

    let notified = 0;

    for (const product of endingSoon) {
      const endDate = new Date(product.auction_end_date);
      const minutesLeft = Math.round((endDate - now) / 60000);

      // Notifier le vendeur
      try {
        const sellers = await base44.asServiceRole.entities.User.filter({ id: product.seller_id });
        const seller = sellers[0];
        if (seller?.email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: seller.email,
            subject: `⏰ Votre enchère "${product.title}" se termine dans ${minutesLeft} minutes !`,
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #C5A028;">⏳ Fin imminente de votre enchère</h2>
                <p>Bonjour <strong>${seller.full_name || 'Vendeur'}</strong>,</p>
                <p>Votre enchère sur <strong>"${product.title}"</strong> se termine dans <strong>${minutesLeft} minutes</strong>.</p>
                <div style="background: #FFF9E6; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #C5A028;">
                  <p style="margin: 0;"><strong>Meilleure offre actuelle :</strong> ${(product.auction_current_price || product.auction_start_price || 0).toFixed(2)} €</p>
                  <p style="margin: 8px 0 0 0;"><strong>Nombre d'enchères :</strong> ${product.auction_bids_count || 0}</p>
                </div>
                <p style="text-align: center;">
                  <a href="https://swingmarketgolf.com/ProductDetail?id=${product.id}" 
                     style="display: inline-block; background: #1B5E20; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                    Voir l'enchère →
                  </a>
                </p>
                <p style="color: #666; font-size: 12px;">— L'équipe SwingMarket</p>
              </div>
            `
          });
        }
      } catch (e) {
        console.log("Email vendeur error:", e.message);
      }

      // Notifier tous les enchérisseurs actifs (non-gagnants aussi)
      try {
        const bids = await base44.asServiceRole.entities.Bid.filter({ product_id: product.id });
        const uniqueBidderIds = [...new Set(bids.map(b => b.bidder_id))];

        for (const bidderId of uniqueBidderIds) {
          const bidderUsers = await base44.asServiceRole.entities.User.filter({ id: bidderId });
          const bidder = bidderUsers[0];
          if (!bidder?.email) continue;

          const isWinning = bids.some(b => b.bidder_id === bidderId && b.is_winning);

          await base44.asServiceRole.integrations.Core.SendEmail({
            to: bidder.email,
            subject: `⏰ L'enchère "${product.title}" se termine dans ${minutesLeft} minutes !`,
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: ${isWinning ? '#1B5E20' : '#C5A028'};">
                  ${isWinning ? '🏆 Vous êtes en tête !' : '⚡ Dernière chance de surenchérir !'}
                </h2>
                <p>Bonjour <strong>${bidder.full_name || 'Golfeur'}</strong>,</p>
                <p>L'enchère sur <strong>"${product.title}"</strong> se termine dans <strong>${minutesLeft} minutes</strong>.</p>
                <div style="background: ${isWinning ? '#E8F5E9' : '#FFF3E0'}; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <p style="margin: 0;"><strong>Meilleure offre actuelle :</strong> ${(product.auction_current_price || product.auction_start_price || 0).toFixed(2)} €</p>
                  ${!isWinning ? '<p style="margin: 8px 0 0 0; color: #E65100;">Votre enchère n\'est plus en tête — c\'est le moment d\'enchérir !</p>' : ''}
                </div>
                <p style="text-align: center;">
                  <a href="https://swingmarketgolf.com/ProductDetail?id=${product.id}" 
                     style="display: inline-block; background: #1B5E20; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                    ${isWinning ? 'Voir mon enchère' : 'Surenchérir maintenant'} →
                  </a>
                </p>
                <p style="color: #666; font-size: 12px;">— L'équipe SwingMarket</p>
              </div>
            `
          });
        }
      } catch (e) {
        console.log("Email enchérisseurs error:", e.message);
      }

      notified++;
    }

    return Response.json({ success: true, notified, checked: allActive.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});