import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { to, templateType } = await req.json();

  const baseUrl = "https://swingmarketgolf.com";

  const generateHTML = (type) => {
    const header = `
      <table width="100%" cellpadding="0" cellspacing="0" style="background: #F4F6F4; padding: 30px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <tr>
              <td style="background: linear-gradient(135deg, #0D3B11 0%, #1B5E20 55%, #2E7D32 100%); padding: 36px 40px; text-align:center;">
                <p style="margin:0 0 6px 0; color: rgba(255,255,255,0.6); font-size:11px; letter-spacing:3px; text-transform:uppercase;">La marketplace du golf</p>
                <h1 style="margin:0; color:#ffffff; font-size:32px; font-weight:800; letter-spacing:-0.5px;">SwingMarket<span style="color:#C5A028;">.</span></h1>
                <div style="width:40px; height:2px; background:#C5A028; margin:14px auto 0;"></div>
              </td>
            </tr>
            <tr><td style="padding: 44px 44px 32px; color:#333333; font-size:15px; line-height:1.7;">
    `;

    const footer = `
            </td></tr>
            <tr>
              <td style="padding: 28px 44px; background:#F9FAF9; border-top: 1px solid #E8EDE8;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding-bottom:16px;">
                    <p style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:#1B5E20;">L'équipe Service Client SwingMarket</p>
                    <p style="margin:6px 0 0 0; font-size:12px; color:#888;">📧 <a href="mailto:support@swingmarketgolf.com" style="color:#1B5E20; text-decoration:none;">support@swingmarketgolf.com</a></p>
                  </td></tr>
                  <tr><td style="border-top:1px solid #E0E7E0; padding-top:16px;">
                    <p style="margin:0; font-size:11px; color:#aaa;">© 2026 SwingMarket — La marketplace des golfeurs passionnés</p>
                  </td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    `;

    const btn = (text, url) => `
      <table cellpadding="0" cellspacing="0" style="margin: 24px auto 0;">
        <tr><td align="center" style="background:#1B5E20; border-radius:8px;">
          <a href="${url}" style="display:inline-block; padding:14px 34px; color:#ffffff; font-size:14px; font-weight:700; text-decoration:none;">${text}</a>
        </td></tr>
      </table>
    `;

    const infoBox = (lines, borderColor = "#1B5E20", bgColor = "#F0F8F0") => `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0; background:${bgColor}; border-left:4px solid ${borderColor}; border-radius:0 8px 8px 0;">
        <tr><td style="padding:16px 20px; font-size:14px; color:#444; line-height:1.9;">${lines}</td></tr>
      </table>
    `;

    const templates = {
      signup_confirmation: `
        ${header}
        <h2 style="margin:0 0 20px; color:#1B5E20; font-size:22px; font-weight:800;">Bienvenue sur SwingMarket 🎉</h2>
        <p>Bonjour <strong>Admin</strong>,</p>
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
      new_order_seller: `
        ${header}
        <h2 style="margin:0 0 20px; color:#1B5E20; font-size:22px; font-weight:800;">Nouvelle commande reçue 🛒</h2>
        <p>Bonjour <strong>Admin</strong>,</p>
        <p>Excellente nouvelle ! Votre article vient d'être acheté sur SwingMarket.</p>
        ${infoBox(`
          <strong>Article vendu :</strong> Titleist T200 Irons (5-PW)<br>
          <strong>Prix de vente :</strong> 450 €<br>
          <strong>Acheteur :</strong> Jean Dupont<br>
          <strong>Référence commande :</strong> <code style="background:#fff;padding:2px 6px;border-radius:4px;font-size:13px;">ORD-TEST-001</code>
        `, "#C5A028", "#FFFDF0")}
        <p>Merci de préparer et d'expédier la commande dans les <strong>48 heures</strong>.</p>
        ${btn("Préparer la commande →", `${baseUrl}/Dashboard`)}
        ${footer}
      `,
      order_shipped: `
        ${header}
        <h2 style="margin:0 0 20px; color:#1B5E20; font-size:22px; font-weight:800;">Votre colis est en route 🚚</h2>
        <p>Bonjour <strong>Admin</strong>,</p>
        <p>Votre commande <strong>"Titleist T200 Irons"</strong> vient d'être expédiée. Plus qu'à patienter !</p>
        ${infoBox(`
          <strong>Transporteur :</strong> Colissimo<br>
          <strong>N° de suivi :</strong> <code style="background:#fff;padding:2px 8px;border-radius:4px;font-size:13px;letter-spacing:1px;">6Y12345678901</code><br>
          <strong>Délai estimé :</strong> 2–3 jours ouvrés
        `, "#1976D2", "#EEF4FF")}
        ${btn("Suivre mon colis en direct →", `${baseUrl}/Dashboard`)}
        ${footer}
      `
    };

    return templates[type] || templates.signup_confirmation;
  };

  const template = templateType || "signup_confirmation";
  const subject = {
    signup_confirmation: "🎉 Bienvenue sur SwingMarket — Test email",
    new_order_seller: "🛒 Nouvelle commande reçue — Test email",
    order_shipped: "🚚 Votre colis est en route — Test email"
  }[template] || "📧 Test email SwingMarket";

  await base44.asServiceRole.integrations.Core.SendEmail({
    to,
    subject,
    body: generateHTML(template)
  });

  return Response.json({ success: true, message: `Email "${template}" envoyé à ${to}` });
});