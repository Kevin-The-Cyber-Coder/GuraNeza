export const ROLES = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',
  SELLER: 'SELLER',
  CUSTOMER: 'CUSTOMER',
});

export const LEGACY_ROLE_MAP = Object.freeze({
  admin: ROLES.SUPER_ADMIN,
  super_admin: ROLES.SUPER_ADMIN,
  seller: ROLES.SELLER,
  customer: ROLES.CUSTOMER,
  user: ROLES.CUSTOMER,
});

export const ROLE_VALUES = Object.values(ROLES);

export const normalizeRole = (role) => {
  if (!role) return ROLES.CUSTOMER;
  const raw = String(role).trim();
  return LEGACY_ROLE_MAP[raw] || LEGACY_ROLE_MAP[raw.toLowerCase()] || raw.toUpperCase();
};

export const hasRole = (userOrRole, ...allowed) => {
  const role = normalizeRole(typeof userOrRole === 'string' ? userOrRole : userOrRole?.role);
  const allowedNormalized = allowed.flat().map(normalizeRole);
  return allowedNormalized.includes(role);
};

export const isSuperAdmin = (userOrRole) => hasRole(userOrRole, ROLES.SUPER_ADMIN);
export const isSeller = (userOrRole) => hasRole(userOrRole, ROLES.SELLER);
export const isCustomer = (userOrRole) => hasRole(userOrRole, ROLES.CUSTOMER);

// Permission matrix - backend source of truth. Frontend may mirror for UI only.
export const PERMISSIONS = Object.freeze({
  SELLER_APPLICATION_REVIEW: [ROLES.SUPER_ADMIN],
  SELLER_MANAGE: [ROLES.SUPER_ADMIN],
  SHOP_MANAGE_ALL: [ROLES.SUPER_ADMIN],
  SHOP_MANAGE_OWN: [ROLES.SELLER],
  PRODUCT_MODERATE: [ROLES.SUPER_ADMIN],
  PRODUCT_MANAGE_OWN: [ROLES.SELLER],
  ORDER_VIEW_ALL: [ROLES.SUPER_ADMIN],
  ORDER_VIEW_OWN: [ROLES.CUSTOMER],
  ORDER_MANAGE_OWN_SELLER: [ROLES.SELLER],
  CATEGORY_MANAGE: [ROLES.SUPER_ADMIN],
  PAYMENT_VIEW_ALL: [ROLES.SUPER_ADMIN],
  COMMISSION_MANAGE: [ROLES.SUPER_ADMIN],
  PAYOUT_MANAGE: [ROLES.SUPER_ADMIN],
  DELIVERY_MANAGE: [ROLES.SUPER_ADMIN],
  PROMOTION_MANAGE_ALL: [ROLES.SUPER_ADMIN],
  PROMOTION_MANAGE_OWN: [ROLES.SELLER],
  REVIEW_MODERATE: [ROLES.SUPER_ADMIN],
  REVIEW_RESPOND_OWN: [ROLES.SELLER],
  DISPUTE_MANAGE: [ROLES.SUPER_ADMIN],
  ANALYTICS_PLATFORM: [ROLES.SUPER_ADMIN],
  ANALYTICS_OWN_SHOP: [ROLES.SELLER],
  NOTIFICATION_MANAGE: [ROLES.SUPER_ADMIN],
  AUDIT_VIEW: [ROLES.SUPER_ADMIN],
  SETTINGS_MANAGE: [ROLES.SUPER_ADMIN],
  SECURITY_MANAGE: [ROLES.SUPER_ADMIN],
});

export const can = (userOrRole, permission) => {
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return hasRole(userOrRole, ...allowed);
};
