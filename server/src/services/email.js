import env, { isTest } from '../config/env.js';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/**
 * Sends a transactional email through Resend.
 * Never throws: email failures are logged and returned so the calling
 * workflow (application, order, invitation) still succeeds.
 *
 * @returns {Promise<{sent:boolean, skipped?:boolean, id?:string, error?:string}>}
 */
export const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  if (isTest) return { sent: false, skipped: true };
  if (!env.RESEND_API_KEY) {
    console.warn(`[email] RESEND_API_KEY not configured. Skipped: "${subject}"`);
    return { sent: false, skipped: true, error: 'not-configured' };
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(text ? { text } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      signal: AbortSignal.timeout(15_000),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || `Resend responded with ${response.status}`;
      console.error(`[email] Failed to send "${subject}": ${message}`);
      return { sent: false, error: message };
    }

    return { sent: true, id: data.id };
  } catch (error) {
    console.error(`[email] Failed to send "${subject}": ${error.message}`);
    return { sent: false, error: error.message };
  }
};

export default sendEmail;
