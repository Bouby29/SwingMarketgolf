import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        let accountId = user.stripe_account_id;

        // Create account if doesn't exist
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'custom',
                country: 'FR',
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                business_type: 'individual',
                tos_acceptance: { service_agreement: 'full' },
            });
            accountId = account.id;
            await base44.auth.updateMe({ 
                stripe_account_id: accountId, 
                stripe_kyc_status: 'pending' 
            });
        }

        // Create AccountSession
        const accountSession = await stripe.accountSessions.create({
            account: accountId,
            components: {
                account_onboarding: {
                    enabled: true,
                    features: {
                        external_account_collection: true,
                    },
                },
            },
        });

        return Response.json({ client_secret: accountSession.client_secret });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});