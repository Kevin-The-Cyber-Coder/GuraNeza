import crypto from 'node:crypto';

/**
 * Generates a human-readable reference such as SA-20261122-9F3A1C.
 * Six random hex characters give ~16.7 million combinations per day.
 */
export const generateReference = (prefix = 'SA') => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${date}-${random}`;
};

export default generateReference;
