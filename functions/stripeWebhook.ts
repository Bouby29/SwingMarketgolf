import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event;
    try {
        event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    try {
        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;
            const { productId, userId } = paymentIntent.metadata;

            // Find orders linked to this payment intent
            const orders = await base44.asServiceRole.entities.Order.filter({
                payment_intent_id: paymentIntent.id
            });

            if (orders.length > 0) {
                const order = orders[0];
                if (order.status === "pending_validation") {
                    await base44.asServiceRole.entities.Order.update(order.id, {
                        status: "pending_validation" // already set, just confirm payment is captured
                    });
                }
            }

            console.log(`Payment succeeded: ${paymentIntent.id}`);
        }

        if (event.type === "payment_intent.payment_failed") {
            const paymentIntent = event.data.object;
            console.log(`Payment failed: ${paymentIntent.id}`);

            const orders = await base44.asServiceRole.entities.Order.filter({
                payment_intent_id: paymentIntent.id
            });

            for (const order of orders) {
                // Re-activate the product if payment failed
                await base44.asServiceRole.entities.Product.update(order.product_id, {
                    status: "active"
                });
                await base44.asServiceRole.entities.Order.update(order.id, {
                    status: "refunded"
                });
            }
        }

        if (event.type === "account.updated") {
            // Stripe Connect account status changed (KYC verified, etc.)
            const account = event.data.object;
            const users = await base44.asServiceRole.entities.User.filter({
                stripe_account_id: account.id
            });

            if (users.length > 0) {
                const newStatus = account.details_submitted && account.charges_enabled ? "verified" : "pending";
                await base44.asServiceRole.entities.User.update(users[0].id, {
                    stripe_kyc_status: newStatus
                });
                console.log(`Account ${account.id} status updated to ${newStatus}`);
            }
        }

        return Response.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});