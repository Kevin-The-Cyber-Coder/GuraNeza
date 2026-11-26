import SellerInvitation from '../models/SellerInvitation.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/error.js';
import { generateToken } from '../middleware/auth.js';
import { validatePasswordStrength } from '../utils/password.js';
import { withTransaction } from '../utils/transaction.js';
import { httpError } from '../utils/text.js';
import { maskEmail } from '../utils/tokens.js';
import { recordAudit } from '../services/audit.js';
import { sendEmail } from '../services/email.js';
import { sellerWelcomeEmail } from '../services/emailTemplates.js';
import { ensureShopForSeller } from '../services/shops.js';
import {
  findInvitationByToken,
  getInvitationState,
  invitationStateMessage,
} from '../services/invitations.js';

const serializeUser = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  address: user.address || '',
  role: user.role,
  avatar: user.avatar || '',
  isActive: user.isActive,
  createdAt: user.createdAt,
});

// @desc    Validate an activation link without consuming it
// @route   GET /api/seller-invitations/validate?token=...
// @access  Public
export const validateInvitation = asyncHandler(async (req, res) => {
  const invitation = await findInvitationByToken(req.query.token);
  const state = getInvitationState(invitation);

  if (state !== 'valid' || !invitation.user) {
    return res.status(400).json({
      success: false,
      code: state === 'valid' ? 'invalid' : state,
      message:
        state === 'valid'
          ? 'This activation link is not linked to a seller account.'
          : invitationStateMessage(state),
    });
  }

  res.json({
    success: true,
    invitation: {
      name: invitation.user.name,
      email: maskEmail(invitation.email),
      expiresAt: invitation.expiresAt,
    },
  });
});

// @desc    Set a seller password and activate the account
// @route   POST /api/seller-invitations/activate
// @access  Public
export const activateSeller = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const passwordErrors = validatePasswordStrength(password);
  if (passwordErrors.length) {
    return res.status(400).json({
      success: false,
      message: passwordErrors.join('. '),
      errors: passwordErrors.map((message) => ({ field: 'password', message })),
    });
  }

  const existing = await findInvitationByToken(token);
  const initialState = getInvitationState(existing);
  if (initialState !== 'valid') {
    return res.status(400).json({
      success: false,
      code: initialState,
      message: invitationStateMessage(initialState),
    });
  }
  if (!existing.user) {
    return res.status(400).json({
      success: false,
      code: 'invalid',
      message: 'This activation link is not linked to a seller account.',
    });
  }

  const user = await withTransaction(async (session) => {
    const invitationQuery = SellerInvitation.findById(existing._id);
    if (session) invitationQuery.session(session);
    const invitation = await invitationQuery;

    if (getInvitationState(invitation) !== 'valid') {
      throw httpError(400, invitationStateMessage(getInvitationState(invitation)));
    }

    const userQuery = User.findById(invitation.user).select('+password');
    if (session) userQuery.session(session);
    const seller = await userQuery;

    if (!seller) throw httpError(404, 'The seller account no longer exists.');
    if (!['seller', 'SELLER'].includes(String(seller.role))) {
      throw httpError(409, 'This account is not a seller account.');
    }

    seller.password = password;
    seller.isActive = true;
    seller.mustChangePassword = false;
    seller.emailVerifiedAt = new Date();
    await (session ? seller.save({ session }) : seller.save());

    invitation.usedAt = new Date();
    await (session ? invitation.save({ session }) : invitation.save());

    await SellerInvitation.updateMany(
      {
        user: seller._id,
        _id: { $ne: invitation._id },
        usedAt: null,
        revokedAt: null,
      },
      { $set: { revokedAt: new Date() } },
      session ? { session } : {}
    );

    return seller;
  });

  await ensureShopForSeller(user);

  await sendEmail(sellerWelcomeEmail(user));

  await recordAudit({
    req,
    actor: user._id,
    action: 'seller_account.activated',
    entityType: 'User',
    entityId: user._id,
    metadata: { email: user.email },
  });

  res.json({
    success: true,
    message: 'Your seller account is active. Welcome to GuraNeza!',
    token: generateToken(user._id),
    user: serializeUser(user),
  });
});
