/**
 * AppError
 * --------
 * Throw this anywhere in a controller to send a clean HTTP error.
 *
 * Example:
 *   throw new AppError('Employee not found', 404);
 *   throw new AppError('Email already exists', 409);
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes our errors from surprise bugs
  }
}

/**
 * notFound
 * --------
 * Mount BEFORE errorHandler.
 * Catches any request that didn't match a route and turns it into a 404.
 *
 * app.use(notFound);
 * app.use(errorHandler);
 */
export const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

/**
 * errorHandler  (must have all 4 args so Express treats it as an error middleware)
 * ------------
 * Single place where every error in the app lands.
 * Mount this LAST in app.js, after all routes.
 *
 * Handles:
 *  - AppError  (our own operational errors)
 *  - MySQL errors  (duplicate entry, bad query, connection issues)
 *  - JWT errors    (malformed / expired — in case auth throws)
 *  - Multer errors (file upload issues)
 *  - Validation errors
 *  - Everything else (unexpected bugs)
 */
export const errorHandler = (err, req, res, next) => {
  // --- default values ---
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';
    let mode="DEVELOPMENT"
  // ── MySQL errors ─────────────────────────────────────────────────────────
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'A record with this value already exists.';
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Referenced record does not exist.';
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 409;
    message = 'Cannot delete — this record is referenced by other data.';
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    statusCode = 503;
    message = 'Database connection failed. Please try again later.';
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please log in again.';
  }

  // ── Multer errors ─────────────────────────────────────────────────────────
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File too large. Maximum allowed size is 5 MB.'
      : `File upload error: ${err.message}`;
  }

  // ── Validation / bad input ────────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = err.message;
  }

  // ── Log unexpected (non-operational) errors ───────────────────────────────
  const isUnexpected = !err.isOperational && statusCode === 500;
  if (isUnexpected) {
    console.error(' UNEXPECTED ERROR:', err);
  }

  // ── Send response ─────────────────────────────────────────────────────────
  res.status(statusCode).json({
    success: false,
    message,
    // expose stack trace only in development
    ...(mode === 'DEVELOPMENT' && { stack: err.stack }),
  });
};