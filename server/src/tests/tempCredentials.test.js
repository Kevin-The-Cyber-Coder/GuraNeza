import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../app.js';
import User from '../models/User.js';
import SellerApplication from '../models/SellerApplication.js';
import { generateToken } from '../middleware/auth.js';

const adminToken = async () => {
  const admin = await User.create({ name: 'Admin', email: 'admin-temp@example.com', password: 'Passw0rd', role: 'admin', isActive: true });
  return generateToken(admin._id);
};

describe('temporary seller credentials', () => {
  it('returns temporary credentials on approval and forces password change', async () => {
    const token = await adminToken();
    const appDoc = await SellerApplication.create({
      referenceNumber: 'SA-TEST-TEMP1',
      fullName: 'Temp Seller',
      email: 'tempseller@example.com',
      phone: '+250788000000',
      businessLocation: 'Kigali',
      businessDescription: 'A business description that is long enough.',
      businessCategory: 'Fashion',
      reason: 'I want to sell products on GuraNeza marketplace.',
      status: 'pending',
    });

    const approve = await request(app)
      .patch(`/api/seller-applications/${appDoc._id}/approve`)
      .set('Authorization', `Bearer ${token}`);

    expect(approve.status).toBe(200);
    expect(approve.body.temporaryCredentials?.email).toBe('tempseller@example.com');
    expect(approve.body.temporaryCredentials?.password).toBeTruthy();

    const login = await request(app).post('/api/auth/login').send({
      email: 'tempseller@example.com',
      password: approve.body.temporaryCredentials.password,
    });
    expect(login.status).toBe(200);
    expect(login.body.user.mustChangePassword).toBe(true);

    const blocked = await request(app)
      .get('/api/shops/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(blocked.status).toBe(403);
    expect(blocked.body.code).toBe('PASSWORD_CHANGE_REQUIRED');
  });
});
