// Vercel Serverless Function – IMPULSE → WARP Postkorb

const https = require('https');
const http = require('http');
const { URL } = require('url');

const TIMEOUT_MS = 8000;

function sendWarpWebhook(payload) {
  return new Promise((resolve, reject) => {
    const warpUrl = process.env.WARP_WEBHOOK_URL;
    const apiKey = process.env.WARP_API_KEY;

    if (!warpUrl) {
      return reject(new Error('WARP_WEBHOOK_URL not set in environment'));
    }

    let parsed;
    try {
      parsed = new URL(warpUrl);
    } catch (e) {
      return reject(new Error('Invalid WARP_WEBHOOK_URL: ' + e.message));
    }

    const body = JSON.stringify(payload);
    const isHttps = parsed.protocol === 'https:';
    const transport = isHttps ? https : http;

    const options = {
      hostname: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : (isHttps ? 443 : 80),
      path: parsed.pathname + (parsed.search || ''),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      },
    };

    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body: data });
        } else {
          reject(new Error(`WARP returned ${res.statusCode}: ${data}`));
        }
      });
    });

    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy(new Error(`Timeout after ${TIMEOUT_MS}ms`));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
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
    hasWarpUrl: !!process.env.WARP_WEBHOOK_URL,
    warpHost: process.env.WARP_WEBHOOK_URL
      ? (() => { try { return new URL(process.env.WARP_WEBHOOK_URL).hostname; } catch { return 'invalid-url'; } })()
      : null,
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
