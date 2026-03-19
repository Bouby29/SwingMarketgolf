import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const publicKey = Deno.env.get("SENDCLOUD_PUBLIC_KEY");
    const secretKey = Deno.env.get("SENDCLOUD_SECRET_KEY");

    if (!publicKey || !secretKey) {
      return Response.json({ error: "Clés Sendcloud manquantes" }, { status: 500 });
    }

    const credentials = btoa(`${publicKey}:${secretKey}`);

    const response = await fetch("https://panel.sendcloud.sc/api/v2/shipping_methods", {
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Sendcloud shipping_methods error:", response.status, errText);
      return Response.json({ error: "Erreur API Sendcloud", details: errText }, { status: response.status });
    }

    const data = await response.json();
    const methods = data.shipping_methods || [];

    // Normaliser les méthodes d'expédition
    const normalized = methods.map((m) => ({
      id: m.id,
      name: m.name,
      carrier: m.carrier,
      min_weight: m.min_weight,
      max_weight: m.max_weight,
      price: m.price,
      service_point_input: m.service_point_input, // "required", "optional", "none"
      countries: (m.countries || []).map(c => ({
        iso_2: c.iso_2,
        price: c.price,
        label: c.label,
      })),
    }));

    return Response.json({ shipping_methods: normalized });
  } catch (error) {
    console.error("getSendcloudShippingMethods error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});