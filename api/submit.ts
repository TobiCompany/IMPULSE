import type { IncomingMessage, ServerResponse } from 'node:http';
import { sendEvaluationEmail, type EmailPayload } from '../src/server/email.service';

async function sendWarpWebhook(payload: EmailPayload): Promise<void> {
  const url = process.env['WARP_WEBHOOK_URL'];
  const key = process.env['WARP_API_KEY'];
  if (!url) {
    console.warn('[IMPULSE] WARP_WEBHOOK_URL nicht gesetzt – Webhook übersprungen');
    return;
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (key) headers['X-API-Key'] = key;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`WARP webhook returned ${res.status}: ${await res.text()}`);
  console.log('[IMPULSE] WARP-Webhook erfolgreich:', res.status);
}

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const payload: EmailPayload = req.body;

  if (!payload?.userName || !payload?.userEmail || !payload?.recommendation) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing required fields' }));
    return;
  }

  console.log(`[IMPULSE] Neue Auswertung für ${payload.userName} (${payload.userEmail}): ${payload.recommendation}`);

  const results = await Promise.allSettled([
    sendEvaluationEmail(payload),
    sendWarpWebhook(payload),
  ]);

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[IMPULSE] ${i === 0 ? 'E-Mail' : 'WARP-Webhook'} fehlgeschlagen:`, r.reason);
    }
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true }));
}
