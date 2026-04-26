const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// Initialiser Supabase avec la clé de service (côté serveur)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Fonction utilitaire pour valider un UUID
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

module.exports = async (req, res) => {
  // Vérifier que la méthode est POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // 1. Extraire et valider les paramètres d'entrée
    const { orderId, amount } = req.body;

    // Vérifier que orderId est fourni et est un UUID valide
    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ error: 'orderId manquant ou invalide' });
    }
    if (!isValidUUID(orderId)) {
      return res.status(400).json({ error: 'orderId doit être un UUID valide' });
    }

    // Vérifier que amount est fourni, est un entier et > 0
    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: 'amount manquant' });
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ error: 'amount doit être un entier positif (en centimes)' });
    }

    // 2. Récupérer la commande depuis Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, buyer_id, seller_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error(`Commande introuvable: orderId=${orderId}`, orderError);
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // 3. Créer le PaymentIntent Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // déjà en centimes (input du frontend)
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId,
        buyerId: order.buyer_id,
        sellerId: order.seller_id,
        source: 'swing_market_golf_checkout'
      }
      // Pas de transfer_data ni application_fee_amount (modèle separate charges and transfers)
    });

    // 4. Retourner le clientSecret et le paymentIntentId
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (err) {
    console.error('Erreur création PaymentIntent:', err);
    res.status(500).json({ error: `Erreur Stripe: ${err.message}` });
  }
};
