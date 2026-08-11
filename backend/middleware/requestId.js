const crypto = require('crypto');
module.exports = (req, res, next) => {
  req.id = String(req.get('x-request-id') || crypto.randomUUID()).slice(0, 128);
  res.setHeader('x-request-id', req.id);
  next();
};
