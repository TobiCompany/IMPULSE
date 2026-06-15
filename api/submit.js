// Vercel Serverless Function – IMPULSE → WARP Postkorb

async function sendWarpWebhook(payload) {
  // Trim in case the env var contains extra text after the URL
  const warpUrl = (process.env.WARP_WEBHOOK_URL || '').trim().split(/\s+/)[0];
  const apiKey = process.env.WARP_API_KEY;

  if (!warpUrl) {
    console.warn('[IMPULSE] WARP_WEBHOOK_URL nicht gesetzt – Webhook übersprungen');
    return;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['X-API-Key'] = apiKey;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(warpUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`WARP returned ${res.status}: ${text}`);
    }
    console.log('[IMPULSE] Webhook OK:', res.status, text);
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let payload = req.body;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch { payload = null; }
  }

  if (!payload || !payload.userName || !payload.userEmail || !payload.recommendation) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log(`[IMPULSE] ${payload.userName} (${payload.userEmail}): ${payload.recommendation}`);

  try {
    await sendWarpWebhook(payload);
  } catch (err) {
    console.error('[IMPULSE] Webhook fehlgeschlagen (nicht kritisch):', err.message);
  }

  res.status(200).json({ success: true });
};
