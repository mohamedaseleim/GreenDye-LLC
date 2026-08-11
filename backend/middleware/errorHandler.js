const logger = require('../utils/logger');
const { message: localizedMessage, localize } = require('../utils/messages');
module.exports = (err, req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server Error';
  if (err.name === 'CastError') { status = 404; message = 'Resource not found'; }
  if (err.code === 11000) { status = 409; message = 'Duplicate field value'; }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(value => value.message).join(', '); }
  if (err.name === 'JsonWebTokenError') { status = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { status = 401; message = 'Token expired'; }
  logger.error('request.failed', { requestId: req.id, method: req.method, path: req.originalUrl, status, message, stack: process.env.NODE_ENV === 'production' ? undefined : err.stack });
  res.status(status).json({ success: false, message: status >= 500 && process.env.NODE_ENV === 'production' ? localizedMessage(req.language,'internal') : localize(req.language,message), requestId: req.id });
};
