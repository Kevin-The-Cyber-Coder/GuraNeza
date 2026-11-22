import { isProd } from '../config/env.js';

/** Centralised error handler for consistent API error responses. */
const errorHandler = (err, _req, res, _next) => {
  let code = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Something went wrong';
  let errors;

  if (err.name === 'CastError') {
    message = 'Invalid identifier supplied';
    code = 400;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} is already in use`;
    code = 409;
  }

  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((entry) => entry.message)
      .join(', ');
    code = 400;
  }

  if (err.name === 'ZodError') {
    message = 'Please check the highlighted fields and try again';
    errors = (err.issues || []).map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    code = 400;
  }

  if (err.type === 'entity.parse.failed') {
    message = 'Invalid JSON payload';
    code = 400;
  }

  if (err.type === 'entity.too.large') {
    message = 'The request payload is too large';
    code = 413;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    message = 'Invalid or expired session';
    code = 401;
  }

  if (code >= 500 && !isProd) console.error('[Error]', err);

  const body = {
    success: false,
    message,
    ...(errors ? { errors } : {}),
  };
  if (!isProd && err.stack) body.stack = err.stack;

  res.status(code).json(body);
};

export default errorHandler;

/** Wraps async controllers so rejected promises reach the error handler. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
