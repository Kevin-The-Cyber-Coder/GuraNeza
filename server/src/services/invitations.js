import SellerInvitation from '../models/SellerInvitation.js';
import env from '../config/env.js';
import { generateSecureToken, hashToken } from '../utils/tokens.js';

export const invitationTtlMs = env.SELLER_INVITE_TTL_HOURS * 60 * 60 * 1000;

/**
 * Creates a new single-use invitation and revokes any previous unused ones.
 * Returns the raw token exactly once; only its hash is persisted.
 */
export const createInvitation = async ({ application, user, createdBy, session }) => {
  const now = new Date();

  const revoke = SellerInvitation.updateMany(
    { application: application._id, usedAt: null, revokedAt: null },
    { $set: { revokedAt: now } }
  );
  if (session) revoke.session(session);
  await revoke;

  const rawToken = generateSecureToken();
  const expiresAt = new Date(Date.now() + invitationTtlMs);

  const [invitation] = await SellerInvitation.create(
    [
      {
        application: application._id,
        user: user._id,
        email: user.email,
        tokenHash: hashToken(rawToken),
        expiresAt,
        sentAt: now,
        createdBy,
      },
    ],
    session ? { session } : {}
  );

  return { invitation, rawToken, expiresAt };
};

export const buildActivationUrl = (rawToken) =>
  `${env.APP_URL.replace(/\/$/, '')}/seller/activate?token=${encodeURIComponent(rawToken)}`;

export const findInvitationByToken = async (rawToken) => {
  if (!rawToken || typeof rawToken !== 'string') return null;
  return SellerInvitation.findOne({ tokenHash: hashToken(rawToken) })
    .populate('user')
    .populate('application');
};

/**
 * @returns {'valid'|'invalid'|'used'|'revoked'|'expired'}
 */
export const getInvitationState = (invitation) => {
  if (!invitation) return 'invalid';
  if (invitation.usedAt) return 'used';
  if (invitation.revokedAt) return 'revoked';
  if (new Date(invitation.expiresAt).getTime() <= Date.now()) return 'expired';
  return 'valid';
};

export const invitationStateMessage = (state) => {
  switch (state) {
    case 'used':
      return 'This activation link has already been used. Please sign in or request a new invitation.';
    case 'revoked':
      return 'This activation link is no longer valid. Please request a new invitation.';
    case 'expired':
      return 'This activation link has expired. Please ask the GuraNeza team to resend your invitation.';
    default:
      return 'This activation link is invalid.';
  }
};
