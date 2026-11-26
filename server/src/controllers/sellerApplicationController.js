import crypto from 'node:crypto';
import SellerApplication from '../models/SellerApplication.js';
import SellerInvitation from '../models/SellerInvitation.js';
import User from '../models/User.js';
import { isProd } from '../config/env.js';
import { asyncHandler } from '../middleware/error.js';
import { generateReference } from '../utils/reference.js';
import { withTransaction } from '../utils/transaction.js';
import { escapeRegex, httpError } from '../utils/text.js';
import { recordAudit } from '../services/audit.js';
import { sendEmail } from '../services/email.js';
import { notifyAdmins } from '../services/notifications.js';
import {
  adminNewSellerApplicationEmail,
  sellerApplicationApprovedEmail,
  sellerApplicationReceivedEmail,
  sellerApplicationRejectedEmail,
} from '../services/emailTemplates.js';
import {
  buildActivationUrl,
  createInvitation,
} from '../services/invitations.js';

const save = (doc, session) => (session ? doc.save({ session }) : doc.save());

const serializeApplication = (application) => ({
  id: application._id,
  referenceNumber: application.referenceNumber,
  fullName: application.fullName,
  email: application.email,
  phone: application.phone,
  businessName: application.businessName,
  businessLocation: application.businessLocation,
  businessDescription: application.businessDescription,
  businessCategory: application.businessCategory,
  reason: application.reason,
  supportingInfo: application.supportingInfo,
  status: application.status,
  rejectionReason: application.rejectionReason,
  reviewedAt: application.reviewedAt,
  createdAt: application.createdAt,
  updatedAt: application.updatedAt,
});

// @desc    Submit a seller application
// @route   POST /api/seller-applications
// @access  Public
export const createApplication = asyncHandler(async (req, res) => {
  const payload = req.body;

  const existingApplication = await SellerApplication.findOne({
    email: payload.email,
    status: { $in: ['pending', 'approved'] },
  }).lean();

  if (existingApplication) {
    return res.status(409).json({
      success: false,
      message:
        existingApplication.status === 'approved'
          ? 'This email already has an approved seller application. Please sign in or contact support.'
          : 'You already have a seller application under review.',
      referenceNumber: existingApplication.referenceNumber,
      status: existingApplication.status,
    });
  }

  const existingUser = await User.findOne({ email: payload.email }).select('role').lean();
  if (existingUser && ['seller', 'admin'].includes(existingUser.role)) {
    return res.status(409).json({
      success: false,
      message:
        existingUser.role === 'admin'
          ? 'Administrator accounts cannot apply to become sellers.'
          : 'This email is already registered as a seller. Please sign in to your seller account.',
    });
  }

  let application;
  for (let attempt = 0; attempt < 5 && !application; attempt += 1) {
    try {
      application = await SellerApplication.create({
        ...payload,
        referenceNumber: generateReference('SA'),
      });
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.referenceNumber) continue;
      throw error;
    }
  }

  if (!application) {
    return res.status(500).json({
      success: false,
      message: 'Could not generate an application reference. Please try again.',
    });
  }

  const [applicantEmail] = await Promise.all([
    sendEmail(sellerApplicationReceivedEmail(application)),
    sendEmail(adminNewSellerApplicationEmail(application)),
  ]);

  await recordAudit({
    req,
    action: 'seller_application.submitted',
    entityType: 'SellerApplication',
    entityId: application._id,
    metadata: { referenceNumber: application.referenceNumber, email: application.email },
  });

  await notifyAdmins({
    type: 'seller_application.submitted',
    title: 'New seller application',
    message: `${application.fullName} (${application.email}) applied to become a seller.`,
    link: '/admin/seller-applications',
    metadata: { applicationId: application._id, referenceNumber: application.referenceNumber },
  });

  res.status(201).json({
    success: true,
    message:
      'Your seller application has been submitted. We will review it and contact you by email.',
    application: serializeApplication(application),
    emailSent: applicantEmail.sent,
  });
});

