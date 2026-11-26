import mongoose from 'mongoose';

const sellerInvitationSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerApplication',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Only the SHA-256 hash is stored. The raw token exists only in the email link.
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    usedAt: {
      type: Date,
    },
    revokedAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

sellerInvitationSchema.index({ application: 1, usedAt: 1, revokedAt: 1 });

sellerInvitationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.tokenHash;
    delete ret.__v;
    return ret;
  },
});

const SellerInvitation = mongoose.model('SellerInvitation', sellerInvitationSchema);
export default SellerInvitation;
