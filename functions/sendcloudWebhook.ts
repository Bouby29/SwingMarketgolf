import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Vérifier la signature SendCloud (optionnel mais recommandé)
    const signature = req.headers.get('X-Sendcloud-Signature');
    const body = await req.json();
    
    console.log('📦 Webhook SendCloud reçu:', JSON.stringify(body, null, 2));
    
    // Structure typique d'un webhook SendCloud parcel status update:
    // {
    //   "action": "parcel_status_changed",
    //   "timestamp": "2024-01-15T10:30:00Z",
    //   "parcel": {
    //     "id": 12345,
    //     "tracking_number": "3SABCD123456789",
    //     "status": {
    //       "id": 1000,
    //       "message": "Delivered"
    //     },
    //     "external_reference": "order_abc123"
    //   }
    // }
    
    const { action, parcel } = body;
    
    if (!parcel || !parcel.external_reference) {
      console.log('⚠️ Webhook ignoré: pas de référence externe');
      return Response.json({ received: true, skipped: true }, { status: 200 });
    }
    
    // La référence externe est l'ID de la commande
    const orderId = parcel.external_reference;
    const trackingNumber = parcel.tracking_number;
    const statusMessage = parcel.status?.message || '';
    
    console.log(`📦 Statut colis pour commande ${orderId}: ${statusMessage}`);
    
    // Récupérer la commande
    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    
    if (!orders || orders.length === 0) {
      console.log(`⚠️ Commande ${orderId} introuvable`);
      return Response.json({ received: true, order_not_found: true }, { status: 200 });
    }
    
    const order = orders[0];
    
    // Mapper les statuts SendCloud vers nos statuts internes
    // Ref: https://support.sendcloud.com/hc/en-us/articles/360024967511
    let newStatus = order.status;
    const statusId = parcel.status?.id;
    const statusLower = statusMessage.toLowerCase();

    // Par ID (prioritaire)
    if ([11, 12, 13, 14, 15, 16, 17, 22, 23].includes(statusId)) {
      // En transit / en cours d'acheminement
      newStatus = 'shipped';
    } else if ([11, 93].includes(statusId) || statusLower.includes('delivered')) {
      // Livré
      newStatus = 'delivered';
    } else if ([2, 8].includes(statusId)) {
      // Prêt à expédier / en préparation
      newStatus = 'preparing';
    } else if (statusLower.includes('transit') || statusLower.includes('shipment') || statusLower.includes('picked up')) {
      newStatus = 'shipped';
    } else if (statusLower.includes('delivered')) {
      newStatus = 'delivered';
    } else if (statusLower.includes('exception') || statusLower.includes('problem') || statusLower.includes('return')) {
      newStatus = 'disputed';
    }
    
    // Mettre à jour la commande
    const updateData = {
      tracking_number: trackingNumber,
      status: newStatus
    };
    
    // Ajouter la date de livraison si le statut est "delivered"
    if (newStatus === 'delivered' && !order.delivered_at) {
      updateData.delivered_at = new Date().toISOString();
    }
    
    await base44.asServiceRole.entities.Order.update(orderId, updateData);
    
    console.log(`✅ Commande ${orderId} mise à jour: ${newStatus}`);
    
    // Envoyer un email au client si le colis est livré
    if (newStatus === 'delivered') {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: order.buyer_id,
          subject: `📦 Votre colis est arrivé !`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1B5E20;">Livraison confirmée 🎉</h2>
              <p>Bonjour,</p>
              <p>Votre commande <strong>${order.product_title}</strong> a bien été livrée.</p>
              <p>Numéro de suivi: <strong>${trackingNumber}</strong></p>
              <p>Merci de votre confiance !</p>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">SwingMarket Golf</p>
            </div>
          `
        });
        console.log(`📧 Email de livraison envoyé à ${order.buyer_id}`);
      } catch (emailError) {
        console.error('Erreur envoi email:', emailError);
      }
    }
    
    return Response.json({ 
      received: true, 
      order_id: orderId,
      new_status: newStatus 
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Erreur webhook SendCloud:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});