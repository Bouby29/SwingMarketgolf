import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { postal_code, country = "FR", carrier } = await req.json();

    if (!postal_code) {
      return Response.json({ error: "postal_code requis" }, { status: 400 });
    }

    const publicKey = Deno.env.get("SENDCLOUD_PUBLIC_KEY");
    const secretKey = Deno.env.get("SENDCLOUD_SECRET_KEY");

    if (!publicKey || !secretKey) {
      return Response.json({ error: "Clés Sendcloud manquantes" }, { status: 500 });
    }

    const credentials = btoa(`${publicKey}:${secretKey}`);

    // Construire l'URL de l'API Sendcloud pour les points relais
    const carrierMap = {
      "mondial_relay": "mondial_relay",
      "colissimo": "la_poste",
      "chronopost": "chronopost",
    };
    const sendcloudCarrier = carrierMap[carrier] || carrier || "mondial_relay";

    const params = new URLSearchParams({
      country: country,
      postal_code: postal_code,
      language: "fr_FR",
      results: "20",
      radius: "10000",
      carriers: sendcloudCarrier,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response;
    try {
      response = await fetch(
        `https://panel.sendcloud.sc/api/v2/service-points/?${params.toString()}`,
        {
          headers: {
            "Authorization": `Basic ${credentials}`,
          },
          signal: controller.signal,
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("Sendcloud API error:", response.status, errText);
      return Response.json({ error: "Erreur API Sendcloud", details: errText }, { status: response.status });
    }

    const data = await response.json();

    // Normaliser les données pour le frontend
    const servicePoints = (data || []).map((point) => ({
      id: point.id,
      name: point.name,
      street: point.street,
      house_number: point.house_number || "",
      postal_code: point.postal_code,
      city: point.city,
      country: point.country,
      latitude: point.latitude,
      longitude: point.longitude,
      opening_hours: (point.opening_hours || []).map((h) => ({
        day: h.day,
        open: h.open,
        close: h.close,
      })),
      carrier: point.carrier,
      extra: point.extra || {},
    }));

    return Response.json({ service_points: servicePoints });
  } catch (error) {
    console.error("getSendcloudServicePoints error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});