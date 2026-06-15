// Vercel Serverless Function – empfängt IMPULSE-Auswertung,
// sendet an WARP-Webhook (und optional per E-Mail).

export const config = { api: { bodyParser: true } };

async function sendWarpWebhook(payload: Record<string, unknown>): Promise<void> {
  const url = process.env['WARP_WEBHOOK_URL'];
  const key = process.env['WARP_API_KEY'];
  if (!url) {
    console.warn('[IMPULSE] WARP_WEBHOOK_URL nicht gesetzt');
    return;
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (key) headers['X-API-Key'] = key;
  const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(`WARP webhook ${r.status}: ${await r.text()}`);
  console.log('[IMPULSE] WARP-Webhook OK:', r.status);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;

    if (!payload?.userName || !payload?.userEmail || !payload?.recommendation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`[IMPULSE] ${payload.userName} (${payload.userEmail}): ${payload.recommendation}`);

    await sendWarpWebhook(payload);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[IMPULSE] api/submit Fehler:', err);
    res.status(500).json({ error: String(err) });
  }
}
