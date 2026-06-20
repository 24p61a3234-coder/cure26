export function notFound(req, res, next) {
  const error = new Error(`Not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
}

export function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    message: err.message || 'Server error',
    stack: isProduction ? undefined : err.stack
  });
}
