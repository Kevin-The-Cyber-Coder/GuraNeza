import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../app.js';
import User from '../models/User.js';
import SellerApplication from '../models/SellerApplication.js';
import SellerInvitation from '../models/SellerInvitation.js';
import { generateToken } from '../middleware/auth.js';
import { hashToken } from '../utils/tokens.js';

const APPLICATION = {
  fullName: 'Aline Mukamana',
  email: 'aline.seller@example.com',
  phone: '+250 788 222 333',
  businessName: 'Aline Craft House',
  businessLocation: 'Kigali, Nyarugenge',
  businessDescription:
    'We handcraft home decor and accessories using local materials from Rwandan artisans.',
  businessCategory: 'Home & Living',
  reason:
    'I want to reach more customers across Rwanda and grow my small business with GuraNeza.',
  supportingInfo: 'Registered with RDB, TIN 123456789',
};

const createAdminToken = async () => {
  const admin = await User.create({
    name: 'Admin',
    email: 'admin.applications@example.com',
    password: 'AdminPass1',
    role: 'admin',
  });
  return generateToken(admin._id);
};

const submitApplication = (overrides = {}) =>
  request(app)
    .post('/api/seller-applications')
    .send({ ...APPLICATION, ...overrides });

describe('seller applications', () => {
  let adminToken;

  beforeEach(async () => {
    adminToken = await createAdminToken();
  });

  it('accepts a valid application and returns a reference number', async () => {
    const res = await submitApplication();

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.application.status).toBe('pending');
    expect(res.body.application.referenceNumber).toMatch(/^SA-\d{8}-[A-F0-9]{6}$/);

    const stored = await SellerApplication.findOne({ email: APPLICATION.email });
    expect(stored).toBeTruthy();
    expect(stored.status).toBe('pending');
  });

  it('rejects a second pending application for the same email', async () => {
    await submitApplication();
    const res = await submitApplication();

    expect(res.status).toBe(409);
    expect(res.body.referenceNumber).toMatch(/^SA-/);
  });

  it('rejects an application with a short business description', async () => {
    const res = await submitApplication({ businessDescription: 'Too short' });
    expect(res.status).toBe(400);
  });

  it('prevents customers from listing applications', async () => {
    const customer = await User.create({
      name: 'Customer',
      email: 'customer.applications@example.com',
      password: 'Customer1',
      role: 'customer',
    });

    const res = await request(app)
      .get('/api/seller-applications')
      .set('Authorization', `Bearer ${generateToken(customer._id)}`);

    expect(res.status).toBe(403);
  });

  it('lists applications for an admin with status counts', async () => {
    await submitApplication();

    const res = await request(app)
      .get('/api/seller-applications')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.applications).toHaveLength(1);
    expect(res.body.counts.pending).toBe(1);
    expect(res.body.total).toBe(1);
  });

  it('approves an application, creates an inactive seller and a hashed invitation', async () => {
    const submitted = await submitApplication();
    const id = submitted.body.application.id;

    const res = await request(app)
      .patch(`/api/seller-applications/${id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.application.status).toBe('approved');
    expect(res.body.activationUrl).toContain('/seller/activate?token=');

    const seller = await User.findOne({ email: APPLICATION.email });
    expect(seller.role).toBe('seller');
    expect(seller.isActive).toBe(false);

    const invitation = await SellerInvitation.findOne({ application: id }).select('+tokenHash');
    const rawToken = new URL(res.body.activationUrl).searchParams.get('token');

    expect(invitation.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(invitation.tokenHash).not.toBe(rawToken);
    expect(hashToken(rawToken)).toBe(invitation.tokenHash);
  });

  it('does not approve the same application twice', async () => {
    const submitted = await submitApplication();
    const id = submitted.body.application.id;

    await request(app)
      .patch(`/api/seller-applications/${id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    const res = await request(app)
      .patch(`/api/seller-applications/${id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(409);
  });

  it('rejects an application with a reason and prevents later approval', async () => {
    const submitted = await submitApplication();
    const id = submitted.body.application.id;

    const rejected = await request(app)
      .patch(`/api/seller-applications/${id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Incomplete business documentation' });

    expect(rejected.status).toBe(200);
    expect(rejected.body.application.status).toBe('rejected');
    expect(rejected.body.application.rejectionReason).toBe('Incomplete business documentation');

    const approval = await request(app)
      .patch(`/api/seller-applications/${id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(approval.status).toBe(409);
  });

  it('requires a rejection reason', async () => {
    const submitted = await submitApplication();
    const res = await request(app)
      .patch(`/api/seller-applications/${submitted.body.application.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: '' });

    expect(res.status).toBe(400);
  });

  it('resends an invitation and revokes the previous link', async () => {
    const submitted = await submitApplication();
    const id = submitted.body.application.id;

    const first = await request(app)
      .patch(`/api/seller-applications/${id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    const second = await request(app)
      .post(`/api/seller-applications/${id}/resend-invitation`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(second.status).toBe(200);
    expect(second.body.activationUrl).toBeTruthy();
    expect(second.body.activationUrl).not.toBe(first.body.activationUrl);

    const oldToken = new URL(first.body.activationUrl).searchParams.get('token');
    const oldInvitation = await SellerInvitation.findOne({ tokenHash: hashToken(oldToken) });
    expect(oldInvitation.revokedAt).toBeTruthy();
  });

  it('upgrades an existing customer account instead of creating a duplicate', async () => {
    const registration = await request(app).post('/api/auth/register').send({
      name: 'Aline Customer',
      email: APPLICATION.email,
      password: 'Customer1',
    });
    const customerId = registration.body.user.id;

    const submitted = await submitApplication();
    const res = await request(app)
      .patch(`/api/seller-applications/${submitted.body.application.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const upgraded = await User.findById(customerId);
    expect(upgraded.role).toBe('seller');
    expect(upgraded.isActive).toBe(false);
  });

  it('lets an applicant check their status by reference and email', async () => {
    const submitted = await submitApplication();

    const found = await request(app).post('/api/seller-applications/status').send({
      referenceNumber: submitted.body.application.referenceNumber,
      email: APPLICATION.email,
    });
    expect(found.status).toBe(200);
    expect(found.body.application.status).toBe('pending');

    const notFound = await request(app).post('/api/seller-applications/status').send({
      referenceNumber: submitted.body.application.referenceNumber,
      email: 'wrong@example.com',
    });
    expect(notFound.status).toBe(404);
  });
});
