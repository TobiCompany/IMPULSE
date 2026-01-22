import type { Transporter } from 'nodemailer';
import nodemailer from 'nodemailer';

export interface EmailPayload {
  userName: string;
  userEmail: string;
  recommendation: string;
  scores: Record<string, number>;
  rationale: string;
  topFactors: string[];
}

const TO_EMAIL = 'Tobias.Konken@wavestone.com';
const CC_EMAIL = 'Thomas.Kolm@wavestone.com';

/**
 * Create a nodemailer transporter for GMX SMTP
 */
function createTransporter(): Transporter {
  const user = process.env['GMX_EMAIL'] || '';
  const pass = process.env['GMX_PASSWORD'] || '';

  if (!user || !pass) {
    throw new Error(
      'GMX_EMAIL and GMX_PASSWORD environment variables are required'
    );
  }

  return nodemailer.createTransport({
    host: 'mail.gmx.net',
    port: 587,
    secure: false,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Build HTML email body from evaluation result
 */
function buildEmailBody(payload: EmailPayload): string {
  const scoresHtml = Object.entries(payload.scores)
    .map(
      ([key, value]) =>
        `<tr><td style="padding: 8px;"><strong>${key}</strong></td><td style="padding: 8px; text-align: right;">${value}/10</td></tr>`
    )
    .join('');

  const factorsHtml = payload.topFactors
    .map((factor) => `<li>${factor}</li>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .header { background-color: #0078d4; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; max-width: 600px; margin: 0 auto; }
          .section { margin-bottom: 20px; }
          .section h2 { color: #0078d4; border-bottom: 2px solid #0078d4; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          table, th, td { border: 1px solid #ddd; }
          th, td { padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; }
          .recommendation-box { background-color: #f0f7ff; border-left: 4px solid #0078d4; padding: 15px; margin-bottom: 15px; }
          .recommendation-box strong { color: #0078d4; font-size: 18px; }
          ul { line-height: 1.8; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Testprozess Berater - Evaluationsergebnis</h1>
        </div>
        <div class="content">
          <p>Hallo,</p>
          <p>anbei die Evaluationsergebnisse für <strong>${payload.userName}</strong> (${payload.userEmail}):</p>

          <div class="recommendation-box">
            <strong>Empfohlener Testprozess:</strong><br/>
            ${payload.recommendation}
          </div>

          <div class="section">
            <h2>Bewertungsscores</h2>
            <table>
              <tr>
                <th>Kategorie</th>
                <th>Score</th>
              </tr>
              ${scoresHtml}
            </table>
          </div>

          <div class="section">
            <h2>Begründung</h2>
            <p>${payload.rationale}</p>
          </div>

          <div class="section">
            <h2>Kernfaktoren</h2>
            <ul>
              ${factorsHtml}
            </ul>
          </div>

          <div class="footer">
            <p>Diese E-Mail wurde automatisch von Impulse Testprozess Berater generiert.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send evaluation result email via GMX
 */
export async function sendEvaluationEmail(payload: EmailPayload): Promise<void> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env['GMX_EMAIL'],
      to: TO_EMAIL,
      cc: CC_EMAIL,
      subject: `Testprozess Empfehlung für ${payload.userName}`,
      html: buildEmailBody(payload),
      text: `Testprozess Empfehlung: ${payload.recommendation}\n\nBegründung: ${payload.rationale}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

/**
 * Send a test email via GMX
 */
export async function sendTestEmail(): Promise<void> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env['GMX_EMAIL'],
      to: TO_EMAIL,
      cc: CC_EMAIL,
      subject: 'Test',
      text: 'Test',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Failed to send test email:', error);
    throw error;
  }
}
