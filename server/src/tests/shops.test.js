import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../app.js';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

const createSeller = async (overrides = {}) => {
  const seller = await User.create({
    name: 'Shop Seller',
    email: `seller.${Date.now()}@example.com`,
    password: 'Passw0rd',
    role: 'seller',
    isActive: true,
    ...overrides,
  });
  return { seller, token: generateToken(seller._id) };
};

describe('seller shop', () => {
  it('creates/returns a shop for the authenticated seller', async () => {
    const { token } = await createSeller();
    const res = await request(app).get('/api/shops/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.shop.name).toBeTruthy();
    expect(res.body.shop.status).toBe('active');
  });

  it('rejects non-sellers', async () => {
    const customer = await User.create({
      name: 'Customer',
      email: 'customer.shop@example.com',
      password: 'Passw0rd',
      role: 'customer',
    });
    const res = await request(app)
      .get('/api/shops/me')
      .set('Authorization', `Bearer ${generateToken(customer._id)}`);
    expect(res.status).toBe(403);
  });

  it('updates shop profile', async () => {
    const { token } = await createSeller({ email: 'updateshop@example.com' });
    await request(app).get('/api/shops/me').set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .put('/api/shops/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'My Updated Shop',
        description: 'Quality products from Kigali',
        phone: '+250788000111',
        email: 'shop@example.com',
        location: 'Kigali, Rwanda',
      });

    expect(res.status).toBe(200);
    expect(res.body.shop.name).toBe('My Updated Shop');
    expect(res.body.shop.slug).toBeTruthy();
  });
});
