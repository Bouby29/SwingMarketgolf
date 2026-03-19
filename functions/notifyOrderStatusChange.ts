import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Templates HTML inline (pas d'import local possible)
const BASE_URL = "https://swingmarketgolf.com";

const emailHeader = `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;">
    <tr><td style="padding:20px 0;">
      <table width="100%" style="max-width:600px;margin:0 auto;background:white;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;">
        <tr style="background:linear-gradient(135deg,#1B5E20 0%,#2E7D32 100%);">
          <td style="padding:30px 20px;text-align:center;">
            <h1 style="color:white;font-size:24px;font-weight:700;margin:0;font-family:Arial,sans-serif;">SwingMarket</h1>
            <p style="color:rgba(255,255,255,0.8);margin:5px 0 0;font-family:Arial,sans-serif;font-size:13px;">La marketplace du golf</p>
          </td>
        </tr>
        <tr><td style="padding:40px 30px;font-family:Arial,sans-serif;color:#333;">
`;

const emailFooter = `
        </td></tr>
        <tr style="border-top:1px solid #E0E0E0;background:#F5F5F5;">
          <td style="padding:20px 30px;text-align:center;font-family:Arial,sans-serif;font-size:12px;color:#666;">
            <p style="margin:0 0 5px 0;">L'équipe SwingMarket</p>
            <p style="margin:0;color:#999;">© 2026 SwingMarket. Tous droits réservés.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
`;

const ctaButton = (text, url) => `
  <div style="text-align:center;margin-top:25px;">
    <a href="${url}" style="display:inline-block;background:#1B5E20;color:white;padding:13px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;font-family:Arial,sans-serif;">${text}</a>
  </div>
`;

const infoBox = (color, borderColor, content) => `
  <div style="background:${color};padding:15px 20px;border-left:4px solid ${borderColor};border-radius:4px;color:#555;font-family:Arial,sans-serif;font-size:14px;margin:20px 0;">
    ${content}
  </div>
`;

function buildOrderConfirmationEmail(data) {
  const subject = "✅ Confirmation de votre commande SwingMarket";
  const body = emailHeader + `
    <h2 style="color:#1B5E20;font-size:20px;margin-top:0;">Commande confirmée ! ✅</h2>
    <p>Bonjour <strong>${data.buyerName}</strong>,</p>
    <p>Merci pour votre achat sur SwingMarket ! Votre commande a bien été enregistrée et le vendeur va préparer votre colis.</p>
    ${infoBox("#E8F5E9", "#1B5E20", `
      <strong>Produit :</strong> ${data.productTitle}<br>
      <strong>Vendeur :</strong> ${data.sellerName}<br>
      <strong>Montant total :</strong> <span style="font-size:16px;color:#1B5E20;font-weight:bold;">${data.totalPaid} €</span><br>
      <strong>N° commande :</strong> <code style="background:#F5F5F5;padding:2px 6px;border-radius:3px;">${data.orderId}</code>
    `)}
    <p style="font-size:13px;color:#666;">🔒 Vos fonds sont sécurisés par SwingMarket et ne seront versés au vendeur qu'après confirmation de la livraison.</p>
    ${ctaButton("Suivre ma commande", `${BASE_URL}/Dashboard?view=orders`)}
  ` + emailFooter;
  return { subject, body };
}

function buildOrderShippedEmail(data) {
  const subject = "🚚 Votre colis SwingMarket a été expédié !";
  const body = emailHeader + `
    <h2 style="color:#1B5E20;font-size:20px;margin-top:0;">Votre colis est en route ! 🚚</h2>
    <p>Bonjour <strong>${data.buyerName}</strong>,</p>
    <p>Bonne nouvelle ! Le vendeur vient d'expédier votre commande <strong>"${data.productTitle}"</strong>.</p>
    ${infoBox("#E3F2FD", "#1976D2", `
      <strong>Transporteur :</strong> ${data.shippingMethod || "Standard"}<br>
      <strong>N° de suivi :</strong> <code style="background:#F5F5F5;padding:2px 6px;border-radius:3px;font-weight:bold;">${data.trackingNumber || "En attente"}</code><br>
      <strong>Délai estimé :</strong> 2 à 7 jours ouvrables
    `)}
    <p style="font-size:13px;color:#666;">Dès réception, pensez à confirmer la livraison dans votre espace personnel pour finaliser la transaction.</p>
    ${ctaButton("Suivre mon colis", `${BASE_URL}/Dashboard?view=orders`)}
  ` + emailFooter;
  return { subject, body };
}

function buildOrderDeliveredEmail(data) {
  const subject = "📦 Votre colis SwingMarket est arrivé !";
  const body = emailHeader + `
    <h2 style="color:#1B5E20;font-size:20px;margin-top:0;">Livraison confirmée 🎉</h2>
    <p>Bonjour <strong>${data.buyerName}</strong>,</p>
    <p>Votre colis <strong>"${data.productTitle}"</strong> a bien été livré. Nous espérons que votre achat vous satisfait pleinement !</p>
    ${infoBox("#F0F8F0", "#4CAF50", `
      <strong>Produit :</strong> ${data.productTitle}<br>
      <strong>Livré le :</strong> ${new Date().toLocaleDateString("fr-FR")}
    `)}
    <p>Si vous êtes satisfait de votre achat, n'oubliez pas de laisser un avis au vendeur — cela l'aide énormément !</p>
    <p style="font-size:13px;color:#E53935;">⚠️ Si vous n'avez pas reçu votre colis ou s'il y a un problème, signalez-le dans les 48h via votre espace commande.</p>
    ${ctaButton("Confirmer & laisser un avis", `${BASE_URL}/Dashboard?view=orders`)}
  ` + emailFooter;
  return { subject, body };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Appelée par l'automation entity Order (update)
    const { event, data, old_data } = payload;

    if (event?.type !== "update") {
      return Response.json({ skipped: true, reason: "not an update event" });
    }

    const order = data;
    const previousStatus = old_data?.status;
    const newStatus = order?.status;

    // Ne rien faire si le statut n'a pas changé
    if (!order || !previousStatus || previousStatus === newStatus) {
      return Response.json({ skipped: true, reason: "no status change" });
    }

    console.log(`📧 Changement statut commande ${order.id}: ${previousStatus} → ${newStatus}`);

    // Récupérer l'email de l'acheteur
    const buyers = await base44.asServiceRole.entities.User.filter({ id: order.buyer_id });
    const buyer = buyers?.[0];

    if (!buyer?.email) {
      console.log("⚠️ Acheteur introuvable ou sans email");
      return Response.json({ skipped: true, reason: "buyer not found" });
    }

    const buyerName = buyer.full_name?.split(" ")[0] || "Cher client";
    let emailPayload = null;

    if (newStatus === "preparing" && previousStatus === "pending_validation") {
      // Confirmation commande → acheteur
      emailPayload = buildOrderConfirmationEmail({
        buyerName,
        productTitle: order.product_title || "Votre article",
        sellerName: order.seller_name || "le vendeur",
        totalPaid: order.total_paid?.toFixed(2) || order.price?.toFixed(2),
        orderId: order.id,
      });
    } else if (newStatus === "shipped") {
      // Expédition → acheteur
      emailPayload = buildOrderShippedEmail({
        buyerName,
        productTitle: order.product_title || "Votre article",
        shippingMethod: order.shipping_method,
        trackingNumber: order.tracking_number,
        orderId: order.id,
      });
    } else if (newStatus === "delivered") {
      // Livraison confirmée → acheteur
      emailPayload = buildOrderDeliveredEmail({
        buyerName,
        productTitle: order.product_title || "Votre article",
        orderId: order.id,
      });
    }

    if (!emailPayload) {
      return Response.json({ skipped: true, reason: `no email for transition ${previousStatus} → ${newStatus}` });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: buyer.email,
      subject: emailPayload.subject,
      body: emailPayload.body,
    });

    // Historique email
    await base44.asServiceRole.entities.EmailHistory.create({
      user_email: buyer.email,
      user_name: buyer.full_name || buyerName,
      email_type: newStatus === "preparing" ? "order_confirmation_buyer" : newStatus === "shipped" ? "order_shipped" : "order_delivered",
      subject: emailPayload.subject,
      content: emailPayload.body,
      related_order_id: order.id,
      related_product_id: order.product_id || null,
      status: "sent",
      metadata: { previousStatus, newStatus },
    });

    console.log(`✅ Email "${emailPayload.subject}" envoyé à ${buyer.email}`);
    return Response.json({ success: true, emailSent: emailPayload.subject });

  } catch (error) {
    console.error("❌ Erreur notifyOrderStatusChange:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});