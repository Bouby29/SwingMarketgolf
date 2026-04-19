const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const now = new Date();
  const cutoff48h = new Date(now - 48 * 60 * 60 * 1000).toISOString();

  // CAS 1: Acheteur a confirmé conforme → libération IMMEDIATE
  const { data: confirmed } = await supabase
    .from('orders')
    .select('*')
    .eq('payment_status', 'paid')
    .eq('seller_paid', false)
    .eq('buyer_confirmed', true)
    .eq('dispute', false);

  // CAS 2: Livré + acheteur n'a pas répondu sous 48h → libération automatique
  const { data: noResponse } = await supabase
    .from('orders')
    .select('*')
    .eq('payment_status', 'paid')
    .eq('seller_paid', false)
    .eq('status', 'delivered')
    .eq('buyer_confirmed', false)
    .eq('dispute', false)
    .lt('delivered_at', cutoff48h);

  // CAS 3: Litige (dispute: true) → on ne touche à RIEN
  const toRelease = [...(confirmed || []), ...(noResponse || [])];

  let released = 0;
  for (const order of toRelease) {
    await supabase.from('orders').update({
      seller_paid: true,
      seller_paid_at: now.toISOString(),
      release_reason: order.buyer_confirmed ? 'buyer_confirmed' : 'auto_48h'
    }).eq('id', order.id);
    released++;
  }

  res.status(200).json({ released });
};
