export const PASSWORD_MIN_LENGTH = 8;

/**
 * Returns a list of human-readable password policy violations.
 * An empty array means the password is acceptable.
 *
 * Policy: at least 8 characters, one lowercase letter, one uppercase letter,
 * and one number. Symbols are encouraged but not required.
 */
export const validatePasswordStrength = (password = '') => {
  const errors = [];

  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must include a lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include an uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must include a number');
  }

  return errors;
};

export const isStrongPassword = (password) => validatePasswordStrength(password).length === 0;
