import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { action } = await req.json();

        // Create Stripe Express account if not exists, then create Account Session
        if (action === "create_session") {
            let accountId = user.stripe_account_id;

            if (!accountId) {
                const account = await stripe.accounts.create({
                    type: "custom",
                    country: "FR",
                    email: user.email,
                    capabilities: {
                        card_payments: { requested: true },
                        transfers: { requested: true },
                    },
                    business_type: "individual",
                    individual: {
                        email: user.email,
                        first_name: user.full_name?.split(" ")[0] || "",
                        last_name: user.full_name?.split(" ").slice(1).join(" ") || "",
                    },
                    tos_acceptance: { service_agreement: "full" },
                });
                accountId = account.id;
                await base44.auth.updateMe({ stripe_account_id: accountId, stripe_kyc_status: "pending" });
            }

            // Create an Account Session for embedded components
            const accountSession = await stripe.accountSessions.create({
                account: accountId,
                components: {
                    account_onboarding: { enabled: true },
                },
            });

            return Response.json({
                client_secret: accountSession.client_secret,
                account_id: accountId,
                publishable_key: Deno.env.get("STRIPE_PUBLISHABLE_KEY"),
            });
        }

        // Check account KYC status
        if (action === "status") {
            const accountId = user.stripe_account_id;
            if (!accountId) return Response.json({ status: "not_connected" });

            const account = await stripe.accounts.retrieve(accountId);
            const verified = account.details_submitted && account.charges_enabled;
            const status = verified ? "verified" : "pending";

            if (user.stripe_kyc_status !== status) {
                await base44.auth.updateMe({ stripe_kyc_status: status });
            }

            return Response.json({
                status,
                details_submitted: account.details_submitted,
                charges_enabled: account.charges_enabled,
                payouts_enabled: account.payouts_enabled,
            });
        }

        return Response.json({ error: "Unknown action" }, { status: 400 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});