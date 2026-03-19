import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    
    const { orderId } = await req.json();
    if (!orderId) return Response.json({ error: 'orderId requis' }, { status: 400 });
    
    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    if (!orders || orders.length === 0) return Response.json({ error: 'Commande introuvable' }, { status: 404 });
    const order = orders[0];
    
    if (order.seller_id !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Accès refusé' }, { status: 403 });
    }
    
    const [sellerArr, buyerArr, productArr] = await Promise.all([
      base44.asServiceRole.entities.User.filter({ email: order.seller_id }),
      base44.asServiceRole.entities.User.filter({ email: order.buyer_id }),
      base44.asServiceRole.entities.Product.filter({ id: order.product_id }),
    ]);
    
    const seller = sellerArr[0];
    const buyer = buyerArr[0];
    const product = productArr[0];
    
    if (!seller || !buyer || !product) {
      return Response.json({ error: 'Données manquantes' }, { status: 404 });
    }
    
    // Sendcloud credentials
    const publicKey = Deno.env.get('SENDCLOUD_PUBLIC_KEY');
    const secretKey = Deno.env.get('SENDCLOUD_SECRET_KEY');
    if (!publicKey || !secretKey) return Response.json({ error: 'Clés Sendcloud manquantes' }, { status: 500 });
    
    const auth = btoa(`${publicKey}:${secretKey}`);
    
    // Poids selon taille colis
    const weightMap = { small: '2', medium: '4', large: '15' };
    const dimMap = {
      small:  { length: '25', width: '20', height: '12' },
      medium: { length: '40', width: '30', height: '20' },
      large:  { length: '80', width: '50', height: '30' },
    };
    const size = product.package_size || 'medium';
    const weight = weightMap[size] || '4';
    const dims = dimMap[size] || dimMap.medium;
    
    // Adresse depuis la commande (stockée lors du checkout)
    const deliveryAddress = order.buyer_address || buyer.address || '';
    const deliveryCity = order.buyer_city || buyer.city || '';
    const deliveryPostalCode = order.buyer_postal_code || buyer.postal_code || '';
    
    if (!deliveryAddress || !deliveryCity || !deliveryPostalCode) {
      return Response.json({ error: 'Adresse de livraison incomplète' }, { status: 400 });
    }
    
    // L'ID de la méthode Sendcloud est stocké dans order.shipping_method
    const sendcloudServiceId = parseInt(order.shipping_method, 10);
    if (!sendcloudServiceId || isNaN(sendcloudServiceId)) {
      return Response.json({ error: 'ID transporteur Sendcloud invalide' }, { status: 400 });
    }
    
    const parcelData = {
      parcel: {
        name: buyer.full_name || 'Client',
        address: deliveryAddress,
        city: deliveryCity,
        postal_code: deliveryPostalCode,
        country: 'FR',
        email: buyer.email,
        telephone: order.buyer_phone || buyer.phone || '',
        order_number: order.id,
        weight,
        length: dims.length,
        width: dims.width,
        height: dims.height,
        shipment: { id: sendcloudServiceId },
        external_reference: order.id,
        // Point relais si applicable
        ...(order.relay_point_id && {
          to_service_point: parseInt(order.relay_point_id, 10),
        }),
      }
    };
    
    console.log('📦 Création colis Sendcloud:', JSON.stringify(parcelData, null, 2));
    
    const response = await fetch('https://panel.sendcloud.sc/api/v2/parcels', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parcelData),
    });
    
    if (!response.ok) {
      const errText = await response.text();
      console.error('❌ Erreur Sendcloud:', errText);
      return Response.json({ error: 'Erreur Sendcloud', details: errText }, { status: response.status });
    }
    
    const result = await response.json();
    console.log('✅ Colis créé:', JSON.stringify(result, null, 2));
    
    const parcelId = result.parcel?.id;
    const trackingNumber = result.parcel?.tracking_number;
    
    // Récupérer l'URL de l'étiquette depuis les différents formats possibles de Sendcloud
    const labelData = result.parcel?.label;
    let labelUrl = null;
    if (labelData) {
      if (Array.isArray(labelData.normal_printer) && labelData.normal_printer.length > 0) {
        labelUrl = labelData.normal_printer[0];
      } else if (typeof labelData.normal_printer === 'string') {
        labelUrl = labelData.normal_printer;
      } else if (labelData.label_printer) {
        labelUrl = Array.isArray(labelData.label_printer) ? labelData.label_printer[0] : labelData.label_printer;
      }
    }
    
    // Si pas d'étiquette immédiate, on essaie de la récupérer via l'endpoint dédié
    if (!labelUrl && parcelId) {
      try {
        const labelRes = await fetch(`https://panel.sendcloud.sc/api/v2/labels/${parcelId}`, {
          headers: { 'Authorization': `Basic ${auth}` }
        });
        if (labelRes.ok) {
          const labelJson = await labelRes.json();
          labelUrl = labelJson.label?.normal_printer?.[0] || labelJson.label?.label_printer?.[0] || null;
        }
      } catch(e) {
        console.warn('Impossible de récupérer l\'étiquette séparément:', e.message);
      }
    }
    
    // Mettre à jour la commande
    await base44.asServiceRole.entities.Order.update(orderId, {
      tracking_number: trackingNumber || order.tracking_number,
      shipping_label_url: labelUrl,
      status: 'preparing',
    });
    
    // Email vendeur avec étiquette
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: seller.email,
      subject: `🏷️ Votre étiquette d'expédition — ${product.title}`,
      body: `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F4;padding:30px 0;font-family:'Helvetica Neue',Arial,sans-serif;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
              <tr><td style="background:linear-gradient(135deg,#0D3B11,#1B5E20 55%,#2E7D32);padding:36px 40px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:32px;font-weight:800;">SwingMarket<span style="color:#C5A028;">.</span></h1>
              </td></tr>
              <tr><td style="padding:40px 44px;color:#333;font-size:15px;line-height:1.7;">
                <h2 style="margin:0 0 20px;color:#1B5E20;font-size:22px;font-weight:800;">Votre étiquette est prête 🏷️</h2>
                <p>Bonjour <strong>${seller.full_name}</strong>,</p>
                <p>Voici votre étiquette d'expédition pour la commande <strong>${product.title}</strong>.</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#F0F8F0;border-left:4px solid #1B5E20;border-radius:0 8px 8px 0;">
                  <tr><td style="padding:16px 20px;font-size:14px;color:#444;line-height:1.9;">
                    <strong>Acheteur :</strong> ${buyer.full_name}<br>
                    <strong>Transporteur :</strong> ${order.carrier_name || 'Sendcloud'}<br>
                    ${trackingNumber ? `<strong>N° de suivi :</strong> <code style="background:#fff;padding:2px 6px;border-radius:4px;">${trackingNumber}</code>` : ''}
                    ${order.relay_point_name ? `<br><strong>Point relais :</strong> ${order.relay_point_name}` : ''}
                  </td></tr>
                </table>
                ${labelUrl ? `<table cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
                  <tr><td align="center" style="background:#1B5E20;border-radius:8px;">
                    <a href="${labelUrl}" style="display:inline-block;padding:14px 34px;color:#fff;font-size:14px;font-weight:700;text-decoration:none;">📥 Télécharger l'étiquette PDF</a>
                  </td></tr>
                </table>` : ''}
                <p style="margin-top:24px;font-size:13px;color:#777;">📦 Une fois expédié, marquez la commande comme "Expédiée" depuis votre Dashboard.</p>
              </td></tr>
              <tr><td style="padding:28px 44px;background:#F9FAF9;border-top:1px solid #E8EDE8;">
                <p style="margin:0;font-size:12px;color:#888;">© 2026 SwingMarket — <a href="mailto:support@swingmarketgolf.com" style="color:#1B5E20;text-decoration:none;">support@swingmarketgolf.com</a></p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      `,
    });
    
    // Email acheteur
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: buyer.email,
      subject: '📦 Votre commande est en préparation — SwingMarket',
      body: `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F4;padding:30px 0;font-family:'Helvetica Neue',Arial,sans-serif;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
              <tr><td style="background:linear-gradient(135deg,#0D3B11,#1B5E20 55%,#2E7D32);padding:36px 40px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:32px;font-weight:800;">SwingMarket<span style="color:#C5A028;">.</span></h1>
              </td></tr>
              <tr><td style="padding:40px 44px;color:#333;font-size:15px;line-height:1.7;">
                <h2 style="margin:0 0 20px;color:#1B5E20;font-size:22px;font-weight:800;">Votre commande est en préparation 📦</h2>
                <p>Bonjour <strong>${buyer.full_name}</strong>,</p>
                <p>Le vendeur prépare votre <strong>${product.title}</strong>.</p>
                ${trackingNumber ? `<p style="font-size:13px;color:#555;">N° de suivi : <strong>${trackingNumber}</strong></p>` : ''}
              </td></tr>
              <tr><td style="padding:28px 44px;background:#F9FAF9;border-top:1px solid #E8EDE8;">
                <p style="margin:0;font-size:12px;color:#aaa;">© 2026 SwingMarket</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      `,
    });
    
    return Response.json({ success: true, parcel_id: parcelId, tracking_number: trackingNumber, label_url: labelUrl });
    
  } catch (error) {
    console.error('❌ Erreur createShippingLabel:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});