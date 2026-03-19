import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { action } = body;

        // Create Custom account if not exists
        if (action === 'create_account') {
            let accountId = user.stripe_account_id;
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
                    business_profile: {
                        mcc: '5941',
                        url: 'https://www.swingmarket.fr',
                    },
                    tos_acceptance: { service_agreement: 'full' },
                });
                accountId = account.id;
                await base44.auth.updateMe({ stripe_account_id: accountId, stripe_kyc_status: 'pending' });
            }
            return Response.json({ account_id: accountId });
        }

        const accountId = user.stripe_account_id;
        if (!accountId) return Response.json({ error: 'Compte Stripe non créé' }, { status: 400 });

        // Add IBAN bank account
        if (action === 'add_bank_account') {
            const { iban, accountHolderName } = body;
            const cleanIban = iban.replace(/\s/g, '');
            await stripe.accounts.createExternalAccount(accountId, {
                external_account: {
                    object: 'bank_account',
                    country: 'FR',
                    currency: 'eur',
                    account_holder_name: accountHolderName,
                    account_holder_type: 'individual',
                    account_number: cleanIban,
                },
            });
            await base44.auth.updateMe({ stripe_bank_account_added: true });
            return Response.json({ success: true });
        }

        // Accept Stripe ToS (with user IP + timestamp)
        if (action === 'accept_tos') {
            await stripe.accounts.update(accountId, {
                tos_acceptance: {
                    date: Math.floor(Date.now() / 1000),
                    ip: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || '127.0.0.1',
                    service_agreement: 'full',
                },
            });
            await base44.auth.updateMe({ stripe_kyc_status: 'pending' });
            return Response.json({ success: true });
        }

        // Check account status
        if (action === 'status') {
            const account = await stripe.accounts.retrieve(accountId);
            const verified = account.details_submitted && account.charges_enabled;
            const status = verified ? 'verified' : 'pending';
            if (user.stripe_kyc_status !== status) {
                await base44.auth.updateMe({ stripe_kyc_status: status });
            }
            return Response.json({
                status,
                details_submitted: account.details_submitted,
                charges_enabled: account.charges_enabled,
                payouts_enabled: account.payouts_enabled,
                requirements: account.requirements,
            });
        }

        return Response.json({ error: 'Action inconnue' }, { status: 400 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});