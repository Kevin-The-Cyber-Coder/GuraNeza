import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [180],
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      enum: {
        values: [
          'Electronics',
          'Fashion',
          'Home & Living',
          'Beauty',
          'Groceries',
          'Sports',
          'Books',
          'Other',
        ],
        message: '{VALUE} is not a supported category',
      },
    },
    brand: {
      type: String,
      trim: true,
      default: 'GuraNeza',
    },
    images: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Generate a URL-friendly slug from the name.
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.slice(0, 160);
  }
  next();
});

// Simple text search index.
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
