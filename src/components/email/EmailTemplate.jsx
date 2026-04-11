/**
 * Email Template HTML Generator
 * SwingMarket — Design premium avec signature Service Client
 */

export const generateEmailHTML = (templateType, data = {}) => {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://swingmarketgolf.com";

  const header = `
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #F4F6F4; padding: 30px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <!-- HEADER BANNER -->
            <tr>
              <td style="background: linear-gradient(135deg, #0D3B11 0%, #1B5E20 55%, #2E7D32 100%); padding: 36px 40px; text-align:center;">
                <p style="margin:0 0 6px 0; color: rgba(255,255,255,0.6); font-size:11px; letter-spacing:3px; text-transform:uppercase;">La marketplace du golf</p>
                <h1 style="margin:0; color:#ffffff; font-size:32px; font-weight:800; letter-spacing:-0.5px;">SwingMarket<span style="color:#C5A028;">.</span></h1>
                <div style="width:40px; height:2px; background:#C5A028; margin:14px auto 0;"></div>
              </td>
            </tr>
            <!-- BODY -->
            <tr>
              <td style="padding: 44px 44px 32px; color:#333333; font-size:15px; line-height:1.7;">
  `;

  const footer = `
              </td>
            </tr>
            <!-- SIGNATURE -->
            <tr>
              <td style="padding: 28px 44px; background:#F9FAF9; border-top: 1px solid #E8EDE8;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:16px;">
                      <p style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:#1B5E20; font-family:'Helvetica Neue',Arial,sans-serif;">L'équipe Service Client SwingMarket</p>
                      <p style="margin:6px 0 0 0; font-size:12px; color:#888;">
                        📧 <a href="mailto:contact@swingmarketgolf.com" style="color:#1B5E20; text-decoration:none;">contact@swingmarketgolf.com</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #E0E7E0; padding-top:16px;">
                      <p style="margin:0; font-size:11px; color:#aaa;">© 2026 SwingMarket — La marketplace des golfeurs passionnés</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const btn = (text, url, color = "#1B5E20") => `
    <table cellpadding="0" cellspacing="0" style="margin: 24px auto 0;">
      <tr>
        <td align="center" style="background:${color}; border-radius:8px;">
          <a href="${url}" style="display:inline-block; padding:14px 34px; color:#ffffff; font-size:14px; font-weight:700; text-decoration:none; letter-spacing:0.3px;">${text}</a>
        </td>
      </tr>
    </table>
  `;

  const infoBox = (lines, borderColor = "#1B5E20", bgColor = "#F0F8F0") => `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0; background:${bgColor}; border-left:4px solid ${borderColor}; border-radius:0 8px 8px 0;">
      <tr><td style="padding:16px 20px; font-size:14px; color:#444; line-height:1.9;">${lines}</td></tr>
    </table>
  `;

  const divider = `<div style="height:1px; background:#EEF1EE; margin:24px 0;"></div>`;

  const templates = {

    signup_confirmation: () => `
      ${header}
      <h2 style="margin:0 0 20px; color:#1B5E20; font-size:22px; font-weight:800;">Bienvenue sur SwingMarket 🎉</h2>
      <p>Bonjour <strong>${data.firstName}</strong>,</p>
      <p>Nous sommes ravis de vous accueillir au sein de la communauté SwingMarket — la marketplace dédiée aux passionnés de golf.</p>
      <p>Votre compte est prêt. Vous pouvez dès maintenant :</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
        <tr><td style="padding:8px 0; font-size:14px; color:#444;">⛳ <strong>Acheter</strong> du matériel de golf certifié</td></tr>
        <tr><td style="padding:8px 0; font-size:14px; color:#444;">🏷️ <strong>Vendre</strong> vos équipements en quelques clics</td></tr>
        <tr><td style="padding:8px 0; font-size:14px; color:#444;">💬 <strong>Échanger</strong> avec d'autres golfeurs passionnés</td></tr>
        <tr><td style="padding:8px 0; font-size:14px; color:#444;">🏆 <strong>Participer</strong> aux enchères exclusives</td></tr>
      </table>
      ${btn("Découvrir la marketplace", `${baseUrl}/Marketplace`)}
      ${footer}
    `,

    listing_published: () => `
      ${header}
      <h2 style="margin:0 0 20px; color:#1B5E20; font-size:22px; font-weight:800;">Votre annonce est en ligne ✅</h2>
      <p>Bonjour <strong>${data.firstName}</strong>,</p>
      <p>Bonjour <strong>${data.firstName}</strong>,</p>
      <p>Votre annonce <strong>"${data.productTitle}"</strong> est désormais en ligne sur SwingMarketGolf !</p>
      <p>N'hésitez pas à partager votre annonce avec vos proches pour maximiser vos chances de vente.</p>
      <p>Nous vous remercions de votre confiance.</p>
      <p style="color:#6b7280; font-style:italic;">L'équipe SwingMarketGolf</p>
      ${infoBox(`
        <strong>Produit :</strong> ${data.productTitle}<br>
        <strong>Prix affiché :</strong> ${data.price} €<br>
        <strong>État :</strong> ${data.condition}<br>
        <strong>Catégorie :</strong> ${data.category}
      `, "#C5A028", "#FFFDF0")}
      <p style="font-size:13px; color:#777;">💡 <em>Conseil : des photos de qualité et une description détaillée multiplient vos chances de vente.</em></p>
      ${btn("Voir mon annonce", `${baseUrl}/ProductDetail?id=${data.productId}`)}
      ${footer}
    `,

    new_order_seller: () => `
      ${header}
      <h2 style="margin:0 0 20px; color:#1B5E20; font-size:22px; font-weight:800;">Nouvelle commande reçue 🛒</h2>
      <p>Bonjour <strong>${data.firstName}</strong>,</p>
      <p>Excellente nouvelle ! Votre article vient d'être acheté sur SwingMarket. Un acheteur fait confiance à votre annonce 🎯</p>
      ${infoBox(`
        <strong>Article vendu :</strong> ${data.productTitle}<br>
        <strong>Prix de vente :</strong> ${data.price} €<br>
        <strong>Acheteur :</strong> ${data.buyerName}<br>
        <strong>Référence commande :</strong> <code style="background:#fff;padding:2px 6px;border-radius:4px;font-size:13px;">${data.orderId}</code>
      `, "#C5A028", "#FFFDF0")}
      <p>Merci de préparer et d'expédier la commande dans les <strong>48 heures</strong> pour assurer la satisfaction de l'acheteur et recevoir votre paiement.</p>
      ${btn("Préparer la commande →", `${baseUrl}/Dashboard`)}
      ${footer}
    `,

    order_confirmation_buyer: () => `
      ${header}
      <h2 style="margin:0 0 20px; color:#1B5E20; font-size:22px; font-weight:800;">Commande confirmée ✅</h2>
      <p>Bonjour <strong>${data.firstName}</strong>,</p>
      <p>Merci pour votre achat ! Votre commande a bien été enregistrée et le vendeur a été notifié. Il prépare votre colis avec soin.</p>
      ${infoBox(`
        <strong>Article :</strong> ${data.productTitle}<br>
        <strong>Vendeur :</strong> ${data.sellerName}<br>
        <strong>Montant total :</strong> <span style="color:#1B5E20; font-weight:700;">${data.totalPrice} €</span><br>
        <strong>Référence :</strong> <code style="background:#fff;padding:2px 6px;border-radius:4px;font-size:13px;">${data.orderId}</code>
      `)}
      <p style="font-size:13px; color:#777;">📦 Vous recevrez un email dès que votre colis sera expédié avec le numéro de suivi.</p>
      ${btn("Suivre ma commande", `${baseUrl}/Dashboard`)}
      ${footer}
    `,

    order_preparing: () => `
      ${header}
      <h2 style="margin:0 0 20px; color:#1B5E20; font-size:22px; font-weight:800;">Votre commande est en préparation 📦</h2>
      <p>Bonjour <strong>${data.firstName}</strong>,</p>
      <p>Le vendeur emballe actuellement votre <strong>"${data.productTitle}"</strong> avec le plus grand soin. Votre colis sera bientôt en route !</p>
      ${divider}
      <p style="font-size:13px; color:#777;">Vous recevrez une notification avec votre numéro de suivi dès l'expédition.</p>
      ${btn("Voir ma commande", `${baseUrl}/Dashboard`)}
      ${footer}
    `,

    order_shipped: () => `
      ${header}
      <h2 style="margin:0 0 20px; color:#1B5E20; font-size:22px; font-weight:800;">Votre colis est en route 🚚</h2>
      <p>Bonjour <strong>${data.firstName}</strong>,</p>
      <p>Votre commande <strong>"${data.productTitle}"</strong> vient d'être expédiée. Plus qu'à patienter !</p>
      ${infoBox(`
        <strong>Transporteur :</strong> ${data.carrier}<br>
        <strong>N° de suivi :</strong> <code style="background:#fff;padding:2px 8px;border-radius:4px;font-size:13px;letter-spacing:1px;">${data.trackingNumber}</code><br>
        <strong>Délai estimé :</strong> ${data.estimatedDelivery}
      `, "#1976D2", "#EEF4FF")}
      <p style="font-size:13px; color:#777;">💡 Vous pourrez suivre votre colis en temps réel depuis votre espace commandes.</p>
      ${btn("Suivre mon colis en direct →", `${baseUrl}/Dashboard`)}
      ${footer}
    `,

    order_delivered: () => `
      ${header}
      <h2 style="margin:0 0 20px; color:#1B5E20; font-size:22px; font-weight:800;">Votre colis est arrivé ! 🎉</h2>
      <p>Bonjour <strong>${data.firstName}</strong>,</p>
      <p>Votre commande <strong>"${data.productTitle}"</strong> a été livrée. Nous espérons que vous êtes pleinement satisfait(e) de votre achat.</p>
      ${infoBox(`
        ✅ Si tout est conforme, <strong>validez la réception</strong> pour libérer le paiement au vendeur.<br><br>
        ⚠️ En cas de problème (article endommagé, non conforme…), <strong>signalez un litige dans les 48h</strong>.
      `, "#1B5E20", "#F0F8F0")}
      ${btn("Valider ma commande", `${baseUrl}/Dashboard`)}
      ${footer}
    `,

    refund_processed: () => `
      ${header}
      <h2 style="margin:0 0 20px; color:#1B5E20; font-size:22px; font-weight:800;">Remboursement effectué ✅</h2>
      <p>Bonjour <strong>${data.firstName}</strong>,</p>
      <p>Suite au traitement de votre demande, un remboursement a été initié sur votre moyen de paiement d'origine.</p>
      ${infoBox(`
        <strong>Montant remboursé :</strong> <span style="color:#1B5E20; font-weight:700;">${data.refundAmount} €</span><br>
        <strong>Motif :</strong> ${data.refundReason}<br>
        <strong>Date :</strong> ${new Date().toLocaleDateString("fr-FR")}
      `)}
      <p style="font-size:13px; color:#777;">⏳ Le remboursement apparaîtra sur votre relevé bancaire sous <strong>5 à 7 jours ouvrés</strong> selon votre établissement.</p>
      <p style="font-size:13px; color:#777;">Une question ? Notre service client est là pour vous aider.</p>
      ${btn("Voir mon espace", `${baseUrl}/Dashboard`)}
      ${footer}
    `,

    support_reply: () => `
      ${header}
      <h2 style="margin:0 0 20px; color:#1B5E20; font-size:22px; font-weight:800;">Réponse de notre équipe 💬</h2>
      <p>Bonjour <strong>${data.firstName}</strong>,</p>
      <p>Notre équipe Service Client a pris en charge votre demande et vous a apporté une réponse.</p>
      ${infoBox(`
        <strong>Sujet :</strong> ${data.subject}<br>
        <strong>Priorité :</strong> ${data.priority || "Standard"}
      `, "#7B1FA2", "#F8F0FF")}
      <p>Consultez notre messagerie pour lire la réponse complète et continuer la conversation si nécessaire.</p>
      ${btn("Lire la réponse", `${baseUrl}/Messages`)}
      ${footer}
    `,

    new_message: () => `
      ${header}
      <h2 style="margin:0 0 20px; color:#1B5E20; font-size:22px; font-weight:800;">Nouveau message reçu 📬</h2>
      <p>Bonjour <strong>${data.firstName}</strong>,</p>
      <p><strong>${data.senderName}</strong> vous a envoyé un message concernant l'annonce <strong>"${data.productTitle}"</strong>.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0; background:#F5F7FA; border-radius:8px; border-left:4px solid #90A4AE;">
        <tr><td style="padding:16px 20px; font-size:14px; color:#555; font-style:italic; line-height:1.6;">"${data.messagePreview}"</td></tr>
      </table>
      <p style="font-size:13px; color:#777;">Répondez rapidement pour maximiser vos chances de conclure la transaction.</p>
      ${btn("Répondre au message →", `${baseUrl}/Messages`)}
      ${footer}
    `
  };

  return templates[templateType]?.() || "";
};

export const getEmailSubject = (type, data = {}) => {
  const subjects = {
    signup_confirmation: `🎉 Bienvenue sur SwingMarket, ${data.firstName || "golfeur"} !`,
    listing_published: `✅ Votre annonce "${data.productTitle || "produit"}" est en ligne`,
    new_order_seller: `🛒 Nouvelle commande reçue — ${data.productTitle || "article vendu"}`,
    order_confirmation_buyer: `✅ Commande confirmée — ${data.productTitle || "votre achat"}`,
    order_preparing: `📦 Votre commande est en préparation`,
    order_shipped: `🚚 Votre colis est en route — N° ${data.trackingNumber || ""}`,
    order_delivered: `🎉 Votre colis a été livré — Confirmez la réception`,
    refund_processed: `💸 Remboursement de ${data.refundAmount || ""}€ effectué`,
    support_reply: `💬 Réponse de notre Service Client — ${data.subject || ""}`,
    new_message: `📬 ${data.senderName || "Quelqu'un"} vous a envoyé un message`
  };

  return subjects[type] || "Un message de SwingMarket";
};