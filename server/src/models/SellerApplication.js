import mongoose from 'mongoose';

export const APPLICATION_STATUSES = ['pending', 'approved', 'rejected'];

const sellerApplicationSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [120, 'Full name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [30, 'Phone number is too long'],
    },
    businessName: {
      type: String,
      trim: true,
      maxlength: [120, 'Business name cannot exceed 120 characters'],
      default: '',
    },
    businessLocation: {
      type: String,
      required: [true, 'Business location is required'],
      trim: true,
      maxlength: [200, 'Business location cannot exceed 200 characters'],
    },
    businessDescription: {
      type: String,
      required: [true, 'Business description is required'],
      trim: true,
      maxlength: [2000, 'Business description cannot exceed 2000 characters'],
    },
    businessCategory: {
      type: String,
      required: [true, 'Business category is required'],
      trim: true,
      maxlength: [80, 'Business category cannot exceed 80 characters'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for joining is required'],
      trim: true,
      maxlength: [1000, 'Reason cannot exceed 1000 characters'],
    },
    supportingInfo: {
      type: String,
      trim: true,
      maxlength: [2000, 'Supporting information cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: APPLICATION_STATUSES,
        message: '{VALUE} is not a valid application status',
      },
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [1000, 'Rejection reason cannot exceed 1000 characters'],
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

sellerApplicationSchema.index({ status: 1, createdAt: -1 });
sellerApplicationSchema.index({ email: 1, status: 1 });
sellerApplicationSchema.index({
  referenceNumber: 'text',
  fullName: 'text',
  email: 'text',
  businessName: 'text',
});

sellerApplicationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const SellerApplication = mongoose.model('SellerApplication', sellerApplicationSchema);
export default SellerApplication;
