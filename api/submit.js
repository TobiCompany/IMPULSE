// Vercel Serverless Function (JS) – IMPULSE → WARP Postkorb

const https = require('https');
const { URL } = require('url');

function sendWarpWebhook(payload) {
  return new Promise((resolve, reject) => {
    const warpUrl = process.env.WARP_WEBHOOK_URL;
    const apiKey  = process.env.WARP_API_KEY;

    if (!warpUrl) {
      console.warn('[IMPULSE] WARP_WEBHOOK_URL nicht gesetzt');
      return resolve();
    }

    const body = JSON.stringify(payload);
    const parsed = new URL(warpUrl);

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      },
    };

    const protocol = parsed.protocol === 'https:' ? require('https') : require('http');

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('[IMPULSE] WARP-Webhook OK:', res.statusCode);
          resolve();
        } else {
          reject(new Error(`WARP webhook ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = req.body;

    if (!payload || !payload.userName || !payload.userEmail || !payload.recommendation) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    console.log(`[IMPULSE] ${payload.userName} (${payload.userEmail}): ${payload.recommendation}`);

    await sendWarpWebhook(payload);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[IMPULSE] api/submit Fehler:', err.message);
    res.status(500).json({ error: err.message || String(err) });
  }
};
