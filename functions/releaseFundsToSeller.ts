import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { orderId } = await req.json();
        if (!orderId) return Response.json({ error: 'orderId requis' }, { status: 400 });

        // Get order (user must be the buyer or an admin)
        const orders = await base44.entities.Order.filter({ id: orderId });
        const order = orders[0];
        if (!order) return Response.json({ error: 'Commande introuvable' }, { status: 404 });

        if (order.buyer_id !== user.id && user.role !== 'admin') {
            return Response.json({ error: 'Accès refusé' }, { status: 403 });
        }

        if (order.status === 'completed') {
            return Response.json({ success: true, message: 'Fonds déjà libérés' });
        }

        if (!['delivered'].includes(order.status)) {
            return Response.json({ error: 'La commande doit être en statut livré' }, { status: 400 });
        }

        // Get seller stripe account
        const sellers = await base44.asServiceRole.entities.User.filter({ id: order.seller_id });
        const seller = sellers[0];

        // Transfer to seller (seller gets product price, platform keeps commission)
        const transferAmount = Math.round(order.price * 100); // en centimes
        let transferId = null;

        if (seller?.stripe_account_id) {
            const sellerAccount = await stripe.accounts.retrieve(seller.stripe_account_id);
            if (!sellerAccount.payouts_enabled) {
                return Response.json({ error: 'Le compte vendeur n\'est pas encore activé pour les virements. Le vendeur doit compléter sa vérification.' }, { status: 400 });
            }
            const transfer = await stripe.transfers.create({
                amount: transferAmount,
                currency: 'eur',
                destination: seller.stripe_account_id,
                metadata: {
                    orderId: order.id,
                    productTitle: order.product_title || '',
                    buyerName: order.buyer_name || '',
                },
            });
            transferId = transfer.id;
        }
        // If seller has no stripe account, funds stay on platform (admin handles manually)

        // Update order
        await base44.asServiceRole.entities.Order.update(order.id, {
            status: 'completed',
            stripe_transfer_id: transferId,
            funds_released_at: new Date().toISOString(),
        });

        return Response.json({ success: true, transferId });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});