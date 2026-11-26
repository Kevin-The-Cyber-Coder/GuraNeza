import crypto from 'node:crypto';

/** Cryptographically secure, URL-safe token (32 bytes = 256 bits). */
export const generateSecureToken = () => crypto.randomBytes(32).toString('base64url');

/** SHA-256 hash used to store invitation tokens at rest. */
export const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

/** Masks an email for public invitation validation responses. */
export const maskEmail = (email = '') => {
  const [local, domain] = String(email).split('@');
  if (!local || !domain) return '***';
  const visible = local.slice(0, 1);
  return `${visible}${'*'.repeat(Math.max(1, Math.min(local.length - 1, 4)))}@${domain}`;
};
