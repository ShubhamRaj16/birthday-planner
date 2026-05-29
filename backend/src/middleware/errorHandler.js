function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';

  res.status(status).json({
    data: null,
    error: { code, message },
    meta: {},
  });
}

module.exports = errorHandler;
