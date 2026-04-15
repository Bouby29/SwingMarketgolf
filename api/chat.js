import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pnhiuifejnnklbfpjmdr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuaGl1aWZlam5ua2xiZnBqbWRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY5MDc4NSwiZXhwIjoyMDg5MjY2Nzg1fQ.pdIrv8cLFbTEJATtDVAqgAODYEJKHS7n_g6BE4ft0qU'
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;

    // Detecter la categorie demandee
    const allUserText = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase()).join(' ');
    let categoryFilter = null;
    if (allUserText.match(/driver|bois|wood/)) categoryFilter = 'Clubs de golf';
    else if (allUserText.match(/fer|iron|wedge|putter|club/)) categoryFilter = 'Clubs de golf';
    else if (allUserText.match(/balle|ball/)) categoryFilter = 'Balles de golf';
    else if (allUserText.match(/sac|bag|trolley/)) categoryFilter = 'Sacs de golf';
    else if (allUserText.match(/chariot|caddy|cart/)) categoryFilter = 'Chariots';
    else if (allUserText.match(/vetement|chaussure|gant|casquette|textile/)) categoryFilter = 'Vetements';
    else if (allUserText.match(/accessoire|tee|marqueur/)) categoryFilter = 'Accessoires';

    let productsContext = '';
    if (true) {
      let query = supabase
        .from('products')
        .select('id, title, price, condition, category')
        .eq('status', 'active')
        .not('title', 'ilike', '%test%');
      if (categoryFilter) query = query.eq('category', categoryFilter);
      const { data: products } = await query.limit(5);

      if (products && products.length > 0) {
        productsContext = 'Voici les produits disponibles sur SwingMarketGolf en ce moment:\n' +
          products.map(p => 
            p.title + ' - ' + p.price + 'EUR - ' + (p.condition || '') + ' - Lien: https://swingmarketgolf.com/ProductDetail?id=' + p.id
          ).join('\n');
      }
      else {
        productsContext = 'IMPORTANT: Aucune annonce disponible dans cette categorie. Reponds exactement: Je n ai pas de materiel disponible en ce moment dans cette categorie sur SwingMarketGolf. Reviens regulierement, de nouvelles annonces sont ajoutees chaque jour ! Tu peux aussi poster ta recherche ici pour alerter les vendeurs : https://swingmarketgolf.com/CreateListing'
      }
    }

    const systemPrompt = 'Tu es Alexandre, membre de l equipe SwingMarketGolf, marketplace francaise de materiel de golf d occasion. Tu as deux roles : 1) SUPPORT : reponds aux questions sur la plateforme (paiement Stripe, livraison Sendcloud, compte, annonces). 2) COACH GOLF : quand l utilisateur cherche du materiel, recommande UNIQUEMENT les produits de la liste ci-dessous avec leur lien exact. Ne jamais inventer de produits. Toujours en francais, tutoiement, reponses courtes.\n\n' + productsContext;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.VITE_GROQ_API_KEY },
      body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'system', content: systemPrompt }, ...messages], max_tokens: 500, temperature: 0.7 })
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}