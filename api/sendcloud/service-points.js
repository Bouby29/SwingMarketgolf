import { Buffer } from 'buffer';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { postal_code, carrier, country = 'fr', radius = 5000 } = req.query;

  if (!postal_code) {
    return res.status(400).json({ error: 'postal_code required' });
  }

  const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
  const secretKey = process.env.SENDCLOUD_SECRET_KEY;

  if (!publicKey || !secretKey) {
    return res.status(500).json({ error: 'Sendcloud not configured' });
  }

  const auth = Buffer.from(`${publicKey}:${secretKey}`).toString('base64');

  // Map nos carrier_code internes vers les codes Sendcloud officiels
  const carrierMap = {
    mondial_relay: 'mondial_relay',
    chronopost_relay: 'chronopost',
    colissimo: 'colissimo',
    chronopost_dom: 'chronopost',
    fedex: 'fedex',
  };

  const sendcloudCarrier = carrierMap[carrier] || carrier;

  try {
    const url = new URL('https://servicepoints.sendcloud.sc/api/v2/service-points/');
    url.searchParams.set('country', country);
    url.searchParams.set('postal_code', postal_code);
    url.searchParams.set('radius', radius);
    if (sendcloudCarrier) {
      url.searchParams.set('carrier', sendcloudCarrier);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Sendcloud Service Points error:', response.status, text);
      return res
        .status(response.status)
        .json({ error: 'Sendcloud API error', detail: text });
    }

    const data = await response.json();
    const limited = Array.isArray(data) ? data.slice(0, 10) : data;

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(limited);
  } catch (err) {
    console.error('Service Points fetch failed:', err);
    return res.status(500).json({ error: 'Internal error', detail: err.message });
  }
}
