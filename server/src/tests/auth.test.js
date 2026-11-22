import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../app.js';
import User from '../models/User.js';

const CUSTOMER = {
  name: 'Test Customer',
  email: 'test.customer@example.com',
  password: 'Passw0rd',
  phone: '+250 788 111 222',
  address: 'Kigali',
};

describe('POST /api/auth/register', () => {
  it('creates a customer account and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(CUSTOMER);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('customer');
    expect(res.body.user.email).toBe(CUSTOMER.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('ignores a role supplied by the client', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...CUSTOMER, email: 'role.attack@example.com', role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('customer');
  });

  it('rejects a weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...CUSTOMER, email: 'weak@example.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects an invalid email address', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...CUSTOMER, email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  it('rejects a duplicate email address', async () => {
    await request(app).post('/api/auth/register').send(CUSTOMER);
    const res = await request(app).post('/api/auth/register').send(CUSTOMER);

    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(CUSTOMER);
  });

  it('signs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: CUSTOMER.email, password: CUSTOMER.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('customer');
  });

  it('rejects an incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: CUSTOMER.email, password: 'WrongPass1' });

    expect(res.status).toBe(401);
  });

  it('rejects an unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: CUSTOMER.password });

    expect(res.status).toBe(401);
  });

  it('blocks an inactive seller from signing in', async () => {
    await User.create({
      name: 'Pending Seller',
      email: 'pending.seller@example.com',
      password: 'Passw0rd',
      role: 'seller',
      isActive: false,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pending.seller@example.com', password: 'Passw0rd' });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not active/i);
  });
});

describe('GET /api/auth/me', () => {
  it('returns the authenticated user', async () => {
    const registration = await request(app).post('/api/auth/register').send(CUSTOMER);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registration.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(CUSTOMER.email);
    expect(res.body.user.role).toBe('customer');
  });

  it('rejects a request without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects a malformed token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-token');
    expect(res.status).toBe(401);
  });
});
