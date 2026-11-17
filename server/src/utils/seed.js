import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Contact from '../models/Contact.js';

dotenv.config();

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const PRODUCTS = [
  {
    name: 'Studio Wireless Headphones',
    category: 'Electronics',
    brand: 'SoundCore',
    price: 89000,
    oldPrice: 115000,
    stock: 24,
    rating: 4.8,
    numReviews: 128,
    featured: true,
    tags: ['audio', 'wireless', 'trending'],
    images: [img('photo-1505740420928-5e560c06d30e'), img('photo-1484704849700-f032a568e944')],
    description: 'Immerse yourself in rich, crystal-clear sound with deep bass and active noise cancellation. Up to 40 hours of battery life, Bluetooth 5.3 and ultra-soft ear cushions make these perfect for work, travel and everyday life in Kigali.',
  },
  {
    name: 'Smart Watch Pro',
    category: 'Electronics',
    brand: 'Nova',
    price: 145000,
    oldPrice: 175000,
    stock: 15,
    rating: 4.7,
    numReviews: 86,
    featured: true,
    tags: ['wearable', 'fitness', 'smart'],
    images: [img('photo-1523275335684-37898b6baf30'), img('photo-1546868871-7041f2a55e12')],
    description: 'Track your heart rate, steps, sleep and workouts with a bright AMOLED display. Water resistant, GPS enabled and compatible with both Android and iOS.',
  },
  {
    name: 'Mirrorless Camera Kit',
    category: 'Electronics',
    brand: 'Luma',
    price: 690000,
    oldPrice: 0,
    stock: 6,
    rating: 4.9,
    numReviews: 41,
    featured: true,
    tags: ['camera', 'photography', 'premium'],
    images: [img('photo-1526170375885-4d8ecf77b99f'), img('photo-1516035069371-29a1b244cc32')],
    description: 'Capture Kigali in stunning detail with a 24MP sensor, 4K video and a versatile 18-55mm lens. Includes carrying bag, extra battery and 64GB memory card.',
  },
  {
    name: 'Classic Sunglasses',
    category: 'Fashion',
    brand: 'Aura',
    price: 28000,
    oldPrice: 35000,
    stock: 48,
    rating: 4.5,
    numReviews: 64,
    featured: false,
    tags: ['accessories', 'summer'],
    images: [img('photo-1572635196237-14b3f281503f')],
    description: 'Timeless aviator frames with UV400 polarized lenses. Lightweight, comfortable and designed to look great all year round.',
  },
  {
    name: 'Everyday Leather Backpack',
    category: 'Fashion',
    brand: 'Kigali Craft',
    price: 55000,
    oldPrice: 0,
    stock: 32,
    rating: 4.8,
    numReviews: 93,
    featured: true,
    tags: ['bag', 'leather', 'local'],
    images: [img('photo-1553062407-98eeb64c6a62'), img('photo-1584917865442-de89df76afd3')],
    description: 'Handcrafted in Rwanda from genuine leather. Padded laptop compartment, water-resistant lining and durable zippers — built for the everyday journey.',
  },
  {
    name: 'Running Sneakers',
    category: 'Fashion',
    brand: 'Stride',
    price: 72000,
    oldPrice: 90000,
    stock: 27,
    rating: 4.6,
    numReviews: 112,
    featured: false,
    tags: ['shoes', 'sports', 'sale'],
    images: [img('photo-1542291026-7eec264c27ff'), img('photo-1600185365483-26d7a4cc7519')],
    description: 'Lightweight mesh upper with responsive cushioning for maximum comfort. Perfect for running, walking or a full day around town.',
  },
  {
    name: 'Modern Lounge Sofa',
    category: 'Home & Living',
    brand: 'Imanzi Home',
    price: 420000,
    oldPrice: 480000,
    stock: 8,
    rating: 4.7,
    numReviews: 28,
    featured: true,
    tags: ['furniture', 'living room'],
    images: [img('photo-1555041469-a586c61ea9bc'), img('photo-1567016432779-094069958ea5')],
    description: 'A stylish three-seater sofa with a solid wood frame and high-density foam cushions. Upholstered in easy-to-clean fabric that complements any modern home.',
  },
  {
    name: 'Ceramic Dinner Set (12 pcs)',
    category: 'Home & Living',
    brand: 'Imanzi Home',
    price: 48000,
    oldPrice: 0,
    stock: 40,
    rating: 4.4,
    numReviews: 57,
    featured: false,
    tags: ['kitchen', 'ceramic'],
    images: [img('photo-1514228742587-6b1558fcca3d')],
    description: 'Hand-glazed ceramic dinnerware set for four. Oven, microwave and dishwasher safe. Bring warmth and elegance to every meal.',
  },
  {
    name: 'Indoor Plant & Pot',
    category: 'Home & Living',
    brand: 'GreenCorner',
    price: 22000,
    oldPrice: 0,
    stock: 55,
    rating: 4.6,
    numReviews: 73,
    featured: false,
    tags: ['plants', 'decor'],
    images: [img('photo-1416879595882-3373a0480b5b'), img('photo-1485955900006-10f4d324d411')],
    description: 'Easy-care Monstera in a handmade ceramic pot. A beautiful way to bring a touch of nature and fresh air into your living space.',
  },
  {
    name: 'Glow Skincare Set',
    category: 'Beauty',
    brand: 'Murage Beauty',
    price: 39000,
    oldPrice: 52000,
    stock: 34,
    rating: 4.8,
    numReviews: 145,
    featured: true,
    tags: ['skincare', 'beauty', 'local'],
    images: [img('photo-1596462502278-27bfdc403348'), img('photo-1556228720-195a672e8a03')],
    description: 'A complete daily skincare routine: gentle cleanser, vitamin C serum, moisturizer and SPF. Made for all skin types with naturally inspired ingredients.',
  },
  {
    name: 'Argan Hair Oil',
    category: 'Beauty',
    brand: 'Murage Beauty',
    price: 18500,
    oldPrice: 0,
    stock: 62,
    rating: 4.5,
    numReviews: 89,
    featured: false,
    tags: ['hair', 'oil'],
    images: [img('photo-1522335789203-aabd1fc54bc9')],
    description: 'Pure argan oil that nourishes and repairs dry hair, adds shine and reduces frizz. Lightweight, non-greasy formula.',
  },
  {
    name: 'Rwanda Organic Coffee (500g)',
    category: 'Groceries',
    brand: 'Umurage Farm',
    price: 12500,
    oldPrice: 15000,
    stock: 120,
    rating: 4.9,
    numReviews: 210,
    featured: true,
    tags: ['coffee', 'organic', 'local', 'rwanda'],
    images: [img('photo-1447933601403-0c6688de566e'), img('photo-1495474472287-4d71bcdd2085')],
    description: 'Premium Arabica beans grown in the highlands of Rwanda. Medium roast with notes of chocolate, red fruit and a smooth caramel finish. Freshly roasted.',
  },
  {
    name: 'Raw Wildflower Honey',
    category: 'Groceries',
    brand: 'Umurage Farm',
    price: 9800,
    oldPrice: 0,
    stock: 85,
    rating: 4.7,
    numReviews: 96,
    featured: false,
    tags: ['honey', 'organic', 'local'],
    images: [img('photo-1587049352851-8d4e89133924')],
    description: '100% pure, unfiltered honey collected from localRwandan beekeepers. Rich in flavour and natural antioxidants.',
  },
  {
    name: 'Yoga Mat & Carry Strap',
    category: 'Sports',
    brand: 'Stride',
    price: 32000,
    oldPrice: 0,
    stock: 45,
    rating: 4.5,
    numReviews: 51,
    featured: false,
    tags: ['fitness', 'yoga'],
    images: [img('photo-1592432678016-e910b452f9a2'), img('photo-1544367567-0f2fcb009e0b')],
    description: 'Non-slip, eco-friendly TPE yoga mat with excellent cushioning. Includes a carry strap for easy transport to class or the park.',
  },
  {
    name: 'Adjustable Dumbbell Set',
    category: 'Sports',
    brand: 'Stride',
    price: 95000,
    oldPrice: 120000,
    stock: 18,
    rating: 4.6,
    numReviews: 38,
    featured: false,
    tags: ['fitness', 'weights'],
    images: [img('photo-1584735175315-9d5df23860e6')],
    description: 'Space-saving adjustable dumbbells from 5kg to 25kg per pair. Perfect for a complete home workout.',
  },
  {
    name: 'The Art of Focus (Hardcover)',
    category: 'Books',
    brand: 'Urugo Books',
    price: 16500,
    oldPrice: 0,
    stock: 70,
    rating: 4.4,
    numReviews: 44,
    featured: false,
    tags: ['books', 'self help'],
    images: [img('photo-1544947950-fa07a98d237f'), img('photo-1512820790803-83ca734da794')],
    description: 'A practical guide to building deep focus and intentional habits in a distracted world. A great addition to any personal library.',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/guraneza');
    console.log('[Seed] Connected to MongoDB');

    // Keep the database idempotent by clearing existing data (dev only).
    await Promise.all([
      Product.deleteMany({}),
      Order.deleteMany({}),
      Contact.deleteMany({}),
      User.deleteMany({ email: { $in: [
        (process.env.ADMIN_EMAIL || 'admin@guraneza.rw').toLowerCase(),
        'demo@guraneza.rw',
      ] } }),
    ]);
    console.log('[Seed] Cleared existing demo data');

    // Admin account
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'GuraNeza Admin',
      email: (process.env.ADMIN_EMAIL || 'admin@guraneza.rw').toLowerCase(),
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      phone: '+250 788 000 000',
      address: 'Kigali, Rwanda',
    });

    // Demo customer
    const demo = await User.create({
      name: 'Demo Customer',
      email: 'demo@guraneza.rw',
      password: 'Demo@123',
      role: 'user',
      phone: '+250 788 123 456',
      address: 'Gasabo District, Kigali',
    });

    // Products (slug is generated by a pre-save hook, which insertMany skips)
    const products = await Product.insertMany(
      PRODUCTS.map((product) => ({
        ...product,
        slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        shortDescription: product.description.slice(0, 160),
      }))
    );
    console.log(`[Seed] Created ${products.length} products`);

    // Sample orders so the admin dashboard has data on first run
    const first = products[0];
    const second = products[11];
    const third = products[4];
    const now = Date.now();
    await Order.insertMany([
      {
        orderNumber: `GN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-1001`,
        user: demo._id,
        customer: { name: demo.name, email: demo.email, phone: demo.phone },
        shipping: { address: demo.address, city: 'Kigali', district: 'Gasabo' },
        items: [
          { product: first._id, name: first.name, image: first.images[0], price: first.price, quantity: 1 },
          { product: second._id, name: second.name, image: second.images[0], price: second.price, quantity: 2 },
        ],
        pricing: { subtotal: first.price + second.price * 2, shippingFee: 2000, discount: 0, total: first.price + second.price * 2 + 2000 },
        paymentMethod: 'mobile-money',
        status: 'Processing',
        timeline: [
          { status: 'Pending', note: 'Order placed successfully', date: new Date(now - 86400000 * 2) },
          { status: 'Processing', note: 'We are preparing your order', date: new Date(now - 86400000) },
        ],
        createdAt: new Date(now - 86400000 * 2),
      },
      {
        orderNumber: `GN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-1002`,
        user: null,
        customer: { name: 'Alice Uwimana', email: 'alice@example.com', phone: '+250 789 111 222' },
        shipping: { address: 'Nyarugenge, Kigali', city: 'Kigali', district: 'Nyarugenge' },
        items: [{ product: third._id, name: third.name, image: third.images[0], price: third.price, quantity: 1 }],
        pricing: { subtotal: third.price, shippingFee: 2000, discount: 0, total: third.price + 2000 },
        paymentMethod: 'cash-on-delivery',
        status: 'Delivered',
        timeline: [
          { status: 'Pending', note: 'Order placed successfully', date: new Date(now - 86400000 * 5) },
          { status: 'Processing', note: 'Preparing your order', date: new Date(now - 86400000 * 4) },
          { status: 'Shipped', note: 'Out for delivery', date: new Date(now - 86400000 * 3) },
          { status: 'Delivered', note: 'Delivered successfully', date: new Date(now - 86400000 * 2) },
        ],
        createdAt: new Date(now - 86400000 * 5),
      },
    ]);

    await Contact.insertMany([
      {
        name: 'Jean Paul',
        email: 'jeanpaul@example.com',
        phone: '+250 788 555 444',
        subject: 'Delivery question',
        message: 'Hello, do you deliver outside Kigali city? I would love to order the organic coffee.',
        status: 'New',
      },
      {
        name: 'Marie Claire',
        email: 'marie@example.com',
        subject: 'Partnership',
        message: 'We are a local cooperative and would like to discuss supplying handmade products to GuraNeza.',
        status: 'Read',
      },
    ]);

    console.log('\n[Seed] ✅ Seed completed successfully!');
    console.log('-------------------------------------------');
    console.log('  Admin  :', admin.email, '/ Admin@123');
    console.log('  Demo   :', demo.email, '/ Demo@123');
    console.log('  Products:', products.length);
    console.log('-------------------------------------------\n');
  } catch (error) {
    console.error('[Seed] ❌ Failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
