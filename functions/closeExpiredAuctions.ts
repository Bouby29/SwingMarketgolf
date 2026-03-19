import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const allActive = await base44.asServiceRole.entities.Product.filter({ sale_type: 'auction', status: 'active' });

    const now = new Date();
    const expired = allActive.filter(p => p.auction_end_date && new Date(p.auction_end_date) < now);

    let closedCount = 0;

    for (const product of expired) {
      const winningBids = await base44.asServiceRole.entities.Bid.filter({ product_id: product.id, is_winning: true });
      const winner = winningBids[0];

      if (winner) {
        // Enchère vendue - créer une commande automatiquement
        await base44.asServiceRole.entities.Product.update(product.id, {
          auction_winner_id: winner.bidder_id,
          auction_winner_name: winner.bidder_name,
          status: 'sold',
        });

        // Créer la commande pour le gagnant
        const commission = product.price * 0.08; // 8% commission
        const order = await base44.asServiceRole.entities.Order.create({
          product_id: product.id,
          product_title: product.title,
          buyer_id: winner.bidder_id,
          buyer_name: winner.bidder_name,
          seller_id: product.seller_id,
          seller_name: product.seller_name,
          price: winner.amount,
          commission,
          total_paid: winner.amount + commission,
          shipping_method: 'colissimo',
          shipping_cost: 0,
          status: 'pending_validation',
        });

        // Envoyer les emails
        const sendEmails = async () => {
          try {
            const winnerUsers = await base44.asServiceRole.entities.User.filter({ id: winner.bidder_id });
            const winnerUser = winnerUsers[0];
            const sellers = await base44.asServiceRole.entities.User.filter({ id: product.seller_id });
            const seller = sellers[0];

            if (winnerUser?.email) {
              await base44.asServiceRole.integrations.Core.SendEmail({
                to: winnerUser.email,
                subject: `🏆 Vous avez remporté l'enchère "${product.title}" !`,
                body: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1B5E20;">Félicitations ! 🎉</h2>
                    <p>Bonjour <strong>${winnerUser.full_name || 'Golfeur'}</strong>,</p>
                    <p>Vous avez remporté l'enchère sur <strong>"${product.title}"</strong> avec une offre de <strong>${winner.amount.toFixed(2)} €</strong>.</p>
                    <div style="background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="margin-top: 0; color: #1B5E20;">Prochaines étapes</h3>
                      <ol style="line-height: 1.8;">
                        <li>Le vendeur prépare votre commande</li>
                        <li>Il vous envoie le colis sous 48h</li>
                        <li>Vous recevez votre équipement</li>
                      </ol>
                    </div>
                    <p style="text-align: center;">
                      <a href="${Deno.env.get("BASE_URL") || "https://swingmarket.com"}/Dashboard?view=orders" 
                         style="display: inline-block; background: #1B5E20; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                        Voir ma commande
                      </a>
                    </p>
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">Commande ID : ${order.id}</p>
                  </div>
                `
              });
            }

            if (seller?.email) {
              await base44.asServiceRole.integrations.Core.SendEmail({
                to: seller.email,
                subject: `✅ Enchère vendue : "${product.title}"`,
                body: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1B5E20;">Enchère terminée - Article vendu ! 🎉</h2>
                    <p>Bonjour <strong>${seller.full_name || 'Vendeur'}</strong>,</p>
                    <p>Excellente nouvelle ! Votre enchère sur <strong>"${product.title}"</strong> est terminée.</p>
                    <div style="background: #FFF9E6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #C5A028;">
                      <p style="margin: 0;"><strong>🏆 Gagnant :</strong> ${winner.bidder_name}</p>
                      <p style="margin: 10px 0 0 0;"><strong>💰 Prix de vente :</strong> ${winner.amount.toFixed(2)} €</p>
                    </div>
                    <div style="background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="margin-top: 0; color: #1B5E20;">Action requise</h3>
                      <p style="margin: 0;">Préparez la commande et expédiez-la sous <strong>48 heures</strong> pour garantir la satisfaction de votre acheteur.</p>
                    </div>
                    <p style="text-align: center;">
                      <a href="${Deno.env.get("BASE_URL") || "https://swingmarket.com"}/Dashboard?view=sales" 
                         style="display: inline-block; background: #1B5E20; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                        Préparer la commande
                      </a>
                    </p>
                  </div>
                `
              });
            }
          } catch (e) {
            console.log("Email error:", e.message);
          }
        };
        sendEmails();

      } else {
        // Enchère non vendue - remettre en vente ou archiver
        await base44.asServiceRole.entities.Product.update(product.id, { status: 'inactive' });

        // Email au vendeur pour proposer de relancer
        const sendNoSaleEmail = async () => {
          try {
            const sellers = await base44.asServiceRole.entities.User.filter({ id: product.seller_id });
            const seller = sellers[0];

            if (seller?.email) {
              await base44.asServiceRole.integrations.Core.SendEmail({
                to: seller.email,
                subject: `❌ Enchère non vendue : "${product.title}"`,
                body: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #C5A028;">Enchère terminée sans vente</h2>
                    <p>Bonjour <strong>${seller.full_name || 'Vendeur'}</strong>,</p>
                    <p>L'enchère sur <strong>"${product.title}"</strong> est terminée mais aucune offre n'a été reçue.</p>
                    <div style="background: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF9800;">
                      <p style="margin: 0; color: #E65100;"><strong>Aucune enchère placée</strong></p>
                      <p style="margin: 10px 0 0 0; font-size: 14px;">Prix de départ : ${product.auction_start_price?.toFixed(2) || '0.00'} €</p>
                    </div>
                    <div style="background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="margin-top: 0; color: #1B5E20;">Que faire maintenant ?</h3>
                      <p style="margin: 0;">Nous vous suggérons de :</p>
                      <ul style="margin-top: 10px; line-height: 1.8;">
                        <li>Baisser le prix de départ</li>
                        <li>Passer en vente directe</li>
                        <li>Améliorer les photos et la description</li>
                      </ul>
                    </div>
                    <p style="text-align: center;">
                      <a href="${Deno.env.get("BASE_URL") || "https://swingmarket.com"}/Dashboard?view=listings" 
                         style="display: inline-block; background: #1B5E20; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                        Relancer l'annonce
                      </a>
                    </p>
                  </div>
                `
              });
            }
          } catch (e) {
            console.log("Email error:", e.message);
          }
        };
        sendNoSaleEmail();
      }

      closedCount++;
    }

    return Response.json({ success: true, closed: closedCount, checked: allActive.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});