function errorHandler(err, req, res, next) {
  // Prisma: record not found on update/delete
  if (err.code === 'P2025') {
    return res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Record not found' },
      meta: {},
    });
  }

  // Prisma: foreign key constraint violation
  if (err.code === 'P2003') {
    return res.status(409).json({
      data: null,
      error: { code: 'CONFLICT', message: 'Cannot delete — related records exist' },
      meta: {},
    });
  }

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
