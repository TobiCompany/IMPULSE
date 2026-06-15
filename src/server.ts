import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import dotenv from 'dotenv';
import { sendEvaluationEmail, sendTestEmail, type EmailPayload } from './server/email.service';

dotenv.config();

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json());

// ---------------------------------------------------------------------------
// WARP Webhook: sendet das Auswertungsergebnis an den WARP-Postkorb
// ---------------------------------------------------------------------------
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
  if (!res.ok) {
    throw new Error(`WARP webhook returned ${res.status}: ${await res.text()}`);
  }
  console.log('[IMPULSE] WARP-Webhook erfolgreich:', res.status);
}

// ---------------------------------------------------------------------------
// POST /api/submit  –  Auswertungsergebnis empfangen und weiterleiten
// Ruft Email-Versand + WARP-Webhook parallel auf; gibt immer 200 zurück.
// ---------------------------------------------------------------------------
app.post('/api/submit', async (req, res) => {
  const payload: EmailPayload = req.body;

  if (!payload.userName || !payload.userEmail || !payload.recommendation || !payload.scores || !payload.rationale) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log(`[IMPULSE] Neue Auswertung für ${payload.userName} (${payload.userEmail}): ${payload.recommendation}`);

  const results = await Promise.allSettled([
    sendEvaluationEmail(payload),
    sendWarpWebhook(payload),
  ]);

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[IMPULSE] Aktion ${i === 0 ? 'E-Mail' : 'WARP-Webhook'} fehlgeschlagen:`, r.reason);
    }
  });

  res.json({ success: true });
});

// ---------------------------------------------------------------------------
// POST /api/send-email  –  direkter E-Mail-Versand (Legacy)
// ---------------------------------------------------------------------------
app.post('/api/send-email', async (req, res) => {
  try {
    const payload: EmailPayload = req.body;
    if (!payload.userName || !payload.userEmail || !payload.recommendation || !payload.scores || !payload.rationale || !payload.topFactors) {
      return res.status(400).json({ error: 'Missing required fields in payload' });
    }
    await sendEvaluationEmail(payload);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email endpoint error:', error);
    res.status(500).json({ error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/send-test-email
// ---------------------------------------------------------------------------
app.post('/api/send-test-email', async (req, res) => {
  try {
    await sendTestEmail();
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email endpoint error:', error);
    res.status(500).json({ error: 'Failed to send test email', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ---------------------------------------------------------------------------
// Statische Dateien + Angular SSR
// ---------------------------------------------------------------------------
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) throw error;
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
