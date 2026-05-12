const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// Service-key client : utilisé pour valider le JWT, lire produit/tarif,
// appeler la RPC commission et écrire l'order. Le service-key contourne
// RLS mais nous validons toujours l'utilisateur via auth.getUser(jwt).
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    uuid || ''
  );
}

function getJwt(req) {
  const h = req.headers.authorization || req.headers.Authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1] : null;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // 1. Authentifier l'acheteur via son JWT Supabase
    const jwt = getJwt(req);
    if (!jwt) {
      return res.status(401).json({ error: 'Authentification requise' });
    }
    const { data: userResp, error: userErr } = await supabase.auth.getUser(jwt);
    const buyer = userResp?.user;
    if (userErr || !buyer) {
      return res.status(401).json({ error: 'Session invalide' });
    }

    // 2. Lire le payload (que des IDs, jamais de montants)
    const {
      product_id,
      shipping_rate_id,
      delivery_mode,
      relay_point_id,
      relay_point_name,
      delivery_address,
      buyer_email,
    } = req.body || {};

    if (!isValidUUID(product_id)) {
      return res.status(400).json({ error: 'product_id invalide' });
    }
    if (!isValidUUID(shipping_rate_id)) {
      return res.status(400).json({ error: 'shipping_rate_id invalide' });
    }
    if (!['relay', 'domicile', 'main_propre'].includes(delivery_mode)) {
      return res.status(400).json({ error: 'delivery_mode invalide' });
    }

    // 3. Charger le produit (source de vérité pour le prix)
    const { data: product, error: productErr } = await supabase
      .from('products')
      .select('id, price, package_size, seller_id, seller_name, title, status')
      .eq('id', product_id)
      .single();

    if (productErr || !product) {
      return res.status(404).json({ error: 'Produit introuvable' });
    }
    if (product.status && product.status !== 'active') {
      return res.status(409).json({ error: 'Produit non disponible' });
    }
    if (product.seller_id === buyer.id) {
      return res
        .status(400)
        .json({ error: 'Impossible d\'acheter son propre produit' });
    }

    // 4. Charger le tarif de livraison
    const { data: shippingRate, error: shippingErr } = await supabase
      .from('shipping_rates')
      .select(
        'id, size_code, carrier_code, carrier_name, delivery_mode, shipping_price, is_active'
      )
      .eq('id', shipping_rate_id)
      .eq('is_active', true)
      .single();

    if (shippingErr || !shippingRate) {
      return res.status(404).json({ error: 'Tarif de livraison introuvable' });
    }

    // 5. Validations croisées
    if (shippingRate.size_code !== product.package_size) {
      return res
        .status(400)
        .json({ error: 'La taille du transport ne correspond pas au produit' });
    }
    if (shippingRate.delivery_mode !== delivery_mode) {
      return res
        .status(400)
        .json({ error: 'Mode de livraison incohérent' });
    }
    const shippingPrice = parseFloat(shippingRate.shipping_price);
    if (delivery_mode === 'main_propre' && shippingPrice !== 0) {
      return res
        .status(400)
        .json({ error: 'La remise en main propre ne peut pas avoir de frais de port' });
    }
    if (delivery_mode === 'relay' && !relay_point_id) {
      return res.status(400).json({ error: 'Point relais requis' });
    }
    if (
      delivery_mode === 'domicile' &&
      (!delivery_address ||
        !delivery_address.address1 ||
        !delivery_address.postalCode ||
        !delivery_address.city)
    ) {
      return res
        .status(400)
        .json({ error: 'Adresse de livraison incomplète' });
    }

    // 6. Calcul commission via RPC Supabase
    const { data: commissionData, error: commissionErr } = await supabase.rpc(
      'calculate_commission',
      { article_price: product.price }
    );
    if (commissionErr) {
      console.error('Erreur RPC calculate_commission:', commissionErr);
      return res
        .status(500)
        .json({ error: 'Erreur calcul commission' });
    }

    // 7. Montants finaux (en euros puis centimes)
    const articlePrice = Number(parseFloat(product.price).toFixed(2));
    const commissionAmount = Number(
      parseFloat(commissionData || 0).toFixed(2)
    );
    const shippingAmount = Number(shippingPrice.toFixed(2));
    const totalAmount = Number(
      (articlePrice + commissionAmount + shippingAmount).toFixed(2)
    );
    const totalInCents = Math.round(totalAmount * 100);

    if (totalInCents < 50) {
      return res.status(400).json({ error: 'Montant trop faible' });
    }

    // 8. Créer l'order EN PREMIER (status pending_payment)
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        product_id: product.id,
        product_title: product.title,
        buyer_id: buyer.id,
        seller_id: product.seller_id,
        seller_name: product.seller_name,
        price: articlePrice,
        commission_amount: commissionAmount,
        shipping_amount: shippingAmount,
        total_paid: totalAmount,
        status: 'pending_payment',
        payment_status: 'pending',
        payment_intent_id: null,
        delivery_mode: shippingRate.delivery_mode,
        buyer_address:
          delivery_mode === 'domicile'
            ? [delivery_address.address1, delivery_address.address2]
                .filter(Boolean)
                .join(' ')
            : null,
        buyer_city:
          delivery_mode === 'domicile' ? delivery_address.city : null,
        buyer_postal_code:
          delivery_mode === 'domicile' ? delivery_address.postalCode : null,
        buyer_phone:
          delivery_mode === 'domicile'
            ? delivery_address.phone || null
            : null,
        relay_point:
          delivery_mode === 'relay'
            ? {
                id: relay_point_id,
                name: relay_point_name || null,
                carrier_code: shippingRate.carrier_code,
              }
            : null,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (orderErr || !order) {
      console.error('Erreur création order:', orderErr);
      return res
        .status(500)
        .json({ error: orderErr?.message || 'Impossible de créer la commande' });
    }

    // 9. Créer le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalInCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      receipt_email: buyer_email || buyer.email || undefined,
      metadata: {
        order_id: order.id,
        product_id: product.id,
        buyer_id: buyer.id,
        seller_id: product.seller_id,
        shipping_rate_id: shippingRate.id,
        delivery_mode: shippingRate.delivery_mode,
        carrier_code: shippingRate.carrier_code || '',
        article_price_cents: Math.round(articlePrice * 100),
        commission_cents: Math.round(commissionAmount * 100),
        shipping_cents: Math.round(shippingAmount * 100),
        source: 'swing_market_golf_checkout',
      },
    });

    // 10. Lier le payment_intent_id à l'order
    const { error: updateErr } = await supabase
      .from('orders')
      .update({ payment_intent_id: paymentIntent.id })
      .eq('id', order.id);

    if (updateErr) {
      console.error('Erreur update payment_intent_id:', updateErr);
    }

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order.id,
      totalAmount,
      breakdown: {
        article: articlePrice,
        commission: commissionAmount,
        shipping: shippingAmount,
        total: totalAmount,
      },
    });
  } catch (err) {
    console.error('Erreur create-payment-intent:', err);
    return res
      .status(500)
      .json({ error: err.message || 'Erreur interne' });
  }
};
