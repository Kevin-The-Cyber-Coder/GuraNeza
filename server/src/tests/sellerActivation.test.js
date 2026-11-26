import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../app.js';
import User from '../models/User.js';
import SellerInvitation from '../models/SellerInvitation.js';
import { generateToken } from '../middleware/auth.js';

const APPLICATION = {
  fullName: 'Eric Nshimiyimana',
  email: 'eric.seller@example.com',
  phone: '+250 788 444 555',
  businessName: 'Eric Electronics',
  businessLocation: 'Kigali, Gasabo',
  businessDescription:
    'We sell quality consumer electronics and accessories with a focus on genuine products and warranty.',
  businessCategory: 'Electronics',
  reason:
    'I want to expand my electronics business online and serve customers beyond my physical shop.',
};

const approveNewApplication = async () => {
  const admin = await User.create({
    name: 'Admin',
    email: 'admin.activation@example.com',
    password: 'AdminPass1',
    role: 'admin',
  });
  const adminToken = generateToken(admin._id);

  const submitted = await request(app).post('/api/seller-applications').send(APPLICATION);
  const applicationId = submitted.body.application.id;

  const approved = await request(app)
    .patch(`/api/seller-applications/${applicationId}/approve`)
    .set('Authorization', `Bearer ${adminToken}`);

  const token = new URL(approved.body.activationUrl).searchParams.get('token');
  return { adminToken, applicationId, token };
};

describe('seller invitation activation', () => {
  it('validates a valid activation token without consuming it', async () => {
    const { token } = await approveNewApplication();

    const res = await request(app).get('/api/seller-invitations/validate').query({ token });

    expect(res.status).toBe(200);
    expect(res.body.invitation.name).toBe(APPLICATION.fullName);
    expect(res.body.invitation.email).toMatch(/^e\*+@example\.com$/);
  });

  it('rejects an invalid activation token', async () => {
    const res = await request(app)
      .get('/api/seller-invitations/validate')
      .query({ token: 'a'.repeat(43) });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('invalid');
  });

  it('rejects a weak password', async () => {
    const { token } = await approveNewApplication();

    const res = await request(app)
      .post('/api/seller-invitations/activate')
      .send({ token, password: 'weak', confirmPassword: 'weak' });

    expect(res.status).toBe(400);
  });

  it('rejects mismatched passwords', async () => {
    const { token } = await approveNewApplication();

    const res = await request(app)
      .post('/api/seller-invitations/activate')
      .send({ token, password: 'NewPass1', confirmPassword: 'NewPass2' });

    expect(res.status).toBe(400);
  });

  it('activates the seller, hashes the password and allows login', async () => {
    const { token } = await approveNewApplication();

    const res = await request(app)
      .post('/api/seller-invitations/activate')
      .send({ token, password: 'NewPass1', confirmPassword: 'NewPass1' });

    expect(res.status).toBe(200);
    expect(['seller', 'SELLER']).toContain(res.body.user.role);
    expect(res.body.user.isActive).toBe(true);
    expect(res.body.token).toBeTruthy();

    const seller = await User.findOne({ email: APPLICATION.email }).select('+password');
    expect(seller.isActive).toBe(true);
    expect(seller.password).not.toBe('NewPass1');
    expect(await seller.matchPassword('NewPass1')).toBe(true);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: APPLICATION.email, password: 'NewPass1' });
    expect(login.status).toBe(200);
    expect(['seller', 'SELLER']).toContain(login.body.user.role);

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${res.body.token}`);
    expect(me.status).toBe(200);
    expect(['seller', 'SELLER']).toContain(me.body.user.role);
  });

  it('does not allow an activation link to be used twice', async () => {
    const { token } = await approveNewApplication();

    const first = await request(app)
      .post('/api/seller-invitations/activate')
      .send({ token, password: 'NewPass1', confirmPassword: 'NewPass1' });
    expect(first.status).toBe(200);

    const second = await request(app)
      .post('/api/seller-invitations/activate')
      .send({ token, password: 'NewPass2', confirmPassword: 'NewPass2' });

    expect(second.status).toBe(400);
    expect(second.body.code).toBe('used');
  });

  it('rejects an expired activation link', async () => {
    const { token, applicationId } = await approveNewApplication();

    await SellerInvitation.updateOne(
      { application: applicationId },
      { $set: { expiresAt: new Date(Date.now() - 60_000) } }
    );

    const res = await request(app)
      .post('/api/seller-invitations/activate')
      .send({ token, password: 'NewPass1', confirmPassword: 'NewPass1' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('expired');
  });

  it('rejects a revoked activation link after a resend', async () => {
    const { token, applicationId, adminToken } = await approveNewApplication();

    const resent = await request(app)
      .post(`/api/seller-applications/${applicationId}/resend-invitation`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resent.status).toBe(200);

    const res = await request(app)
      .post('/api/seller-invitations/activate')
      .send({ token, password: 'NewPass1', confirmPassword: 'NewPass1' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('revoked');
  });

  it('keeps the seller inactive before activation', async () => {
    await approveNewApplication();

    const seller = await User.findOne({ email: APPLICATION.email });
    expect(seller.isActive).toBe(false);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: APPLICATION.email, password: 'anything' });
    expect(login.status).toBe(401);
  });
});
