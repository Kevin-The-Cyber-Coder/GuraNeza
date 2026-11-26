import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../app.js';
import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import { generateToken } from '../middleware/auth.js';

const makeSeller = async (name, email) => {
  const user = await User.create({ name, email, password: 'Passw0rd', role: 'seller', isActive: true });
  const shop = await Shop.create({ owner: user._id, name: `${name} Shop`, slug: name.toLowerCase().replace(/\s+/g, '-'), status: 'active' });
  return { user, shop, token: generateToken(user._id) };
};

describe('seller product management', () => {
  it('allows seller to create and list own products', async () => {
    const { token } = await makeSeller('Seller A', 'a@example.com');

    const create = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Seller Product', description: 'A great product for sale', price: 5000, stock: 10, category: 'Fashion' });

    expect(create.status).toBe(201);
    expect(create.body.product.seller).toBeTruthy();
    expect(create.body.product.shop).toBeTruthy();

    const mine = await request(app).get('/api/products/mine').set('Authorization', `Bearer ${token}`);
    expect(mine.status).toBe(200);
    expect(mine.body.products).toHaveLength(1);
    expect(mine.body.products[0].name).toBe('Seller Product');
  });

  it('prevents seller from updating another seller product', async () => {
    const a = await makeSeller('A', 'sa@example.com');
    const b = await makeSeller('B', 'sb@example.com');
    const product = await Product.create({
      name: 'A Product', description: 'desc', price: 1000, stock: 5, category: 'Fashion', seller: a.user._id, shop: a.shop._id, status: 'published',
    });

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${b.token}`)
      .send({ name: 'Hacked' });

    expect(res.status).toBe(403);
  });

  it('public listing only returns published products', async () => {
    const { user, shop } = await makeSeller('Pub', 'pub@example.com');
    await Product.create({ name: 'Published', description: 'desc', price: 1000, stock: 1, category: 'Fashion', seller: user._id, shop: shop._id, status: 'published' });
    await Product.create({ name: 'Draft', description: 'desc', price: 1000, stock: 1, category: 'Fashion', seller: user._id, shop: shop._id, status: 'draft' });

    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products.some((p) => p.name === 'Published')).toBe(true);
    expect(res.body.products.some((p) => p.name === 'Draft')).toBe(false);
  });
});