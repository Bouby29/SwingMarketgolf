import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const publicKey = Deno.env.get("SENDCLOUD_PUBLIC_KEY");
    if (!publicKey) return Response.json({ error: "Clé manquante" }, { status: 500 });

    return Response.json({ public_key: publicKey });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});