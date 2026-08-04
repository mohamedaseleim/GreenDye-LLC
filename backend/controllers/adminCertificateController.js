const crypto = require('crypto');
const Certificate = require('../models/Certificate');

exports.getAllCertificates = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.isRevoked !== undefined) query.isRevoked = req.query.isRevoked === 'true';
    if (req.query.certificateType) query.certificateType = req.query.certificateType;
    const data = await Certificate.find(query).sort({ issueDate: -1 });
    res.json({ success: true, count: data.length, total: data.length, data });
  } catch (error) { next(error); }
};
exports.createCertificate = async (req, res, next) => {
  try {
    const data = await Certificate.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};
exports.updateCertificate = async (req, res, next) => {
  try {
    const data = await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
exports.regenerateCertificate = async (req, res, next) => {
  try {
    const data = await Certificate.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Certificate not found' });
    data.verificationToken = crypto.randomBytes(24).toString('hex');
    data.verificationUrl = '';
    data.qrCode = undefined;
    await data.save();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
exports.bulkUploadCertificates = async (req, res, next) => {
  try {
    const items = Array.isArray(req.body.certificates) ? req.body.certificates : [];
    const data = await Certificate.insertMany(items, { ordered: false });
    res.status(201).json({ success: true, count: data.length, data });
  } catch (error) { next(error); }
};
exports.revokeCertificate = async (req, res, next) => {
  try {
    const data = await Certificate.findByIdAndUpdate(req.params.id, { isRevoked: true, isValid: false, revokedDate: new Date(), revokedReason: req.body.reason }, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
exports.restoreCertificate = async (req, res, next) => {
  try {
    const data = await Certificate.findByIdAndUpdate(req.params.id, { isRevoked: false, isValid: true, $unset: { revokedDate: 1, revokedReason: 1 } }, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
exports.getCertificateHistory = async (req, res, next) => {
  try {
    const data = await Certificate.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, data: { createdAt: data.createdAt, issueDate: data.issueDate, revokedDate: data.revokedDate, status: data.isRevoked ? 'revoked' : 'active' } });
  } catch (error) { next(error); }
};
exports.exportCertificates = async (req, res, next) => {
  try {
    const data = await Certificate.find().lean();
    res.json({ success: true, count: data.length, data });
  } catch (error) { next(error); }
};
exports.deleteCertificate = async (req, res, next) => {
  try {
    const data = await Certificate.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true });
  } catch (error) { next(error); }
};
