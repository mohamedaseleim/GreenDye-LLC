const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllCertificates,
  createCertificate,
  updateCertificate,
  regenerateCertificate,
  bulkUploadCertificates,
  revokeCertificate,
  restoreCertificate,
  getCertificateHistory,
  exportCertificates,
  deleteCertificate
} = require('../controllers/adminCertificateController');

// Protect all routes and authorize only admin
router.use(protect);
router.use(authorize('admin'));

// Certificate management
router.route('/')
  .get(getAllCertificates)
  .post(createCertificate);

router.post('/bulk', bulkUploadCertificates);
router.get('/export', exportCertificates);

router.route('/:id')
  .put(updateCertificate)
  .delete(deleteCertificate);

router.post('/:id/regenerate', regenerateCertificate);
router.put('/:id/revoke', revokeCertificate);
router.put('/:id/restore', restoreCertificate);
router.get('/:id/history', getCertificateHistory);

module.exports = router;
