// Vercel Serverless Function – IMPULSE → WARP Postkorb
// Uses native fetch (Node.js 18+); debug mode active until webhook is confirmed working.

async function sendWarpWebhook(payload) {
  // Take only the first word in case the env var has extra text (e.g. "https://... WARP_API_KEY")
  const warpUrl = (process.env.WARP_WEBHOOK_URL || '').trim().split(/\s+/)[0];
  const apiKey = process.env.WARP_API_KEY;

  if (!warpUrl) {
    throw new Error('WARP_WEBHOOK_URL not set');
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
    return { status: res.status, body: text };
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
    return res.status(400).json({ error: 'Missing required fields', received: payload });
  }

  const debug = {
    warpUrl: process.env.WARP_WEBHOOK_URL || '(not set)',
    hasApiKey: !!process.env.WARP_API_KEY,
    webhookResult: null,
    webhookError: null,
  };

  try {
    const result = await sendWarpWebhook(payload);
    debug.webhookResult = result;
    console.log('[IMPULSE] Webhook OK:', result);
  } catch (err) {
    debug.webhookError = err.message;
    console.error('[IMPULSE] Webhook failed:', err.message);
  }

  res.status(200).json({ success: true, debug });
};
