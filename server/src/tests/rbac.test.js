import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../app.js';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

const createUser = async (role, overrides = {}) => {
  const user = await User.create({
    name: `${role} user`,
    email: `${role}.${Date.now()}@example.com`,
    password: 'Passw0rd',
    role,
    ...overrides,
  });
  return { user, token: generateToken(user._id) };
};

describe('role-based access control', () => {
  it('rejects unauthenticated access to the admin dashboard', async () => {
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(401);
  });

  it('rejects a customer from the admin dashboard', async () => {
    const { token } = await createUser('customer');
    const res = await request(app).get('/api/dashboard/stats').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('rejects a seller from the admin dashboard', async () => {
    const { token } = await createUser('seller');
    const res = await request(app).get('/api/dashboard/stats').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('allows an admin into the admin dashboard', async () => {
    const { token } = await createUser('admin');
    const res = await request(app).get('/api/dashboard/stats').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('rejects a customer creating a product', async () => {
    const { token } = await createUser('customer');
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Unauthorized product', description: 'x', price: 100, category: 'Other', stock: 1 });

    expect(res.status).toBe(403);
  });

  it('rejects a seller creating a product through the admin endpoint', async () => {
    const { token } = await createUser('seller');
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Seller product', description: 'x', price: 100, category: 'Other', stock: 1 });

    expect(res.status).toBe(403);
  });

  it('rejects a customer listing every order', async () => {
    const { token } = await createUser('customer');
    const res = await request(app).get('/api/orders').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('blocks a valid token whose account was deactivated', async () => {
    const { user, token } = await createUser('customer');
    await User.findByIdAndUpdate(user._id, { isActive: false });

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
