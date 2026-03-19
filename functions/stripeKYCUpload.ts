import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        let body;
        try {
            body = await req.json();
            console.log("Body reçu:", body);
        } catch (parseError) {
            console.error("JSON parse error:", parseError.message);
            return Response.json({ error: `Parse error: ${parseError.message}` }, { status: 400 });
        }

        const { firstName, lastName, birthDate, phone, addressLine1, addressCity, addressPostalCode, frontUrl, backUrl } = body;

        if (!frontUrl) return Response.json({ error: "Document recto obligatoire" }, { status: 400 });
        if (!backUrl) return Response.json({ error: "Document verso obligatoire" }, { status: 400 });
        if (!firstName || !lastName || !birthDate) return Response.json({ error: "Informations personnelles incomplètes" }, { status: 400 });

        // 1. Create or retrieve Stripe Custom account
        let accountId = user.stripe_account_id;
        if (!accountId) {
            console.log("Creating Stripe account for:", user.email);
            
            // Get real client IP
            const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
                || req.headers.get('x-real-ip') 
                || '127.0.0.1';
            
            // Parse birth date
            const [year, month, day] = (birthDate || "").split("-").map(Number);
            
            const account = await stripe.accounts.create({
                country: "FR",
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                business_type: "individual",
                business_profile: {
                    mcc: "5941", // Sporting goods / golf equipment
                    url: "https://www.swingmarket.fr",
                },
                controller: {
                    requirement_collection: "stripe",
                    stripe_dashboard: {
                        type: "express",
                    },
                    losses: {
                        payments: "application",
                    },
                    fees: {
                        payer: "application",
                    },
                },
                tos_acceptance: {
                    date: Math.floor(Date.now() / 1000),
                    ip: clientIp,
                },
                individual: {
                    first_name: firstName,
                    last_name: lastName,
                    dob: year ? { day, month, year } : undefined,
                    phone: phone || undefined,
                    email: user.email,
                    address: {
                        line1: addressLine1,
                        city: addressCity,
                        postal_code: addressPostalCode,
                        country: 'FR',
                    },
                },
            });
            
            accountId = account.id;
            await base44.auth.updateMe({ stripe_account_id: accountId });
        }

        // 2. Download and upload front document to Stripe
        console.log("Uploading front document from:", frontUrl);
        const frontResponse = await fetch(frontUrl);
        if (!frontResponse.ok) throw new Error(`Failed to fetch front: ${frontResponse.status}`);
        const frontBlob = await frontResponse.blob();
        
        // Create FormData for Stripe file upload
        const frontFormData = new FormData();
        frontFormData.append("purpose", "identity_document");
        frontFormData.append("file", frontBlob, "front.jpg");
        
        const frontFileRes = await fetch("https://files.stripe.com/v1/files", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`
            },
            body: frontFormData,
        });
        
        if (!frontFileRes.ok) {
            const errorText = await frontFileRes.text();
            throw new Error(`Stripe front upload failed: ${errorText}`);
        }
        const frontStripeFile = await frontFileRes.json();

        // 3. Download and upload back document to Stripe
        console.log("Uploading back document from:", backUrl);
        const backResponse = await fetch(backUrl);
        if (!backResponse.ok) throw new Error(`Failed to fetch back: ${backResponse.status}`);
        const backBlob = await backResponse.blob();
        
        const backFormData = new FormData();
        backFormData.append("purpose", "identity_document");
        backFormData.append("file", backBlob, "back.jpg");
        
        const backFileRes = await fetch("https://files.stripe.com/v1/files", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`
            },
            body: backFormData,
        });
        
        if (!backFileRes.ok) {
            const errorText = await backFileRes.text();
            throw new Error(`Stripe back upload failed: ${errorText}`);
        }
        const backStripeFile = await backFileRes.json();
        const backFileId = backStripeFile.id;

        // 4. Update account with verification documents only
        console.log("Updating account with verification documents");
        await stripe.accounts.update(accountId, {
            individual: {
                verification: {
                    document: {
                        front: frontStripeFile.id,
                        back: backFileId,
                    },
                },
            },
        });

        // 6. Save account ID and set status to pending
        await base44.auth.updateMe({
            stripe_account_id: accountId,
            stripe_kyc_status: "pending",
        });

        return Response.json({ success: true, status: "pending" });
    } catch (error) {
        console.error("Error in stripeKYCUpload:", error.message, error.stack);
        return Response.json({ error: error.message }, { status: 500 });
    }
});