// @desc    Check an application status with reference number + email
// @route   POST /api/seller-applications/status
// @access  Public
export const getApplicationStatus = asyncHandler(async (req, res) => {
  const { referenceNumber, email } = req.body;

  const application = await SellerApplication.findOne({
    referenceNumber: referenceNumber.trim().toUpperCase(),
    email,
  }).lean();

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'No application found with that reference number and email address.',
    });
  }

  res.json({
    success: true,
    application: {
      referenceNumber: application.referenceNumber,
      fullName: application.fullName,
      businessName: application.businessName,
      businessCategory: application.businessCategory,
      status: application.status,
      submittedAt: application.createdAt,
      reviewedAt: application.reviewedAt,
      rejectionReason:
        application.status === 'rejected' ? application.rejectionReason : undefined,
    },
  });
});

// @desc    List seller applications (admin)
// @route   GET /api/seller-applications
// @access  Admin
export const listApplications = asyncHandler(async (req, res) => {
  const { status, search, page, limit } = req.query;

  const filter = {};
  if (status !== 'all') filter.status = status;

  if (search) {
    const safe = escapeRegex(search);
    filter.$or = [
      { referenceNumber: { $regex: safe, $options: 'i' } },
      { fullName: { $regex: safe, $options: 'i' } },
      { email: { $regex: safe, $options: 'i' } },
      { businessName: { $regex: safe, $options: 'i' } },
      { phone: { $regex: safe, $options: 'i' } },
    ];
  }

  const [applications, total, statusAgg] = await Promise.all([
    SellerApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('reviewedBy', 'name email')
      .populate('user', 'role isActive')
      .lean(),
    SellerApplication.countDocuments(filter),
    SellerApplication.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const counts = { pending: 0, approved: 0, rejected: 0, total: 0 };
  for (const entry of statusAgg) {
    counts[entry._id] = entry.count;
    counts.total += entry.count;
  }

  res.json({
    success: true,
    applications,
    counts,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    total,
  });
});

// @desc    Get one seller application (admin)
// @route   GET /api/seller-applications/:id
// @access  Admin
export const getApplication = asyncHandler(async (req, res) => {
  const application = await SellerApplication.findById(req.params.id)
    .populate('reviewedBy', 'name email')
    .populate('user', 'name email role isActive lastLogin')
    .lean();

  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  const invitation = await SellerInvitation.findOne({ application: application._id })
    .sort({ createdAt: -1 })
    .select('-tokenHash')
    .lean();

  res.json({ success: true, application, invitation });
});

// @desc    Approve an application, create the seller account and send the invitation
// @route   PATCH /api/seller-applications/:id/approve
// @access  Admin
export const approveApplication = asyncHandler(async (req, res) => {
  const result = await withTransaction(async (session) => {
    const applicationQuery = SellerApplication.findById(req.params.id);
    if (session) applicationQuery.session(session);
    const application = await applicationQuery;

    if (!application) throw httpError(404, 'Application not found');
    if (application.status === 'approved') {
      throw httpError(409, 'This application has already been approved.');
    }
    if (application.status === 'rejected') {
      throw httpError(409, 'A rejected application cannot be approved. Ask the applicant to reapply.');
    }

    const userQuery = User.findOne({ email: application.email }).select('+password');
    if (session) userQuery.session(session);
    let user = await userQuery;

    if (user?.role === 'admin') {
      throw httpError(409, 'Administrator accounts cannot be converted into sellers.');
    }
    if (user?.role === 'seller' && user.isActive) {
      throw httpError(409, 'This email already belongs to an active seller account.');
    }

    const temporaryPassword = `Gz-${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(4).toString('hex')}`;

    if (!user) {
      const [created] = await User.create(
        [
          {
            name: application.fullName,
            email: application.email,
            phone: application.phone,
            address: application.businessLocation,
            password: temporaryPassword,
            role: 'seller',
            isActive: false,
            mustChangePassword: true,
          },
        ],
        session ? { session } : {}
      );
      user = created;
    } else {
      user.role = 'seller';
      user.isActive = false;
      user.name = user.name || application.fullName;
      user.password = temporaryPassword;
      user.mustChangePassword = true;
      await save(user, session);
    }

    const { invitation, rawToken, expiresAt } = await createInvitation({
      application,
      user,
      createdBy: req.user._id,
      session,
    });

    application.status = 'approved';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    application.rejectionReason = '';
    application.user = user._id;
    await save(application, session);

    return { application, user, invitation, rawToken, expiresAt, temporaryPassword };
  });

  const activationUrl = buildActivationUrl(result.rawToken);
  const emailResult = await sendEmail(
    sellerApplicationApprovedEmail({
      application: result.application,
      activationUrl,
      expiresAt: result.expiresAt,
    })
  );

  await recordAudit({
    req,
    action: 'seller_application.approved',
    entityType: 'SellerApplication',
    entityId: result.application._id,
    metadata: {
      referenceNumber: result.application.referenceNumber,
      sellerId: result.user._id,
      emailSent: emailResult.sent,
    },
  });

  res.json({
    success: true,
    message: emailResult.sent
      ? 'Application approved. Activation email sent and temporary credentials generated.'
      : 'Application approved. Activation email could not be sent, but temporary credentials were generated.',
    application: serializeApplication(result.application),
    emailSent: emailResult.sent,
    emailError: emailResult.sent ? undefined : emailResult.error,
    expiresAt: result.expiresAt,
    // Development convenience only. Production never exposes the raw token.
    activationUrl: isProd ? undefined : activationUrl,
    // Shown once to the approving admin. Never emailed.
    temporaryPassword: result.temporaryPassword,
    temporaryCredentials: {
      email: result.user.email,
      password: result.temporaryPassword,
    },
  });
});

// @desc    Reject an application
// @route   PATCH /api/seller-applications/:id/reject
// @access  Admin
export const rejectApplication = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const application = await SellerApplication.findOneAndUpdate(
    { _id: req.params.id, status: 'pending' },
    {
      $set: {
        status: 'rejected',
        rejectionReason: reason,
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!application) {
    const exists = await SellerApplication.findById(req.params.id).select('status').lean();
    if (!exists) return res.status(404).json({ success: false, message: 'Application not found' });
    return res.status(409).json({
      success: false,
      message: `This application is already ${exists.status}.`,
    });
  }

  await SellerInvitation.updateMany(
    { application: application._id, usedAt: null, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );

  const emailResult = await sendEmail(sellerApplicationRejectedEmail({ application }));

  await recordAudit({
    req,
    action: 'seller_application.rejected',
    entityType: 'SellerApplication',
    entityId: application._id,
    metadata: {
      referenceNumber: application.referenceNumber,
      reason,
      emailSent: emailResult.sent,
    },
  });

  res.json({
    success: true,
    message: emailResult.sent
      ? 'Application rejected and the applicant has been notified.'
      : 'Application rejected. The notification email could not be sent.',
    application: serializeApplication(application),
    emailSent: emailResult.sent,
    emailError: emailResult.sent ? undefined : emailResult.error,
  });
});

// @desc    Resend the activation invitation for an approved application
// @route   POST /api/seller-applications/:id/resend-invitation
// @access  Admin
export const resendInvitation = asyncHandler(async (req, res) => {
  const result = await withTransaction(async (session) => {
    const applicationQuery = SellerApplication.findById(req.params.id);
    if (session) applicationQuery.session(session);
    const application = await applicationQuery;

    if (!application) throw httpError(404, 'Application not found');
    if (application.status !== 'approved') {
      throw httpError(409, 'Only approved applications can receive an activation invitation.');
    }

    if (!application.user) {
      throw httpError(409, 'This application does not have a linked seller account yet.');
    }

    const userQuery = User.findById(application.user);
    if (session) userQuery.session(session);
    const user = await userQuery;
    if (!user || user.role !== 'seller') {
      throw httpError(409, 'The seller account for this application could not be found.');
    }
    if (user.isActive) {
      throw httpError(409, 'This seller account is already active.');
    }

    const invitationResult = await createInvitation({
      application,
      user,
      createdBy: req.user._id,
      session,
    });

    return { application, user, ...invitationResult };
  });

  const activationUrl = buildActivationUrl(result.rawToken);
  const emailResult = await sendEmail(
    sellerApplicationApprovedEmail({
      application: result.application,
      activationUrl,
      expiresAt: result.expiresAt,
    })
  );

  await recordAudit({
    req,
    action: 'seller_application.invitation_resent',
    entityType: 'SellerApplication',
    entityId: result.application._id,
    metadata: {
      referenceNumber: result.application.referenceNumber,
      emailSent: emailResult.sent,
    },
  });

  res.json({
    success: true,
    message: emailResult.sent
      ? 'A new activation email has been sent.'
      : 'A new invitation was created, but the email could not be sent.',
    emailSent: emailResult.sent,
    emailError: emailResult.sent ? undefined : emailResult.error,
    expiresAt: result.expiresAt,
    activationUrl: isProd ? undefined : activationUrl,
  });
});
