import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

const statusTimelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for guest checkout
    },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
    },
    shipping: {
      address: { type: String, required: true, trim: true },
      city: { type: String, default: 'Kigali' },
      district: { type: String, default: '' },
      country: { type: String, default: 'Rwanda' },
      notes: { type: String, default: '' },
    },
    items: {
      type: [orderItemSchema],
      validate: [function (v) { return v.length > 0; }, 'An order must contain at least one item'],
    },
    pricing: {
      subtotal: { type: Number, required: true },
      shippingFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['cash-on-delivery', 'mobile-money', 'bank-transfer'],
      default: 'cash-on-delivery',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    timeline: {
      type: [statusTimelineSchema],
      default: () => [{ status: 'Pending', note: 'Order placed successfully', date: new Date() }],
    },
  },
  { timestamps: true }
);

// Human-friendly order number: GN-YYYYMMDD-XXXX
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const stamp = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `GN-${stamp}-${random}`;
  }
  next();
});

orderSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
