const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCertificates, getCertificate, downloadCertificate } = require('../controllers/certificateController');
router.use(protect);
router.get('/', getCertificates);
router.get('/:id/download', downloadCertificate);
router.get('/:id', getCertificate);
module.exports = router;
