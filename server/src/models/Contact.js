import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: { type: String, default: '', trim: true },
    subject: { type: String, default: 'General enquiry', trim: true },
    message: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['New', 'Read', 'Replied', 'Closed'],
      default: 'New',
    },
    reply: { type: String, default: '' },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
