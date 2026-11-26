import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../app.js';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { normalizeRole, hasRole, ROLES } from '../config/rbac.js';

describe('RBAC foundation', () => {
  it('normalizes legacy and canonical roles', () => {
    expect(normalizeRole('admin')).toBe(ROLES.SUPER_ADMIN);
    expect(normalizeRole('SUPER_ADMIN')).toBe(ROLES.SUPER_ADMIN);
    expect(normalizeRole('seller')).toBe(ROLES.SELLER);
    expect(normalizeRole('customer')).toBe(ROLES.CUSTOMER);
    expect(hasRole({ role: 'admin' }, 'SUPER_ADMIN', 'admin')).toBe(true);
  });

  it('blocks suspended users and enforces role authorization', async () => {
    const admin = await User.create({
      name: 'Admin',
      email: 'rbac-admin@example.com',
      password: 'Passw0rd',
      role: 'SUPER_ADMIN',
      isActive: true,
      accountStatus: 'active',
    });
    const suspended = await User.create({
      name: 'Suspended',
      email: 'suspended@example.com',
      password: 'Passw0rd',
      role: 'CUSTOMER',
      isActive: false,
      accountStatus: 'suspended',
    });

    const adminRes = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${generateToken(admin._id)}`);
    expect(adminRes.status).toBe(200);

    const suspendedRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${generateToken(suspended._id)}`);
    expect(suspendedRes.status).toBe(403);
    expect(suspendedRes.body.code).toBe('ACCOUNT_SUSPENDED');

    const customer = await User.create({
      name: 'Cust',
      email: 'cust-rbac@example.com',
      password: 'Passw0rd',
      role: 'CUSTOMER',
      isActive: true,
      accountStatus: 'active',
    });
    const forbidden = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${generateToken(customer._id)}`);
    expect(forbidden.status).toBe(403);
  });
});
