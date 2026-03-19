import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Scheduled automation — service role only
        const deliveredOrders = await base44.asServiceRole.entities.Order.filter({ status: 'delivered' });

        const now = Date.now();
        const DELAY_MS = 48 * 60 * 60 * 1000; // 48 heures

        let released = 0;
        for (const order of deliveredOrders) {
            if (!order.delivered_at) continue;
            const deadline = new Date(order.delivered_at).getTime() + DELAY_MS;
            if (now < deadline) continue;

            // Get seller stripe account
            const sellers = await base44.asServiceRole.entities.User.filter({ id: order.seller_id });
            const seller = sellers[0];

            const transferAmount = Math.round(order.price * 100);
            let transferId = null;

            if (seller?.stripe_account_id) {
                try {
                    const account = await stripe.accounts.retrieve(seller.stripe_account_id);
                    if (account.payouts_enabled) {
                        const transfer = await stripe.transfers.create({
                            amount: transferAmount,
                            currency: 'eur',
                            destination: seller.stripe_account_id,
                            metadata: {
                                orderId: order.id,
                                productTitle: order.product_title || '',
                                auto: 'true',
                            },
                        });
                        transferId = transfer.id;
                    }
                } catch (e) {
                    console.error(`Transfer failed for order ${order.id}:`, e.message);
                    continue;
                }
            }

            await base44.asServiceRole.entities.Order.update(order.id, {
                status: 'completed',
                stripe_transfer_id: transferId,
                funds_released_at: new Date().toISOString(),
            });

            released++;
        }

        return Response.json({ success: true, released });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});