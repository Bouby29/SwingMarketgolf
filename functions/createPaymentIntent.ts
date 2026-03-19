import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { amount, productId, shipping } = await req.json();

        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'eur',
            metadata: {
                productId,
                userId: user.id,
                shipping,
                userEmail: user.email
            },
            automatic_payment_methods: { enabled: true }
        });

        return Response.json({
            clientSecret: paymentIntent.client_secret,
            publishableKey: Deno.env.get("STRIPE_PUBLISHABLE_KEY")
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});