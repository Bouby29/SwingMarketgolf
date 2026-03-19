import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non authentifié' }, { status: 401 });

    const { product_id, amount } = await req.json();
    if (!product_id || amount === undefined) return Response.json({ error: 'Paramètres manquants' }, { status: 400 });

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return Response.json({ error: 'Montant invalide' }, { status: 400 });

    // Get product
    const products = await base44.asServiceRole.entities.Product.filter({ id: product_id });
    const product = products[0];
    if (!product) return Response.json({ error: 'Produit introuvable' }, { status: 404 });
    if (product.sale_type !== 'auction') return Response.json({ error: "Ce produit n'est pas une enchère" }, { status: 400 });
    if (product.status !== 'active') return Response.json({ error: "Ce produit n'est plus disponible" }, { status: 400 });
    if (new Date(product.auction_end_date) < new Date()) return Response.json({ error: "L'enchère est terminée" }, { status: 400 });
    if (product.seller_id === user.id) return Response.json({ error: "Vous ne pouvez pas enchérir sur votre propre annonce" }, { status: 400 });

    const bidsCount = product.auction_bids_count || 0;
    const currentPrice = product.auction_current_price || product.auction_start_price;
    const minBid = bidsCount === 0 ? product.auction_start_price : currentPrice + 0.01;

    if (amountNum < minBid - 0.001) {
      return Response.json({ error: `L'enchère minimum est de ${minBid.toFixed(2)} €` }, { status: 400 });
    }

    // Mark previous winning bid as non-winning
    const prevWinningBids = await base44.asServiceRole.entities.Bid.filter({ product_id, is_winning: true });
    const prevWinner = prevWinningBids[0];
    if (prevWinner) {
      await base44.asServiceRole.entities.Bid.update(prevWinner.id, { is_winning: false });
    }

    // Create new bid
    const newBid = await base44.asServiceRole.entities.Bid.create({
      product_id,
      bidder_id: user.id,
      bidder_name: user.full_name || user.email,
      amount: amountNum,
      is_winning: true,
    });

    // Update product current price
    await base44.asServiceRole.entities.Product.update(product_id, {
      auction_current_price: amountNum,
      auction_bids_count: bidsCount + 1,
      price: amountNum,
    });

    // Send email notifications (non-blocking)
    try {
      // Notify seller
      const sellers = await base44.asServiceRole.entities.User.filter({ id: product.seller_id });
      const seller = sellers[0];
      if (seller?.email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: seller.email,
          subject: `⚡ Nouvelle enchère sur "${product.title}"`,
          body: `<p>Bonjour ${seller.full_name || 'Vendeur'},</p>
            <p>Une nouvelle enchère de <strong>${amountNum.toFixed(2)} €</strong> a été placée sur votre annonce <strong>"${product.title}"</strong>.</p>
            <p>Enchérisseur : ${user.full_name || user.email}</p>
            <p><a href="https://swingmarketgolf.com/ProductDetail?id=${product_id}" style="color:#1B5E20">Voir l'annonce →</a></p>
            <p>— L'équipe SwingMarket</p>`
        });
      }

      // Notify previous highest bidder if different from current
      if (prevWinner && prevWinner.bidder_id !== user.id) {
        const prevBidderUsers = await base44.asServiceRole.entities.User.filter({ id: prevWinner.bidder_id });
        const prevBidderUser = prevBidderUsers[0];
        if (prevBidderUser?.email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: prevBidderUser.email,
            subject: `⚡ Vous avez été surenchéri sur "${product.title}"`,
            body: `<p>Bonjour ${prevBidderUser.full_name || ''},</p>
              <p>Votre enchère sur <strong>"${product.title}"</strong> a été dépassée.</p>
              <p>Nouvelle meilleure offre : <strong>${amountNum.toFixed(2)} €</strong></p>
              <p><a href="https://swingmarketgolf.com/ProductDetail?id=${product_id}" style="color:#1B5E20">Enchérir à nouveau →</a></p>
              <p>— L'équipe SwingMarket</p>`
          });
        }
      }
    } catch (emailError) {
      console.log("Email notification error (non-blocking):", emailError.message);
    }

    return Response.json({ success: true, bid: newBid });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});