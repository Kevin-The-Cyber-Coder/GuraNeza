/** Centralised error handler for consistent API error responses. */
const errorHandler = (err, _req, res, _next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  let message = err.message || 'Something went wrong';
  let code = statusCode;

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
    message = Object.values(err.errors).map((e) => e.message).join(', ');
    code = 400;
  }

  if (process.env.NODE_ENV === 'development') console.error('[Error]', err);

  res.status(code === 500 ? 500 : code).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

/** Wraps async controllers so rejected promises reach the error handler. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default errorHandler;
